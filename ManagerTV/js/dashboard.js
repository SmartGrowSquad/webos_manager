const axios = require('axios');
const mainServerIP = 'http://192.168.29.181:8000';
import { changePage } from './app.js';
import { loadSettingData, saveSettingData } from './settingManager.js';

let updateInterval;

const showDashboardScreen = (selectedUserId) => {
    const root = document.getElementById('root');
    root.innerHTML = `
    <div class="dashboard-container">
        <div class="sidebar">
            <button class="sidebar-btn back-btn" id="btn-back">뒤로가기</button>
            <button class="sidebar-btn" id="btn-temperature">온습도</button>
            <button class="sidebar-btn" id="btn-growth">성장률</button>
            <button class="sidebar-btn" id="btn-sales">판매기록</button>
            <button class="sidebar-btn" id="btn-inven">재고</button>
            <button class="sidebar-btn" id="btn-settings">설정</button>
        </div>
        <div class="content" id="content-area">
        </div>
        <div id="toast" class="toast"></div>
    </div>
    `;

    axios.post(mainServerIP + "/growth", { 
        uId: selectedUserId,
    })
    .then(response => {
        console.log('Growth Data:', response.data); // 서버로부터 받은 데이터 출력
    })
    .catch(error => {
        console.error('Error fetching climate data:', error);
    });

    // 기본 콘텐츠 로드
    loadContent("온습도", null, null);
    clearInterval(updateInterval); // 기존 interval 제거
    updateInterval = setInterval(() => {
        loadContent("온습도", null, null);
    }, 60000); // 1분 (60000ms)

    // 페이지 이동 시 interval을 제거
    document.getElementById('btn-back').addEventListener('click', () => {
        clearInterval(updateInterval);
        changePage('user'); // 사용자 페이지로 이동
    });

    document.getElementById('btn-temperature').addEventListener('click', () => {
        clearInterval(updateInterval);
        loadContent("온습도", null, null);
        updateInterval = setInterval(() => {
            loadContent("온습도", null, null);
        }, 60000);
    });

    document.getElementById('btn-growth').addEventListener('click', () => {
        clearInterval(updateInterval);
        loadContent('성장률', null, selectedUserId); // 성장률 섹션 로드
    });

    document.getElementById('btn-sales').addEventListener('click', () => {
        clearInterval(updateInterval);
        loadContent('판매기록', null, selectedUserId); // 판매 기록 섹션 로드
    });

    document.getElementById('btn-inven').addEventListener('click', () => {
        clearInterval(updateInterval);
        loadContent('재고', null, selectedUserId); // 재고 섹션 로드
    });

    document.getElementById('btn-settings').addEventListener('click', () => {
        clearInterval(updateInterval);
        loadContent('설정', null); // 설정 섹션 로드
    });
};

// 콘텐츠를 동적으로 로드하는 함수
const loadContent = (section, monitoringData, selectedUserId) => {
    const contentArea = document.getElementById('content-area');
    
    if (section === '온습도') {
        contentArea.innerHTML = `
        <h1>온습도</h1>
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
    
        // 더미 데이터
        const dummyData = {
            temperature: [21, 31, 25, 33, 29, 26, 32, 28, 27, 33, 35, 30, 25, 32, 28, 34, 26, 30, 29, 31, 27, 28, 30, 31, 34, 29, 32, 33, 26, 28, 35, 27, 29, 32, 31, 30, 28, 27, 29, 34, 33, 31, 30, 27, 35, 32, 29, 31, 30, 34],
            humidity: [33, 33, 30, 28, 35, 31, 32, 33, 29, 28, 26, 30, 33, 29, 32, 27, 35, 28, 30, 33, 32, 34, 31, 33, 29, 28, 31, 32, 27, 35, 30, 29, 31, 28, 34, 32, 33, 30, 29, 27, 28, 32, 30, 31, 34, 33, 27, 28, 29, 32]
        };
    
        // 기준 온도를 설정하고 경고 메시지 처리 (임의의 기준 온도 설정)
        const thresholdTemperature = 30;
        if (dummyData.temperature[0] > thresholdTemperature) {
            document.getElementById('warning').textContent = 'Warning: High Temperature!';
        } else {
            document.getElementById('warning').textContent = '';
        }
    
        // 온도 그래프 그리기
        const tempCtx = document.getElementById('temperatureGraph').getContext('2d');
        new Chart(tempCtx, {
            type: 'line',
            data: {
                labels: dummyData.temperature.map((_, i) => i + 1).reverse(),
                datasets: [{
                    label: '온도 (°C)',
                    data: dummyData.temperature.slice().reverse(),
                    borderColor: 'red',
                    fill: false,
                    tension: 0.5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                scales: {
                    y: {
                        min: 10,
                        max: 40, // 더미 데이터에 맞게 범위를 10~40으로 설정
                    }
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
                labels: dummyData.humidity.map((_, i) => i + 1).reverse(),
                datasets: [{
                    label: '습도 (%)',
                    data: dummyData.humidity.slice().reverse(),
                    borderColor: 'blue',
                    fill: false,
                    tension: 0.5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                scales: {
                    y: {
                        min: 0,
                        max: 100, // 습도는 0~100 범위
                    }
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
    } else if (section === '성장률') {
        contentArea.innerHTML = `
        <h1>성장률</h1>
        <div class="growth-container">
            <div class="growth-grid" id="growthGrid"></div>
            <div class="growth_page-buttons">
                <button id="prevPageButton">이전</button>
                <button id="nextPageButton">다음</button>
            </div>
        </div>
        `;
    
        // 서버에 selectedUserId를 사용하여 데이터를 요청
        axios.post(mainServerIP + "/growth", { 
            uId: selectedUserId 
        })
        .then(response => {
            console.log('Selected User ID:', selectedUserId); // selectedUserId 출력
            const results = response.data.results;
            console.log('Results:', results); // 서버로부터 받은 데이터를 출력
        
            // selectedUserId와 일치하는 u_id 데이터를 필터링
            const filteredResults = results.filter(item => item.u_id === selectedUserId && item.growth !== null);
        
            console.log('Filtered Results:', filteredResults); // 필터링된 결과를 출력
        
            if (!filteredResults || filteredResults.length === 0) {
                throw new Error(`No valid growth data found for user ${selectedUserId}`);
            }
    
            // u_id별로 데이터를 그룹화
            const groupedResults = filteredResults.reduce((acc, item) => {
                if (!acc[item.u_id]) acc[item.u_id] = [];
                acc[item.u_id].push(item);
                return acc;
            }, {});
    
            // 각 u_id 그룹의 데이터를 날짜순으로 정렬
            Object.keys(groupedResults).forEach(u_id => {
                groupedResults[u_id].sort((a, b) => new Date(a.predictDate) - new Date(b.predictDate));
            });
    
            const growthPerPage = 2; // 한 페이지에 최대 2개씩 표시 (2x1 그리드)
            let currentPage = 0;
    
            const renderGrowthGrid = (page) => {
                const growthGrid = document.getElementById('growthGrid');
                growthGrid.innerHTML = ''; // 그리드를 초기화
    
                // 페이지의 시작 인덱스와 끝 인덱스를 계산
                const startIndex = page * growthPerPage;
                const endIndex = Math.min(startIndex + growthPerPage, Object.keys(groupedResults).length);
    
                // 현재 페이지에 표시할 u_id 그룹을 선택
                const currentUids = Object.keys(groupedResults).slice(startIndex, endIndex);
    
                currentUids.forEach((u_id, index) => {
                    const growthDiv = document.createElement('div');
                    growthDiv.classList.add('growth-item');
                    const latestDate = new Date(groupedResults[u_id][groupedResults[u_id].length - 1].predictDate).toISOString().split('T')[0];
                
                    // 최신의 predictDate를 예상일로 표시
                    growthDiv.innerHTML = `<h3>Jig: ${groupedResults[u_id][0].jignum}, 예상일: ${latestDate}</h3>`;
                    growthGrid.appendChild(growthDiv);
                    growthGrid.appendChild(growthDiv);
    
                    // 캔버스 생성 및 고유 ID 설정
                    const canvas = document.createElement('canvas');
                    canvas.id = `growthCanvas_${page}_${index}`;  // 페이지 및 인덱스를 포함한 고유 ID
                    growthDiv.appendChild(canvas);
    
                    const growthCtx = document.getElementById(`growthCanvas_${page}_${index}`).getContext('2d');
    
                    // u_id 그룹의 성장률 데이터를 날짜 기준으로 정렬된 상태에서 준비
                    const growthData = groupedResults[u_id].map(item => item.growth);
                    const labels = groupedResults[u_id].map(item => new Date(item.predictDate).toISOString().split('T')[0]);
    
                    new Chart(growthCtx, {
                        type: 'line',
                        data: {
                            labels: labels, // X축 레이블 날짜 순
                            datasets: [{
                                label: '성장률 (%)',
                                data: growthData,  // 성장률 데이터
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
                const emptySlots = growthPerPage - currentUids.length;
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
                if (currentPage < Math.ceil(Object.keys(groupedResults).length / growthPerPage) - 1) {
                    currentPage++;
                    renderGrowthGrid(currentPage);
                }
            });
    
            renderGrowthGrid(currentPage); // 첫 번째 페이지 렌더링
        })
        .catch(error => {
            console.error('Error loading growth data:', error);
            showToast('성장률 데이터를 불러오는 중 오류가 발생했습니다.');
        });
    }
    
     else if (section === '판매기록') {
        const itemsPerPage = 12; // 한 페이지에 보여줄 항목 수
        let currentPage = 0;

        contentArea.innerHTML = `
            <h1>판매기록</h1>
            <table id="salesTable" class="data-table">
                <thead>
                    <tr>
                        <th>판매일</th>
                        <th>판매시간</th>
                        <th>품목</th>
                        <th>수량</th>
                    </tr>
                </thead>
                <tbody id="salesRecords"></tbody>
            </table>
            <div class="page-buttons">
                <button id="prevPageButton" disabled>이전</button>
                <button id="nextPageButton" disabled>다음</button>
            </div>
        `;
        
        axios.post(mainServerIP + "/puchase", { uId: selectedUserId })
            .then(response => {
                const resultsArray = response.data.results.filter(item => item.status === 1); // 판매기록
                const totalPages = Math.ceil(resultsArray.length / itemsPerPage);
                
                const renderSalesRecords = (page) => {
                    const salesContainer = document.getElementById('salesRecords');
                    salesContainer.innerHTML = ''; // 기존 내용 초기화
                    
                    const startIndex = page * itemsPerPage;
                    const endIndex = Math.min(startIndex + itemsPerPage, resultsArray.length);
                    const currentSales = resultsArray.slice(startIndex, endIndex);
                    
                    currentSales.forEach(sale => {
                        const saleRow = document.createElement('tr');
                        
                        // 날짜와 시간 분리
                        const dateTime = sale.updated_at.split('T');
                        const sales_date = dateTime[0];
                        const time = dateTime[1].split('.')[0];
                        
                        saleRow.innerHTML = `
                            <td>${sales_date}</td>
                            <td>${time}</td>
                            <td>${sale.name}</td>
                            <td>${sale.amount}</td>
                        `;
                        salesContainer.appendChild(saleRow);
                    });

                    // 이전 버튼 활성화/비활성화
                    document.getElementById('prevPageButton').disabled = page === 0;
                    // 다음 버튼 활성화/비활성화
                    document.getElementById('nextPageButton').disabled = page >= totalPages - 1;
                };

                renderSalesRecords(currentPage); // 초기 페이지 렌더링

                // 페이지 전환 버튼
                document.getElementById('prevPageButton').addEventListener('click', () => {
                    if (currentPage > 0) {
                        currentPage--;
                        renderSalesRecords(currentPage);
                    }
                });

                document.getElementById('nextPageButton').addEventListener('click', () => {
                    if (currentPage < totalPages - 1) {
                        currentPage++;
                        renderSalesRecords(currentPage);
                    }
                });
            })
            .catch(error => {
                console.error('Error loading sales data:', error);
                showToast('판매기록 데이터를 불러오는 중 오류가 발생했습니다.');
            });

    // 재고 섹션
    } else if (section === '재고') {
        const itemsPerPage = 12; // 한 페이지에 보여줄 항목 수
        let currentPage = 0;

        contentArea.innerHTML = `
            <h1>재고</h1>
            <table id="inventoryTable" class="data-table">
                <thead>
                    <tr>
                        <th>등록일</th>
                        <th>품목</th>
                        <th>재고량</th>
                    </tr>
                </thead>
                <tbody id="inventoryRecords"></tbody>
            </table>
            <div class="page-buttons">
                <button id="prevPageButton" disabled>이전</button>
                <button id="nextPageButton" disabled>다음</button>
            </div>
        `;
        
        axios.post(mainServerIP + "/puchase", { uId: selectedUserId })
            .then(response => {
                const resultsArray = response.data.results.filter(item => item.status !== 1); // 재고
                const totalPages = Math.ceil(resultsArray.length / itemsPerPage);

                const renderInventoryRecords = (page) => {
                    const inventoryContainer = document.getElementById('inventoryRecords');
                    inventoryContainer.innerHTML = ''; // 기존 내용 초기화
                    
                    const startIndex = page * itemsPerPage;
                    const endIndex = Math.min(startIndex + itemsPerPage, resultsArray.length);
                    const currentInventory = resultsArray.slice(startIndex, endIndex);
                    
                    currentInventory.forEach(inventory => {
                        const inventoryRow = document.createElement('tr');

                        const dateTime = inventory.created_at.split('T');
                        const inven_date = dateTime[0];
                        
                        inventoryRow.innerHTML = `
                            <td>${inven_date}</td>
                            <td>${inventory.name}</td>
                            <td>${inventory.amount}</td>
                        `;
                        inventoryContainer.appendChild(inventoryRow);
                    });

                    // 이전 버튼 활성화/비활성화
                    document.getElementById('prevPageButton').disabled = page === 0;
                    // 다음 버튼 활성화/비활성화
                    document.getElementById('nextPageButton').disabled = page >= totalPages - 1;
                };

                renderInventoryRecords(currentPage); // 초기 페이지 렌더링

                // 페이지 전환 버튼
                document.getElementById('prevPageButton').addEventListener('click', () => {
                    if (currentPage > 0) {
                        currentPage--;
                        renderInventoryRecords(currentPage);
                    }
                });

                document.getElementById('nextPageButton').addEventListener('click', () => {
                    if (currentPage < totalPages - 1) {
                        currentPage++;
                        renderInventoryRecords(currentPage);
                    }
                });
            })
            .catch(error => {
                console.error('Error loading inventory data:', error);
                showToast('재고 데이터를 불러오는 중 오류가 발생했습니다.');
            });
    } else if (section === '설정') {
        contentArea.innerHTML = `
            <h1>설정</h1>
            <div class="settings-container">
                <p id="currentThreshold"></p>
                <div id="editSection">
                    <input type="number" id="newThreshold" min="0" max="100" />
                    <button id="saveSetting">Save</button>
                </div>
            </div>
        `;
    
        // 설정 데이터 로드
        loadSettingData(selectedUserId).then(settingData => {
            // 현재 설정된 임계 온도를 표시
            const currentThreshold = settingData.thresholdTemperature || 30; // 기본값 30도
            document.getElementById('currentThreshold').textContent = `알림 온도: ${currentThreshold}°C`;
            document.getElementById('newThreshold').value = currentThreshold;
        });
    
        // 설정 저장 버튼 이벤트 리스너
        document.getElementById('saveSetting').addEventListener('click', () => {
            const newThreshold = parseInt(document.getElementById('newThreshold').value, 10);
    
            if (isNaN(newThreshold)) {
                showToast('Please enter a valid number.');
                return;
            }
    
            // 새로운 설정 값을 저장
            saveSettingData(selectedUserId, { thresholdTemperature: newThreshold });
    
            // 변경된 설정 값을 화면에 표시
            document.getElementById('currentThreshold').textContent = `설정 온도: ${newThreshold}°C`;
            showToast('Threshold updated successfully.');
        });
    }
    
};

// Toast 메시지를 표시하는 함수
const showToast = (message) => {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000); // 2초 후에 사라짐
};

export default showDashboardScreen;
