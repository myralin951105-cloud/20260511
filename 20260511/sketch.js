let capture;
let faceMesh;
let faces = [];

function preload() {
  // 載入 faceLandmarks 模型
  faceMesh = ml5.faceMesh({ maxFaces: 1, refineLandmarks: false, flipHorizontal: false });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  // 擷取攝影機影像
  capture = createCapture(VIDEO);
  capture.size(640, 480);
  capture.hide(); // 隱藏預設的影片元件

  // 開始偵測臉部特徵
  faceMesh.detectStart(capture, (results) => {
    faces = results;
  });
}

function draw() {
  background('#e7c6ff');

  let w = width * 0.5; // 寬度為全螢幕的 50%
  let h = height * 0.5; // 高度為全螢幕的 50%
  let x = (width - w) / 2; // 置中 X 座標
  let y = (height - h) / 2; // 置中 Y 座標

  push();
  // 移動到影像右側邊界並水平反轉，達到左右顛倒（鏡像）的效果
  translate(x + w, y);
  scale(-1, 1);
  image(capture, 0, 0, w, h);

  // 如果有偵測到臉部
  if (faces.length > 0) {
    let face = faces[0];
    
    // 177 為右耳垂附近，401 為左耳垂附近的索引
    let rightLobe = face.keypoints[177];
    let leftLobe = face.keypoints[401];

    fill(255, 255, 0); // 黃色
    noStroke();

    // 繪製右耳垂圓圈
    let rx = map(rightLobe.x, 0, capture.width, 0, w);
    let ry = map(rightLobe.y, 0, capture.height, 0, h);
    circle(rx, ry, 15);

    // 繪製左耳垂圓圈
    let lx = map(leftLobe.x, 0, capture.width, 0, w);
    let ly = map(leftLobe.y, 0, capture.height, 0, h);
    circle(lx, ly, 15);
  }
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
