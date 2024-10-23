// 페이지 전환 및 상태 관리
let currentPage = 'user'; // 초기 페이지 설정
let selectedUserId = null; // 선택된 사용자의 ID

// 페이지 전환 함수
const renderPage = () => {
    const root = document.getElementById('root');

    if (currentPage === 'user') {
        root.innerHTML = ''; // root 비우기
        import('./user.js').then(module => {
            module.default(); // user 화면 렌더링
        }).catch(error => console.error('Error loading user.js:', error));
    } else if (currentPage === 'dashboard') {
        root.innerHTML = ''; // root 비우기
        import('./dashboard.js').then(module => {
            if (selectedUserId) {
                module.default(selectedUserId); // dashboard에 필요한 데이터로 ID 전달
            } else {
                console.error('No user ID found for dashboard');
            }
        }).catch(error => console.error('Error loading dashboard.js:', error));
    }
};

// 페이지 전환 함수
export const changePage = (page, userId = null) => {
    currentPage = page; // 현재 페이지 업데이트
    if (userId) selectedUserId = userId; // 선택된 사용자의 ID를 저장
    renderPage(); // 페이지 렌더링
};

// 초기 화면 렌더링
renderPage();
