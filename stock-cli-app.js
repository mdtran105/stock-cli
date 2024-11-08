const axios = require('axios');
const yargs = require('yargs');

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

axios.request({
  method: 'GET',
  url: "https://iboard-api.ssi.com.vn/statistics/charts/defaultAllStocksV2",
  headers: {
    'User-Agent': 'Mozilla/5.0',
  },
})
.then((response) => {
  const data = response.data.data;
  const stock = data.find((stock) => stock.code === symbol);

  if(!stock) {
    throw new Error('Stock not found');
  }

  output.information = stock;
  
  return Promise.all([
    axios.request({
      method: 'GET',
      url: `https://iboard-api.ssi.com.vn/statistics/company/company-profile?symbol=${symbol}&language=vn`,
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
  ])
})
.then(res => {
  const [companyProfileResponse, exchange] = res;
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

  console.log(output);
})
.catch((error) => {
  console.log(error);
  throw new Error('Error');
});