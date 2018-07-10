jQuery('#signup-form').on('submit',function(e){
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
  xhttp.open("POST", window.location.origin+"/api/signup", true);
  // xhttp.setRequestHeader("Content-type", "multipart/form-data");
  var formData=new FormData();
  formData.append('name',jQuery("[name='name']").val());
  formData.append('phone',jQuery("[name='phone']").val());
  formData.append('password',jQuery("[name='password']").val());
  formData.append('gender',$("#gender-type option:selected").text());
  formData.append('image',document.getElementById('dp').files[0]);
  xhttp.send(formData);
});


$( document ).ready(function() {

    if(localStorage.getItem('x-auth')){
     window.location.href='/dashboard.html';  
    }
});