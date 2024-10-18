// js/setting.js

const showSettingModal = (loggedInUsername, userName) => {
    const root = document.getElementById('root');
    
    // 모달 오버레이와 팝업 내용 추가
    const modalOverlay = document.createElement('div');
    modalOverlay.classList.add('modal-overlay');
    modalOverlay.innerHTML = `
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

    root.appendChild(modalOverlay);

    // JSON 데이터를 가져와서 현재 기준 온도 표시
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

// showSettingModal 함수를 기본으로 내보내기
export default showSettingModal;
