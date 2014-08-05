package com.minerva



class WorkbenchJob {
	
	def workbenchService
	
    static triggers = {
      simple repeatInterval: 15000l // execute job once in 5 seconds
    }

    def execute() {
        // execute job
		workbenchService.triggerWorkbenchJobActions()
    }
}
