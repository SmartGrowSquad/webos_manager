const showDashboardScreen = (monitoringData, loggedInUsername, userName) => {
    const root = document.getElementById('root');
    root.innerHTML = `
        <div class="dashboard-container">
            <div class="sidebar">
                <button class="sidebar-btn back-btn" id="btn-back">뒤로가기</button>
                <button class="sidebar-btn" id="btn-temperature">온습도</button>
                <button class="sidebar-btn" id="btn-growth">성장률</button>
                <button class="sidebar-btn" id="btn-sales">판매기록</button>
                <button class="sidebar-btn" id="btn-settings">설정</button>
            </div>
            <div class="content" id="content-area">
            </div>
            <div id="toast" class="toast"></div>
        </div>
    `;

    loadContent('온습도', monitoringData, loggedInUsername, userName);

    // 버튼 클릭 시 컨텐츠를 변경하는 이벤트 리스너 설정
    document.getElementById('btn-back').addEventListener('click', () => {
        changePage('user');
    });
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
            <div class="monitoring-container">
                <div class="graph-container graph-left">
                    <canvas id="growGraph"></canvas>
                </div>
            </div>
        `
        const growCtx = document.getElementById("grwoGraph").getContext('2d');
        new Chart(growCtx, {
            type: "line",
            data: {
                labels: monitoringData.grow.map((_, i) => i + 1).reverse(),
                datasets: [{
                    label: 'Grow (%)',
                    data: monitoringData.grow.reverse(),
                    borderColor: 'green',
                    fill: false,
                    tension: 0.1
                }]
            }
        });
    } else if (section === '판매기록') {
        contentArea.innerHTML = `
        `;
    } else if (section === '설정') {
        contentArea.innerHTML = `
            <div class="modal-content">
                <h2>Settings for ${userName}</h2>
                <p id="currentThreshold"></p>
                <button id="editButton">Edit Threshold</button>
                <div id="editSection" style="display: none;">
                    <input type="number" id="newThreshold" min="0" max="100" />
                </div>
                <div class="modal-buttons">
                    <button id="closeModal">Close</button>
                    <button id="saveSetting">Save</button>
                </div>
            </div>
        `;
    }

    fetch('./data/settingData.json')
        .then(response => response.json())
        .then(settingData => {
            const currentThreshold = settingData[loggedInUsername][userName].thresholdTemperature;
            document.getElementById('currentThreshold').textContent = `Current Threshold: ${currentThreshold}°C`;

            // Edit 버튼 클릭 시 수정 가능
            document.getElementById('editButton').addEventListener('click', () => {
                document.getElementById('editSection').style.display = 'block';
            });

            // Close 버튼 클릭 시 모달 닫기
            document.getElementById('closeModal').addEventListener('click', () => {
                root.removeChild(modalOverlay);
            });

            // Save 버튼 클릭 시 새로운 값 저장
            document.getElementById('saveSetting').addEventListener('click', () => {
                const newThreshold = document.getElementById('newThreshold').value;

                if (newThreshold >= 0 && newThreshold <= 100) {
                    // JSON 업데이트 후 저장 (서버가 처리하는 방식으로 가정)
                    settingData[loggedInUsername][userName].thresholdTemperature = parseInt(newThreshold);

                    fetch('./saveSettings', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(settingData)
                    })
                    .then(() => {
                        alert('Threshold updated successfully!');
                        root.removeChild(modalOverlay); // 설정 완료 후 모달 닫기
                    })
                    .catch(error => console.error('Error saving setting data:', error));
                } else {
                    alert('Please enter a valid temperature (0-100°C).');
                }
            });
        })
        .catch(error => console.error('Error loading setting data:', error));
};

// 초기 화면을 대시보드로 설정
export default showDashboardScreen;
