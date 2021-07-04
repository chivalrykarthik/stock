const cheerio = require('cheerio');
const { Parser } = require('json2csv');
const { readFile, writeFile } = require('fs');
const { promisify } = require('util');
const readFilePr = promisify(readFile);
const writePr = promisify(writeFile);
const mapping = require('./colMapping');
let contentLength = null;
class StockProcess {
    getHtml = async () => {
        try {
            const content = await readFilePr('./test.html', 'utf8');
            return content;
        } catch (e) {
            console.log("Error in reading file", e.messaged)
        }
    }
    processHtml = async (html) => {
        try {
            const $ = cheerio.load(html);
            const heading = [];
            let content = [];
            const getHeading = (key, val) => {
                const txt = $(val).text().trim();
                if (!heading.includes(txt)) heading.push(txt);
            }
            const getContent = (key, val) => {
                const headingLenght = heading.length;
                const index = key % headingLenght;
                const headingTxt = heading[index];
                const valTxt = $(val).text().trim();
                if (index === 0) {
                    contentLength = contentLength !== null ? contentLength + 1 : 0;
                }
                content[contentLength] = content[contentLength] ? { ...content[contentLength], [headingTxt]: valTxt } : { [headingTxt]: valTxt };
            };
            $('table tbody tr th').each(getHeading);
            $('table tbody tr td').each(getContent);
            return content;
        } catch (e) {
            console.log("Invalid error:", e.message);
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
    createCsv = async (content) => {
        try {
            const wr = await writePr('./analysis.csv', content);
            console.log("Completed");
        } catch (e) {
            console.log("Error in writing:", e.message)
        }
    }

    createJSON = async (content) => {
        try {
            const wr = await writePr('./analysis.json', content);
            console.log("Completed");
        } catch (e) {
            console.log("Error in writing:", e.message)
        }
    }

    buildJSON = (content) => {
        if (content && content.length) {

            const actHeadings = Object.keys(content[0]);
            const finalObj = content.map(cont => {
                let tmp = { filters: {} };
                tmp[mapping['Name']] = cont['Name'];
                actHeadings.forEach(heading => {

                    if (mapping[heading]) {
                        tmp[mapping[heading]] = cont[heading];
                    }
                    if (mapping.filters[heading]) {
                        tmp.filters[mapping.filters[heading]] = cont[heading];
                    }
                    // return tmp;
                })
                return tmp;
            });
            const json = JSON.stringify(finalObj);
            return json;
        }

    }
}
const processFunc = async () => {
    try {
        const obj = new StockProcess();
        const html = await obj.getHtml();
        const content = await obj.processHtml(html);
        const json = obj.buildJSON(content);
        const csv = obj.buildCsv(content);
        obj.createCsv(csv);
        obj.createJSON(json);
    } catch (e) {
        console.log("Err:", e.message)
    }
};

processFunc();