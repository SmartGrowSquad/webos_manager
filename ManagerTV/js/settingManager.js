// 설정 데이터를 로드하는 함수
export const loadSettingData = (userId) => {
    // localStorage에서 저장된 설정 데이터를 가져옴
    const data = localStorage.getItem('settingData');
    const settingData = data ? JSON.parse(data) : {}; // 저장된 데이터가 없으면 빈 객체 반환
    
    // 해당 userId에 데이터가 없으면 기본값으로 설정
    if (!settingData[userId]) {
        settingData[userId] = { thresholdTemperature: 25 }; // 기본값 설정
    }
    return settingData;
};

// 설정 데이터를 저장하는 함수
export const saveSettingData = (userId, newSettings) => {
    // localStorage에서 기존 설정 데이터를 가져옴
    const data = localStorage.getItem('settingData');
    const settingData = data ? JSON.parse(data) : {};

    // 해당 userId에 대한 설정을 업데이트 (없으면 새로 만듦)
    settingData[userId] = newSettings;

    // 변경된 데이터를 다시 localStorage에 저장
    localStorage.setItem('settingData', JSON.stringify(settingData));
};
