package com.minerva.soccer.core

import org.jsoup.Jsoup
import org.jsoup.nodes.Document

class SoccerService {

	def matchEventNotifierService
	
    def createLeague(leagueName) {
		def league = League.findByName(leagueName)
		if (!league){
			league = new League(name: leagueName)
			if (league.save()){
				log.info "---> New league ${leagueName} created."
			}else {
				log.info "---> Error/s while saving ${leagueName}"
				league.errors.each {println it}
				return null
			}
		}
		return league
    }
	
	def createTeam(teamName, league) {
		def team = Team.findByName(teamName)
		if (!team){
			team = new Team(name: teamName)
			if (team.save()){
				log.info "---> New Team ${teamName} created."
				team.addToLeagues(league)
				league.addToTeams(team)
			}else {
				log.info "---> Error/s while saving ${teamName}"
				team.errors.each {println it}
				return null
			}
		}
		return team
	}
	
	def createFixture(homeTeam, awayTeam, dateOfMatch) {
		Calendar cal = Calendar.getInstance();
		cal.setTime(dateOfMatch)
		def identifier = cal.getTimeInMillis() + homeTeam.name + "v" + awayTeam.name
		def fixture = Fixture.findByIdentifier(identifier)
		if (!fixture){
			fixture = new Fixture(homeTeam: homeTeam, awayTeam: awayTeam, dateOfMatch: dateOfMatch, identifier: identifier)
			if (fixture.save()){
				log.info "---> New fixture created."
			}else {
				log.info "---> Error/s while saving fixture"
				fixture.errors.each {println it}
				return null
			}
		}else {
			log.info "fixture ${fixture.identifier} matched"
		}
		return fixture
	}
	
	def getTodaysMatches(){
		Calendar cal = Calendar.getInstance();
		cal.setTime(new Date())
		cal.add(Calendar.DAY_OF_MONTH, -1)
		Date previousDay = cal.getTime()
		cal.add(Calendar.DAY_OF_MONTH, 2)
		Date nextDay = cal.getTime()
		return Fixture.findAllByDateOfMatchBetween(previousDay, nextDay)
	}
	
	def scrapeMatchInformation(Fixture match){
		log.info "sch --> scraping info for $match.homeTeam.name v $match.awayTeam.name"
		if (!match.infoLink){
			def src = "http://www.livegoals.com"
			Document doc = Jsoup.connect(src).get();
			def html = "", link = ""
			doc.select(".EC .ECT a").each { ele ->
				def currentLink = ele.attr("href")
				if (teamNameInLink(match.homeTeam.oneWordIdentifier, currentLink) &&
						teamNameInLink(match.awayTeam.oneWordIdentifier, currentLink)){
					match.infoLink = src + currentLink 	
				}
			}
		}else{
			updateViewOnEvent(match.infoLink)
		}
		
		matchEventNotifierService.broadcastMessage("hello")
	}
	
	def updateViewOnEvent(link){
		Document doc = Jsoup.connect(link).get();
//		log.info doc.html()
//		def session = RequestContextHolder.currentRequestAttributes().getSession()
//		session.broadcaster.broadcast(jsonResult)
	}
	
	def teamNameInLink(String name, String link){
		def isCorrect = true;
		if (name.indexOf(" ") > -1){
			def words = name.split(" ")
			words.each { word ->
				if (link.toLowerCase().indexOf(word.toLowerCase()) == -1){
					isCorrect = false;
				}
			}
		}else{
			if (link.toLowerCase().indexOf(name.toLowerCase()) == -1){
				isCorrect = false
			}
		}
		
		return isCorrect
	}
}
