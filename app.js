// "./node_modules/.bin/nodemon" app.js を実行しておくと、ソース修正後にオートコンパイル
// ./node_modules/.bin/nodemon app.js (windows10)
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
const chat_server = require('./lib/chat_server');
const access_db = require('./lib/access_db');

// mySQL接続プール設定
const pool = mysql.createPool({
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
app.post('/agent', function(req, res) {
  startScreen(req, res, 'agent');
});
// visitorチャット画面起動
app.post('/visitor', function(req, res) {
  startScreen(req, res, 'visitor');
});

//【テスト用】sdk向けpostリクエスト発行
app.post('/post_to_sdk', function(req, res) {
  console.log('send to SDK： ' + req.body.key);
});

// ポートlocalhost:3000にリスナー起動
http.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});

// ソケット関連処理
chat_server.connectSocket(http, app);
// db関連処理
access_db.startFormWithDB(app);

// chat screen start
function startScreen(req, res, type) {
  let roomId = '';
  let agentId = '';
  // room入室
  if (type === 'agent') {
    roomId = req.body.entry_room_id_agent;
    agentId = req.body.entry_agent_id_agent;
  }
  res.render(type, {roomId: roomId, agentId: agentId});
}
