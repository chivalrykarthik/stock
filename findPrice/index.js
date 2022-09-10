const csvToJson = require('csvtojson');
const { readDirRec, createCsv } = require('./../util');
const findMatch = require('./findMatch');
const { colSymbol, n50 } = require('./constants');
require('dotenv').config();
const HISTORY_DATA = process.env.HISTORY_DATA;
const NUMBER_OF_DAYS = process.env.NUMBER_OF_DAYS;
const { log } = console;
//const log = () => { };
const cwd = process.cwd();
const year = new Date().getFullYear();
//const year = 2021;

const processFile = async (sourceData, allFiles,i) => {
    const srcDt = sourceData.slice(sourceData.length - NUMBER_OF_DAYS);
    let match = [];
    for (let i = 0; i < allFiles.length; i++) {
        log(`Reading data from ${allFiles[i]}`);
        const json = await csvToJson({ flatKeys: true }).fromFile(allFiles[i]);
        log(`Finding Match in ${allFiles[i]}`);
        const mtch = findMatch(srcDt, json);
        if (mtch.length)
            match = [...match, {
                file: allFiles[i],
                match: [...mtch]
            }];
    }
    return match;
};

const readFileRec = async (files, allFiles) => {
    let result = {};
    for (let i = 0; i < files.length; i++) {
        log(`Reading data from ${files[i]}`);
        const json = await csvToJson({ flatKeys: true }).fromFile(files[i]);
        if (n50.includes(json[0][colSymbol]) && json[json.length - 2]['Open Price'].trim() <= 250000) {
            log(`Processing ${files[i]}`);
            const res = await processFile(json, allFiles,i);
            result[json[0][colSymbol]] = res;
            //console.log(`Processed ${json[0][colSymbol]} found ${res.length} match`)			
        }
        //console.log(`${i + 1} Completed`)
    }
    return result;
}

const findPrice = async () => {
    try {
        log(`Reading files from ${year}`);
        const currentYearFiles = await readDirRec(cwd + `${HISTORY_DATA}/${year}`);
        const allFiles = await readDirRec(cwd + `${HISTORY_DATA}`);
        const result = await readFileRec(currentYearFiles, allFiles);
        //log(JSON.stringify(result, '', 5))
        createCsv('res.json', JSON.stringify(result, '', 5));
        //log(currentYearFiles);
        //const currentYearFiles = await readDirRec(cwd + `${HISTORY_DATA}`);
        //await readFileRec(currentYearFiles);
        //log(currentYearFiles);
    } catch (e) {
        log(e)
    }

}
findPrice();
