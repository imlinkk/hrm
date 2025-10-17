// authModule.js
// Do not import showModal from app.js to avoid circular import.
// Use window.showModal if available; otherwise fall back to alert.

// Simple hash function using closure
const createHasher = () => {
    const hash = (str) => str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0).toString(16);
    return hash;
};
const hasher = createHasher();

// Closure for form state
const createFormState = () => {
    let isLoginMode = true;
    return {
        toggleMode() { isLoginMode = !isLoginMode; },
        isLogin() { return isLoginMode; }
    };
};
const formState = createFormState();

export function init() {
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([])); // Khởi tạo mảng rỗng nếu chưa có
    }
}

export async function register(username, password) {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
    let users = JSON.parse(localStorage.getItem('users') || '[]'); // Mặc định rỗng nếu null
    if (!Array.isArray(users)) {
        users = []; // Đảm bảo users là mảng
        localStorage.setItem('users', JSON.stringify(users));
    }
    if (users.find(u => u.username === username)) {
        throw new Error('User exists');
    }
    users.push({ username, password: hasher(password) });
    localStorage.setItem('users', JSON.stringify(users));
}

export async function login(username, password) {
    await new Promise(resolve => setTimeout(resolve, 500));
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    if (!Array.isArray(users)) {
        users = [];
        localStorage.setItem('users', JSON.stringify(users));
    }
    const user = users.find(u => u.username === username && u.password === hasher(password));
    if (user) {
        localStorage.setItem('session', JSON.stringify({ username }));
        return true;
    }
    return false;
}

export function isLoggedIn() {
    const session = localStorage.getItem('session');
    console.log('Session check:', session);
    return !!session;
}

export function logout() {
    localStorage.removeItem('session');
    // Reset form state to login mode
    formState.isLogin() || formState.toggleMode();
}

export function renderLoginForm() {
    const loginDiv = document.getElementById('login-form');
    if (!loginDiv) {
        console.error('Login form container not found!');
        return;
    }
    
    // Reset form state to login mode before rendering
    if (!formState.isLogin()) {
        formState.toggleMode();
    }
    
    loginDiv.innerHTML = ''; // Clear

    const container = document.createElement('div');
    container.className = 'login-container';
    container.innerHTML = `
        <div class="logo">👥 HRM System</div>
        <h2 id="form-title">Đăng nhập</h2>
        <form id="auth-form">
            <div class="input-group" id="username-group">
                <input type="text" id="username" placeholder="Tên đăng nhập" required>
            </div>
            <div class="input-group" id="password-group">
                <input type="password" id="password" placeholder="Mật khẩu" required>
            </div>
            <div class="input-group" id="confirm-password-group" style="display: none;">
                <input type="password" id="confirm-password" placeholder="Xác nhận mật khẩu">
            </div>
            <button type="submit" id="submit-btn">Đăng Nhập</button>
            <p class="error-message" id="error-msg"></p>
        </form>
        <p class="toggle-link" id="toggle-mode">Chưa có tài khoản? Đăng ký ngay</p>
    `;

    loginDiv.appendChild(container);

    const form = document.getElementById('auth-form');
    const title = document.getElementById('form-title');
    const submitBtn = document.getElementById('submit-btn');
    const confirmGroup = document.getElementById('confirm-password-group');
    const toggleLink = document.getElementById('toggle-mode');
    const errorMsg = document.getElementById('error-msg');

    const confirmPasswordInput = document.getElementById('confirm-password');
    
    const updateMode = () => {
        if (formState.isLogin()) {
            title.textContent = 'Đăng Nhập';
            submitBtn.textContent = 'Đăng Nhập';
            confirmGroup.style.display = 'none';
            confirmPasswordInput.removeAttribute('required');
            toggleLink.textContent = 'Chưa có tài khoản? Đăng ký ngay';
        } else {
            title.textContent = 'Đăng Ký';
            submitBtn.textContent = 'Đăng Ký';
            confirmGroup.style.display = 'block';
            confirmPasswordInput.setAttribute('required', 'required');
            toggleLink.textContent = 'Đã có tài khoản? Đăng nhập';
        }
        errorMsg.style.display = 'none';
    };
    updateMode();

    toggleLink.addEventListener('click', () => {
        formState.toggleMode();
        updateMode();
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.style.display = 'none';
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (!username || !password) {
            errorMsg.textContent = 'Vui lòng nhập đầy đủ thông tin';
            errorMsg.style.display = 'block';
            return;
        }

        if (!formState.isLogin()) {
            if (!confirmPassword || password !== confirmPassword) {
                errorMsg.textContent = 'Mật khẩu xác nhận không khớp';
                errorMsg.style.display = 'block';
                return;
            }
            try {
                await register(username, password);
                if (typeof window !== 'undefined' && typeof window.showModal === 'function') {
                    window.showModal('Đăng ký thành công! Hãy đăng nhập.');
                } else {
                    alert('Đăng ký thành công! Hãy đăng nhập.');
                }
                // Reset form and switch to login mode
                form.reset();
                formState.toggleMode();
                updateMode();
            } catch (err) {
                errorMsg.textContent = err.message || 'Đăng ký thất bại';
                errorMsg.style.display = 'block';
            }
        } else {
            const success = await login(username, password);
            if (success) {
                // Clear form before reload
                form.reset();
                // Clear error message
                errorMsg.style.display = 'none';
                errorMsg.textContent = '';
                // Reload to show dashboard
                window.location.reload();
            } else {
                errorMsg.textContent = 'Sai tên đăng nhập hoặc mật khẩu';
                errorMsg.style.display = 'block';
            }
        }
    });
}