package com.minerva.soccer.core

class League {

	String name
	
	static hasMany = [teams: Team]
	
    static constraints = {
    }
}
