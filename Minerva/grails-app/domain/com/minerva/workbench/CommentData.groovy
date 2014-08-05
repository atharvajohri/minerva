package com.minerva.workbench

import java.util.Date;

class CommentData {

	String facebookId
	Date dateCreated
	String commentText
	String commentPicture
	
    static constraints = {
		commentText nullable: true
		commentPicture nullable: true
		facebookId unique: true
    }
}
