package com.minerva.info.core

import com.minerva.soccer.core.Team

class Information {
	String text
	Date dateCreated
	
    static constraints = {
		text nullable: true
    }
}
