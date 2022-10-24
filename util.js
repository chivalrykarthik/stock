const { readdir, lstat, writeFile, readFile,mkdir } = require('fs').promises;
const {existsSync} = require('fs');
const { Parser } = require('json2csv');
const path = require('path');
const log = console.log;

const readDirRec = async (pathName) => {
    try {
        let files = [];
        const res = await readdir(pathName);
        for (let i = 0; i < res.length; i++) {
            const filePath = `${pathName}/${res[i]}`;
            const stats = await lstat(filePath);
            if (stats.isFile()) {
                files.push(filePath);
            } else {
                files = [...files, ...await readDirRec(filePath)]
            }
        }
        return files;
    } catch (e) {
        log(e)
    }
}

const calcPercentage = (oldNum, newNum) => {
    const num1 = oldNum.trim();
    const num2 = newNum.trim();
    return (((num2 - num1) / num1) * 100).toFixed(2);
}

const createCsv = async (pathName, content, showLog = true) => {
    try {
        const wr = await writeFile(pathName, content);
		if(showLog){
			log("Completed writing data into csv");
		}
    } catch (e) {
       console.log("Error in writing:", e.message)
    }
}

const readContent = async (pathName)=>{
	try {
        const data = await readFile(pathName);
		return JSON.parse(data);
        log("Completed reading data into csv");
    } catch (e) {
        console.log("Error in reading:", e.message)
    }
}
const buildCsv = (data) => {
    try {
        const fields = Object.keys(data[0]);
        const opts = { fields };
        const parser = new Parser(opts);
        const csv = parser.parse(data);
        return csv;
    } catch (err) {
        console.error(err);
    }
}

const ensureDirectoryExistence = async (filePath) => {
  var dirname = path.dirname(filePath);  
  if (existsSync(dirname)) {
    return true;
  }
  
  await mkdir(dirname, { recursive: true }).catch(console.error);  
}

const readDirList = async (pathName) => {
    try {
        let files = [];
        const res = await readdir(pathName);
        for (let i = 0; i < res.length; i++) {
            const filePath = `${pathName}/${res[i]}`;
            const stats = await lstat(filePath);
            if (!stats.isFile()) {
                files.push(filePath);
            }
        }
        return files;
    } catch (e) {
        log(e)
    }
}

const findPercentage = (num,percent)=>(num/100)*percent

module.exports = {
    readDirRec,
    calcPercentage,
    createCsv,
    buildCsv,
	readContent,
	ensureDirectoryExistence,
	readDirList,
	findPercentage
};