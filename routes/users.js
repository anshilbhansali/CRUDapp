var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');

/* GET users listing. */
router.get('/', function(req, res, next) {
  User.find(function(err, users){
		if(err){return next(err);}

		res.json(users);
	});
});

//GET specific user
router.get('/:user', function(req, res, next){
	
	User.findById(req.params.user).exec(function(err, user){
		if(err){return next(err);}
		if(!user){return new Error('Cant find user');}
		
		res.json(user);
	});
});

module.exports = router;
