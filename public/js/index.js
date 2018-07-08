jQuery('#login-form').on('submit',function(e){
e.preventDefault();
 var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      console.log(this.responseText);
      var user=JSON.parse(this.responseText);
      var x_auth = xhttp.getResponseHeader('x-auth');
      localStorage.setItem('_id',user._id);
      localStorage.setItem('name',user.name);
      localStorage.setItem('phone',user.phone);
      localStorage.setItem('x-auth',x_auth);
      localStorage.setItem('profile_photo',user.profilePhoto);
      localStorage.setItem('images',user.images);
      console.log(window.location.href);
      window.location.href='/dashboard.html';
    }
  };
  xhttp.open("POST", "http://localhost:8000/api/login", true);
  xhttp.setRequestHeader("Content-type", "application/json");
  var jsonObj={
  	phone : jQuery("[name='phone']").val(),
  	password : jQuery("[name='password']").val()	
  };
  xhttp.send(JSON.stringify(jsonObj));
});

$( document ).ready(function() {
  // console.log(localStorage.getItem('x-auth'));

    if(localStorage.getItem('x-auth')){
    window.location.href='/dashboard.html';
    }
});