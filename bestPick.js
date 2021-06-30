const csv = require('csvtojson')
const { Parser } = require('json2csv');
const { writeFile } = require('fs');
const { promisify } = require('util');
const writePr = promisify(writeFile);
const csvFilePath = './soft.csv';
const output = './bestpick.csv';
const log = console.log;

//Test123
const metrics = {
    "price": {
        validate: true,
        value: 200,
        operator: function (v) { return v > this.value },
        col: 'CMP' // Current price
    },
    pe: {
        validate: false,
        value: 16,
        operator: function (v) { return v > this.value },
        col: 'P\/E' // Pe ratio
    },
    peg: {
        validate: true,
        value: 1,
        operator: function (v) { return v > this.value || v < 0 },
        col: 'PEG' // PG ratio
    },
    interestCoverage: {
        validate: true,
        value: 2,
        operator: function (v, debt) {
            if (v < 0) return true;
            if (!isNaN(debt) && debt > 0 && v < this.value) return true;
            return false;
        },
        col: 'Int Coverage' // Interest coverage ratio
    },
    debt: {
        validate: true,
        value: 1.5,
        operator: function (v) { return v > this.value },
        col: 'Debt / Eq' // Debt to equity ratio
    },
    quickRatio: {
        validate: false,
        value: 1,
        operator: function (v, debt) {
            if (v < 0) return true;
            if (!isNaN(debt) && debt > 0 && v < this.value) return true;
            return false;
        },
        col: 'Quick Rat' // Quick ratio
    },
    currentRatio: {
        validate: true,
        value: 1.33,
        operator: function (v, debt) {
            if (v < 0) return true;
            if (!isNaN(debt) && debt > 0 && v < this.value) return true;
            return false;
        },
        col: 'Current ratio' // Current ratio
    }
};
class BestPick {
    readCsv = async () => {
        try {
            const jsonArray = await csv().fromFile(csvFilePath);
            return jsonArray;
        } catch (e) {
            console.log("Error in reading csv")
        }
    }

    filterStock = (stocks) => {
        const addFilters = (stock) => {
            const price = metrics.price;
            const pe = metrics.pe;
            const peg = metrics.peg;
            const interCoverage = metrics.interestCoverage;
            const debt = metrics.debt;
            const quickRatio = metrics.quickRatio;
            const currentRatio = metrics.currentRatio;
            //Price            
            if (price.validate && price.operator(stock[price.col])) {
                return false;
            }
            //PE
            if (pe.validate && pe.operator(stock[pe.col])) {
                return false;
            }
            //PEG
            if (peg.validate && peg.operator(stock[peg.col])) {
                return false;
            }

            //Interest coverage            
            if (interCoverage.validate && interCoverage.operator(stock[interCoverage.col], stock[debt.col])) {
                return false;
            }

            //Debt
            if (debt.validate && debt.operator(stock[debt.col])) {
                return false;
            }

            //Quick Ratio
            if (quickRatio.validate && quickRatio.operator(stock[quickRatio.col], stock[debt.col])) {
                return false;
            }

            //Current Ratio
            if (currentRatio.validate && currentRatio.operator(stock[currentRatio.col], stock[debt.col])) {
                return false;
            }
            return true;
        }
        return stocks.filter(addFilters);
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
            const wr = await writePr(output, content);
            console.log("Completed");
        } catch (e) {
            console.log("Error in writing:", e.message)
        }
    }
}

const processStock = async () => {
    const best = new BestPick();
    const jsonData = await best.readCsv();
    const bestStocks = best.filterStock(jsonData);
    if (!bestStocks || !bestStocks.length) {
        console.log(`No match found`);
        return;
    }
    const csvData = best.buildCsv(bestStocks);
    best.createCsv(csvData);

}
processStock();