package com.minerva.soccer.core

class Team {	
	String name
	String type
	String oneWordIdentifier
	static hasMany = [leagues: League]
	static belongsTo = com.minerva.soccer.core.League
	
    static constraints = {
		type nullable: true
		oneWordIdentifier nullable: true
    }
}
