// ===============================
// 🎯 CẤU HÌNH PHẦN THƯỞNG MẶC ĐỊNH
// ===============================
const defaultPrizeData = [
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

// ===============================
// 🎯 MỚI: QUẢN LÝ DỮ LIỆU LOCAL STORAGE
// ===============================
function loadPrizeData() {
  const saved = localStorage.getItem("luckyWheelPrizes");
  if (saved) {
    try {
      // Đảm bảo dữ liệu đọc ra là hợp lệ
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.every(p => p.name && typeof p.qty === "number")) {
        return parsed;
      }
    } catch (e) {
      console.error("Lỗi đọc localStorage, sử dụng dữ liệu mặc định:", e);
    }
  }
  // Nếu không có gì hoặc lỗi, trả về bản sao của dữ liệu mặc định
  return JSON.parse(JSON.stringify(defaultPrizeData));
}

function savePrizeData(data) {
  localStorage.setItem("luckyWheelPrizes", JSON.stringify(data));
}

// 🎯 MỚI: Dùng prizeData từ localStorage
let prizeData = loadPrizeData();

// ===============================
// 🎯 MỚI: HÀM TÍNH TOÁN ĐỘNG
// Các hàm này sẽ lọc ra những giải thưởng CÒN HÀNG
// ===============================
function getActivePrizes() {
  // Chỉ lấy những phần thưởng có qty > 0
  return prizeData.filter(p => p.qty > 0).map(p => p.name);
}

function calculateActiveWeights() {
  // Lọc những phần thưởng còn hàng
  const activePrizes = prizeData.filter(p => p.qty > 0);
  // Tính tổng số lượng CỦA NHỮNG PHẦN THƯỞNG CÒN HÀNG
  const totalWeight = activePrizes.reduce((a, b) => a + b.qty, 0);
  
  if (totalWeight === 0) return []; // Trường hợp hết sạch giải
  
  // Tính tỉ lệ dựa trên số lượng còn lại
  return activePrizes.map((p) => p.qty / totalWeight);
}

// 🎯 MỚI: Khởi tạo động
let prizes = getActivePrizes();
let weights = calculateActiveWeights();

const wheel = document.getElementById("wheel");
const spinBtn = document.getElementById("spinBtn");
const result = document.getElementById("result");
const radius = 280;

// 🎯 MỚI: TÁCH LOGIC VẼ RA HÀM RIÊNG
// Hàm này sẽ được gọi lại mỗi khi quay xong để cập nhật vòng quay
function renderWheel() {
  // 🎯 MỚI: Cập nhật danh sách giải và tỉ lệ mỗi khi vẽ
  prizes = getActivePrizes();
  weights = calculateActiveWeights();
  
  wheel.innerHTML = ""; // Xóa bánh xe cũ
  
  const segCount = prizes.length;
  
  // 🎯 MỚI: Xử lý trường hợp hết phần thưởng
  if (segCount === 0) {
    wheel.innerHTML = `<text x="0" y="0" text-anchor="middle" alignment-baseline="middle" font-size="24" fill="#333">Đã hết phần thưởng!</text>`;
    spinBtn.disabled = true; // Vô hiệu hóa nút quay
    spinBtn.style.opacity = 0.5;
    return;
  }
  
  const segAngle = 360 / segCount;
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
    text.textContent = prizes[i]; // Lấy tên từ mảng 'prizes' đã lọc
    wheel.appendChild(text);
    startAngle += segAngle;
  }
}

// 🎯 MỚI: Gọi hàm vẽ lần đầu khi tải trang
renderWheel();


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
  // 🎯 MỚI: Thêm điều kiện kiểm tra còn giải thưởng không
  if (spinning || prizes.length === 0) return;
  spinning = true;
  result.style.display = "none";
  clearHighlights();

  // 🎯 MỚI: Đảm bảo weights được cập nhật (mặc dù renderWheel đã làm)
  // Nhưng để chắc chắn, ta có thể tính lại ngay trước khi quay
  weights = calculateActiveWeights();
  const chosenIndex = weightedRandom(weights);
  
  // 🎯 MỚI: segCount và segAngle phải được tính động
  const segCount = prizes.length;
  const segAngle = 360 / segCount;

  // ⭐️ SỬA LỖI 1: Mũi tên ở 12 giờ là 270 độ (không phải 90)
  const pointerAngle = 270;
  const segMid = chosenIndex * segAngle + segAngle / 2;

  // ⭐️ SỬA LỖI 2: Công thức tính baseRot
  const baseRot = (pointerAngle - segMid + 360) % 360;

  const fullSpins = 6 + Math.floor(Math.random() * 3);
  const jitter = Math.random() * 30 - 15;
  let targetRotation = fullSpins * 360 + baseRot + jitter;

  // ⭐️ SỬA LỖI 3: ĐẢM BẢO GIỮ NGUYÊN LOGIC NÀY
  // Đảm bảo bánh xe luôn quay tới và quay đủ vòng
  while (targetRotation < rotation + 2160) {
    targetRotation += 360;
  }

  // GÁN giá trị tuyệt đối mới
  rotation = targetRotation;

  console.log("🎯 BEFORE SPIN", {
    chosenIndex,
    segMid,
    baseRot: (baseRot + 360) % 360,
    targetRotation,
    rotationAfter: rotation,
  });
  
  wheel.style.transition = "transform 5s cubic-bezier(.17,.67,.32,1.25)";
  wheel.style.transform = `rotate(${rotation}deg)`;

  setTimeout(() => {
    spinning = false;

    const normalized = (rotation % 360 + 360) % 360;
    
    // ⭐️ SỬA LỖI 4: Tính toán góc tại mũi tên
    const angleAtPointer = (pointerAngle - normalized + 360) % 360;

    // Tính ô trúng
    const winningIndex = Math.floor(angleAtPointer / segAngle) % segCount;

    console.log("🛑 AFTER SPIN", {
      normalized,
      angleAtPointer,
      winningIndex,
      expected: chosenIndex,
      correct: winningIndex === chosenIndex,
    });
    
    // 🎯 MỚI: Lấy tên giải thưởng từ mảng 'prizes' đã lọc
    const prizeName = prizes[winningIndex];

    // 🎯 MỚI: LOGIC TRỪ SỐ LƯỢNG VÀ LƯU
    if (prizeName) {
      // Tìm giải thưởng trong mảng DỮ LIỆU GỐC
      const targetPrize = prizeData.find(p => p.name === prizeName);
      if (targetPrize && targetPrize.qty > 0) {
        targetPrize.qty -= 1; // Trừ số lượng
        savePrizeData(prizeData); // Lưu vào localStorage
        console.log(`Đã trúng: ${prizeName}, còn lại: ${targetPrize.qty}`);
      }
    }

    // highlightSegment(winningIndex); // Không cần highlight vì sẽ vẽ lại
    
    // Hiển thị popup và pháo hoa (GIỮ NGUYÊN)
    showPrizePopup(prizeName || "Không trúng gì"); // || "..." phòng trường hợp lỗi
    launchFireworks(4000);
    
    // 🎯 MỚI: Vẽ lại vòng quay sau 1 giây để cập nhật tỉ lệ và số lượng
    setTimeout(renderWheel, 1000);
    
  }, 5200);
});

// ===============================
// 🎯 MỚI: HÀM RESET DỮ LIỆU
// ===============================
window.addEventListener("keydown", (e) => {
  // Tổ hợp phím Ctrl + Shift + R
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "r") {
    e.preventDefault(); // Ngăn trình duyệt tải lại
    if (confirm("Bạn có chắc muốn reset toàn bộ số lượng phần thưởng về mặc định?")) {
      localStorage.removeItem("luckyWheelPrizes"); // Xóa dữ liệu đã lưu
      location.reload(); // Tải lại trang để áp dụng
    }
  }
});

// ===============================
// CÁC HÀM HIỆU ỨNG (GIỮ NGUYÊN)
// ===============================

function showPrizePopup(prize) {
  const overlay = document.createElement("div");
  overlay.className = "popup-overlay";
  const popup = document.createElement("div");
  popup.className = "popup";
  popup.innerHTML = `
    <h2>🎉 Chúc mừng bạn!</h2>
    <p>Bạn đã trúng: <strong>${prize}</strong></p>
    <button>OK</button>
  `;
  overlay.appendChild(popup);
  document.body.appendChild(overlay);
  popup.querySelector("button").addEventListener("click", () => {
    overlay.remove();
  });
}

function launchFireworks(duration = 4000) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = "fixed";
  canvas.style.left = 0;
  canvas.style.top = 0;
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = 9997;
  document.body.appendChild(canvas);

  const colors = ["#ff0043", "#ffd700", "#00e0ff", "#7fff00", "#ff00ff", "#ff7b00"];
  const particles = [];

  function createExplosion(x, y) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color,
        radius: Math.random() * 2 + 1,
        decay: 0.008 + Math.random() * 0.02,
        gravity: 0.04,
      });
    }
  }

  function animate() {
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "lighter";

    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.alpha -= p.decay;
      if (p.alpha <= 0) particles.splice(i, 1);
      ctx.beginPath();
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3);
      grad.addColorStop(0, "white");
      grad.addColorStop(0.2, p.color);
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.globalAlpha = p.alpha;
      ctx.arc(p.x, p.y, p.radius * 2, 0, Math.PI * 2);
      ctx.fill();
    });

    if (Date.now() < endTime || particles.length > 0) {
      requestAnimationFrame(animate);
    } else {
      document.body.removeChild(canvas);
    }
  }

  const endTime = Date.now() + duration;
  animate();

  const interval = setInterval(() => {
    const x = Math.random() * window.innerWidth * 0.8 + window.innerWidth * 0.1;
    const y = Math.random() * window.innerHeight * 0.4 + window.innerHeight * 0.1;
    createExplosion(x, y);
  }, 400);

  setTimeout(() => clearInterval(interval), duration - 500);
}

// ===============================
// 🎯 MỚI: HÀM KIỂM TRA QUAY THỬ
// ===============================
function testDynamicWheel(iterations = 200) {
  console.clear();
  console.log(`🚀 Bắt đầu kiểm tra mô phỏng ${iterations} lượt quay...`);

  // 1. Tạo bản sao DỮ LIỆU GỐC để test (lấy từ defaultPrizeData)
  // Việc này đảm bảo mỗi lần test đều bắt đầu từ kho đầy
  let testData = JSON.parse(JSON.stringify(defaultPrizeData));
  
  // Biến lưu kết quả
  let results = {}; // Lưu theo tên giải: { "Tên giải": count }
  let correctSpins = 0;
  let totalSpinsRun = 0;
  const pointerAngle = 270;

  for (let i = 0; i < iterations; i++) {
    totalSpinsRun++;
    
    // 2. Lấy giải thưởng và tỉ lệ HIỆN CÓ (giống hệt logic thật)
    const activePrizesData = testData.filter(p => p.qty > 0);
    const activePrizesNames = activePrizesData.map(p => p.name);
    
    // Dừng test nếu hết giải
    if (activePrizesData.length === 0) {
      console.warn(`⚠️ ĐÃ HẾT TẤT CẢ PHẦN THƯỞNG sau ${i} lượt quay.`);
      break; 
    }

    const totalWeight = activePrizesData.reduce((a, b) => a + b.qty, 0);
    const activeWeights = activePrizesData.map(p => p.qty / totalWeight);

    // 3. Mô phỏng CHỌN GIẢI (weightedRandom)
    // 'chosenIndex' là index của mảng 'activePrizesData'
    const chosenIndex = weightedRandom(activeWeights); 
    const chosenPrizeName = activePrizesNames[chosenIndex];

    // 4. Mô phỏng TÍNH TOÁN GÓC (giống logic thật)
    const segCount = activePrizesNames.length;
    const segAngle = 360 / segCount;
    const segMid = chosenIndex * segAngle + segAngle / 2;
    const baseRot = (pointerAngle - segMid + 360) % 360;

    // 5. Mô phỏng QUAY (thêm jitter để kiểm tra độ chính xác)
    const jitter = Math.random() * 30 - 15;
    const fullSpins = 6 + Math.floor(Math.random() * 3);
    const rotation = fullSpins * 360 + baseRot + jitter;

    // 6. Mô phỏng XÁC ĐỊNH GIẢI TRÚNG (giống logic thật)
    const normalized = (rotation % 360 + 360) % 360;
    const angleAtPointer = (pointerAngle - normalized + 360) % 360;
    const winningIndex = Math.floor(angleAtPointer / segAngle) % segCount;
    
    // 'winningPrizeName' là tên giải thực sự trúng
    const winningPrizeName = activePrizesNames[winningIndex];

    // 7. Ghi nhận kết quả
    if (winningPrizeName) {
        results[winningPrizeName] = (results[winningPrizeName] || 0) + 1;
    }

    // So sánh giải dự kiến và giải thực tế
    if (winningPrizeName === chosenPrizeName) {
      correctSpins++;
    }

    // 8. MÔ PHỎNG TRỪ SỐ LƯỢNG (QUAN TRỌNG)
    const targetPrize = testData.find(p => p.name === winningPrizeName);
    if (targetPrize && targetPrize.qty > 0) {
      targetPrize.qty -= 1;
    }
  }

  // 9. In kết quả
  console.log(`🏁 Kết thúc test sau ${totalSpinsRun} lượt.`);
  console.log(`✅ Độ chính xác (Dự kiến vs. Thực tế): ${(correctSpins / totalSpinsRun * 100).toFixed(2)}%`);
  
  // Tính tổng số lượng ban đầu
  const initialTotalQty = defaultPrizeData.reduce((a, b) => a + b.qty, 0);

  // Sắp xếp kết quả cho dễ đọc
  const sortedResults = Object.keys(results)
    .map(name => {
      const initialQty = defaultPrizeData.find(p => p.name === name).qty;
      return {
        "Tên phần thưởng": name,
        "SL Ban đầu": initialQty,
        "Tỉ lệ gốc": ((initialQty / initialTotalQty) * 100).toFixed(2) + "%",
        "Lượt trúng": results[name],
        "Tỉ lệ trúng": ((results[name] / totalSpinsRun) * 100).toFixed(2) + "%",
      };
    })
    .sort((a, b) => b["Lượt trúng"] - a["Lượt trúng"]);

  console.log("📊 KẾT QUẢ PHÂN BỐ GIẢI THƯỞNG:");
  console.table(sortedResults);

  console.log("📦 SỐ LƯỢNG CÒN LẠI (Mô phỏng):");
  console.table(
    testData.map(p => ({
      "Tên phần thưởng": p.name,
      "Số lượng còn lại": p.qty,
      "Hết hàng": p.qty === 0 ? "❌" : "",
    }))
  );
}

// ===============================
// 🎯 MỚI: HÀM KIỂM TRA TỈ LỆ HIỆN TẠI
// ===============================
function showCurrentPercentages() {
  console.clear();
  console.log("📊 Bảng tỉ lệ trúng thưởng hiện tại (dựa trên số lượng còn lại):");

  // 1. Lọc ra các giải thưởng còn hàng (qty > 0)
  const activePrizes = prizeData.filter(p => p.qty > 0);

  if (activePrizes.length === 0) {
    console.warn("⚠️ Đã hết tất cả phần thưởng. Không có tỉ lệ để hiển thị.");
    return;
  }

  // 2. Tính tổng số lượng (tổng trọng số) của các giải còn hàng
  const totalWeight = activePrizes.reduce((sum, p) => sum + p.qty, 0);

  // 3. Tạo bảng kết quả
  const percentages = activePrizes.map((p, i) => {
    const percentage = (p.qty / totalWeight) * 100;
    return {
      "STT": i + 1,
      "Tên phần thưởng": p.name,
      "Số lượng còn lại": p.qty,
      "Tỉ lệ trúng": percentage.toFixed(2) + "%"
    };
  });

  // 4. In ra console
  console.table(percentages);
  console.log(`Tổng số phần thưởng còn lại: ${totalWeight}`);
  console.log(`(Tỉ lệ được tính dựa trên ${activePrizes.length} loại phần thưởng còn hàng.)`);
}