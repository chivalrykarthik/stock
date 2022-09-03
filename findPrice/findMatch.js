const { cols } = require('./constants');
require('dotenv').config();

const PERCENTAGE_VARIANCE = parseInt(process.env.PERCENTAGE_VARIANCE);
const isMatchExist = (src, dt) => {
    if (src['Symbol'] === "EICHERMOT") {
        console.log("==============================")
    }
    return cols.every((col) => {
        if (src[col] === '-' || dt[col] === '-') return true;
        const upperLimit = +src[col] + PERCENTAGE_VARIANCE;
        const lowerLimit = src[col] - PERCENTAGE_VARIANCE;
        if (src['Symbol'] === "EICHERMOT" && (dt[col] >= lowerLimit && dt[col] <= upperLimit)) {
            console.log("col=====" + col)
            console.log("src[col]=====" + src[col])
            console.log("dt[col]=====" + dt[col])
            console.log("lowerLimit=====" + lowerLimit)
            console.log("upperLimit=====" + upperLimit)
        }

        return (dt[col] >= lowerLimit && dt[col] <= upperLimit)
    })

}
const findMatch = (source, data) => {
    if (!source.length || !data.length) return [];
    const src = JSON.parse(JSON.stringify(source));
    const dt = JSON.parse(JSON.stringify(data));
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
                    let tmp = {
                        index: j,
                        data: dt[j],
                        nextRow: dt[j + 1],
                        projOpen: (+revSrc[i]['Open Price'] + projOpenPer),
                        projClose: (+revSrc[i]['Close Price'] + projClosePer),
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