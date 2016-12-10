# freemarker

[![NPM version][npm-image]][npm-url]

Freemarker integration for NodeJS

## How to use

  - Node v6+
  - `JAVA_HOME` should be set properly
  - `npm i freemarker -S`

#### Render string

```javascript
const Freemarker = require('freemarker');

const freemarker = new Freemarker();

freemarker.render('<h1>${title}</h1>', { title: 'test render' }, (err, result) => {
  if (err) {
    throw new Error(err);
  }
  console.log(result);
});
```

*NOTICE: Don't use `#include` in string for rendering.*

#### Render file

```javascript
const Freemarker = require('freemarker');

const freemarker = new Freemarker({ root: __dirname });

freemarker.renderFile(path.join(__dirname, 'index.ftl'), data, (err, result) => {
  if (err) {
    throw new Error(err);
  }
  console.log(result);
});
```

## Test
`npm test`

## LICENSE
MIT

[npm-url]: https://npmjs.org/package/freemarker
[npm-image]: https://img.shields.io/npm/v/freemarker.svg
