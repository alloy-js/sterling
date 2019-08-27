const socket = new WebSocket('ws://' + location.hostname + ':' + location.port + '/alloy');

socket.addEventListener('open', function (event) {

    console.log('Connection established');
    socket.send('current');

});

socket.addEventListener('message', function (event) {

    let data = event.data;

    if (data.startsWith('XML:')) {

        d3.select('#code')
            .text(data.slice(4));

    }

});