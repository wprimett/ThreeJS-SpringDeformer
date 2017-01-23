function Point(pos) {
    this.pos = pos;
    this.is_dragged = false;
    this.mouseDist;
    this.mass = 1.0;

    this.vel = new THREE.Vector3(0, 0, 0); //intiial velocity
    this.acc = new THREE.Vector3(0, 0, 0);
    this.springs = [];
};

//update point velocities based on spring forces
Point.prototype.update = function() {
    this.vel.add(this.acc);
    this.vel.multiplyScalar(damping);
    this.pos.add(this.vel);
    this.acc.multiplyScalar(0.0);

    for (var i = 0; i < this.springs.length; i++) {
        this.springs[i].update();
        //this.springs[i].draw();
    }
}

//Using Newton's law: F = M * A
//takes force vector, used in spring class
Point.prototype.applySpring = function(force) {
    force.divideScalar(this.mass);
    this.acc.add(force); //update acceleration
}

//Create new joint - connect two anchor points with rest length
Point.prototype.connect = function(pt, rl) {
    var jnt = new Spring(this, pt, rl);
    this.springs.push(jnt);
}

Point.prototype.drag = function(mousePos) {
    if (this.is_dragged) {
        //move points by distance from mouse to previous position
        this.pos = (mousePos.add(this.mouseDist).divideScalar(10.0));
        //this.pos = mousePos;
    }
}


Point.prototype.clicked = function(mousePos) {
    var pos = this.pos.clone(); //make copy of position to comapre with ray hit
    var d = mousePos.distanceTo(pos)
    if (d < options.MouseRange) {
        this.is_dragged = true;
        this.mouseDist = pos.sub(mousePos);
    }
}
