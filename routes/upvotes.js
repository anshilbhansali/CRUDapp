var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Upvotes = mongoose.model('Upvotes');


//GET all upvotes
router.get('/', function(req, res, next){
	Upvotes.find(function(err, upvotes){
		if(err){return next(err);}

		res.json(upvotes);
	});
});

//create new upvote
router.post('/', function(req, res, next){
	var upV = new Upvotes(req.body);

	upV.save(function(err, upV){
		if(err){return next(err);}
		res.json(upV);
	});
});

//delete an upvote
router.delete('/:upvote', function(req, res, next){
	//find the upvote
	Upvotes.findById(req.params.upvote).exec(function(err, upvote){
		if(err){return next(err);}
		if(!upvote){return new Error('Cant find upvote');}

		upvote.remove(function(err, upvote){
			if(err){return next(err);}
			res.json(upvote);
		});
	});
});

module.exports = router;
