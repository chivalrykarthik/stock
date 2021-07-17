const puppeteer = require('puppeteer-core');
const { writeFile } = require('fs');
const { promisify } = require('util');
const writePr = promisify(writeFile);


const navUrl = 'https://www.screener.in/company/compare/00000006/';

const sel = ['Price to Earning', 'PEG Ratio', 'EVEBITDA', 'Interest Coverage Ratio', 'Debt to equity', 'Current ratio', 'Market Capitalization', 'Return on equity', 'Average return on equity 3Years', 'Average return on equity 5Years', 'Return on capital employed', 'Average return on capital employed 3Years', 'Average return on capital employed 5Years', 'Sales growth', 'Sales growth 3Years'];

const selectors = async (page, selector, indx) => {
    const searchTxt = selector[indx];
    let searchInput = await page.$('#manage-search');
    //await searchInput.click();
    await searchInput.type(searchTxt);
    const checkbox = await page.$(`input[value='${searchTxt}']`);
    const isCheckBoxChecked = await (await checkbox.getProperty("checked")).jsonValue();
    if (!isCheckBoxChecked) {
        await page.click(`input[value='${searchTxt}']`);
    }
    console.log("isCheckoed====" + isCheckBoxChecked);
    if (indx < selector.length - 1) {
        //await page.click('#manage-search');
        //for (let i = 0; i <= searchTxt.length; i++) {
        //  await page.keyboard.press('Backspace');
        //}
        await searchInput.click({ clickCount: 3 });
        await searchInput.press('Backspace');
        await selectors(page, selector, indx + 1);
    }
}
(async () => {
    try {

        const config = {
            headless: false,
            executablePath: 'C:/Users/Karthik/AppData/Local/Google/Chrome/Application/chrome.exe',
            slowMo: 50
        }
        const browser = await puppeteer.launch(config);
        const page = await browser.newPage();
        await page.goto('https://www.screener.in/login/');

        // Login
        await page.waitForSelector(".card");
        await page.click("#id_username");
        await page.type("#id_username", userName);
        await page.click("#id_password");
        await page.type("#id_password", password);
        await page.click("button.button-primary");
        await page.waitForSelector("#sidebar");


        // GOTO page
        await page.goto(navUrl);
        await page.waitForSelector("table");

        // Edit column
        await page.click("a.button-secondary");
        await page.waitForSelector("#manage-search");

        // selectors 
        await selectors(page, sel, 0);

        // Final submit
        await page.click("button.button-primary");

        // Get table content        
        await page.waitForSelector("table");
        let inner_html = await page.$eval('table', element => element.innerHTML);

        // Writing to file
        inner_html = `<table>${inner_html}</table>`
        await writePr('./scrap.html', inner_html);

        await browser.close();
    } catch (e) {
        console.log(e)
    }
})();