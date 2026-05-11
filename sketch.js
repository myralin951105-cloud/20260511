let capture;
let faceMesh;
let handPose;
let faces = [];
let hands = [];
let earringImgs = [];
let currentEarringIndex = 0; // 預設顯示第一款

function preload() {
  // 載入模型
  faceMesh = ml5.faceMesh({ maxFaces: 1, refineLandmarks: false, flipHorizontal: false });
  handPose = ml5.handPose({ flipHorizontal: false });

  // 載入 5 款耳環圖片，並加入簡單的檢查
  let paths = [
    'pic/acc1_ring.png', 'pic/acc2_pearl.png', 'pic/acc3_tassel.png', 
    'pic/acc4_jade.png', 'pic/acc5_phoenix.png'
  ];
  for (let i = 0; i < paths.length; i++) {
    earringImgs[i] = loadImage(paths[i], () => console.log(paths[i] + ' 載入成功'), () => console.error(paths[i] + ' 找不到，請檢查 pic 目錄'));
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  // 擷取攝影機影像
  capture = createCapture(VIDEO);
  capture.size(640, 480);
  capture.hide(); // 隱藏預設的影片元件

  // 開始偵測臉部與手部特徵
  faceMesh.detectStart(capture, (results) => {
    faces = results;
  });

  handPose.detectStart(capture, (results) => {
    hands = results;
  });
}

function draw() {
  background('#e7c6ff');

  let w = width * 0.5; // 寬度為全螢幕的 50%
  let h = height * 0.5; // 高度為全螢幕的 50%
  let x = (width - w) / 2; // 置中 X 座標
  let y = (height - h) / 2; // 置中 Y 座標

  push();
  // 確保攝影機影像是從座標點開始往外畫（預設模式）
  imageMode(CORNER);
  // 移動到影像右側邊界並水平反轉，達到左右顛倒（鏡像）的效果
  translate(x + w, y);
  scale(-1, 1);
  image(capture, 0, 0, w, h);

  // 偵測手勢並決定目前的耳環樣式
  if (hands.length > 0) {
    let hand = hands[0];
    let fingerCount = 0;

    // 簡單的計數邏輯：如果指尖 Y 座標小於指節（代表伸直）
    // 索引：食指 8<6, 中指 12<10, 無名指 16<14, 小指 20<18
    if (hand.keypoints[8].y < hand.keypoints[6].y) fingerCount++;
    if (hand.keypoints[12].y < hand.keypoints[10].y) fingerCount++;
    if (hand.keypoints[16].y < hand.keypoints[14].y) fingerCount++;
    if (hand.keypoints[20].y < hand.keypoints[18].y) fingerCount++;
    
    // 拇指邏輯（水平距離偵測較準確）
    let thumbDist = dist(hand.keypoints[4].x, hand.keypoints[4].y, hand.keypoints[2].x, hand.keypoints[2].y);
    if (thumbDist > 40) fingerCount++;

    // 如果伸出的手指在 1~5 之間，更新索引
    if (fingerCount >= 1 && fingerCount <= 5) {
      currentEarringIndex = fingerCount - 1;
    }
  }

  // 如果有偵測到臉部
  if (faces.length > 0) {
    let face = faces[0];
    
    // 177 為右耳垂附近，401 為左耳垂附近的索引
    let rightLobe = face.keypoints[177];
    let leftLobe = face.keypoints[401];

    // 切換到中心對齊模式，讓耳環中心對準耳垂點
    imageMode(CENTER);
    let earringSize = w * 0.08; // 根據顯示影像寬度調整比例，約 8%

    // 計算耳垂座標
    let rx = map(rightLobe.x, 0, capture.width, 0, w);
    let ry = map(rightLobe.y, 0, capture.height, 0, h);
    let lx = map(leftLobe.x, 0, capture.width, 0, w);
    let ly = map(leftLobe.y, 0, capture.height, 0, h);

    let img = earringImgs[currentEarringIndex];

    // 繪製邏輯：如果圖片有效則畫圖，否則畫黃色圓圈作為備案
    if (img && img.width > 1) {
      image(img, rx, ry, earringSize, earringSize);
      image(img, lx, ly, earringSize, earringSize);
    } else {
      fill(255, 255, 0);
      noStroke();
      circle(rx, ry, 15);
      circle(lx, ly, 15);
    }

  }
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
