package com.minerva.soccer.jobs

import com.minerva.soccer.core.Fixture

class MatchEventRegisterJob {
	
	def soccerService
	
    static triggers = {
//      simple repeatInterval: 5000l // execute job once in 5 seconds
    }

    def execute(context) {
        // execute job
		def matchId = context.mergedJobDataMap.get('matchId')
		def match = Fixture.get(matchId)
		soccerService.scrapeMatchInformation(match)
    }
}
