//const csvToJson = require('csvtojson');
const { readDirRec, createCsv, readContent } = require('./../util');
const axios = require('axios');
const findMatch = require('./findMatch');
const { colSymbol, n50, colPrice } = require('./constants');
require('dotenv').config();
const FINAL_PATH = process.env.FINAL_PATH;
const NUMBER_OF_DAYS = process.env.NUMBER_OF_DAYS.split(',');
const n = parseInt(process.env.CHUNK_SIZE);
const { log } = console;
//const log = () => { };
const cwd = process.cwd();
//const year = new Date().getFullYear();
//const year = 2021;
let matchFound = 0;
let matches = [];
let srcFiles = {};
const processFile = async (sourceData, allFiles, parentIndex, dys) => {
    const srcDt = sourceData.slice(sourceData.length - dys);
    let match = [];
    for (let i = 0; i < allFiles.length; i++) {
        //log(`Reading data for ${parentIndex}(${i})(${dys})(${matchFound})(${srcDt[0][colSymbol]}) from ${allFiles[i]}`);
		log(`Reading data for ${parentIndex}(${i})(${dys})(${matchFound})`);
		//log("matches==="+JSON.stringify(matches));
        //const json = await csvToJson({ flatKeys: true }).fromFile(allFiles[i]);
		 // const fileRes = await axios.post('http://localhost:5000/csvtojson',{fileName:allFiles[i]});
		 if(!srcFiles[allFiles[i]]){			
			const fileRes = await axios.post('http://localhost:5000/csvtojson',{fileName:allFiles[i]});
			srcFiles[allFiles[i]] =  fileRes.data;		
		 } 
		 const json = srcFiles[allFiles[i]];
		//const fileRes = await axios.get('http://localhost:5000/json/33.json');
		//const json =  fileRes.data;
		
		
        //log(`Finding Match in ${allFiles[i]}`);
        //const mtch = findMatch(srcDt, json);		
		
		const res = await axios.post('http://localhost:3000/fp',{srcDt, json});		
		const mtch = res.data;
		 
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
		if(!srcFiles[files[i]]){
			const fileRes = await axios.post('http://localhost:5000/csvtojson',{fileName:files[i]});
			srcFiles[files[i]] =  fileRes.data;					
		} 
	}
    for (let i = 0; i < files.length; i++) {
        //log(`Reading data from ${files[i]}`);
        //const json = await csvToJson({ flatKeys: true }).fromFile(files[i]);		
		if(!srcFiles[files[i]]){			
			const fileRes = await axios.post('http://localhost:5000/csvtojson',{fileName:files[i]});
			srcFiles[files[i]] =  fileRes.data;					
		} 
		 const json = srcFiles[files[i]];		
		let res = [];
		if(list.length){
			if (list.includes(json[0][colSymbol])) {		
				//promiseArr.push(processFile(json, allFiles, i, dys));        
				res = await processFile(json, allFiles, i, dys);
			}
		} else {
			const price = json[json.length - 1][colPrice];
			const startPrice = 50;
			const endPrice= 100;
			//if (price >=startPrice && price <= endPrice) {				
				//promiseArr.push(processFile(json, allFiles, i, dys));     
				res = await processFile(json, allFiles, i, dys);				
			//}
		}
		if(res.length){
			// matchFound = true;
			result[json[0][colSymbol]] = res;
		}
    }
	
	/*const resp = await Promise.all(promiseArr)
	
	if(resp.length){
		resp.forEach((res)=>{
			if(res.length){				
				result[res[0].srcSymb] = res;
			}
		});
	}*/
	
	
    return result;
}

const readFileChunks = async (files, allFiles, dys, list) => {
	let result = {};
	const total = files.length-1;
	for (let i = 0; i <= total; i++) {
		if(!srcFiles[files[i]]){
			const fileRes = await axios.post('http://localhost:5000/csvtojson',{fileName:files[i]});
			srcFiles[files[i]] =  fileRes.data;					
		} 
	}
	for(let i = 0; i<=total;i+=n) {
		let end = i + (n - 1);
		let lastIndex = end > total ? total:end;
		let promiseArr = [];
		for(let j = i; j<=lastIndex;j++) {			
			if(!srcFiles[files[j]]){		
				console.log("=================================================="+j)
				console.log("=================================================="+files[j])			
				const fileRes = await axios.post('http://localhost:5000/csvtojson',{fileName:files[j]});
				srcFiles[files[j]] =  fileRes.data;					
			} 
			 const json = srcFiles[files[j]];	
			if(list.length) {
				if (list.includes(json[0][colSymbol])) {
					promiseArr.push(processFile(json, allFiles, j, dys));        
				}
			} else {
				promiseArr.push(processFile(json, allFiles, j, dys));				
			}
		}
		const resp = await Promise.all(promiseArr)
		if(resp.length) {
			resp.forEach((res)=> {
				if(res.length) {				
					result[res[0].srcSymb] = res;
				}
			});
		}
	}
	
	return result;
}

	
   
/*
const n = 3;
const total = 200;
for(let i = 0; i<=total;i+=n) {
 let end = i + (n - 1);
 let lastIndex = end > total ? total:end;
 for(let j = i; j<=lastIndex;j++) {
    console.log(j)
 }
}


  */

const findPrice = async (dys,list) => {
    try {
        log(`Reading files from ${FINAL_PATH}`);
        const currentYearFiles = await readDirRec(cwd + `${FINAL_PATH}`);
        const allFiles = await readDirRec(cwd + `${FINAL_PATH}`);
        //const result = await readFileRecParallel(currentYearFiles, allFiles, dys, list);      
		const result = await readFileChunks(currentYearFiles, allFiles, dys, list);      
		
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
        log(e.message)
		log(e.stack)
    }

}


const prepare = async ()=>{
	// findPrice();
	const t= NUMBER_OF_DAYS.length;	
	await createCsv('res.json',JSON.stringify([]));
	console.time('Execution Time');
	for(let i = 0;i<t;i++){	
		matchFound = 0;
		const tmpMatch = JSON.parse(JSON.stringify(matches));
		matches = [];
		let len = await findPrice(NUMBER_OF_DAYS[i],tmpMatch);
		log(`Number of iteration:${NUMBER_OF_DAYS[i]}`);		
		if(!len || !len.length){			
			break;
		}
	}
	console.timeEnd('Execution Time');
}
prepare();
