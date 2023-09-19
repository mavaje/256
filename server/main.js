"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const qrcode_1 = __importDefault(require("qrcode"));
const HOST = 'localhost';
const PORT = 8080;
const server = http_1.default.createServer((req, res) => {
    res.writeHead(200);
    res.end("My first server! <b>bold</b>");
});
server.listen(PORT, HOST, () => {
    const url = `http://${HOST}:${PORT}`;
    console.log(`Server is running on ${url}`);
    qrcode_1.default.toString(url, { type: 'terminal' }, (e, q) => console.log(q));
});
