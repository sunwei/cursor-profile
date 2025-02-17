// 表单切换逻辑
const tabBtns = document.querySelectorAll('.tab-btn');
const forms = document.querySelectorAll('.form');

// 邮箱验证正则表达式
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

// 验证邮箱函数
function validateEmail(email) {
    return emailRegex.test(email);
}

// 显示验证消息
function showValidationMessage(input, message) {
    const validationMessage = input.parentElement.querySelector('.validation-message');
    if (message) {
        validationMessage.textContent = message;
        validationMessage.classList.add('show');
    } else {
        validationMessage.classList.remove('show');
    }
}

// 添加实时验证
function addInputValidation(input, validationFn) {
    input.addEventListener('input', () => {
        const value = input.value.trim();
        const message = validationFn(value);
        showValidationMessage(input, message);
    });

    input.addEventListener('blur', () => {
        const value = input.value.trim();
        const message = validationFn(value);
        showValidationMessage(input, message);
    });
}

// 验证密码
function validatePassword(password) {
    if (password.length < 6) {
        return '密码长度至少为6位';
    }
    return '';
}

// 初始化表单验证
function initializeFormValidation() {
    const emailInputs = document.querySelectorAll('input[type="email"]');
    const passwordInputs = document.querySelectorAll('input[type="password"]');

    emailInputs.forEach(input => {
        addInputValidation(input, (value) => {
            if (!value) return '邮箱不能为空';
            if (!validateEmail(value)) return '请输入有效的邮箱地址';
            return '';
        });
    });

    passwordInputs.forEach(input => {
        addInputValidation(input, validatePassword);
    });
}

// 表单切换
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        forms.forEach(f => f.classList.remove('active'));
        
        btn.classList.add('active');
        const formType = btn.getAttribute('data-form');
        document.getElementById(`${formType}Form`).classList.add('active');
    });
});

// API 请求函数
async function makeRequest(url, method, data) {
    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// 显示消息函数
function showMessage(formId, type, message) {
    const form = document.getElementById(formId);
    let messageElement = form.querySelector(`.${type}-message`);
    
    if (!messageElement) {
        messageElement = document.createElement('div');
        messageElement.className = `${type}-message`;
        form.appendChild(messageElement);
    }
    
    messageElement.textContent = message;
    messageElement.style.display = 'block';
    
    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 3000);
}

// 登录表单处理
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!validateEmail(username)) {
        showMessage('loginForm', 'error', '请输入有效的邮箱地址');
        return;
    }
    
    try {
        const response = await makeRequest('http://localhost:3000/api/login', 'POST', {
            username,
            password
        });
        
        if (response.success) {
            showMessage('loginForm', 'success', '登录成功！');
            localStorage.setItem('token', response.token);
            setTimeout(() => {
                window.location.href = '/profile.html';
            }, 1000);
        } else {
            showMessage('loginForm', 'error', response.message || '登录失败，请检查邮箱和密码');
        }
    } catch (error) {
        showMessage('loginForm', 'error', '登录失败，请稍后重试');
    }
});

// 注册表单处理
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!validateEmail(username)) {
        showMessage('registerForm', 'error', '请输入有效的邮箱地址');
        return;
    }
    
    if (password.length < 6) {
        showMessage('registerForm', 'error', '密码长度至少为6位');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('registerForm', 'error', '两次输入的密码不一致');
        return;
    }
    
    try {
        const response = await makeRequest('http://localhost:3000/api/register', 'POST', {
            username,
            password
        });
        
        if (response.success) {
            showMessage('registerForm', 'success', '注册成功！');
            document.getElementById('registerForm').reset();
            setTimeout(() => {
                document.querySelector('[data-form="login"]').click();
            }, 1500);
        } else {
            showMessage('registerForm', 'error', response.message || '注册失败，请重试');
        }
    } catch (error) {
        showMessage('registerForm', 'error', '注册失败，请稍后重试');
    }
});

// 初始化表单验证
initializeFormValidation(); 