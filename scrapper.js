const puppeteer = require('puppeteer-core');
const { writeFile } = require('fs');
const { promisify } = require('util');
const writePr = promisify(writeFile);
require('dotenv').config()
const { log } = console;
const userName = process.env.USER_NAME;
const password = process.env.PASSWORD;
const brw = process.env.BRW;
const login = process.env.LOGIN;
const nav = process.env.NAV;
const output = process.env.OUTPUT;
const { cols, removeSelectors } = require('./selectors');



const selectors = async (page, selector, isCheked, indx = 0) => {
    const searchTxt = selector[indx];
    let searchInput = await page.$('#manage-search');

    await searchInput.type(searchTxt);
    const checkbox = await page.$(`input[value='${searchTxt}']`);
    const isCheckBoxChecked = await (await checkbox.getProperty("checked")).jsonValue();
    if (isCheked) {
        if (!isCheckBoxChecked) {
            await page.click(`input[value='${searchTxt}']`);
        }
    } else {
        if (isCheckBoxChecked) {
            await page.click(`input[value='${searchTxt}']`);
        }
    }

    if (indx < selector.length - 1) {
        await searchInput.click({ clickCount: 3 });
        await searchInput.press('Backspace');
        await selectors(page, selector, isCheked, indx + 1);
    } else {
        await searchInput.click({ clickCount: 3 });
        await searchInput.press('Backspace');
    }
};

const openColumnFilter = async (page) => {
    // Edit column
    log(`Opening edit column page`);
    await page.click("a.button-secondary");
    await page.waitForSelector("#manage-search");

    // Remove previous selectors
    log(`Resetting the filters`);
    await page.click("#manage-reset");
    await selectors(page, removeSelectors, false);
};

const processCols = async (page, cols, i = 0) => {
    log(`------------Iteration started------------`);
    // Open columns options
    await openColumnFilter(page);

    // Add Columns
    log(`Selecting the columns`);
    const n = 12;
    const newCols = cols.slice(i, n + i);
    await selectors(page, newCols, true);
    log(`Selected ${newCols.length} columns`);
    // Final submit    
    await page.click("button.button-primary");

    // Get table content        
    log(`Getting content from the table`);
    await page.waitForSelector("table");
    let inner_html = await page.$eval('table', element => element.innerHTML);

    // Writing to file
    log(`Writting data to file`);
    inner_html = formContent(inner_html);
    await writePr(`${output}${i}.html`, inner_html);
    if (i + n < cols.length) {
        await processCols(page, cols, i + n);
    } else {
        log(`Processed ${i + n} selectors`);
        log(`------------Initiated finishing process------------`);
        log(`Setting up columns before closing`);
        // Open columns options
        await openColumnFilter(page);
        // Set columns before close        
        const newCols = cols.slice(0, n);
        await selectors(page, newCols, true);

        // Final submit    
        await page.click("button.button-primary");
    }
}

const formContent = html => `<table>${html}</table>`;
(async () => {
    try {
        const config = {
            headless: false,
            executablePath: brw,
            slowMo: 5
        }
        log(`Setting launch config`);
        const browser = await puppeteer.launch(config);
        log(`Opening new page in browser`);
        const page = await browser.newPage();
        log(`Opening login page`);
        await page.goto(login);

        // Login
        log(`Login with user name and password`);
        await page.waitForSelector(".card");
        await page.click("#id_username");
        await page.type("#id_username", userName);
        await page.click("#id_password");
        await page.type("#id_password", password);
        await page.click("button.button-primary");
        await page.waitForSelector("#sidebar");

        // GOTO page
        await page.goto(nav);
        await page.waitForSelector("table");

        await processCols(page, cols, 0);
        log(`Closing the browser`);
        await browser.close();
    } catch (e) {
        console.log(e)
    }
})();