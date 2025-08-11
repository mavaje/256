const path = require('path');

/** @type {import('webpack').Configuration} */
module.exports = {
    mode: 'development',
    entry: {
        [256]: './client/client.ts',
    },
    output: {
        // filename: '[name].js',
        path: path.resolve(__dirname, 'client/public'),
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    externals: {
        './public.node.js': 'commonjs ./public.node.js',
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ],
                exclude: /node_modules/,
            },
        ],
    },
};
