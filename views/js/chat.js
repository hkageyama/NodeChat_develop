// var socket = io();
// var socket = io.connect('http://localhost:3000/',
//           { query: 'user_type=' + $('input:hidden[name="user_type"]').val()});
var socket = io.connect('http://localhost:3000/',
           { query: {user_type: $('input:hidden[name="user_type"]').val(), room_id: $('input:hidden[name="room_id"]').val() }});

$(document).ready(function(){
    //【agent】message receiption
    socket.on('front chat message agent', (msg) => {
        // $('#header-agent').empty();
        // $('#header-agent').append('Test222!');
        $('#messages-agent').append($('<li>').text(msg));
        $('#messages-agent').scrollTop($('#messages-agent').prop('scrollHeight'));
    });
    socket.on('front set header agent', (room_id, agent_id) => {
        $('#header-agent').empty();
        $('#header-agent').append(agent_id + ` @ ` + room_id);
    });
    //【visitor】message receiption
    socket.on('front chat message visitor', (msg) => {
        // $('#header-visitor').empty();
        // $('#header-visitor').append('Test222!');
        $('#messages-visitor').append($('<li>').text(msg));
        $('#messages-visitor').scrollTop($('#messages-visitor').prop('scrollHeight'));
    });
    // 【agent】message send
    $('#btn-send-agent').click(function() {
        $('#form-agent').submit(function() {
            // 1formにボタンが複数ある場合に起こるイベントの多重発生抑止。
            $('#form-agent').attr('action', '');
            $('#form-agent').off();
            socket.emit('back chat message agent', $('#input-agent').val());
            $('#input-agent').val('');
            // イベント伝播防止(これがないと後続処理が流れない)
            return false;
        });
    });
    //【agent】chat done
    $('#btn-done-agent').click(function() {
        $('#form-agent').attr('action', '/select');
        $('#form-agent').submit();
        // イベント伝播防止
        return false;
    });
    //【visitor】message send
    $('#form-visitor').submit(function(){
        socket.emit('back chat message visitor', $('#input-visitor').val());
        $('#input-visitor').val('');
        // イベント伝播防止
        return false;
    });
});
