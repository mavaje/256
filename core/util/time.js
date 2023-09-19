"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep_until = exports.sleep = void 0;
async function sleep(ms) {
    return new Promise(done => setTimeout(done, ms));
}
exports.sleep = sleep;
async function sleep_until(predicate) {
    if (!predicate()) {
        await sleep(0);
        await sleep_until(predicate);
    }
}
exports.sleep_until = sleep_until;
