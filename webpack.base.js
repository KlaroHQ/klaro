const exp = require('constants');
const path = require('path');
const BUILD_DIR = path.resolve(__dirname, 'dist');
const SRC_DIR = path.resolve(__dirname, 'src');
const STYLE_FILES = /\.(sa|sc|c)ss$/;

const SEPARATE_CSS = process.env.SEPARATE_CSS !== undefined;

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const ANALYZE_BUNDLE = process.env.ANALYZE_BUNDLE !== undefined;

let config = {
    mode: 'development',
    target: 'web',
    context: SRC_DIR,
    devtool: 'inline-source-map',
    resolve: {
        symlinks: false,
        extensions: ['.jsx', '.js'],
        modules: [SRC_DIR, 'node_modules'],
        alias: {
            react: 'preact/compat',
            'react-dom': 'preact/compat',
        },
    },
    module: {
        rules: [
            {
                test: /\.(png|woff|woff2|eot|ttf|svg)$/,
                use: 'url-loader?limit=100000',
            },
            {
                test: /\.yaml|yml$/,
                use: ['yaml-loader'],
            },
            {
                test: /\.jsx?/,
                exclude: /node_modules/,
                include: [SRC_DIR],
                loader: 'babel-loader',
            }
        ],
    },
    entry: {
        'klaro': path.join(SRC_DIR, 'klaro.js'),
        cm: path.join(SRC_DIR, 'consent-manager.js'),
        translations: path.join(SRC_DIR, 'translations.js'),
        ide: path.join(SRC_DIR, 'ide.js')
    },
    output: {
        path: BUILD_DIR,
        filename: SEPARATE_CSS ? '[name]-no-css.js' : '[name].js',
        library: '[name]',
        libraryTarget: 'umd',
        publicPath: '',
    },
    plugins: [],
};

if (ANALYZE_BUNDLE) {
    config.plugins.push(new BundleAnalyzerPlugin());
}

const APP_ENV = process.env.APP_ENV || 'development';
const NO_MINIFY_CSS = process.env.NO_MINIFY_CSS !== undefined;

if (SEPARATE_CSS) {
    const MiniCssExtractPlugin = require('mini-css-extract-plugin');
    // no CSS does not apply to the consent manager and translations
    config.module.rules.push({
        test: STYLE_FILES,
        exclude: [/node_modules/],
        use: [
            {
                loader: MiniCssExtractPlugin.loader,
            },
            {
                loader: 'css-loader',
                options: {
                    sourceMap: APP_ENV === 'development',
                },
            },
            {
                loader: 'postcss-loader',
                options: {
                    postcssOptions: { path: 'postcss.config.js' },
                    sourceMap: APP_ENV === 'development',
                },
            },
            {
                loader: 'sass-loader',
                options: {
                    implementation: require.resolve("sass"),
                    sassOptions: {
                        sourceMap: APP_ENV === 'development',
                        outputStyle: NO_MINIFY_CSS ? 'expanded' : 'compressed',
                    },
                },
            },
        ],
    });
    config.plugins.push(
        new MiniCssExtractPlugin({
            filename: NO_MINIFY_CSS
                      ? '[name].css'
                      : '[name].min.css',
        }),
    );
} else {
    config.module.rules.push({
        test: STYLE_FILES,
        use: [
            'style-loader',
            {
                loader: 'css-loader',
            },
            {
                loader: 'postcss-loader',
                options: {
                    sourceMap: true,
                    postcssOptions: {
                        path: 'postcss.config.js',
                    },
                },
            },
            // withEnvSourcemap({loader: 'postcss-loader', options: {config: {path: 'postcss.config.js'}}}),
            {
                loader: 'sass-loader',
                options: {
                    implementation: require.resolve("sass"),
                },
            },
        ],
    });
}

module.exports = config;
