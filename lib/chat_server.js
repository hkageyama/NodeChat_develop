// 各種import
var socketio = require('socket.io');
var moment = require('moment');
var request = require('request');
var Access_db = require('./access_db');

var io;
var pool;

// コンストラクタ
console.log('before constructor')
var Chat_server = function() {return 'ok'};
console.log(Chat_server);
console.log(Chat_server);
console.log('after constructor')

Chat_server.prototype.listen = function(server, app) {
  io = socketio.listen(server).of('/chat');
  // 通信メインロジック
  // io.sockets.on('connection', function (socket) {
  io.on('connection', function (socket) {
    console.log('connection start..' + socket.id)
    // request handling
    handleRequest(app, socket);
    // agent message handling
    handleAgentMessage(socket);
    // visitor message handling
    handleVisitorMessage(socket);
    // disconnect event
    handleClientDisconnection(socket);
    // chat画面起動
    startChatForm(socket);
    // room invitaion handling
    handleInvitaion(socket);
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
  // postメッセージ取得(メッセージ送信)
  app.post('/post', function(req, res) {
    console.log('called post to' + req.body.id);
    io.to(req.body.id).emit('front chat message agent', 'Post Request： ' + req.body.msg);
    res.render('post');
  });
  // postメッセージ取得(ルーム招待)
  app.post('/invitation', function(req, res) {
    console.log('invitation to ' + req.body.agent_id + ' to Room#' + req.body.room_id);
    io.to(req.body.agent_id).emit('front invitation', req.body.agent_id, req.body.room_id);
    res.render('post');
  });
  // postメッセージ取得(メッセージ送信)
  app.post('/msg2', function(req, res) {
    console.log('called post to' + req.body.id);
    io.to(req.body.id1).to(req.body.id2).
       emit('front chat message agent', 'Post Request： ' + req.body.msg2);
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
    console.log('message: ' + msg + ' to Room#' + socket.handshake.query['room_id']);
    io.to(socket.handshake.query['room_id']).
      emit('front chat message agent', socket.id + '：' + msg);
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
// 【ポストから】ルーム招待処理
function handleInvitaion(socket) {
  socket.on('back invitation', (room_id) => {
    console.log('invitation to Room#' + room_id);
    socket.join(room_id);
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
  let queryParam = '';
  let sql = '';
  if(socket.handshake.query['user_type'] === 'agent') {
    // agent画面起動時の処理
    // room入室
    var agent = socket.handshake.query['agent_id'];
    if (agent === '/') {
      console.log(socket.handshake.query['room_id']);
      queryParam = [
        socket.id,
        dateFormat,
        socket.handshake.query['room_id']
      ];
      // queryParam = {
      //   agent_id: socket.id,
      //   update_date: dateFormat,
      //   room_id: socket.handshake.query['room_id']
      // };
      sql = 'update room_list set agent_id=?, update_date=? where room_id =?';
      // sql = 'update room_list set ' +
      //   'agent_id = :agent_id, ' +
      //   'update_date = :update_date ' +
      //   'where room_id = :room_id';
      access_db.updateRoomList(sql, queryParam, io, socket);
    } else {
      socket.join(socket.handshake.query['room_id']);
      // console.log(io.sockets.adapter.rooms[2].sockets);
    }
  } else if (socket.handshake.query['user_type'] === 'visitor') {
    // visitor画面起動時の処理
    queryParam = {
      'visitor_id': socket.id,
      'visitor_name': 'VISITOR_' + socket.id, 
      'room_name': 'ROOM_' + socket.id, 
      'agent_id': '',
      'datetime': dateFormat
    };
    access_db.insertVisitorList(queryParam);
  }
}

module.exports = Chat_server;
