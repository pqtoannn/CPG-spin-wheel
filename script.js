// 🎯 Danh sách phần thưởng và số lượng
const prizeData = [
  { name: "Dây đeo Comandante", qty: 50 },
  { name: "Vòng tay Comandante", qty: 50 },
  { name: "Bộ Sticker", qty: 50 },
  { name: "Ghim cài Comandante", qty: 5 },
  { name: "Túi cà phê Lúave (Phin)", qty: 3 },
  { name: "Tool Bag Comandante", qty: 10 },
  { name: "Khay cafe Comandante", qty: 9 },
  { name: "Áo thun Comandante", qty: 5 },
];

// 🎯 Áp dụng công thức lũy thừa để tăng xác suất vật phẩm nhiều
const exponent = 1.5;
let weights = prizeData.map((p) => Math.pow(p.qty, exponent));
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
  const pointerAngle = 270; // Mũi tên ở trên
  const segMid = chosenIndex * segAngle + segAngle / 2;
  const baseRot = (pointerAngle - segMid + 360) % 360;
  const fullSpins = 6 + Math.floor(Math.random() * 3);
  const jitter = Math.random() * 30 - 15;
  const targetRotation = fullSpins * 360 + baseRot + jitter;

  rotation += targetRotation;
  wheel.style.transition = "transform 5s cubic-bezier(.17,.67,.32,1.25)";
  wheel.style.transform = `rotate(${rotation}deg)`;

  setTimeout(() => {
    spinning = false;
    const normalized = rotation % 360;
    const angleAtPointer = (pointerAngle - normalized + 360) % 360;
    const winningIndex = Math.floor(angleAtPointer / segAngle) % segCount;
    highlightSegment(winningIndex);
    const prize = prizes[winningIndex];
    result.textContent = `🎉 Bạn trúng: ${prize}!`;
    result.style.display = "block";
  }, 5200);
});
