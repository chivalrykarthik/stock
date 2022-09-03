const { readdir, lstat, writeFile } = require('fs').promises;
const { Parser } = require('json2csv');
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

const createCsv = async (path, content) => {
    try {
        const wr = await writeFile(path, content);
        log("Completed writing data into csv");
    } catch (e) {
        console.log("Error in writing:", e.message)
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

module.exports = {
    readDirRec,
    calcPercentage,
    createCsv,
    buildCsv
};