// 各種import
const socketio = require('socket.io');
const moment = require('moment');
const request = require('request');
const access_db = require('./access_db');

let io;
let pool;

// コンストラクタ
let chat_server = {
  connectSocket: function(server, app) {
    io = socketio.listen(server).of('/chat/');
    // 通信メインロジック
    io.on('connection', function (socket) {
      console.log('connection start..' + socket.id)
      // agent message handling
      handleAgentMessage(socket);
      // visitor message handling
      handleVisitorMessage(socket);
      // disconnect event
      handleClientDisconnection(socket);
      // create new room
      createNewRoom(socket);
      // join room
      joinRoom(socket);

      //【テスト用】request handling
      handleRequest(app, socket);
    });
  }
}

// 【テスト用】request handler
function handleRequest(app) {
  // getメッセージ取得
  app.get('/get', function(req, res) {
    console.log('called get');
    io.emit('front chat message', 'agent', 'Get Request!!!');
    res.render('get');
  });
  // post検証画面起動
  app.get('/post', function(req, res) {
    res.render('post');
  });
  // postメッセージ取得(メッセージ送信)
  app.post('/post', function(req, res) {
    console.log('called post to' + req.body.id);
    io.to(req.body.id).emit('front chat message', 'agent', 'Post Request： ' + req.body.msg);
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
       emit('front chat message', 'agent', 'Post Request： ' + req.body.msg2);
    res.render('post');
  });
}



// エージェントメッセージ通信処理
function handleAgentMessage(socket) {
  socket.on('back chat message agent', (roomId, value) => {
    // SDK送信を想定したもの
    let options = {
      uri: "http://localhost:3000/post_to_sdk",
      headers: {"Content-type": "application/json",},
      json: {"key": value}
    };
    request.post(options, function(err, res, body){});
    console.log('message: ' + value);
    io.to(roomId).emit('front chat message', 'agent', socket.id + '：' + value);
    io.to(roomId).emit('front chat message', 'visitor', socket.id + '：' + value);
  });
}

// ビジターメッセージ通信処理
function handleVisitorMessage(socket) {
  socket.on('back chat message visitor', (roomId, value) => {
    console.log('message: ' + value);
    io.to(roomId).emit('front chat message', 'agent', socket.id + '：' + value);
    io.to(roomId).emit('front chat message', 'visitor', socket.id + '：' + value);
  });
}

// disconnect処理起動
function handleClientDisconnection(socket) {
  socket.on('disconnect', function() {
    console.log('disconnect.. ' + socket.id);
  });
}

// ルーム入室
function joinRoom(socket) {
  socket.on('join room', function(roomId, userType) {
    socket.join(roomId);
    io.to(roomId).emit('front chat message', userType, 'Romm #' + roomId + 'に入室しました。');
  });
}

// 新規ルーム作成
function createNewRoom(socket) {
  socket.on('new room', function(userType) {
    let dateFormat = moment().format('YYYY/MM/DD HH:mm:ss.SSS');
    let insertValue = '';
    let sql = '';
    let agentId = '';
    let visitorId = '';
    if (userType === 'agent') {
      agentId = socket.id;
    } else if(userType === 'visitor') {
      visitorId = socket.id;
      // ↓↓仮↓↓
      agentId = socket.id;
    } else {
      // エラー処理
    }
    insertValue = {
      'visitor_id': visitorId,
      'agent_id': agentId,
      'update_date': dateFormat
    }
    sql = 'insert into room_list set ?';
    access_db.insertRoomList(sql, insertValue, io, socket, userType);
  });
}

module.exports = chat_server;
