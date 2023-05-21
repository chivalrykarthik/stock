const csvToJson = require('csvtojson');
const { readDirRec, calcPercentage, createCsv, buildCsv } = require('./../util');
require('dotenv').config();
const FINAL_PATH = process.env.FINAL_PATH;
const cwd = process.cwd();
const log = console.log;


const processFile = async (data) => {
    if (!data.length) return [];
    const processedData = data.map((dt, key) => {
        dt.openClosePer = calcPercentage(dt['Open Price'], dt['Close Price']);
        dt.prevClosePer = calcPercentage(dt['Prev Close'], dt['Close Price']);
		//dt.prevCloseOpenPer = calcPercentage(dt['Prev Close'], dt['Open Price']);
        if (key > 0) {
			//dt.prevCloseOpenPer = calcPercentage(data[key - 1]['Close Price'], dt['Open Price']);
            dt.prevClosePer = calcPercentage(data[key - 1]['Close Price'], dt['Close Price']);
            dt.prevOpenPer = calcPercentage(data[key - 1]['Open Price'], dt['Open Price']);
            dt.trdQtyPer = calcPercentage(data[key - 1]['Total Traded Quantity'], dt['Total Traded Quantity']);
            dt.turnoverPer = calcPercentage(data[key - 1]['Turnover'], dt['Turnover']);
            if (data[key - 1]['No. of Trades'] !== '-' && dt['No. of Trades'] !== '-') {
                dt.noOfTradePer = calcPercentage(data[key - 1]['No. of Trades'], dt['No. of Trades']);
            } else {
                dt.noOfTradePer = '-'
            }
        } else {
            dt.prevOpenPer = '-';
            dt.trdQtyPer = '-';
            dt.turnoverPer = '-';
            dt.noOfTradePer = '-'
        }
        return dt;
    });
    return processedData;
}


const readFileRec = async (files) => {
    for (let i = 0; i < files.length; i++) {
        log(`Reading data from ${files[i]}`);
        const json = await csvToJson({ flatKeys: true }).fromFile(files[i]);
        log(`Processing ${files[i]}`);
        const res = await processFile(json);
        log(`Building csv`)
        const csv = buildCsv(res);
        log(`Writing data into ${files[i]}`);
        createCsv(files[i], csv);
    }
}

const processHistory = async () => {
    try {
        const files = await readDirRec(cwd + FINAL_PATH);
        await readFileRec(files);
        //log(files);
    } catch (e) {
        log(e)
    }

}
processHistory();


/*
symbol
series
rdDateToDate
fromDate
toDate

Open - close 2376.95-2477.50 = 4.23%
prev open - open - 2336.75 - 2376.95= 1.72%
prev close - close - 2363.45 - 2477.50 = 4.82%
Prev close - open - 2363.45 - 2375.85 = 0.52%
*/
