const path = require('path');

module.exports = {
  entry: './public/index.js', // Seu arquivo de entrada
  output: {
    filename: 'bundle.js', // O arquivo de saída
    path: path.resolve(__dirname, 'dist'), // O diretório de saída
    publicPath : '/',
  },
  
  module: {
    rules: [
      {
        test: /\.js$/, // Para todos os arquivos .js
        exclude: /node_modules/, // Exceto a pasta node_modules
        use: {
          loader: 'babel-loader', // Use o babel-loader
          options: {
            presets: ['@babel/preset-env'], // Com o preset-env
          }
        }
      }
    ]
  },
  // Configurações para resolver os módulos do Three.js
  resolve: {
    alias: {
      'three': path.resolve('../node_modules/three')
    }
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    // ... outras configurações
  }
  
  
};