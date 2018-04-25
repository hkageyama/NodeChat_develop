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
        // window.open('about:blank','_self').close();
        // イベント伝播防止

        "use strict";
        var $content = $('#content:last-child');
        var newc = $content.clone(true).appendTo('#parent');
        // $('#content:last-child').clone(true).appendTo('#parent');
        var input_a = $("#input_agent")[0];
        alert(input_a.val());
        // alert(input_a.length);
        // input_a.map(function() {
        //     //1つ1つ値を取得する（実施している内容はほぼ上と一緒）
        //     alert($(this).val());
        // });

        // var i = 1;
        // $("#content:last-child").    //#each_rootを取得
        //  clone(true).   //上で取得した中身をコピー
        //      find('#input_agent').  //そのコピーした中身のdetailとついている要素を取得
        //          attr('id', 'input_agent' + i).  //上で取得した要素の中のidをiとする
        //                appendTo("#parent");
        
        // alert($('#input_agent').attr('id'));
        // alert($('#input_agent1').attr('id'));
        
        // socket.emit('back chat message agent', $('#room_id_agent').val(), newc);
        // $(document).on('input_agent', 'ready', function() {
        //     alert(input_a.length);
        // });

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
