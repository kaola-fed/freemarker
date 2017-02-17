const os = require('os');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const execFile = require('child_process').execFile;
const assignJson = require('./polyfill/assign-json');


class Freemarker {
  constructor(options = {}) {
    this.tmpDir = os.tmpdir();
    this.sourceRoot = options.root || this.tmpDir;
    this.suffix = '.' + (options.suffix || 'ftl');
    this.cmd = path.join(path.resolve(__dirname, '..'),
      `fmpp/bin/fmpp${os.platform() === 'win32' ? '.bat' : ''}`);
  }

  _randomFile() {
    return path.join(this.tmpDir, crypto.randomBytes(20).toString('hex'));
  }
  _writeConfig(configFile, config = {}) {
    let str = '';
    for (let key in config) {
      str += `${key}: ${config[key]}\n`;
    }
    fs.writeFileSync(configFile, str, 'utf8');
  }
  _writeData(tddFile, data = {}) {
    fs.writeFileSync(tddFile, JSON.stringify(data), 'utf8');
  }
  _writeFTL(ftlFile, str = '') {
    fs.writeFileSync(ftlFile, str, 'utf8');
  }
  _cleanFiles(files = []) {
    files.forEach(file => {
      fs.existsSync(file) && fs.unlinkSync(file);
    });
  }
  _getRealPath(file) {
    let _file = file;
    if (!_file.endsWith(this.suffix)) {
      _file += this.suffix;
    }
    if (!path.isAbsolute(_file)) {
      _file = path.join(this.sourceRoot, _file);
    }
    return _file;
  }

  render(str, data, callback) {
    const ftlFile = this._randomFile() + this.suffix;
    this._writeFTL(ftlFile, str);
    this.renderFile(ftlFile, data, (err, result) => {
      callback(err, result);
      this._cleanFiles([ftlFile]);
    });
  }

  async renderFile(file, data = {}, callback = () => {}) {
    const _file = this._getRealPath(file);

    if (Object.entries(data).length === 0) {
      return this.renderProxy(_file, {}, callback);
    }

    let {tempPath, cleanFile, error} = await assignJson.createTmp(_file, data);
    if ( error ) {
      return callback(error);
    }
    this.renderProxy(tempPath, {}, (error, result) => {
      callback(error, result);
      cleanFile();
    });

  }

  renderProxy(file, data, callback) {
    if (!file) return callback('No ftl file');

    const htmlFile = this._randomFile();
    const tddFile = this._randomFile();
    const configFile = this._randomFile();
    const config = {
      sourceRoot: this.sourceRoot,
      outputFile: htmlFile,
      sourceEncoding: 'UTF-8',
      outputEncoding: 'UTF-8',
      data: `tdd(${tddFile})`,
    };
    this._writeData(tddFile, data);
    this._writeConfig(configFile, config);

    execFile(this.cmd, [file, '-C', configFile], (err, log) => {
      let result = '';
      if (fs.existsSync(htmlFile)) {
        result = fs.readFileSync(htmlFile, 'utf8');
      }
      callback((err || !/DONE/.test(log)) ? log: null, result);
      this._cleanFiles([htmlFile, tddFile, configFile]);
    });
  }
};

module.exports = Freemarker;
