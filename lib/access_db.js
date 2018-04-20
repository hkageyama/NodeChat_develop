// 各種import
const mysql = require('mysql');
const moment = require('moment');

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
  app.get('/entry_', function(req, res) {
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
app.get('/', function(req, res) {
    var objs = [];
    pool.getConnection(function(err, connection) {
      let sql = 'select * from room_list';
      connection.query(sql, function(error, results, fields){
        if (error) throw error;
        for (var i = 0; i < results.length; i++) {
          objs.push({'room_id': results[i].room_id, 'agent_id': results[i].agent_id});
        }
        connection.release();
        res.render('entry', {lists: objs});
      });
    });
  });
  // agentチャット画面起動
  app.post('/agent', function(req, res) {
    // DBアクセサ設定
    let access_db = new Access_db();
    let dateFormat = moment().format('YYYY/MM/DD HH:mm:ss.SSS');
    let insertValue = '';
    let sql = '';
    // agent画面起動時の処理
    // room入室
    var room = req.body.room_id;
    if (room === '') {
      insertValue = {
        'visitor_id': '',
        'agent_id': '',
        'update_date': dateFormat
      }
      sql = 'insert into room_list set ?';
      access_db.insertRoomList(sql, insertValue, res);
    } else {
      res.render('agent', {room_id: req.body.room_id, agent_id: req.body.agent_id});
    }
  });
};

// ルームリスト登録
Access_db.prototype.insertRoomList = function(sql, param, res) {  
  pool.getConnection(function(err, connection) {
    connection.query(sql, param, function(error, results, fields){
        if (error) throw error;
        res.render('agent', {room_id: results.insertId, agent_id: ''});
      }
    );
    connection.release();
  });
}

// ルームリスト更新
Access_db.prototype.updateRoomList = function(sql, param, io, socket) {
  pool.getConnection(function(err, connection) {
    connection.query(sql, param, function(error, results, fields){
        if (error) throw error;
        let room_id = param[2];
        // let room_id = param.room_id;
        socket.join(room_id);
        io.to(room_id).emit('front set header agent', room_id, socket.id);
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
