
var socket = io('http://localhost:8080');

var clearTimer;

//if the user has an identification cookie, he goes to the chat page, else he goes to the login page
var username = getCookie("username");
if (username) {
    gotoChat();
} else {
    gotoLogin();
}


function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }


function gotoChat(){

    document.getElementById("content").innerHTML = "<div id='cadreChat'><div id='conv'></div></div><form id='form'><input type='text' id='inpChat' placeholder='message' required><input type='submit' value='Entree'></form>"

    document.getElementById("form").addEventListener("submit", function(e) {
        e.preventDefault();
        const idMsg = Math.random();
        socket.emit("message", { message: document.getElementById("inpChat").value, id: idMsg , usr:username});
        let conv = document.getElementById("conv")
        conv.innerHTML += "<div class='msgcont'><div class='message envoye' id=" + idMsg + "><p class='msgtext'>" + document.getElementById('inpChat').value + "</p></div></div>";
        conv.scrollTop = conv.scrollHeight;
        //"<br> <span class='envoye' id=" + idMsg + ">" +  document.getElementById("inpChat").value + " </span>";
        document.getElementById("inpChat").value = "";
        console.log("sent!");});

    //upon entering the chat, get the previous messages from the server
    fetch('/messages').then(response => response.json()).then(response => response.forEach(data => {//execute this for each message

        //if the username of the author of a message matches the user's name, display it as a message sent
        if(data.usr != username){
            if(document.getElementById("conv").lastChild != null && document.getElementById("conv").lastChild.id == data.usr){
                document.getElementById("conv").innerHTML += "<div class='msgcont' id='" + data.usr + "'><div class='message recu suite'><p class='msgtext'>" + data.message + "</p></div></div>";
            } else {
                document.getElementById("conv").innerHTML += "<div class='msgcont' id='" + data.usr + "'><div class='message recu'><p class='msgtext'>" + data.message + "</p><p class='username'>" + data.usr + "</p></div></div>";
            }
        } else {//else, display it as a message received from another user
            const idMsg = Math.random();
            let conv = document.getElementById("conv")
            var msg = document.createElement("div");
            msg.class='msgcont';
            msg.innerHTML="<div class='message envoye' id=" + idMsg + "><p class='msgtext'>" + data.message + "</p></div>";
            conv.appendChild(msg);
            var check = document.createElement("img");
            check.src='public/img/check.png'; 
            document.getElementById(idMsg).appendChild(check)
        }
        
    }));

    return true;
}

//login page with a simple form
function gotoLogin(){
    document.getElementById("content").innerHTML = "<form id='login'><p id='label'></p><input type='text' placeholder='Username' id='usr' required><input type='text' placeholder='Password' id='mdp' required><input type='submit' value='Entree'><button type='button' id='creacc'>Creer un compte</button></form>"
    document.getElementById("creacc").addEventListener("click", () => {socket.emit('newacc', document.getElementById('usr').value, document.getElementById('mdp').value)});
    document.getElementById("login").addEventListener("submit", function(e){
        e.preventDefault();
        socket.emit("login", document.getElementById('usr').value, document.getElementById('mdp').value);
    });
}


socket.on("login", function(usr){
    //if login successful, put username in cookie and go to the chat page
    if(usr){
        username = usr;
        document.cookie = "username=" + usr
        gotoChat();
    } else {
    
        //else, display wrong username or password
        var label = document.getElementById("label");
        label.innerHTML = "wrong username or password";
        label.style.backgroundColor = "red";
        clearTimer = setTimeout(() => {
            label.innerHTML = "";
            label.style.backgroundColor = "white";
        }, 2000);
    }

});

//display if server successfully received the message
socket.on("bien envoye", function(msgId){var check = document.createElement("img"); check.src='public/img/check.png'; document.getElementById(msgId).appendChild(check)});

//display received message
socket.on("recu", function (data){
    if(data.usr != username){
        if(document.getElementById("conv").lastChild != null && document.getElementById("conv").lastChild.id == data.usr){
            document.getElementById("conv").innerHTML += "<div class='msgcont' id='" + data.usr + "'><div class='message recu suite'><p class='msgtext'>" + data.message + "</p></div></div>";
        } else {
            document.getElementById("conv").innerHTML += "<div class='msgcont' id='" + data.usr + "'><div class='message recu'><p class='msgtext'>" + data.message + "</p><p class='username'>" + data.usr + "</p></div></div>";
        }
    } else {
        const idMsg = Math.random();
        let conv = document.getElementById("conv")
        var msg = document.createElement("div");
        msg.class='msgcont';
        msg.innerHTML="<div class='message envoye' id=" + idMsg + "><p class='msgtext'>" + data.message + "</p></div>";
        conv.appendChild(msg);
        var check = document.createElement("img");
        check.src='public/img/check.png'; 
        document.getElementById(idMsg).appendChild(check)
    }
});
       
//displays successfully created account
socket.on("acc cree", function(username){
    var label = document.getElementById("label");
    label.innerHTML = "Bienvenue " + username + " !";
    label.style.backgroundColor = "lightgreen";
    clearTimer = setTimeout(() => {
        label.innerHTML = "";
        label.style.backgroundColor = "white";
    }, 2000);
})