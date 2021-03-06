// ユーザータイプ
const USER_TYPE_AGENT = 'agent'
const USER_TYPE_VISITOR = 'visitor'

// オブジェクト名
const CONTENT_OBJECT_NAME_HEADER = '#content-';
const MESSAGES_OBJECT_NAME = 'messages';
const HEADER_OBJECT_NAME = 'header';
const INPUT_OBJECT_NAME = 'input';
const ROOM_NO_POSIT = 7;    // ルームリストからRoom#を取得する際の取得開始位置

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

$(document).ready(function(){

/////////////
// リスナー //
/////////////

    // メッセージ受信
    chatSocket.on('front chat message', (msg, roomId, userType) => {
        let contentDomId = CONTENT_OBJECT_NAME_HEADER + roomId;

        // メッセージをエリアに追加表示
        $(contentDomId).find('[name='+ MESSAGES_OBJECT_NAME + ']').append($('<li>').text(msg));
        $(contentDomId).find('[name='+ MESSAGES_OBJECT_NAME + ']').
          scrollTop($(contentDomId).find('[name='+ MESSAGES_OBJECT_NAME + ']').prop('scrollHeight'));
    });

    // ウィジェットヘッダー更新
    chatSocket.on('front refresh', (roomId, userType) => {
        let contentDomId = CONTENT_OBJECT_NAME_HEADER + roomId;

        // ウィジェットヘッダーのクリア＋更新
        $(contentDomId).find('[name='+ HEADER_OBJECT_NAME + ']').empty();
        $(contentDomId).find('[name='+ HEADER_OBJECT_NAME + ']').append('Room # ' + roomId);
    });

    // ウィジェットDOM新規作成
    chatSocket.on('front open widget', (roomId, userType) => {
        createWidget(roomId);
    });

    // エラーハンドリング
    chatSocket.on('error', (message, stackTrace) => {
        document.write("Sorry.. error occured. " + message + '<br>' + stackTrace);
    });

    // ルームリスト追加
    statusSocket.on('front append room list', (roomId, chatId) => {
        $('#room_list').append(
            '<div class="room_list_div" id="room_list_div-'  + roomId + '">Room # ' + roomId + ' : ' + chatId);
    });

    // ルームリスト削除
    statusSocket.on('front remove room list', (roomId) => {
        $('#room_list_div-' + roomId).remove();
    });


/////////////
// イベント //
/////////////

    // エージェントメッセージ送信
    // ※動的に生成したDOMは$(document).on('click'～の形式で記載しないとイベントを認識しない
    $(document).on('click', '[name=btn_send]', function() {
        // メッセージ送信
        sendMessage(this);
    });

    // エージェントメッセージ送信(エンターキー押下)
    $(document).on('keydown', '[name=input]', function() {
        if (event.keyCode == 13) {
            // メッセージ送信
            sendMessage(this);
        }
    });

    // ウィジェットを閉じる
    $(document).on('click', '[name=btn_fin]', function() {
        let obj = $(this).parent().parent()
        let roomId =  getChildID(obj.attr('id'));
        let contentDomId = CONTENT_OBJECT_NAME_HEADER + roomId;

        // DOM削除
        $(contentDomId).remove();
        // [emit] 退室
        chatSocket.emit('leave room', roomId);
    });

    // ルームに入室
    $(document).on('click', '.room_list_div', function(){
        // 選択したリストの文言からルーム#を取得
        let roomInfo = $(this).text().trim();
        let roomId = roomInfo.
            substr(ROOM_NO_POSIT, roomInfo.indexOf(':') - (ROOM_NO_POSIT + 1)).trim();
        let contentDomId = CONTENT_OBJECT_NAME_HEADER + roomId;
        
        // 同室入室時の制御
        if ($(contentDomId).attr('id') != undefined) {
            alert('Room#'+ roomId + 'には入室済みです。')
            return false;
        }
        // チャットウィジェットオープン(エージェント)
        createWidget(roomId);
        // [emit] 入室
        chatSocket.emit('join room', roomId);
        // test!!!
        statusSocket.emit('join room Beta', roomId);
    });

    // ルームの作成（エージェント）
    $(document).on('click', '#btn_create', function(){
        // [emit] 部屋作成
        chatSocket.emit('new room');
        // イベント伝播防止
        return false;
    });

});

//////////
// 関数 //
//////////

// ウィジェットDOM生成
var createWidget = function(roomId) {
    let contentDomId = CONTENT_OBJECT_NAME_HEADER + roomId;
       
    // 同室入室時制御
    if ($(contentDomId).attr('id') === undefined) {
        // ウィジェットオブジェクト追加
        let obj = $(DOM_AGENT_WIDGET).appendTo('#parent');
        // 追加オブジェクトTopDiv-ID変更
        obj.attr("id", "content-" + roomId);
    }
}

// 子オブジェクトIDからルーム＃を取得する
var getChildID = function(val) {
    if (val === undefined || val === null) {
        throw new Error("Error Content DomId is null.");
        // このあたりのエラー制御方法をどうするか
        // アラートを表示させるだけか。エラー画面に遷移させるか。
        return false;
    }
    return val.substr(val.indexOf('-') + 1);
}

// 子オブジェクトからcontent DomIdを参照しルーム＃を取得する
var sendMessage = function(that) {
    // let roomId =  getChildID($(that).parent().parent().attr('id'));
    let contentDomId = '#' + $(that).parent().parent().attr('id');
    let message = $(that).parent().parent().find('[name=' + INPUT_OBJECT_NAME + ']').val();
    // let contentDomId = CONTENT_OBJECT_NAME_HEADER + roomId;
    let roomId =  getChildID(contentDomId);

    if (roomId === '') return false;
    // [emit] メッセージ送信
    chatSocket.emit('back chat message', roomId, message);
    // 入力欄クリア
    $(contentDomId).find('[name='+ INPUT_OBJECT_NAME + ']').val('');
}