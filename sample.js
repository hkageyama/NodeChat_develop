

const app = require('express')();
const http = require('http').Server(app);

http.listen(3000);

const chatServer = require('./lib/chatServer');
chatServer.connectSocket(http, app);



let chatIo;
let statusIo;
let chatServer = {
  connectSocket: function(server, app) {

    const socketio = require('socket.io');
    socketioServer = socketio.listen(server)

    statusIo = socketioServer.of('/status');

    statusIo.on('connection', function (socket) {
      // ～各処理
    });

    chatIo = socketioServer.of('/chat');

    chatIo.on('connection', function (socket) {
      // ～各処理
    });
  }
}



let chatIo;
let chatServer = {
  connectSocket: function(server, app) {

    const socketio = require('socket.io');
    socketioServer = socketio.listen(server)
    chatIo = socketioServer.of('/chat');

    chatIo.on('connection', function (socket) {
      socket.on('back chat message', (roomId, value) => {

        let options = {
          uri: "http://localhost:3000/post_to_sdk",
          headers: {"Content-type": "application/json",},
          json: {"key": value}
        };        
        const request = require('request');
        request.post(options, function(err, res, body){});
    
        chatIo.to(roomId).emit('front chat message', socket.id + '：' + value, 
          roomId, socket.handshake.query['userType']);
      });
    });
  }
}


const CONTENT_OBJECT_NAME_HEADER = '#content-';
const MESSAGES_OBJECT_NAME = 'messages';
const INPUT_OBJECT_NAME = 'input';

chatSocket.on('front chat message', (msg, roomId, userType) => {

  let contentDomId = CONTENT_OBJECT_NAME_HEADER + roomId;

  $(contentDomId).find('[name='+ MESSAGES_OBJECT_NAME + ']').append($('<li>').text(msg));
  $(contentDomId).find('[name='+ MESSAGES_OBJECT_NAME + ']').
      scrollTop($(contentDomId).find('[name='+ MESSAGES_OBJECT_NAME + ']').prop('scrollHeight'));
});

$(document).on('click', '[name=btn_send]', function() {

  let contentDomId = '#' + $(this).parent().parent().attr('id');
  let roomId =  contentDomId.substr(val.indexOf('-') + 1);
  let message = $(this).parent().parent().find('[name=' + INPUT_OBJECT_NAME + ']').val();

  chatSocket.emit('back chat message', roomId, message);
  $(contentDomId).find('[name='+ INPUT_OBJECT_NAME + ']').val('');

});





const CONTENT_OBJECT_NAME_HEADER = '#content-';
// ルームリストからRoom#を取得する際の取得開始位置
const ROOM_NO_POSIT = 7;
// ウィジェットDOM
const DOM_AGENT_WIDGET = "" +
'<div class="content" id="content-">' +
'  <div class="header" name="header"></div>' +
'  <div class="messages" name="messages"></div>' +
'  <div class="form" name="form">' +
'    <input type="text"   class="input" name="input" />' +
'    <input type="button" class="btn" name="btn_fin" value="Fin" />' +
'    <input type="button" class="btn" name="btn_send" value="Snd" />' +
'  </div>' +
'</div>';

$(document).on('click', '.room_list_div', function(){
  let roomInfo = $(this).text().trim();
  let roomId = roomInfo.
      substr(ROOM_NO_POSIT, roomInfo.indexOf(':') - (ROOM_NO_POSIT + 1)).trim();
  
  let obj = $(DOM_AGENT_WIDGET).appendTo('#parent');
  obj.attr("id", "content-" + roomId);
    
  chatSocket.emit('join room', roomId);
});

var createWidget = function(roomId) {
     
  let obj = $(DOM_AGENT_WIDGET).appendTo('#parent');
  obj.attr("id", "content-" + roomId);
}


chatSocket.on('front refresh', (roomId, userType) => {
  let contentDomId = CONTENT_OBJECT_NAME_HEADER + roomId;

  $(contentDomId).find('[name='+ HEADER_OBJECT_NAME + ']').empty();
  $(contentDomId).find('[name='+ HEADER_OBJECT_NAME + ']').append('Room # ' + roomId);
});

chatSocket.on('front chat message', (msg, roomId, userType) => {
  let contentDomId = CONTENT_OBJECT_NAME_HEADER + roomId;

  $(contentDomId).find('[name='+ MESSAGES_OBJECT_NAME + ']').append($('<li>').text(msg));
  $(contentDomId).find('[name='+ MESSAGES_OBJECT_NAME + ']').
      scrollTop($(contentDomId).find('[name='+ MESSAGES_OBJECT_NAME + ']').prop('scrollHeight'));
});


const socketio = require('socket.io');
socketioServer = socketio.listen(server)
chatIo = socketioServer.of('/chat');

chatIo.on('connection', function (socket) {
  socket.on('join room', function(roomId) {

    socket.join(roomId);

    chatIo.to(roomId).emit('front refresh', roomId, socket.handshake.query['userType']);

    socket.broadcast.to(roomId).emit('front chat message',
      socket.id + ' さんが入室しました。', roomId, socket.handshake.query['userType']);
  });
});
