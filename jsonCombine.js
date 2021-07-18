const fs = require('fs');
const aName = process.argv[2] || './1.json';
const bName = process.argv[3] || './2.json';
const a = require(aName);
const b = require(bName);

const newAr = a.map((v, key) => {
    let f = v.filters;
    let bf = Object.keys(b[key].filters);
    bf.forEach((val) => {
        if (!f[val]) {
            f[val] = b[key].filters[val];
        }
    });
    return v;
})
fs.writeFile('final.json', JSON.stringify(newAr), (err) => {
    if (err) {
        console.log("Error in writting file");
        return;
    }
    console.log("Final JSON created");
});