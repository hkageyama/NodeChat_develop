// 各種import
const socketio = require('socket.io');
const moment = require('moment');
const request = require('request');
const accessDb = require('./accessDb');

const DISCONNECT_TRUE = true;         // ウィジェット「x」ボタン押下時
const DISCONNECT_FALSE = false;       // ウィジェット「Fin」ボタン押下時
const USER_TYPE_AGENT = 'agent';      // ユーザータイプ：エージェント
const USER_TYPE_VISITOR = 'visitor';  // ユーザータイプ：ビジター

let chatIo;       // ソケット通信用オブジェクト(チャット用)
let statusIo;     // ソケット通信用オブジェクト(ステータス管理用)
let rooms = {};

// コンストラクタ
let chatServer = {
  connectSocket: function(server, app) {

    // ソケットリスナ起動
    socketioServer = socketio.listen(server)

    // ステータス管理用ソケット通信
    statusIo = socketioServer.of('/status');
    statusIo.on('connection', function (socket) {
      console.log('status connection start.. ' + socket.id)
      // 入室
      joinRoomBeta(socket);
    });

    // チャットソケット通信
    chatIo = socketioServer.of('/chat');
    chatIo.on('connection', function (socket) {
      console.log('chat connection start.. ' + socket.id)

      // メッセージ通信
      handleMessage(socket);
      // コネクション切断
      handleDisconnection(socket);
      // 部屋作成
      createRoom(socket);
      // 入室
      joinRoom(socket);
      // 退室
      leaveRoom(socket);

      // [テスト用]GET/POST通信
      handleHttpRequest(app, socket);
    });
  }
}

// 【テスト用】http request handler
function handleHttpRequest(app) {

  // [TEST] GETメッセージ取得
  app.get('/get', function(req, res) {
    console.log('called get');
    chatIo.emit('front chat message', 'Get Request!!!', '18', USER_TYPE_AGENT);
    res.render('get');
  });
  // [TEST] POST検証画面起動
  app.get('/post', function(req, res) {
    res.render('post');
  });
  // [TEST] POSTメッセージ取得(メッセージ送信)
  app.post('/post', function(req, res) {
    console.log('called post to' + req.body.id);
    chatIo.to(req.body.id).emit('front chat message', 'Post Request： ' + req.body.msg, req.body.id, USER_TYPE_AGENT);
    res.render('post');
  });
  // [TEST] POSTメッセージ取得(ルーム招待)
  app.post('/invitation', function(req, res) {
    console.log('invitation to ' + req.body.agent_id + ' to Room#' + req.body.room_id);
    chatIo.to(req.body.agent_id).emit('front invitation', req.body.agent_id, req.body.room_id);
    res.render('post');
  });
  // [TEST] POSTメッセージ取得(メッセージ送信)
  app.post('/msg2', function(req, res) {
    console.log('called post to' + req.body.id);
    chatIo.to(req.body.id1).to(req.body.id2).
        emit('front chat message', 'Post Request： ' + req.body.msg2, req.body.id1, USER_TYPE_AGENT);
    res.render('post');
  });

}

/////////////////
// リスナー関連 //
/////////////////

// メッセージ通信
function handleMessage(socket) {
  // リスナー登録
  socket.on('back chat message', (roomId, value) => {
    console.log('message handle: Room#' + roomId + ' id:' + socket.id + ' msg:' + value);

    // [テスト用]SDK通信処理用設定
    let options = {
      uri: "http://localhost:3000/post_to_sdk",
      headers: {"Content-type": "application/json",},
      json: {"key": value}
    };
    // [テスト用]SDK通信処理
    request.post(options, function(err, res, body){});

    // [emit] メッセージ表示
    chatIo.to(roomId).emit('front chat message', socket.id + '：' + value, roomId, socket.handshake.query['userType']);
  });
}

// コネクション切断
function handleDisconnection(socket) {
  // リスナー登録
  socket.on('disconnect', function() {
    console.log('disconnect. ' + socket.id);

    //「X」ボタン押下時、入退室管理情報一括削除
    for (room in rooms[socket.conn.id]) {
      console.log(socket.conn.id + ':' + room + ' delete');

      // 入退室管理情報削除
      delete rooms[socket.conn.id][room];
      // 部屋削除
      removeRoom(room, socket, DISCONNECT_TRUE);
    }
  });
}

// 入室
function joinRoom(socket) {
  // リスナー登録
  socket.on('join room', function(roomId) {
    console.log('join room. Room#' + roomId + ' id:' + socket.id);

    // 入室管理情報編集
    // キー：ソケットID＋ルームID
    if (rooms[socket.conn.id] === undefined) {
      rooms[socket.conn.id] = {};
      rooms[socket.conn.id][roomId.trim()] = true;
    } else {
      rooms[socket.conn.id][roomId.trim()] = true;
    }
    // ルーム入室
    socket.join(roomId);
    // [emit] ウィジェット更新
    chatIo.to(roomId).emit('front refresh', roomId, socket.handshake.query['userType']);
    // [emit] 入室メッセージ表示
    socket.broadcast.to(roomId).emit('front chat message',
      socket.id + ' さんが入室しました。', roomId, socket.handshake.query['userType']);
  });
}

// 退室
function leaveRoom(socket) {
  // リスナー登録
  socket.on('leave room', function(roomId) {
    console.log('leave room. Room#' + roomId + ' id:' + socket.id);

    // 入室管理情報削除
    delete rooms[socket.conn.id][roomId];

    // test!!!
    console.log('test!');
    statusIo.to(roomId).emit('front chat message Beta',
      socket.id + ' さん!!!★★', roomId, socket.handshake.query['userType']);
    console.log('test!');

    // 部屋削除
    removeRoom(roomId, socket, DISCONNECT_FALSE);
  });
}

// 入室
function joinRoomBeta(socket) {
  // リスナー登録
  socket.on('join room Beta', function(roomId) {
    console.log('join room Beta. Room#' + roomId + ' id:' + socket.id);

    // ルーム入室
    socket.join(roomId);
  });
}

//////////
//////////

// 部屋削除
function removeRoom(roomId, socket, disconFlg) {
  var deleteRoom = function(roomId) {
    // 退室が最後の一人だった場合の処理
    let sql = 'update room_list set delete_flg = "1" where room_id = ?';
    // let sql = 'deleta from room_list where room_id = ?';
    let value = [roomId];

    // [emit] エージェント画面ルームリストから削除
    statusIo.emit('front remove room list', roomId);
    // ルームリストからレコード論理削除
    accessDb.executeSql(sql, value, socket.id, chatIo);
  };

  if ((disconFlg === DISCONNECT_TRUE) && 
    (chatIo.adapter.rooms[roomId] === undefined)) {
    // ウィジェット「X」ボタン押下 ＋ 最後の一人
    //「X」ボタン押下時は該当者の退室処理が既に実行済み(SOCKET.IO側で実行)となる為、
    // 指定のルーム入室人数は[undefined=0]となる(退室処理不要)
    // 部屋削除
    deleteRoom(roomId);

  } else if ((disconFlg === DISCONNECT_FALSE) && 
    (chatIo.adapter.rooms[roomId].length === 1)) {
    // FINボタン押下 ＋ 最後の一人
    // 部屋削除
    deleteRoom(roomId);
    // 退室
    socket.leave(roomId);

  } else {
    // [emit] 退室メッセージ表示
    socket.broadcast.to(roomId).emit('front chat message', 
      socket.id + ' さんが退室しました。', roomId, socket.handshake.query['userType']);
    // 退室
    socket.leave(roomId);
  }
}

// 部屋作成
function createRoom(socket) {
  let userType = socket.handshake.query['userType'];
  let chatId = socket.handshake.query['chatId'];

  // リスナー登録
  socket.on('new room', function() {
    console.log('agent create room. id:' + socket.id);
    accessDb.insertRoomProcess(chatIo, statusIo, socket, userType, rooms);
  });

  // ビジターの場合はウィジェット起動時に部屋作成
  if (userType === USER_TYPE_VISITOR) {
    if (chatId === undefined) {
      console.log('visotor create room. id:' + socket.id);
      // 部屋作成
      accessDb.insertRoomProcess(chatIo, statusIo, socket, userType, rooms);
    } else {
      accessDb.openVisitorForm(chatId, chatIo, statusIo, socket, userType, rooms);
    }
  }
}

module.exports = chatServer;
