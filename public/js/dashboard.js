var socket=io();
socket.on('connect',function() {
	socket.emit('join',localStorage.getItem('x-auth'),function(err){
		if(err){
		}
		else{

		}
	});
	
});
socket.on('disconnect',function(users){

});

function renderUser(user,id2){
var template = jQuery('#card_template').html();
		var html = Mustache.render(template,{
		 	name : user.name,
		 	img_src : "http://localhost:8000/api/image/"+user.profilePhoto,
		 	img_id : user._id,
		 	like_id : 'like_'+user._id,
		 	dislike_id : 'dislike_'+user._id
		 });
		 jQuery('#users').append(html);
		 var id1=user._id;
		 $('#'+user._id).click(function(){
		 	console.log(user);
		 	$('#user_profile').html('');
		 	var status;
		 	if(user.status==='online')
		 	{
		 		status=user.status;
		 	}
		 	else
		 	{
		 		status="Last Seen :"+moment(user.lastSeen).format('MMM Do, YYYY h:mm a');
		 	}
			var template = jQuery('#user_template').html();
			var html = Mustache.render(template,{
		 	name : user.name,
		 	last_seen: status
		 });
			$('#user_profile').append(html);
			user.images.map(data=>{
				var template = jQuery('#image_template').html();
				var html = Mustache.render(template,{
	 			img_src : "http://localhost:8000/api/image/"+data,
	 			img_id : data
	 		});
	 		jQuery('#photos').append(html);
			});
		});
		 $('#like_'+user._id).click(function(){
			emitLikeRequest(id1,id2);});
		$('#dislike_'+user._id).click(function(){
			emitLikeRequest(id2,id1)});
}
socket.on('showPhotos',function(arrayUsers){
	console.log(arrayUsers);
	jQuery('#users').html('');
	renderUser(arrayUsers[0],arrayUsers[1]._id);
	renderUser(arrayUsers[1],arrayUsers[0]._id);	
});

function emitLikeRequest(liked,disliked){
	console.log({liked,disliked});
	socket.emit('liked_disliked',{liked,disliked},function(data){

	});
}

var logoutButton=$('#logout');
logoutButton.click(function(){
	localStorage.clear();
	window.location.href='/'
});

var uploadButton=$('#upload');
uploadButton.click(function(){
	
	if(document.getElementById('photo').style.display==='block')
	{
		if(document.getElementById('photo').files.length>0){
			var xhttp = new XMLHttpRequest();
  			xhttp.onreadystatechange = function() {
    		if (this.readyState == 4 && this.status == 200) {
      			// console.log(this.responseText);
      			var user=JSON.parse(this.responseText);
      			var array=localStorage.getItem('images').split(',');
      			array.push(user.images[user.images.length-1]);
      			localStorage.setItem('images',array);
      			var template = jQuery('#image_template').html();
				var html = Mustache.render(template,{
	 			img_src : "http://localhost:8000/api/image/"+user.images[user.images.length-1],
	 			img_id : user.images[user.images.length-1]
	 		});
	 		jQuery('#images').append(html);
	 		document.getElementById('photo').files[0]=undefined;
	 		console.log(document.getElementById('photo').files);
     			document.getElementById('photo').style.display='none';
     			
    		}
	  		};
	  		xhttp.open("POST", "http://localhost:8000/api/image/"+localStorage.getItem('_id'), true);
	  		xhttp.setRequestHeader("x-auth", localStorage.getItem('x-auth'));
	  		var formData=new FormData();
	  		formData.append('image',document.getElementById('photo').files[0]);
	  		xhttp.send(formData);	

		}
		else{
			document.getElementById('photo').style.display='none';		
		}
	}
	else
	{
		document.getElementById('photo').style.display='block';
	}
});


$( document ).ready(function() {
document.getElementById('user_name').innerHTML=localStorage.getItem('name');
    if(localStorage.getItem('profile_photo')){
    	document.getElementById('profile_photo').src="http://localhost:8000/api/image/"+localStorage.getItem('profile_photo');

    }
    if(localStorage.getItem('images').length>0)
    {
    	var array=localStorage.getItem('images').split(',');
    	array.map(data=>{
    	
			var template = jQuery('#image_template').html();
			var html = Mustache.render(template,{
	 			img_src : "http://localhost:8000/api/image/"+data,
	 			img_id : data
	 		});
	 		jQuery('#images').append(html);
    	});	
    }
});