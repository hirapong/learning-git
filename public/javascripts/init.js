$(function() {
    //sh_highlightDocument('lang/', '.js');
    sh_highlightDocument('lang/', '.shell');
    $.deck('.slide');
    //$.extend(true, $.deck.defaults, {
    //   classes: {
    //      navDisabled: 'deck-nav-disabled'
    //   },
    //   selectors: {
    //      nextLink: '.deck-next-link',
    //      previousLink: '.deck-prev-link'
    //   }
    //});

    var textarea = $("textarea");
    var socket = io.connect();
    var drawer = {};

    drawer.init = function() {
        drawer.canvas = document.createElement('canvas');
        drawer.canvas.height = 400;
        drawer.canvas.width = 800;
        document.getElementsByTagName('article')[0].appendChild(drawer.canvas);
        drawer.ctx = drawer.canvas.getContext("2d");
        drawer.ctx.fillStyle = "solid";
        drawer.ctx.strokeStyle = "#ECD018";
        drawer.ctx.lineWidth = 5;
        drawer.ctx.lineCap = "round";
        drawer.draw = function(x, y, type) {
            if (type === "dragstart") {
                drawer.ctx.beginPath();
                return drawer.ctx.moveTo(x, y);
            } else if (type === "drag") {
                drawer.ctx.lineTo(x, y);
                return drawer.ctx.stroke();
            } else {
                return drawer.ctx.closePath();
            }
        };
        console.log(drawer );
    };
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
    socket.on('draw', function(data) {
        return drawer.draw(data.x, data.y, data.type);
    });

    // イベント処理
    $('article').live( ' mousedown mousemove mouseup', function(e) {
        var offset, type, x, y;
        //console.log(e);
        type = e.handleObj.type;
        offset = $(this).offset();
        //console.log(offset);
        e.offsetX = e.clientX - offset.left;
        e.offsetY = e.clientY - offset.top;
        x = e.offsetX;
        y = e.offsetY;
        drawer.draw(x, y, type);
        socket.emit('drawClick', {
            x: x,
            y: y,
            type: type
        });
    });
    // $('article').mousedown(function(e) {
    //     console.log("click");
    // });
    textarea.keydown(function(e){
        socket.emit('command', { value: textarea.val() });
        if(e.keyCode && e.keyCode == 13) {
            console.log("keydown!");
            console.log(textarea.val());
            socket.emit('message', { value: textarea.val() });
        }
    });

    $(function() {
        return drawer.init();
    });
});
