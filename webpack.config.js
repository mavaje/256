const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

/** @type {import('webpack').Configuration} */
module.exports = {
    mode: 'development',
    entry: {
        [256]: './client/client.ts',
        style: './client/style.scss',
    },
    output: {
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
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader'
                ],
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            // filename: './/[name].css',
        }),
    ],
};
