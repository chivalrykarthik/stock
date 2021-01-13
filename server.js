const csv = require('csvtojson')
const { Parser } = require('json2csv');
const fs = require('fs');
const csvFilePath = './bhav.csv';
const log = console.log;

const CONSTANTS = {
    VALID_TRADQTY: 1000,
    VALID_TOTALTRADES: 9000,
    VALID_LOW_LAST_PRICE: 20,
    VALID_HIGH_LAST_PRICE: 1000,
    VALID_CLOSE_PERCENT: 1,
    VALID_SERIES: ['EQ'],
}
const calcDiffPercentage = (close, prevClose) => {
    const res = (100 / prevClose) * (close - prevClose)
    return res;
}
const fp = {
    readFile: async () => {
        try {
            const jsonArray = await csv().fromFile(csvFilePath);
            return jsonArray;
        } catch (e) {
            console.log("Error in reading csv")
        }
    },
    filterBasedOnSeries: (data) => {
        log(`Actual result:${data.length}`)
        // SERIES
        const filterData = data.filter(dt => CONSTANTS.VALID_SERIES.includes(dt.SERIES))
        log(`After series filter:${filterData.length}`)
        return filterData;
    },
    filterBasedOnTradeQty: (data) => {
        const filterData = data.filter(dt => dt.TOTTRDQTY >= CONSTANTS.VALID_TRADQTY)
        log(`After trade qty filter:${filterData.length}`)
        return filterData;
    },
    filterBasedOnTotalTrades: (data) => {
        const filterData = data.filter(dt => dt.TOTALTRADES >= CONSTANTS.VALID_TOTALTRADES)
        log(`After total trades filter:${filterData.length}`)
        return filterData;
    },
    filterBasedOnLastPrice: (data) => {
        const filterData = data.filter(dt => (dt.LAST >= CONSTANTS.VALID_LOW_LAST_PRICE && dt.LAST < CONSTANTS.VALID_HIGH_LAST_PRICE))
        log(`After last price filter:${filterData.length}`)
        return filterData;
    },
    filterBasedOnPrevPrice: (data) => {
        const filterData = data.filter((dt, key) => {
            const incPercent = calcDiffPercentage(dt.CLOSE, dt.PREVCLOSE);
            delete data[key].field14;
            data[key].INCPERCENT = incPercent;
            return ((dt.CLOSE > dt.PREVCLOSE) && (incPercent >= CONSTANTS.VALID_CLOSE_PERCENT));
        });
        log(`After prev price filter:${filterData.length}`)
        return filterData;
    },
    buildCsv: (data) => {
        try {
            const fields = Object.keys(data[0]);
            const opts = { fields };
            const parser = new Parser(opts);
            const csv = parser.parse(data);
            return csv;
        } catch (err) {
            console.error(err);
        }
    },
    createCsv: (content) => {
        return new Promise((res, rej) => {
            fs.writeFile('./processed.csv', content, (err) => {
                if (err) return rej(err);
                return res("Completed");
            })
        })

    }
}
fp.readFile()
    .then(data => fp.filterBasedOnSeries(data))
    .then(data => fp.filterBasedOnTradeQty(data))
    .then(data => fp.filterBasedOnTotalTrades(data))
    .then(data => fp.filterBasedOnLastPrice(data))
    .then(data => fp.filterBasedOnPrevPrice(data))
    .then(data => fp.buildCsv(data))
    .then(content => fp.createCsv(content))
    .then(res => console.log(res))
    .catch(e => console.warn(e));


