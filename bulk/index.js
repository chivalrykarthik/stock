const { exec } = require('child_process');
const { promisify } = require('util');
const { unlink } = require('fs');
const combine = require('./combine');
require('dotenv').config()
const execPr = promisify(exec);
const unlinkPr = promisify(unlink);
const urls = [];
const { log } = console;

const callScrapper = async (tmpUlr) => {
    log('*'.repeat(100))
    log(`Extract URL:${tmpUlr}`)
    log('*'.repeat(100))
    log("Extracting data");
    await execPr(`node ./scrapper.js ${tmpUlr}`);
    log("Extracting completed:");
}
const callProcessPages = async () => {
    log(`Processing HTML to JSON`)
    await execPr(`node ./processPages.js`);
    log(`Processed HTML to JSON`)
}
const callCombine = async () => {
    log(`Finding JSON files from ./pages`);
    await combine();
    log(`Created master JSON FILE`);
}
const cleanBulk = async () => {
    try {
        await unlinkPr('./bulk/final.json');
        log('Bulk is empty');
    } catch (e) {
        log('Bulk is already empty');
    }
}
const process = async () => {
    try {
        //Clean up bulk folder
        log("Cleaning up existing pages")
        await cleanBulk();


        for (let i = 0; i < urls.length; i++) {
            const tmpUlr = urls[i].replace(/&/gi, '*');
            await execPr('node ./cleanUp.js');
            await callScrapper(tmpUlr);
            await callProcessPages();
            await callCombine();

            log(`Iteration ${i + 1} of ${urls.length} completed`)
        }
    } catch (e) {
        log("Erorr:" + e.message)
    }

}

process();


