const { exec } = require('child_process');
const { promisify } = require('util');
const url = require('url');
const combine = require('./combine');
require('dotenv').config()
const execPr = promisify(exec);
const urls = [
    'https://www.screener.in/screen/raw/?sort=market+capitalization&order=&source=&query=Market+Capitalization+%3E+0&page=1',
    'https://www.screener.in/screen/raw/?sort=market+capitalization&order=&source=&query=Market+Capitalization+%3E+0&page=2',
    'https://www.screener.in/screen/raw/?sort=market+capitalization&order=&source=&query=Market+Capitalization+%3E+0&page=3'
];
const { log } = console;
const process = async () => {
    try {
        //Clean up
        log("Cleaning up existing pages")
        await execPr('node ./cleanUp.js')

        for (let i = 0; i < urls.length; i++) {
            const tmpUlr = urls[i].replace(/&/gi, '*');

            log('*'.repeat(100))
            log(`Extract URL:${tmpUlr}`)
            log('*'.repeat(100))
            log("Extracting data");
            await execPr(`node ./scrapper.js ${tmpUlr}`);
            log("Extracting completed:");

            log(`Processing HTML to JSON`)
            await execPr(`node ./processPages.js`);
            log(`Processed HTML to JSON`)

            log(`Finding JSON files from ./pages`);
            combine();
            log(`Created master JSON FILE`);

            log(`Iteration ${i + 1} of ${urls.length} completed`)
        }
    } catch (e) {
        log("Erorr:" + e.message)
    }

}

process();


