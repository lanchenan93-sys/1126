let bgImage; // 儲存背景圖片 bg/3.png
let bgOffsetX = 0; // 記錄背景水平捲動偏移量（負值代表背景往左移動）
let characterSprite; // 儲存角色一的精靈圖
let walkSprite; // 儲存角色一的走路精靈圖
let magicSprite; // 儲存角色一的施法精靈圖
let magicEffectSprite; // 儲存角色一的魔法特效精靈圖
let characterX; // 儲存角色一目前的水平中心位置
let isWalking = false; // 記錄角色是否已切換為走路動畫
let facingDirection = 1; // 記錄角色朝向（1 為右，-1 為左）
let isCasting = false; // 記錄角色是否正在播放施法動畫
let magicStartFrame = 0; // 記錄施法動畫開始時的畫面計數
let magicDirection = 1; // 記錄施法時鎖定的方向
let spaceIsDown = false; // 記錄空白鍵是否已按住以避免重複觸發
let activeEffects = []; // 儲存目前畫面上飛行中的魔法特效

// 角色二相關變數
let char2StopSprite; // 儲存角色二的待機精靈圖 2/stop/stop.png
let char2ActionSprite; // 儲存角色二的互動精靈圖 2/action/action.png

// 數學加法選擇題狀態變數
let wasChar2Near = false; // 記錄上一幀角色一是否接近角色二（用來偵測剛靠近的瞬間）
let currentQuestion = null; // 儲存目前的數學題目與四個選項
let quizFeedback = ""; // 儲存作答後的回饋訊息
let isAnswerCorrect = false; // 記錄目前題目是否已答對
let optionButtonBounds = []; // 儲存四個選項按鈕的畫面座標範圍供點擊偵測
let nextBtnBounds = null; // 儲存「下一題」按鈕的畫面座標範圍

// 答對煙火與答錯閃電特效變數
let fireworkParticles = []; // 儲存煙火粒子陣列
let lightningBolts = []; // 儲存閃電路徑陣列
let lightningTimer = 0; // 閃電特效剩餘顯示幀數

const frameCountInSprite = 10; // 設定精靈圖包含的影格數
const frameWidth = 139.5; // 設定每個影格的寬度（1395 除以 10）
const frameHeight = 196; // 設定每個影格的高度
const walkFrameCount = 9; // 設定走路精靈圖包含的影格數
const walkFrameWidth = 1246 / walkFrameCount; // 計算走路動畫每格的寬度
const walkFrameHeight = 198; // 設定走路動畫每格的高度
const magicFrameCount = 4; // 設定施法精靈圖包含的影格數
const magicFrameWidth = 1039 / magicFrameCount; // 計算施法動畫每格的寬度
const magicFrameHeight = 146; // 設定施法動畫每格的高度
const effectFrameCount = 5; // 設定魔法特效精靈圖包含的影格數
const effectFrameWidth = 740 / effectFrameCount; // 計算魔法特效每格的寬度
const effectFrameHeight = 19; // 設定魔法特效每格的高度
const framesPerStep = 8; // 設定動畫每隔幾個畫面更新一格

// 角色二精靈圖參數設定
const char2StopFrameCount = 8; // 角色二待機影格數
const char2StopFrameWidth = 699 / char2StopFrameCount; // 計算角色二待機每格寬度
const char2StopFrameHeight = 190; // 角色二待機每格高度
const char2ActionFrameCount = 10; // 角色二互動影格數
const char2ActionFrameWidth = 1335 / char2ActionFrameCount; // 計算角色二互動每格寬度
const char2ActionFrameHeight = 177; // 角色二互動每格高度

function preload() { // 在畫布建立前載入圖片資源
  bgImage = loadImage("bg/3.png"); // 載入背景圖片 bg/3.png
  characterSprite = loadImage("1/stop/stop.png"); // 載入角色一的十格精靈圖
  walkSprite = loadImage("1/walk/walk.png"); // 載入角色一的九格走路精靈圖
  magicSprite = loadImage("1/magic/magic.png"); // 載入角色一的四格施法精靈圖
  magicEffectSprite = loadImage("1/magic_effect/magic_effect.png"); // 載入五格魔法特效精靈圖

  // 載入角色二精靈圖
  char2StopSprite = loadImage("2/stop/stop.png"); // 載入角色二的八格待機精靈圖
  char2ActionSprite = loadImage("2/action/action.png"); // 載入角色二的十格互動精靈圖
} // 結束圖片載入函式

function setup() { // 初始化畫布與繪圖模式
  createCanvas(windowWidth, windowHeight); // 建立符合視窗尺寸的畫布
  imageMode(CENTER); // 讓座標代表影格的中心點
  characterX = (width * 2) / 3; // 將角色初始位置設在畫布寬度的三分之二處
  frameRate(60); // 將動畫更新速率設定為每秒六十格
  generateMathQuestion(); // 預先產生第一題數學加法選擇題
} // 結束初始化函式

// 產生一題隨機數學加法選擇題與四個不重複選項
function generateMathQuestion() {
  const numA = floor(random(10, 50));
  const numB = floor(random(10, 50));
  const answer = numA + numB;

  const choices = [answer];
  while (choices.length < 4) {
    // 產生接近正確答案的干擾選項（差值在 -12 到 +12 之間且不為 0）
    const offset = floor(random(-12, 13));
    const wrongChoice = answer + offset;
    if (offset !== 0 && wrongChoice > 0 && !choices.includes(wrongChoice)) {
      choices.push(wrongChoice);
    }
  }

  // 洗牌打亂四個選項順序
  for (let i = choices.length - 1; i > 0; i--) {
    const j = floor(random(i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }

  currentQuestion = {
    text: `${numA} + ${numB} = ?`,
    answer: answer,
    options: choices
  };
  quizFeedback = "";
  isAnswerCorrect = false;
}

// 觸發答對煙火特效（在畫布左右兩側與上方產生多發彩色煙火）
function spawnFireworks() {
  const burstLocations = [
    { x: width * 0.22, y: height * 0.28 },
    { x: width * 0.78, y: height * 0.25 },
    { x: width * 0.3, y: height * 0.45 },
    { x: width * 0.7, y: height * 0.42 },
    { x: width * 0.5, y: height * 0.58 }
  ];

  const palette = [
    [255, 89, 94],   // 亮紅
    [255, 202, 58],  // 金黃
    [138, 201, 38],  // 翠綠
    [25, 130, 196],  // 寶藍
    [255, 128, 237], // 粉紫
    [255, 255, 255]  // 純白星光
  ];

  for (let b = 0; b < burstLocations.length; b++) {
    const origin = burstLocations[b];
    const baseColor = random(palette);
    const particleCount = 45;

    for (let i = 0; i < particleCount; i++) {
      const angle = random(TWO_PI);
      const speed = random(2, 8.5);
      const col = random() < 0.3 ? [255, 240, 150] : baseColor;
      fireworkParticles.push({
        x: origin.x,
        y: origin.y,
        vx: cos(angle) * speed,
        vy: sin(angle) * speed,
        alpha: 255,
        decay: random(3.2, 5.5),
        size: random(4, 8),
        color: col
      });
    }
  }
}

// 更新並繪製所有煙火粒子
function updateAndDrawFireworks() {
  if (fireworkParticles.length === 0) return;

  push();
  noStroke();
  for (let i = fireworkParticles.length - 1; i >= 0; i--) {
    const p = fireworkParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.14; // 重力下墜效果
    p.vx *= 0.97; // 空氣阻力
    p.vy *= 0.97;
    p.alpha -= p.decay;

    if (p.alpha <= 0) {
      fireworkParticles.splice(i, 1);
      continue;
    }

    // 外圈光暈
    fill(p.color[0], p.color[1], p.color[2], p.alpha * 0.35);
    circle(p.x, p.y, p.size * 2.2);

    // 核心亮點
    fill(p.color[0], p.color[1], p.color[2], p.alpha);
    circle(p.x, p.y, p.size);
  }
  pop();
}

// 觸發答錯閃電特效（產生主閃電與隨機分岔閃電）
function triggerLightning() {
  lightningTimer = 32; // 閃電持續 32 幀（約 0.5 秒）
  lightningBolts = [];

  // 產生 3 道從畫布頂端劈下的鋸齒狀閃電
  const startXs = [width * 0.25, width * 0.5, width * 0.75];
  for (let b = 0; b < startXs.length; b++) {
    const mainBolt = createBoltPath(startXs[b] + random(-40, 40), 0, height * random(0.65, 0.92), 14);
    lightningBolts.push({ points: mainBolt, weight: 4.5 });

    // 從主閃電中段長出一道分岔閃電
    const branchStart = mainBolt[floor(mainBolt.length * 0.4)];
    if (branchStart) {
      const branchBolt = createBoltPath(branchStart.x, branchStart.y, branchStart.y + height * 0.28, 7);
      lightningBolts.push({ points: branchBolt, weight: 2.2 });
    }
  }
}

// 建立單道鋸齒狀閃電的頂點座標陣列
function createBoltPath(startX, startY, endY, segments) {
  const pts = [{ x: startX, y: startY }];
  const stepY = (endY - startY) / segments;
  let currX = startX;
  let currY = startY;

  for (let i = 0; i < segments; i++) {
    currX += random(-38, 38);
    currY += stepY;
    pts.push({ x: currX, y: currY });
  }
  return pts;
}

// 繪製答錯閃電特效與畫面閃光
function drawLightningEffect() {
  if (lightningTimer <= 0) return;

  push();
  // 前幾幀加上全畫面微閃光效果
  if (lightningTimer > 25 || (lightningTimer > 15 && lightningTimer < 19)) {
    noStroke();
    fill(255, 255, 230, 85);
    rectMode(CORNER);
    rect(0, 0, width, height);
  }

  const alphaRatio = map(lightningTimer, 0, 32, 0, 255);
  noFill();

  for (let b = 0; b < lightningBolts.length; b++) {
    const bolt = lightningBolts[b];

    // 外層藍紫色電弧光暈
    stroke(130, 190, 255, alphaRatio * 0.65);
    strokeWeight(bolt.weight * 3);
    beginShape();
    for (let i = 0; i < bolt.points.length; i++) {
      vertex(bolt.points[i].x, bolt.points[i].y);
    }
    endShape();

    // 內層亮黃白色閃電核心
    stroke(255, 255, 210, alphaRatio);
    strokeWeight(bolt.weight);
    beginShape();
    for (let i = 0; i < bolt.points.length; i++) {
      vertex(bolt.points[i].x, bolt.points[i].y);
    }
    endShape();
  }

  pop();
  lightningTimer--;
}

function draw() { // 每個畫面更新一次背景與角色
  background("#87CEEB"); // 預設底色避免圖片載入前空白

  // 計算單張背景圖片依畫布高度等比例縮放後的寬度（確保至少與畫布同寬以完整覆蓋畫面）
  const bgAspect = bgImage && bgImage.height > 0 ? bgImage.width / bgImage.height : 1;
  const singleBgWidth = max(width, height * bgAspect);
  const singleBgHeight = height;

  // 計算三張背景串接後的可捲動範圍
  const minBgOffset = width - singleBgWidth * 2;
  const maxBgOffset = singleBgWidth;
  const anchorX = (width * 2) / 3; // 角色在捲動模式下的基準水平位置

  const movingRight = keyIsDown(RIGHT_ARROW); // 檢查右方向鍵目前是否按住
  const movingLeft = keyIsDown(LEFT_ARROW); // 檢查左方向鍵目前是否按住
  isWalking = movingRight || movingLeft; // 沒有按住左右鍵時切回站立動畫
  const movementStep = constrain(width * 0.006, 4, 12); // 依畫布寬度計算適合不同裝置的移動速度

  // 維持角色高度為畫布高度的 1/3，寬度依原圖寬高比等比例縮放
  const characterScale = (height / 3) / frameHeight;
  const characterWidth = frameWidth * characterScale; // 計算角色基本顯示寬度
  const characterHeight = height / 3;

  if (movingRight) { // 按住右方向鍵
    isWalking = true; // 切換至走路動畫
    facingDirection = 1; // 設定角色朝向右方
    if (characterX < anchorX) {
      characterX = min(anchorX, characterX + movementStep);
    } else if (bgOffsetX > minBgOffset) {
      bgOffsetX = max(minBgOffset, bgOffsetX - movementStep);
    } else {
      characterX += movementStep;
    }
  } else if (movingLeft) { // 按住左方向鍵
    isWalking = true; // 切換至走路動畫
    facingDirection = -1; // 設定角色朝向左方
    if (characterX > anchorX) {
      characterX = max(anchorX, characterX - movementStep);
    } else if (bgOffsetX < maxBgOffset) {
      bgOffsetX = min(maxBgOffset, bgOffsetX + movementStep);
    } else {
      characterX -= movementStep;
    }
  }

  // 限制角色中心避免超出畫布左右邊界
  characterX = constrain(characterX, characterWidth / 2, width - characterWidth / 2);

  // 繪製三張左右串接的背景圖片（左、中、右）
  if (bgImage) {
    push();
    imageMode(CORNER); // 背景使用左上角座標對齊無縫串接
    for (let i = -1; i <= 1; i++) {
      const drawX = bgOffsetX + i * singleBgWidth;
      image(bgImage, drawX, 0, singleBgWidth, singleBgHeight);
    }
    pop();
  }

  // ================= 繪製角色二（位於最左邊背景圖正中央） =================
  const char2X = bgOffsetX - singleBgWidth / 2;
  const char2BaseScale = (height / 3) / char2StopFrameHeight;
  const char2StopWidth = char2StopFrameWidth * char2BaseScale;

  // 判斷角色一是否接近角色二
  const distanceToChar1 = abs(characterX - char2X);
  const triggerDistance = (characterWidth + char2StopWidth) * 0.9;
  const isChar2Near = distanceToChar1 < triggerDistance;

  // 當角色一剛進入接近範圍時，自動重新出一道新題目
  if (isChar2Near && !wasChar2Near) {
    generateMathQuestion();
  }
  wasChar2Near = isChar2Near;

  // 選擇角色二目前的精靈圖與參數
  const char2ActiveSprite = isChar2Near ? char2ActionSprite : char2StopSprite;
  const char2ActiveFrameCount = isChar2Near ? char2ActionFrameCount : char2StopFrameCount;
  const char2ActiveFrameWidth = isChar2Near ? char2ActionFrameWidth : char2StopFrameWidth;
  const char2ActiveFrameHeight = isChar2Near ? char2ActionFrameHeight : char2StopFrameHeight;

  const char2FrameIndex = floor(frameCount / framesPerStep) % char2ActiveFrameCount;
  const char2SourceX = char2FrameIndex * char2ActiveFrameWidth;
  const char2DisplayWidth = char2ActiveFrameWidth * char2BaseScale;
  const char2DisplayHeight = char2ActiveFrameHeight * char2BaseScale;
  const char2Y = height - char2DisplayHeight / 2; // 角色二底部對齊畫布底部

  // 角色一在角色二左邊時轉向
  const char2Facing = characterX < char2X ? -1 : 1;

  if (char2ActiveSprite && char2ActiveSprite.width > 0) {
    push();
    translate(char2X, char2Y);
    scale(char2Facing, 1);
    image(
      char2ActiveSprite,
      0,
      0,
      char2DisplayWidth,
      char2DisplayHeight,
      char2SourceX,
      0,
      char2ActiveFrameWidth,
      char2ActiveFrameHeight
    );
    pop();
  }
  // =====================================================================

  if (isCasting && frameCount - magicStartFrame >= magicFrameCount * framesPerStep) { // 檢查施法動畫是否已完整播放一次
    isCasting = false; // 結束施法動畫並恢復一般角色動作
    activeEffects.push({ x: characterX + magicDirection * characterWidth / 2, y: height - characterHeight * 0.58, direction: magicDirection }); // 在角色前方建立朝施法方向飛行的特效
  } // 結束施法動畫完成判斷

  const activeSprite = isCasting ? magicSprite : isWalking ? walkSprite : characterSprite; // 根據角色狀態選擇施法、走路或站立精靈圖
  const activeFrameCount = isCasting ? magicFrameCount : isWalking ? walkFrameCount : frameCountInSprite; // 取得目前精靈圖的影格總數
  const activeFrameWidth = isCasting ? magicFrameWidth : isWalking ? walkFrameWidth : frameWidth; // 取得目前精靈圖每格的寬度
  const activeFrameHeight = isCasting ? magicFrameHeight : isWalking ? walkFrameHeight : frameHeight; // 取得目前精靈圖每格的高度
  const elapsedMagicFrames = frameCount - magicStartFrame; // 計算施法動畫已播放的畫面數
  const frameIndex = isCasting ? floor(elapsedMagicFrames / framesPerStep) : floor(frameCount / framesPerStep) % activeFrameCount; // 計算目前要顯示的精靈影格
  const sourceX = frameIndex * activeFrameWidth; // 計算目前影格在精靈圖中的水平起點
  const activeWidth = activeFrameWidth * characterScale; // 計算目前角色影格的顯示寬度
  const activeHeight = activeFrameHeight * characterScale; // 計算目前角色影格的顯示高度
  const characterY = height - activeHeight / 2; // 將目前角色影格底部對齊畫布底部

  push(); // 暫存目前的繪圖座標轉換狀態
  translate(characterX, characterY); // 將繪圖原點移至角色中心
  scale(isCasting ? magicDirection : facingDirection, 1); // 依施法或角色朝向決定是否水平翻轉
  image(activeSprite, 0, 0, activeWidth, activeHeight, sourceX, 0, activeFrameWidth, activeFrameHeight); // 裁切並繪製目前角色影格
  pop(); // 還原繪圖座標轉換狀態

  const effectScale = characterScale; // 使用角色縮放倍率讓特效適應不同畫布
  const effectWidth = effectFrameWidth * effectScale; // 計算特效影格的顯示寬度
  const effectHeight = effectFrameHeight * effectScale; // 計算特效影格的顯示高度
  const effectSpeed = max(6, width * 0.008); // 依畫布寬度計算特效飛行速度
  for (let effectIndex = activeEffects.length - 1; effectIndex >= 0; effectIndex--) { // 由後往前更新所有飛行中的特效
    const effect = activeEffects[effectIndex]; // 取得目前更新的特效資料
    effect.x += effect.direction * effectSpeed; // 依特效方向更新水平位置
    if (effect.x > width || effect.x < 0) { // 判斷特效是否已抵達畫布左右邊緣
      activeEffects.splice(effectIndex, 1); // 移除已飛出畫布的特效
      continue; // 略過已移除特效的繪製
    } // 結束特效邊界判斷
    const effectFrameIndex = floor(frameCount / framesPerStep) % effectFrameCount; // 計算特效目前播放的影格
    push(); // 暫存目前的繪圖座標轉換狀態
    translate(effect.x, effect.y); // 將繪圖原點移至特效中心
    scale(effect.direction, 1); // 依飛行方向翻轉特效影格
    image(magicEffectSprite, 0, 0, effectWidth, effectHeight, effectFrameIndex * effectFrameWidth, 0, effectFrameWidth, effectFrameHeight); // 裁切並繪製目前特效影格
    pop(); // 還原繪圖座標轉換狀態
  } // 結束飛行中特效更新迴圈

  // ================= 接近角色二時顯示數學加法選擇題方框 =================
  if (isChar2Near && currentQuestion) {
    drawMathQuizBox();
  } else {
    optionButtonBounds = [];
    nextBtnBounds = null;
  }
  // =====================================================================

  // 繪製答對煙火與答錯閃電最上層特效
  updateAndDrawFireworks();
  drawLightningEffect();
} // 結束繪圖函式

// 繪製畫布上方的數學加法選擇題藍色方框與四個選項按鈕
function drawMathQuizBox() {
  const boxW = width / 3; // 寬為整個畫布寬的 1/3
  const boxH = height / 2; // 高為整個畫布高的 1/2
  const boxX = (width - boxW) / 2; // 方框中間對準畫布中間
  const boxY = 12; // 方框上方靠近畫布上方

  push();
  rectMode(CORNER);

  // 繪製透明度為 90 的藍色方框
  fill(25, 110, 220, 90);
  stroke(255, 255, 255, 200);
  strokeWeight(2);
  rect(boxX, boxY, boxW, boxH, 16);

  // 題目標題區
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);

  const titleSize = constrain(boxH * 0.06, 13, 20);
  textSize(titleSize);
  text("數學加法挑戰", boxX + boxW / 2, boxY + boxH * 0.11);

  const questionSize = constrain(boxH * 0.12, 20, 38);
  textStyle(BOLD);
  textSize(questionSize);
  text(currentQuestion.text, boxX + boxW / 2, boxY + boxH * 0.25);
  textStyle(NORMAL);

  // 繪製四個選項按鈕（2 x 2 網格排列）
  optionButtonBounds = [];
  const optionLabels = ["A", "B", "C", "D"];
  const btnCols = 2;
  const btnGapX = boxW * 0.07;
  const btnGapY = boxH * 0.05;
  const btnW = (boxW - btnGapX * 3) / btnCols;
  const btnH = boxH * 0.17;
  const startY = boxY + boxH * 0.38;

  for (let i = 0; i < 4; i++) {
    const col = i % btnCols;
    const row = floor(i / btnCols);
    const btnX = boxX + btnGapX + col * (btnW + btnGapX);
    const btnY = startY + row * (btnH + btnGapY);

    // 記錄按鈕範圍供滑鼠點擊偵測
    optionButtonBounds.push({
      x: btnX,
      y: btnY,
      w: btnW,
      h: btnH,
      value: currentQuestion.options[i]
    });

    // 偵測滑鼠是否懸停於按鈕上方
    const isHover =
      mouseX >= btnX &&
      mouseX <= btnX + btnW &&
      mouseY >= btnY &&
      mouseY <= btnY + btnH;

    if (isAnswerCorrect && currentQuestion.options[i] === currentQuestion.answer) {
      fill(46, 184, 92, 220); // 答對時將正確選項標示為綠色
    } else if (isHover && !isAnswerCorrect) {
      fill(255, 255, 255, 235); // 滑鼠移上時變亮
    } else {
      fill(255, 255, 255, 190); // 一般按鈕底色
    }

    stroke(255);
    strokeWeight(1.5);
    rect(btnX, btnY, btnW, btnH, 10);

    noStroke();
    fill(isAnswerCorrect && currentQuestion.options[i] === currentQuestion.answer ? 255 : 20);
    textSize(constrain(btnH * 0.42, 14, 24));
    text(`${optionLabels[i]}. ${currentQuestion.options[i]}`, btnX + btnW / 2, btnY + btnH / 2);
  }

  // 顯示作答結果回饋文字
  if (quizFeedback !== "") {
    const feedbackY = boxY + boxH * 0.81;
    fill(isAnswerCorrect ? "#B9F6CA" : "#FFE082");
    textStyle(BOLD);
    textSize(constrain(boxH * 0.055, 13, 18));
    text(quizFeedback, boxX + boxW / 2, feedbackY);
    textStyle(NORMAL);
  }

  // 答對後顯示「下一題」按鈕
  if (isAnswerCorrect) {
    const nextW = boxW * 0.36;
    const nextH = boxH * 0.1;
    const nextX = boxX + (boxW - nextW) / 2;
    const nextY = boxY + boxH * 0.87;
    nextBtnBounds = { x: nextX, y: nextY, w: nextW, h: nextH };

    const isNextHover =
      mouseX >= nextX &&
      mouseX <= nextX + nextW &&
      mouseY >= nextY &&
      mouseY <= nextY + nextH;

    fill(isNextHover ? "#2E7D32" : "#388E3C");
    stroke(255);
    strokeWeight(1.5);
    rect(nextX, nextY, nextW, nextH, 8);

    noStroke();
    fill(255);
    textSize(constrain(nextH * 0.5, 12, 16));
    text("下一題 →", nextX + nextW / 2, nextY + nextH / 2);
  } else {
    nextBtnBounds = null;
  }

  pop();
}

// 處理滑鼠點擊選擇題選項與「下一題」按鈕
function mousePressed() {
  if (!wasChar2Near || !currentQuestion) return;

  // 若已答對，檢查是否點擊「下一題」按鈕
  if (isAnswerCorrect && nextBtnBounds) {
    if (
      mouseX >= nextBtnBounds.x &&
      mouseX <= nextBtnBounds.x + nextBtnBounds.w &&
      mouseY >= nextBtnBounds.y &&
      mouseY <= nextBtnBounds.y + nextBtnBounds.h
    ) {
      generateMathQuestion();
      return;
    }
  }

  // 檢查是否點擊四個選項之一
  if (!isAnswerCorrect) {
    for (let i = 0; i < optionButtonBounds.length; i++) {
      const btn = optionButtonBounds[i];
      if (
        mouseX >= btn.x &&
        mouseX <= btn.x + btn.w &&
        mouseY >= btn.y &&
        mouseY <= btn.y + btn.h
      ) {
        if (btn.value === currentQuestion.answer) {
          isAnswerCorrect = true;
          quizFeedback = "答對了！太棒了！";
          spawnFireworks(); // 答對觸發煙火特效
        } else {
          quizFeedback = `答錯囉，${btn.value} 不是正確答案，再試一次！`;
          triggerLightning(); // 答錯觸發閃電特效
        }
        break;
      }
    }
  }
}

function keyPressed() { // 按下方向鍵時切換角色狀態與朝向
  if (keyCode === RIGHT_ARROW) { // 判斷是否按下右方向鍵
    isWalking = true; // 啟用走路動畫
    facingDirection = 1; // 讓角色面向右方
    return false; // 防止方向鍵捲動網頁
  } // 結束右方向鍵判斷
  if (keyCode === LEFT_ARROW) { // 判斷是否按下左方向鍵
    isWalking = true; // 啟用走路動畫
    facingDirection = -1; // 讓角色面向左方
    return false; // 防止方向鍵捲動網頁
  } // 結束左方向鍵判斷
  if (keyCode === 32) { // 判斷是否按下空白鍵
    if (!spaceIsDown && !isCasting) { // 僅在空白鍵新按下且角色未施法時觸發
      isCasting = true; // 開始播放施法動畫
      magicStartFrame = frameCount; // 記錄施法動畫的起始畫面
      magicDirection = facingDirection; // 鎖定施法當下角色面向
    } // 結束施法啟動判斷
    spaceIsDown = true; // 記錄空白鍵已按住以避免連續觸發
    return false; // 防止空白鍵捲動網頁
  } // 結束空白鍵判斷
} // 結束按鍵事件處理函式

function keyReleased() { // 鍵盤按鍵放開時更新按鍵狀態
  if (keyCode === 32) { // 判斷放開的是否為空白鍵
    spaceIsDown = false; // 允許下次按空白鍵重新施法
  } // 結束空白鍵放開判斷
} // 結束按鍵放開事件處理函式

function windowResized() { // 視窗尺寸改變時重新調整畫布
  resizeCanvas(windowWidth, windowHeight); // 將畫布同步為新的視窗尺寸
  characterX = constrain(characterX, 1, width - 1); // 將角色位置限制在縮放後畫布內
} // 結束視窗縮放處理函式