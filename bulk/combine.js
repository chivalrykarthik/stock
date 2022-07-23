const { readFile, writeFile, existsSync } = require('fs');
const { promisify } = require('util');
require('dotenv').config()
const readFilePr = promisify(readFile);
const writePr = promisify(writeFile);
const path = `${process.env.OUTPUT}0.json`;


const combine = async () => {
    const jsonData = await readFilePr(path, 'utf8');
    const dataObj = JSON.parse(jsonData);
    const finalPath = './bulk/final.json';
    let finalObj = '';
    if (existsSync(finalPath)) {
        const finalJson = await readFilePr(finalPath, 'utf8');
        finalObj = [...JSON.parse(finalJson)];
    }
    finalObj = [...finalObj, ...dataObj];
    const finalJSON = JSON.stringify(finalObj);
    await writePr(`${finalPath}`, finalJSON);

}

module.exports = combine;