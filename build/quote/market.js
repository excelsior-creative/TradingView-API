"use strict";
/**
 * @typedef {'loaded' | 'data' | 'error'} MarketEvent
 */
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
/**
 * @param {import('./session').QuoteSessionBridge} quoteSession
 */
module.exports = (quoteSession) => { var _QuoteMarket_instances, _QuoteMarket_symbolListeners, _QuoteMarket_symbol, _QuoteMarket_symbolListenerID, _QuoteMarket_lastData, _QuoteMarket_callbacks, _QuoteMarket_handleEvent, _QuoteMarket_handleError, _a; return _a = class QuoteMarket {
        /**
         * @param {string} symbol Market symbol (like: 'BTCEUR' or 'KRAKEN:BTCEUR')
         */
        constructor(symbol) {
            _QuoteMarket_instances.add(this);
            _QuoteMarket_symbolListeners.set(this, quoteSession.symbolListeners);
            _QuoteMarket_symbol.set(this, void 0);
            _QuoteMarket_symbolListenerID.set(this, 0);
            _QuoteMarket_lastData.set(this, {});
            _QuoteMarket_callbacks.set(this, {
                loaded: [],
                data: [],
                event: [],
                error: [],
            });
            __classPrivateFieldSet(this, _QuoteMarket_symbol, symbol, "f");
            if (!__classPrivateFieldGet(this, _QuoteMarket_symbolListeners, "f")[symbol]) {
                __classPrivateFieldGet(this, _QuoteMarket_symbolListeners, "f")[symbol] = [];
                quoteSession.send('quote_add_symbols', [
                    quoteSession.sessionID,
                    symbol,
                ]);
            }
            __classPrivateFieldSet(this, _QuoteMarket_symbolListenerID, __classPrivateFieldGet(this, _QuoteMarket_symbolListeners, "f")[symbol].length, "f");
            __classPrivateFieldGet(this, _QuoteMarket_symbolListeners, "f")[symbol][__classPrivateFieldGet(this, _QuoteMarket_symbolListenerID, "f")] = (packet) => {
                if (global.TW_DEBUG)
                    console.log('§90§30§105 MARKET §0 DATA', packet);
                if (packet.type === 'qsd' && packet.data[1].s === 'ok') {
                    __classPrivateFieldSet(this, _QuoteMarket_lastData, Object.assign(Object.assign({}, __classPrivateFieldGet(this, _QuoteMarket_lastData, "f")), packet.data[1].v), "f");
                    __classPrivateFieldGet(this, _QuoteMarket_instances, "m", _QuoteMarket_handleEvent).call(this, 'data', __classPrivateFieldGet(this, _QuoteMarket_lastData, "f"));
                    return;
                }
                if (packet.type === 'quote_completed') {
                    __classPrivateFieldGet(this, _QuoteMarket_instances, "m", _QuoteMarket_handleEvent).call(this, 'loaded');
                    return;
                }
                if (packet.type === 'qsd' && packet.data[1].s === 'error') {
                    __classPrivateFieldGet(this, _QuoteMarket_instances, "m", _QuoteMarket_handleError).call(this, 'Market error', packet.data);
                }
            };
        }
        /**
         * When quote market is loaded
         * @param {() => void} cb Callback
         * @event
         */
        onLoaded(cb) {
            __classPrivateFieldGet(this, _QuoteMarket_callbacks, "f").loaded.push(cb);
        }
        /**
         * When quote data is received
         * @param {(data: {}) => void} cb Callback
         * @event
         */
        onData(cb) {
            __classPrivateFieldGet(this, _QuoteMarket_callbacks, "f").data.push(cb);
        }
        /**
         * When quote event happens
         * @param {(...any) => void} cb Callback
         * @event
         */
        onEvent(cb) {
            __classPrivateFieldGet(this, _QuoteMarket_callbacks, "f").event.push(cb);
        }
        /**
         * When quote error happens
         * @param {(...any) => void} cb Callback
         * @event
         */
        onError(cb) {
            __classPrivateFieldGet(this, _QuoteMarket_callbacks, "f").error.push(cb);
        }
        /** Close this listener */
        close() {
            if (__classPrivateFieldGet(this, _QuoteMarket_symbolListeners, "f")[__classPrivateFieldGet(this, _QuoteMarket_symbol, "f")].length <= 1) {
                quoteSession.send('quote_remove_symbols', [
                    quoteSession.sessionID,
                    __classPrivateFieldGet(this, _QuoteMarket_symbol, "f"),
                ]);
            }
            delete __classPrivateFieldGet(this, _QuoteMarket_symbolListeners, "f")[__classPrivateFieldGet(this, _QuoteMarket_symbol, "f")][__classPrivateFieldGet(this, _QuoteMarket_symbolListenerID, "f")];
        }
    },
    _QuoteMarket_symbolListeners = new WeakMap(),
    _QuoteMarket_symbol = new WeakMap(),
    _QuoteMarket_symbolListenerID = new WeakMap(),
    _QuoteMarket_lastData = new WeakMap(),
    _QuoteMarket_callbacks = new WeakMap(),
    _QuoteMarket_instances = new WeakSet(),
    _QuoteMarket_handleEvent = function _QuoteMarket_handleEvent(ev, ...data) {
        __classPrivateFieldGet(this, _QuoteMarket_callbacks, "f")[ev].forEach((e) => e(...data));
        __classPrivateFieldGet(this, _QuoteMarket_callbacks, "f").event.forEach((e) => e(ev, ...data));
    },
    _QuoteMarket_handleError = function _QuoteMarket_handleError(...msgs) {
        if (__classPrivateFieldGet(this, _QuoteMarket_callbacks, "f").error.length === 0)
            console.error(...msgs);
        else
            __classPrivateFieldGet(this, _QuoteMarket_instances, "m", _QuoteMarket_handleEvent).call(this, 'error', ...msgs);
    },
    _a; };
