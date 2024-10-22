// 페이지 전환 및 상태 관리
let currentPage = 'auth'; // 초기 페이지 설정
let loggedInUsername = ''; // 로그인된 사용자의 이름
let selectedUserName = ''; // 선택된 사용자의 이름
let selectedMonitoringData = null; // 선택된 모니터링 데이터

// 페이지 전환 함수
const renderPage = () => {
    const root = document.getElementById('root');

    if (currentPage === 'auth') {
        root.innerHTML = ''; // root 비우기
        import('./auth.js').then(module => {
            module.default();
        });
    } else if (currentPage === 'monitoring') {
        import('./monitoring.js').then(module => {
            if (selectedMonitoringData) {
                module.default(selectedMonitoringData, loggedInUsername, selectedUserName); // 모니터링 데이터와 사용자 이름 전달
            } else {
                console.error('No monitoring data found for user');
            }
        });
    } else if (currentPage === 'user') {
        root.innerHTML = ''; // root 비우기
        import('./user.js').then(module => {
            module.default(loggedInUsername); // 로그인된 사용자 이름을 전달
        });
    } else if (currentPage === 'dashboard') {
        root.innerHTML = ''; // root 비우기
        import('./dashboard.js').then(module => {
            if (selectedMonitoringData) {
                module.default(selectedMonitoringData, loggedInUsername, selectedUserName); // dashboard에 필요한 데이터 전달
            } else {
                console.error('No monitoring data found for dashboard');
            }
        });
    }
};

// 페이지 전환 함수
const changePage = (page, username = null, userName = null, monitoringData = null) => {
    currentPage = page; // 현재 페이지 업데이트
    if (username) loggedInUsername = username; // 로그인된 사용자 이름을 저장
    if (userName) selectedUserName = userName; // 선택된 사용자의 이름을 저장
    if (monitoringData) selectedMonitoringData = monitoringData; // 모니터링 데이터를 저장
    renderPage(); // 페이지 렌더링
};

// 초기 화면 렌더링
renderPage();
