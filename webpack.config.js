/**
 * Created by siwangli on 2015/12/29.
 */
'use strict';
var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var CopyWebpackPlugin = require('copy-webpack-plugin');
//var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
    entry: {
        home: [
            'webpack/hot/dev-server',//浏览器自动刷新配置
            'webpack-dev-server/client?http://localhost:8080',//浏览器自动刷新配置
            'babel-polyfill',//兼容编译后仍不支持的api
            path.resolve(__dirname, 'index.js')
            //path.resolve(__dirname, 'test/selector/selector.js')
        ],
        // Since react is installed as a node module, node_modules/react,
        // we can point to it directly, just like require('react');
        // 当 React 作为一个 node 模块安装的时候，
        // 我们可以直接指向它，就比如 require('react')
        vendors: ['react']
    },
    devServer: {
        hot: true
    },
    devtool: 'eval-source-map',
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
        filename: 'new/[hash].bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loader: 'babel',
                exclude: /node_modules/,
                include: __dirname
            },
            //之前已开发的部分维持现状，之后的项目启用css module 方式组织css样式。
            {
                test: /\.less$/,
                exclude: path.resolve('src/css'),
                loader: 'style!css!less'
            },
            {
                test: /\.less$/,
                include: path.resolve('src/css'),
                loader: ExtractTextPlugin.extract("style-loader", "css-loader!less-loader")
            },
        ]
    },
    resolve: {
        //自动扩展文件后缀名，意味着我们require模块可以省略不写后缀名
        extensions: [
            '',
            '.js',
            '.jsx',
            '.less',
            '.css',
            '.html'
        ]
    },
    externals: {
        //'jquery': "jQuery"
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: '360地图 – 出门之前，搜一下',
            desc: '提供地图搜索、卫星图像。查找本地生活信息、行车及公交路线，出门之前so一下。',
            mapapi: 'https://api.map.so.com/js/',
            filename: 'index.html',
            template: 'index.html', // Load a custom template
            inject: 'body' // Inject all scripts into the body
        }),
        new ExtractTextPlugin("new/[hash].css"),
        new webpack.optimize.CommonsChunkPlugin('vendors', 'new/[hash].vendors.js'),
        //把指定文件夹下的文件复制到指定的目录

        //如下分析bundle代码，会绘制出代码图模块图等
        /* new BundleAnalyzerPlugin({
         // Automatically open analyzer page in default browser
         openAnaldyzer: true,
         // Analyzer HTTP-server port
         analyzerPort: 8888,
         // If `true`, Webpack Stats JSON file will be generated in bundles output directory
         generateStatsFile: false,
         // Name of Webpack Stats JSON file that will be generated if `generateStatsFile` is `true`.
         // Relative to bundles output directory.
         statsFilename: 'stats.json',
         })*/
    ]
};
