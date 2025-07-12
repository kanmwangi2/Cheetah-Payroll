const path = require('path');

const CompressionPlugin = require('compression-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].js',
    publicPath: '/',
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        exclude: /node_modules/,
      },
    ],
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      maxSize: 200000,
      cacheGroups: {
        // Separate vendor chunk for large dependencies
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          maxSize: 200000,
          priority: 10,
        },
        // Firebase specific chunk (large library)
        firebase: {
          test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
          name: 'firebase',
          chunks: 'all',
          priority: 20,
        },
        // React and React ecosystem
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom|react-router)[\\/]/,
          name: 'react',
          chunks: 'all',
          priority: 20,
        },
        // Chart libraries
        charts: {
          test: /[\\/]node_modules[\\/](recharts|d3)[\\/]/,
          name: 'charts',
          chunks: 'all',
          priority: 15,
        },
        // UI libraries
        ui: {
          test: /[\\/]node_modules[\\/](@mui)[\\/]/,
          name: 'ui',
          chunks: 'all',
          priority: 15,
        },
        // PDF libraries (heavy - split separately)
        pdf: {
          test: /[\\/]node_modules[\\/](jspdf)[\\/]/,
          name: 'pdf',
          chunks: 'all',
          priority: 16,
          maxSize: 150000,
        },
        // Data processing libraries
        data: {
          test: /[\\/]node_modules[\\/](papaparse)[\\/]/,
          name: 'data',
          chunks: 'all',
          priority: 15,
        },
        // Common utilities and small libraries
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    },
    runtimeChunk: 'single',
    usedExports: true,
    minimize: true,
    sideEffects: false,
  },
  plugins: [
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 10240,
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public', 'index.html'),
      filename: 'index.html',
      inject: 'body',
    }),
    new Dotenv(),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    port: 3000,
    historyApiFallback: true,
  },
  performance: {
    hints: 'warning',
    maxEntrypointSize: 1500000, // Updated for modern app complexity with Firebase + React
    maxAssetSize: 400000, // Allow larger individual chunks for on-demand loaded libraries
    assetFilter: function(assetFilename) {
      // Don't warn about source maps, fonts, and PDF chunks (loaded on demand)
      return !assetFilename.endsWith('.map') && 
             !assetFilename.endsWith('.woff2') &&
             !assetFilename.includes('pdf') &&
             !assetFilename.includes('jspdf');
    },
  },
};
