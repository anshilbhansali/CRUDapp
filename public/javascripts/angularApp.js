var app = angular.module('MyNews', ['ui.router']);
var socket = io();

//config ui-router for routing views
app.config(['$stateProvider', '$urlRouterProvider', 
	function($stateProvider, $urlRouterProvider){

		$stateProvider.state('home', {
			url: '/home',
			templateUrl: '/home.html',
			controller: 'MainCtrl as mainctrl',
			onEnter: ['$state', 'auth', function($state, auth){
		    if(!auth.isLoggedIn()){
		      $state.go('login');
		    }
		  }]
		})
		.state('posts', {
			url: '/posts/{id}',
			templateUrl: '/posts.html',
			controller: 'PostsCtrl as postsctrl'
		})
		.state('login', {
		  url: '/login',
		  templateUrl: '/login.html',
		  controller: 'AuthCtrl as authctrl',
		  onEnter: ['$state', 'auth', function($state, auth){
		    if(auth.isLoggedIn()){
		      $state.go('home');
		    }
		  }]
		})
		.state('register', {
		  url: '/register',
		  templateUrl: '/register.html',
		  controller: 'AuthCtrl as authctrl',
		  onEnter: ['$state', 'auth', function($state, auth){
		    if(auth.isLoggedIn()){
		      $state.go('home');
		    }
		  }]
		})
		.state('chat', {
			url: '/chat',
			templateUrl: '/chat.html',
			controller: 'ChatCtrl as chatctrl',
			onEnter: ['$state', 'auth', function($state, auth){
		    if(!auth.isLoggedIn()){
		    	alert('Please login first');
		      	$state.go('login');
		    }
		  }]
		})
		.state('user', {
			url: '/users/{id}',
			templateUrl: '/users.html',
			controller: 'UsersCtrl as usersctrl',
			onEnter: ['$state', 'auth', function($state, auth){
		    if(!auth.isLoggedIn()){
		    	alert('Please login first');
		      	$state.go('login');
		    }
		  }]
		});


		$urlRouterProvider.otherwise('home');
}]);

//building a service ~ built-in $http service
app.factory('posts', [function(){

	var o = {
		posts: [
		{title: 'post 1', upvotes: 5, comments: [{
			body: "some comment",
			author: 'user',
			upvotes: 0
		}]},
	  {title: 'post 2', upvotes: 2, comments: []},
	  {title: 'post 3', upvotes: 15, comments: []},
	  {title: 'post 4', upvotes: 9, comments: []},
	  {title: 'post 5', upvotes: 4, comments: []}
	  ]
	};

	return o;

}]);

//service for authentication
app.factory('auth', ['$http', '$window', function($http, $window){
	var auth = {};

	auth.saveToken = function(token){
		$window.localStorage['my-news-token'] = token;
	};

	auth.getToken = function (){
	  return $window.localStorage['my-news-token'];
	};

	auth.isLoggedIn = function(){
		var token = auth.getToken();
		if(token){
		    var payload = JSON.parse($window.atob(token.split('.')[1]));

		    return payload.exp > Date.now() / 1000;
		}
		else{
		    return false;
		}
	};

	auth.currentUser = function(){
		if(auth.isLoggedIn()){
		    var token = auth.getToken();
		    var payload = JSON.parse($window.atob(token.split('.')[1]));

		    return payload.username;
		}
	};

	auth.currentID = function(){
		if(auth.isLoggedIn()){
		    var token = auth.getToken();
		    var payload = JSON.parse($window.atob(token.split('.')[1]));

		    return payload._id;
		}
	}

	auth.register = function(user){

		return $http.post('/register', user).then(function(res){
			auth.saveToken(res.data.token);
			return 'success_register';
		}, function(res){
			return 'error_register';
		});
	}

	auth.logIn = function(user){
	  return $http.post('/login', user).then(function(res){
			auth.saveToken(res.data.token);
			return 'success_login';
		}, function(res){
			return 'error_login';
		});
	};

	auth.logOut = function(){
	  $window.localStorage.removeItem('my-news-token');
	};

	return auth;
}]);

app.controller('AuthCtrl', ['$state', 'auth', function($state, auth){
	var store = this;
	store.user = {};
	
	this.register = function(){
		
		auth.register(store.user).then(function(res){
			if(res === 'success_register')
			{
				alert('successfully registered');
				$state.go('home');
			}
			else if(res === 'error_register')
			{
				alert("error while registering");
			}

		});
	};

	this.logIn = function(){
		auth.logIn(store.user).then(function(res){
			if(res === 'success_login')
			{
				alert('successfully logged in');
				$state.go('home');
			}
			else if(res === 'error_login')
			{
				alert("Incorrect username/password");
			}

		});
	};

}]);

//SPECIFIC POST
app.controller('PostsCtrl', ['$http', 'posts', '$stateParams', 'auth',
	function($http, posts, $stateParams, auth){

	var store = this;
	var post_id = $stateParams.id;

	var alreadyUpVoted = {};

	$http.get('/posts/' + post_id).then(function(res){
		store.post = res.data;
		//alert(store.post.comments.length);
	}, function(res){
		alert("error ");
	});



	this.addComment = function(){
		if(this.body==="")return;
		//alert(this.post);
		var new_comment = {
			body: this.body,
			upvotes: 0,
			author: auth.currentUser(),
			author_id: auth.currentID()
		};

		var h = {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		};

		$http.post('/posts/'+post_id+'/comments', new_comment, h).then(function(res){
			store.post.comments.push(res.data);
		}, function(res){
			alert("bad "+ res);
		});

		this.body = '';
		this.author = '';
	}

	this.incrementUpvotes = function(comment){

		if(alreadyUpVoted[comment._id]==null)
		{
			$http.put('/posts/'+post_id+'/comments/'+comment._id+'/upvote').then(function(res){
				comment.upvotes += 1;
				alreadyUpVoted[comment._id] = true;
			}, function(res){

			});
		}
		else
			alert('You can only vote once');
	}

	this.deleteComment = function(comment){
		if(confirm("are you sure?"))
		{
			$http.delete('/posts/'+post_id+'/comments/'+comment._id).then(function(res){
			
				var i = store.post.comments.indexOf(comment);
				store.post.comments.splice(i,1); 

			}, function(res){
				alert("bad "+res);
			});
		}
	}

	this.getCurrID = function(){
		return auth.currentID();
	}



}]);

//ALL POSTS ~ main room
app.controller('MainCtrl', ['$http', 'posts', 'auth', '$state',
	function($http, posts, auth, $state){
	
	var store = this;
	store.posts = [];

	store.alreadyUpVoted = {}; // <post_id, boolean>
	var Upvotes = {};
	var postToUpvote = {}; //<post_id, upvote_id>

	//get all posts
	$http.get('/posts').then(function(response){
		//success
		store.posts = response.data;
		//alert(store.posts[0].comments[0]);
	}, function(response){
		//error
		alert("Bad "+response);
	});

	//get all upvotes
	$http.get('/upvotes').then(function(res){
		Upvotes = res.data;

		//parse upvotes into a dictionary
		Upvotes.forEach(function(upvote){

			if(upvote.user_id == auth.currentID())
			{
				store.alreadyUpVoted[upvote.post_id] = true;
				postToUpvote[upvote.post_id] = upvote._id;
			}
		});

	}, function(res){
		alert("Did not get all upvotes "+res);
	});

	


	this.addPost = function(){
		//alert(this.title);
		if(this.title === "" || !this.title){
			alert('Please fill in all blanks');
			return;
		}

		var new_post = {
			title:this.title, 
			upvotes:0,
			link: this.link,
			author: auth.currentUser(),
			author_id: auth.currentID(),
			comments: []
		};

		//for authorization
		var h = {
			headers: {Authorization: 'Bearer ' + auth.getToken()}
		};
		//alert(auth.getToken());

		$http.post('/posts', new_post, h)
		.then(function(res){
			//success
			//alert("success");
			store.posts.push(res.data);
		},function(res){
			//error
			alert("bad post"+ res.data);
		});

		this.title = "";
		this.link = "";
	}

	this.decrementUpvotes = function(post){
		$http.put('/posts/'+post._id+'/downvote').then(function(res){
			post.upvotes -= 1;
			store.alreadyUpVoted[post._id] = false;

			//DELETE upvote
			var upvote_id = postToUpvote[post._id];
			//alert(upvote_id);
			$http.delete('/upvotes/'+upvote_id).then(function(res){
				//alert('deleted upvote successfully');
			}, function(res){
				//alert('could not delete upvote');
			});

		}, function(res){
			alert("bad "+ res);
		})
		
		
	}

	this.incrementUpvotes = function(post){
		$http.put('/posts/'+post._id+'/upvote').then(function(res){
			post.upvotes += 1;
			store.alreadyUpVoted[post._id] = true;

			//POST request, create new Upvote
			var new_upvote = {
				user_id: auth.currentID(),
				post_id: post._id
			};
			$http.post('/upvotes', new_upvote).then(function(res){
				//alert('created new upvote successfully');
			}, function(res){
				//alert('could not create new upvote');
			});

		}, function(res){
			alert("bad "+ res);
		});
	}


	this.deletePost = function(post){
		if(confirm("are you sure?"))
		{
			$http.delete('/posts/'+post._id).then(function(res){
			
				var i = store.posts.indexOf(post);
				store.posts.splice(i,1); 

			}, function(res){
				alert("bad "+res);
			});
		}
		
	}

	this.getCurrUser = function(){
		return auth.currentUser();
	}

	this.getCurrID = function(){
		return auth.currentID();
	}

	this.logOut = function(){
		auth.logOut();
		$state.go('login');
	}

}]);

//CHATROOM
app.controller('ChatCtrl', ['auth', function(auth){

	var store = this;
	store.messages = [];

	this.showMessages = function(){
		var name;
		if(!this.name)
			name = auth.currentUser();
		else 
			name = this.name;
		
		var msg = this.message;
		var message = {
			name: name,
			msg: msg,
		};

		this.message = '';

		if(message.msg)
			socket.emit('postMessage', message);		

	};

	//detecting an event
	socket.on('updateMessages', function(message){
		store.messages.push(message);
		//simple hack, bec messages wouldnt show unless clicked on that
		document.getElementById("chat-submit").click();
	});
}]);


//USER PROFILES
app.controller('UsersCtrl', ['$stateParams', '$http', function($stateParams, $http){
	var user_id = $stateParams.id;

	var store = this;

	$http.get('/users/' + user_id).then(function(res){
		store.user = res.data;
	}, function(res){
		alert("error " + res);
	});


}]);





