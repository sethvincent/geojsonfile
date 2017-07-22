var fs = require('fs')
var path = require('path')
var test = require('tape')
var turf = require('@turf/helpers')
var random = require('@turf/random')
var geojsonfile = require('../index')

test('create, read, and delete file', function (t) {
  var filepath = path.join(__dirname, 'tmp.json')
  var file = geojsonfile(filepath)

  file.writeFile({ type: 'FeatureCollection', features: [] }, function (err) {
    t.notOk(err)
    t.ok(fs.readFileSync(filepath, 'utf8'))

    file.readFile(function (err, data) {
      t.notOk(err)
      t.ok(data)
      t.ok(typeof data === 'object')

      file.unlink(function (err) {
        t.notOk(err)
        fs.readFile(filepath, function (err, data) {
          t.ok(err.code === 'ENOENT')
          t.end()
        })
      })
    })
  })
})

test('write, read, delete feature', function (t) {
  var filepath = path.join(__dirname, 'tmp.json')
  var file = geojsonfile(filepath)

  file.put('key', turf.point([-122, 32]), function (err) {
    t.notOk(err)

    file.get('key', function (err, feature, index) {
      t.notOk(err)
      t.ok(typeof feature === 'object')
      t.ok(feature.type === 'Feature')
      t.ok(feature.properties)
      t.ok(feature.geometry.type === 'Point')
      t.ok(feature.geometry.coordinates && feature.geometry.coordinates.length === 2)
      t.ok(feature.geometry.coordinates[0] === -122)
      t.ok(feature.geometry.coordinates[1] === 32)
      t.ok(index === 0)

      file.unlink(function (err) {
        t.notOk(err)
        t.end()
      })
    })
  })
})

test('list and delete features', function (t) {
  var geojson = random('points', 100)

  geojson.features.forEach(function (feature, i) {
    geojson.features[i].id = String(i)
  })

  var filepath = path.join(__dirname, 'tmp.json')
  var file = geojsonfile(filepath)

  file.writeFile(geojson, function (err) {
    t.notOk(err)

    file.readFile(function (err, data) {
      t.notOk(err)
      t.ok(data)
      t.ok(typeof data === 'object')
      t.ok(data.type === 'FeatureCollection')

      file.list(function (err, features) {
        t.notOk(err)
        t.ok(features && features.length === 100)

        file.get('4', function (err, feature, index) {
          t.notOk(err)
          t.ok(feature.id === '4')
          t.ok(index === 4)

          file.del('4', function (err) {
            t.notOk(err)

            file.list(function (err, features) {
              t.notOk(err)
              t.ok(features.length === 99)

              file.unlink(function (err) {
                t.notOk(err)
                fs.readFile(filepath, function (err, data) {
                  t.ok(err.code === 'ENOENT')
                  t.end()
                })
              })
            })
          })
        })
      })
    })
  })
})

test('alternate fs', function (t) {
  var hyperdrive = require('hyperdrive')
  var filepath = path.join('/', 'tmp.json')
  var drive = hyperdrive(require('random-access-memory'))
  var file = geojsonfile(filepath, { fs: drive })

  file.put('key', turf.point([-122, 32]), function (err) {
    t.notOk(err)

    file.get('key', function (err, feature, index) {
      t.notOk(err)
      t.ok(typeof feature === 'object')
      t.ok(feature.type === 'Feature')
      t.ok(feature.id === 'key')
      t.ok(feature.properties)
      t.ok(feature.geometry.type === 'Point')
      t.ok(feature.geometry.coordinates && feature.geometry.coordinates.length === 2)
      t.ok(feature.geometry.coordinates[0] === -122)
      t.ok(feature.geometry.coordinates[1] === 32)
      t.ok(index === 0)

      file.unlink(function (err) {
        t.notOk(err)
        t.end()
      })
    })
  })
})
