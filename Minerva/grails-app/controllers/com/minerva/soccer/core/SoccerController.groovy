package com.minerva.soccer.core

import java.text.DateFormat
import java.text.SimpleDateFormat

import com.minerva.soccer.jobs.MatchEventRegisterJob

import org.jsoup.Jsoup
import org.jsoup.nodes.Document

class SoccerController {
	
	def soccerService

    def index() { }
	
	def parseEplFixtures() {
		def fixtureSource = params.fixtureSource ?: "http://www.premierleague.com/content/premierleague/en-gb/matchday/matches.html?paramClubId=ALL&paramComp_190=true&view=.dateSeason.html"
		Document doc = Jsoup.connect(fixtureSource).get();
		def contentElements = doc.select(".contentTable")
		def vsHtml = ""
		def eplLeague = soccerService.createLeague("English Premier League")
		
		DateFormat formatter= new SimpleDateFormat("MM/dd/yyyy hh:mm:ss Z");
		formatter.setTimeZone(TimeZone.getTimeZone("GMT"));
		
		Calendar cal = Calendar.getInstance();
		SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
		if (eplLeague){
			contentElements.each { content ->
				def dateExpanded = content.select("tr").first().select("th").html().replaceAll(/<.*>/, "")
				def dateWords = dateExpanded.split(" ")
				content.select("tr").each { fixtureRow ->
					if (fixtureRow.select(".time").html()){
						Date date = new SimpleDateFormat("MMM", Locale.ENGLISH).parse(dateWords[2]);
						cal.setTime(date);
						int monthNumber = cal.get(Calendar.MONTH) + 1;
						def kickOff = fixtureRow.select(".time").html()
						def parseableDate = "${dateWords[1]}/${((monthNumber)<10 ? ('0'+ monthNumber) : monthNumber) }/${dateWords[3]} $kickOff:00"
						Date dateOfFixture = sdf.parse(parseableDate)
						cal.setTime(dateOfFixture)
						cal.add(Calendar.HOUR_OF_DAY, 4)
						cal.add(Calendar.MINUTE, 30)
						Date dateOfFixtureIST = cal.getTime()
						def teams = fixtureRow.select(".clubs a").html().split(" v ")
						soccerService.createFixture(soccerService.createTeam(teams[0], eplLeague), soccerService.createTeam(teams[1], eplLeague), dateOfFixtureIST)
					}
				}
			}
		}
		
//		log.info matchContent
//		
		render contentElements
	}
	

	def createTestFixture() {
		def testLeague = soccerService.createLeague("test league")
		def testHTeam = soccerService.createTeam(params.h, testLeague)
		def testATeam = soccerService.createTeam(params.a, testLeague)
		SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
		Date testFixtureDate = sdf.parse(params.d)
		soccerService.createFixture(testHTeam, testATeam, testFixtureDate);
	}
		
	def todaysMatches() {
		[todaysMatches: soccerService.getTodaysMatches()]
	}
	
	def setupOwi() {
		Team.list().each { team ->
			log.info "updating $team.name"
			if (team.name.indexOf(" ") > -1){
				def teamName = team.name.split(" ")[0]
				team.oneWordIdentifier = teamName
			}else{
				team.oneWordIdentifier = team.name
			}
		}
	}
	
	//schedules to subscribe events to todays matches
	def scheduleMatchEventSniffing() {
		def todaysMatches = soccerService.getTodaysMatches()
		Calendar cal = Calendar.getInstance()
		todaysMatches.each { match ->
			if (match.homeTeam.name == "Man City"){
				log.info "triggering $match.homeTeam.name vs $match.awayTeam.name"
				cal.setTime(match.dateOfMatch);
				cal.add(Calendar.MINUTE, -10);
				int hours = cal.get(Calendar.HOUR_OF_DAY);
				int minutes = cal.get(Calendar.MINUTE);
				int seconds = cal.get(Calendar.SECOND);
				int dayOfMonth = cal.get(Calendar.DAY_OF_MONTH)
				int month = cal.get(Calendar.MONTH) + 1
				def cronExp = "/20 * ${hours}-${hours+3} ${dayOfMonth} ${month} ?".toString()
				Map paramMap = new HashMap()
				paramMap.put("matchId", match.id)
				MatchEventRegisterJob.schedule(cronExp, paramMap)
			}
		}
	}
	
	
	def updateRetriever(){
		
	}
	
}
