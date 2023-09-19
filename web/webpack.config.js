
const path = require('path');

const isProduction = process.env.NODE_ENV == 'production';

const stylesHandler = 'style-loader';

const config = {
    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/i,
                loader: 'ts-loader',
                exclude: ['/node_modules/'],
            },
            {
                test: /\.css$/i,
                use: [stylesHandler,'css-loader'],
            },
            {
                test: /\.txt$/i,
                use: [
                    {
                        loader: 'raw-loader',
                        options: {
                            esModule: false,
                        },
                    },
                ],
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.jsx', '.js', '...'],
    },
};

module.exports = () => {
    if (isProduction) {
        config.mode = 'production';
    } else {
        config.mode = 'development';
    }
    return config;
};
