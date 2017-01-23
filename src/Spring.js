function Spring(_pt1, _pt2, _rl) {
    //var pos;
    this.pt1 = _pt1;
    this.pt2 = _pt2;
    this.rest_len = _rl;
};

Spring.prototype.update = function() {
  pt1 = this.pt1.pos.clone();
  pt2 = this.pt2.pos.clone();
  var k = springConstant;
    //distance between two anchors using direction vector and magnitude
    //find distance between current displacement and resting position
    var dir = (pt1.sub(pt2));
    var dist = (dir.x*dir.x + dir.y*dir.y + dir.z*dir.z); //distace/magnitude squared
    //modification: square root of sqaured distances, subtle and smooth animation
    var dispos = Math.sqrt(dist - rest_len*rest_len);
    //using Hooke's law: force = -k * x
    //where k is a constant and x is the displacement
    dir.normalize();
    dir.multiplyScalar(-k * dispos);
    dir.multiplyScalar(1);
    this.pt1.applySpring(dir);
    //force of second anchor works in opposite direction
    dir.multiplyScalar(-1);
    this.pt2.applySpring(dir);
}

Spring.prototype.draw = function() {
  var material = new THREE.LineBasicMaterial({
	color: 0xff0000,
  linewidth: 0.1
});

var geometry = new THREE.Geometry();
geometry.vertices.push(
	this.pt1.pos,
	this.pt2.pos
);

var line = new THREE.Line( geometry, material );
scene.add( line );
}
