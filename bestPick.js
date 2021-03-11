const csv = require('csvtojson')

const { Parser } = require('json2csv');

const fs = require('fs');

const csvFilePath = './soft.csv';

const output = './bestpick.csv';

const log = console.log;

 

const metrics = {

    "price":{

        validate:false,

        value: 200,

        operator: function(v) { return v > this.value },

        col:'CMP\n          Rs.' // Current price

    },

    pe:{

        validate:false,

        value: 16,

        operator: function(v) { return v > this.value },

        col:'P\/E' // Pe ratio

    },

    peg:{

        validate:true,

        value: 1,

        operator: function(v) { return v > this.value },

        col:'PEG' // PG ratio

    },

    interestCoverage:{

        validate:true,

        value: 2,

        operator: function(v) { return v < this.value },

        col:'Int Coverage' // Interest coverage ratio

    },

    debt:{

        validate:true,

        value: 1.5,

        operator: function(v) { return v > this.value },

        col:'Debt / Eq' // Debt to equity ratio

    },

    quickRatio:{

        validate:false,

        value: 1,

        operator: function(v) { return v < this.value },

        col:'Quick Rat' // Quick ratio

    },

    currentRatio:{

        validate:true,

        value: 1.33,

        operator: function(v) { return v < this.value },

        col:'Current ratio' // Current ratio

    }

};

 

class BestPick {

    readCsv = async()=>{

        try {

            const jsonArray = await csv().fromFile(csvFilePath);

            return jsonArray;

        } catch (e) {

            console.log("Error in reading csv")

        }

    }

    filterStock = (stocks)=>{

        const addFilters = (stock)=>{

            const price = metrics.price;

            const pe = metrics.pe;

            const peg = metrics.peg;

            const interCoverage = metrics.interestCoverage;

            const debt = metrics.debt;

            const quickRatio = metrics.quickRatio;

            const currentRatio = metrics.currentRatio;

            //Price

            if(price.validate && price.operator(stock[price.col])){

                return false;

            }

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

 

    createCsv= async (content) => {        

        try{

            const wr = await writePr(output,content);

            console.log("Completed");

        } catch(e){

            console.log("Error in writing:",e.message)

        }

    }

}

 

const processStock = async ()=>{

    const best = new BestPick();

    const jsonData = await best.readCsv();

    const bestStocks = best.filterStock(jsonData);

    const csvData = best.buildCsv(bestStocks);

    best.createCsv(csvData);

}

processStock();