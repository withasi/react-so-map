/**
 * Created by siwangli on 2015/12/29.
 */
'use strict';
var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

/************************** 初始化时删除dist目录 start **************************/
//方法1）仅适用于window系统，使用的是dos命令。当然也可以使用linux命令：rm -rf dist
/*var exec = require('child_process').exec,child;
 child = exec('rd /q /s dist',function(err,out) {
 console.log(out); err && console.log(err);
 });*/
//方法2）使用fs类库删除dist目录，兼容其它系统
var fs = require('fs');
function deleteFolderRecursive(path) {
    var files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};
deleteFolderRecursive("dist");
/************************** 初始化时删除dist目录 end **************************/

module.exports = {
    entry: {
        home: [
            'babel-polyfill',//兼容编译后仍不支持的api
            path.resolve(__dirname, 'index.js')
        ],
        // Since react is installed as a node module, node_modules/react,
        // we can point to it directly, just like require('react');
        // 当 React 作为一个 node 模块安装的时候，
        // 我们可以直接指向它，就比如 require('react')
        vendors: ['react']
    },
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
                exclude: path.resolve('css'),
                loader: 'style!css?modules&localIdentName=[name]-[local]-[hash:base64:5]!less'
            },
            {
                test: /\.less$/,
                include: path.resolve('css'),
                loader: ExtractTextPlugin.extract("style-loader", "css-loader!less-loader")
            },
            {
                test: /\.(png|jpg)$/,
                include: path.resolve('img'),
                loader: 'url-loader?limit=2048&name=new/images/[name].[ext]'
            }
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
        'jquery': "jQuery"
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: '360地图 – 出门之前，搜一下',
            desc: '提供地图搜索、卫星图像。查找本地生活信息、行车及公交路线，出门之前so一下。',
            mapapi: 'https://api.map.so.com/js/',
            minify: {
                collapseInlineTagWhitespace: true,
                collapseWhitespace: true,
                removeComments: true
            },
            filename: 'new/index_new.html',
            template: 'index.html', // Load a custom template
            //php: '<script>var So = {loadTime: <?=time()?>000,log: {dom: [+new Date]},module: <?php echo json_encode($module);?>,location: <?php echo json_encode($info);?>,hotspotVersion: <?php echo $hotspotVersion;?>};(function() {So.now = So.loadTime;setInterval(function() {So.now += 1000;}, 1000);})();</script>',
            //favicon: 'favicon.ico',
            inject: 'body' // Inject all scripts into the body
        }),
        new ExtractTextPlugin("new/[hash].css"),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"'
        }),
        new webpack.optimize.DedupePlugin(),
        //压缩打包的文件
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                //supresses warnings, usually from module minification
                warnings: false,
                drop_console: true
            }
        }),
        /*new webpack.optimize.LimitChunkCountPlugin({
         maxChunks:10
         }),
         new webpack.optimize.MinChunkSizePlugin({
         minChunkSize:20140
         }),*/
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.AggressiveMergingPlugin(),
        new webpack.optimize.CommonsChunkPlugin('vendors', 'new/[hash].vendors.js')
    ]
};
