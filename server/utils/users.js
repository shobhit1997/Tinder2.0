class Users{
	constructor (){
		this.users=[];
	}
	addUser(id,token){
		var user={id,token};
		this.users.push(user);
		return user;
	}
	removeUser(id){
		var user=this.getUser(id);
		console.log(this.users);
		if(user){
			this.users=this.users.filter(function(user){
			return user.id!==id;

		});
		}
		return user;
	}
	getUser(id){
		return this.users.filter(function(user){
			return user.id===id;

		})[0];
	}
}
module.exports={Users};