const getFields = () => {
    const counter = document.querySelector('#counter');
    const extSymbol = document.querySelector('#extSymbol');
    const startDate = document.querySelector('#startDate');
    const endDate = document.querySelector('#endDate');
    const year = document.querySelector('#year');
    return {
        counter,
        extSymbol,
        startDate,
        endDate,
        year
    };
}
const setValues = (val) => {

    const {
        extSymbol,
        startDate,
        endDate,
    } = val;
    const symbol = document.querySelector('#symbol');
    const fromDate = document.querySelector('#fromDate');
    const toDate = document.querySelector('#toDate');
	const series = document.querySelector('#series');
    document.querySelector('#rdDateToDate').click();
    symbol.value = extSymbol;
    fromDate.value = startDate;
    toDate.value = endDate;
	series.value = 'EQ';
    document.querySelector('#get').click();
}
const startDownload = () => {
    document.querySelector('.download-data-link a').click()
}
const triggerDownload = async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: startDownload,
    });

}
const setData = async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const {
        extSymbol,
        startDate,
        endDate,
        year
    } = getFields();
    const val = {
        extSymbol: extSymbol.value,
        startDate: startDate.value + '-' + year.value,
        endDate: endDate.value + '-' + year.value,
    }
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: setValues,
        args: [val]
    }, function (res) {
        // alert(JSON.stringify(res))
    });
    chrome.storage.local.set({ symb: extSymbol.value }, function () {
        console.log('Value is set to ' + extSymbol.value);
    });

}

const checkDownloadLink = () => {
    const records = document.querySelectorAll('.alt');
	const numbers = document.querySelectorAll('.number');
    if (records.length === 0) {
        return 'pending';
    } else if (records.length > 1) {
        return 'done';
    } else if (records.length === 1) {
		if(numbers.length){
			return 'done';
		}
        return 'noRecords';
    }

}
const checkDownloadExist = async (cb) => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: checkDownloadLink,
    }, function (res) {
        //alert(JSON.stringify(res))
        //alert(pending)
        if (res[0].result === pending) {
            setTimeout(() => {
                checkDownloadExist(cb)
            }, 2000)
        } else {
            document.querySelector('#status').innerHTML = res[0].result;
            cb(res[0].result)
        }

    });
}

const downloadYearRec = async () => {
    const {
        year,
    } = getFields();
    if (year.value < yearEnd) {
        year.value = parseInt(year.value) + 1;
        setData()
        checkDownloadExist((res) => {
            if (res === done) {
                triggerDownload();
                setTimeout(() => {
                    downloadYearRec();
                }, 2000);
            } else {
                downloadYearRec();
            }
        })
    }
}

const downloadSymbolRec = () => {
    const {
        counter,
        extSymbol
    } = getFields();
    if (counter.value < cmp.length - 1) {
        counter.value = parseInt(counter.value) + 1;
        extSymbol.value = cmp[counter.value];
        setData()
        checkDownloadExist((res) => {
            if (res === done) {
                triggerDownload();
                setTimeout(() => {
                    downloadSymbolRec();
                }, 2000);
            } else {
                downloadSymbolRec();
            }
        })
    }
}
document.querySelector('#defaultValues').addEventListener('click', async () => {
    const {
        counter,
        extSymbol,
        startDate,
        endDate,
        year
    } = getFields();
    counter.value = 0;
    extSymbol.value = cmp[0];
    startDate.value = '02-01';
    endDate.value = '31-12';
    year.value = '1990';
    setData();
});

document.querySelector('#counterInc').addEventListener('click', async () => {
    const {
        counter,
        extSymbol
    } = getFields();
    counter.value = parseInt(counter.value) + 1;
    extSymbol.value = cmp[counter.value];
    // year.value = '1990';
    setData()
});
document.querySelector('#yearInc').addEventListener('click', async () => {
    const {
        year,
    } = getFields();
    year.value = parseInt(year.value) + 1;
    setData()
});
document.querySelector('#yearIncAll').addEventListener('click', async () => {
    const {
        counter,
        extSymbol,
        year,
    } = getFields();
    counter.value = 0;
    extSymbol.value = cmp[0];
    year.value = parseInt(year.value) + 1;
    setData()
});


document.querySelector('#yearIncAllFromCur').addEventListener('click', async () => {
    const {
        counter,
        extSymbol
    } = getFields();
    counter.value = parseInt(counter.value);
    extSymbol.value = cmp[counter.value];
    downloadSymbolRec();
    chrome.downloads.onDeterminingFilename.addListener(function (item, suggest) {
        const {
            year,
        } = getFields();
        suggest({ filename: `data/${year.value}/` + item.filename });
    });
    setData()
});

document.querySelector('#download').addEventListener('click', async () => {
    triggerDownload();


    chrome.downloads.onDeterminingFilename.addListener(function (item, suggest) {
        const {
            year,
        } = getFields();
        suggest({ filename: `data/${year.value}/` + item.filename });
    });

});


document.querySelector('#yearDownload').addEventListener('click', async () => {
    const {
        year,
    } = getFields();
    year.value = year.value - 1;
    downloadYearRec();
    chrome.downloads.onDeterminingFilename.addListener(function (item, suggest) {
        const {
            year,
        } = getFields();
        suggest({ filename: `data/${year.value}/` + item.filename });
    });
});

document.querySelector('#symbolDownload').addEventListener('click', async () => {
    const {
        counter,
    } = getFields();
    counter.value = counter.value - 1;
    downloadSymbolRec();
    chrome.downloads.onDeterminingFilename.addListener(function (item, suggest) {
        const {
            year,
        } = getFields();
        suggest({ filename: `data/${year.value}/` + item.filename });
    });
});