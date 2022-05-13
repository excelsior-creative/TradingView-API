"use strict";
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
var _Client_instances, _Client_ws, _Client_logged, _Client_sessions, _Client_callbacks, _Client_handleEvent, _Client_handleError, _Client_parsePacket, _Client_sendQueue, _Client_clientBridge, _a;
const WebSocket = require('ws');
const misc = require('./miscRequests');
const protocol = require('./protocol');
const quoteSessionGenerator = require('./quote/session');
const chartSessionGenerator = require('./chart/session');
/**
 * @typedef {Object} Session
 * @prop {'quote' | 'chart' | 'replay'} type Session type
 * @prop {(data: {}) => null} onData When there is a data
 */
/** @typedef {Object<string, Session>} SessionList Session list */
/**
 * @callback SendPacket Send a custom packet
 * @param {string} t Packet type
 * @param {string[]} p Packet data
 * @returns {void}
*/
/**
 * @typedef {Object} ClientBridge
 * @prop {SessionList} sessions
 * @prop {SendPacket} send
 */
/**
 * @typedef { 'connected' | 'disconnected'
 *  | 'logged' | 'ping' | 'data'
 *  | 'error' | 'event'
 * } ClientEvent
 */
/** @class */
module.exports = (_a = class Client {
        /**
         * @typedef {Object} ClientOptions
         * @prop {string} [token] User auth token (in 'sessionid' cookie)
         * @prop {boolean} [DEBUG] Enable debug mode
         */
        /** Client object
         * @param {ClientOptions} clientOptions TradingView client options
         */
        constructor(clientOptions = {}) {
            _Client_instances.add(this);
            _Client_ws.set(this, void 0);
            _Client_logged.set(this, false);
            /** @type {SessionList} */
            _Client_sessions.set(this, {});
            _Client_callbacks.set(this, {
                connected: [],
                disconnected: [],
                logged: [],
                ping: [],
                data: [],
                error: [],
                event: [],
            });
            _Client_sendQueue.set(this, []);
            /** @type {ClientBridge} */
            _Client_clientBridge.set(this, {
                sessions: __classPrivateFieldGet(this, _Client_sessions, "f"),
                send: (t, p) => this.send(t, p),
            });
            /** @namespace Session */
            this.Session = {
                Quote: quoteSessionGenerator(__classPrivateFieldGet(this, _Client_clientBridge, "f")),
                Chart: chartSessionGenerator(__classPrivateFieldGet(this, _Client_clientBridge, "f")),
            };
            if (clientOptions.DEBUG)
                global.TW_DEBUG = clientOptions.DEBUG;
            __classPrivateFieldSet(this, _Client_ws, new WebSocket('wss://data.tradingview.com/socket.io/websocket', {
                origin: 'https://s.tradingview.com',
            }), "f");
            if (clientOptions.token) {
                misc.getUser(clientOptions.token).then((user) => {
                    __classPrivateFieldGet(this, _Client_sendQueue, "f").unshift(protocol.formatWSPacket({
                        m: 'set_auth_token',
                        p: [user.authToken],
                    }));
                    __classPrivateFieldSet(this, _Client_logged, true, "f");
                    this.sendQueue();
                }).catch((err) => {
                    __classPrivateFieldGet(this, _Client_instances, "m", _Client_handleError).call(this, 'Credentials error:', err.message);
                });
            }
            else {
                __classPrivateFieldGet(this, _Client_sendQueue, "f").unshift(protocol.formatWSPacket({
                    m: 'set_auth_token',
                    p: ['unauthorized_user_token'],
                }));
                __classPrivateFieldSet(this, _Client_logged, true, "f");
                this.sendQueue();
            }
            __classPrivateFieldGet(this, _Client_ws, "f").on('open', () => {
                __classPrivateFieldGet(this, _Client_instances, "m", _Client_handleEvent).call(this, 'connected');
                this.sendQueue();
            });
            __classPrivateFieldGet(this, _Client_ws, "f").on('close', () => {
                __classPrivateFieldSet(this, _Client_logged, false, "f");
                __classPrivateFieldGet(this, _Client_instances, "m", _Client_handleEvent).call(this, 'disconnected');
            });
            __classPrivateFieldGet(this, _Client_ws, "f").on('message', (data) => __classPrivateFieldGet(this, _Client_instances, "m", _Client_parsePacket).call(this, data));
        }
        /** If the client is logged in */
        get isLogged() {
            return __classPrivateFieldGet(this, _Client_logged, "f");
        }
        /** If the cient was closed */
        get isOpen() {
            return __classPrivateFieldGet(this, _Client_ws, "f").readyState === __classPrivateFieldGet(this, _Client_ws, "f").OPEN;
        }
        /**
         * When client is connected
         * @param {() => void} cb Callback
         * @event onConnected
         */
        onConnected(cb) {
            __classPrivateFieldGet(this, _Client_callbacks, "f").connected.push(cb);
        }
        /**
         * When client is disconnected
         * @param {() => void} cb Callback
         * @event onDisconnected
         */
        onDisconnected(cb) {
            __classPrivateFieldGet(this, _Client_callbacks, "f").disconnected.push(cb);
        }
        /**
         * @typedef {Object} SocketSession
         * @prop {string} session_id Socket session ID
         * @prop {number} timestamp Session start timestamp
         * @prop {number} timestampMs Session start milliseconds timestamp
         * @prop {string} release Release
         * @prop {string} studies_metadata_hash Studies metadata hash
         * @prop {'json' | string} protocol Used protocol
         * @prop {string} javastudies Javastudies
         * @prop {number} auth_scheme_vsn Auth scheme type
         * @prop {string} via Socket IP
         */
        /**
         * When client is logged
         * @param {(SocketSession: SocketSession) => void} cb Callback
         * @event onLogged
         */
        onLogged(cb) {
            __classPrivateFieldGet(this, _Client_callbacks, "f").logged.push(cb);
        }
        /**
         * When server is pinging the client
         * @param {(i: number) => void} cb Callback
         * @event onPing
         */
        onPing(cb) {
            __classPrivateFieldGet(this, _Client_callbacks, "f").ping.push(cb);
        }
        /**
         * When unparsed data is received
         * @param {(...{}) => void} cb Callback
         * @event onData
         */
        onData(cb) {
            __classPrivateFieldGet(this, _Client_callbacks, "f").data.push(cb);
        }
        /**
         * When a client error happens
         * @param {(...{}) => void} cb Callback
         * @event onError
         */
        onError(cb) {
            __classPrivateFieldGet(this, _Client_callbacks, "f").error.push(cb);
        }
        /**
         * When a client event happens
         * @param {(...{}) => void} cb Callback
         * @event onEvent
         */
        onEvent(cb) {
            __classPrivateFieldGet(this, _Client_callbacks, "f").event.push(cb);
        }
        /** @type {SendPacket} Send a custom packet */
        send(t, p = []) {
            __classPrivateFieldGet(this, _Client_sendQueue, "f").push(protocol.formatWSPacket({ m: t, p }));
            this.sendQueue();
        }
        /** Send all waiting packets */
        sendQueue() {
            while (this.isOpen && __classPrivateFieldGet(this, _Client_logged, "f") && __classPrivateFieldGet(this, _Client_sendQueue, "f").length > 0) {
                const packet = __classPrivateFieldGet(this, _Client_sendQueue, "f").shift();
                __classPrivateFieldGet(this, _Client_ws, "f").send(packet);
                if (global.TW_DEBUG)
                    console.log('§90§30§107 > §0', packet);
            }
        }
        /**
         * Close the websocket connection
         * @return {Promise<void>} When websocket is closed
         */
        end() {
            return new Promise((cb) => {
                if (__classPrivateFieldGet(this, _Client_ws, "f").readyState)
                    __classPrivateFieldGet(this, _Client_ws, "f").close();
                cb();
            });
        }
    },
    _Client_ws = new WeakMap(),
    _Client_logged = new WeakMap(),
    _Client_sessions = new WeakMap(),
    _Client_callbacks = new WeakMap(),
    _Client_sendQueue = new WeakMap(),
    _Client_clientBridge = new WeakMap(),
    _Client_instances = new WeakSet(),
    _Client_handleEvent = function _Client_handleEvent(ev, ...data) {
        __classPrivateFieldGet(this, _Client_callbacks, "f")[ev].forEach((e) => e(...data));
        __classPrivateFieldGet(this, _Client_callbacks, "f").event.forEach((e) => e(ev, ...data));
    },
    _Client_handleError = function _Client_handleError(...msgs) {
        if (__classPrivateFieldGet(this, _Client_callbacks, "f").error.length === 0)
            console.error(...msgs);
        else
            __classPrivateFieldGet(this, _Client_instances, "m", _Client_handleEvent).call(this, 'error', ...msgs);
    },
    _Client_parsePacket = function _Client_parsePacket(str) {
        if (!this.isOpen)
            return;
        protocol.parseWSPacket(str).forEach((packet) => {
            if (global.TW_DEBUG)
                console.log('§90§30§107 CLIENT §0 PACKET', packet);
            if (typeof packet === 'number') { // Ping
                __classPrivateFieldGet(this, _Client_ws, "f").send(protocol.formatWSPacket(`~h~${packet}`));
                __classPrivateFieldGet(this, _Client_instances, "m", _Client_handleEvent).call(this, 'ping', packet);
                return;
            }
            if (packet.m === 'protocol_error') { // Error
                __classPrivateFieldGet(this, _Client_instances, "m", _Client_handleError).call(this, 'Client critical error:', packet.p);
                __classPrivateFieldGet(this, _Client_ws, "f").close();
                return;
            }
            if (packet.m && packet.p) { // Normal packet
                const parsed = {
                    type: packet.m,
                    data: packet.p,
                };
                const session = packet.p[0];
                if (session && __classPrivateFieldGet(this, _Client_sessions, "f")[session]) {
                    __classPrivateFieldGet(this, _Client_sessions, "f")[session].onData(parsed);
                    return;
                }
            }
            if (!__classPrivateFieldGet(this, _Client_logged, "f")) {
                __classPrivateFieldGet(this, _Client_instances, "m", _Client_handleEvent).call(this, 'logged', packet);
                return;
            }
            __classPrivateFieldGet(this, _Client_instances, "m", _Client_handleEvent).call(this, 'data', packet);
        });
    },
    _a);
