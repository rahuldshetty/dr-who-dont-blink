let faceapi;
let video;
let detections;
let canvas;
let result_p;

let currentFrame = 0;
const MAX = 6;
const path = "./res/vid/$.mp4"

let lookaway_interval;
const MAX_LOOKAWAY_FACTOR = 2;
let currentLookAway = 0;

let hr = 0;
let min = 0;
let sec = 0;
var stoptime = true;
let timer;



// by default all options are set to true
const detectionOptions = {
  withLandmarks: true,
  withDescriptors: false,
};

function setResultText(isReset=false){
  if(isReset){
    result_p.innerHTML = "";
  }
  else{
    const year = randomInteger(1600, 2021);
    const text = "You survived for " + timer.innerHTML + "s. They have sent you back to " + year;
    result_p.innerHTML = text;
  }
}

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


function restart(){
  // Stop all process
  stopTimer();
  resetTimer();
  hr = 0;
  min = 0;
  sec = 0;

  // Begin from first
  currentFrame = -1;
  nextVideo();
  setResultText(true)
  document.getElementById('videoElement').setAttribute('loop', true);
  document.getElementById('startBtn').innerHTML = "Start";
  start();
}

function start(){
  startTimer();
  lookaway_interval = setInterval(setTime, 1000);
  document.getElementById('startBtn').setAttribute('disabled', true);
  document.getElementById('resetBtn').removeAttribute('disabled');
}

function nextVideo(){
  currentFrame = (currentFrame+1)%MAX;
  const newPath = path.replace("$", currentFrame);

  document.getElementById('videoElement').src = newPath;
  if(currentFrame == MAX -1){
    // Remove loop element
    stopTimer();
    clearInterval(lookaway_interval);
    setResultText(false);
    document.getElementById('videoElement').removeAttribute("loop");
  }
}

function setup() {
  canvas = createCanvas(200, 200);
  canvas.parent('canvasPlacement');

  // load up your video
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide(); // Hide the video element, and just show the canvas
  faceapi = ml5.faceApi(video, detectionOptions, modelReady);
  
  timer = document.getElementById('stopwatch');
  result_p = document.getElementById('result');
  document.getElementById('startBtn').removeAttribute('disabled');
  document.getElementById('resetBtn').removeAttribute('resetBtn');
}

function modelReady() {
  console.log("ready!");
  console.log(faceapi);
  faceapi.detect(gotResults);
}

function setTime() {
  ++currentLookAway;
  if(currentLookAway>=MAX_LOOKAWAY_FACTOR){
    nextVideo();
    currentLookAway = 0;
  }
}

function gotResults(err, result) {
  if (err) {
    console.log(err);
    return;
  }
  // console.log(result)
  detections = result;

  // background(220);
  background(255);
  image(video, 0, 0, width, height);
  
  if (detections) {
    if (detections.length > 0) {
      currentLookAway = 0;
      // console.log(detections)
      drawBox(detections);
    }
  }
  faceapi.detect(gotResults);
}

function drawBox(detections) {
  for (let i = 0; i < detections.length; i += 1) {
    const alignedRect = detections[i].alignedRect;
    const x = alignedRect._box._x;
    const y = alignedRect._box._y;
    const boxWidth = alignedRect._box._width;
    const boxHeight = alignedRect._box._height;

    noFill();
    stroke(161, 95, 251);
    strokeWeight(2);
    rect(x, y, boxWidth, boxHeight);
  }
}

function drawLandmarks(detections) {
  noFill();
  stroke(161, 95, 251);
  strokeWeight(2);

  for (let i = 0; i < detections.length; i += 1) {
    const mouth = detections[i].parts.mouth;
    const nose = detections[i].parts.nose;
    const leftEye = detections[i].parts.leftEye;
    const rightEye = detections[i].parts.rightEye;
    const rightEyeBrow = detections[i].parts.rightEyeBrow;
    const leftEyeBrow = detections[i].parts.leftEyeBrow;

    drawPart(mouth, true);
    drawPart(nose, false);
    drawPart(leftEye, true);
    drawPart(leftEyeBrow, false);
    drawPart(rightEye, true);
    drawPart(rightEyeBrow, false);
  }
}

function drawPart(feature, closed) {
  beginShape();
  for (let i = 0; i < feature.length; i += 1) {
    const x = feature[i]._x;
    const y = feature[i]._y;
    vertex(x, y);
  }

  if (closed === true) {
    endShape(CLOSE);
  } else {
    endShape();
  }
}

function startTimer() {
  if (stoptime == true) {
        stoptime = false;
        timerCycle();
    }
}
function stopTimer() {
  if (stoptime == false) {
    stoptime = true;
  }
}

function timerCycle() {
    if (stoptime == false) {
    sec = parseInt(sec);
    min = parseInt(min);
    hr = parseInt(hr);

    sec = sec + 1;

    if (sec == 60) {
      min = min + 1;
      sec = 0;
    }
    if (min == 60) {
      hr = hr + 1;
      min = 0;
      sec = 0;
    }

    if (sec < 10 || sec == 0) {
      sec = '0' + sec;
    }
    if (min < 10 || min == 0) {
      min = '0' + min;
    }
    if (hr < 10 || hr == 0) {
      hr = '0' + hr;
    }

    timer.innerHTML = hr + ':' + min + ':' + sec;

    setTimeout("timerCycle()", 1000);
  }
}

function resetTimer() {
    timer.innerHTML = '00:00:00';
}