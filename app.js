// "./node_modules/.bin/nodemon" app.js を実行しておくと、ソース修正後にオートコンパイル
// ./node_modules/.bin/nodemon app.js (windows10)
// 各種import
const express = require('express');
const app = express();
const http = require('http').Server(app);
const logger = require('morgan');
const bodyParser = require('body-parser');

// 各種定数
const PORT = process.env.PORT || 3000;

// オブジェクト生成
const chatServer = require('./lib/chatServer');

// ejs(テンプレ)を使用するための設定
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// postデータ(json)を取得する為の設定
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// コンソールにデバッグ情報を表示
app.use(logger('dev'));
// publicフォルダにパスを通す（expressではこれをmiddlewareの適用と呼ぶ）
// http://localhost:3000/【publicフォルダ配下のファイル名】で 指定ファイルがリダイレクトされる
app.use(express.static(__dirname + '/views'));

// routing設定
app.use('/', require('./routes/index.js'));

// ポートlocalhost:3000にリスナー起動
http.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});

// ソケット関連処理
chatServer.connectSocket(http, app);

