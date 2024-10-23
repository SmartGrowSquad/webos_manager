let updateInterval;

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
    clearInterval(updateInterval); // 기존 interval이 있으면 제거
    updateInterval = setInterval(() => {
        loadContent('온습도', monitoringData, loggedInUsername, userName);
    }, 60000); // 1분마다 업데이트

    // 페이지 이동 시 interval을 제거하고 새로운 섹션에 대해 설정
    document.getElementById('btn-back').addEventListener('click', () => {
        clearInterval(updateInterval); // interval 제거
        changePage('user');
    });

    document.getElementById('btn-temperature').addEventListener('click', () => {
        clearInterval(updateInterval); // interval 제거
        loadContent('온습도', monitoringData, loggedInUsername, userName);
        // 1분마다 데이터를 업데이트
        updateInterval = setInterval(() => {
            loadContent('온습도', monitoringData, loggedInUsername, userName);
        }, 60000); // 1분 (60000ms)
    });

    document.getElementById('btn-growth').addEventListener('click', () => {
        clearInterval(updateInterval); // interval 제거
        loadContent('성장률', null, loggedInUsername, userName);
        // 1분마다 데이터를 업데이트
        updateInterval = setInterval(() => {
            loadContent('성장률', null, loggedInUsername, userName);
        }, 60000); // 1분 (60000ms)
    });

    document.getElementById('btn-sales').addEventListener('click', () => {
        clearInterval(updateInterval); // interval 제거
        loadContent('판매기록', null, loggedInUsername, userName);
        // 1분마다 데이터를 업데이트
        updateInterval = setInterval(() => {
            loadContent('판매기록', null, loggedInUsername, userName);
        }, 60000); // 1분 (60000ms)
    });

    document.getElementById('btn-settings').addEventListener('click', () => {
        clearInterval(updateInterval); // interval 제거
        loadContent('설정', monitoringData, loggedInUsername, userName);
        // 설정 페이지는 1분마다 업데이트가 필요 없으니 setInterval 생략
    });
};

// 컨텐츠를 동적으로 변경하는 함수
const loadContent = (section, monitoringData, loggedInUsername, userName) => {
    const contentArea = document.getElementById('content-area');
    
    if (section === '온습도') {
        contentArea.innerHTML = `
        <h1>온습도 (${userName})</h1>
            <p id="warning" class="warning"></p>
            <div class="monitoring-container">
                <div class="graph-container graph-left">
                    <canvas id="temperatureGraph"></canvas>
                </div>
                <div class="graph-container graph-right">
                    <canvas id="humidityGraph"></canvas>
                </div>
                
            </div>
        `;

        // 데이터를 다시 가져오는 함수
        const fetchMonitoringData = () => {
            fetch('http://localhost:3000/monitoring-data') // 데이터를 다시 가져옴
                .then(response => response.json())
                .then(data => {
                    // 선택적 체이닝 대신 조건문으로 데이터 유효성 검사
                    let userMonitoringData = null;
                    if (data && data[loggedInUsername]) {
                        userMonitoringData = data[loggedInUsername].find(user => user.name === userName);
                    }

                    if (!userMonitoringData) {
                        console.error('Invalid monitoring data');
                        return;
                    }

                    // 기준 온도를 설정하고 경고 메시지 처리
                    fetch('http://localhost:3000/setting-data')
                        .then(response => response.json())
                        .then(settingData => {
                            const thresholdTemperature = settingData[loggedInUsername][userName].thresholdTemperature;
                            if (userMonitoringData.monitoring.temperature[0] > thresholdTemperature) {
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
                            labels: userMonitoringData.monitoring.temperature.map((_, i) => i + 1).reverse(),
                            datasets: [{
                                label: '온도 (°C)',
                                data: userMonitoringData.monitoring.temperature.slice().reverse(),
                                borderColor: 'red',
                                fill: false,
                                tension: 0.5
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            animation: false,
                            y: {
                                min: 10,
                                max: 30,
                            },
                            plugins: {
                                legend: {
                                    labels: {
                                        font: {
                                            size: 18
                                        }
                                    }
                                }
                            }
                        }
                    });

                    // 습도 그래프 그리기
                    const humCtx = document.getElementById('humidityGraph').getContext('2d');
                    new Chart(humCtx, {
                        type: 'line',
                        data: {
                            labels: userMonitoringData.monitoring.humidity.map((_, i) => i + 1).reverse(),
                            datasets: [{
                                label: '습도 (%)',
                                data: userMonitoringData.monitoring.humidity.slice().reverse(),
                                borderColor: 'blue',
                                fill: false,
                                tension: 0.5
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            animation: false,
                            y: {
                                min: 0,
                                max: 100,
                            },
                            plugins: {
                                legend: {
                                    labels: {
                                        font: {
                                            size: 18
                                        }
                                    }
                                }
                            }
                        }
                    });
                })
                .catch(error => console.error('Error loading monitoring data:', error));
        };

        // 페이지가 로드될 때 데이터를 가져옴
        fetchMonitoringData();
    } else if (section === '성장률') {
        contentArea.innerHTML = `
        <h1>성장률 (${userName})</h1>
        <div class="growth-container">
            <div class="growth-grid" id="growthGrid"></div>
            <div class="growth_page-buttons">
                <button id="prevPageButton">이전</button>
                <button id="nextPageButton">다음</button>
            </div>
        </div>
        `;
    
        fetch('http://localhost:3000/growth-data')
            .then(response => response.json())
            .then(growthData => {
                // loggedInUsername에 따라 admin 또는 user 데이터를 가져옴
                const userGroup = growthData[loggedInUsername];
    
                if (!userGroup) {
                    throw new Error(`No data found for ${loggedInUsername}`);
                }
    
                // userName에 해당하는 데이터를 찾음
                const user = userGroup.find(user => user.name === userName);
    
                if (!user) {
                    throw new Error(`No growth data found for ${userName}`);
                }
    
                const growthKeys = Object.keys(user.growth);
                const growthPerPage = 2; // 한 페이지에 최대 4개씩 표시 (2x2 그리드)
                let currentPage = 0;
    
                const renderGrowthGrid = (page) => {
                    const growthGrid = document.getElementById('growthGrid');
                    growthGrid.innerHTML = ''; // 그리드를 초기화
                
                    const startIndex = page * growthPerPage;
                    const endIndex = Math.min(startIndex + growthPerPage, growthKeys.length);
                    const currentGrowth = growthKeys.slice(startIndex, endIndex);
                
                    currentGrowth.forEach((growthId, index) => {
                        const growthItem = document.createElement('div');
                        growthItem.classList.add('growth-item');
                        growthItem.innerHTML = `<h3>${growthId}</h3>`;
                        growthGrid.appendChild(growthItem);
                    
                        // 캔버스 생성 및 고유 ID 설정
                        const canvas = document.createElement('canvas');
                        canvas.id = `growthCanvas_${page}_${index}`;  // 페이지 및 인덱스를 포함한 고유 ID
                        growthItem.appendChild(canvas);
                    
                        const growthCtx = document.getElementById(`growthCanvas_${page}_${index}`).getContext('2d');
                        
                        new Chart(growthCtx, {
                            type: 'line',
                            data: {
                                labels: Array.from({ length: user.growth[growthId].length }, (_, i) => i + 1),
                                datasets: [{
                                    label: '성장률 (%)',
                                    data: user.growth[growthId].slice().reverse(),  // 데이터를 역순으로 처리
                                    borderColor: 'green',
                                    fill: false,
                                    tension: 0.5
                                }]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                    y: {
                                        min: 0,
                                        max: 100
                                    }
                                }
                            }
                        });
                    });
                
                    // 빈 공간 채우기
                    const emptySlots = growthPerPage - currentGrowth.length;
                    for (let i = 0; i < emptySlots; i++) {
                        const emptyItem = document.createElement('div');
                        emptyItem.classList.add('growth-item', 'empty');
                        growthGrid.appendChild(emptyItem);
                    }
                };
                
    
                // 페이지 전환
                document.getElementById('prevPageButton').addEventListener('click', () => {
                    if (currentPage > 0) {
                        currentPage--;
                        renderGrowthGrid(currentPage);
                    }
                });
    
                document.getElementById('nextPageButton').addEventListener('click', () => {
                    if (currentPage < Math.ceil(growthKeys.length / growthPerPage) - 1) {
                        currentPage++;
                        renderGrowthGrid(currentPage);
                    }
                });
    
                renderGrowthGrid(currentPage);
            })
            .catch(error => {
                console.error('Error loading growth data:', error);
                showToast('성장률 데이터를 불러오는 중 오류가 발생했습니다.');
            });
    } else if (section === '판매기록') {
        contentArea.innerHTML = `
            <h1>판매기록 (${userName})</h1>
            <div id="salesRecords"></div>
            <div class="page-buttons">
                <button id="prevPageButton">이전</button>
                <button id="nextPageButton">다음</button>
            </div>
        `;
    
        fetch('http://localhost:3000/sales-data')
            .then(response => response.json())
            .then(salesData => {
                const userSales = salesData[loggedInUsername][userName];
                const salesContainer = document.getElementById('salesRecords');
                const salesPerPage = 20; // 한 페이지에 최대 10개 표시
                let currentPage = 0;
    
                const renderSalesRecords = (page) => {
                    salesContainer.innerHTML = ''; // 기존 내용 초기화
    
                    const startIndex = page * salesPerPage;
                    const endIndex = Math.min(startIndex + salesPerPage, userSales.length);
                    const currentSales = userSales.slice(startIndex, endIndex);
    
                    currentSales.forEach(sale => {
                        const saleElement = document.createElement('p');
                        saleElement.textContent = `${sale.date}: ${sale.plantName}`;
                        salesContainer.appendChild(saleElement);
                    });
    
                    // 이전 버튼 활성화
                    document.getElementById('prevPageButton').disabled = page === 0;
    
                    // 다음 버튼 활성화
                    document.getElementById('nextPageButton').disabled = endIndex >= userSales.length;
                };
    
                // 페이지 전환 버튼 클릭 이벤트 리스너
                document.getElementById('prevPageButton').addEventListener('click', () => {
                    if (currentPage > 0) {
                        currentPage--;
                        renderSalesRecords(currentPage);
                    }
                });
    
                document.getElementById('nextPageButton').addEventListener('click', () => {
                    if ((currentPage + 1) * salesPerPage < userSales.length) {
                        currentPage++;
                        renderSalesRecords(currentPage);
                    }
                });
    
                renderSalesRecords(currentPage); // 초기 렌더링
            })
            .catch(error => console.error('Error loading sales data:', error));
    }  else if (section === '설정') {
        contentArea.innerHTML = `
            <div class="settings-container">
                <h1>설정 (${userName})</h1>
                <p id="currentThreshold"></p>
                <div id="editSection">
                    <input type="number" id="newThreshold" min="0" max="100" />
                    <button id="saveSetting">Save</button>
                </div>
            </div>
        `;

        // 기준 온도 가져오기 및 표시
        fetch('http://localhost:3000/setting-data')
            .then(response => response.json())
            .then(settingData => {
                const currentThreshold = settingData[loggedInUsername][userName].thresholdTemperature;
                document.getElementById('currentThreshold').textContent = `알림 온도: ${currentThreshold}°C`;
                document.getElementById('newThreshold').value = currentThreshold; // 기존 값을 input에 표시

                // 저장 버튼 클릭 시 새로운 값을 서버에 저장
                document.getElementById('saveSetting').addEventListener('click', () => {
                    const newThreshold = parseInt(document.getElementById('newThreshold').value, 10); // 숫자로 변환
                    
                    if (isNaN(newThreshold)) {
                        showToast('Please enter a valid number.');
                        return;
                    }
                    
                    // JSON 데이터 업데이트 요청
                    const updatedSettingData = { ...settingData };
                    updatedSettingData[loggedInUsername][userName].thresholdTemperature = newThreshold;

                    fetch('http://localhost:3000/update-settings', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(updatedSettingData)
                    })
                    .then(response => {
                        if (response.ok) {
                            document.getElementById('currentThreshold').textContent = `설정 온도: ${newThreshold}°C`;
                            showToast('Threshold updated successfully.');
                        } else {
                            throw new Error('Failed to save settings.');
                        }
                    })
                    .catch(error => console.error('Error saving setting data:', error));
                });
            })
            .catch(error => console.error('Error loading setting data:', error));
    }
};

// Toast 알림 표시 함수
const showToast = (message) => {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show'); // Toast 표시

    setTimeout(() => {
        toast.classList.remove('show'); // Toast 숨기기
    }, 2000); // 2초 후 Toast가 사라짐
};


// 초기 화면을 대시보드로 설정
export default showDashboardScreen;
