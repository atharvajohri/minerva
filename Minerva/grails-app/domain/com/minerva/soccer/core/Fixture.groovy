package com.minerva.soccer.core

import com.minerva.info.core.Information

class Fixture {
	Team homeTeam
	Team awayTeam
	Date dateOfMatch
	String finalScore
	String identifier
	String infoLink
	Information information
	
    static constraints = {
		information nullable:true
		identifier unique: true
		finalScore nullable:true
		infoLink nullable:true
    }
}
