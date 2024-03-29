const { cols, colSymbol, colDate } = require('./constants');
const {findPercentage} = require('./../util.js')
require('dotenv').config();

const PERCENTAGE_VARIANCE = parseFloat(process.env.PERCENTAGE_VARIANCE);
const isMatchExist = (src, dt) => {
    return cols.every((col) => {
        if (src[col] === '-' || dt[col] === '-') return true;

       /* if (col === 'trdQtyPer' || col === 'turnoverPer' || col === 'noOfTradePer') {
            return (dt[col] >= 0 && src[col] >= 0) || (dt[col] <= 0 && src[col] <= 0)
        }*/
		const diff = +parseFloat(findPercentage(src[col],PERCENTAGE_VARIANCE)).toFixed(2);		
		
        const upperLimit = +parseFloat(+src[col] + Math.abs(diff)).toFixed(2);
        const lowerLimit = +parseFloat(src[col] - Math.abs(diff)).toFixed(2);
		
        return (dt[col] >= lowerLimit && dt[col] <= upperLimit);
    });
}
const findMatch = (source, data) => {	
    if (!source.length || !data.length) return [];
    //const src = JSON.parse(JSON.stringify(source));
    //const dt = JSON.parse(JSON.stringify(data));
	const src = [...source];
    const dt = [...data];
    const revSrc = src.reverse();
    let match = [];
    for (let i = 0; i <= revSrc.length - 1; i++) {
        if (i === 0) {
            // dt.length - 2 - to exclude last record in all files
            // j = 1 - skipping the first record
            for (let j = 1; j <= dt.length - 2; j++) {
                if (isMatchExist(revSrc[i], dt[j])) {
                    const projOpenPer = (revSrc[i]['Open Price'] / 100) * dt[j + 1]['prevOpenPer'];
                    const projClosePer = (revSrc[i]['Close Price'] / 100) * dt[j + 1]['prevClosePer'];
					const projfifth = (dt[j + 5] && dt[j + 5]['prevOpenPer']!='-') ? (revSrc[i]['Open Price'] / 100) * dt[j + 5]['prevOpenPer']:0;
					const projTenth = (dt[j + 10] && dt[j + 10]['prevOpenPer']!='-') ? (revSrc[i]['Open Price'] / 100) * dt[j + 10]['prevOpenPer']:0;
					const projFourteenth = (dt[j + 14] && dt[j + 14]['prevOpenPer']!='-') ? (revSrc[i]['Open Price'] / 100) * dt[j + 14]['prevOpenPer']:0;
					
                    let tmp = {
                        index: j,
                        //data: dt[j],
                        //nextRow: dt[j + 1],
                        srcDate: revSrc[i][colDate],
						mtDate: dt[j][colDate],
                        mtSymbol: dt[j][colSymbol],
                        projOpen: (+revSrc[i]['Open Price'] + projOpenPer),
                        projClose: (+revSrc[i]['Close Price'] + projClosePer),
						fifth: projfifth ? (+revSrc[i]['Open Price'] + projfifth) : '-',
						tenth: projTenth ? (+revSrc[i]['Open Price'] + projTenth) : '-',
						fourteenth: projFourteenth ? (+revSrc[i]['Open Price'] + projFourteenth) : '-',						
                    }
                    match.push(tmp);
                }
            }
        } else if (i > 0 && match.length) {
            let tmp = [];
            for (let j = 1; j <= match.length - 1; j++) {
                const matchIndex = match[j].index;
                const prevIndex = matchIndex - i;

                if (prevIndex >= 0 && isMatchExist(revSrc[i], dt[prevIndex])) {
                    let tmpData = {
                        ...match[j]
                    }
                    tmp.push(tmpData);
                }
            }
            match = [...tmp];
        }
    }
    return match;
}

module.exports = findMatch;