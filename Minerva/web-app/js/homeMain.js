requirejs.config({
	baseUrl : "js",
	paths : {
		'jquery' : 'frameworks/jquery.min',
		'knockout' : 'frameworks/knockout',
		'three' : 'frameworks/three.min',
		'mousemeter' : 'frameworks/mousemeter.min',
//		'facebook': '//connect.facebook.net/en_US/all',
		'commonUtils' : 'modules/utilities/commonUtils'
	},
	shim : {
		'mousemeter': {
			deps: ["jquery"]
		}/*,
	    'facebook' : {
	      exports: 'FB'
	    }*/
	}
});

require(["modules/homePage/homeController"], function(_home){
	_home.init();
});
