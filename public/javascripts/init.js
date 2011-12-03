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
        console.log(drawer.canvas);
        drawer.canvas.height = 600;
        drawer.canvas.width  = 800;
        $('article').append(drawer.canvas);
        var flowImage = new Image();
        flowImage.src = '/images/some_vcs.png';
            console.log(flowImage);
        drawer.ctx = drawer.canvas.getContext("2d");
        drawer.ctx.drawImage(flowImage, 0, 0);
        drawer.ctx.fillStyle = "solid";
        drawer.ctx.strokeStyle = "#ECD018";
        drawer.ctx.lineWidth = 5;
        drawer.ctx.lineCap = "round";
        drawer.draw = function(x, y, type) {
            if (type === "mousedown") {
                drawer.ctx.beginPath();
                return drawer.ctx.moveTo(x, y);
            } else if (type === "mousemove") {
                drawer.ctx.lineTo(x, y);
                return drawer.ctx.stroke();
            } else if (type === "mouseup") {
                return drawer.ctx.closePath();
            }
        };
        drawer.clear = function() {
            drawer.ctx.clearRect(0, 0, drawer.canvas.width, drawer.canvas.height);
            var flowImage = new Image();
            flowImage.src = '/images/some_vcs.png';
            console.log(flowImage);
            drawer.ctx.drawImage(flowImage, 0, 0);
            return;
        };
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
        console.log(data);
        return drawer.draw(data.x, data.y, data.type);
    });
    socket.on('clearCanvas', function(data) {
        return drawer.clear();
    });

    var isDrawing = 0;
    // イベント処理
    $('canvas').live( ' mousedown mousemove mouseup', function(e) {
        var offset, type, x, y;
        type = e.handleObj.type;
        offset = $(this).offset();
        //console.log(offset);
        e.offsetX = e.clientX - offset.left;
        e.offsetY = e.clientY - offset.top;
        x = e.offsetX;
        y = e.offsetY;
        //drawer.draw(x, y, type);


        if (type === "mousedown") {
            isDrawing = 1;
        }
        if( isDrawing === 1 ) {
            socket.emit('receiveCanvas', {
                x: x,
                y: y,
                type: type
            });
        }
        if (type === "mouseup") {
            isDrawing = 0;
        }
    });
    // $('article').mousedown(function(e) {
    //     console.log("click");
    // });
    window.addEventListener('keydown', function(e){
        if(e.keyCode && e.keyCode === 81) {
            console.log("click");
            socket.emit('receiveCanvas');
        }
    });
    textarea.keydown(function(e){
        socket.emit('command', { value: textarea.val() });
        if(e.keyCode && e.keyCode === 13) {
            socket.emit('message', { value: textarea.val() });
        }
    });

    $(function() {
        return drawer.init();
    });
});
