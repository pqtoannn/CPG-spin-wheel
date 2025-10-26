// 🎯 Danh sách phần thưởng và số lượng
const prizeData = [
  { name: "Dây đeo Comandante", qty: 50 },
  { name: "Vòng tay Comandante", qty: 50 },
  { name: "Bộ Sticker", qty: 50 },
  { name: "Ghim cài Comandante", qty: 5 },
  { name: "Túi cà phê Lúave (Phin)", qty: 3 },
  { name: "Tool Bag Comandante", qty: 10 },
  { name: "Khay cafe Comandante nhỏ", qty: 6 },
  { name: "Khay cafe Comandante lớn", qty: 3 },
  { name: "Áo thun Comandante", qty: 5 },
  { name: "Sách Atlas Coffee Worlds", qty: 1 },
];
// 🎯 Áp dụng công thức lũy thừa để tăng xác suất vật phẩm nhiều
// const exponent = 1.5;
// let weights = prizeData.map((p) => Math.pow(p.qty, exponent));
let weights = prizeData.map((p) => p.qty);
const totalWeight = weights.reduce((a, b) => a + b, 0);
weights = weights.map((w) => w / totalWeight);

const prizes = prizeData.map((p) => p.name);
const wheel = document.getElementById("wheel");
const spinBtn = document.getElementById("spinBtn");
const result = document.getElementById("result");

const segCount = prizes.length;
const segAngle = 360 / segCount;
const radius = 280;

// 🎨 Vẽ các ô bánh xe
wheel.innerHTML = "";
let startAngle = 0;
for (let i = 0; i < segCount; i++) {
  const endAngle = startAngle + segAngle;
  const largeArc = segAngle > 180 ? 1 : 0;
  const x1 = Math.cos((startAngle * Math.PI) / 180) * radius;
  const y1 = Math.sin((startAngle * Math.PI) / 180) * radius;
  const x2 = Math.cos((endAngle * Math.PI) / 180) * radius;
  const y2 = Math.sin((endAngle * Math.PI) / 180) * radius;
  const path = `M0,0 L${x1},${y1} A${radius},${radius} 0 ${largeArc} 1 ${x2},${y2} Z`;
  const color = i % 2 === 0 ? "var(--blue)" : "#ffffff";
  const textColor = i % 2 === 0 ? "#ffffff" : "#1B1C72";

  const seg = document.createElementNS("http://www.w3.org/2000/svg", "path");
  seg.setAttribute("d", path);
  seg.setAttribute("fill", color);
  seg.setAttribute("stroke", "rgba(0,0,0,0.05)");
  seg.setAttribute("data-index", i);
  wheel.appendChild(seg);

  // 🏷️ Nhãn phần thưởng
  const mid = startAngle + segAngle / 2;
  const labelRadius = 180;
  const lx = Math.cos((mid * Math.PI) / 180) * labelRadius;
  const ly = Math.sin((mid * Math.PI) / 180) * labelRadius;
  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", lx);
  text.setAttribute("y", ly);
  text.setAttribute("fill", textColor);
  text.setAttribute("font-size", "14");
  text.setAttribute("font-weight", "600");
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("alignment-baseline", "middle");
  text.setAttribute("transform", `rotate(${mid},${lx},${ly})`);
  text.textContent = prizes[i];
  wheel.appendChild(text);
  startAngle += segAngle;
}

let spinning = false;
let rotation = 0;

function clearHighlights() {
  [...wheel.querySelectorAll("path")].forEach((p) => {
    p.style.filter = "";
    p.style.stroke = "rgba(0,0,0,0.05)";
    p.style.strokeWidth = "";
  });
}

function highlightSegment(index) {
  clearHighlights();
  const seg = wheel.querySelector(`path[data-index='${index}']`);
  if (seg) {
    seg.style.filter = "drop-shadow(0 8px 20px rgba(11,20,70,0.25))";
    seg.style.stroke = "#ffb547";
    seg.style.strokeWidth = "4";
  }
}

// 📌 Hàm random có trọng số
function weightedRandom(weights) {
  const r = Math.random();
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    sum += weights[i];
    if (r <= sum) return i;
  }
  return weights.length - 1;
}

spinBtn.addEventListener("click", () => {
  if (spinning) return;
  spinning = true;
  result.style.display = "none";
  clearHighlights();

  const chosenIndex = weightedRandom(weights);

  // ⭐️ SỬA LỖI 1: Mũi tên ở 12 giờ là 90 độ
  const pointerAngle = 270;
  const segMid = chosenIndex * segAngle + segAngle / 2;

  // ⭐️ SỬA LỖI 2: Công thức tính baseRot (góc quay (mod 360) mong muốn)
  // R = (pointerAngle - segMid + 360) % 360
  const baseRot = (pointerAngle - segMid + 360) % 360;

  const fullSpins = 6 + Math.floor(Math.random() * 3);
  const jitter = Math.random() * 30 - 15;
  let targetRotation = fullSpins * 360 + baseRot + jitter;

  // ⭐️ SỬA LỖI 3: Đảm bảo bánh xe luôn quay tới và quay đủ vòng
  // Góc quay mới phải lớn hơn góc quay cũ
  while (targetRotation < rotation + 2160) {
    // 2160 = 6 * 360 (thêm 6 vòng)
    targetRotation += 360;
  }

  // GÁN giá trị tuyệt đối mới, KHÔNG CỘNG DỒN
  rotation = targetRotation;

  console.log("🎯 BEFORE SPIN", {
    chosenIndex,
    segMid,
    baseRot: (baseRot + 360) % 360, // baseRot có thể âm, chuẩn hóa cho log
    targetRotation,
    rotationAfter: rotation,
  });
  wheel.style.transition = "transform 5s cubic-bezier(.17,.67,.32,1.25)";
  wheel.style.transform = `rotate(${rotation}deg)`;

  setTimeout(() => {
    spinning = false;

    // Lấy góc quay chuẩn hóa trong 0–360
    const normalized = (rotation % 360 + 360) % 360;

    // ⭐️ SỬA LỖI 4: Tính toán góc tại mũi tên
    // Vị trí cũ = (Vị trí mới - góc quay + 360) % 360
    const angleAtPointer = (pointerAngle - normalized + 360) % 360;

    // Tính ô trúng (theo hướng tăng dần từ 0° ở bên phải)
    const winningIndex = Math.floor(angleAtPointer / segAngle) % segCount;

    console.log("🛑 AFTER SPIN", {
      normalized,
      angleAtPointer,
      winningIndex,
      expected: chosenIndex,
      correct: winningIndex === chosenIndex,
    });

    highlightSegment(winningIndex);
    const prize = prizes[winningIndex];
    result.textContent = `🎉 Bạn trúng: ${prize}!`;
    result.style.display = "block";

    launchFireworks(4000);
  }, 5200);
});

function testWheel(iterations = 1000) {
  const pointerAngle = 270; // mũi tên ở trên
  const segAngle = 360 / prizeData.length;

  // ✅ Tạo danh sách tên và trọng số
  const prizes = prizeData.map(p => p.name);
  const weights = prizeData.map(p => p.qty / prizeData.reduce((a, b) => a + b.qty, 0));

  let correct = 0;
  let results = Array(prizes.length).fill(0);

  for (let i = 0; i < iterations; i++) {
    // chọn phần thưởng theo tỉ lệ
    const chosenIndex = weightedRandom(weights);
    const segMid = chosenIndex * segAngle + segAngle / 2;

    // tính toán góc quay chính xác tới vị trí mũi tên
    const baseRot = (pointerAngle - segMid + 360) % 360;
    const spins = Math.floor(Math.random() * 3) + 4; // quay 4–6 vòng
    const rotation = spins * 360 + baseRot;

    // chuẩn hóa góc quay
    const normalized = (rotation % 360 + 360) % 360;

    // góc tại mũi tên để xác định phần trúng
    const angleAtPointer = (pointerAngle - normalized + 360) % 360;
    const winningIndex = Math.floor(angleAtPointer / segAngle) % prizes.length;

    results[winningIndex]++;
    if (winningIndex === chosenIndex) correct++;
  }

  console.table(
    results.map((count, i) => ({
      segment: i,
      name: prizes[i],
      count,
      percent: ((count / iterations) * 100).toFixed(2) + "%",
      expected_percent: (weights[i] * 100).toFixed(2) + "%",
    }))
  );

  console.log(`✅ Accuracy: ${(correct / iterations * 100).toFixed(2)}%`);
}

function launchFireworks(duration = 4000) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.id = "fireworks";
  document.body.appendChild(canvas);
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  canvas.style.position = "fixed";
  canvas.style.left = 0;
  canvas.style.top = 0;
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = 9999;

  const particles = [];
  const colors = ["#ff0043", "#ffae00", "#00ffcc", "#4dff00", "#ff00ff", "#00b3ff"];

  class Particle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.radius = Math.random() * 2 + 1;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.alpha = 1;
      this.decay = 0.015 + Math.random() * 0.02;
      this.gravity = 0.05 + Math.random() * 0.05;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += this.gravity;
      this.alpha -= this.decay;
    }

    draw() {
      ctx.globalAlpha = this.alpha;
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 3);
      grad.addColorStop(0, "white");
      grad.addColorStop(0.2, this.color);
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function explode(x, y) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    for (let i = 0; i < 60; i++) {
      particles.push(new Particle(x, y, color));
    }
  }

  function randomExplosion() {
    const x = Math.random() * canvas.width * 0.8 + canvas.width * 0.1;
    const y = Math.random() * canvas.height * 0.4 + canvas.height * 0.1;
    explode(x, y);
  }

  let running = true;
  const endTime = Date.now() + duration;

  function animate() {
    // 💡 KHÔNG tô nền đen nữa, chỉ làm mờ nhẹ pháo hoa cũ
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "lighter";

    particles.forEach((p, i) => {
      p.update();
      p.draw();
      if (p.alpha <= 0) particles.splice(i, 1);
    });

    if (Date.now() < endTime && running) {
      if (Math.random() < 0.08) randomExplosion();
      requestAnimationFrame(animate);
    } else if (particles.length > 0) {
      requestAnimationFrame(animate);
    } else {
      document.body.removeChild(canvas);
    }
  }

  animate();

  window.addEventListener("resize", () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
  });
}


