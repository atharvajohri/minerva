package com.minerva.media

class CommentedPost {

	static belongsTo = [targetPage: TargetPage]
	String postId
	Date dateCreated
	
    static constraints = {
    }
}
