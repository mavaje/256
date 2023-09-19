"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlyphMap = void 0;
const time_1 = require("../util/time");
class GlyphMap {
    static _CHARS = {};
    static char(key) {
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
    static map = [];
    static glyph(c) {
        return GlyphMap.map[c] ?? GlyphMap.UNKNOWN_GLYPH;
    }
    static async ready() {
        return (0, time_1.sleep_until)(() => _ready);
    }
    static from_ascii(text) {
        return text.split('').map(char => {
            if (/[0-9A-Za-z]/.test(char)) {
                return GlyphMap.char(char);
            }
            else {
                switch (char) {
                    default:
                        return 200;
                }
            }
        });
    }
}
exports.GlyphMap = GlyphMap;
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
    }
    else {
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
    Promise.resolve(`${`./glyphs/${file}.txt`}`).then(s => __importStar(require(s))).then(({ default: text }) => {
        const split = text.split('\n');
        GlyphMap.map[char] = [0, 1, 2, 3, 4, 5, 6, 7]
            .map(y => [0, 1, 2, 3, 4, 5].map(x => split[y]?.[x * 2] === '#'));
    })
        .catch(err => {
        console.log(err);
        GlyphMap.map[char] = GlyphMap.UNKNOWN_GLYPH;
    });
})).then(() => _ready = true);
