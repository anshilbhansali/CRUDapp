var mongoose = require('mongoose');

var UpvotesSchema = new mongoose.Schema({
	user_id: String,
	post_id: String, 
});

mongoose.model('Upvotes', UpvotesSchema);