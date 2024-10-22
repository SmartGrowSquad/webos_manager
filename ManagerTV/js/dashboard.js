const showDashboardScreen = (monitoringData, loggedInUsername, userName) => {
    const root = document.getElementById('root');
    root.innerHTML = `
        <div class="dashboard-container">
            <div class="sidebar">
                <button class="sidebar-btn" id="btn-temperature">온습도</button>
                <button class="sidebar-btn" id="btn-growth">성장률</button>
                <button class="sidebar-btn" id="btn-sales">판매기록</button>
                <button class="sidebar-btn" id="btn-settings">설정</button>
            </div>
            <div class="content" id="content-area">
                <h2>대시보드에 오신 것을 환영합니다.</h2>
                <p>왼쪽 메뉴에서 항목을 선택하세요.</p>
            </div>
            <div id="toast" class="toast"></div> <!-- Toast 알림을 위한 div -->
        </div>
    `;

    // 버튼 클릭 시 컨텐츠를 변경하는 이벤트 리스너 설정
    document.getElementById('btn-temperature').addEventListener('click', () => {
        loadContent('온습도', monitoringData, loggedInUsername, userName);
    });
    document.getElementById('btn-growth').addEventListener('click', () => {
        loadContent('성장률');
    });
    document.getElementById('btn-sales').addEventListener('click', () => {
        loadContent('판매기록');
    });
    document.getElementById('btn-settings').addEventListener('click', () => {
        loadContent('설정');
    });
};

// 컨텐츠를 동적으로 변경하는 함수
const loadContent = (section, monitoringData, loggedInUsername, userName) => {
    const contentArea = document.getElementById('content-area');
    
    if (section === '온습도') {
        contentArea.innerHTML = `
            <div class="monitoring-container">
                <div class="graph-container graph-left">
                    <canvas id="temperatureGraph"></canvas>
                </div>
                <div class="graph-container graph-right">
                    <canvas id="humidityGraph"></canvas>
                </div>
                <p id="warning" class="warning"></p>
            </div>
        `;

        // 기준 온도를 설정하고 경고 메시지 처리
        fetch('./data/settingData.json')
            .then(response => response.json())
            .then(settingData => {
                const thresholdTemperature = settingData[loggedInUsername][userName].thresholdTemperature;
                if (monitoringData.temperature[49] > thresholdTemperature) {
                    document.getElementById('warning').textContent = 'Warning: High Temperature!';
                } else {
                    document.getElementById('warning').textContent = '';
                }
            })
            .catch(error => console.error('Error loading setting data:', error));

        // 온도 그래프 그리기
        const tempCtx = document.getElementById('temperatureGraph').getContext('2d');
        new Chart(tempCtx, {
            type: 'line',
            data: {
                labels: monitoringData.temperature.map((_, i) => i + 1).reverse(),
                datasets: [{
                    label: 'Temperature (°C)',
                    data: monitoringData.temperature.reverse(),
                    borderColor: 'red',
                    fill: false,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

        // 습도 그래프 그리기
        const humCtx = document.getElementById('humidityGraph').getContext('2d');
        new Chart(humCtx, {
            type: 'line',
            data: {
                labels: monitoringData.humidity.map((_, i) => i + 1).reverse(),
                datasets: [{
                    label: 'Humidity (%)',
                    data: monitoringData.humidity.reverse(),
                    borderColor: 'blue',
                    fill: false,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    } else if (section === '성장률') {
        contentArea.innerHTML = `
            <h3>성장률</h3>
            <p>성장률: 75%</p>
        `;
    } else if (section === '판매기록') {
        contentArea.innerHTML = `
            <h3>판매기록</h3>
            <p>이번 달 판매량: 100</p>
        `;
    } else if (section === '설정') {
        contentArea.innerHTML = `
            <h3>설정</h3>
            <button>설정 변경</button>
        `;
    }
};

// 초기 화면을 대시보드로 설정
export default showDashboardScreen;
