var socket = io.connect('http://localhost:3000/chat',
           { query: {user_type: $('input:hidden[name="user_type"]').val(), 
                     room_id: $('input:hidden[name="room_id"]').val(),
                     agent_id: $('input:hidden[name="agent_id"]').val() }
            //          ,
            //  reconnection: false,
            //  transports: ['websocket', 'polling'],
            //  'sync disconnect on unload': true             
           });

var g_room_id;
var g_agent_id;

$(document).ready(function(){
    //【agent】message receiption
    socket.on('front chat message agent', (msg) => {
        $('#messages-agent').append($('<li>').text(msg));
        $('#messages-agent').scrollTop($('#messages-agent').prop('scrollHeight'));
    });
    socket.on('front set header agent', (room_id, agent_id) => {
        $('#header-agent').empty();
        $('#header-agent').append(agent_id + ` @ ` + room_id);
    });
    //【visitor】message receiption
    socket.on('front chat message visitor', (msg) => {
        $('#messages-visitor').append($('<li>').text(msg));
        $('#messages-visitor').scrollTop($('#messages-visitor').prop('scrollHeight'));
    });
    //【agent】invitation receiption
    socket.on('front invitation', (agent_id, room_id) => {
        $('#header-agent').empty();
        $('#header-agent').append(agent_id + ` @ Room#` + room_id);
        $('#messages-agent').append($('<li>').text('room changed to room#' + room_id));
        $('#room_id').val(room_id);
        $('#agent_id').val(agent_id);
        g_room_id = room_id;
        g_agent_id = agent_id;
        // socket.io.uri = 'http://localhost:3000/chat?' + 
        //               'user_type=' + $('#user_type').val + '&' +
        //               'room_id=' + room_id + '&' + 'agent_id=' + agent_id;
        // socket.io.opts.query = 'room_id=' + room_id + '&agent_id=' + agent_id;
        // socket.io.opts.query = {
        //     user_type: 'agent',
        //     room_id: '1',
        //     agent_id: test
        // }
        // 再接続
        // socket.disconnect();
        socket.connect();  // -> connected
        socket.emit('back invitation', room_id);
    });
    
    socket.on('reconnect_attempt', () => {
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
        $('#form-agent').attr('action', '/');
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
