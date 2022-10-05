const { readDirRec, createCsv, ensureDirectoryExistence, buildCsv,readDirList } = require('./../util');
const csvToJson = require('csvtojson');
require('dotenv').config();
const {cmp,symbolMapping} = require('./constants');
const HISTORY_DATA = process.env.HISTORY_DATA;
const TMP_PATH = process.env.TMP_PATH;
const FINAL_PATH = process.env.FINAL_PATH;
const cwd = process.cwd();


class Merge {	
	getSymbol(data){
		const symbol = data[0]['Symbol'];			
		return symbol
	}
	async readDirList(){
		const dir = cwd+TMP_PATH;
		const dirList = await readDirList(dir);
		if(dirList.length){
			this.iterateDir(dirList);
		} else {
			console.log("No direcotry found");
		}
	}
	
	async iterateDir(dirList){
		for(let i = 0;i<dirList.length; i++){
			const dir = dirList[i];
			const data = await this.readData(dir);
			if(data.length){
				const res = await this.writeData(data);			
				console.log(`Processed ${res}`);
			}
		}		
	}
	async readData(dir){
		let curYear = 1996;
		const maxYear = new Date().getFullYear();
		let data = [];
		while(curYear <= maxYear){
			try{
				const fileName = dir+'/'+curYear+'.csv'
				const json = await csvToJson({ flatKeys: true }).fromFile(fileName);
				data = [...data,...json];
			} catch(e){
				console.log(`${dir+'/'+curYear+'.csv'} not exists`);
			}
			curYear++;
		}
		return data;
	}
	
	async writeData(data){		
		const symbol = this.getSymbol(data);	
		const curSymbol = symbolMapping[symbol] || symbol;
		const dir = cwd+FINAL_PATH+'/';	
		const fileName = curSymbol+'.csv';
		const path = dir+fileName;
		await ensureDirectoryExistence(path);		
		const csv = await buildCsv(data);
		await createCsv(path,csv, false);
		return curSymbol;
	}
}


const processFiles = async()=>{
	const cmb = new Merge();
	await cmb.readDirList();
	
}

processFiles();
