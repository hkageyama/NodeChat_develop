// 各種import
var socketio = require('socket.io');
var moment = require('moment');
var request = require('request');
var Access_db = require('./access_db');
var io;
var pool;


var test_chat_server_ex = {

  // テスト関数
  loggerTest: function(){
    console.log('loggerTestFunctionCalled');
  },

  // socketをlisten
  listen: function(server, app) {
   io = socketio.listen(server).of('/test_chat');

    // 通信メインロジック
    io.on('connection', function (socket) {
      console.log('connected to test chat : socketId=' + socket.id)
      io.join('testRoomId');
      io.emit.to('testRoomId').emit('assignRoom', 'testRoomId');
    });
  }

};


module.exports = test_chat_server_ex;
