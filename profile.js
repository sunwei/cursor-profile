// 检查登录状态
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        return;
    }
    return token;
}

// 获取用户信息
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

// 获取使用统计
async function fetchUsageStats() {
    const token = checkAuth();
    try {
        const response = await fetch('http://localhost:3000/api/usage', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch usage stats');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching usage stats:', error);
        showError('获取使用统计失败');
    }
}

// 计算会员时长
function getMembershipDuration(joinDate) {
    const start = new Date(joinDate);
    const now = new Date();
    const diffInMonths = (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth();
    
    if (diffInMonths < 1) {
        const diffInDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
        return `已加入 ${diffInDays} 天`;
    } else if (diffInMonths < 12) {
        return `已加入 ${diffInMonths} 个月`;
    } else {
        const years = Math.floor(diffInMonths / 12);
        const months = diffInMonths % 12;
        return `已加入 ${years} 年 ${months} 个月`;
    }
}

// 检查套餐到期状态
function checkSubscriptionStatus(endDate) {
    const end = new Date(endDate);
    const now = new Date();
    const daysUntilExpiration = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    
    let alertMessage = '';
    if (daysUntilExpiration <= 0) {
        alertMessage = '您的套餐已过期，请立即续费';
    } else if (daysUntilExpiration <= 7) {
        alertMessage = `您的套餐即将在 ${daysUntilExpiration} 天后到期`;
    } else if (daysUntilExpiration <= 30) {
        alertMessage = `您的套餐将在 ${daysUntilExpiration} 天后到期`;
    }
    
    return {
        endDate: end.toLocaleDateString('zh-CN', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        }),
        alertMessage,
        isExpiringSoon: daysUntilExpiration <= 30
    };
}

// 更新用户信息显示
function updateUserInfo(profile) {
    // 设置头像
    const avatarText = document.querySelector('.avatar-text');
    avatarText.textContent = profile.email.charAt(0).toUpperCase();
    
    // 设置邮箱
    const userEmail = document.querySelector('.user-email');
    userEmail.textContent = profile.email;
    
    // 设置会员时长
    const membershipDuration = document.querySelector('.membership-duration');
    membershipDuration.textContent = getMembershipDuration(profile.joinDate);
    
    // 设置套餐信息
    const currentPlan = document.querySelector('.current-plan');
    currentPlan.className = 'current-plan ' + profile.subscription.name.toLowerCase();

    const planName = document.querySelector('.plan-name');
    planName.innerHTML = `${profile.subscription.name} <span class="plan-level ${profile.subscription.name.toLowerCase()}">${getPlanDescription(profile.subscription.name)}</span>`;
    
    const planPrice = document.querySelector('.plan-price');
    planPrice.textContent = profile.subscription.price === '0' ? '免费' : `￥${profile.subscription.price}/月`;
    
    // 设置套餐到期信息
    const status = checkSubscriptionStatus(profile.subscription.endDate);
    const endDateElement = document.querySelector('.subscription-end-date');
    endDateElement.textContent = `套餐到期时间：${status.endDate}`;
    
    const alertElement = document.querySelector('.subscription-alert');
    if (status.alertMessage) {
        alertElement.textContent = status.alertMessage;
        alertElement.classList.add('show');
        if (status.isExpiringSoon) {
            document.querySelector('.upgrade-btn').textContent = '立即续费';
        }
    }
    
    const planFeatures = document.querySelector('.plan-features');
    planFeatures.innerHTML = profile.subscription.features
        .map(feature => `<div>${feature}</div>`)
        .join('');
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

// 更新使用统计显示
function updateUsageStats(usage) {
    const cards = document.querySelectorAll('.usage-card');
    
    // API 调用统计
    const apiCard = cards[0];
    updateUsageCard(apiCard, usage.apiCalls.used, usage.apiCalls.limit, '次');
    
    // 存储空间统计
    const storageCard = cards[1];
    updateUsageCard(storageCard, usage.storage.used, usage.storage.limit, 'GB');
}

// 更新单个使用统计卡片
function updateUsageCard(card, used, limit, unit) {
    const progressFill = card.querySelector('.progress-fill');
    const currentUsage = card.querySelector('.current-usage');
    const totalLimit = card.querySelector('.total-limit');
    
    const percentage = (used / limit) * 100;
    progressFill.style.width = `${percentage}%`;
    progressFill.style.background = percentage > 90 ? '#ff4444' : '#6b48ff';
    
    currentUsage.textContent = `${used}${unit}`;
    totalLimit.textContent = `/${limit}${unit}`;
}

// 显示错误信息
function showError(message) {
    // 创建错误提示元素
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.display = 'block';
    errorDiv.textContent = message;
    
    // 添加到页面顶部
    document.querySelector('.profile-container').prepend(errorDiv);
    
    // 3秒后移除
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

// 处理退出登录
function handleLogout() {
    localStorage.removeItem('token');
    window.location.href = '/';
}

// 初始化页面
async function initializePage() {
    try {
        const [profile, usage] = await Promise.all([
            fetchUserProfile(),
            fetchUsageStats()
        ]);
        
        if (profile) {
            updateUserInfo(profile);
        }
        
        if (usage) {
            updateUsageStats(usage);
        }
    } catch (error) {
        console.error('Error initializing page:', error);
    }
}

// 添加事件监听器
document.querySelector('.logout-btn').addEventListener('click', handleLogout);
document.querySelector('.upgrade-btn').addEventListener('click', () => {
    window.location.href = '/upgrade.html';
});

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initializePage); 