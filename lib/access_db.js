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

Access_db.prototype.app = function(app) {
  app.get('/entry', function(req, res) {
    var objs = [];
    pool.getConnection(function(err, connection) {
      connection.query("select * from room_list", function(error, results, fields){
        if (error) throw error;
        for (var i = 0; i < results.length; i++) {
          objs.push({'room_id': results[i].room_id});
        }
        connection.release();
        res.render('entry', {lists: objs});
      });
    });
  });
};

// ルームリスト登録
Access_db.prototype.insertAgentList = function(insertValue) {  
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
