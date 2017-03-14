var express = require('express');
var passport = require('passport');
var mongoose = require('mongoose');
var jwt = require('express-jwt');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');
var User = mongoose.model('User');

var router = express.Router();
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

/* GET home page. */
//http://localhost:3000
router.get('/', function(req, res, next) {
  res.render('index', { title: 'My News' });
});


//Posts
//test by http://localhost:3000/posts
//get all posts
router.get('/posts', function(req, res, next){
	Post.find(function(err, posts){
		if(err){return next(err);}

		res.json(posts);
	});

});

//create a post
router.post('/posts', auth, function(req, res, next){
	var post = new Post(req.body);

	post.save(function(err, post){
		if(err) {return next(err);}

	res.json(post);
	});
});

router.param('post', function(req, res, next, id){
	var query = Post.findById(id);

	query.exec(function(err, post){
		if(err){return next(err);}

		if(!post){return next(new Error('cant find post'));}

		req.post = post;
		return next();
	});
});

//get a specific post
router.get('/posts/:post', function(req, res){
	req.post.populate('comments', function(err, post) {
    if (err) { return next(err); }

    res.json(post);
  });
});

//update(upvote) a post
router.put('/posts/:post/upvote', function(req, res, next){
	//req.post.setUserUpvoted(req.body.id);
	req.post.upvote(function(err, post){
		if(err){return next(err);}

		res.json(post);
	});

});

//update(downvote) a post
router.put('/posts/:post/downvote', function(req, res, next){
	req.post.downvote(function(err, post){
		if(err){return next(err);}

		res.json(post);
	});
})

//delete a post
router.delete('/posts/:post', function(req, res){
	req.post.remove(function(err, post){
		if(err){return next(err);}

		res.json(post);
	});
});

//Comments
router.post('/posts/:post/comments',auth, function(req, res, next){
	var comment = new Comment(req.body);
	comment.post = req.post;
	comment.author = req.payload.username;

	comment.save(function(err, comment){
		if(err){return next(err);}

		req.post.comments.push(comment);
		req.post.save(function(err, post){
			if(err){ return next(err); }

      		res.json(comment);
		});
	});

});

router.get('/posts/:post/comments', function(req, res, next){
	Comment.find(function(err, comments){
		if(err){return next(err);}

		res.json(comments);
	});
});

router.param('comment', function(req, res, next, id){
	var query = Comment.findById(id);

	query.exec(function(err, comment){
		if(err){return next(err);}
		if(!comment){return new Error('Cant find comment');}

		req.comment = comment;
		return next();
	});
});



router.put('/posts/:post/comments/:comment/upvote', function(req, res, next){
	req.comment.upvote(function(err, comment){
		if(err){return next(err);}

		res.json(comment);
	});
});

//Passport -- for authentication, JWT
router.post('/register', function(req, res, next){

	if(!req.body.username || !req.body.password){
    	return res.status(400).json({message: 'Please fill out all fields'});
  	}

  	var user = new User();

  	user.username = req.body.username;
 	user.setPassword(req.body.password);

	user.save(function(err){
		if(err){return next(err);}

		return res.json({token: user.generateJWT()});
	});
});

router.post('/login', function(req, res, next){
	if(!req.body.username || !req.body.password){
	    return res.status(400).json({message: 'Please fill out all fields'});
	}

	passport.authenticate('local', function(err, user, info){
		if(err){ return next(err); }

	    if(user){
	      return res.json({token: user.generateJWT()});
	    } else {
	      return res.status(401).json(info);
	    }
	})(req, res, next);
});



module.exports = router;

