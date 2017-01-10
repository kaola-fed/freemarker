const fs = require('../util/fs');
const path = require('path');

const escapeSymbol = (str) => {
	return str.replace(/[#@$]/g, function (match) {
		return '\\'+match;
	});
};

function reduceMockTpl (mockData, tpl) {
  return Object.keys(mockData)
    .filter(item => {
      return !~item.indexOf('.');
    }).map(item => {
      const _value = escapeSymbol(JSON.stringify(mockData[item]));
      return `<#assign ${item} = ${_value}/>`;
    });
}

export async function createTmp (p1, data) {
  return new Promise(async (resolve, reject) => {
    const {name, dir} = path.parse(p1);
    const _tempPath = path.join(dir, '__temp__' + name + '.ftl');
    let _tpl = reduceMockTpl(data);
		try{
			_tpl.push(await fs.readFile(p1));
			const _res = fs.writeFile(_tempPath, _tpl.join('\n'));
			resolve({
				tempPath: _tempPath,
				cleanFile: () => {
					cleanFile(_tempPath);
				}
			})
		} catch (error) {
			return resolve({error});
		}
  });
};

export function cleanFile (tempPath) {
  fs.delFile(tempPath);
}
