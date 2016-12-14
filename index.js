const os = require('os');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const execFile = require('child_process').execFile;

class Freemarker {
  constructor(options = {}) {
    this.tmpDir = os.tmpdir();
    this.sourceRoot = options.root || this.tmpDir;
    this.cmd = path.join(__dirname,
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

  render(str, data, callback) {
    const ftlFile = this._randomFile();
    this._writeFTL(ftlFile, str);
    this.renderFile(ftlFile, data, (err, result) => {
      callback(err, result);
      this._cleanFiles([ftlFile]);
    });
  }
  renderFile(ftl, data = {}, callback = () => {}) {
    if (!ftl) return callback('No ftl file');
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
    execFile(this.cmd, [ftl, '-C', configFile], (err, log) => {
      let result = '';
      if (fs.existsSync(htmlFile)) {
        result = fs.readFileSync(htmlFile, 'utf8');
      }
      callback(err? log: null, result);
      this._cleanFiles([htmlFile, tddFile, configFile]);
    });
  }
};

module.exports = Freemarker;