const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Backend base URL (the part before "/api").
// Set the API_URL env var when building for production, e.g.:
//   API_URL=https://capiche.onrender.com npm run build
// Defaults to the local dev server so development keeps working out of the box.
const apiBaseUrl = process.env.API_URL || 'http://localhost:5000';

module.exports = {
	entry: {
		app: './src/app.js',
		login: './src/login.js',
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist'),
		clean: true,
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env.API_URL': JSON.stringify(apiBaseUrl + '/api'),
		}),
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: './src/index.html',
			chunks: ['app'],
		}),
		new HtmlWebpackPlugin({
			filename: 'login.html',
			template: './src/login.html',
			chunks: ['login'],
		}),
	],
	module: {
		rules: [
			{
				test: /\.html$/i,
				loader: "html-loader",
			},
			{
				test: /\.(png|svg|jpg|jpeg|gif)$/i,
				type: "asset/resource",
				generator: {
					filename: 'images/img_[hash][ext][query]'
				}
			},
		],
	},
};
