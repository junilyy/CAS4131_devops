// =============================================================================
// 전역 변수
// =============================================================================
let subscribers = [];
let currentDevices = [];
let selectedUserId = null;
let selectedDeviceId = null;
let usageChart = null;


// =============================================================================
// [요구사항 #3] 상태 기반 Badge 스타일
// =============================================================================
// TODO [요구사항 #3]: 상태 값(value)에 따라 적절한 CSS 클래스를 반환하세요.
//
// 매핑 규칙:
//   Active, Online, Normal   → "badge status-active"   (초록)
//   Paused, Standby          → "badge status-paused"   (파랑)
//   Expired, Error, Warning  → "badge status-expired"  (빨강)
//   Offline                  → "badge status-offline"  (회색)
//   On, Cleaning             → "badge status-on"       (노랑)
//   Off                      → "badge status-off"      (연회색)
//   그 외                     → "badge"
//
// Hint: value를 소문자로 변환 후 비교하세요.
function badgeClass(value) {
    const v = (value || "").toLowerCase();

    if (["active", "online", "normal"].includes(v)) return "badge status-active";
    if (["paused", "standby"].includes(v)) return "badge status-paused";
    if (["expired", "error", "warning"].includes(v)) return "badge status-expired";
    if (v === "offline") return "badge status-offline";
    if (["on", "cleaning"].includes(v)) return "badge status-on";
    if (v === "off") return "badge status-off";
    return "badge";
}


// =============================================================================
// [요구사항 #1] 구독 사용자 조회 + 검색/필터
// =============================================================================

// TODO [요구사항 #1-A]: GET /api/subscribers 를 호출하여
//   subscribers 변수에 저장하고 renderSubscribers()를 호출하세요.
//
// Hint:
//   const res = await fetch("/api/subscribers");
//   subscribers = await res.json();
async function fetchSubscribers() {
    const res = await fetch("/api/subscribers");
    subscribers = await res.json();
    renderSubscribers();
}

// TODO [요구사항 #1-B]: subscribers 배열을 테이블에 렌더링하세요.
//
// 구현 순서:
//   1. subscriber-search 입력값과 subscriber-status-filter 선택값을 가져온다
//   2. subscribers 배열에서 검색어(이름/플랜/상태/ID)와 상태 필터 조건으로 필터링한다
//   3. subscriber-body <tbody>에 필터링된 결과를 <tr>로 추가한다
//   4. 각 행에는 userId, name, plan, status(badge), deviceCount를 표시한다
//   5. 각 행 클릭 시 selectSubscriber(userId)를 호출한다
//   6. 현재 선택된 사용자(selectedUserId)는 "selected" 클래스를 추가한다
function renderSubscribers() {
    const tbody = document.getElementById("subscriber-body");
    const search = document.getElementById("subscriber-search").value.toLowerCase();
    const statusFilter = document.getElementById("subscriber-status-filter").value;

    const filtered = subscribers.filter((s) => {
        const matchSearch =
            !search ||
            s.userId.toLowerCase().includes(search) ||
            s.name.toLowerCase().includes(search) ||
            s.plan.toLowerCase().includes(search) ||
            s.status.toLowerCase().includes(search);
        const matchStatus = !statusFilter || s.status === statusFilter;
        return matchSearch && matchStatus;
    });

    tbody.innerHTML = "";
    filtered.forEach((s) => {
        const tr = document.createElement("tr");
        if (s.userId === selectedUserId) tr.classList.add("selected");
        tr.innerHTML = `
            <td>${s.userId}</td>
            <td>${s.name}</td>
            <td>${s.plan}</td>
            <td><span class="${badgeClass(s.status)}">${s.status}</span></td>
            <td>${s.deviceCount}</td>
        `;
        tr.addEventListener("click", () => selectSubscriber(s.userId));
        tbody.appendChild(tr);
    });
}


// =============================================================================
// [요구사항 #2] 사용자별 가전 목록 + 사용 현황 + 차트
// =============================================================================

// TODO [요구사항 #2-A]: 사용자 클릭 시 해당 사용자의 가전 목록을 조회하세요.
//
// 구현 순서:
//   1. selectedUserId를 업데이트하고 selectedDeviceId를 null로 초기화
//   2. renderSubscribers()를 호출하여 선택 상태를 반영
//   3. usage-detail을 숨기고 usage-empty를 표시 (이전 사용 현황 초기화)
//   4. GET /api/subscribers/{userId}/devices 를 호출
//   5. currentDevices에 저장하고 renderDevices()를 호출
async function selectSubscriber(userId) {
    selectedUserId = userId;
    selectedDeviceId = null;
    renderSubscribers();

    document.getElementById("usage-detail").classList.add("hidden");
    document.getElementById("usage-empty").classList.remove("hidden");

    const res = await fetch(`/api/subscribers/${userId}/devices`);
    currentDevices = await res.json();
    renderDevices();
}

// TODO [요구사항 #2-B]: currentDevices 배열을 테이블에 렌더링하세요.
//
// 구현 순서:
//   1. device-search, device-status-filter 값으로 필터링
//      (검색 대상: type, model, status, deviceId, location)
//   2. 가전이 없으면 device-empty에 "No registered devices" 메시지 표시
//   3. 필터 결과가 없으면 "No devices matched your filter." 메시지 표시
//   4. device-table <tbody>에 deviceId, type, model, location, status(badge) 표시
//   5. 각 행 클릭 시 selectDevice(deviceId)를 호출
//   6. 현재 선택된 가전(selectedDeviceId)은 "selected" 클래스를 추가
function renderDevices() {
    const emptyEl = document.getElementById("device-empty");
    const tableEl = document.getElementById("device-table");
    const tbody = document.getElementById("device-body");
    const search = document.getElementById("device-search").value.toLowerCase();
    const statusFilter = document.getElementById("device-status-filter").value;

    tbody.innerHTML = "";

    if (currentDevices.length === 0) {
        emptyEl.textContent = "No registered devices.";
        emptyEl.classList.remove("hidden");
        tableEl.classList.add("hidden");
        return;
    }

    const filtered = currentDevices.filter((d) => {
        const matchSearch =
            !search ||
            d.deviceId.toLowerCase().includes(search) ||
            d.type.toLowerCase().includes(search) ||
            d.model.toLowerCase().includes(search) ||
            d.location.toLowerCase().includes(search) ||
            d.status.toLowerCase().includes(search);
        const matchStatus = !statusFilter || d.status === statusFilter;
        return matchSearch && matchStatus;
    });

    if (filtered.length === 0) {
        emptyEl.textContent = "No devices matched your filter.";
        emptyEl.classList.remove("hidden");
        tableEl.classList.add("hidden");
        return;
    }

    emptyEl.classList.add("hidden");
    tableEl.classList.remove("hidden");

    filtered.forEach((d) => {
        const tr = document.createElement("tr");
        if (d.deviceId === selectedDeviceId) tr.classList.add("selected");
        tr.innerHTML = `
            <td>${d.deviceId}</td>
            <td>${d.type}</td>
            <td>${d.model}</td>
            <td>${d.location}</td>
            <td><span class="${badgeClass(d.status)}">${d.status}</span></td>
        `;
        tr.addEventListener("click", () => selectDevice(d.deviceId));
        tbody.appendChild(tr);
    });
}

// TODO [요구사항 #2-C]: 가전 클릭 시 상세 사용 현황을 조회하세요.
//
// 구현 순서:
//   1. selectedDeviceId를 업데이트하고 renderDevices()를 호출
//   2. GET /api/devices/{deviceId}/usage 를 호출
//   3. usage-empty를 숨기고 usage-detail을 표시
//   4. usage-info에 아래 정보를 표시:
//      - Device ID, Device Name, Power Status(badge),
//        Last Used, Total Usage Hours, Weekly Usage Count,
//        Health Status(badge), Remark
//   5. renderUsageChart(data.weeklyUsageTrend)를 호출
async function selectDevice(deviceId) {
    selectedDeviceId = deviceId;
    renderDevices();

    const res = await fetch(`/api/devices/${deviceId}/usage`);
    const data = await res.json();

    document.getElementById("usage-empty").classList.add("hidden");
    document.getElementById("usage-detail").classList.remove("hidden");

    document.getElementById("usage-info").innerHTML = `
        <div class="detail-item"><span class="detail-label">Device ID</span><span>${data.deviceId}</span></div>
        <div class="detail-item"><span class="detail-label">Device Name</span><span>${data.deviceName}</span></div>
        <div class="detail-item"><span class="detail-label">Power Status</span><span class="${badgeClass(data.powerStatus)}">${data.powerStatus}</span></div>
        <div class="detail-item"><span class="detail-label">Last Used</span><span>${data.lastUsedAt}</span></div>
        <div class="detail-item"><span class="detail-label">Total Usage Hours</span><span>${data.totalUsageHours}h</span></div>
        <div class="detail-item"><span class="detail-label">Weekly Usage Count</span><span>${data.weeklyUsageCount}</span></div>
        <div class="detail-item"><span class="detail-label">Health Status</span><span class="${badgeClass(data.healthStatus)}">${data.healthStatus}</span></div>
        <div class="detail-item"><span class="detail-label">Remark</span><span>${data.remark}</span></div>
    `;

    renderUsageChart(data.weeklyUsageTrend);
}

// TODO [요구사항 #2-D]: Chart.js를 사용하여 주간 사용량 Bar Chart를 그리세요.
//
// 구현 순서:
//   1. 기존 차트가 있으면 destroy() 호출
//   2. new Chart()로 Bar Chart를 생성
//      - labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
//      - data: trend 배열
//      - options: responsive, beginAtZero
//
// Hint:
//   usageChart = new Chart(ctx, { type: "bar", data: {...}, options: {...} });
function renderUsageChart(trend) {
    const ctx = document.getElementById("usageChart");

    if (usageChart) {
        usageChart.destroy();
    }

    usageChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            datasets: [{
                label: "Usage Count",
                data: trend,
                backgroundColor: "rgba(99, 102, 241, 0.6)",
                borderColor: "rgba(99, 102, 241, 1)",
                borderWidth: 1,
            }],
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true },
            },
        },
    });
}


// =============================================================================
// 이벤트 바인딩 + 초기화
// =============================================================================
function bindEvents() {
    document.getElementById("subscriber-search").addEventListener("input", renderSubscribers);
    document.getElementById("subscriber-status-filter").addEventListener("change", renderSubscribers);

    document.getElementById("device-search").addEventListener("input", renderDevices);
    document.getElementById("device-status-filter").addEventListener("change", renderDevices);
}

bindEvents();

fetchSubscribers();
