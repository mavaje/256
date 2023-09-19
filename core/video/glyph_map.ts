import {sleep_until} from "../util/time";

export class GlyphMap {

    static _CHARS: {
        [key: string]: number
    } = {};
    static char(key: string): number {
        return GlyphMap._CHARS[key] || -1;
    }

    static UNKNOWN_GLYPH = [
        [1, 1, 1, 1, 1, 0],
        [1, 0, 0, 0, 1, 0],
        [1, 1, 1, 0, 1, 0],
        [1, 1, 0, 0, 1, 0],
        [1, 1, 1, 1, 1, 0],
        [1, 1, 0, 1, 1, 0],
        [1, 1, 1, 1, 1, 0],
        [0, 0, 0, 0, 0, 0]
    ].map(row => row.map(Boolean));

    static map: boolean[][][] = [];

    static glyph(c: number): boolean[][] {
        return GlyphMap.map[c] ?? GlyphMap.UNKNOWN_GLYPH;
    }

    static async ready(): Promise<void> {
        return sleep_until(() => _ready);
    }

    static from_ascii(text: string): number[] {
        return text.split('').map(char => {
            if (/[0-9A-Za-z]/.test(char)) {
                return GlyphMap.char(char);
            } else {
                switch (char) {
                    default:
                        return 200;
                }
            }
        });
    }

}

let _ready = false;
Promise.all(`
    0 1 2 3 4 5 6 7 8 9 A B C D E F
    G H I J K L M N O P Q R S T U V
    W X Y Z , . ; : ! ? a b c d e f
    g h i j k l m n o p q r s t u v
    w x y z . . . . . . . . . . . .
    + - TIMES DIVIDE % # . . . . . . . . . .
    < = > <= != >= . . . . . . . . . .
    ARROW_UL ARROW_U ARROW_UR . . . . . . . . . . . . .
    ARROW_L . ARROW_R . . . . . . . . . . . . .
    ARROW_DL ARROW_D ARROW_DR . . . . . . . . . . . . .
    HEART DIAMOND CLUB SPADE . . . . . . . . . . . .
    STAR MUSIC IMAGE
    
`.trim().split(/\s+/g).map((file, char) => {
    GlyphMap._CHARS[file] = char;
    if (/[a-z]/.test(file)) {
        file = '_' + file;
    } else {
        file = {
            ',': 'COMMA',
            '.': 'PERIOD',
            ';': 'SEMICOLON',
            ':': 'COLON',
            '!': 'EXCLAIM',
            '?': 'QUESTION',
            '+': 'PLUS',
            '-': 'MINUS',
            '%': 'PERCENT',
            '#': 'HASH',
            '&': 'AND',
            '@': 'AT',
            '$': 'DOLLAR',
            '(': 'PAREN_L',
            ')': 'PAREN_R',
            '[': 'BRACKET_L',
            ']': 'BRACKET_R',
            '<': 'COMPARE_LT',
            '=': 'COMPARE_EQ',
            '>': 'COMPARE_GT',
            '<=': 'COMPARE_LTE',
            '!=': 'COMPARE_NEQ',
            '>=': 'COMPARE_GTE',
        }[file] || file;
    }
    import(`./glyphs/${file}.txt`)
        .then(({default: text}) => {
            const split = text.split('\n');
            GlyphMap.map[char] = [0, 1, 2, 3, 4, 5, 6, 7]
                .map(y => [0, 1, 2, 3, 4, 5].map(x => split[y]?.[x * 2] === '#'))
        })
        .catch(err => {
            console.log(err);
            GlyphMap.map[char] = GlyphMap.UNKNOWN_GLYPH
        });
})).then(() => _ready = true);
