// 检查登录状态
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        return;
    }
    return token;
}

// 获取当前用户信息
async function fetchUserProfile() {
    const token = checkAuth();
    try {
        const response = await fetch('http://localhost:3000/api/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch profile');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching profile:', error);
        showError('获取用户信息失败');
    }
}

// 显示错误信息
function showError(message) {
    alert(message);
}

// 获取套餐描述
function getPlanDescription(planName) {
    const descriptions = {
        'Basic': '基础版',
        'Professional': '专业版',
        'Business': '企业版'
    };
    return descriptions[planName] || planName;
}

// 初始化页面
async function initializePage() {
    try {
        const profile = await fetchUserProfile();
        if (profile) {
            document.querySelector('.current-plan-name').textContent = 
                `${profile.subscription.name}（${getPlanDescription(profile.subscription.name)}）`;
        }
    } catch (error) {
        console.error('Error initializing page:', error);
    }
}

// 处理套餐选择
function handlePlanSelection() {
    const planCards = document.querySelectorAll('.plan-card');
    planCards.forEach(card => {
        card.querySelector('.select-plan-btn').addEventListener('click', () => {
            const planName = card.getAttribute('data-plan');
            const planPrice = card.querySelector('.price').textContent;
            
            // 更新支付信息
            document.querySelector('.selected-plan').textContent = 
                `${planName.charAt(0).toUpperCase() + planName.slice(1)}（${getPlanDescription(planName.charAt(0).toUpperCase() + planName.slice(1))}）`;
            document.querySelector('.selected-price').textContent = planPrice + '/月';
            
            // 隐藏套餐选择，显示支付部分
            document.querySelector('.plans-container').style.display = 'none';
            document.querySelector('.payment-section').style.display = 'block';
            
            // 保存选择的套餐信息
            localStorage.setItem('selectedPlan', planName);
            localStorage.setItem('selectedPrice', planPrice);
        });
    });
}

// 处理支付确认
async function handlePaymentConfirmation() {
    const confirmBtn = document.querySelector('.confirm-payment-btn');
    confirmBtn.addEventListener('click', async () => {
        const token = checkAuth();
        const selectedPlan = localStorage.getItem('selectedPlan');
        
        try {
            const response = await fetch('http://localhost:3000/api/upgrade', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    plan: selectedPlan
                })
            });
            
            if (response.ok) {
                // 隐藏支付部分，显示成功消息
                document.querySelector('.payment-section').style.display = 'none';
                document.querySelector('.success-message').style.display = 'block';
                
                // 更新成功消息中的套餐信息
                const planName = selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1);
                document.querySelector('.final-plan').textContent = 
                    `${planName}（${getPlanDescription(planName)}）`;
                
                // 清除临时存储的选择信息
                localStorage.removeItem('selectedPlan');
                localStorage.removeItem('selectedPrice');
            } else {
                showError('升级失败，请稍后重试');
            }
        } catch (error) {
            console.error('Error upgrading plan:', error);
            showError('升级失败，请稍后重试');
        }
    });
}

// 处理返回个人中心
function handleBackToProfile() {
    document.querySelector('.back-to-profile-btn').addEventListener('click', () => {
        window.location.href = '/profile.html';
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initializePage();
    handlePlanSelection();
    handlePaymentConfirmation();
    handleBackToProfile();
}); 