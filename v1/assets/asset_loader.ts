export function load_text_file(file_path: string): Promise<string> {
    try {
        return require(`./${file_path}.txt`);
    } catch (e) {
        console.error(`FILE NOT FOUND: "./${file_path}.txt"`);
        return null;
    }
}