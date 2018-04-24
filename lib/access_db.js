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

let access_db = {
  // 入室画面表示
  // ROOM_LISTを取得し、取得結果を入室画面にrenderで渡す
  startFormWithDB: function(app) {
    // 入室画面表示
    app.get('/', function(req, res) {
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
    });
  },

  // ルームリスト登録
  insertRoomList: function(sql, param, io, socket, userType) {
  pool.getConnection(function(err, connection) {
    connection.query(sql, param, function(error, results, fields){
        if (error) throw error;
        let roomId = results.insertId;
        socket.join(roomId);
        io.to(roomId).emit('front refresh', roomId, socket.id, userType);
        io.to(roomId).emit('front chat message', userType, 'Romm #' + roomId + 'に入室しました。');
      });
      connection.release();
    });
  },

  // ルームリスト更新
  updateRoomList: function(sql, param, io, socket, type) {
    pool.getConnection(function(err, connection) {
      connection.query(sql, param, function(error, results, fields){
          if (error) throw error;
          let roomId = param[2];
          socket.join(roomId);
          io.to(roomId).emit('front set header ' + type, roomId, socket.id);
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

module.exports = access_db;
