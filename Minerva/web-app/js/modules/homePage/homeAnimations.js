define(["jquery", "three", "mousemeter"], function($){
	
	var scene, camera, mouseSpeed;
	var octahedronMesh, renderer;
	var mouseCirclesObject = {};
	var redColor = new THREE.Color( 0xff0000 );
	
	var ThreeAnimations = function(){
		var self = this;
		self.init = function(){
			captureMouseSpeed();
			setupAnimationEnvironment();
			animateScene();			
		}
	}
	
	function init(){
		var threeAnimations = new ThreeAnimations();
		threeAnimations.init();			
	}
	
	function captureMouseSpeed(){
		$('body').cursometer({
	        onUpdateSpeed: function(speed) {
	            mouseSpeed = speed;
	        },
	        updateSpeedRate: 20
	    });
	}
	
    function setupAnimationEnvironment() {

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera( 75, 1000 / 500, 1, 10000 );
        camera.position.z = 300;

        var commonMaterial = new THREE.MeshBasicMaterial({ color: 0x555555, wireframe: false, wireframeLinewidth: 3 });
        
        var octahedron1 = new THREE.OctahedronGeometry( 150, 1 );//, 200, 200 );
        
        octahedronMesh = new THREE.Mesh( octahedron1, commonMaterial )
        
        for (var i in octahedronMesh.geometry.faces){
        	octahedronMesh.geometry.faces[i].vertexColors.push(redColor);
        }
        
        scene.add( octahedronMesh );
        
        renderer = new THREE.CanvasRenderer({ alpha: true });
        renderer.setSize( 1000, 500 );
        renderer.setClearColor( 0x000000, 0);

        $("#mcc-menu-container")[0].appendChild( renderer.domElement );

    }

    function animateScene() {
        requestAnimationFrame( animateScene );

        var speed = 2/**mouseSpeed*/ || 2;
        
        octahedronMesh.rotation.x += mouseSpeed ? (speed > 0.01 ? (speed < 0.08 ? speed : 0.01) : 0.01) : 0.01;
        octahedronMesh.rotation.y += mouseSpeed ? (speed > 0.01 ? (speed < 0.07 ? speed : 0.03) : 0.03) : 0.03;
//        octahedronMesh.rotation.z += mouseSpeed ? (speed > 0.01 ? (speed < 0.09 ? speed : 0.02) : 0.02) : 0.02;

        renderer.render( scene, camera );
    }	
    /*
      
      
     */
    return {
    	init: init
    }
});