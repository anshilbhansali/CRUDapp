var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
	title: String,
	link: String,
	upvotes: {type: Number, default: 0},
	author: String, 
	author_id: String, 
	comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
});

PostSchema.methods.upvote = function(cb) {
  this.upvotes += 1;
  this.save(cb);
};

PostSchema.methods.downvote = function(cb){
	this.upvotes -= 1;
	this.save(cb);
}

PostSchema.methods.setUserUpvoted = function(user_id){
	console.log(user_id);
	this.alreadyUpVoted[0] = true;
	this.save();
}

PostSchema.methods.clearUserUpvoted = function(user_id){
	this.alreadyUpVoted[user_id] = false;
	this.save();
}


//define model called Post
mongoose.model('Post', PostSchema);