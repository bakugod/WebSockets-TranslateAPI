const express = require('express');
const unirest = require('unirest');
const WebSocketServer = new require('ws');

// подключенные клиенты
let clients = {};

// WebSocket-сервер на порту 8081
const webSocketServer = new WebSocketServer.Server({
  port: 8081
});

webSocketServer.on('connection', function(ws) {

  const id = Math.random();
  clients[id] = ws;
  console.log("новое соединение " + id);

  ws.on('message', function(message) {
    unirest.post("https://translate.yandex.net/api/v1.5/tr.json/translate")
    .header("Content-Type", "application/x-www-form-urlencoded")
    .send("key=trnsl.1.1.20190417T190639Z.d307e3b265e55b08.3973b5db3a0a45ab579bd9ca519600303b52630f")
    .send("text=" + message)
    .send("lang=en-ru")
    .send("format=plain")
    .send("options=1")
    .end(function (result) {
      console.log('получено сообщение ' + message/*result.status, result.headers, */+ '\n перевод ' + result.body.text.toString());
    });

    for (let key in clients) {
      clients[key].send(message);
    }
  });

  ws.on('close', function() {
    console.log('соединение закрыто ' + id);
    delete clients[id];
  });

});


const app = express();
	app.use("/src", express.static(__dirname + "/src"));
	app.get('/', (req, res) => {
		res.sendFile(__dirname + "/index.html");
	});

  

		app.listen(8080);
/*
& [text=<переводимый текст>]
 & [lang=<направление перевода>]
 & [format=<формат текста>]
 & [options=<опции перевода>]
 & [callback=<имя callback-функции>]
 */