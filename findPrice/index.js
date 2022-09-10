const csvToJson = require('csvtojson');
const { readDirRec, createCsv, readContent } = require('./../util');
const findMatch = require('./findMatch');
const { colSymbol, n50 } = require('./constants');
require('dotenv').config();
const HISTORY_DATA = process.env.HISTORY_DATA;
const NUMBER_OF_DAYS = process.env.NUMBER_OF_DAYS.split(',');
const { log } = console;
//const log = () => { };
const cwd = process.cwd();
const year = new Date().getFullYear();
//const year = 2021;

const processFile = async (sourceData, allFiles, parentIndex, dys) => {
    const srcDt = sourceData.slice(sourceData.length - dys);
    let match = [];
    for (let i = 0; i < allFiles.length; i++) {
        log(`Reading data for ${parentIndex}(${dys}) from ${allFiles[i]}`);
        const json = await csvToJson({ flatKeys: true }).fromFile(allFiles[i]);
        //log(`Finding Match in ${allFiles[i]}`);
        const mtch = findMatch(srcDt, json);
        if (mtch.length)
            match = [...match, {
                //file: allFiles[i],
                match: [...mtch]
            }];
    }
    return match;
};

const readFileRec = async (files, allFiles, dys) => {
    let result = {};
    for (let i = 0; i < files.length; i++) {
        log(`Reading data from ${files[i]}`);
        const json = await csvToJson({ flatKeys: true }).fromFile(files[i]);
        if (n50.includes(json[0][colSymbol]) && json[json.length - 2]['Open Price'].trim() <= 250000) {
            log(`Processing ${files[i]}`);
            const res = await processFile(json, allFiles, i, dys);
			if(res.length){
				result[json[0][colSymbol]] = res;
			}
            //console.log(`Processed ${json[0][colSymbol]} found ${res.length} match`)			
        }
        //console.log(`${i + 1} Completed`)
    }
    return result;
}

const findPrice = async (dys) => {
    try {
        log(`Reading files from ${year}`);
        const currentYearFiles = await readDirRec(cwd + `${HISTORY_DATA}/${year}`);
        const allFiles = await readDirRec(cwd + `${HISTORY_DATA}`);
        const result = await readFileRec(currentYearFiles, allFiles, dys);      
		const len = Object.keys(result);
		if(len){
			let content = await readContent('res.json');
			let data = [];
			let tmp = {
				[dys]:result
			}
			if(content.length){
				data = [...content, tmp];
			} else {
			data = [tmp];
			}
			await createCsv('res.json',JSON.stringify(data,'',5));
		}
        
		return len;        
    } catch (e) {
        log(e)
    }

}


const prepare = async ()=>{
	// findPrice();
	const t= NUMBER_OF_DAYS.length;	
	await createCsv('res.json',JSON.stringify([]));
	for(let i = 0;i<t;i++){	
		let len = await findPrice(NUMBER_OF_DAYS[i]);
		log(`Number of iteration:${NUMBER_OF_DAYS[i]}`);		
		if(!len.length){			
			break;
		}
	}
}
prepare();
