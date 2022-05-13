"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
const { genSessionID } = require('../utils');
const quoteMarketConstructor = require('./market');
/** @typedef {Object<string, Function[]>} SymbolListeners */
/**
 * @typedef {Object} QuoteSessionBridge
 * @prop {string} sessionID
 * @prop {SymbolListeners} symbolListeners
 * @prop {import('../client').SendPacket} send
*/
/**
 * @typedef {'base-currency-logoid'
 * | 'ch' | 'chp' | 'currency-logoid' | 'provider_id'
 * | 'currency_code' | 'current_session' | 'description'
 * | 'exchange' | 'format' | 'fractional' | 'is_tradable'
 * | 'language' | 'local_description' | 'logoid' | 'lp'
 * | 'lp_time' | 'minmov' | 'minmove2' | 'original_name'
 * | 'pricescale' | 'pro_name' | 'short_name' | 'type'
 * | 'update_mode' | 'volume' | 'ask' | 'bid' | 'fundamentals'
 * | 'high_price' | 'low_price' | 'open_price' | 'prev_close_price'
 * | 'rch' | 'rchp' | 'rtc' | 'rtc_time' | 'status' | 'industry'
 * | 'basic_eps_net_income' | 'beta_1_year' | 'market_cap_basic'
 * | 'earnings_per_share_basic_ttm' | 'price_earnings_ttm'
 * | 'sector' | 'dividends_yield' | 'timezone' | 'country_code'
 * } quoteField Quote data field
 */
/** @param {'all' | 'price'} fieldsType */
function getQuoteFields(fieldsType) {
    if (fieldsType === 'price') {
        return ['lp'];
    }
    return [
        'base-currency-logoid', 'ch', 'chp', 'currency-logoid',
        'currency_code', 'current_session', 'description',
        'exchange', 'format', 'fractional', 'is_tradable',
        'language', 'local_description', 'logoid', 'lp',
        'lp_time', 'minmov', 'minmove2', 'original_name',
        'pricescale', 'pro_name', 'short_name', 'type',
        'update_mode', 'volume', 'ask', 'bid', 'fundamentals',
        'high_price', 'low_price', 'open_price', 'prev_close_price',
        'rch', 'rchp', 'rtc', 'rtc_time', 'status', 'industry',
        'basic_eps_net_income', 'beta_1_year', 'market_cap_basic',
        'earnings_per_share_basic_ttm', 'price_earnings_ttm',
        'sector', 'dividends_yield', 'timezone', 'country_code',
        'provider_id',
    ];
}
/**
 * @param {import('../client').ClientBridge} client
 */
module.exports = (client) => { var _QuoteSession_sessionID, _QuoteSession_client, _QuoteSession_symbolListeners, _QuoteSession_quoteSession, _a; return _a = class QuoteSession {
        /**
         * @typedef {Object} quoteSessionOptions Quote Session options
         * @prop {'all' | 'price'} [fields] Asked quote fields
         * @prop {quoteField[]} [customFields] List of asked quote fields
         */
        /**
         * @param {quoteSessionOptions} options Quote settings options
         */
        constructor(options = {}) {
            _QuoteSession_sessionID.set(this, genSessionID('qs'));
            /** Parent client */
            _QuoteSession_client.set(this, client);
            /** @type {SymbolListeners} */
            _QuoteSession_symbolListeners.set(this, {});
            /** @type {QuoteSessionBridge} */
            _QuoteSession_quoteSession.set(this, {
                sessionID: __classPrivateFieldGet(this, _QuoteSession_sessionID, "f"),
                symbolListeners: __classPrivateFieldGet(this, _QuoteSession_symbolListeners, "f"),
                send: (t, p) => __classPrivateFieldGet(this, _QuoteSession_client, "f").send(t, p),
            });
            /** @constructor */
            this.Market = quoteMarketConstructor(__classPrivateFieldGet(this, _QuoteSession_quoteSession, "f"));
            __classPrivateFieldGet(this, _QuoteSession_client, "f").sessions[__classPrivateFieldGet(this, _QuoteSession_sessionID, "f")] = {
                type: 'quote',
                onData: (packet) => {
                    if (global.TW_DEBUG)
                        console.log('§90§30§102 QUOTE SESSION §0 DATA', packet);
                    if (packet.type === 'quote_completed') {
                        const symbol = packet.data[1];
                        if (!__classPrivateFieldGet(this, _QuoteSession_symbolListeners, "f")[symbol]) {
                            __classPrivateFieldGet(this, _QuoteSession_client, "f").send('quote_remove_symbols', [__classPrivateFieldGet(this, _QuoteSession_sessionID, "f"), symbol]);
                            return;
                        }
                        __classPrivateFieldGet(this, _QuoteSession_symbolListeners, "f")[symbol].forEach((h) => h(packet));
                    }
                    if (packet.type === 'qsd') {
                        const symbol = packet.data[1].n;
                        if (!__classPrivateFieldGet(this, _QuoteSession_symbolListeners, "f")[symbol]) {
                            __classPrivateFieldGet(this, _QuoteSession_client, "f").send('quote_remove_symbols', [__classPrivateFieldGet(this, _QuoteSession_sessionID, "f"), symbol]);
                            return;
                        }
                        __classPrivateFieldGet(this, _QuoteSession_symbolListeners, "f")[symbol].forEach((h) => h(packet));
                    }
                },
            };
            const fields = (options.customFields && options.customFields.length > 0
                ? options.customFields
                : getQuoteFields(options.fields));
            __classPrivateFieldGet(this, _QuoteSession_client, "f").send('quote_create_session', [__classPrivateFieldGet(this, _QuoteSession_sessionID, "f")]);
            __classPrivateFieldGet(this, _QuoteSession_client, "f").send('quote_set_fields', [__classPrivateFieldGet(this, _QuoteSession_sessionID, "f"), ...fields]);
        }
        /** Delete the quote session */
        delete() {
            __classPrivateFieldGet(this, _QuoteSession_client, "f").send('quote_delete_session', [__classPrivateFieldGet(this, _QuoteSession_sessionID, "f")]);
            delete __classPrivateFieldGet(this, _QuoteSession_client, "f").sessions[__classPrivateFieldGet(this, _QuoteSession_sessionID, "f")];
        }
    },
    _QuoteSession_sessionID = new WeakMap(),
    _QuoteSession_client = new WeakMap(),
    _QuoteSession_symbolListeners = new WeakMap(),
    _QuoteSession_quoteSession = new WeakMap(),
    _a; };
