
export async function sleep(ms: number) {
    return new Promise<void>(done => setTimeout(done, ms));
}

export async function sleep_until(predicate: () => boolean) {
    if (!predicate()) {
        await sleep(0);
        await sleep_until(predicate);
    }
}
