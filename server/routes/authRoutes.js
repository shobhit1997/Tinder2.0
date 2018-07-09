const express=require('express');
const User= require('../.././app/models/user');
const imageStreams=require('.././imageStreams');
const  Grid = require('gridfs-stream');
const multiparty = require('connect-multiparty')();
const authenticate=require('.././middleware/authenticate');
const _ = require('lodash');
const mongoose = require('.././db/connectDB');
const router=express.Router();
const mongodb = mongoose.connection;
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

router.route('/logout')
	.delete(authenticate,function(req,res){
		req.user.removeToken(req.token).then(function(){
			res.status(200).send();
		},function(){
			res.status(400).send();
		});
	});

module.exports=router;