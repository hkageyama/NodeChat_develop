// let chatSocket = io.connect('http://localhost:3000/chat/');
let statusSocket = io.connect('http://localhost:3000/status/');

const USER_TYPE_AGENT = 'agent'
const USER_TYPE_VISITOR = 'visitor'

const MESSAGES_OBJECT_NAME_HEADER = '#messages';
const HEADER_OBJECT_NAME_HEADER = '#header';
const ROOMID_OBJECT_NAME_HEADER = '#room_id';
const FORM_OBJECT_NAME_HEADER = '#form';
const INPUT_OBJECT_NAME_HEADER = '#input';
const CONTENT_OBJECT_NAME_HEADER = '#content';

$(document).ready(function(){
    var baseRoomId = '';

    // メッセージ受信
    chatSocket.on('front chat message', (userType, value, roomId) => {
        let domId = MESSAGES_OBJECT_NAME_HEADER + '-' + roomId;
        $(domId).append($('<li>').text(value));
        $(domId).scrollTop($(domId).prop('scrollHeight'));
    });

    // チャットウィジェット更新(HEADER/HIDDEN項目)
    chatSocket.on('front refresh', (roomId, userType) => {
        let headerDomId = HEADER_OBJECT_NAME_HEADER + '-' + roomId;
        let roomIdDomId = ROOMID_OBJECT_NAME_HEADER + '-' + roomId;
        $(roomIdDomId).val(roomId);
        $(headerDomId).empty();
        $(headerDomId).append('Room # ' + roomId);
    });

    // チャットウィジェット 新規作成(エージェント) 
    chatSocket.on('front open widget', (roomId) => {
        baseRoomId = openChatWidget(roomId, baseRoomId);
    });

    // エージェントメッセージ送信
    $('#btn_send-' + baseRoomId).click(function() {
        var roomId =  getChildID($(this).attr("id"));
        let domIdRoomId = ROOMID_OBJECT_NAME_HEADER + '-' + roomId;
        let domIdInput = INPUT_OBJECT_NAME_HEADER + '-' + roomId;

        chatSocket.emit('back chat message agent', $(domIdRoomId).val(), $(domIdInput).val());
        $(domIdInput).val('');
    });

    // エージェントチャット画面クローズ
    $('#btn_done-').click(function() {
        // window.open('about:blank','_self').close();
        // イベント伝播防止
        return false;
    });

    // ルーム入室
    $('#room_list div').on('click',function(){
        let roomInfo = $(this).text();
        let roomId = roomInfo.substr(1, roomInfo.indexOf(':') - 1).trim();
        if ($(ROOMID_OBJECT_NAME_HEADER + '-' +  roomId).val() != undefined) {
            alert('Room#'+ roomId + 'には入室済みです。')
            return false;
        }
        // チャットウィジェットオープン(エージェント)
        baseRoomId = openChatWidget(roomId, baseRoomId);
        chatSocket.emit('join room', roomId, USER_TYPE_AGENT);
        return false;
    });

    // ルーム作成（エージェント）
    $('#btn_create').click(function() {
        chatSocket.emit('new room', USER_TYPE_AGENT);
        // イベント伝播防止
        return false;
    });

});

// 以下、関数

// エージェントチャットウィジェット　オープン
var openChatWidget = function(roomId, baseRoomId) {
    let $obj;
    if ($(ROOMID_OBJECT_NAME_HEADER + '-' + baseRoomId).val() === '' || 
        $(ROOMID_OBJECT_NAME_HEADER + '-' + baseRoomId).val() === '/') {
        obj = $(CONTENT_OBJECT_NAME_HEADER + '-' + baseRoomId);
        setChatDomId(obj, roomId, baseRoomId);
        baseRoomId = roomId;
    } else {
        obj = cloneChatDom(baseRoomId);
        setChatDomId(obj, roomId, baseRoomId);
    }

    return baseRoomId;
}

// エージェントチャットウィジェットの複製
var cloneChatDom = function(baseRoomId) {
    "use strict";
    var $content = $(CONTENT_OBJECT_NAME_HEADER + '-' + baseRoomId);
    return $content.clone(true).appendTo('#parent');
}

// フォーム複製後のオブジェクトID再設定
var setChatDomId = function(target, roomId, baseRoomId) {

    var increament_id = function(content, name, roomId, baseRoomId) {
        var $obj = content.find('#' + name + baseRoomId);
        $obj.attr('id', name + roomId);
        if (name === 'header-') $obj.empty();
        if (name === 'messages-') $obj.empty();
        if (name === 'room_id-') $obj.val('');
        if (name === 'input-') $obj.val('');
    };
    increament_id(target, 'header-', roomId, baseRoomId);
    increament_id(target, 'messages-', roomId, baseRoomId);
    increament_id(target, 'form-', roomId, baseRoomId);
    increament_id(target, 'input-', roomId, baseRoomId);
    increament_id(target, 'room_id-', roomId, baseRoomId);
    increament_id(target, 'btn_send-', roomId, baseRoomId);
    increament_id(target, 'btn_done-', roomId, baseRoomId);
    target.attr("id", "content-" + roomId);
};

// 子オブジェクトIDからルーム＃を取得する
function getChildID(val) {
    if (val === undefined || val === null) throw new Error("エラーだよ");
    return val.substr(val.indexOf('-') + 1);
}
