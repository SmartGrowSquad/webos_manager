const showAuthScreen = () => {
    const root = document.getElementById('root');
    root.innerHTML = `
        <div class="auth-container">
            <h2>Login</h2>
            <div class="auth-form">
                <div class="auth-fields">
                    <input type="text" id="username" placeholder="Username" class="auth-input" />
                    <input type="password" id="password" placeholder="Password" class="auth-input" />
                </div>
                <button id="loginButton" class="auth-button">Login</button>
            </div>
            <p class="auth-error" id="authError"></p>
            <div id="toast" class="toast"></div> <!-- Toast 알림을 위한 div -->
        </div>
    `;

    // 로그인 버튼 클릭 이벤트 리스너
    document.getElementById('loginButton').addEventListener('click', handleLogin);
};

// 로그인 처리 함수
const handleLogin = () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    authenticateUser(username, password).then(user => {
        if (user) {
            changePage('user', user.username); // 사용자 화면으로 전환
        } else {
            showToast('Invalid username or password'); // Toast 알림 표시
        }
    });
};

// 사용자 인증 함수
const authenticateUser = (username, password) => {
    return fetch('http://localhost:3000/auth-data') // 서버에서 authData.json 데이터를 가져옴
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(authData => {
            return authData.find(u => u.username === username && u.password === password);
        })
        .catch(error => {
            console.error('Error loading auth data:', error);
            return null; // 오류가 발생한 경우 null 반환
        });
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

// showAuthScreen 함수를 기본으로 내보내기
export default showAuthScreen;
