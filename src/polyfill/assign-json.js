const fs = require('../util/fs');
const path = require('path');
const uuid = require('uuid');

const escapeSymbol = (str) => {
  return str.replace(/((\#\{)|(\@\{)|(\$\{))([^}]*)\}?/g, function (...args) {
    return args[5];
  });
};

function reduceMockTpl (mockData, tpl, tagSyntax) {
  return Object.keys(mockData)
    .map(item => {
      const _value = escapeSymbol(JSON.stringify(mockData[item]));
      let ftlAssign = `<#assign ${item.replace('.', '\\.')} = ${_value}/>`;
      if(tagSyntax === 'squareBracket'){
        ftlAssign = ftlAssign.replace('<', '[').replace('>', ']');
      }
      return ftlAssign;
    });
}

export async function createTmp (p1, data, tagSyntax) {
  return new Promise(async (resolve, _reject) => {
    const {name, dir} = path.parse(p1);
    const _tempPath = path.join(dir, `${uuid.v4()}__${name}.ftl`);
    let _tpl = reduceMockTpl(data, null, tagSyntax);
    const lines = _tpl.length;
    try{
      _tpl.push(await fs.readFile(p1));
      const _res = fs.writeFile(_tempPath, _tpl.join('\n'));
      resolve({
        tempPath: _tempPath,
        lines,
        cleanFile: () => {
          cleanFile(_tempPath);
        }
      })
    } catch (error) {
      return resolve({
        error
      });
    }
  });
};

export function cleanFile (tempPath) {
  fs.delFile(tempPath);
}
