package com.minerva



class WorkbenchJob {
	
	def workbenchService
	
    static triggers = {
      simple repeatInterval: 30000l 
    }

    def execute() {
        // execute job
		workbenchService.triggerWorkbenchJobActions()
    }
}
