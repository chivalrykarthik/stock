const cheerio = require('cheerio');
const { Parser } = require('json2csv');
const { readFile, writeFile } = require('fs');
const { promisify } = require('util');
const readFilePr = promisify(readFile);
const writePr = promisify(writeFile);
const mapping = require('./colMapping');
let contentLength = null;
const source = process.argv[2] || './test.html';
const destination = process.argv[3] || './analysis';
class StockProcess {
    getHtml = async () => {
        try {
            const content = await readFilePr(source, 'utf8');
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
                const filteredTxt = txt.replace(/[^a-z0-9]/gmi, "");
                if (!heading.includes(filteredTxt)) heading.push(filteredTxt);
            }
            const getContent = (key, val) => {
                const headingLenght = heading.length;
                const index = key % headingLenght;
                const headingTxt = heading[index];
                let valTxt = $(val).text().trim();
                if (headingTxt === 'Name') {
                    let symb = '';
                    const contentPath = $(val).find('a').attr('href');

                    if (contentPath) {
                        const pathSplit = contentPath.split('/').filter(v => v);
                        symb = pathSplit[pathSplit.length - 1] === 'consolidated' ? pathSplit[pathSplit.length - 2] : pathSplit[pathSplit.length - 1];
                    }
                    valTxt = symb ? `${valTxt}~${symb}` : valTxt;
                }

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

    addSymbol = async (content) => {
        let newContent = JSON.parse(JSON.stringify(content));
        for (let i = 0; i <= newContent.length - 1; i++) {
            const tmp = newContent[i].Name.split('~');
            newContent[i].Name = tmp.length ? tmp[0] : newContent[i].Name;
            newContent[i].Symbol = tmp.length ? tmp[1] : '';
        }
        return newContent;

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
            const wr = await writePr(`${destination}.csv`, content);
            console.log("Completed");
        } catch (e) {
            console.log("Error in writing:", e.message)
        }
    }

    createJSON = async (content) => {
        try {
            const wr = await writePr(`${destination}.json`, content);
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
                    /*
                    TODO: stock name should be static
                    */
                    if (mapping[heading]) {
                        tmp[mapping[heading]] = cont[heading];
                    } else if (heading !== 'SNo' && heading !== 'Name') {
                        tmp[heading] = cont[heading];
                    }
                    if (mapping.filters[heading]) {
                        tmp.filters[mapping.filters[heading]] = cont[heading];
                    } else if (heading !== 'SNo' && heading !== 'Name') {
                        tmp.filters[heading] = cont[heading];
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
        const contentWithSymb = await obj.addSymbol(content);
        const json = obj.buildJSON(contentWithSymb);
        const csv = obj.buildCsv(contentWithSymb);
        // obj.createCsv(csv);
        obj.createJSON(json);
    } catch (e) {
        console.log("Err:", e.message)
    }
};

processFunc();