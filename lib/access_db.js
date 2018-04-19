// 各種import
const mysql = require('mysql');

// mySQL接続プール設定
var pool = mysql.createPool({
    connectionLimit : 10,
    host     : 'localhost',
    user     : 'root',
    password : 'admin',
    database : 'exchat'
});

// コンストラクタ
var Access_db = function() {};

// 入室画面表示
// ROOM_LISTを取得し、取得結果を入室画面にrenderで渡す
Access_db.prototype.app = function(app) {
  app.get('/entry', function(req, res) {
    var objs = [];
    pool.getConnection(function(err, connection) {
      let sql = 'select * from room_list';
      connection.query(sql, function(error, results, fields){
        if (error) throw error;
        for (var i = 0; i < results.length; i++) {
          objs.push({'room_id': results[i].room_id, 'visitor_id': results[i].visitor_id});
        }
        connection.release();
        res.render('entry', {lists: objs});
      });
    });
  });
// 入室画面2表示
app.get('/select', function(req, res) {
    var objs = [];
    pool.getConnection(function(err, connection) {
      let sql = 'select * from room_list';
      connection.query(sql, function(error, results, fields){
        if (error) throw error;
        for (var i = 0; i < results.length; i++) {
          objs.push({'room_id': results[i].room_id, 'visitor_id': results[i].visitor_id});
        }
        connection.release();
        res.render('select', {lists: objs});
      });
    });
  });
};

// ルームリスト登録
Access_db.prototype.insertRoomList = function(sql, param, io, id) {  
  pool.getConnection(function(err, connection) {
    connection.query(sql, param,
      function(error, results, fields){
        if (error) throw error;
        io.emit('front set header agent', results.insertId, id);
      }
    );
    connection.release();
  });
}

// ルームリスト更新
Access_db.prototype.updateAgentList = function(insertValue) {
  pool.getConnection(function(err, connection) {
    connection.query("insert into room_list set ?", insertValue, 
      function(error, results, fields){
        if (error) throw error;
        // console.log(fields);
      }
    );
    connection.release();
  });
}

// 訪問者リスト登録
Access_db.prototype.insertVisitorList = function(insertValue) {  
  pool.getConnection(function(err, connection) {
    connection.query("insert into visitor_list set ?", insertValue, 
      function(error, results, fields){
        if (error) throw error;
      }
    );
    connection.release();
  });
}
module.exports = Access_db;
