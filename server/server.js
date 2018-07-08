const path= require('path');
const express=require('express');
const publicPath = path.join(__dirname,'../public');
const app=express();
const socketIO=require('socket.io');
const http=require('http');
const port=process.env.PORT||8000;
const {Users} = require('./utils/users');
const mongoose = require('mongoose');
const _ = require('lodash');
const bodyParser = require('body-parser');
const User= require('../app/models/user');
const request = require('request');
const moment=require('moment');
const imageStreams=require('./imageStreams');
const  Grid = require('gridfs-stream');
const multiparty = require('connect-multiparty')();


mongoose.connect('mongodb://localhost:27017/Tinder2');
const mongodb = mongoose.connection;
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());


app.use(function(req,res,next){
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Expose-Headers', 'x-auth');
    res.setHeader('Access-Control-Allow-Headers','Origin, X-Requested-With,content-type, Accept , x-auth');
  
	next();
});

var authenticate = function(req,res,next){
	var token = req.header('x-auth');
	User.findByToken(token).then(function(user){
		if(!user){
			return Promise.reject();	
		}
		req.user=user;
		req.token=token;
		next();
	}).catch(function(e){
		res.status(401).send();
	});

};

var server=http.createServer(app);
app.use(express.static(publicPath));
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


var router = express.Router();

router.route('/signup')
	.post(multiparty,function(req,res){
		console.log(req.files);
		console.log(req.body);
		var gfs = Grid(mongodb.db, mongoose.mongo);
		imageStreams.uploadImage(gfs,req,res);
		
	});

router.route('/login')
	.post(function(req,res){
		var body=_.pick(req.body,['phone','password']);
		User.findByCredentials(body.phone,body.password).then(function(user){
			return user.generateAuthToken().then(function(token){
				res.header('x-auth',token).send(user);
			});
		}).catch(function(e){
			res.status(400).send(e);
		});

	});
router.route('/image/:id')
	.post(authenticate,multiparty,function(req,res){
		console.log(req.files);
		 var gfs = Grid(mongodb.db, mongoose.mongo);
		 imageStreams.uploadImage(gfs,req,res);
	});

router.route('/image/:id')
	.get(function(req,res){
		 var gfs = Grid(mongodb.db, mongoose.mongo);
		 imageStreams.getImage(gfs,req.params.id,res);
	});


app.use('/api',router);
server.listen(port,function(){
	console.log("Server running at port "+port);
});

