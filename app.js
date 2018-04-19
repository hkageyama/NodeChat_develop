// "./node_modules/.bin/nodemon" app.js を実行しておくと、ソース修正後にオートコンパイル
// 各種import
const express = require('express');
const app = express();
const http = require('http').Server(app);
const logger = require('morgan');
const bodyParser = require('body-parser');
const mysql = require('mysql');

// 各種定数
const PORT = process.env.PORT || 3000;

// オブジェクト生成
var Chat_server = require('./lib/chat_server');
var chat_server = new Chat_server();
var Access_db = require('./lib/access_db');
var access_db = new Access_db();

// mySQL接続プール設定
var pool = mysql.createPool({
  connectionLimit : 10,
  host     : 'localhost',
  user     : 'root',
  password : 'admin',
  database : 'exchat'
});

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

// agentチャット画面起動
app.get('/agent', function(req, res) {
  res.render('agent');
});
app.post('/agent', function(req, res) {
  res.render('agent', {room_id: req.body.room_id, agent_name: req.body.agent_name});
});
// visitorチャット画面起動
app.get('/visitor', function(req, res) {
  res.render('visitor');
});
// 【テスト用】sdk向けpostリクエスト発行
app.post('/post_to_sdk', function(req, res) {
  console.log('send to SDK： ' + req.body.key);
});

// ポートlocalhost:3000にリスナー起動
http.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});

// ソケット関連処理
chat_server.listen(http, app);
access_db.app(app);
