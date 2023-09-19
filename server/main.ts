import HTTP from 'http';
import QR from "qrcode";

const HOST: string = 'localhost';
const PORT: number = 8080;

const server = HTTP.createServer((req, res) => {
    res.writeHead(200);
    res.end("My first server! <b>bold</b>");
});

server.listen(PORT, HOST, () => {
    const url = `http://${HOST}:${PORT}`;
    console.log(`Server is running on ${url}`);
    QR.toString(url, {type: 'terminal'}, (e, q) => console.log(q));
});