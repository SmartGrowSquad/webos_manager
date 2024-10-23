const axios = require('axios');
const mainServerIP = 'http://192.168.29.181:8000';
import { changePage } from './app.js';
import { loadSettingData } from './settingManager.js'; // 설정 데이터 가져오기

var m_id = 1;

const showUserScreen = async () => {
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

    // 최신 설정 값 가져오기
    const settingData = await loadSettingData(m_id); // 수정된 설정 데이터 가져오기
    const thresholdTemp = settingData.thresholdTemperature || 30; // 기본값 30

    loadUserData(m_id).then(([ids, names, temps]) => { // temps 추가
        const totalPages = Math.ceil(ids.length / usersPerPage);

        const renderUsers = (page) => {
            const userGrid = document.getElementById('userGrid');
            userGrid.innerHTML = ''; // 그리드를 초기화

            const startIndex = page * usersPerPage;
            const endIndex = Math.min(startIndex + usersPerPage, ids.length);
            const currentUsers = ids.slice(startIndex, endIndex);
            const currentNames = names.slice(startIndex, endIndex);
            const currentTemps = temps.slice(startIndex, endIndex); // 해당 페이지의 온도 값

            currentUsers.forEach((userId, index) => {
                const userButton = document.createElement('button');
                userButton.textContent = currentNames[index];
                userButton.classList.add('user-button');

                // 최근 온도가 설정 온도보다 높으면 버튼 빨간색으로 변경
                if (currentTemps[index] > thresholdTemp) {
                    userButton.style.backgroundColor = 'red';
                }

                userButton.addEventListener('click', () => {
                    console.log(currentUsers[index]);
                    changePage('dashboard', currentUsers[index]);
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


// 사용자 데이터 및 설정 데이터 가져오기 (Luna Service 사용)
const loadUserData = (m_id) => {
    return axios.post(mainServerIP + "/urbani", {
        mId: m_id
    })
    .then(function (response) {
        const resultsArray = response.data.results;
    
        if (resultsArray && Array.isArray(resultsArray)) {
            // Extract 'id', 'name', and 'recentTemp' values if resultsArray is an array
            const ids = resultsArray.map(item => item.id);
            const names = resultsArray.map(item => item.name);
            const temps = resultsArray.map(item => item.recentTemp); // 최근 온도 값 추가
            return [ids, names, temps]; // Return the array of IDs, names, and temperatures
        } else {
            console.error('Results array not found or not an array.');
            return [[], [], []]; // Return empty arrays if no data is found
        }
    })
    .catch(function (error) {
        console.error('Error occurred:', error);
        return [[], [], []]; // Return empty arrays in case of an error
    });
};

// showUserScreen 함수를 기본으로 내보내기
export default showUserScreen;
