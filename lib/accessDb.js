// 各種import
const mysql = require('mysql');
const moment = require('moment');

const USER_TYPE_AGENT = 'agent';      // ユーザータイプ：エージェント
const USER_TYPE_VISITOR = 'visitor';  // ユーザータイプ：ビジター
const APPEND_LIST_TRUE = '1';         // ユーザーリスト追加
const APPEND_LIST_FALSE = '0';        // ユーザーリスト追加不要


// mySQL接続プール設定
const pool = mysql.createPool({
    connectionLimit : 10,
    host     : 'localhost',
    user     : 'root',
    password : 'admin',
    database : 'exchat'
});

let accessDb = {

  // エージェント画面オープン
  openAgentForm: function(res, chatId) {
    pool.getConnection(function(err, connection) {
      let obj = [];
      let sql = 'select * from room_list where delete_flg = "0"';
      // let sql = 'selecta * from room_list where delete_flg = "0"';

      // ルームリスト取得
      connection.query(sql, function(error, results, fields) {
        // エラー制御
        if (error) {
          // コールバックによるエラー制御
          accessDb.handleRequestError(new Error("Execute SQL Error!"), res);
          // DBコネクション切断
          connection.release();
          return false;
        }

        // 取得結果をオブジェクトに格納(resultsはconnection.release後に消滅する為)
        for (let i = 0; i < results.length; i++) {
          obj.push({'room_id': results[i].room_id, 'visitor_id': results[i].visitor_id});
        }

        // DBコネクション切断
        connection.release();
        // エージェント画面表示
        res.render('agent', {lists: obj, chatId:chatId});
      });
    });
  },

  // ビジター画面オープン
  openVisitorForm: function(chatId, chatIo, statusIo, socket, userType, rooms) {
    pool.getConnection(function(err, connection) {
      let sql = 'select * from room_list where visitor_id=?';
      let param = [chatId];
      let roomId;
      let delFlg;

      // ルームリスト取得
      connection.query(sql, param, function(error, results, fields) {
        // エラー制御
        if (error) {
          // コールバック
          accessDb.handleSocketError(new Error("Execute SQL Error!"), socket.id, chatIo);
          // DBコネクション切断
          connection.release();
          return false;
        }

        // 取得結果をオブジェクトに格納(resultsはconnection.release後に消滅する為)
        // ビジターIDでルーム情報を取得し、はじめの1件目を変数に格納しループから出る
        for (let i = 0; i < results.length; i++) {
          roomId = results[i].room_id;
          delFlg = results[i].delete_flg;
          break;
        }

        // DBコネクション切断
        connection.release();

        if (roomId != undefined ) {
          // 過去に訪問した事があるビジター ⇒ 既存ルームに入室
          sql = 'update room_list set delete_flg = "0" where room_id = ?';
          param = [roomId];
          // ルームリストの論理削除レコードを復旧
          accessDb.executeSql(sql, param, socket.id, chatIo);
          // ウィジェット生成時のソケット処理
          accessDb.doSocketProcess(roomId, chatIo, statusIo, socket, userType, rooms, delFlg);

        } else {
          // 初めて訪問したビジター ⇒ 新規ルーム作成
          accessDb.insertRoomProcess(chatIo, statusIo, socket, userType, rooms);
        }

      });
    });
  },

  // 新規ルーム作成
  insertRoomProcess: function(chatIo, statusIo, socket, userType, rooms) {
    pool.getConnection(function(err, connection) {
      let userType = socket.handshake.query['userType'];
      let dateFormat = moment().format('YYYY/MM/DD HH:mm:ss.SSS');
      let param, sql, agentId, visitorId, roomId = '';
    
      // insertパラメータ用項目設定
      if (userType === USER_TYPE_AGENT) {
        agentId = socket.conn.id;
        visitorId = socket.handshake.query['chatId'];
      } else {
        visitorId = socket.handshake.query['chatId'];
      }

      sql = 'insert into room_list set ?';
      param = {'visitor_id': visitorId, 'agent_id': agentId, 'update_date': dateFormat}

      // ルームリスト登録
      connection.query(sql, param, function(error, results, fields){
        // エラー制御
        if (error) {
          // コールバック
          accessDb.handleSocketError(new Error("Execute SQL Error!"), socket.id, chatIo);
          // DBコネクション切断
          connection.release();
          return false;
        }

        // 取得したRommIdの退避
        roomId = results.insertId;

        // DBコネクション切断
        connection.release();
        // ウィジェット生成時のソケット処理
        accessDb.doSocketProcess(roomId, chatIo, statusIo, socket, userType, rooms, APPEND_LIST_TRUE);

      });
    });
  },

  // 指定SQL実行
  executeSql: function(sql, param, socketId, chatIo) {
    pool.getConnection(function(err, connection) {
      // 実行
      connection.query(sql, param, function(error, results, fields) {
        // エラー制御
        if (error) { 
          // コールバック
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

  // ウィジェット生成時のソケット処理
  doSocketProcess: function(roomId, chatIo, statusIo, socket, userType, rooms, delFlg) {
    // 入室
    socket.join(roomId);

    // 入退室管理情報編集
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

      // [emit]ルームリスト追加 (同室入室制御[ビジター用])
    if (delFlg === APPEND_LIST_TRUE)
      statusIo.emit('front append room list', roomId, socket.handshake.query['chatId']);
  },
  
  // エラーハンドリング(socket)
  handleSocketError: function(error, socketId, chatIo) {
    let message = error.message;
    let stackTrace = error.stack;

    // エラーメッセージ表示
    // errorをemitで直接clientに渡すとclientで参照できない
    console.log(error);
    chatIo.to(socketId).emit('error', message, stackTrace);
    return;
  },

  // エラーハンドリング(http)
  handleRequestError: function(error, res) {
    let message = error.message;
    let stackTrace = error.stack;

    // エラーメッセージ表示
    console.log(error);
    res.writeHead(500, {'Content-Type': 'text/plain'});
    res.write('Error 500: ' + message);
    res.write(stackTrace);
    res.end();
    return;
  }

}

module.exports = accessDb;
