package com.minerva.workbench

class PageData {

	String facebookId
	Date dateCreated
	
	static hasMany = [posts: PostData]
	
    static constraints = {
		facebookId unique: true
    }
}
