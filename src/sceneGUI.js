gui = new dat.GUI({
  height : 5 * 32 - 1
});

gui.add(options, "TorusKnot").onChange(reset);
gui.add(options, "Damping").onChange(function(s) {
  switch(s) {
    case true:
      damping = 0.9;
      ConnectAnchors = true;
      break;
    case false:
      damping = 1.0;
      ConnectAnchors = false;
      break;
    }
  reset();
});

gui.add(options, "K").onChange(function(k) {
  springConstant = k;
});
gui.addColor(options,'Colour').onChange(function(k) {
  pnt.colour = k;
});
gui.addColor(options,'Shade').onChange(function(k) {
  pnt.shade = k;
});
gui.add(options, "AutoRotate");
gui.add(options,'MouseRange').min(0).max(1).step(0.1);;
