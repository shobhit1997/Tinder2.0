const _ = require('lodash');
const User= require('../app/models/user');
const fs=require('fs');
module.exports.uploadImage = function(gfs, request, response) {  
	var _id = request.params.id;  
	var writeStream=gfs.createWriteStream({        
		filename : 'image',    
		mode : 'w'  })  
fs.createReadStream(request.files.image.path).pipe(writeStream);

	 writeStream.on('close', function (file) {
        console.log(file._id + 'Written To DB');
        if(_id){
	        User.findById(_id).then(function(user){
	        	user.images.push(file._id);
	        	user.save().then(function(user){
	        		console.log(user);
	        		response.send(user);
	        	});
	        });
    	}
    	else{
    		var body=_.pick(request.body,['name','phone','password','gender']);
			var user=new User(body);
			user.profilePhoto=file._id;
    		user.save().then(function(){
			return user.generateAuthToken();
			}).then(function(token){
				response.header('x-auth',token).send(user);
			}).catch(function(e){
				response.status(400).send(e);
			});
    	}
    });  
};

module.exports.getImage= function(gfs, _image_id, response) {  
 
	var imageStream = gfs.createReadStream({   
 			_id : _image_id,    
 			filename : 'image',    
 			mode : 'r'  
 		});
  	imageStream.on('error', function(error) {    
  	response.send('404', 'Not found');    
  		return;  
  	});
  	response.setHeader('Content-Type', 'image/jpeg');  
  	imageStream.pipe(response); 
 }; 