// 各種import
var socketio = require('socket.io');
var moment = require('moment');
var request = require('request');
var Access_db = require('./access_db');

var io;
var pool;
// コンストラクタ
var Chat_server = function(dbPool) {};

Chat_server.prototype.listen = function(server, app) {
  io = socketio.listen(server);
  // 通信メインロジック
  io.sockets.on('connection', function (socket) {
    console.log('connection start..' + socket.id)
    // request handling
    handleRequest(app);
    // agent message handling
    handleAgentMessage(socket);
    // visitor message handling
    handleVisitorMessage(socket);
    // disconnect event
    handleClientDisconnection(socket);
    // chat画面起動
    startChatForm(socket);
  });
};

// request handler
function handleRequest(app) {
  // getメッセージ取得
  app.get('/get', function(req, res) {
    console.log('called get');
    io.emit('front chat message agent', 'Get Request!!!');
    res.render('get');
  });
  // post検証画面起動
  app.get('/post', function(req, res) {
    res.render('post');
  });
  // postメッセージ取得
  app.post('/post', function(req, res) {
    console.log('called put');
    io.emit('front chat message agent', 'Post Request： ' + req.body.msg);
    res.render('post');
  });
}
// エージェントメッセージ通信処理
function handleAgentMessage(socket) {
  socket.on('back chat message agent', (msg) => {
    var options = {
      uri: "http://localhost:3000/post_to_sdk",
      headers: {"Content-type": "application/json",},
      json: {"key": msg}
    };
    request.post(options, function(err, res, body){});
    console.log('message: ' + msg);
    // 自分以外
    // socket.broadcast.to(socket.handshake.query['room_id']).
    //   emit('front chat message agent', 'agent：' + msg);
    // 自分含める
    io.to(socket.handshake.query['room_id']).
      emit('front chat message agent', 'agent：' + msg);
    io.emit('front chat message visitor', 'agent：' + msg);
  });
}
// 訪問者メッセージ通信処理
function handleVisitorMessage(socket) {
  socket.on('back chat message visitor', (msg) => {
    console.log('message: ' + msg);
    io.emit('front chat message visitor', 'visitor：' + msg);
    io.emit('front chat message agent', 'visitor：' + msg);
  });
}
// disconnect処理起動
function handleClientDisconnection(socket) {
  socket.on('disconnect', function() {
    console.log('disconnect.. ' + socket.id);
  });
}
// チャット画面起動処理
function startChatForm(socket) {
  // DBアクセサ設定
  let access_db = new Access_db();
  let dateFormat = moment().format('YYYY/MM/DD HH:mm:ss.SSS');
  let insertValue = '';
  let sql = '';
  if(socket.handshake.query['user_type'] === 'agent') {
    // agent画面起動時の処理
    // room入室
    var room = socket.handshake.query['room_id'];
    if (room === '/') {
      insertValue = {
        'visitor_id': socket.id,
        'agent_id': '',
        'update_date': dateFormat
      }
      sql = 'insert into room_list set ?';
      access_db.insertRoomList(sql, insertValue, io, socket.id);
    } else {
      socket.join(room);
    }
  } else if (socket.handshake.query['user_type'] === 'visitor') {
    // visitor画面起動時の処理
    insertValue = {
      'visitor_id': socket.id,
      'visitor_name': 'VISITOR_' + socket.id, 
      'room_name': 'ROOM_' + socket.id, 
      'agent_id': '',
      'datetime': dateFormat
    }
    access_db.insertVisitorList(insertValue);
  }
}

module.exports = Chat_server;