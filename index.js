var fs = require('fs')
var low = require('last-one-wins')
var geojsonhint = require('geojsonhint')
var turf = require('@turf/meta')

module.exports = function GeoJSONFile (filepath, config) {
  config = config || {}
  var xfs = config.fs || fs

  var state = { type: 'FeatureCollection', features: [] }

  function readFile (options, callback) {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    options = options || {}
    options.encoding = options.encoding || 'utf8'

    xfs.readFile(filepath, options, function (err, str) {
      if (err) {
        // TODO: assuming file is not found, maybe don't do that
        return xfs.writeFile(filepath, stringify(state), function (writeErr) {
          if (writeErr) return callback(writeErr)
          callback(null, state)
        })
      }

      var data = parse(str)

      if (data.error) {
        return callback(data.error)
      }

      callback(null, data)
    })
  }

  var writeFile = low(function (obj, options, callback) {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    if (!obj || !obj.type || obj.type !== 'FeatureCollection') {
      return callback(new Error('must be a FeatureCollection'))
    }

    var errors = geojsonhint.hint(obj)
    if (errors.length) return callback(errors)

    state = obj || {}
    var str = stringify(obj)

    xfs.writeFile(filepath, str, options, function (err) {
      if (err) return callback(err)
      callback()
    })
  })

  function unlink (cb) {
    state = {}
    xfs.unlink(filepath, cb)
  }

  function put (key, data, callback) {
    var errors = geojsonhint.hint(data)
    if (errors.length) return callback(errors)
    data.id = key

    _get(key, function (err, featureCollection, feature, i) {
      if (err && err.message === 'Not found') {
        featureCollection.features.push(data)
      } else if (err) {
        return callback(err)
      } else {
        featureCollection.features[i] = data
      }

      state = featureCollection

      writeFile(state, callback)
    })
  }

  function _get (key, callback) {
    readFile(function (err, data) {
      if (err) return callback(err)
      var index = 0
      var result = null

      turf.featureEach(data, function (feature, i) {
        if (feature.id === key) {
          index = i
          result = feature
        }
      })

      if (!result) {
        return callback(new Error('Not found'), data)
      }

      callback(null, data, result, index)
    })
  }

  function get (key, callback) {
    _get(key, function (err, data, feature, index) {
      if (err) return callback(err)
      callback(null, feature, index)
    })
  }

  function del (key, callback) {
    _get(key, function (err, data, feature, i) {
      if (err) return callback(err)
      data.features.splice(i, 1)
      state = data
      writeFile(state, callback)
    })
  }

  function list (callback) {
    readFile(function (err, data) {
      if (err) return callback(err)
      callback(null, data.features)
    })
  }

  function parse (json) {
    try {
      return JSON.parse(json)
    } catch (e) {
      return { error: e }
    }
  }

  function stringify (obj) {
    return JSON.stringify(obj, null, '  ')
  }

  return {
    readFile: readFile,
    writeFile: writeFile,
    unlink: unlink,
    put: put,
    get: get,
    del: del,
    list: list
  }
}
