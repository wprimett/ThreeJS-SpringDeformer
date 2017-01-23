function onMouseMove(event) {

    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

//THREE raycaster returns intersection to object
//interact with intersected ovject
function mouseToPoints() {
    intersects = raycaster.intersectObjects(scene.children);

    if (mouseDown) {
        raycaster.setFromCamera(mouse, camera);
        if (intersects.length == 0) {
            this.active = false;
        } else {
            this.active = true;
            selectedPoint = intersects[0]
            var pt = new THREE.Vector3();
            pt = selectedPoint.point;
            for (var i = 0; i < points.length; i++) {
                points[i].clicked(pt);
            }
        }
    } else {
        this.active = false;
    }
    //mouse button up or not over object
    if (!this.active && selectedPoint != null) {
        for (var i = 0; i < points.length; i++) {
            points[i].is_dragged = false;
        }
    }
}
