const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('.'));  // 服务静态文件

// 模拟数据
const users = {
    'test@example.com': {
        password: '123456',
        joinDate: '2023-08-17T12:00:00Z',
        subscription: {
            name: 'Professional',
            price: '99',
            level: 2,
            endDate: '2024-03-17T12:00:00Z',
            features: [
                '高级AI模型访问',
                '优先技术支持',
                '高级分析功能',
                '24/7客服支持',
                '团队协作功能',
                '自定义域名支持'
            ]
        }
    },
    'me@sunwei.xyz': {
        password: '12345',
        joinDate: '2023-06-15T08:00:00Z',
        subscription: {
            name: 'Business',
            price: '299',
            level: 3,
            endDate: '2024-03-15T08:00:00Z',
            features: [
                'GPT-4 无限制访问',
                '专属客户经理',
                '企业级API集成',
                '无限存储空间',
                '高级数据分析',
                '定制化解决方案',
                '7x24小时技术支持'
            ]
        }
    }
};

// 模拟用户使用数据
const usageData = {
    'test@example.com': {
        apiCalls: {
            used: 8500,
            limit: 10000
        },
        storage: {
            used: 45,
            limit: 50
        }
    },
    'me@sunwei.xyz': {
        apiCalls: {
            used: 15000,
            limit: 100000
        },
        storage: {
            used: 180,
            limit: 500
        }
    }
};

// 登录接口
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = users[username];

    if (user && user.password === password) {
        // 生成一个简单的token（实际应用中应该使用更安全的方式）
        const token = Buffer.from(username).toString('base64');
        res.json({ success: true, token });
    } else {
        res.json({ success: false, message: '用户名或密码错误' });
    }
});

// 注册接口
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;

    if (users[username]) {
        res.json({ success: false, message: '该邮箱已被注册' });
        return;
    }

    // 创建新用户
    users[username] = {
        password,
        joinDate: new Date().toISOString(),
        subscription: {
            name: 'Basic',
            price: '0',
            level: 1,
            features: [
                '基础AI模型访问',
                '社区支持',
                '基础分析功能',
                '1GB存储空间',
                '标准API限制'
            ]
        }
    };

    // 创建使用数据
    usageData[username] = {
        apiCalls: {
            used: 0,
            limit: 1000
        },
        storage: {
            used: 0,
            limit: 1
        }
    };

    res.json({ success: true, message: '注册成功' });
});

// 获取用户信息接口
app.get('/api/profile', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        res.status(401).json({ error: '未授权' });
        return;
    }

    const email = Buffer.from(token, 'base64').toString();
    const user = users[email];

    if (!user) {
        res.status(404).json({ error: '用户不存在' });
        return;
    }

    res.json({
        email,
        joinDate: user.joinDate,
        subscription: user.subscription
    });
});

// 获取使用统计接口
app.get('/api/usage', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        res.status(401).json({ error: '未授权' });
        return;
    }

    const email = Buffer.from(token, 'base64').toString();
    const usage = usageData[email];

    if (!usage) {
        res.status(404).json({ error: '数据不存在' });
        return;
    }

    res.json(usage);
});

// 升级套餐接口
app.post('/api/upgrade', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        res.status(401).json({ error: '未授权' });
        return;
    }

    const email = Buffer.from(token, 'base64').toString();
    const user = users[email];
    const { plan } = req.body;

    if (!user) {
        res.status(404).json({ error: '用户不存在' });
        return;
    }

    // 设置新的套餐信息
    const planConfigs = {
        'professional': {
            name: 'Professional',
            price: '99',
            level: 2,
            features: [
                '高级AI模型访问',
                '优先技术支持',
                '高级分析功能',
                '24/7客服支持',
                '团队协作功能',
                '自定义域名支持'
            ]
        },
        'business': {
            name: 'Business',
            price: '299',
            level: 3,
            features: [
                'GPT-4 无限制访问',
                '专属客户经理',
                '企业级API集成',
                '无限存储空间',
                '高级数据分析',
                '定制化解决方案',
                '7x24小时技术支持'
            ]
        }
    };

    const newPlan = planConfigs[plan];
    if (!newPlan) {
        res.status(400).json({ error: '无效的套餐类型' });
        return;
    }

    // 设置套餐到期时间（一个月后）
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    
    // 更新用户套餐信息
    user.subscription = {
        ...newPlan,
        endDate: endDate.toISOString()
    };

    // 更新使用限额
    if (plan === 'professional') {
        usageData[email] = {
            apiCalls: {
                used: usageData[email].apiCalls.used,
                limit: 10000
            },
            storage: {
                used: usageData[email].storage.used,
                limit: 50
            }
        };
    } else if (plan === 'business') {
        usageData[email] = {
            apiCalls: {
                used: usageData[email].apiCalls.used,
                limit: 100000
            },
            storage: {
                used: usageData[email].storage.used,
                limit: 500
            }
        };
    }

    res.json({ success: true, message: '套餐升级成功' });
});

// 启动服务器
app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
}); 