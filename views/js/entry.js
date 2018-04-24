$(document).ready(function(){
  $('#room_list div').on('click',function(){
    let formEntry = document.forms['entryFormAgent'];
    let roomInfo = $(this).text();
    $('#entry_room_id_agent').val('');
    $('#entry_agent_id_agent').val('');
    $('#entry_room_id_agent').val(roomInfo.substr(1, roomInfo.indexOf(':')-1));
    $('#entry_agent_id_agent').val(roomInfo.substr(roomInfo.indexOf(':')+1));
    formEntry.submit();
    // イベント伝播防止
    return false;
  });
  //【agent】create agent
  $('#btn_create_agent').click(function() {
    $('#entry_room_id_agent').val('');
    $('#entry_agent_id_agent').val('');
    $('#entryFormAgent').submit();
    // イベント伝播防止
    return false;
  });
  $('#btn_create_visitor').click(function() {
    $('#entry_room_id_visitor').val('');
    $('#entry_agent_id_visitor').val('');
    $('#entryFormVisitor').submit();
    // イベント伝播防止
    return false;
  });
})
