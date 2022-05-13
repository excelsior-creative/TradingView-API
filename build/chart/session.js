"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
const { genSessionID } = require('../utils');
const studyConstructor = require('./study');
/**
 * @typedef {'HeikinAshi' | 'Renko' | 'LineBreak' | 'Kagi' | 'PointAndFigure'
 *  | 'Range'} ChartType Custom chart type
 */
const ChartTypes = {
    HeikinAshi: 'BarSetHeikenAshi@tv-basicstudies-60!',
    Renko: 'BarSetRenko@tv-prostudies-40!',
    LineBreak: 'BarSetPriceBreak@tv-prostudies-34!',
    Kagi: 'BarSetKagi@tv-prostudies-34!',
    PointAndFigure: 'BarSetPnF@tv-prostudies-34!',
    Range: 'BarSetRange@tv-basicstudies-72!',
};
/**
 * @typedef {Object} ChartInputs Custom chart type
 * @prop {number} [atrLength] Renko/Kagi/PointAndFigure ATR length
 * @prop {'open' | 'high' | 'low' | 'close' | 'hl2'
 *  | 'hlc3' | 'ohlc4'} [source] Renko/LineBreak/Kagi source
 * @prop {'ATR' | string} [style] Renko/Kagi/PointAndFigure style
 * @prop {number} [boxSize] Renko/PointAndFigure box size
 * @prop {number} [reversalAmount] Kagi/PointAndFigure reversal amount
 * @prop {'Close'} [sources] Renko/PointAndFigure sources
 * @prop {boolean} [wicks] Renko wicks
 * @prop {number} [lb] LineBreak Line break
 * @prop {boolean} [oneStepBackBuilding] PointAndFigure oneStepBackBuilding
 * @prop {boolean} [phantomBars] Range phantom bars
 * @prop {boolean} [range] Range range
 */
/** @typedef {Object<string, Function[]>} StudyListeners */
/**
 * @typedef {Object} ChartSessionBridge
 * @prop {string} sessionID
 * @prop {StudyListeners} studyListeners
 * @prop {Object<number, number>} indexes
 * @prop {import('../client').SendPacket} send
*/
/**
 * @typedef {'seriesLoaded' | 'symbolLoaded' | 'update' | 'error'} ChartEvent
 */
/**
 * @typedef {Object} PricePeriod
 * @prop {number} time Period timestamp
 * @prop {number} open Period open value
 * @prop {number} close Period close value
 * @prop {number} max Period max value
 * @prop {number} min Period min value
 * @prop {number} volume Period volume value
 */
/**
 * @typedef {Object} Subsession
 * @prop {string} id Subsession ID (ex: 'regular')
 * @prop {string} description Subsession description (ex: 'Regular')
 * @prop {boolean} private If private
 * @prop {string} session Session (ex: '24x7')
 * @prop {string} session-correction Session correction
 * @prop {string} session-display Session display (ex: '24x7')
 */
/**
 * @typedef {Object} MarketInfos
 * @prop {string} series_id            Used series (ex: 'ser_1')
 * @prop {string} base_currency        Base currency (ex: 'BTC')
 * @prop {string} base_currency_id     Base currency ID (ex: 'XTVCBTC')
 * @prop {string} name                 Market short name (ex: 'BTCEUR')
 * @prop {string} full_name            Market full name (ex: 'COINBASE:BTCEUR')
 * @prop {string} pro_name             Market pro name (ex: 'COINBASE:BTCEUR')
 * @prop {string} description          Market symbol description (ex: 'BTC/EUR')
 * @prop {string} short_description    Market symbol short description (ex: 'BTC/EUR')
 * @prop {string} exchange             Market exchange (ex: 'COINBASE')
 * @prop {string} listed_exchange      Market exchange (ex: 'COINBASE')
 * @prop {string} provider_id          Values provider ID (ex: 'coinbase')
 * @prop {string} currency_id          Used currency ID (ex: 'EUR')
 * @prop {string} currency_code        Used currency code (ex: 'EUR')
 * @prop {string} variable_tick_size   Variable tick size
 * @prop {number} pricescale           Price scale
 * @prop {number} pointvalue           Point value
 * @prop {string} session              Session (ex: '24x7')
 * @prop {string} session_display      Session display (ex: '24x7')
 * @prop {string} type                 Market type (ex: 'crypto')
 * @prop {boolean} has_intraday        If intraday values are available
 * @prop {boolean} fractional          If market is fractional
 * @prop {boolean} is_tradable         If the market is curently tradable
 * @prop {number} minmov               Minimum move value
 * @prop {number} minmove2             Minimum move value 2
 * @prop {string} timezone             Used timezone
 * @prop {boolean} is_replayable       If the replay mode is available
 * @prop {boolean} has_adjustment      If the adjustment mode is enabled
 * @prop {boolean} has_extended_hours  Has extended hours
 * @prop {string} bar_source           Bar source
 * @prop {string} bar_transform        Bar transform
 * @prop {boolean} bar_fillgaps        Bar fill gaps
 * @prop {string} allowed_adjustment   Allowed adjustment (ex: 'none')
 * @prop {string} subsession_id        Subsession ID (ex: 'regular')
 * @prop {string} pro_perm             Pro permission (ex: '')
 * @prop {[]} base_name                Base name (ex: ['COINBASE:BTCEUR'])
 * @prop {[]} legs                     Legs (ex: ['COINBASE:BTCEUR'])
 * @prop {Subsession[]} subsessions    Sub sessions
 * @prop {[]} typespecs                Typespecs (ex: [])
 * @prop {[]} resolutions              Resolutions (ex: [])
 * @prop {[]} aliases                  Aliases (ex: [])
 * @prop {[]} alternatives             Alternatives (ex: [])
 */
/**
 * @param {import('../client').ClientBridge} client
 */
module.exports = (client) => { var _ChartSession_instances, _ChartSession_chartSessionID, _ChartSession_replaySessionID, _ChartSession_replayMode, _ChartSession_replayOKCB, _ChartSession_client, _ChartSession_studyListeners, _ChartSession_periods, _ChartSession_infos, _ChartSession_callbacks, _ChartSession_handleEvent, _ChartSession_handleError, _ChartSession_seriesCreated, _ChartSession_currentSeries, _ChartSession_chartSession, _a; return _a = class ChartSession {
        constructor() {
            _ChartSession_instances.add(this);
            _ChartSession_chartSessionID.set(this, genSessionID('cs'));
            _ChartSession_replaySessionID.set(this, genSessionID('rs'));
            _ChartSession_replayMode.set(this, false);
            /** @type {Object<string, (): any>} */
            _ChartSession_replayOKCB.set(this, {});
            /** Parent client */
            _ChartSession_client.set(this, client);
            /** @type {StudyListeners} */
            _ChartSession_studyListeners.set(this, {});
            /**
             * Table of periods values indexed by timestamp
             * @type {Object<number, PricePeriod[]>}
             */
            _ChartSession_periods.set(this, {});
            /**
             * Current market infos
             * @type {MarketInfos}
             */
            _ChartSession_infos.set(this, {});
            _ChartSession_callbacks.set(this, {
                seriesLoaded: [],
                symbolLoaded: [],
                update: [],
                replayLoaded: [],
                replayPoint: [],
                replayResolution: [],
                replayEnd: [],
                event: [],
                error: [],
            });
            _ChartSession_seriesCreated.set(this, false);
            _ChartSession_currentSeries.set(this, 0);
            /** @type {ChartSessionBridge} */
            _ChartSession_chartSession.set(this, {
                sessionID: __classPrivateFieldGet(this, _ChartSession_chartSessionID, "f"),
                studyListeners: __classPrivateFieldGet(this, _ChartSession_studyListeners, "f"),
                indexes: {},
                send: (t, p) => __classPrivateFieldGet(this, _ChartSession_client, "f").send(t, p),
            });
            this.Study = studyConstructor(__classPrivateFieldGet(this, _ChartSession_chartSession, "f"));
            __classPrivateFieldGet(this, _ChartSession_client, "f").sessions[__classPrivateFieldGet(this, _ChartSession_chartSessionID, "f")] = {
                type: 'chart',
                onData: (packet) => {
                    if (global.TW_DEBUG)
                        console.log('§90§30§106 CHART SESSION §0 DATA', packet);
                    if (typeof packet.data[1] === 'string' && __classPrivateFieldGet(this, _ChartSession_studyListeners, "f")[packet.data[1]]) {
                        __classPrivateFieldGet(this, _ChartSession_studyListeners, "f")[packet.data[1]](packet);
                        return;
                    }
                    if (packet.type === 'symbol_resolved') {
                        __classPrivateFieldSet(this, _ChartSession_infos, Object.assign({ series_id: packet.data[1] }, packet.data[2]), "f");
                        __classPrivateFieldGet(this, _ChartSession_instances, "m", _ChartSession_handleEvent).call(this, 'symbolLoaded');
                        return;
                    }
                    if (['timescale_update', 'du'].includes(packet.type)) {
                        const changes = [];
                        Object.keys(packet.data[1]).forEach((k) => {
                            changes.push(k);
                            if (k === '$prices') {
                                const periods = packet.data[1].$prices;
                                if (!periods || !periods.s)
                                    return;
                                periods.s.forEach((p) => {
                                    [__classPrivateFieldGet(this, _ChartSession_chartSession, "f").indexes[p.i]] = p.v;
                                    __classPrivateFieldGet(this, _ChartSession_periods, "f")[p.v[0]] = {
                                        time: p.v[0],
                                        open: p.v[1],
                                        close: p.v[4],
                                        max: p.v[2],
                                        min: p.v[3],
                                        volume: Math.round(p.v[5] * 100) / 100,
                                    };
                                });
                                return;
                            }
                            if (__classPrivateFieldGet(this, _ChartSession_studyListeners, "f")[k])
                                __classPrivateFieldGet(this, _ChartSession_studyListeners, "f")[k](packet);
                        });
                        __classPrivateFieldGet(this, _ChartSession_instances, "m", _ChartSession_handleEvent).call(this, 'update', changes);
                        return;
                    }
                    if (packet.type === 'symbol_error') {
                        __classPrivateFieldGet(this, _ChartSession_instances, "m", _ChartSession_handleError).call(this, `(${packet.data[1]}) Symbol error:`, packet.data[2]);
                        return;
                    }
                    if (packet.type === 'series_error') {
                        __classPrivateFieldGet(this, _ChartSession_instances, "m", _ChartSession_handleError).call(this, 'Series error:', packet.data[3]);
                        return;
                    }
                    if (packet.type === 'critical_error') {
                        const [, name, description] = packet.data;
                        __classPrivateFieldGet(this, _ChartSession_instances, "m", _ChartSession_handleError).call(this, 'Critical error:', name, description);
                    }
                },
            };
            __classPrivateFieldGet(this, _ChartSession_client, "f").sessions[__classPrivateFieldGet(this, _ChartSession_replaySessionID, "f")] = {
                type: 'replay',
                onData: (packet) => {
                    if (global.TW_DEBUG)
                        console.log('§90§30§106 REPLAY SESSION §0 DATA', packet);
                    if (packet.type === 'replay_ok') {
                        if (__classPrivateFieldGet(this, _ChartSession_replayOKCB, "f")[packet.data[1]]) {
                            __classPrivateFieldGet(this, _ChartSession_replayOKCB, "f")[packet.data[1]]();
                            delete __classPrivateFieldGet(this, _ChartSession_replayOKCB, "f")[packet.data[1]];
                        }
                        return;
                    }
                    if (packet.type === 'replay_instance_id') {
                        __classPrivateFieldGet(this, _ChartSession_instances, "m", _ChartSession_handleEvent).call(this, 'replayLoaded', packet.data[1]);
                        return;
                    }
                    if (packet.type === 'replay_point') {
                        __classPrivateFieldGet(this, _ChartSession_instances, "m", _ChartSession_handleEvent).call(this, 'replayPoint', packet.data[1]);
                        return;
                    }
                    if (packet.type === 'replay_resolutions') {
                        __classPrivateFieldGet(this, _ChartSession_instances, "m", _ChartSession_handleEvent).call(this, 'replayResolution', packet.data[1], packet.data[2]);
                        return;
                    }
                    if (packet.type === 'replay_data_end') {
                        __classPrivateFieldGet(this, _ChartSession_instances, "m", _ChartSession_handleEvent).call(this, 'replayEnd');
                        return;
                    }
                    if (packet.type === 'critical_error') {
                        const [, name, description] = packet.data;
                        __classPrivateFieldGet(this, _ChartSession_instances, "m", _ChartSession_handleError).call(this, 'Critical error:', name, description);
                    }
                },
            };
            __classPrivateFieldGet(this, _ChartSession_client, "f").send('chart_create_session', [__classPrivateFieldGet(this, _ChartSession_chartSessionID, "f")]);
        }
        /** @return {PricePeriod[]} List of periods values */
        get periods() {
            return Object.values(__classPrivateFieldGet(this, _ChartSession_periods, "f")).sort((a, b) => b.time - a.time);
        }
        /** @return {MarketInfos} Current market infos */
        get infos() {
            return __classPrivateFieldGet(this, _ChartSession_infos, "f");
        }
        /**
         * @param {import('../types').TimeFrame} timeframe Chart period timeframe
         * @param {number} [range] Number of loaded periods/candles (Default: 100)
         * @param {number} [reference] Reference candle timestamp (Default is now)
         */
        setSeries(timeframe = '240', range = 100, reference = null) {
            if (!__classPrivateFieldGet(this, _ChartSession_currentSeries, "f")) {
                __classPrivateFieldGet(this, _ChartSession_instances, "m", _ChartSession_handleError).call(this, 'Please set the market before setting series');
                return;
            }
            const calcRange = !reference ? range : ['bar_count', reference, range];
            __classPrivateFieldSet(this, _ChartSession_periods, {}, "f");
            __classPrivateFieldGet(this, _ChartSession_client, "f").send(`${__classPrivateFieldGet(this, _ChartSession_seriesCreated, "f") ? 'modify' : 'create'}_series`, [
                __classPrivateFieldGet(this, _ChartSession_chartSessionID, "f"),
                '$prices',
                's1',
                `ser_${__classPrivateFieldGet(this, _ChartSession_currentSeries, "f")}`,
                timeframe,
                __classPrivateFieldGet(this, _ChartSession_seriesCreated, "f") ? '' : calcRange,
            ]);
            __classPrivateFieldSet(this, _ChartSession_seriesCreated, true, "f");
        }
        /**
         * Set the chart market
         * @param {string} symbol Market symbol
         * @param {Object} [options] Chart options
         * @param {import('../types').TimeFrame} [options.timeframe] Chart period timeframe
         * @param {number} [options.range] Number of loaded periods/candles (Default: 100)
         * @param {number} [options.to] Last candle timestamp (Default is now)
         * @param {'splits' | 'dividends'} [options.adjustment] Market adjustment
         * @param {'regular' | 'extended'} [options.session] Chart session
         * @param {'EUR' | 'USD' | string} [options.currency] Chart currency
         * @param {ChartType} [options.type] Chart custom type
         * @param {ChartInputs} [options.inputs] Chart custom inputs
         * @param {number} [options.replay] Replay mode starting point (Timestamp)
         */
        setMarket(symbol, options = {}) {
            __classPrivateFieldSet(this, _ChartSession_periods, {}, "f");
            if (__classPrivateFieldGet(this, _ChartSession_replayMode, "f")) {
                __classPrivateFieldSet(this, _ChartSession_replayMode, false, "f");
                __classPrivateFieldGet(this, _ChartSession_client, "f").send('replay_delete_session', [__classPrivateFieldGet(this, _ChartSession_replaySessionID, "f")]);
            }
            const symbolInit = {
                symbol: symbol || 'BTCEUR',
                adjustment: options.adjustment || 'splits',
            };
            if (options.session)
                symbolInit.session = options.session;
            if (options.currency)
                symbolInit['currency-id'] = options.currency;
            if (options.replay) {
                __classPrivateFieldSet(this, _ChartSession_replayMode, true, "f");
                __classPrivateFieldGet(this, _ChartSession_client, "f").send('replay_create_session', [__classPrivateFieldGet(this, _ChartSession_replaySessionID, "f")]);
                __classPrivateFieldGet(this, _ChartSession_client, "f").send('replay_add_series', [
                    __classPrivateFieldGet(this, _ChartSession_replaySessionID, "f"),
                    'req_replay_addseries',
                    `=${JSON.stringify(symbolInit)}`,
                    options.timeframe,
                ]);
                __classPrivateFieldGet(this, _ChartSession_client, "f").send('replay_reset', [
                    __classPrivateFieldGet(this, _ChartSession_replaySessionID, "f"),
                    'req_replay_reset',
                    options.replay,
                ]);
            }
            const complex = options.type || options.replay;
            const chartInit = complex ? {} : symbolInit;
            if (complex) {
                if (options.replay)
                    chartInit.replay = __classPrivateFieldGet(this, _ChartSession_replaySessionID, "f");
                chartInit.symbol = symbolInit;
                chartInit.type = ChartTypes[options.type];
                if (options.type)
                    chartInit.inputs = Object.assign({}, options.inputs);
            }
            __classPrivateFieldSet(this, _ChartSession_currentSeries, __classPrivateFieldGet(this, _ChartSession_currentSeries, "f") + 1, "f");
            __classPrivateFieldGet(this, _ChartSession_client, "f").send('resolve_symbol', [
                __classPrivateFieldGet(this, _ChartSession_chartSessionID, "f"),
                `ser_${__classPrivateFieldGet(this, _ChartSession_currentSeries, "f")}`,
                `=${JSON.stringify(chartInit)}`,
            ]);
            this.setSeries(options.timeframe, options.range, options.to);
        }
        /**
         * Set the chart timezone
         * @param {import('../types').Timezone} timezone New timezone
         */
        setTimezone(timezone) {
            __classPrivateFieldSet(this, _ChartSession_periods, {}, "f");
            __classPrivateFieldGet(this, _ChartSession_client, "f").send('switch_timezone', [__classPrivateFieldGet(this, _ChartSession_chartSessionID, "f"), timezone]);
        }
        /**
         * Fetch x additional previous periods/candles values
         * @param {number} number Number of additional periods/candles you want to fetch
         */
        fetchMore(number = 1) {
            __classPrivateFieldGet(this, _ChartSession_client, "f").send('request_more_data', [__classPrivateFieldGet(this, _ChartSession_chartSessionID, "f"), '$prices', number]);
        }
        /**
         * Fetch x additional previous periods/candles values
         * @param {number} number Number of additional periods/candles you want to fetch
         * @returns {Promise} Raise when the data has been fetched
         */
        replayStep(number = 1) {
            return new Promise((cb) => {
                if (!__classPrivateFieldGet(this, _ChartSession_replayMode, "f")) {
                    __classPrivateFieldGet(this, _ChartSession_instances, "m", _ChartSession_handleError).call(this, 'No replay session');
                    return;
                }
                const reqID = genSessionID('rsq_step');
                __classPrivateFieldGet(this, _ChartSession_client, "f").send('replay_step', [__classPrivateFieldGet(this, _ChartSession_replaySessionID, "f"), reqID, number]);
                __classPrivateFieldGet(this, _ChartSession_replayOKCB, "f")[reqID] = () => { cb(); };
            });
        }
        /**
         * Start fetching a new period/candle every x ms
         * @param {number} interval Number of additional periods/candles you want to fetch
         * @returns {Promise} Raise when the replay mode starts
         */
        replayStart(interval = 1000) {
            return new Promise((cb) => {
                if (!__classPrivateFieldGet(this, _ChartSession_replayMode, "f")) {
                    __classPrivateFieldGet(this, _ChartSession_instances, "m", _ChartSession_handleError).call(this, 'No replay session');
                    return;
                }
                const reqID = genSessionID('rsq_start');
                __classPrivateFieldGet(this, _ChartSession_client, "f").send('replay_start', [__classPrivateFieldGet(this, _ChartSession_replaySessionID, "f"), reqID, interval]);
                __classPrivateFieldGet(this, _ChartSession_replayOKCB, "f")[reqID] = () => { cb(); };
            });
        }
        /**
         * Stop fetching a new period/candle every x ms
         * @returns {Promise} Raise when the replay mode stops
         */
        replayStop() {
            return new Promise((cb) => {
                if (!__classPrivateFieldGet(this, _ChartSession_replayMode, "f")) {
                    __classPrivateFieldGet(this, _ChartSession_instances, "m", _ChartSession_handleError).call(this, 'No replay session');
                    return;
                }
                const reqID = genSessionID('rsq_stop');
                __classPrivateFieldGet(this, _ChartSession_client, "f").send('replay_stop', [__classPrivateFieldGet(this, _ChartSession_replaySessionID, "f"), reqID]);
                __classPrivateFieldGet(this, _ChartSession_replayOKCB, "f")[reqID] = () => { cb(); };
            });
        }
        /**
         * When a symbol is loaded
         * @param {() => void} cb
         * @event
         */
        onSymbolLoaded(cb) {
            __classPrivateFieldGet(this, _ChartSession_callbacks, "f").symbolLoaded.push(cb);
        }
        /**
         * When a chart update happens
         * @param {(changes: ('$prices' | string)[]) => void} cb
         * @event
         */
        onUpdate(cb) {
            __classPrivateFieldGet(this, _ChartSession_callbacks, "f").update.push(cb);
        }
        /**
         * When the replay session is ready
         * @param {() => void} cb
         * @event
         */
        onReplayLoaded(cb) {
            __classPrivateFieldGet(this, _ChartSession_callbacks, "f").replayLoaded.push(cb);
        }
        /**
         * When the replay session has new resolution
         * @param {(
         *   timeframe: import('../types').TimeFrame,
         *   index: number,
         * ) => void} cb
         * @event
         */
        onReplayResolution(cb) {
            __classPrivateFieldGet(this, _ChartSession_callbacks, "f").replayResolution.push(cb);
        }
        /**
         * When the replay session ends
         * @param {() => void} cb
         * @event
         */
        onReplayEnd(cb) {
            __classPrivateFieldGet(this, _ChartSession_callbacks, "f").replayEnd.push(cb);
        }
        /**
         * When the replay session cursor has moved
         * @param {(index: number) => void} cb
         * @event
         */
        onReplayPoint(cb) {
            __classPrivateFieldGet(this, _ChartSession_callbacks, "f").replayPoint.push(cb);
        }
        /**
         * When chart error happens
         * @param {(...any) => void} cb Callback
         * @event
         */
        onError(cb) {
            __classPrivateFieldGet(this, _ChartSession_callbacks, "f").error.push(cb);
        }
        /** Delete the chart session */
        delete() {
            if (__classPrivateFieldGet(this, _ChartSession_replayMode, "f"))
                __classPrivateFieldGet(this, _ChartSession_client, "f").send('replay_delete_session', [__classPrivateFieldGet(this, _ChartSession_replaySessionID, "f")]);
            __classPrivateFieldGet(this, _ChartSession_client, "f").send('chart_delete_session', [__classPrivateFieldGet(this, _ChartSession_chartSessionID, "f")]);
            delete __classPrivateFieldGet(this, _ChartSession_client, "f").sessions[__classPrivateFieldGet(this, _ChartSession_chartSessionID, "f")];
            __classPrivateFieldSet(this, _ChartSession_replayMode, false, "f");
        }
    },
    _ChartSession_chartSessionID = new WeakMap(),
    _ChartSession_replaySessionID = new WeakMap(),
    _ChartSession_replayMode = new WeakMap(),
    _ChartSession_replayOKCB = new WeakMap(),
    _ChartSession_client = new WeakMap(),
    _ChartSession_studyListeners = new WeakMap(),
    _ChartSession_periods = new WeakMap(),
    _ChartSession_infos = new WeakMap(),
    _ChartSession_callbacks = new WeakMap(),
    _ChartSession_seriesCreated = new WeakMap(),
    _ChartSession_currentSeries = new WeakMap(),
    _ChartSession_chartSession = new WeakMap(),
    _ChartSession_instances = new WeakSet(),
    _ChartSession_handleEvent = function _ChartSession_handleEvent(ev, ...data) {
        __classPrivateFieldGet(this, _ChartSession_callbacks, "f")[ev].forEach((e) => e(...data));
        __classPrivateFieldGet(this, _ChartSession_callbacks, "f").event.forEach((e) => e(ev, ...data));
    },
    _ChartSession_handleError = function _ChartSession_handleError(...msgs) {
        if (__classPrivateFieldGet(this, _ChartSession_callbacks, "f").error.length === 0)
            console.error(...msgs);
        else
            __classPrivateFieldGet(this, _ChartSession_instances, "m", _ChartSession_handleEvent).call(this, 'error', ...msgs);
    },
    _a; };
