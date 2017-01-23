
/**
* @requires ThreeJs
*/
var camera, scene, renderer;
var shape; //doformable object
var mesh;
var pnt = {
  size: 0.5,
  colour: 0x68c3c0,
  shade: 0x000000
};

//ThreeJs lights
var hemisphereLight, shadowLight;

var raycaster, mouse, intersects, selectedPoint; //mouse position on threeJs objects
var clock;
var c = 0;
var radius = 30.0;

var geom, pointmat, //goemetry and materials
    inner_geom, inner_pointmat;
var pointcloud, inner_pointcloud;
var points = [];
var inner_points = [];
var vertexNormals = [];

var mouseDown = false;
//r rotation matrix[
// cos(θ)  0 sin(θ) 0
// 0       1 0      0
// -sin(θ) 0 cos(θ) 0
// 0       0 0      1
// ]
//z tralation/zoon[
// 1, 0, 0, x,
// 0, 1, 0, y,
// 0, 0, 1, 100*,
// 0, 0, 0, 1
//]
var rotateY = new THREE.Matrix4().makeRotationY( 0.0005 );
var rotateX = new THREE.Matrix4().makeRotationX( 50 );
var zoom = new THREE.Matrix4().makeTranslation( 0, 0, 100 );

var rest_len, rest_len2; //starting distance of points
var rest_len_in //rest length from inside mesh
var max_len = 35; //max length/stretch of joints before breaking
var damping = 0.9;
var springConstant = 0.082;

//GUI and option parameters
var gui;

var ConnectAnchors = true;
var options = {
  TorusKnot: true,
  Damping: true,
  K: 0.082,
  AutoRotate: true,
  Colour: pnt.colour,
  Shade: pnt.shade,
  MouseRange: 0.7
};

init();
animate();

function init() {
    clock = new THREE.Clock();
    createScene();

    createOuterMesh();
    createShape(); //Get shape vertices and connect springs
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function createScene() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.z = 200;
  camera.position.x = 50;
  camera.applyMatrix( zoom );
  camera.applyMatrix( rotateX );
  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor (0x000000, 1);

  document.body.appendChild(renderer.domElement);
  window.addEventListener('resize', onWindowResize, false);
}

function createOuterMesh(rad, size, color) {
  var scale = 0.75
  //get 3D co ordinates and add them individually to point object
  switch(options.TorusKnot) {
    //copy main geomtry and place inside
    case true:
        geom = new THREE.TorusKnotGeometry( 30, 10, 150, 32 );
        //smaller diameter
        inner_geom = new THREE.TorusKnotGeometry( 30, 5, 150, 32 );
        break;
    case false:
        geom = new THREE.IcosahedronGeometry(50, 4);
        inner_geom = geom.clone();
        inner_geom.scale(scale, scale, scale);
        break;
      }
      // merge vertecies to calculate relative normals
      geom.mergeVertices();
      // THREEJS function: "Computes vertex normals by averaging face normals."
      geom.computeVertexNormals();

      pointmat = new THREE.PointsMaterial( {
        size: pnt.size,
        vertexColors: THREE.VertexColors
      });

      ///store and connect all points for interaction
      for (var i = 0; i < geom.vertices.length; i++){
        // get each vertex
        var v = geom.vertices[i];
        points[i] = new Point(v);
        //add indiviual colours for each point
        geom.colors[i] = (new THREE.Color(pnt.color));
      }

      pointcloud = new THREE.Points( geom, pointmat );

  createInnerMesh(0.75);
}

//called from outermesh with reltive scale
//could be shortened to one function with more parameters but this is a little easier to understand
function createInnerMesh(scale){
  var inner_pointmat = new THREE.PointsMaterial( {
    size: 0.2,
    color: 0xFF0000
  });

  inner_pointcloud = new THREE.Points( inner_geom, inner_pointmat );

  ///store and connect all points for interaction
  for (var i = 0; i < inner_geom.vertices.length; i++){
    // get each vertex
      var v = inner_geom.vertices[i];
      inner_points[i] = new Point(v);
    }
}

function createShape(){

  scene.add(pointcloud);
  //scene.add(inner_pointcloud);

  //connect springs;
  for (var i = 0; i < points.length; i++){
    if (i > 1 && i < points.length - 1 ){
      rest_len = points[i].pos.distanceTo(points[i+1].pos);
      rest_len2 = points[i].pos.distanceTo(points[i-1].pos);
      rest_len_in = points[i].pos.distanceTo(inner_points[i].pos);

      points[i].connect(points[i+1], rest_len);
      points[i].connect(points[i-1], rest_len2);
      if(ConnectAnchors)
        points[i].connect(inner_points[i], rest_len_in);
    }
    vertexNormals[i] = getNormals(i);
}
}

function getNormals(i) {
  //outward directions from centre
  var dir = points[i].pos.clone().sub(inner_points[i].pos.clone());
  var vn = dir.clone();
  return vn.normalize();
}

function animate() {
  requestAnimationFrame(animate);
  if(options.AutoRotate)
    camera.applyMatrix( rotateY );

  camera.updateMatrixWorld();
  mouseToPoints();
  for (var i = 0; i < points.length ; i++) {
    points[i].update();
    inner_points[i].update();
    points[i].drag(mouse);
  }
  //update pointcloud by individual vertice
  var verts = pointcloud.geometry.vertices;
  var numVerts = verts.length;

  for (var i = 0; i < numVerts; i++) {
      var v = verts[i];
      //whilst point object computes new positions
      //update this to the THREEJS pointcloud
      v.x =  points[i].pos.x;
      v.y =  points[i].pos.y;
      v.z = points[i].pos.z;
      //change colour based on velocity and vertex normal direction
      var c = (pnt.colour);
      var neutralColour = new THREE.Color(pnt.colour).lerp(new THREE.Color(pnt.shade), vertexNormals[i].x);
       if (points[i].vel.length() > 0.002)
         c = (new THREE.Color(Math.random(), Math.random(), Math.random()));
       else //reset colour
         c = geom.colors[i].lerp(new THREE.Color(pnt.colour), 1.0);
      //brightness allcocated by normal direction for lighting effect
      c.lerp(new THREE.Color(pnt.shade), vertexNormals[i].x);
      geom.colors[i] = (new THREE.Color(c));
    }

    //Render: vertecies have changed
    pointcloud.geometry.verticesNeedUpdate=true;
    pointcloud.geometry.colorsNeedUpdate = true;

  renderer.render(scene, camera);
}

function reset() {
  scene.remove(pointcloud);
  scene.remove(inner_pointcloud);
  points.length = 0;
  inner_points.length = 0;

  createOuterMesh();
  createShape(); //Get shape vertices and connect springs
}

//mouse event listener
window.addEventListener( 'mousemove', onMouseMove, false );
window.addEventListener("mousedown", function(){  mouseDown = true; }, false);
window.addEventListener("mouseup", function(){  mouseDown = false; }, false);
