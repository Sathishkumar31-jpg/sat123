// ===================================
// AUTH.JS - Authentication & Common
// ===================================

const API_URL = 'http://localhost:5000/api';
const TOKEN_KEY = 'sqaip_token';
const USER_KEY = 'sqaip_user';

// ===================================
// COMMON FUNCTIONS
// ===================================

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function getUser() {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
}

function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

function setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

async function fetchAPI(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });

    if (response.status === 401 && !endpoint.includes('login')) {
        clearAuth();
        window.location.href = '/login.html';
        return null;
    }

    return response.json();
}

function showToast(message, type = 'info', title = 'Notification') {
    const toastEl = document.getElementById('toastNotification');
    if (!toastEl) return;

    const toastTitle = document.getElementById('toastTitle');
    const toastMessage = document.getElementById('toastMessage');
    
    if (toastTitle) toastTitle.textContent = title;
    if (toastMessage) toastMessage.textContent = message;

    const bsToast = new bootstrap.Toast(toastEl);
    bsToast.show();
}

function showLoading(show = true) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        if (show) {
            overlay.classList.remove('d-none');
        } else {
            overlay.classList.add('d-none');
        }
    }
}

// ===================================
// THEME TOGGLE
// ===================================

function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const themeToggleSidebar = document.getElementById('themeToggleSidebar');
    
    // Check for saved theme preference or default to dark mode
    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.body.className = currentTheme + '-mode';

    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    if (themeToggleSidebar) {
        themeToggleSidebar.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    if (isDarkMode) {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    }
}

// ===================================
// SIDEBAR TOGGLE
// ===================================

function initSidebarToggle() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.remove('active');
        });
    }

    // Close sidebar on link click
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            sidebar.classList.remove('active');
        });
    });
}

// ===================================
// USER DROPDOWN
// ===================================

function initUserDropdown() {
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');

    if (userMenuBtn && userDropdown) {
        userMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.style.display = 
                userDropdown.style.display === 'block' ? 'none' : 'block';
        });

        document.addEventListener('click', () => {
            userDropdown.style.display = 'none';
        });
    }
}

// ===================================
// LOGOUT
// ===================================

function initLogout() {
    const logoutBtns = document.querySelectorAll('#logoutBtn, #logoutLink');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            clearAuth();
            window.location.href = '/login.html';
        });
    });
}

// ===================================
// AUTHENTICATION PAGES
// ===================================

function initLoginPage() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    const togglePassword = document.getElementById('togglePassword');
    const password = document.getElementById('password');
    const email = document.getElementById('email');

    if (togglePassword && password) {
        togglePassword.addEventListener('click', () => {
            password.type = password.type === 'password' ? 'text' : 'password';
            togglePassword.querySelector('i').classList.toggle('fa-eye');
            togglePassword.querySelector('i').classList.toggle('fa-eye-slash');
        });
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const credentials = {
            email: email.value,
            password: password.value
        };

        try {
            showLoading(true);
            const data = await fetchAPI('/auth/login', {
                method: 'POST',
                body: JSON.stringify(credentials)
            });

            if (data.success) {
                setToken(data.data.token);
                setUser(data.data.user);
                showToast('Login successful!', 'success', 'Success');
                setTimeout(() => {
                    window.location.href = '/dashboard.html';
                }, 1000);
            } else {
                showToast(data.message || 'Login failed', 'danger', 'Error');
            }
        } catch (error) {
            showToast('An error occurred. Please try again.', 'danger', 'Error');
        } finally {
            showLoading(false);
        }
    });
}

function initRegisterPage() {
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;

    const togglePassword = document.getElementById('toggleRegPassword');
    const password = document.getElementById('regPassword');
    const toggleConfirm = document.getElementById('toggleConfirmPassword');
    const confirmPassword = document.getElementById('confirmPassword');

    if (togglePassword && password) {
        togglePassword.addEventListener('click', () => {
            password.type = password.type === 'password' ? 'text' : 'password';
            togglePassword.querySelector('i').classList.toggle('fa-eye');
            togglePassword.querySelector('i').classList.toggle('fa-eye-slash');
        });
    }

    if (toggleConfirm && confirmPassword) {
        toggleConfirm.addEventListener('click', () => {
            confirmPassword.type = confirmPassword.type === 'password' ? 'text' : 'password';
            toggleConfirm.querySelector('i').classList.toggle('fa-eye');
            toggleConfirm.querySelector('i').classList.toggle('fa-eye-slash');
        });
    }

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fullname = document.getElementById('fullname').value;
        const email = document.getElementById('regEmail').value;
        const pwd = password.value;
        const confirmPwd = confirmPassword.value;

        // Validation
        if (pwd !== confirmPwd) {
            showToast('Passwords do not match', 'danger', 'Error');
            return;
        }

        if (pwd.length < 8) {
            showToast('Password must be at least 8 characters', 'danger', 'Error');
            return;
        }

        const userData = {
            name: fullname,
            email: email,
            password: pwd,
            confirmPassword: confirmPwd
        };

        try {
            showLoading(true);
            const data = await fetchAPI('/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData)
            });

            if (data.success) {
                showToast('Registration successful! Please log in.', 'success', 'Success');
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 1500);
            } else {
                showToast(data.message || 'Registration failed', 'danger', 'Error');
            }
        } catch (error) {
            showToast('An error occurred. Please try again.', 'danger', 'Error');
        } finally {
            showLoading(false);
        }
    });
}

// ===================================
// PROTECTED ROUTES
// ===================================

function checkAuthentication() {
    const currentPage = window.location.pathname;
    const isAuthPage = currentPage.includes('login') || currentPage.includes('register') || currentPage === '/';
    const token = getToken();

    if (!isAuthPage && !token) {
        window.location.href = '/login.html';
        return false;
    }

    if (isAuthPage && token) {
        window.location.href = '/dashboard.html';
        return false;
    }

    return true;
}

// ===================================
// PAGE INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuthentication()) return;

    initThemeToggle();
    initSidebarToggle();
    initUserDropdown();
    initLogout();

    // Page specific initialization
    if (document.getElementById('loginForm')) {
        initLoginPage();
    }

    if (document.getElementById('registerForm')) {
        initRegisterPage();
    }

    // Update username in sidebar
    const user = getUser();
    if (user) {
        const usernamePlaceholder = document.getElementById('usernamePlaceholder');
        if (usernamePlaceholder) {
            usernamePlaceholder.textContent = user.name || 'User';
        }
    }
});
