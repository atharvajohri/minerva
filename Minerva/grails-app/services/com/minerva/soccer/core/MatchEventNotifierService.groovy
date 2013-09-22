package com.minerva.soccer.core

import org.atmosphere.cpr.AtmosphereRequest
import com.odelia.grails.plugins.atmosphere.AtmosphereHandlerArtefactHandler

import org.atmosphere.cpr.AtmosphereHandler
import com.odelia.grails.plugins.atmosphere.GrailsHandler
import com.odelia.grails.plugins.atmosphere.StratosphereServlet

import org.codehaus.groovy.grails.commons.GrailsClassUtils
import org.atmosphere.cpr.AtmosphereResource
import org.atmosphere.cpr.AtmosphereResourceEvent
import org.atmosphere.cpr.AtmosphereResponse
import org.atmosphere.cpr.MetaBroadcaster

class MatchEventNotifierService {
	
	static transactional = false
	static atmosphere = [mapping: '/relay/discover']
    
	@Override
	public void onRequest(AtmosphereResource r) throws IOException {
		AtmosphereRequest req = r.getRequest();
		try{
			if (req.getMethod().equalsIgnoreCase("GET")) {
				log.info "got get, and suspending"
				r.getBroadcaster().broadcast("opened")
				r.suspend();
			} else if (req.getMethod().equalsIgnoreCase("POST")) {
				def data = req.getReader().readLine().trim()
				log.info "got some data:\n $data"
				//log.info "---> $uuid"
			}
		}catch(Exception e){
			e.printStackTrace()
		}finally{
			
		}
	}

	@Override
	public void onStateChange(AtmosphereResourceEvent event) throws IOException {
		AtmosphereResource r = event.getResource();
		AtmosphereResponse res = r.getResponse();
		String uuid = r.uuid();
		
		if (r.isSuspended()) {
			String message = event.getMessage().toString();
			log.info "sending a response $message\n ---> $uuid"
			res.getWriter().write(message);
			//if (flushResponse){
			res.getWriter().flush();
				//flushResponse = false;
			//}
		} else if (!event.isResuming()){
			//find user related to this uuid, if exists, tell other's that he quit
			log.info ("Shutting Down.. \n --->  $uuid")
		}
	}
	
	def broadcastMessage(msg){
		log.info "broadcasting"
		MetaBroadcaster.getDefault().broadcastTo("/relay/discover", "hello world");
	}
}
