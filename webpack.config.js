var path = require('path');
var glob=require('glob');
var webpack = require('webpack');
var ExtractTextPlugin=require("extract-text-webpack-plugin");
var HtmlWebpackPlugin=require("html-webpack-plugin");
var uglifyjsPlugin=require("uglifyjs-webpack-plugin");
var CommonsChunkPlugin=webpack.optimize.CommonsChunkPlugin;

var entries=getEntry('src/js/page/**/*.js','src/js/page');
var chunks=Object.keys(entries);

var config={
    entry:{
        index:"./src/js/page/index.js",
        about:"./src/js/page/about.js",
        list:"./src/js/page/list.js"
    },
    output:{
        path:path.join(__dirname,'dist'),
        publicPath: '/dist/',
        filename:'js/[name].js',
        chunkFilename:'js/[id].chunk.js'
    },
    module:{
        loaders:[
            {
                test:/\.css$/,
                loader:ExtractTextPlugin.extract({
                    fallback:"style-loader",
                    use:[
                        {
                            loader:"css-loader",
                            options:{
                                minimize:true
                            }
                        }
                    ]
                })
            },{
                test:/\.less$/,
                loader:ExtractTextPlugin.extract('css-loader!less-loader')
            },{
                test:/\.html$/,
                loader:"html-loader?attrs=img:src img:data-src"
            },{
                test: /\.(woff|woff2|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'file-loader?name=./fonts/[name].[ext]'
            }, {
                test:/\.(png|jpg|gif)$/,
                loader:'url-loader?limit=8192&name=./img/[hash].[ext]'
            }
        ]
    },
    plugins:[
        new webpack.ProvidePlugin({
            $:'jquery'
        }),
        new CommonsChunkPlugin({
            name:'vendors',
            chunks:chunks,
            minChunks:chunks.length
        }),
        new ExtractTextPlugin('css/[name].css'),
        new HtmlWebpackPlugin({
            // favicon:'./src/img/favicon.ico',
            filename:'./views/index.html',
            template:'./src/views/index.html',
            inject:'body',
            hash:true,
            chunks:['vendors','index'],
            minify:{
                removeComments:true,
                collapseWhitespace:false
            }
        }),
        new HtmlWebpackPlugin({
            // favicon:'./src/img/favicon.ico',
            filename:'./views/about.html',
            template:'./src/views/about.html',
            inject:'body',
            hash:true,
            chunks:['vendors','about'],
            minify:{
                removeComments:true,
                collapseWhitespace:false
            }
        }),
        new HtmlWebpackPlugin({
            // favicon:'./src/img/favicon.ico',
            filename:'./views/list.html',
            template:'./src/views/list.html',
            inject:'body',
            hash:true,
            chunks:['vendors','list'],
            minify:{
                removeComments:true,
                collapseWhitespace:false
            }
        }),
        new uglifyjsPlugin(),
        new webpack.HotModuleReplacementPlugin()
    ],
    devServer:{
        contentBase:'./',
        host:'localhost',
        port:9090,
        inline:true,
        hot:true
    }
};

var pages=Object.keys(getEntry('src/views/**/*.html','src/views/'));
pages.forEach(function (pathname) {
    var conf={
        filename:'./views/'+pathname+'.html',
        template:'./src/views/'+pathname+'.html',
        inject:false
    };
    if(pathname in config.entry){
        conf.favicon=path.resolve(__dirname,'src/img/favicon.ico');
        conf.inject='body';
        conf.chunks=['vendors',pathname];
        conf.hash=true
    }
    config.plugins.push(new HtmlWebpackPlugin(conf))
});

module.exports=config;

function getEntry(globPath, pathDir) {
    var files=glob.sync(globPath);
    var entries={},entry,dirname,basename,pathname,extname;

    for(var i=0;i<files.length;i++){
        entry=files[i];
        dirname=path.dirname(entry);
        extname=path.extname(entry);
        basename=path.basename(entry,extname);
        pathname=path.normalize(path.join(dirname,basename));
        pathDir=path.normalize(pathDir);
        if(pathname.startsWith(pathDir)){
            pathname=pathname.substring(pathDir.length)
        }
        entries[pathname]=['./'+entry]
    }
    return entries;
}