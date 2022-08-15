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

    const t = val[0];
    const {
        extSymbol,
        startDate,
        endDate,
    } = val;
    const symbol = document.querySelector('#symbol');
    const fromDate = document.querySelector('#fromDate');
    const toDate = document.querySelector('#toDate');
    document.querySelector('#rdDateToDate').click();
    symbol.value = extSymbol;
    fromDate.value = startDate;
    toDate.value = endDate;
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
    });
    chrome.storage.local.set({ symb: extSymbol.value }, function () {
        console.log('Value is set to ' + extSymbol.value);
    });

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
        extSymbol,
    } = getFields();
    counter.value = parseInt(counter.value) + 1;
    extSymbol.value = cmp[counter.value];
    setData()
});
document.querySelector('#yearInc').addEventListener('click', async () => {
    const {
        year,
    } = getFields();
    year.value = parseInt(year.value) + 1;
    setData()
});

document.querySelector('#download').addEventListener('click', async () => {
    triggerDownload(true);
    const {
        extSymbol,
    } = getFields();

    chrome.downloads.onDeterminingFilename.addListener(function (item, suggest) {
        suggest({ filename: `data/${extSymbol.value}/` + item.filename });
    });
});
