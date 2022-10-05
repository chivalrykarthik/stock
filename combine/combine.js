const { readDirRec, createCsv, ensureDirectoryExistence, buildCsv } = require('./../util');
const csvToJson = require('csvtojson');
require('dotenv').config();
const {cmp,symbolMapping} = require('./constants');
const HISTORY_DATA = process.env.HISTORY_DATA;
const TMP_PATH = process.env.TMP_PATH;
const cwd = process.cwd();

class Combine {
	constructor(){
		this.processingYear = 1996;
		this.yearLast = new Date().getFullYear();
		this.misMatch = [];
	}
	getSymbol(data){
		const symbol = data[0]['Symbol'];	
		return symbol
	}
	async readFilesList() {
		while(this.processingYear <= this.yearLast){
			const currentYearFiles = await readDirRec(cwd + `${HISTORY_DATA}/${this.processingYear}`);
			await this.readData(currentYearFiles);
			this.processingYear++;
		}
	} 
	async readData(fileNames) {
		let dt = {};
		//fileNames.forEach(async (fileName) => {
		for(let i=0;i < fileNames.length;i++){
			const json = await csvToJson({ flatKeys: true }).fromFile(fileNames[i]);
			const symbol = this.getSymbol(json)
			if(dt[symbol]){
				dt[symbol] = json.length === 1 ? [...json, ...dt[symbol]] : [...dt[symbol], ...json];
			} else {
				dt[symbol] = [...json];
			}
		}
		await this.iterateData(dt);
	}
	async iterateData(data) {
		const keys = Object.keys(data);
		if(keys.length){
			for(let i = 0;i<keys.length; i++){
				await this.writeData(data[keys[i]]);
			}
			console.log(`Completed processing ${this.processingYear}`);
		}
	}
	async writeData(data){		
		if(!data.length) return;
		const symbol = this.getSymbol(data);
		const currentSymbol = symbolMapping[symbol] || symbol;
		let dir = cwd+TMP_PATH+'/'+currentSymbol+'/';			
		const fileName = this.processingYear+'.csv';
		const path = dir+fileName;
		await ensureDirectoryExistence(path);		
		const csv = await buildCsv(data);
		await createCsv(path,csv, false);
		if(!cmp.includes(currentSymbol) && !this.misMatch.includes(currentSymbol)){
			this.misMatch.push(currentSymbol);
		}
	}
}

const processFiles = async()=>{
	const cmb = new Combine();
	await cmb.readFilesList();
	console.log(cmb.misMatch);
}

processFiles();
