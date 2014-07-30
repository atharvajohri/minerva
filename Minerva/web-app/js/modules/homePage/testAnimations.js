define(["jquery", "three"], function($){

	var container;
	var camera, scene, renderer;
	var mesh;

	function init(){
		setupCanvas();
		animate();
	}
	

	function setupCanvas() {

		container = document.getElementById( 'mcc-menu-container' );

		//

		camera = new THREE.PerspectiveCamera( 75, 1000 / 800, 1, 10000 );
		camera.position.z = 2750;

		scene = new THREE.Scene();
//		scene.fog = new THREE.Fog( 0x050505, 2000, 3500 );

		//

		var particles = 80;

		var geometry = new THREE.BufferGeometry();

		var positions = new Float32Array( particles * 3 );
		var colors = new Float32Array( particles * 3 );

		var color = new THREE.Color();

		var n = 2000, n2 = n /2 ; // particles spread in the cube

		for ( var i = 0; i < positions.length; i += 3 ) {

			// positions

			var x = Math.random()*n-n2;
			var y = Math.random()*n-n2;
			var z = Math.random()*n-n2;

			positions[ i ]     = x;
			positions[ i + 1 ] = y;
			positions[ i + 2 ] = z;

			// colors

//			var vx = ( x / n ) + 0.5;
//			var vy = ( y / n ) + 0.5;
//			var vz = ( z / n ) + 0.5;

			color.setRGB( 0.5, 0.5, 0.5 );

			colors[ i ]     = color.r;
			colors[ i + 1 ] = color.g;
			colors[ i + 2 ] = color.b;

		}

		geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
		geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );

		geometry.computeBoundingSphere();

		//

		var material = new THREE.PointCloudMaterial( { size: 30, vertexColors: THREE.VertexColors } );

		particleSystem = new THREE.PointCloud( geometry, material );
		scene.add( particleSystem );

		//

		renderer = new THREE.WebGLRenderer( { antialias: false, alpha: true } );
		renderer.setClearColor( 0x000000, 0 );
		renderer.setSize( 1000, 800 );

		container.appendChild( renderer.domElement );

		//

//		stats = new Stats();
//		stats.domElement.style.position = 'absolute';
//		stats.domElement.style.top = '0px';
//		container.appendChild( stats.domElement );

		//

		window.addEventListener( 'resize', onWindowResize, false );

	}

	function onWindowResize() {

		windowHalfX = window.innerWidth / 2;
		windowHalfY = window.innerHeight / 2;

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( 1000, 800 );

	}

	//

	function animate() {

		requestAnimationFrame( animate );

		render();
//		stats.update();

	}

	function render() {

		particleSystem.rotation.x += 0.019;
		particleSystem.rotation.y += 0.017;
		particleSystem.rotation.z += 0.018;

		renderer.render( scene, camera );

	}
	
	return {
		init: init
	}
});