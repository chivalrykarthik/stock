const { cols } = require('./constants');
require('dotenv').config();

const PERCENTAGE_VARIANCE = parseInt(process.env.PERCENTAGE_VARIANCE);
const isMatchExist = (src, dt) => {
    return cols.every((col) => {
        if (src[col] === '-' || dt[col] === '-') return true;
        const upperLimit = +src[col] + PERCENTAGE_VARIANCE;
        const lowerLimit = src[col] - PERCENTAGE_VARIANCE;
        return (dt[col] >= lowerLimit && dt[col] <= upperLimit)
    })
}
const findMatch = (source, data) => {
    if (!source.length || !data.length) return [];
    const src = JSON.stringify(JSON.parse(source));
    const dt = JSON.stringify(JSON.parse(data));
    const revSrc = src.reverse();
    let match = [];
    for (let i = 0; i <= revSrc.length - 1; i++) {
        if (i === 0) {
            // dt.length - 2 - to exclude last record in all files
            for (let j = 0; j <= dt.length - 2; j++) {
                if (isMatchExist(revSrc[i], dt[j])) {
                    match.push(j)
                }
            }
        } else if (i > 0 && match.length) {
            let tmp = [];
            for (let j = 0; j <= match.length - 1; j++) {
                const matchIndex = match[j];
                const prevIndex = matchIndex - i;

                if (isMatchExist(revSrc[i], dt[prevIndex])) {
                    tmp.push(matchIndex);
                }
            }
            match = [...tmp];
        }
    }
    return match;
}

module.exports = findMatch;