const fs = require('fs');
const { exec } = require('child_process');
let cnt = 0;

const combineJSON = (jsonFiles, i = 0) => {
    if (jsonFiles.length === 0 || i >= jsonFiles.length) return;
    let a;
    let b;
    if (i === 0) {
        a = jsonFiles[i];
        b = jsonFiles[i + 1];
    } else if (i > 0) {
        a = './final.json';
        b = jsonFiles[i];
    }

    exec(`node ./jsonCombine.js ${a} ${b}`, result => {
        i = i === 0 ? (i + 2) : (i + 1);
        combineJSON(jsonFiles, i);
    });

};
fs.readdir('./pages', (err, list) => {
    if (err) console.log("err=" + err.message);
    let jsonFiles = [];
    if (list.length) {
        list.forEach(item => {
            const fileName = `./pages/${item}`;
            const destinaton = `./pages/${item.split('.')[0]}`;
            jsonFiles.push(destinaton + '.json');
            exec(`node ./read.js ${fileName} ${destinaton}`, result => {
                cnt++;
                if (cnt === list.length) {
                    combineJSON(jsonFiles);
                }
            });
        });
    }
});