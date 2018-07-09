const mongoose=require('mongoose');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const config=require('../../server/config/config');
var Schema=mongoose.Schema;

var UserSchema = new Schema({
	name : {
		type : String,
		required : true,
		minlength : 1,
		trim : true
	},
	phone : {
		type : Number,
		required : true,
		minlength : 10,
		maxlenght : 10,
		unique : true
	},
	password: {
		type : String,
		required: true,
		minlength : 6,

	},
	lastSeen: {
		type: Number
	},
	gender : {
		type : String,
		required : true
	},
	status : {
		type: String
	},
	likes :[Schema.ObjectId],
	dislikes :[Schema.ObjectId], 
	images : [Schema.ObjectId],
	profilePhoto:Schema.ObjectId,
	tokens : [{
		access : {
			type : String,
			required : true
		},
		token: {
			type : String,
			required : true
		}
	}]
});

UserSchema.methods.generateAuthToken=function(){
	var user=this;
	var access='auth';
	var token = jwt.sign({_id:user._id.toHexString(),access},process.env.JWT_SECRET).toString();
	user.tokens.push({access,token});
	return user.save().then(function(){
		return token;
	});
};

UserSchema.methods.toJSON=function(){
	var user=this;
	var userObject=user.toObject();
	return _.pick(userObject,['_id','name','phone','gender','lastSeen','status','images','profilePhoto']);	
};

UserSchema.methods.removeToken=function(token){
	var user=this;
	return user.update({
		$pull: {
			tokens:{token}
		}
	});
};

UserSchema.statics.findByCredentials=function(phone,password){
var User=this;
return User.findOne({phone}).then(function(user){
	if(!user){
		return Promise.reject();
	}
	return new Promise(function(resolve,reject){
		bcrypt.compare(password,user.password,function(err,res){
			if(res){
				resolve(user);
			}
			else{
				reject();
			}
		});
	});
});
};

UserSchema.statics.findByGender=function(gender,liked_disliked){
var User=this;
return User.find({gender, _id: { $nin: liked_disliked }}).then(function(users){
	if(!users){
		return Promise.reject();
	}
	else{
		return Promise.resolve(users);
	}
});
};

UserSchema.statics.findByToken = function(token){
	var User =this;
	var decoded;

	try{

		decoded= jwt.verify(token,process.env.JWT_SECRET);

	}catch(e){

		return new Promise(function(resolve,reject){
			reject();
		});

	}
	return User.findOne({
		_id : decoded._id,
		'tokens.token' : token,
		'tokens.access' : 'auth'
	});
};


UserSchema.pre('save',function(next){
var user = this;
if(user.isModified('password'))
{
	bcrypt.genSalt(10,function(err,salt){
		bcrypt.hash(user.password,salt,function(err,hash){
			user.password=hash;
			next();
		});
	});
}
else
{
	next();
}
});



module.exports=mongoose.model('User',UserSchema);

