const csvToJson = require('csvtojson');
const { readDirRec, calcPercentage, createCsv, buildCsv } = require('./../util');
require('dotenv').config();
const HISTORY_DATA = process.env.HISTORY_DATA;
const cwd = process.cwd();
const log = console.log;


const processFile = async (data) => {
    if (!data.length) return [];
    const processedData = data.map((dt, key) => {
        dt.openClosePer = calcPercentage(dt['Open Price'], dt['Close Price']);
        dt.prevClosePer = calcPercentage(dt['Prev Close'], dt['Close Price']);
        if (key > 0) {
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
        const files = await readDirRec(cwd + HISTORY_DATA);
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
*/
