// 各種import
const mysql = require('mysql');
const moment = require('moment');

// mySQL接続プール設定
const pool = mysql.createPool({
    connectionLimit : 10,
    host     : 'localhost',
    user     : 'root',
    password : 'admin',
    database : 'exchat'
});

let accessDb = {
  // 入室画面表示
  // ROOM_LISTを取得し、取得結果を入室画面にrenderで渡す
  startFormWithDB: function(res) {
    // 入室画面表示
    pool.getConnection(function(err, connection) {
      let objs = [];
      let sql = 'select * from room_list';
      connection.query(sql, function(error, results, fields) {
        if (error) throw error;
        for (let i = 0; i < results.length; i++) {
          objs.push({'room_id': results[i].room_id, 'agent_id': results[i].agent_id});
        }
        connection.release();
        res.render('entry', {lists: objs});
      });
    });
  },

  // ルームリスト登録
  insertRoomList: function(sql, param, chatIo, statusIo, socket, userType) {
    pool.getConnection(function(err, connection) {
      connection.query(sql, param, function(error, results, fields){
          if (error) throw error;
          let roomId = results.insertId;
          socket.join(roomId);
          chatIo.to(roomId).emit('front open widget', roomId);
          chatIo.to(roomId).emit('front refresh', roomId, userType);
          socket.broadcast.to(roomId).emit('front chat message', userType, 
            socket.id + ' さんが入室しました。', roomId);
          statusIo.emit('front append room list', roomId, socket.id);
      });
      connection.release();
    });
  },

    // ルームリスト削除
  deleteRoomList: function(sql, param) {
    pool.getConnection(function(err, connection) {
      connection.query(sql, param, function(error, results, fields) {
        if (error) throw error;
      });
      connection.release();
    });
  },

  // ルームリスト更新
  updateRoomList: function(sql, param, chatIo, socket, type) {
    pool.getConnection(function(err, connection) {
      connection.query(sql, param, function(error, results, fields){
          if (error) throw error;
          let roomId = param[2];
          socket.join(roomId);
          chatIo.to(roomId).emit('front set header ' + type, roomId, socket.id);
        }
      );
      connection.release();
    });
  },

  // 訪問者リスト登録
  insertVisitorList: function(insertValue) {
    pool.getConnection(function(err, connection) {
      connection.query("insert into visitor_list set ?", insertValue, 
        function(error, results, fields){
          if (error) throw error;
        }
      );
      connection.release();
    });
  }
}

module.exports = accessDb;
