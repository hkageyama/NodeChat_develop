// 各種import
const mysql = require('mysql');
const moment = require('moment');

const USER_TYPE_AGENT = 'agent';      // ユーザータイプ：エージェント
const USER_TYPE_VISITOR = 'visitor';  // ユーザータイプ：ビジター


// mySQL接続プール設定
const pool = mysql.createPool({
    connectionLimit : 10,
    host     : 'localhost',
    user     : 'root',
    password : 'admin',
    database : 'exchat'
});

let accessDb = {

  // エージェント画面表示
  startAgentForm: function(res) {
    pool.getConnection(function(err, connection) {
      let obj = [];
      let sql = 'select * from room_list where delete_flg = "0"';
      // let sql = 'selecta * from room_list where delete_flg = "0"';
      // ルームリスト取得
      connection.query(sql, function(error, results, fields) {
        if (error) {
          // コールバックによるエラー制御
          accessDb.handleRequestError(new Error("Execute SQL Error!"), res);
          // DBコネクション切断
          connection.release();
          return false;
        }
        // 取得結果をオブジェクトに格納(resultsはconnection.release後に消滅する為)
        for (let i = 0; i < results.length; i++) {
          obj.push({'room_id': results[i].room_id, 'visitor_id': results[i].agent_id});
        }
        // DBコネクション切断
        connection.release();
        // エージェント画面表示
        res.render('agent', {lists: obj});
      });
    });
  },

  // test
  checkChatId: function(chatId, chatIo, statusIo, socket, userType, rooms) {
    pool.getConnection(function(err, connection) {
      let sql = 'select * from room_list where visitor_id=?';
      let value = [chatId];
      let roomId;
      // ルームリスト取得
      connection.query(sql, value, function(error, results, fields) {
        if (error) {
          // コールバックによるエラー制御
          accessDb.handleSocketError(new Error("Execute SQL Error!"), socket.id, chatIo);
          // DBコネクション切断
          connection.release();
          return false;
        }
        // 取得結果をオブジェクトに格納(resultsはconnection.release後に消滅する為)
        for (let i = 0; i < results.length; i++) {
          roomId = results[i].room_id;
          break;
        }
        // DBコネクション切断
        connection.release();
        if (roomId != undefined ) {
          accessDb.doClientProcess(roomId, chatIo, statusIo, socket, userType, rooms);
        } else {
          // 入室時処理
          accessDb.insertRoomProcess(chatIo, statusIo, socket, userType, rooms);
        }
      });
    });
  },

  // 入室時処理
  insertRoomProcess: function(chatIo, statusIo, socket, userType, rooms) {
    pool.getConnection(function(err, connection) {

      let userType = socket.handshake.query['userType'];
      let dateFormat = moment().format('YYYY/MM/DD HH:mm:ss.SSS');
      let param, sql, agentId, visitorId = '';
    
      // insertパラメータ用項目設定
      if (userType === USER_TYPE_AGENT) {
        agentId = socket.conn.id;
      } else {
        visitorId = socket.handshake.query['chatId'];
      }
      sql = 'insert into room_list set ?';
      // Insertパラメータ生成
      param = {'visitor_id': visitorId, 'agent_id': agentId, 'update_date': dateFormat}

      // ルームリスト登録
      connection.query(sql, param, function(error, results, fields){
          if (error) {
            // コールバックによるエラー制御
            accessDb.handleSocketError(new Error("Execute SQL Error!"), socket.id, chatIo);
            // DBコネクション切断
            connection.release();
            return false;
          }
          let roomId = results.insertId;
          // DBコネクション切断
          connection.release();
          // クライアントプロセス
          accessDb.doClientProcess(roomId, chatIo, statusIo, socket, userType, rooms);
      });
    });
  },

  // 指定SQLの実行
  executeSql: function(sql, param, socketId, chatIo) {
    pool.getConnection(function(err, connection) {
      // 実行
      connection.query(sql, param, function(error, results, fields) {
        if (error) { 
          // コールバックによるエラー制御
          accessDb.handleSocketError(new Error("Execute SQL Error!"), socketId, chatIo);
          // DBコネクション切断
          connection.release();
          return false;
        }
        // DBコネクション切断
        connection.release();
      });
    });
  },

  // エラーハンドリング(socket)
  handleSocketError: function(error, socketId, chatIo) {
    if (error) {
      console.log(error);
      let message = error.message;
      let stackTrace = error.stack;
      // エラーメッセージ表示
      // errorをemitで直接clientに渡すとclientで参照できない
      chatIo.to(socketId).emit('error', message, stackTrace);
      return;
    }
  },

  // エラーハンドリング(http)
  handleRequestError: function(error, res) {
    if (error) {
      console.log(error);
      let message = error.message;
      let stackTrace = error.stack;
      // エラーメッセージ表示
      res.writeHead(500, {'Content-Type': 'text/plain'});
      res.write('Error 500: ' + message);
      res.write(stackTrace);
      res.end();
      return;
    }
  }, 

  // エラーハンドリング(http)
  doClientProcess: function(roomId, chatIo, statusIo, socket, userType, rooms) {
    // 入室
    socket.join(roomId);
    // 入室管理情報編集
    if (rooms[socket.conn.id] === undefined) {
      rooms[socket.conn.id] = {};
      rooms[socket.conn.id][roomId] = true;
    } else {
      rooms[socket.conn.id][roomId] = true;
    }
    // [emit]新規チャットウィジェットオープン
    chatIo.to(roomId).emit('front open widget', roomId, userType);
    // [emit]ウィジェット更新
    chatIo.to(roomId).emit('front refresh', roomId, userType);
    // [emit]入室メッセージ表示
    socket.broadcast.to(roomId).emit('front chat message', 
      socket.id + ' さんが入室しました。', roomId, userType);
    // [emit]ルームリスト追加
    statusIo.emit('front append room list', roomId, socket.conn.id);
  }

}

module.exports = accessDb;
