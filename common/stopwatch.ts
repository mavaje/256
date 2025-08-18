
export class Stopwatch {
    static time(callback: () => void, name: string = 'Process') {
        const start = process.hrtime();
        callback();
        const diff = process.hrtime(start);
        const values = [
            diff[0],
            diff[1] / 1e6,
            diff[1] / 1e3,
            diff[1],
        ].map(v => Math.floor(v % 1e3));
        const time = ['s', 'ms', 'µs', 'ns']
            .map((unit, i) => `${values[i]}${unit}`)
            .join(' ');
        console.log(`${name} took ${time}`);
    }
}
