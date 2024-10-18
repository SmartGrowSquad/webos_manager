import showSettingModal from './setting.js';

const showMonitoringScreen = (monitoringData, loggedInUsername, userName) => {
    const root = document.getElementById('root');
    root.innerHTML = `
        <div class="monitoring-container">
            <button id="backButton" class="back-button">
                <img src="./img/back.svg" alt="Back Button" class="button-image">
            </button>
            <div class="graph-container graph-left">
                <canvas id="temperatureGraph"></canvas>
            </div>
            <div class="graph-container graph-right">
                <canvas id="humidityGraph"></canvas>
            </div>
            <p id="warning" class="warning"></p>
            <button id="settingButton" class="setting-button">Setting</button>
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

    // 뒤로가기 버튼 클릭 시 user.js로 이동
    document.getElementById('backButton').addEventListener('click', () => {
        changePage('user');
    });

    // 온도 그래프 그리기
    const tempCtx = document.getElementById('temperatureGraph').getContext('2d');
    new Chart(tempCtx, {
        type: 'line',
        data: {
            labels: monitoringData.temperature.map((_, i) => i + 1).reverse(), // X축에 시간 또는 인덱스 (리버스)
            datasets: [{
                label: 'Temperature (°C)',
                data: monitoringData.temperature.reverse(), // 온도 데이터도 리버스
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
            labels: monitoringData.humidity.map((_, i) => i + 1).reverse(), // X축에 시간 또는 인덱스 (리버스)
            datasets: [{
                label: 'Humidity (%)',
                data: monitoringData.humidity.reverse(), // 습도 데이터도 리버스
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

    // Setting 버튼 클릭 시 setting.js의 showSettingModal 함수 호출
    document.getElementById('settingButton').addEventListener('click', () => {
        showSettingModal(loggedInUsername, userName); // 팝업을 띄움
    });
};

// showMonitoringScreen 함수를 기본으로 내보내기
export default showMonitoringScreen;
