$(document).ready(function(){
  $('#room-list div').on('click',function(){ 
    var formEntry = document.forms['entryFormAgent'];
    var roomInfo = $(this).text();
    $('#room_id').val(roomInfo.substr(1, roomInfo.indexOf(':')-1));
    $('#agent_id').val(roomInfo.substr(roomInfo.indexOf(':')+1));
    formEntry.submit();
    // イベント伝播防止
    return false;
  });
})
