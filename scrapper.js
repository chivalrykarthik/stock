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


const removeSelectors = ['Price to Earning', 'Dividend yield', 'Net Profit latest quarter', 'YOY Quarterly sales growth', 'YOY Quarterly profit growth', 'Sales latest quarter', 'Return on capital employed'];
const cols = [
    ['Price to Earning', 'PEG Ratio', 'Price to Sales', 'EVEBITDA', 'Interest Coverage Ratio', 'Debt to equity', 'Current ratio', 'Return on equity', 'Average return on equity 3Years', 'Average return on equity 5Years', 'Return on capital employed', 'Average return on capital employed 3Years', 'Average return on capital employed 5Years', 'Sales growth'],
    ['Sales growth 3Years', 'Sales growth 5Years', 'EPS', 'EPS last year', 'EPS preceding year', 'EPS latest quarter', 'EPS preceding year quarter', 'Dividend yield', 'Dividend Payout Ratio', 'Return on assets', 'Return on assets preceding year', 'Return on assets 3years', 'Return on assets 5years'],
    ['Altman Z Score', 'G Factor']
]

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
    await selectors(page, cols[i], true);

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
    if (i < cols.length - 1) {
        await processCols(page, cols, i + 1);
    } else {
        log(`------------Initiated finishing process------------`);
        log(`Setting up columns before closing`);
        // Open columns options
        await openColumnFilter(page);
        // Set columns before close        
        await selectors(page, cols[0], true);
    }
}

const formContent = html => `<table>${html}</table>`;
(async () => {
    try {
        const config = {
            headless: false,
            executablePath: brw,
            slowMo: 25
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