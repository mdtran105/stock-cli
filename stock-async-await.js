const axios = require('axios');
const yargs = require('yargs');
const xl = require('excel4node');

const argv = yargs
  .options({
    symbol: {
      demand: true,
      alias: 'symbol',
      describe: 'Enter Stock symbol',
    },
  })
  .help()
  .alias('symbol', 's').argv;

const symbol = argv.symbol;

const output = {};

async function findStock(stockCode) {
  const response = await axios.request({
    method: 'GET',
    url: "https://iboard-api.ssi.com.vn/statistics/charts/defaultAllStocksV2",
    headers: {
      'User-Agent': 'Mozilla/5.0',
    },
  });

  const data = response.data.data;
  const stock = data.find((stock) => stock.code === stockCode);

  if (!stock) {
    throw new Error('Stock not found');
  }

  output.information = stock;

  return Promise.all([
    axios.request({
      method: 'GET',
      url: `https://iboard-api.ssi.com.vn/statistics/company/company-profile?symbol=${stockCode}&language=vn`,
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    }),
    axios.request({
      method: 'GET',
      url: `https://iboard-query.ssi.com.vn/v2/stock/exchange/${stock.exchange}`,
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    }),
  ]);


}

async function getStockInfo() {
  try {
    const [companyProfileResponse, exchange] = await findStock(symbol);
    const stockMarketObj = exchange.data.data.find((stock) => stock.ss === symbol);

    const companyProfile = companyProfileResponse.data.data;
    if (!companyProfile) {
      throw new Error(`Company ${symbol} does not exist`);
    }

    output.companyProfile = companyProfile;
    output.market = {
      price: stockMarketObj.mp,
      change: stockMarketObj.pc
    };

    const wb = new xl.Workbook();
    const stockWs = wb.addWorksheet('Stock Info');
    const companyWs = wb.addWorksheet('Company Info');
    const marketWs = wb.addWorksheet('Market Info');

    stockWs.column(1).setWidth(30);
    stockWs.column(2).setWidth(60);
    companyWs.column(1).setWidth(30);
    companyWs.column(2).setWidth(60);
    marketWs.column(1).setWidth(30);
    marketWs.column(2).setWidth(30);

    const populateWorksheet = (worksheet, data, title) => {
      worksheet.cell(1, 1).string(title).style({
        font: {
          bold: true,
        },
      });

      var style = wb.createStyle({
        alignment: {
          shrinkToFit: true,
          wrapText: true
        },
        numberFormat: '$#,##0.00; ($#,##0.00); -',
      });

      let row = 2;
      for (const [key, value] of Object.entries(data)) {
        worksheet.cell(row, 1).string(key).style(style);
        if (typeof value === 'number') {
          worksheet.cell(row, 2).number(value).style(style);
        } else if (value === null) {
          worksheet.cell(row, 2).string('');
        } else {
          worksheet.cell(row, 2).string(value).style(style);
        }
        row++;
      }
    };

    populateWorksheet(stockWs, output.information, 'Stock Information');
    populateWorksheet(companyWs, output.companyProfile, 'Company Profile');
    populateWorksheet(marketWs, output.market, 'Market Information');

    wb.write('StockInfo.xlsx');

  } catch (error) {
    console.log(error);
    throw new Error('Error');
  }
}

getStockInfo();