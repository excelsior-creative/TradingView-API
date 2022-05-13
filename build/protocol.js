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
const JSZip = require('jszip');
/**
 * @typedef {Object} TWPacket
 * @prop {string} [m] Packet type
 * @prop {[session: string, {}]} [p] Packet data
 */
const cleanerRgx = /~h~/g;
const splitterRgx = /~m~[0-9]{1,}~m~/g;
module.exports = {
    /**
     * Parse websocket packet
     * @function parseWSPacket
     * @param {string} str Websocket raw data
     * @returns {TWPacket[]} TradingView packets
     */
    parseWSPacket(str) {
        return str.replace(cleanerRgx, '').split(splitterRgx)
            .map((p) => {
            if (!p)
                return false;
            try {
                return JSON.parse(p);
            }
            catch (error) {
                console.warn('Cant parse', p);
                return false;
            }
        })
            .filter((p) => p);
    },
    /**
     * Format websocket packet
     * @function formatWSPacket
     * @param {TWPacket} packet TradingView packet
     * @returns {string} Websocket raw data
     */
    formatWSPacket(packet) {
        const msg = typeof packet === 'object'
            ? JSON.stringify(packet)
            : packet;
        return `~m~${msg.length}~m~${msg}`;
    },
    /**
     * Parse compressed data
     * @function parseCompressed
     * @param {string} data Compressed data
     * @returns {Promise<{}>} Parsed data
     */
    parseCompressed(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const zip = new JSZip();
            return JSON.parse(yield (yield zip.loadAsync(data, { base64: true })).file('').async('text'));
        });
    },
};
