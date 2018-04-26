let chatSocket = io.connect('http://localhost:3000/chat/');

$(document).ready(function(){
    var baseRoomId = '';
    // [common] message receiption
    chatSocket.on('front chat message', (userType, value, roomId) => {
        alert('front chat message test1!');
        let domId = '#messages_' + userType;
        if (userType === 'agent') domId = domId + '-' + roomId;
        $(domId).append($('<li>').text(value));
        $(domId).scrollTop($(domId).prop('scrollHeight'));
    });

    // [common] refresh chat screen
    chatSocket.on('front refresh', (roomId, agentId, userType) => {
        alert('front refresh test1!');
        let domId = '#header_' + userType;
        if (userType === 'agent') domId = domId + '-' + roomId;
        $(domId).empty();
        // $('#header_' + userType).append(agentId + ` @ Room #` + roomId);
        $(domId).append('Room # ' + roomId);
    });

    // [common] message receiption
    chatSocket.on('front open form agent', (roomId) => {
        baseRoomId = openAgentChatRoom(roomId, baseRoomId);
    });

    // [agent] message send
    $('#btn_send_agent-' + baseRoomId).click(function() {
        var roomId =  getChildID($(this).attr("id"));
        $('#form_agent-' + roomId).submit(function() {
            // 1formにボタンが複数ある場合に起こるイベントの多重発生抑止。
            $(domIdForm).attr('action', '');
            $(domIdForm).off();

            let domIdForm = '#form_agent-' + roomId;
            let domIdRoomId = '#room_id_agent-' + roomId;
            let domIdInput = '#input_agent-' + roomId;
            chatSocket.emit('back chat message agent', $(domIdRoomId).val(), $(domIdInput).val());
            $(domIdInput).val('');
            // イベント伝播防止(これがないと後続処理が流れない)
            return false;
        });
    });

    //【API】Server.dispatchMsg
    // [visitor] message send
    $('#form_visitor-').submit(function(){
        chatSocket.emit('back chat message visitor', $('#room_id_visitor').val(), $('#input_visitor').val());
        $('#input_visitor').val('');
        // イベント伝播防止
        return false;
    });

    // [agent] chat done
    $('#btn_done_agent-').click(function() {
        // window.open('about:blank','_self').close();
        // イベント伝播防止
        return false;
    });

    $('#room_list div').on('click',function(){

        let roomInfo = $(this).text();
        let roomId = roomInfo.substr(1, roomInfo.indexOf(':') - 1).trim();

        // エージェントチャットルームオープン
        baseRoomId = openAgentChatRoom(roomId, baseRoomId);
        chatSocket.emit('join room', roomId, 'agent');
        return false;
    });

    //【agent】create agent
    $('#btn_create_agent').click(function() {
        $('#entry_form_agent').attr('action', '');
        $('#entry_form_agent').off();
        chatSocket.emit('new room', 'agent');
        // イベント伝播防止
        return false;
    });
    $('#btn_create_visitor').click(function() {
        $('#entry_form_visitor').submit();
        chatSocket.emit('new room', 'visitor');
        // イベント伝播防止
        return false;
    });

    loadClient();
    
});

var openAgentChatRoom = function(roomId, baseRoomId) {
    let $obj;
    if ($('#room_id_agent-' + roomId).val() != undefined) {
        alert('Room#'+ roomId + 'には入室済みです。')
        return false;
    }
    if ($('#room_id_agent-' + baseRoomId).val() === '' || 
        $('#room_id_agent-' + baseRoomId).val() === '/') {
        obj = $('#content-' + baseRoomId);
        setChatDomId(obj, roomId, baseRoomId);
        baseRoomId = roomId;
    } else {
        obj = cloneChatDom(baseRoomId);
        setChatDomId(obj, roomId, baseRoomId);
    }
    $('#room_id_agent-' + roomId).val(roomId);
    // $('#agent_id_agent-' + roomId).val(roomInfo.substr(roomInfo.indexOf(':')+1));

    return baseRoomId;
}

var cloneChatDom = function(baseRoomId) {
    "use strict";
    var $content = $('#content-' + baseRoomId);
    return $content.clone(true).appendTo('#parent');
}

// フォームの複製を行う関数を定義
var setChatDomId = function(target, roomId, baseRoomId) {

    var increament_id = function(content, name, roomId, baseRoomId) {
        var $obj = content.find('#' + name + baseRoomId);
        $obj.attr('id', name + roomId);
        if (name === 'input_agent-') $obj.val('');
        if (name === 'room_id_agent-') $obj.val('');
        if (name === 'agent_id_agent-') $obj.val('');
        if (name === 'header_agent-') $obj.empty();
        if (name === 'messages_agent-') $obj.empty();
    };

    increament_id(target, 'header-', roomId, baseRoomId);
    increament_id(target, 'header_agent-', roomId, baseRoomId);
    increament_id(target, 'messages_agent-', roomId, baseRoomId);
    increament_id(target, 'footer-', roomId, baseRoomId);
    increament_id(target, 'form_agent-', roomId, baseRoomId);
    increament_id(target, 'input_agent-', roomId, baseRoomId);
    increament_id(target, 'user_type-', roomId, baseRoomId);
    increament_id(target, 'room_id_agent-', roomId, baseRoomId);
    increament_id(target, 'agent_id_agent-', roomId, baseRoomId);
    increament_id(target, 'btn_send_agent-', roomId, baseRoomId);
    increament_id(target, 'btn_done_agent-', roomId, baseRoomId);
    target.attr("id", "content-" + roomId);
};

function getChildID(val) {
    if (val === undefined || val === null) throw new Error("エラーだよ");
    return val.substr(val.indexOf('-') + 1);
}

function loadClient() {
    let userType = $('#user_type').val();
    let roomId = $('#room_id_' + userType).val();
    let agentId = $('#agent_id_' + userType).val();
    if (roomId === '/') {
        alert('loadClient test1! ' + roomId + ' ' + userType);
        socket.emit('new room', userType);
    } else {
        socket.emit('join room', roomId, userType);
    }
}
