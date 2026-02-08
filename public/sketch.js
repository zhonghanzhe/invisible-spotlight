// name: invisible spotlight
// group members: Hanzhe Zhong and Xuan Zhu
// caption: In the corners of our daily lives, details often go unnoticed. Yet, we all carry an invisible spotlight: our eyes. When we focus on something, the chaos of reality collapses into ordered shapes. In this interactive installation, the mobile phone acts as an extension of your gaze. The background photograph represents the static reality, while the floating geometric wireframes—circles, squares, triangles, symbolize the cognitive structures we impose on the world. When you hold steady, there is order; when you shake the device, this order disintegrates into chaos. This is an experiment in "seeing": as long as you are looking, the spotlight remains on.

let socket = io(); // Connect to the server
let role = "";     // Role: Phone or Screen

// Sensor data
let orientationData = { alpha: 0, beta: 0, gamma: 0 };
let prevBeta = 0;
let prevGamma = 0;

let bgImage;
let shapes = [];

const uiDiv = document.getElementById("ui");
const btnPhone = document.getElementById("btn-phone");
const btnScreen = document.getElementById("btn-screen");

function preload() {
  bgImage = loadImage('123.jpg'); 
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);

  // the red one
  shapes.push({
    type: 'circle', size: 120, color: color(255, 50, 50, 200),
    offsetX: 0, offsetY: 0, angle: 0,
    x: width/2, y: height/2
  });

  // the left one
  shapes.push({
    type: 'square1', size: 80, color: color(0, 200, 255, 180),
    offsetX: -120, offsetY: 0, angle: PI / 3, 
    x: width/2, y: height/2
  });

  // the right one
  shapes.push({
    type: 'square2', size: 100, color: color(0, 255, 255, 180),
    offsetX: 120, offsetY: 0, angle: PI / 8,
    x: width/2, y: height/2
  });

  // the up yellow
  shapes.push({
    type: 'circle', size: 120, color: color(255, 255, 0),
    offsetX: -70, offsetY: -110, angle: 0, 
    x: width/2, y: height/2
  });

  // the bottom yellow
  shapes.push({
    type: 'circle', size: 60, color: color(255, 255, 0),
    offsetX: 63, offsetY: 78, angle: 0,
    x: width/2, y: height/2
  });
   
  shapes.push({
    type: 'line', size: 250, color: color(255),
    offsetX: 30, offsetY: 80, angle: PI / 6,
    x: width/2, y: height/2
  });
   
  shapes.push({
    type: 'triangle', size: 80, color: color(0, 255, 0), 
    offsetX: -80, offsetY: 70, angle: PI / 8, 
    x: width/2, y: height/2
  });
}

btnPhone.addEventListener("click", async () => {
  role = "phone";
  uiDiv.style.display = "none";
// Request iOS permissions
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    try {
      const response = await DeviceOrientationEvent.requestPermission();
      if (response === 'granted') window.addEventListener('deviceorientation', handleOrientation);
      else alert("Please grant sensor permissions to continue.");
    } catch (e) { console.error(e); }
  } else {
    window.addEventListener('deviceorientation', handleOrientation);
  }
});

btnScreen.addEventListener("click", () => {
  role = "screen";
  uiDiv.style.display = "none";
  socket.on("remoteData", (data) => { orientationData = data; });
});

function handleOrientation(event) {
  let data = {
    alpha: event.alpha || 0,
    beta: event.beta || 0,
    gamma: event.gamma || 0
  };
  socket.emit("orientation", data);
}

function draw() {
  background(0); 

  if (role === "phone") {
 
    fill(0, 255, 0); textAlign(CENTER); textSize(20);
    text("CONTROLLER ACTIVE", width/2, height/2 - 20);
    textSize(14);
    text("Tilt to explore / Shake to disrupt", width/2, height/2 + 20);
    
  } else if (role === "screen") {

    if (bgImage) background(bgImage);

    let targetX = map(orientationData.gamma, -45, 45, 0, width);
    let targetY = map(orientationData.beta, -30, 60, 0, height);
    targetX = constrain(targetX, 0, width);
    targetY = constrain(targetY, 0, height);

    let shake = abs(orientationData.beta - prevBeta) + abs(orientationData.gamma - prevGamma);
    let isShaking = (shake > 8); 
    prevBeta = orientationData.beta;
    prevGamma = orientationData.gamma;

    for (let i = 0; i < shapes.length; i++) {
      let s = shapes[i];

      let destX, destY;
      if (isShaking) {
        destX = targetX + random(-500, 500); 
        destY = targetY + random(-500, 500);
      } else {
        destX = targetX + s.offsetX; 
        destY = targetY + s.offsetY;
      }

      s.x = lerp(s.x, destX, 0.05);
      s.y = lerp(s.y, destY, 0.05);

      push();
      translate(s.x, s.y);
      rotate(s.angle);

      noFill(); 
      stroke(s.color); 
      strokeWeight(3);

      if (s.type === 'circle') {
        ellipse(0, 0, s.size);
      } 
      else if (s.type.includes('square')) {
        rect(0, 0, s.size, s.size);
      } 
      else if (s.type === 'line') {
        line(-s.size/2, 0, s.size/2, 0);
      }
      else if (s.type === 'triangle') {
        let half = s.size / 2;
        triangle(0, -half, half, half, -half, half);
      }
      pop(); 
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}