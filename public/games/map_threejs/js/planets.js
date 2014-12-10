/**
 * Created by aishwariyaa_indramoh on 12/3/14.
 */

var renderer	= new THREE.WebGLRenderer({
  antialias	: true
});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
renderer.shadowMapEnabled	= true

var updateFcts	= [];
var scene	= new THREE.Scene();
var camera	= new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 100 );
camera.position.z = 1.5;

var light	= new THREE.AmbientLight( 0x888888 )
scene.add( light )

var light	= new THREE.DirectionalLight( 0xcccccc, 1 )
light.position.set(5,5,5)
scene.add( light )
light.castShadow	= true
light.shadowCameraNear	= 0.01
light.shadowCameraFar	= 15
light.shadowCameraFov	= 45

light.shadowCameraLeft	= -1
light.shadowCameraRight	=  1
light.shadowCameraTop	=  1
light.shadowCameraBottom= -1

light.shadowBias	= 0.001
light.shadowDarkness	= 0.2

light.shadowMapWidth	= 1024*2
light.shadowMapHeight	= 1024*2



var starSphere	= THREEx.Planets.createStarfield()
scene.add(starSphere)

//////////////////////////////////////////////////////////////////////////////////
//		comment								//
//////////////////////////////////////////////////////////////////////////////////

var currentMesh	= null
function switchValue(value){
  currentMesh && scene.remove(currentMesh)
  var mesh,cloud;
  switch(value){
    case "Sun":
      mesh	= THREEx.Planets.createSun();
      break;
    case "Mercury":
      mesh	= THREEx.Planets.createMercury();
      break;
    case "Venus":
      mesh	= THREEx.Planets.createVenus();
      break;
    case "Earth":
      mesh	= THREEx.Planets.createEarth();
      cloud	= THREEx.Planets.createEarthCloud();
      mesh.add(cloud);
      break;
    case "Mars":
      mesh	= THREEx.Planets.createMars();
      break;
    case "Jupiter":
      mesh	= THREEx.Planets.createJupiter();
      break;
    case "Saturn" :
      mesh	= THREEx.Planets.createSaturn();
      mesh.receiveShadow	= true;
      mesh.castShadow		= true;
      var ring	= THREEx.Planets.createSaturnRing();
      ring.receiveShadow	= true;
      ring.castShadow		= true;
      mesh.add(ring);
      break;
    case "Uranus":
      mesh	= THREEx.Planets.createUranus();
      mesh.receiveShadow	= true;
      mesh.castShadow		= true;
      var ring	= THREEx.Planets.createUranusRing();
      ring.receiveShadow	= true;
      ring.castShadow		= true;
      mesh.add(ring);
      break;
    case "Neptune":
      mesh	= THREEx.Planets.createNeptune();
      break;
    case "default":
      mesh = "";

  }
  scene.add(mesh)
  currentMesh	= mesh
  location.hash	= value
}
var initial	= location.hash.substr(1)	|| 'Earth'
switchValue(initial)
// camera
var mouse	= {x : 0, y : 0}
document.addEventListener('mousemove', function(event){
  mouse.x	= (event.clientX / window.innerWidth ) - 0.5
  mouse.y	= (event.clientY / window.innerHeight) - 0.5
}, false)
updateFcts.push(function(delta, now){
  camera.position.x += (mouse.x*5 - camera.position.x) * (delta*3)
  camera.position.y += (mouse.y*5 - camera.position.y) * (delta*3)
  camera.lookAt( scene.position )
})

// renderer
updateFcts.push(function(){
  renderer.render( scene, camera );
})

// keep on rotating screen
var lastTimeInMsec= null
requestAnimationFrame(function animate(nowMsec){

  requestAnimationFrame( animate );

  lastTimeInMsec	= lastTimeInMsec || nowMsec-1000/60
  var deltaMsec	= Math.min(200, nowMsec - lastTimeInMsec)
  lastTimeInMsec	= nowMsec
  // call each update function
  updateFcts.forEach(function(updateFn){
    updateFn(deltaMsec/1000, nowMsec/1000)
  })
})

function map() {
  window.location = "./map3d.html";
}
function d3map() {
  window.location = "./d3map.html";
}


