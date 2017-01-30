var app = angular.module('flapperNews', ['ui.router']);

//config ui-router for routing views
app.config(['$stateProvider', '$urlRouterProvider', 
	function($stateProvider, $urlRouterProvider){

		$stateProvider.state('home', {
			url: '/home',
			templateUrl: '/home.html',
			controller: 'MainCtrl as mainctrl'
		})
		.state('posts', {
			url: '/posts/{id}',
			templateUrl: '/posts.html',
			controller: 'PostsCtrl as postsctrl'
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

app.controller('PostsCtrl', ['$http', 'posts', '$stateParams',
	function($http, posts, $stateParams){

	var store = this;
	var post_id = $stateParams.id;
	

	$http.get('/posts/' + post_id).then(function(res){
		store.post = res.data;
	}, function(res){
		alert("bad id: "+ post_id);
	});

	this.addComment = function(){
		if(this.body==="")return;
		//alert(this.post);
		var new_comment = {
			body: this.body,
			author: this.author,
			upvotes: 0
		};

		$http.post('/posts/'+post_id+'/comments', new_comment).then(function(res){
			store.post.comments.push(res.data);
		}, function(res){
			alert("bad "+ res);
		});

		this.body = '';
		this.author = '';
	}

	this.incrementUpvotes = function(comment){
		$http.put('/posts/'+post_id+'/comments/'+comment._id+'/upvote').then(function(res){
			comment.upvotes += 1;
		}, function(res){

		});
	}

}]);


app.controller('MainCtrl', ['$http', 'posts',function($http, posts){
	
	
	//NEEDS A WEBSERVER
	
	var store = this;
	store.posts = [];

	$http.get('/posts').then(function(response){
		//success
		store.posts = response.data;

	}, function(response){
		//error
		alert("Bad "+response);
	});



	this.addPost = function(){
		if(this.title === ""){return;}

		var new_post = {
			title:this.title, 
			upvotes:0,
			link: this.link,
			comments: []
		};

		$http.post('/posts', new_post).then(function(res){
			//success
			//alert("success");
			store.posts.push(res.data);
		},function(res){
			//error
			alert("bad "+ res);
		});

		

		this.title = "";
		this.link = "";
	}

	this.incrementUpvotes = function(post){

		$http.put('/posts/'+post._id+'/upvote').then(function(res){
			post.upvotes += 1;
		}, function(res){
			alert("bad "+ res);
		})
		
		//alert(post.title);
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

	


}]);





