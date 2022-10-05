//const csvToJson = require('csvtojson');
const { readDirRec, createCsv, readContent } = require('./../util');
const axios = require('axios');
const findMatch = require('./findMatch');
const { colSymbol, n50 } = require('./constants');
require('dotenv').config();
const FINAL_PATH = process.env.FINAL_PATH;
const NUMBER_OF_DAYS = process.env.NUMBER_OF_DAYS.split(',');
const { log } = console;
//const log = () => { };
const cwd = process.cwd();
const year = new Date().getFullYear();
//const year = 2021;
let matchFound = 0;
let matches = [];
const processFile = async (sourceData, allFiles, parentIndex, dys) => {
    const srcDt = sourceData.slice(sourceData.length - dys);
    let match = [];
    for (let i = 0; i < allFiles.length; i++) {
        log(`Reading data for ${parentIndex}(${dys})(${matchFound})(${srcDt[0][colSymbol]}) from ${allFiles[i]}`);
		//log("matches==="+JSON.stringify(matches));
        //const json = await csvToJson({ flatKeys: true }).fromFile(allFiles[i]);
		const fileRes = await axios.post('http://localhost:5000/csvtojson',{fileName:allFiles[i]});
		const json =  fileRes.data;
        //log(`Finding Match in ${allFiles[i]}`);
        const mtch = findMatch(srcDt, json);		
		
		//const res = await axios.post('http://localhost:3000/fp',{srcDt, json});
		//const mtch = res.data;
        if (mtch.length){
			matchFound+=mtch.length;			
            match = [...match, {
                //file: allFiles[i],
                match: [...mtch],
				srcSymb:srcDt[0][colSymbol]
            }];
			matches = matches.includes(srcDt[0][colSymbol]) ? matches : [...matches, srcDt[0][colSymbol]];
		} /*else{
			const m = matches.indexOf(srcDt[0][colSymbol]);
			matches = m >= 0 ? [...matches.slice(0,m),...matches.slice(m+1)] : matches;
		}*/
    }
    return match;
};
/*
const readFileRec = async (files, allFiles, dys) => {
    let result = {};
	let matchFound = false;
    for (let i = 0; i < files.length; i++) {
        //log(`Reading data from ${files[i]}`);
        //const json = await csvToJson({ flatKeys: true }).fromFile(files[i]);
		const fileRes = await axios.post('http://localhost:5000/csvtojson',{fileName:files[i]});
		const json =  fileRes.data;
		// && json[json.length - 2]['Open Price'].trim() <= 250000
        if (n50.includes(json[0][colSymbol])) {
            //log(`Processing ${files[i]}`);
            const res = await processFile(json, allFiles, i, dys,matchFound);
			if(res.length){
				matchFound = true;
				result[json[0][colSymbol]] = res;
			}
            //console.log(`Processed ${json[0][colSymbol]} found ${res.length} match`)			
        }
        //console.log(`${i + 1} Completed`)
    }
    return result;
}
*/
const readFileRecParallel = async (files, allFiles, dys, list) => {
    let result = {};
	let promiseArr = [];	
    for (let i = 0; i < files.length; i++) {
        //log(`Reading data from ${files[i]}`);
        //const json = await csvToJson({ flatKeys: true }).fromFile(files[i]);
		const fileRes = await axios.post('http://localhost:5000/csvtojson',{fileName:files[i]});
		const json =  fileRes.data;
		if(list.length){
			if (list.includes(json[0][colSymbol])) {		
				promiseArr.push(processFile(json, allFiles, i, dys));        
			}
		} else {
			if (n50.includes(json[0][colSymbol])) {		
				promiseArr.push(processFile(json, allFiles, i, dys));        
			}
		}
    }
	
	const resp = await Promise.all(promiseArr)
	
	if(resp.length){
		resp.forEach((res)=>{
			if(res.length){				
				result[res[0].srcSymb] = res;
			}
		});
	}
	
	
    return result;
}

const findPrice = async (dys,list) => {
    try {
        log(`Reading files from ${year}`);
        const currentYearFiles = await readDirRec(cwd + `${FINAL_PATH}/${year}`);
        const allFiles = await readDirRec(cwd + `${FINAL_PATH}`);
        const result = await readFileRecParallel(currentYearFiles, allFiles, dys, list);      
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
			await createCsv('res.json',JSON.stringify(data));
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
		matchFound = 0;
		const tmpMatch = JSON.parse(JSON.stringify(matches));
		matches = [];
		let len = await findPrice(NUMBER_OF_DAYS[i],tmpMatch);
		log(`Number of iteration:${NUMBER_OF_DAYS[i]}`);		
		if(!len.length){			
			break;
		}
	}
}
prepare();
