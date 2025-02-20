// API 配置
const API_CONFIG = {
    BASE_URL: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    MODEL: 'glm-4'
};

// JWT 编码函数
function base64url(source) {
    // 将字符串编码为 base64，并进行 URL 安全的转换
    let encodedSource = btoa(JSON.stringify(source))
        .replace(/=+$/, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
    return encodedSource;
}

function generateJWT(header, payload, secret) {
    // 创建 JWT 的各个部分
    const encodedHeader = base64url(header);
    const encodedPayload = base64url(payload);
    const signature = encodedHeader + '.' + encodedPayload;
    
    // 使用 HMAC SHA256 进行签名
    const encoder = new TextEncoder();
    const data = encoder.encode(signature);
    const key = encoder.encode(secret);
    
    return new Promise((resolve, reject) => {
        crypto.subtle.importKey(
            'raw',
            key,
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        ).then(key => {
            return crypto.subtle.sign(
                'HMAC',
                key,
                data
            );
        }).then(signature => {
            const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
                .replace(/=+$/, '')
                .replace(/\+/g, '-')
                .replace(/\//g, '_');
            resolve(encodedHeader + '.' + encodedPayload + '.' + encodedSignature);
        }).catch(reject);
    });
}

// JWT token 生成函数
async function generateToken(apiKey) {
    try {
        const [id, secret] = apiKey.split('.');
        
        const header = {
            alg: 'HS256',
            sign_type: 'SIGN'
        };

        const payload = {
            api_key: id,
            exp: Date.now() + 3600000, // 1小时后过期
            timestamp: Date.now()
        };

        // 使用自定义的 JWT 生成函数
        const token = await generateJWT(header, payload, secret);
        return token;
    } catch (error) {
        console.error('Token generation failed:', error);
        throw error;
    }
}

// API 调用函数
async function chatWithAI(message, apiKey) {
    try {
        console.log('Generating token...');
        const token = await generateToken(apiKey);
        console.log('Token generated:', token.substring(0, 20) + '...');
        
        const requestBody = {
            model: API_CONFIG.MODEL,
            messages: [
                {
                    role: 'system',
                    content: '你是一个友好的AI助手，会用简洁、专业的方式回答问题。'
                },
                {
                    role: 'user',
                    content: message
                }
            ],
            temperature: 0.7,
            top_p: 0.8,
            stream: false
        };
        
        console.log('Sending request to API...');
        console.log('Request body:', requestBody);
        
        const response = await fetch(API_CONFIG.BASE_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        console.log('Response status:', response.status);
        const responseData = await response.json();
        console.log('Response data:', responseData);

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} - ${responseData.error?.message || 'Unknown error'}`);
        }

        if (responseData.choices && responseData.choices[0] && responseData.choices[0].message) {
            return responseData.choices[0].message.content;
        } else {
            throw new Error('Invalid API response format');
        }
    } catch (error) {
        console.error('详细错误信息:', error);
        throw error;
    }
} 