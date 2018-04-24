let socket = io.connect('http://localhost:3000/chat/');

$(document).ready(function(){
    // [common] message receiption
    socket.on('front chat message', (userType, value) => {
        $('#messages_' + userType).append($('<li>').text(value));
        $('#messages_' + userType).scrollTop($('#messages_' + userType).prop('scrollHeight'));
    });
    // [common] refresh chat screen
    socket.on('front refresh', (roomId, agentId, userType) => {
        $('#header_' + userType).empty();
        $('#header_' + userType).append(agentId + ` @ Room #` + roomId);
        $('#room_id_' + userType).val(roomId);
        $('#agent_id_' + userType).val(agentId);
    });
    // [agent] message send
    $('#btn_send_agent').click(function() {
        $('#form_agent').submit(function() {
            // 1formにボタンが複数ある場合に起こるイベントの多重発生抑止。
            $('#form_agent').attr('action', '');
            $('#form_agent').off();

            socket.emit('back chat message agent', $('#room_id_agent').val(), $('#input_agent').val());
            $('#input_agent').val('');
            // イベント伝播防止(これがないと後続処理が流れない)
            return false;
        });
    });
    //【API】Server.dispatchMsg
    // [visitor] message send
    $('#form_visitor').submit(function(){
        socket.emit('back chat message visitor', $('#room_id_visitor').val(), $('#input_visitor').val());
        $('#input_visitor').val('');
        // イベント伝播防止
        return false;
    });
    // [agent] chat done
    $('#btn_done_agent').click(function() {
        window.open('about:blank','_self').close();
        // イベント伝播防止
        return false;
    });
    //【API】Server.connect
    // [common] load client
    loadClient();
});

function loadClient() {
    let userType = $('#user_type').val();
    let roomId = $('#room_id_' + userType).val();
    let agentId = $('#agent_id_' + userType).val();
    if (roomId === '/') {
        socket.emit('new room', userType);
    } else {
        socket.emit('join room', roomId, userType);
    }
}
