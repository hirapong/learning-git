
function Drawer(bg) {

    this.id = bg.id;
    this.canvas = document.createElement('canvas');
    console.log(this.canvas);
    this.canvas.height = 600;
    this.canvas.width  = 850;
    this.canvas.class  = bg.id;
    $('#' + bg.id).append(this.canvas);
        //console.log(image);
    this.ctx = this.canvas.getContext("2d");
    this.ctx.fillStyle = "solid";
    this.ctx.strokeStyle = "#FF6600";
    this.ctx.lineWidth = 5;
    this.ctx.lineCap = "round";
    this.image = new Image();
    this.image.src = bg.imgPath;

    this.init = function() {
        console.log("init");
        console.log(this.image);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.image, 0, 0,this.image.width, this.image.height);
        return;
    };

    this.image.onload = this.init();

    this.draw = function(x, y, type) {
        if (type === "mousedown") {
            this.ctx.beginPath();
            return this.ctx.moveTo(x, y);
        } else if (type === "mousemove") {
            this.ctx.lineTo(x, y);
            return this.ctx.stroke();
        } else if (type === "mouseup") {
            return this.ctx.closePath();
        }
    };
    this.clear = function() {
        console.log("clear");
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.init;
        return;
    };

}

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

    var imageMap = [
        { id:'sharing' , imgPath: '/images/share_files.png' },
        { id:'scm' , imgPath: '/images/scm.png' },
        { id:'vcs'     , imgPath: '/images/some_vcs.png' },
        { id:'gitAbout', imgPath: '/images/git_about.png' }
    ];

    var drawers = _.map( imageMap, function(elem) {
        return new Drawer(elem);
    });

    var textarea = $("textarea");
    var socket = io.connect();

    socket.on('connect', function(msg) {
      console.log("connected to server");
      console.log(socket.socket.transport.sessid);
    });

    // receive
    socket.on('message', function(message) {
        $('#count').text(message.value);
    });

    socket.on('git_command', function(message) {
        $('#git_command').text(message.value);
    });
    socket.on('git_result', function(message) {
        $('#git_result').text(message.value);
    });
    socket.on('draw', function(data) {
        _.each( drawers, function( drawer ) {
            if ( drawer.id == data.id ) {
                drawer.draw(data.x, data.y, data.type);
            }
        });
    });
    socket.on('clearCanvas', function(data) {
        _.each( drawers, function( drawer ) {
            drawer.clear();
            drawer.init();
        });
    });

    var isDrawing = 0;
    // handle event
    $('canvas').live( ' mousedown mousemove mouseup', function(e) {
        var offset, type, x, y;
        type = e.handleObj.type;
        id   = e.currentTarget.class;
        offset = $(this).offset();
        e.offsetX = e.clientX - offset.left;
        e.offsetY = e.clientY - offset.top;
        x = e.offsetX;
        y = e.offsetY;

        if (type === "mousedown") {
            isDrawing = 1;
        }
        if( isDrawing === 1 ) {
            socket.emit('receiveCanvas', {
                x: x,
                y: y,
                type: type,
                id  : id
            });
        }
        if (type === "mouseup") {
            isDrawing = 0;
        }
    });

    // clear canvas by typing 'q'
    window.addEventListener('keydown', function(e){
        if(e.keyCode && e.keyCode == 81) {
            socket.emit('receiveCanvas');
        }
    });
    textarea.keydown(function(e){
        socket.emit('command', { value: textarea.val() });
        if(e.keyCode && e.keyCode === 13) {
            socket.emit('message', { value: textarea.val() });
        }
    });

    // _.each( drawers, function( drawer ) {
    //     drawer.init();
    // });

});

