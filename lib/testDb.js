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
  startFormWithDB: function(response) {
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
          response.render('testDb', {lists: objs});
        });
      });
    }
  }
module.exports = access_db;
