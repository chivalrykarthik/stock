const { readdir, lstat, writeFile } = require('fs').promises;
const csvToJson = require('csvtojson');

const { Parser } = require('json2csv');
const cwd = process.cwd();
const log = console.log;
const readDirRec = async (path) => {
    try {
        let files = [];
        const res = await readdir(path);
        for (let i = 0; i < res.length; i++) {
            const filePath = `${path}/${res[i]}`;
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
createCsv = async (path, content) => {
    try {
        const wr = await writeFile(path, content);
        log("Completed writing data into csv");
    } catch (e) {
        console.log("Error in writing:", e.message)
    }
}
buildCsv = (data) => {
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
        const files = await readDirRec(cwd + '/history/data');
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
