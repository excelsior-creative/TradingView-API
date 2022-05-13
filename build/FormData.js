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
var _FormData_string, _FormData_boundary;
/** @class */
class FormData {
    constructor() {
        _FormData_string.set(this, '');
        _FormData_boundary.set(this, '');
        const random = (Math.random() * 10 ** 20).toString(36);
        __classPrivateFieldSet(this, _FormData_boundary, `${random}`, "f");
        __classPrivateFieldSet(this, _FormData_string, `--${this.boundary}`, "f");
    }
    get boundary() {
        return __classPrivateFieldGet(this, _FormData_boundary, "f");
    }
    /**
     * Adds a property to the FormData object
     * @param {string} key Property key
     * @param {string} value Property value
     */
    append(key, value) {
        __classPrivateFieldSet(this, _FormData_string, __classPrivateFieldGet(this, _FormData_string, "f") + `\r\nContent-Disposition: form-data; name="${key}"`, "f");
        __classPrivateFieldSet(this, _FormData_string, __classPrivateFieldGet(this, _FormData_string, "f") + `\r\n\r\n${value}`, "f");
        __classPrivateFieldSet(this, _FormData_string, __classPrivateFieldGet(this, _FormData_string, "f") + `\r\n--${this.boundary}`, "f");
    }
    /**
     * @returns {string}
     */
    toString() {
        return `${__classPrivateFieldGet(this, _FormData_string, "f")}--`;
    }
}
_FormData_string = new WeakMap(), _FormData_boundary = new WeakMap();
module.exports = FormData;
