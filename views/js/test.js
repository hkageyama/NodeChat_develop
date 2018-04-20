var socket = io.connect('http://localhost:3000/',
           { query: {user_type: agent, room_id: 1, agent_id:''}});

$(document).ready(function(){
  $('#btn').click(function() {
    socket.emit('back chat message visitor', $('#msg').val());
    $('#msg').val('');
    return false;
  });
});
