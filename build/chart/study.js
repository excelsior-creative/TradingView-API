"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const { parseCompressed } = require('../protocol');
const graphicParser = require('./graphicParser');
const PineIndicator = require('../classes/PineIndicator');
const BuiltInIndicator = require('../classes/BuiltInIndicator');
/**
 * Get pine inputs
 * @param {PineIndicator | BuiltInIndicator} options
 */
function getInputs(options) {
    if (options instanceof PineIndicator) {
        const pineInputs = { text: options.script };
        if (options.pineId)
            pineInputs.pineId = options.pineId;
        if (options.pineVersion)
            pineInputs.pineVersion = options.pineVersion;
        Object.keys(options.inputs).forEach((inputID, n) => {
            const input = options.inputs[inputID];
            pineInputs[inputID] = {
                v: (input.type !== 'color') ? input.value : n,
                f: input.isFake,
                t: input.type,
            };
        });
        return pineInputs;
    }
    return options.options;
}
/**
 * @typedef {Object} TradeReport Trade report

 * @prop {Object} entry Trade entry
 * @prop {string} entry.name Trade name
 * @prop {'long' | 'short'} entry.type Entry type (long/short)
 * @prop {number} entry.value Entry price value
 * @prop {number} entry.time Entry timestamp

 * @prop {Object} exit Trade exit
 * @prop {'' | string} exit.name Trade name ('' if false exit)
 * @prop {number} exit.value Exit price value
 * @prop {number} exit.time Exit timestamp

 * @prop {number} quantity Trade quantity
 * @prop {RelAbsValue} profit Trade profit
 * @prop {RelAbsValue} cumulative Trade cummulative profit
 * @prop {RelAbsValue} runup Trade run-up
 * @prop {RelAbsValue} drawdown Trade drawdown
 */
/**
 * @typedef {Object} PerfReport
 * @prop {number} avgBarsInTrade Average bars in trade
 * @prop {number} avgBarsInWinTrade Average bars in winning trade
 * @prop {number} avgBarsInLossTrade Average bars in losing trade
 * @prop {number} avgTrade Average trade gain
 * @prop {number} avgTradePercent Average trade performace
 * @prop {number} avgLosTrade Average losing trade gain
 * @prop {number} avgLosTradePercent Average losing trade performace
 * @prop {number} avgWinTrade Average winning trade gain
 * @prop {number} avgWinTradePercent Average winning trade performace
 * @prop {number} commissionPaid Commission paid
 * @prop {number} grossLoss Gross loss value
 * @prop {number} grossLossPercent Gross loss percent
 * @prop {number} grossProfit Gross profit
 * @prop {number} grossProfitPercent Gross profit percent
 * @prop {number} largestLosTrade Largest losing trade gain
 * @prop {number} largestLosTradePercent Largent losing trade performance (percentage)
 * @prop {number} largestWinTrade Largest winning trade gain
 * @prop {number} largestWinTradePercent Largest winning trade performance (percentage)
 * @prop {number} marginCalls Margin calls
 * @prop {number} maxContractsHeld Max Contracts Held
 * @prop {number} netProfit Net profit
 * @prop {number} netProfitPercent Net performance (percentage)
 * @prop {number} numberOfLosingTrades Number of losing trades
 * @prop {number} numberOfWiningTrades Number of winning trades
 * @prop {number} percentProfitable Strategy winrate
 * @prop {number} profitFactor Profit factor
 * @prop {number} ratioAvgWinAvgLoss Ratio Average Win / Average Loss
 * @prop {number} totalOpenTrades Total open trades
 * @prop {number} totalTrades Total trades
*/
/**
 * @typedef {Object} StrategyReport
 * @prop {'EUR' | 'USD' | 'JPY' | '' | 'CHF'} [currency] Selected currency
 * @prop {TradeReport[]} trades Trade list starting by the last
 * @prop {Object} history History Chart value
 * @prop {number[]} [history.buyHold] Buy hold values
 * @prop {number[]} [history.buyHoldPercent] Buy hold percent values
 * @prop {number[]} [history.drawDown] Drawdown values
 * @prop {number[]} [history.drawDownPercent] Drawdown percent values
 * @prop {number[]} [history.equity] Equity values
 * @prop {number[]} [history.equityPercent] Equity percent values
 * @prop {Object} performance Strategy performance
 * @prop {PerfReport} [performance.all] Strategy long/short performances
 * @prop {PerfReport} [performance.long] Strategy long performances
 * @prop {PerfReport} [performance.short] Strategy short performances
 * @prop {number} [performance.buyHoldReturn] Strategy Buy & Hold Return
 * @prop {number} [performance.buyHoldReturnPercent] Strategy Buy & Hold Return percent
 * @prop {number} [performance.maxDrawDown] Strategy max drawdown
 * @prop {number} [performance.maxDrawDownPercent] Strategy max drawdown percent
 * @prop {number} [performance.openPL] Strategy Open P&L (Profit And Loss)
 * @prop {number} [performance.openPLPercent] Strategy Open P&L (Profit And Loss) percent
 * @prop {number} [performance.sharpeRatio] Strategy Sharpe Ratio
 * @prop {number} [performance.sortinoRatio] Strategy Sortino Ratio
 */
/**
 * @param {import('./session').ChartSessionBridge} chartSession
 */
module.exports = (chartSession) => { var _ChartStudy_instances, _ChartStudy_studID, _ChartStudy_studyListeners, _ChartStudy_periods, _ChartStudy_indexes, _ChartStudy_graphic, _ChartStudy_strategyReport, _ChartStudy_callbacks, _ChartStudy_handleEvent, _ChartStudy_handleError, _a; return _a = class ChartStudy {
        /**
         * @param {PineIndicator | BuiltInIndicator} indicator Indicator object instance
         */
        constructor(indicator) {
            _ChartStudy_instances.add(this);
            _ChartStudy_studID.set(this, genSessionID('st'));
            _ChartStudy_studyListeners.set(this, chartSession.studyListeners);
            /**
             * Table of periods values indexed by timestamp
             * @type {Object<number, {}[]>}
             */
            _ChartStudy_periods.set(this, {});
            /**
             * List of graphic xPos indexes
             * @type {number[]}
             */
            _ChartStudy_indexes.set(this, []);
            /**
             * Table of graphic drawings indexed by type and ID
             * @type {Object<string, Object<number, {}>>}
             */
            _ChartStudy_graphic.set(this, {});
            /** @type {StrategyReport} */
            _ChartStudy_strategyReport.set(this, {
                trades: [],
                history: {},
                performance: {},
            });
            _ChartStudy_callbacks.set(this, {
                studyCompleted: [],
                update: [],
                event: [],
                error: [],
            });
            if (!(indicator instanceof PineIndicator) && !(indicator instanceof BuiltInIndicator)) {
                throw new Error(`Indicator argument must be an instance of PineIndicator or BuiltInIndicator.
      Please use 'TradingView.getIndicator(...)' function.`);
            }
            /** @type {PineIndicator | BuiltInIndicator} Indicator instance */
            this.instance = indicator;
            __classPrivateFieldGet(this, _ChartStudy_studyListeners, "f")[__classPrivateFieldGet(this, _ChartStudy_studID, "f")] = (packet) => __awaiter(this, void 0, void 0, function* () {
                if (global.TW_DEBUG)
                    console.log('§90§30§105 STUDY §0 DATA', packet);
                if (packet.type === 'study_completed') {
                    __classPrivateFieldGet(this, _ChartStudy_instances, "m", _ChartStudy_handleEvent).call(this, 'studyCompleted');
                    return;
                }
                if (['timescale_update', 'du'].includes(packet.type)) {
                    const changes = [];
                    const data = packet.data[1][__classPrivateFieldGet(this, _ChartStudy_studID, "f")];
                    if (data && data.st && data.st[0]) {
                        data.st.forEach((p) => {
                            const period = {};
                            p.v.forEach((plot, i) => {
                                if (!this.instance.plots) {
                                    period[i === 0 ? '$time' : `plot_${i - 1}`] = plot;
                                    return;
                                }
                                const plotName = (i === 0 ? '$time' : this.instance.plots[`plot_${i - 1}`]);
                                if (plotName && !period[plotName])
                                    period[plotName] = plot;
                                else
                                    period[`plot_${i - 1}`] = plot;
                            });
                            __classPrivateFieldGet(this, _ChartStudy_periods, "f")[p.v[0]] = period;
                        });
                        changes.push('plots');
                    }
                    if (data.ns && data.ns.d) {
                        const parsed = JSON.parse(data.ns.d);
                        if (parsed.graphicsCmds) {
                            if (parsed.graphicsCmds.erase) {
                                parsed.graphicsCmds.erase.forEach((instruction) => {
                                    // console.log('Erase', instruction);
                                    if (instruction.action === 'all') {
                                        if (!instruction.type) {
                                            Object.keys(__classPrivateFieldGet(this, _ChartStudy_graphic, "f")).forEach((drawType) => {
                                                __classPrivateFieldGet(this, _ChartStudy_graphic, "f")[drawType] = {};
                                            });
                                        }
                                        else
                                            delete __classPrivateFieldGet(this, _ChartStudy_graphic, "f")[instruction.type];
                                        return;
                                    }
                                    if (instruction.action === 'one') {
                                        delete __classPrivateFieldGet(this, _ChartStudy_graphic, "f")[instruction.type][instruction.id];
                                    }
                                    // Can an 'instruction' contains other things ?
                                });
                            }
                            if (parsed.graphicsCmds.create) {
                                Object.keys(parsed.graphicsCmds.create).forEach((drawType) => {
                                    if (!__classPrivateFieldGet(this, _ChartStudy_graphic, "f")[drawType])
                                        __classPrivateFieldGet(this, _ChartStudy_graphic, "f")[drawType] = {};
                                    parsed.graphicsCmds.create[drawType].forEach((group) => {
                                        group.data.forEach((item) => {
                                            __classPrivateFieldGet(this, _ChartStudy_graphic, "f")[drawType][item.id] = item;
                                        });
                                    });
                                });
                            }
                            // console.log('graphicsCmds', Object.keys(parsed.graphicsCmds));
                            // Can 'graphicsCmds' contains other things ?
                            changes.push('graphic');
                        }
                        if (parsed.data && parsed.data.report && parsed.data.report.performance) {
                            __classPrivateFieldGet(this, _ChartStudy_strategyReport, "f").performance = parsed.data.report.performance;
                            changes.push('perfReport');
                        }
                        if (parsed.dataCompressed) {
                            const parsedC = yield parseCompressed(parsed.dataCompressed);
                            __classPrivateFieldSet(this, _ChartStudy_strategyReport, {
                                currency: parsedC.report.currency,
                                trades: parsedC.report.trades.reverse().map((t) => ({
                                    entry: {
                                        name: t.e.c,
                                        type: (t.e.tp[0] === 's' ? 'short' : 'long'),
                                        value: t.e.p,
                                        time: t.e.tm,
                                    },
                                    exit: {
                                        name: t.x.c,
                                        value: t.x.p,
                                        time: t.x.tm,
                                    },
                                    quantity: t.q,
                                    profit: t.tp,
                                    cumulative: t.cp,
                                    runup: t.rn,
                                    drawdown: t.dd,
                                })),
                                history: {
                                    buyHold: parsedC.report.buyHold,
                                    buyHoldPercent: parsedC.report.buyHoldPercent,
                                    drawDown: parsedC.report.drawDown,
                                    drawDownPercent: parsedC.report.drawDownPercent,
                                    equity: parsedC.report.equity,
                                    equityPercent: parsedC.report.equityPercent,
                                },
                                performance: parsedC.report.performance,
                            }, "f");
                            changes.push('fullReport');
                        }
                    }
                    if (data.ns.indexes && typeof data.ns.indexes === 'object') {
                        __classPrivateFieldSet(this, _ChartStudy_indexes, data.ns.indexes, "f");
                    }
                    __classPrivateFieldGet(this, _ChartStudy_instances, "m", _ChartStudy_handleEvent).call(this, 'update', changes);
                    return;
                }
                if (packet.type === 'study_error') {
                    __classPrivateFieldGet(this, _ChartStudy_instances, "m", _ChartStudy_handleError).call(this, packet.data[3], packet.data[4]);
                }
            });
            chartSession.send('create_study', [
                chartSession.sessionID,
                `${__classPrivateFieldGet(this, _ChartStudy_studID, "f")}`,
                'st1',
                '$prices',
                this.instance.type,
                getInputs(this.instance),
            ]);
        }
        /** @return {{}[]} List of periods values */
        get periods() {
            return Object.values(__classPrivateFieldGet(this, _ChartStudy_periods, "f")).sort((a, b) => b.$time - a.$time);
        }
        /**
         * Table of graphic drawings indexed by type
         * @return {import('./graphicParser').GraphicData}
         */
        get graphic() {
            const translator = {};
            Object.keys(chartSession.indexes)
                .sort((a, b) => chartSession.indexes[b] - chartSession.indexes[a])
                .forEach((r, n) => { translator[r] = n; });
            const indexes = __classPrivateFieldGet(this, _ChartStudy_indexes, "f").map((i) => translator[i]);
            return graphicParser(__classPrivateFieldGet(this, _ChartStudy_graphic, "f"), indexes);
        }
        /** @return {StrategyReport} Get the strategy report if available */
        get strategyReport() {
            return __classPrivateFieldGet(this, _ChartStudy_strategyReport, "f");
        }
        /**
         * @param {PineIndicator | BuiltInIndicator} indicator Indicator instance
         */
        setIndicator(indicator) {
            if (!(indicator instanceof PineIndicator) && !(indicator instanceof BuiltInIndicator)) {
                throw new Error(`Indicator argument must be an instance of PineIndicator or BuiltInIndicator.
      Please use 'TradingView.getIndicator(...)' function.`);
            }
            this.instance = indicator;
            chartSession.send('modify_study', [
                chartSession.sessionID,
                `${__classPrivateFieldGet(this, _ChartStudy_studID, "f")}`,
                'st1',
                getInputs(this.instance),
            ]);
        }
        /**
         * When the indicator is ready
         * @param {() => void} cb
         * @event
         */
        onReady(cb) {
            __classPrivateFieldGet(this, _ChartStudy_callbacks, "f").studyCompleted.push(cb);
        }
        /** @typedef {'plots' | 'perfReport' | 'fullReport'} UpdateChangeType */
        /**
         * When an indicator update happens
         * @param {(changes: UpdateChangeType[]) => void} cb
         * @event
         */
        onUpdate(cb) {
            __classPrivateFieldGet(this, _ChartStudy_callbacks, "f").update.push(cb);
        }
        /**
         * When indicator error happens
         * @param {(...any) => void} cb Callback
         * @event
         */
        onError(cb) {
            __classPrivateFieldGet(this, _ChartStudy_callbacks, "f").error.push(cb);
        }
        /** Remove the study */
        remove() {
            chartSession.send('remove_study', [
                chartSession.sessionID,
                __classPrivateFieldGet(this, _ChartStudy_studID, "f"),
            ]);
            delete __classPrivateFieldGet(this, _ChartStudy_studyListeners, "f")[__classPrivateFieldGet(this, _ChartStudy_studID, "f")];
        }
    },
    _ChartStudy_studID = new WeakMap(),
    _ChartStudy_studyListeners = new WeakMap(),
    _ChartStudy_periods = new WeakMap(),
    _ChartStudy_indexes = new WeakMap(),
    _ChartStudy_graphic = new WeakMap(),
    _ChartStudy_strategyReport = new WeakMap(),
    _ChartStudy_callbacks = new WeakMap(),
    _ChartStudy_instances = new WeakSet(),
    _ChartStudy_handleEvent = function _ChartStudy_handleEvent(ev, ...data) {
        __classPrivateFieldGet(this, _ChartStudy_callbacks, "f")[ev].forEach((e) => e(...data));
        __classPrivateFieldGet(this, _ChartStudy_callbacks, "f").event.forEach((e) => e(ev, ...data));
    },
    _ChartStudy_handleError = function _ChartStudy_handleError(...msgs) {
        if (__classPrivateFieldGet(this, _ChartStudy_callbacks, "f").error.length === 0)
            console.error(...msgs);
        else
            __classPrivateFieldGet(this, _ChartStudy_instances, "m", _ChartStudy_handleEvent).call(this, 'error', ...msgs);
    },
    _a; };
