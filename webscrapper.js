const puppeteer = require('puppeteer-core');


(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        devtools: false,
        slowMo: 50,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        executablePath: 'C:/Users/Karthik/AppData/Local/Google/Chrome/Application/chrome.exe'
    });
    try {

        const page = await browser.newPage();
        page.emulate({
            viewport: {
                width: 1200,
                height: 2400
            },
            userAgent: ""
        });
        await page.goto('https://www.nseindia.com/get-quotes/equity?symbol=TATAMOTORS');
        //await page.screenshot({ path: 'example.png' });
        const result = await page.evaluate(() => {
            const rows = document.getElementById('priceInfoTable').innerHTML;
            //console.log(document.querySelectorAll('#priceInfoTable').innerHTML)
            //const rows = document.querySelector('#priceInfoTable');
            console.log("rows===========", rows);
            /*return Array.from(rows, row => {
                const columns = row.querySelectorAll('td');
                return Array.from(columns, column => column.innerText);
            });*/
        });

        //console.log(result);

    } catch (e) {
        console.log(e);
    } finally {
        setTimeout(async () => {
            await browser.close();
        }, 2000);

    }
})();