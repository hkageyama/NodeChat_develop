const USER_TYPE_AGENT = 'agent'
const USER_TYPE_VISITOR = 'visitor'

const CONTENT_OBJECT_NAME_HEADER = '#content-';
const MESSAGES_OBJECT_NAME = 'messages';
const HEADER_OBJECT_NAME = 'header';
const ROOMID_OBJECT_NAME = 'room_id';
const INPUT_OBJECT_NAME = 'input';

$(document).ready(function(){
    var baseRoomId = '';

    // メッセージ受信
    chatSocket.on('front chat message', (userType, value, roomId) => {
        let contentDomId = CONTENT_OBJECT_NAME_HEADER + roomId;
        $(contentDomId).find('[name='+ MESSAGES_OBJECT_NAME + ']').append($('<li>').text(value));
        $(contentDomId).find('[name='+ MESSAGES_OBJECT_NAME + ']').
          scrollTop($(contentDomId).find('[name='+ MESSAGES_OBJECT_NAME + ']').prop('scrollHeight'));
    });

    // チャットウィジェット更新(HEADER/HIDDEN項目)
    chatSocket.on('front refresh', (roomId, userType) => {
        let contentDomId = CONTENT_OBJECT_NAME_HEADER + roomId;       
        $(contentDomId).find('[name='+ ROOMID_OBJECT_NAME + ']').val(roomId);
        $(contentDomId).find('[name='+ HEADER_OBJECT_NAME + ']').empty();
        $(contentDomId).find('[name='+ HEADER_OBJECT_NAME + ']').append('Room # ' + roomId);
    });

    // チャットウィジェット 新規作成(エージェント) 
    chatSocket.on('front open widget', (roomId) => {
        baseRoomId = openChatWidget(roomId, baseRoomId);
    });

    // ルームリスト追加 
    statusSocket.on('front append room list', (roomId, agentId) => {
        $('#room_list').append(
            '<div class="room_list_div" id="room_list_div-'  + roomId + '">' + roomId + ' : ' + agentId);
    });

    // ルームリスト追加 
    statusSocket.on('front remove room list', (roomId) => {
        $('#room_list_div-' + roomId).remove();
    });

    // エージェントメッセージ送信
    $('[name=btn_send]').click(function() {
        let roomId =  getChildID($(this).parent().parent().attr('id'));
        if (roomId === '') return false;
        let message = $(this).parent().parent().find('[name=' + INPUT_OBJECT_NAME + ']').val();
        let contentDomId = CONTENT_OBJECT_NAME_HEADER + roomId;

        chatSocket.emit('back chat message agent', roomId, message);
        $(contentDomId).find('[name='+ INPUT_OBJECT_NAME + ']').val('');
    });

    // エージェントチャット画面クローズ
    $('[name=btn_done]').click(function() {
        let obj = $(this).parent().parent()
        let roomId =  getChildID(obj.attr('id'));
        let contentDomId = CONTENT_OBJECT_NAME_HEADER + roomId;
        if ($('.content').length > 1) {
            $(contentDomId).remove();
        } else {
            // id初期化
            clearDomObject(obj);
            obj.attr("id", "content-");
        }
        chatSocket.emit('leave room', roomId);
    });

    // ルーム入室
    $(document).on('click', '.room_list_div', function(){
        let roomInfo = $(this).text();
        let roomId = roomInfo.substr(0, roomInfo.indexOf(':') - 1).trim();
        let contentDomId = CONTENT_OBJECT_NAME_HEADER + roomId;
        
        // if ($(contentDomId).find('[name='+ ROOMID_OBJECT_NAME + ']').val() != undefined) {
        if ($(contentDomId).attr('id') != undefined) {
            alert('Room#'+ roomId + 'には入室済みです。')
            return false;
        }
        // チャットウィジェットオープン(エージェント)
        baseRoomId = openChatWidget(roomId, baseRoomId);
        chatSocket.emit('join room', roomId);
    });

    // ルーム作成（エージェント）
    $('#btn_create').click(function() {
        chatSocket.emit('new room');
        // イベント伝播防止
        return false;
    });

});

// 以下、関数

// エージェントチャットウィジェット　オープン
var openChatWidget = function(roomId, baseRoomId) {
    let obj;
    if ($(CONTENT_OBJECT_NAME_HEADER).attr('id') != undefined) {
        obj = $(CONTENT_OBJECT_NAME_HEADER);
        initChatDom(obj, roomId);
        baseRoomId = roomId;
    } else {
        obj = cloneChatDom(baseRoomId);
        initChatDom(obj, roomId);
    }

    return baseRoomId;
}

// エージェントチャットウィジェットの複製
var cloneChatDom = function(baseRoomId) {
    "use strict";
    var $content = $(CONTENT_OBJECT_NAME_HEADER + baseRoomId);
    return $content.clone(true).appendTo('#parent');
}

// チャットウィジェット初期化
var initChatDom = function(target, roomId) {
    clearDomObject(target);
    target.attr("id", "content-" + roomId);
};

// チャットウィジェット クリア
var clearDomObject = function(target) {
    var clearObject = function(content, name) {
        var $obj = content.find('[name=' + name + ']');
        if (name === 'header') $obj.empty();
        if (name === 'messages') $obj.empty();
        if (name === 'room_id') $obj.val('');
        if (name === 'input') $obj.val('');
    };
    clearObject(target, 'header');
    clearObject(target, 'messages');
    clearObject(target, 'room_id');
    clearObject(target, 'input');
};

// 子オブジェクトIDからルーム＃を取得する
function getChildID(val) {
    if (val === undefined || val === null) throw new Error("エラーだよ");
    return val.substr(val.indexOf('-') + 1);
}
