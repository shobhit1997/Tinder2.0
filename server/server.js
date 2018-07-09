const app=require('./app');
const http=require('http');
const port=process.env.PORT||8000;
var server=http.createServer(app);
const socketIO=require('socket.io');
const {Users} = require('./utils/users');
const mongoose = require('./db/connectDB');
const User= require('../app/models/user');
const moment=require('moment');
const config=require('./config/config');
var io=socketIO(server);
var users=new Users();
io.on('connection',function(socket){
console.log("new user connected");

socket.on('join',function(params,callback){

	users.removeUser(socket.id);
	users.addUser(socket.id,params);
	var oppositeGenderUsers = new Array();
	User.findByToken(params).then(function(user){
		if(user){

			user.status='online';
			user.save().then(function(user){
			});
			User.findByGender(user.gender==='Male'?'Female':'Male',user.likes.concat(user.dislikes)).then(function(users){
				console.log(users);
				oppositeGenderUsers=users;
				var min=0;
			    var max=oppositeGenderUsers.length; 
			    var random1 =Math.floor(Math.random() * (+max - +min)) + +min;
			    var random2 =Math.floor(Math.random() * (+max - +min)) + +min;
			    while(random1===random2){
			    	random2 =Math.floor(Math.random() * (+max - +min)) + +min;
			    }
			    var arrayUsers= new Array();
			    arrayUsers.push(oppositeGenderUsers[random1]);
			    arrayUsers.push(oppositeGenderUsers[random2]);
				socket.emit('showPhotos',arrayUsers);
			});

		}
		else{

		}
	});
	callback();
});
socket.on('liked_disliked',function(message,callback){

	var user=users.getUser(socket.id);
	if(user){
		User.findByToken(user.token).then(function(user){
			user.likes.push(message.liked);
			user.dislikes.push(message.disliked);
			user.save().then(function(user){
				console.log(user);
				User.findByGender(user.gender==='Male'?'Female':'Male',user.likes.concat(user.dislikes)).then(function(users){
				console.log(users);
				var min=0;
			    var max=users.length; 
			    var random1 =Math.floor(Math.random() * (+max - +min)) + +min;
			    var random2 =Math.floor(Math.random() * (+max - +min)) + +min;
			    while(random1===random2){
			    	random2 =Math.floor(Math.random() * (+max - +min)) + +min;
			    }
			    var arrayUsers= new Array();
			    arrayUsers.push(users[random1]);
			    arrayUsers.push(users[random2]);
				socket.emit('showPhotos',arrayUsers);
			});

			});
		}).catch(function(err){
			console.log(err);
		});
	}
	callback();

});

socket.on('disconnect',function(){
	console.log("disconnect "+socket.id);
	var user=users.removeUser(socket.id);
	if(user){
		User.findByToken(user.token).then(function(user){
			user.lastSeen=moment().valueOf();
			user.status='offline';
			user.save().then(function(user){
				console.log(user);
			});
		}).catch(function(err){
			console.log(err);
		});
	}
});

});



server.listen(port,function(){
	console.log("Server running at port "+port);
});


