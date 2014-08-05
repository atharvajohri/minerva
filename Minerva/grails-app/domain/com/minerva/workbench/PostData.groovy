package com.minerva.workbench

import java.util.Date;

class PostData {
	String facebookId
	Date dateCreated
	static hasMany = [comments: CommentData]
	
    static constraints = {
		facebookId unique: true
    }
}
