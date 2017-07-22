# geojsonfile

Manage a Feature Collection in a JSON file.

[![npm][npm-image]][npm-url]
[![travis][travis-image]][travis-url]
[![standard][standard-image]][standard-url]
[![conduct][conduct]][conduct-url]

[npm-image]: https://img.shields.io/npm/v/geojsonfile.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/geojsonfile
[travis-image]: https://img.shields.io/travis/sethvincent/geojsonfile.svg?style=flat-square
[travis-url]: https://travis-ci.org/sethvincent/geojsonfile
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[standard-url]: http://npm.im/standard
[conduct]: https://img.shields.io/badge/code%20of%20conduct-contributor%20covenant-green.svg?style=flat-square
[conduct-url]: CODE_OF_CONDUCT.md

## Install

```sh
npm install --save geojsonfile
```

## Usage

```js
var turf = require('@turf/helpers')
var geojsonfile = require('geojsonfile')

var filepath = path.join(__dirname, 'data.json')
var file = geojsonfile(filepath)

file.put('coolgeojsonpoint', turf.point([-122, 32]), function (err) {
  file.get('coolgeojsonpoint', function (err, data) {
    console.log('data', data)
  })
})
```

### Alternate `fs` module

Use an alternate `fs` implementation like [hyperdrive](https://npmjs.com/hyperdrive) by passing it in as an option:

```js
var turf = require('@turf/helpers')
var geojsonfile = require('geojsonfile')
var hyperdrive = require('hyperdrive')

var filepath = path.join(__dirname, 'data.json')
var drive = hyperdrive(require('random-access-memory'))

// Use the hyperdrive instance:
var file = geojsonfile(filepath, { fs: drive })
```

## Contributing

Contributions are welcome! Please read the [contributing guidelines](CONTRIBUTING.md) first.

## Conduct

It's important that this project contributes to a friendly, safe, and welcoming environment for all, particularly for folks that are historically underrepresented in technology. Read this project's [code of conduct](CODE_OF_CONDUCT.md)

## License

[ISC](LICENSE.md)
