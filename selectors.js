const removeSelectors = ['Price to Earning', 'Dividend yield', 'Net Profit latest quarter', 'YOY Quarterly sales growth', 'YOY Quarterly profit growth', 'Sales latest quarter', 'Return on capital employed'];
const cols = [
    ['Price to Earning', 'PEG Ratio', 'Price to Sales', 'Price to Free Cash Flow', 'Price to Cash Flow', 'EVEBITDA', 'Interest Coverage Ratio', 'Debt to equity', 'Current ratio', 'Free cash flow last year', 'Free cash flow preceding year', 'Free cash flow 3years', 'Free cash flow 5years'],

    ['Return on equity', 'Return on equity preceding year', 'Average return on equity 3Years', 'Average return on equity 5Years', 'Return on capital employed', 'Return on capital employed preceding year', 'Average return on capital employed 3Years'],



    ['Average return on capital employed 5Years', 'Sales growth', 'YOY Quarterly sales growth', 'Sales growth 3Years', 'Sales growth 5Years', 'EPS', 'EPS last year', 'EPS preceding year', 'EPS latest quarter', 'EPS preceding quarter', 'EPS preceding year quarter', 'Dividend yield', 'Dividend Payout Ratio'],
    ['Return on assets', 'Return on assets preceding year', 'Return on assets 3years', 'Return on assets 5years', 'Altman Z Score', 'G Factor'],
    ['OPM', 'OPM last year', 'OPM preceding year', 'OPM latest quarter', 'OPM preceding quarter', 'OPM preceding year quarter'],
    ['NPM last year', 'NPM preceding year', 'NPM latest quarter', 'NPM preceding quarter', 'NPM preceding year quarter']
]


module.exports = {
    removeSelectors,
    cols
}