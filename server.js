var express = require('express');
var app = express();
var path = require('path');
var http = require('http').createServer(app);
const port = 8080;
var url = require('url');
var fs = require('fs');
const {Client} = require('pg');
var socket = require('socket.io')(http);



const client = new Client({
  host: "localhost",
  user: "postgres",
  password: "JvPeH91",
  port: 5432,
  database: "mydb",
});
client.connect()

socket.on("connection", function(sockett) {
  console.log("Nouvel utilisateur");

  sockett.on('newacc', function(username, password){
    client.query("INSERT INTO identifiants VALUES ('" + username + "','" + password +"')", function(e, result){
      if (e) throw e;
      console.log("Compte créé : " + username);
      sockett.emit("acc cree", username);
    });
  });

  sockett.on("login", function(username, password){
    client.query("SELECT COUNT(*) FROM identifiants WHERE username = '" + username + "' AND mdp = '" + password+"'", function(e, result){
      if (e) throw e;
      if(result.rows[0]['count'] >= 1){
        sockett.emit("login", username);
      } else {
        sockett.emit("login", "");
      }
    })
  })

  sockett.on("loading", function(data){
    client.query("SELECT * FROM messages", function(e, result){
      if(e) throw e;
      result.rows.forEach(element => {
        sockett.emit("recu", element)
      })
    })
  })

  sockett.on("message", function(data) {
    console.log("Message reçu : " + data.message);
    client.query("INSERT INTO messages VALUES ('" + data.usr + "','"+data.message+"')", function(e, result){
      if (e) throw e;
    })
    sockett.broadcast.emit("recu", {message : data.message, usr : data.usr});
    sockett.emit("bien envoye", data.id);
    return true;
  });

});
http.listen(port, () => {console.log("connecte au port " + port);
socket.on('disconnect', () => {console.log("deconnecte")})});



app.use("/public",express.static('public'));
app.use("/socket.io", express.static('socket.io'));
app.get('/', function(req,res) {
  res.sendFile(path.join(__dirname,'/public/chat.html'));
});

app.get('/messages', function(req, res){
  client.query("SELECT * FROM messages", function(e, result){
    if(e) throw e;
    res.send(result.rows)
  })
});


