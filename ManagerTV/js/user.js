const showUserScreen = (loggedInUsername) => {
    const root = document.getElementById('root');
    root.innerHTML = `
        <div class="user-container">
            <h2>User Management</h2>
            <div class="user-grid" id="userGrid"></div>
            <div class="page-buttons">
                <button id="prevPageButton">
                    <img src="./img/right.svg" alt="Previous" class="button-image">
                </button>
                <button id="nextPageButton">
                    <img src="./img/left.svg" alt="Next" class="button-image">
                </button>
            </div>
        </div>
    `;

    const usersPerPage = 4; // 2x2 그리드
    let currentPage = 0;

    // JSON 데이터를 동적으로 가져와서 표시
    Promise.all([
        fetch('./data/userData.json').then(response => response.json()),
        fetch('./data/settingData.json').then(response => response.json()) // 기준 온도 데이터 가져오기
    ])
    .then(([userData, settingData]) => {
        const filteredUsers = userData[loggedInUsername]; // username에 해당하는 사용자만 가져오기
        const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
        
        const renderUsers = (page) => {
            const userGrid = document.getElementById('userGrid');
            userGrid.innerHTML = ''; // 그리드를 초기화

            const startIndex = page * usersPerPage;
            const endIndex = Math.min(startIndex + usersPerPage, filteredUsers.length);
            const currentUsers = filteredUsers.slice(startIndex, endIndex);

            currentUsers.forEach(user => {
                const userButton = document.createElement('button');
                userButton.textContent = user.name;
                userButton.classList.add('user-button');
            
                // 기준 온도 확인 후 버튼 색상 변경
                let userThreshold = null;
                if (settingData && settingData[loggedInUsername] && settingData[loggedInUsername][user.name]) {
                    userThreshold = settingData[loggedInUsername][user.name].thresholdTemperature;
                }

                const userTemperatureList = user.monitoring.temperature; // 온도 리스트
                const mostRecentTemperature = userTemperatureList[0]; // 가장 최근의 온도

                // 온도가 기준 온도를 넘는지 확인
                if (mostRecentTemperature > userThreshold) {
                    userButton.style.backgroundColor = 'red'; // 기준 온도 넘으면 빨간색
                } else {
                    userButton.style.backgroundColor = 'green'; // 기준 온도 이하이면 초록색
                }
            
                userButton.addEventListener('click', () => {
                    // 선택된 사용자 모니터링 데이터와 함께 dashboard.js로 페이지 변경
                    changePage('dashboard', loggedInUsername, user.name, user.monitoring);
                });
                userGrid.appendChild(userButton);
            });
            
            // 빈 칸 채우기
            const emptySlots = usersPerPage - currentUsers.length;
            for (let i = 0; i < emptySlots; i++) {
                const emptyButton = document.createElement('button');
                emptyButton.style.visibility = 'hidden';
                userGrid.appendChild(emptyButton);
            }
        };

        // 페이지 전환 버튼
        const nextPageButton = document.getElementById('nextPageButton');
        const prevPageButton = document.getElementById('prevPageButton');

        const updatePageButtons = () => {
            prevPageButton.disabled = currentPage === 0;
            nextPageButton.disabled = currentPage >= totalPages - 1;
        };

        nextPageButton.addEventListener('click', () => {
            if (currentPage < totalPages - 1) {
                currentPage++;
                renderUsers(currentPage);
                updatePageButtons();
            }
        });

        prevPageButton.addEventListener('click', () => {
            if (currentPage > 0) {
                currentPage--;
                renderUsers(currentPage);
                updatePageButtons();
            }
        });

        // 초기 사용자 목록 렌더링
        renderUsers(currentPage);
        updatePageButtons();
    })
    .catch(error => console.error('Error loading user data:', error));
};

// showUserScreen 함수를 기본으로 내보내기
export default showUserScreen;
