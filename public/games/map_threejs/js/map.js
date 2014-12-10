/**
 * Created by aishwariyaa_indramoh on 12/3/14.
 */
$(function(){
	
	var map;
	var mousePointer = { x: 0, y: 0 }
	
	function Map() {
		
		this.width       = window.innerWidth; 
		this.height      = window.innerHeight;  
		
		this.cameraAngle  = 45;
		this.near        = 0.1; 
		this.far         = 10000;
		this.posiionX    = 0;
		this.posiionY    = 1000;
		this.posiionZ    = 500;
		this.planeX   = 0;
		this.planeZ   = 0;
		
		this.geo;
		this.scene = {};
		this.renderer = {};
		this.projector = {};
		this.camera = {};
		this.stage = {};
		
		this.INTERSECTED = null;
	}
	
	Map.prototype = {
		
		init_d3: function() {

			geoConfiguration = function() {
				
				this.mercator = d3.geo.equirectangular();
				this.path = d3.geo.path().projection(this.mercator);
				
				var translate = this.mercator.translate();
				translate[0] = 500;
				translate[1] = 0;
				
				this.mercator.translate(translate);
				this.mercator.scale(200);
			}
	
			this.geo = new geoConfiguration();
		},
		
		init_tree: function() {
			
			if( Detector.webgl ){
				this.renderer = new THREE.WebGLRenderer({
					antialias : true
				});
				this.renderer.setClearColorHex( 0xBBBBBB, 1 );
			} else {
				this.renderer = new THREE.CanvasRenderer();
			}
			
			this.renderer.setSize( this.width, this.height );
			
			this.projector = new THREE.Projector();
			
			// adding the renderer object to DOM
			$("#map").append(this.renderer.domElement);
			
			// create a three.js scene and adding camera to it
			this.scene = new THREE.Scene();
			this.camera = new THREE.PerspectiveCamera(this.cameraAngle, this.width / this.height, this.near, this.far);
			this.camera.position.x = this.posiionX;
			this.camera.position.y = this.posiionY;
			this.camera.position.z = this.posiionZ;
			this.camera.lookAt( { x: this.planeX, y: 0, z: this.planeZ} );
			this.scene.add(this.camera);
		},
		
		
		addLight: function(x, y, z, intensity, color) {
			var light = new THREE.PointLight(color);
			light.position.x = x;
			light.position.y = y;
			light.position.z = z;
			light.intensity = intensity;
			this.scene.add(light);
		},
		
		addPlain: function(x, y, z, color) {
			var planeGeo = new THREE.CubeGeometry(x, y, z);
			var planeMat = new THREE.MeshLambertMaterial({color: color});
			var plane = new THREE.Mesh(planeGeo, planeMat);
			
			// rotate it to correct position
			plane.rotation.x = -Math.PI/2;
			this.scene.add(plane);
		},
		
		addCountries: function(data) {

				var countries = [];
				var i, j;
				
				// convert to threejs meshes
				for (i = 0 ; i < data.features.length ; i++) {
					var geoFeature = data.features[i];
					var properties = geoFeature.properties;
					var feature = this.geo.path(geoFeature);
					var mesh = transformSVGPathExposed(feature);
          //creating java object array
					for (j = 0 ; j < mesh.length ; j++) {
						  countries.push({"data": properties, "mesh": mesh[j]});
					}
				}
				

				for (i = 0 ; i < countries.length ; i++) {
					var material  = new THREE.MeshPhongMaterial({
						color: this.getCountryColor(countries[i].data), 
						opacity:0.5
					});
					var shape_3d  = countries[i].mesh.extrude({
						amount: 1, 
						bevelEnabled: false
					});
          //mesh created
					var mesh1 = new THREE.Mesh(shape_3d , material );
					mesh1.name = countries[i].data.name;
					
					// rotate and position the elements
					mesh1.rotation.x = Math.PI/2;
					mesh1.translateX(-490);
					mesh1.translateZ(50);
					mesh1.translateY(20);

					// add to scene
					this.scene.add(mesh1);
				}
		},
		
		getCountryColor: function(data) {
			var multiplier = 0;
		
			for(i = 0; i < 3; i++) {
				multiplier += data.iso_a3.charCodeAt(i);
			}
			
			multiplier = (1.0/366)*multiplier;
			return multiplier*0xffffff;
		},
		
		setCameraPosition: function(x, y, z, lx, lz) {	
			this.posiionX = x;
			this.posiionY = y;
			this.posiionZ = z;
			this.planeX = lx;
			this.planeZ = lz;
		},

		animate: function() {

			
			// find intersections for country
			var vector = new THREE.Vector3( mousePointer.x, mousePointer.y, 1 );
			this.projector.unprojectVector( vector, this.camera );
			var raycaster = new THREE.Ray( this.camera.position, vector.subSelf( this.camera.position ).normalize() );
			var intersects = raycaster.intersectObjects( this.scene.children );

			var objects = this.scene.children;

			if ( intersects.length > 1 ) {						
				if(this.INTERSECTED != intersects[ 0 ].object) {
					if (this.INTERSECTED) {
						for(i = 0; i < objects.length; i++) {
							if (objects[i].name == this.INTERSECTED.name) {
								objects[i].material.opacity = 0.5;
								objects[i].scale.z = 1;
							}
						}
						this.INTERSECTED = null;
					}
				}

				this.INTERSECTED = intersects[ 0 ].object;
				for(i = 0; i < objects.length; i++) {
					if (objects[i].name == this.INTERSECTED.name) {
						objects[i].material.opacity = 1.0;
						objects[i].scale.z = 5;
					}
				}

			} else if (this.INTERSECTED) {
				for(i = 0; i < objects.length; i++) {
					if (objects[i].name == this.INTERSECTED.name) {
						objects[i].material.opacity = 0.5;
						objects[i].scale.z = 1;
					}
				}
				this.INTERSECTED = null;
			} 

			this.render();
		},
		
		render: function() {

			// actually render the scene
			this.renderer.render(this.scene, this.camera);
		}
	};

	function init() {
		
		$.when(	$.getJSON("data/countries.json") ).then(function(data){ // need to change to remote data address
			
			map = new Map();
			
			map.init_d3();
			map.init_tree();
			
			map.addLight(0, 3000, 0, 1.0, 0xFFFFFF);
			map.addPlain(1400, 700, 30, 0xEEEEEE);
			
			map.addCountries(data);
			
			// request animation frame
			var onFrame = window.requestAnimationFrame;
	
			function tick(timestamp) {
				map.animate();
				
				if(map.INTERSECTED) {
					$('#country').html(map.INTERSECTED.name);
				} else {
					$('#country').html("CLick on the country and name will be displayed here");
				}
				
				onFrame(tick);
			}
	
			onFrame(tick);
			
			document.addEventListener( 'mousemove', onDocumentMouseMove, false );
			window.addEventListener( 'resize', onWindowResize, false );
			
		});
	}
	
	function onDocumentMouseMove( event ) {

		event.preventDefault();

		mousePointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mousePointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	}
	
	function onWindowResize() {
		
		windowHalfX = window.innerWidth / 2;
		windowHalfY = window.innerHeight / 2;

		map.camera.aspect = window.innerWidth / window.innerHeight;
		map.camera.updateProjectionMatrix();

		map.renderer.setSize( window.innerWidth, window.innerHeight );
	}	
	window.onload = init;
		
}());