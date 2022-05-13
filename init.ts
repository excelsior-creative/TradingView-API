import {
  APIGatewayProxyEvent,
  Callback,
  Context,
  Handler
} from 'aws-lambda';
import * as dotenv from 'dotenv';
import { formatDate } from './lib/utils';

const TradingView = require('./main');
const threeCommasAPI = require('3commas-api-node');

dotenv.config()

let session: any = null;
let api: any = null;

const init = async () => {

  session = await TradingView.loginUser(
    process.env.TRADINGVIEW_USERNAME!,
    process.env.TRADINGVIEW_PASSWORD!
  );
  console.log("session", session)

  api = new threeCommasAPI({
    apiKey: process.env.THREECOMMAS_APIKEY!,
    apiSecret: process.env.THREECOMMAS_SECRET!
  });

  console.log("api", api)

  await executeStrategy();
};

init();

const executeStrategy = async (currentDirection?: string) => {
  try {
    console.log(formatDate(new Date()) + ': Execute strategy...')

    // get accounts from 3commas
    // get all accounts from 3commas
    const accounts = await api.accounts();

    accounts.map((account: any) => {
      const balance = (Math.round(account.primary_display_currency_amount.amount * 100) / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
      console.log(`Account: ${account.name}, Balance: ${balance}`)
    });

    const newDirection: any = await setupPriceInfo();

    // get open positions from 3commas

    // get macd indicators for each position

    // get rsi identifiers for each position

    // check for cross overs

    // implement
    setTimeout(async () => { await executeStrategy(newDirection) }, 1000 * 60)

  } catch (e) {
    console.log(e)
  }
};

const setupPriceInfo = async () => {

  const client = new TradingView.Client({
    token: session.session
  });

  const chart = new client.Session.Chart();
  chart.setTimezone('America/Los_Angeles');

  chart.setMarket('BINANCEUS:BTCUSD', {
    timeframe: '60',
    range: 26,
  });

  chart.onSymbolLoaded(() => {
    console.log(chart.infos.name, 'loaded !');
  });

  const chartUpdatePromise = new Promise((resolve, reject) => {
    chart.onUpdate(() => {
      console.log('OK', chart.periods);

      const ema12 = (chart.periods.slice(0, 12).map((d: any) => d.close).reduce((a: any, b: any) => a + b, 0)) / 12;
      const ema26 = (chart.periods.slice(0, 26).map((d: any) => d.close).reduce((a: any, b: any) => a + b, 0)) / 26;

      const direction = ema12 > ema26 ? 'long' : 'short';
      console.log(direction, ema12, ema26);
      client.end();
      resolve(direction);
    });
  });

  return await chartUpdatePromise;

};