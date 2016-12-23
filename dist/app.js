'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var os = require('os');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var execFile = require('child_process').execFile;

var Freemarker = function () {
  function Freemarker() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Freemarker);

    this.tmpDir = os.tmpdir();
    this.sourceRoot = options.root || this.tmpDir;
    this.suffix = '.' + (options.suffix || 'ftl');
    this.cmd = path.join(path.resolve(__dirname, '..'), 'fmpp/bin/fmpp' + (os.platform() === 'win32' ? '.bat' : ''));
  }

  _createClass(Freemarker, [{
    key: '_randomFile',
    value: function _randomFile() {
      return path.join(this.tmpDir, crypto.randomBytes(20).toString('hex'));
    }
  }, {
    key: '_writeConfig',
    value: function _writeConfig(configFile) {
      var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var str = '';
      for (var key in config) {
        str += key + ': ' + config[key] + '\n';
      }
      fs.writeFileSync(configFile, str, 'utf8');
    }
  }, {
    key: '_writeData',
    value: function _writeData(tddFile) {
      var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      fs.writeFileSync(tddFile, JSON.stringify(data), 'utf8');
    }
  }, {
    key: '_writeFTL',
    value: function _writeFTL(ftlFile) {
      var str = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

      fs.writeFileSync(ftlFile, str, 'utf8');
    }
  }, {
    key: '_cleanFiles',
    value: function _cleanFiles() {
      var files = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      files.forEach(function (file) {
        fs.existsSync(file) && fs.unlinkSync(file);
      });
    }
  }, {
    key: '_getRealPath',
    value: function _getRealPath(file) {
      var _file = file;
      if (!_file.endsWith(this.suffix)) {
        _file += this.suffix;
      }
      if (!path.isAbsolute(_file)) {
        _file = path.join(this.sourceRoot, _file);
      }
      return _file;
    }
  }, {
    key: 'render',
    value: function render(str, data, callback) {
      var _this = this;

      var ftlFile = this._randomFile() + this.suffix;
      this._writeFTL(ftlFile, str);
      this.renderFile(ftlFile, data, function (err, result) {
        callback(err, result);
        _this._cleanFiles([ftlFile]);
      });
    }
  }, {
    key: 'renderFile',
    value: function renderFile(file) {
      var _this2 = this;

      var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {};

      if (!file) return callback('No ftl file');
      var ftl = this._getRealPath(file);
      var htmlFile = this._randomFile();
      var tddFile = this._randomFile();
      var configFile = this._randomFile();
      var config = {
        sourceRoot: this.sourceRoot,
        outputFile: htmlFile,
        sourceEncoding: 'UTF-8',
        outputEncoding: 'UTF-8',
        data: 'tdd(' + tddFile + ')'
      };
      this._writeData(tddFile, data);
      this._writeConfig(configFile, config);
      execFile(this.cmd, [ftl, '-C', configFile], function (err, log) {
        var result = '';
        if (fs.existsSync(htmlFile)) {
          result = fs.readFileSync(htmlFile, 'utf8');
        }
        callback(err ? log : null, result);
        _this2._cleanFiles([htmlFile, tddFile, configFile]);
      });
    }
  }]);

  return Freemarker;
}();

;

module.exports = Freemarker;