var express = require('express');
var app = express();
var path = require('path');
var http = require('http').createServer(app);
const port = 8080;
var url = require('url');
var fs = require('fs');
var mysql = require('mysql')
var socket = require('socket.io')(http);


var con = mysql.createConnection({
  host: "localhost",
  user: "Jonathan",
  password: "Jonathan"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connecte!");
    con.query("USE mydb", function(e,result){
      if (e) throw e;
    })
});

socket.on("connection", function(sockett) {
  console.log("Nouvel utilisateur");

  sockett.on('newacc', function(username, password){
    con.query("INSERT INTO identifiants VALUES ('" + username + "','" + password +"')", function(e, result){
      if (e) throw e;
      console.log("Compte créé : " + username);
      sockett.emit("acc cree", username);
    });
    return true;

  });

  sockett.on("login", function(username, password){
    con.query("SELECT COUNT(*) FROM identifiants WHERE username = '" + username + "' AND mdp = '" + password+"'", function(e, result){
      if (e) throw e;
      if(result[0]['COUNT(*)'] >= 1){
        sockett.emit("login", username);
      } else {
        sockett.emit("login", "");
      }
    })
  })
  sockett.on("message", function(data) {
    console.log("Message reçu : " + data.message);
    fs.appendFile(__dirname + "/conv.txt", data.message + "\n",() => {console.log("Message ecrit")});
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


