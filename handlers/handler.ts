import {
  APIGatewayProxyEvent,
  Callback,
  Context,
  Handler
} from 'aws-lambda';
import * as TradingView from '../main';
import * as dotenv from 'dotenv';
dotenv.config()

export const handler: Handler = async (event: APIGatewayProxyEvent, context?: Context, callback?: Callback): Promise<any> => {
  try {

    const session: any = await TradingView.loginUser(
      process.env.TRADINGVIEW_USERNAME!,
      process.env.TRADINGVIEW_PASSWORD!
    )
    console.log("session", session)

    return {
      statusCode: 200,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Credentials': 'false',
        'Access-Control-Allow-Methods': '*'
      },
      body: JSON.stringify({ success: true, message: 'Operation completed successfully' })
    };
  } catch (e: any) {
    console.error(e);
  }
};


const executeStrategy = async () => {
  try {

    // get accounts from 3commas

    // get open positions from 3commas

    // get macd indicators for each position

    // get rsi identifiers for each position

    // check for cross overs

    // implement

  } catch (e) {
    console.log(e)
  }
};


// make the call if run directly
if (
  process.argv.includes(__filename)
) {
  (async () => {
    handler({} as unknown, {} as Context, (resp: any) => {
      console.log(JSON.stringify(resp, null, 2));
      return resp;
    });
  })();
}

