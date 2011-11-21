$(function() {
  //sh_highlightDocument('lang/', '.js');
  sh_highlightDocument('lang/', '.shell');
  $.deck('.slide');
    var textarea = $("textarea");
    var socket = io.connect();

    console.log("test");
    socket.on('connect', function(msg) {
      console.log("connected to server");
      console.log(socket.socket.transport.sessid);
    });

    //受信部
    socket.on('message', function(message) {
        console.log("received");
        console.log(message.value);
        $('#count').text(message.value);
    });

    socket.on('git_command', function(message) {
        console.log("git!!");
        console.log(message.value);
        $('#git_command').text(message.value);
    });
    socket.on('git_result', function(message) {
        console.log("git!!");
        console.log(message.value);
        $('#git_result').text(message.value);
    });

    textarea.keydown(function(e){
        socket.emit('command', { value: textarea.val() });
        if(e.keyCode && e.keyCode == 13) {
            console.log("keydown!");
            console.log(textarea.val());
            socket.emit('message', { value: textarea.val() });
        }
    });

});
