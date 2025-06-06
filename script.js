// ===== 灵感精灵球：AI创意孵化器 =====
// JavaScript文件 - 用户输入处理和数据收集 + AI集成

console.log('🎮 灵感精灵球 script.js 已加载！');

// ===== AI API 配置常量 =====
// ✅ DeepSeek API Key 已配置
const OPENAI_API_KEY = 'sk-ffa7c8e8a42f425fab07fcb48ac1c92c'; // 真实的 DeepSeek API Key
// ✅ API 已就绪，可以正常生成AI内容！

const OPENAI_API_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions'; // DeepSeek API 端点
const LLM_MODEL = 'deepseek-chat'; // DeepSeek 聊天模型

// 注意：在生产环境中，API Key不应直接暴露在前端代码中。
// 建议通过后端代理或环境变量的方式处理API Key的安全问题。
// 
// 🔑 重要提醒：
// 1. 请将上方的API Key替换为您在 https://platform.deepseek.com 获取的真实API Key
// 2. 真实的DeepSeek API Key格式通常为：sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
// 3. 如果您还没有API Key，请访问 https://platform.deepseek.com 注册并获取

// ===== DOM Elements (initialized in initApp) =====
let generateButton = null;
let resultDisplay = null;
let saveImageButton = null; // 保存图片按钮元素
let saveImageContainer = null; // 保存图片按钮容器

// ===== 辅助函数：显示加载动画 =====
function showLoadingAnimation() {
    console.log('🔄 显示加载动画...');
    
    if (!resultDisplay) {
        console.error('❌ 未找到结果显示区域');
        return;
    }
    
    // 隐藏保存图片按钮
    const actionButtonContainer = document.querySelector('.action-button-container');
    if (actionButtonContainer) {
        actionButtonContainer.style.display = 'none';
    }
    
    // 创建加载动画的HTML结构
    const loadingHTML = `
        <div class="loading-container fade-in">
            <div class="pokeball-loader">
                <div class="pokeball enhanced-bounce">
                    <div class="pokeball-upper"></div>
                    <div class="pokeball-lower"></div>
                    <div class="pokeball-center"></div>
                </div>
            </div>
            <div class="loading-text">
                <h3>🥚 正在孵化灵感宝可梦...</h3>
                <p>AI正在融合你的创意元素 ✨</p>
                <div class="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    `;
    
    // 只替换result-content部分，如果没有则替换整个内容但保留按钮
    const resultContent = resultDisplay.querySelector('.result-content');
    if (resultContent) {
        resultContent.innerHTML = loadingHTML;
    } else {
        // 保存按钮容器
        const savedActionContainer = resultDisplay.querySelector('.action-button-container');
        resultDisplay.innerHTML = `
            <h2>🌟 灵感宝可梦诞生中...</h2>
            <div class="result-content">
                ${loadingHTML}
            </div>
        `;
        // 重新添加按钮容器
        if (savedActionContainer) {
            resultDisplay.appendChild(savedActionContainer);
        }
    }
    
    // 滚动到结果区域
    resultDisplay.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
    });
    
    console.log('✅ 加载动画显示完成');
}

// ===== 辅助函数：隐藏加载动画 =====
function hideLoadingAnimation() {
    console.log('✅ 准备隐藏加载动画...');
    // 注意：加载动画将通过显示结果内容来覆盖，无需单独隐藏
}

// ===== 辅助函数：显示错误信息 =====
function showErrorMessage(message, isCopyError = false) {
    console.error('❌ 显示错误信息:', message);
    
    if (!resultDisplay) {
        console.error('❌ 未找到结果显示区域');
        return;
    }

    // 创建错误信息的HTML结构
    const errorHTML = `
        <div class="error-container shake-in">
            <div class="error-card">
                <div class="error-header">
                    <h2>😱 糟糕！皮卡丘跑掉了！</h2>
                    <div class="pikachu-icon">⚡</div>
                </div>
                <div class="error-content">
                    <p class="error-message">${message}</p>
                    ${isCopyError ? '<p style="font-size:0.9em; opacity:0.8;">您可以尝试手动全选下方文本框内容并复制。</p><textarea id="manualCopyTextarea" readonly style="width: 100%; height: 100px; margin-top: 10px; padding: 10px; border-radius: 8px; border: 1px solid #ddd; font-size: 0.9em; resize: none;"></textarea>' : `
                    <div class="error-suggestions">
                        <h4>💡 建议尝试：</h4>
                        <ul>
                            <li>检查网络连接是否正常</li>
                            <li>确认API密钥设置正确</li>
                            <li>稍等片刻再重新尝试</li>
                            <li>或者联系技术支持获取帮助</li>
                        </ul>
                    </div>
                    <button class="retry-button" onclick="location.reload()">
                        🔄 重新尝试
                    </button>
                    `}
                </div>
            </div>
        </div>
    `;
    
    // 显示错误信息
    resultDisplay.innerHTML = errorHTML;
    
    // 滚动到结果区域
    resultDisplay.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
    });
    
    console.log('✅ 错误信息显示完成');
}

// ===== AI 提示词构建函数 =====
/**
 * 根据用户输入数据构建AI提示词
 * @param {Object} userData - 用户输入数据对象
 * @param {string} userData.freeDescription - 自由描述
 * @param {Array} userData.appAreas - 应用领域数组
 * @param {Array} userData.coreFeatures - 核心功能数组
 * @param {Array} userData.aiTech - AI技术数组
 * @param {string} userData.fusionPrototypes - 融合原型
 * @param {Array} userData.targetUsers - 目标用户数组
 * @param {string} userData.projectScale - 项目规模
 * @returns {Object} 包含system和user属性的提示词对象
 */
function buildAIPrompt(userData) {
    console.log('🔨 开始构建AI提示词...');
    console.log('📝 输入数据:', userData);
    
    // 安全的字符串处理函数
    const safeString = (value) => {
        if (value === null || value === undefined) return '';
        return String(value).trim();
    };
    
    // 安全的数组处理函数
    const safeArray = (array) => {
        if (!Array.isArray(array)) return [];
        return array.filter(item => item !== null && item !== undefined && item !== '');
    };
    
    // 定义系统角色
    const systemRole = "你是一位顶级创新应用设计师和提示工程专家，擅长将不同领域的概念、技术和用户需求进行颠覆性融合，并能为AI编程工具提供详细的开发指导。你的目标是为用户提供富有创意、可实施的AI应用灵感。";
    
    // 构建用户提示词
    let userPrompt = "请基于以下用户需求和偏好，生成一个独特的AI应用创意灵感：\\n\\n";
    
    // 添加自由描述（如果有）
    const freeDesc = safeString(userData.freeDescription);
    if (freeDesc !== '') {
        userPrompt += `💭 用户描述：${freeDesc}\\n\\n`;
    }
    
    // 添加应用领域（如果有）
    const appAreas = safeArray(userData.appAreas);
    if (appAreas.length > 0) {
        userPrompt += `🎯 应用领域：${appAreas.join(', ')}\\n\\n`;
    }
    
    // 添加核心功能（如果有）
    const coreFeatures = safeArray(userData.coreFeatures);
    if (coreFeatures.length > 0) {
        userPrompt += `⚙️ 核心功能类型：${coreFeatures.join(', ')}\\n\\n`;
    }
    
    // 添加AI技术偏好（如果有）
    const aiTech = safeArray(userData.aiTech);
    if (aiTech.length > 0) {
        userPrompt += `🧠 AI技术偏好：${aiTech.join(', ')}\\n\\n`;
    }
    
    // 添加融合原型（如果有）
    const fusionProto = safeString(userData.fusionPrototypes);
    if (fusionProto !== '') {
        userPrompt += `💡 希望融合的概念：${fusionProto}\\n\\n`;
    }
    
    // 添加目标用户（如果有）
    const targetUsers = safeArray(userData.targetUsers);
    if (targetUsers.length > 0) {
        userPrompt += `👥 目标用户群体：${targetUsers.join(', ')}\\n\\n`;
    }
    
    // 添加项目规模（如果有）
    const projectScale = safeString(userData.projectScale);
    if (projectScale !== '') {
        userPrompt += `📏 期望开发规模：${projectScale}\\n\\n`;
    }
    
    // 添加指导性语句
    userPrompt += "请基于以上信息，发挥你的创新能力，生成一个独一无二的AI应用灵感。该灵感必须是新颖的，并具有实际构建的可能性。\\n\\n";
    
    // 添加严格的输出格式要求
    userPrompt += `请严格按照以下Markdown格式输出，不要有任何额外内容或解释：

### ✨ 核心想法：[标题]
[一句话简介]

#### 🧩 灵感来源：
- [元素1描述]
- [元素2描述]
- [元素3描述]
... (至少3个)

#### 🎯 目标用户：
[描述]

#### 🚀 核心功能：
1. [功能1描述]
2. [功能2描述]
3. [功能3描述]
... (至少3个)

#### 💻 潜在技术栈：
- [技术1]
- [技术2]
- [AI工具/API]
... (至少2个)

#### 🔮 创新点与挑战：
**创新点：** [描述]
**挑战：** [描述]

#### 💻 推荐AI编程提示词：
[直接可用的AI编程提示词，例如：
"请基于以下核心想法：[此处填入核心想法标题和简介]，为其设计一个MVP前端界面。考虑使用[此处填入前端技术栈]。",
或者，
"请为[核心功能1]编写Python后端逻辑，使用[此处填入后端技术栈]。"，
等等，应能直接用于Cursor或其他AI编程工具开始下一阶段的开发。]

注意：
- 灵感来源至少3个
- 核心功能至少3个
- 潜在技术栈至少2个
- 推荐AI编程提示词必须是直接可用且相关的`;
    
    // 构建返回对象
    const promptPayload = {
        system: systemRole,
        user: userPrompt
    };
    
    // 打印构建的提示词对象
    console.log('🤖 构建的AI提示词:');
    console.log('========== 系统角色 ==========');
    console.log(promptPayload.system);
    console.log('========== 用户提示词 ==========');
    console.log(promptPayload.user);
    console.log('========== 完整载荷对象 ==========');
    console.log(promptPayload);
    console.log('=====================================');
    
    return promptPayload;
}

// ===== AI API 调用函数 =====
/**
 * 调用DeepSeek API生成AI响应
 * @param {Object} promptPayload - 包含system和user消息的对象
 * @param {string} promptPayload.system - 系统提示词
 * @param {string} promptPayload.user - 用户提示词
 * @returns {Promise<string|null>} AI生成的内容或null（如果出错）
 */
async function callAIApi(promptPayload) {
    console.log('🤖 开始调用AI API...');
    console.log('📝 提示词载荷:', promptPayload);
    
    // 检查API Key是否已设置
    if (!OPENAI_API_KEY || OPENAI_API_KEY.trim() === '' || OPENAI_API_KEY === 'sk-17b6bdf87ec54bca94e26f53ba9fdbb0') { // Check for placeholder too
        const errorMsg = '❌ API Key问题：请在script.js文件的第8行设置您的真实DeepSeek API Key。\\n\\n📝 获取步骤：\\n1. 访问 https://platform.deepseek.com\\n2. 注册/登录账户\\n3. 在API管理页面生成新的API Key\\n4. 将API Key复制替换script.js第8行的占位符';
        console.error('🔑', errorMsg);
        showErrorMessage(errorMsg);
        return null;
    }
    
    // 检查API Key格式
    if (!OPENAI_API_KEY.startsWith('sk-') || OPENAI_API_KEY.length < 20) {
        const errorMsg = '❌ API Key格式错误：DeepSeek API Key应该以"sk-"开头，长度至少20个字符。请检查您的API Key是否完整。';
        console.error('🔑', errorMsg);
        showErrorMessage(errorMsg);
        return null;
    }
    
    try {
        // 构建请求数据
        const requestBody = {
            model: LLM_MODEL,
            messages: [
                {
                    role: "system",
                    content: promptPayload.system
                },
                {
                    role: "user", 
                    content: promptPayload.user
                }
            ],
            temperature: 0.7, // 控制创意度
            max_tokens: 1000, // 限制响应长度
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        };
        
        console.log('📤 发送API请求:', requestBody);
        
        // 发送API请求
        const response = await fetch(OPENAI_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log('📥 API响应状态:', response.status, response.statusText);
        
        // 检查响应状态
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMsg = `API请求失败: ${response.status} ${response.statusText}`;
            console.error('🚫 API错误详情:', errorData);
            
            if (response.status === 401) {
                showErrorMessage('API Key无效或已过期，请检查您的DeepSeek API Key。');
            } else if (response.status === 429) {
                showErrorMessage('API调用频率超限，请稍后再试。');
            } else if (response.status >= 500) {
                showErrorMessage('DeepSeek服务器错误，请稍后再试。');
            } else {
                showErrorMessage(errorMsg);
            }
            return null;
        }
        
        // 解析响应数据
        const data = await response.json();
        console.log('📋 API完整响应:', data);
        
        // 提取AI生成的内容
        if (data.choices && data.choices.length > 0 && data.choices[0].message) {
            const aiContent = data.choices[0].message.content;
            console.log('✨ AI生成的原始内容:');
            console.log(aiContent);
            
            // 检查aiContent是否有效
            if (!aiContent || typeof aiContent !== 'string') {
                console.error('❌ AI响应内容无效:', aiContent);
                showErrorMessage('AI返回的内容格式异常，请重新尝试。');
                return null;
            }
            
            // 检查并清理undefined字符串
            let cleanedAiContent = aiContent;
            if (cleanedAiContent.includes('undefined')) {
                console.warn('⚠️ AI响应中检测到undefined，正在清理...');
                cleanedAiContent = cleanedAiContent.replace(/undefined/g, '').replace(/\s+/g, ' ').trim();
            }
            
            // 尝试提取Markdown代码块内容
            try {
                const markdownMatch = cleanedAiContent.match(/```markdown\n([\s\S]*?)\n```/);
                if (markdownMatch && markdownMatch[1]) {
                    console.log('📄 提取到Markdown代码块内容');
                    let extractedContent = markdownMatch[1].trim();
                    // 再次清理可能的undefined
                    extractedContent = extractedContent.replace(/undefined/g, '').trim();
                    return extractedContent;
                } else {
                    console.log('📄 未找到Markdown代码块，返回完整内容');
                    return cleanedAiContent.trim();
                }
            } catch (error) {
                console.error('❌ 处理AI响应内容时发生错误:', error);
                // 作为后备，返回清理后的原始内容
                return cleanedAiContent.trim();
            }
        } else {
            console.error('❌ API响应格式异常:', data);
            showErrorMessage('AI响应格式异常，请稍后再试。');
            return null;
        }
        
    } catch (error) {
        console.error('🚨 API调用异常:', error);
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            showErrorMessage('网络连接失败，请检查网络连接。');
        } else if (error.name === 'SyntaxError') {
            showErrorMessage('API响应解析失败，请稍后再试。');
        } else {
            showErrorMessage(`AI调用失败: ${error.message}`);
        }
        return null;
    }
}

/**
 * 收集所有表单输入数据的核心函数
 * @returns {Object} 结构化的用户输入数据对象
 */
function collectInputs() {
    console.log('🔍 开始收集用户输入数据...');
    
    // 创建数据收集对象
    const userData = {
        freeDescription: '',
        appAreas: [],
        coreFeatures: [],
        aiTech: [],
        fusionPrototypes: '',
        targetUsers: [],
        projectScale: ''
    };
    
    // 1. 收集自由描述
    const freeDescriptionInput = document.getElementById('freeDescription');
    if (freeDescriptionInput) {
        userData.freeDescription = freeDescriptionInput.value.trim();
    }
    
    // 2. 收集应用领域（复选框）
    const appAreaInputs = document.querySelectorAll('input[name="appArea"]:checked');
    userData.appAreas = Array.from(appAreaInputs).map(input => input.value);
    
    // 3. 收集核心功能类型（复选框）
    const coreFeatureInputs = document.querySelectorAll('input[name="coreFeature"]:checked');
    userData.coreFeatures = Array.from(coreFeatureInputs).map(input => input.value);
    
    // 4. 收集AI技术偏好（复选框）
    const aiTechInputs = document.querySelectorAll('input[name="aiTech"]:checked');
    userData.aiTech = Array.from(aiTechInputs).map(input => input.value);
    
    // 5. 收集融合原型
    const fusionInput = document.getElementById('fusionPrototypes');
    if (fusionInput) {
        userData.fusionPrototypes = fusionInput.value.trim();
    }
    
    // 6. 收集目标用户群体（复选框）
    const targetUserInputs = document.querySelectorAll('input[name="targetUser"]:checked');
    userData.targetUsers = Array.from(targetUserInputs).map(input => input.value);
    
    // 7. 收集项目规模（单选按钮）
    const projectScaleInput = document.querySelector('input[name="projectScale"]:checked');
    if (projectScaleInput) {
        userData.projectScale = projectScaleInput.value;
    }
    
    // 打印收集到的数据对象（用于验证）
    console.log('📋 用户输入数据收集完成！');
    console.log('========== 用户数据详情 ==========');
    console.log('💭 自由描述:', userData.freeDescription || '（未填写）');
    console.log('🎯 应用领域:', userData.appAreas.length > 0 ? userData.appAreas : '（未选择）');
    console.log('⚙️ 核心功能:', userData.coreFeatures.length > 0 ? userData.coreFeatures : '（未选择）');
    console.log('🧠 AI技术:', userData.aiTech.length > 0 ? userData.aiTech : '（未选择）');
    console.log('💡 融合原型:', userData.fusionPrototypes || '（未填写）');
    console.log('👥 目标用户:', userData.targetUsers.length > 0 ? userData.targetUsers : '（未选择）');
    console.log('📏 项目规模:', userData.projectScale || '（未选择）');
    console.log('========== 完整数据对象 ==========');
    console.log(userData);
    console.log('=====================================');
    
    return userData;
}

/**
 * 验证用户输入的基本有效性
 * @param {Object} userData - 用户输入数据对象
 * @returns {Object} 验证结果对象
 */
function validateInputs(userData) {
    const validation = {
        isValid: true,
        errors: [],
        warnings: []
    };
    
    // 检查关键字段
    if (userData.appAreas.length === 0) {
        validation.warnings.push('建议至少选择一个应用领域');
    }
    
    if (userData.coreFeatures.length === 0) {
        validation.warnings.push('建议至少选择一个核心功能');
    }
    
    if (!userData.fusionPrototypes && !userData.freeDescription) {
        validation.warnings.push('建议填写自由描述或融合原型，以获得更精准的创意');
    }
    
    // 检查选择数量是否合理
    if (userData.appAreas.length > 3) {
        validation.warnings.push('选择的应用领域较多，可能会影响创意的聚焦度');
    }
    
    if (userData.coreFeatures.length > 3) {
        validation.warnings.push('选择的核心功能较多，建议聚焦2-3个核心功能');
    }
    
    console.log('✅ 输入验证完成:', validation);
    return validation;
}

/**
 * 显示静态灵感内容（第一阶段功能）
 */
function displayStaticInspiration() {
    if (!resultDisplay) return;

    // 隐藏保存图片按钮（静态内容不需要保存功能）
    const actionButtonContainer = document.querySelector('.action-button-container');
    if (actionButtonContainer) {
        actionButtonContainer.style.display = 'none';
    }
    
    const inspirationContent = `
        <h2>🌟 灵感宝可梦诞生！</h2>
        <div class="result-content">
            <div class="inspiration-card">
                <h3>✨ 核心想法：智能宠物翻译器</h3>
                <p><strong>这是一个可以翻译你的宠物（猫狗）叫声的应用，通过AI分析其情感和需求。</strong></p>
                
                <h4>🧩 灵感来源：</h4>
                <ul>
                    <li>狗狗/猫猫叫声识别</li>
                    <li>ChatGPT语言模型</li>
                    <li>宝可梦中的语言互通（精灵宝可梦动画片中的"宝可梦翻译器"）</li>
                </ul>
                
                <h4>🎯 目标用户：</h4>
                <p>宠物主人，对宠物沟通有兴趣的用户。</p>
                
                <h4>🚀 核心功能：</h4>
                <ol>
                    <li>实时语音识别宠物叫声</li>
                    <li>AI情感与需求分析</li>
                    <li>翻译结果以用户友好的文本/语音显示</li>
                </ol>
                
                <h4>💻 潜在技术栈：</h4>
                <ul>
                    <li>语音识别库 (Web Speech API / DeepSpeech)</li>
                    <li>LLM API (OpenAI / Gemini for翻译和情感分析)</li>
                    <li>前端框架 (React / Vue / Svelte)</li>
                </ul>
                
                <h4>🔮 创新点与挑战：</h4>
                <p><strong>创新点：</strong> 提供与宠物沟通的新维度。</p>
                <p><strong>挑战：</strong> 识别准确性，处理不同宠物的独特声音模式。</p>
                
                <div class="inspiration-footer">
                    <p>🎉 恭喜！你的创意宝可梦已经孵化成功！</p>
                </div>
            </div>
        </div>
    `;
    
    // 只替换result-content部分，或者如果没有则替换整个内容但保留按钮
    const resultContent = resultDisplay.querySelector('.result-content');
    if (resultContent) {
        resultContent.innerHTML = `
            <div class="inspiration-card">
                <h3>✨ 核心想法：智能宠物翻译器</h3>
                <p><strong>这是一个可以翻译你的宠物（猫狗）叫声的应用，通过AI分析其情感和需求。</strong></p>
                
                <h4>🧩 灵感来源：</h4>
                <ul>
                    <li>狗狗/猫猫叫声识别</li>
                    <li>ChatGPT语言模型</li>
                    <li>宝可梦中的语言互通（精灵宝可梦动画片中的"宝可梦翻译器"）</li>
                </ul>
                
                <h4>🎯 目标用户：</h4>
                <p>宠物主人，对宠物沟通有兴趣的用户。</p>
                
                <h4>🚀 核心功能：</h4>
                <ol>
                    <li>实时语音识别宠物叫声</li>
                    <li>AI情感与需求分析</li>
                    <li>翻译结果以用户友好的文本/语音显示</li>
                </ol>
                
                <h4>💻 潜在技术栈：</h4>
                <ul>
                    <li>语音识别库 (Web Speech API / DeepSpeech)</li>
                    <li>LLM API (OpenAI / Gemini for翻译和情感分析)</li>
                    <li>前端框架 (React / Vue / Svelte)</li>
                </ul>
                
                <h4>🔮 创新点与挑战：</h4>
                <p><strong>创新点：</strong> 提供与宠物沟通的新维度。</p>
                <p><strong>挑战：</strong> 识别准确性，处理不同宠物的独特声音模式。</p>
                
                <div class="inspiration-footer">
                    <p>🎉 恭喜！你的创意宝可梦已经孵化成功！</p>
                </div>
            </div>
        `;
    } else {
        resultDisplay.innerHTML = inspirationContent;
    }
    
    // 滚动到结果区域
    resultDisplay.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
    });
}

/**
 * 显示AI生成的灵感内容
 * @param {string} aiResponseMarkdown - AI生成的Markdown格式内容
 */
function displayAIInspiration(aiResponseMarkdown) {
    console.log('🎉 显示AI生成的灵感内容...');
    console.log('📝 原始AI响应:', aiResponseMarkdown);
    
    if (!resultDisplay) {
        console.error('❌ 未找到结果显示区域');
        return;
    }
    
    // 检查输入参数是否有效
    if (!aiResponseMarkdown || typeof aiResponseMarkdown !== 'string') {
        console.error('❌ AI响应内容无效:', aiResponseMarkdown);
        showErrorMessage('AI响应内容格式异常，请重新生成。');
        return;
    }

    // 检查是否包含"undefined"字符串并清理
    let cleanedInput = aiResponseMarkdown;
    if (cleanedInput.includes('undefined')) {
        console.warn('⚠️ 检测到undefined字符串，正在清理...');
        cleanedInput = cleanedInput.replace(/undefined/g, '').replace(/\s+/g, ' ').trim();
    }
    
    // 按行分割并清理
    let lines = cleanedInput.split('\n').map(line => line.trim()).filter(line => {
        // 过滤掉空行、只有#的行、包含undefined的行
        return line !== '' && line !== '#' && !line.toLowerCase().includes('undefined');
    });

    console.log('🧹 清理后的行数组:', lines);

    // 确保有内容可处理
    if (lines.length === 0) {
        console.error('❌ 清理后没有有效内容');
        showErrorMessage('处理AI响应时出现问题，内容为空。');
        return;
    }

    // 重新构建HTML结构
    let htmlContent = '';
    let currentList = null; // 'ul' 或 'ol'
    let listItems = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        try {
            // 处理三级标题 ### 
            if (line.startsWith('### ')) {
                // 结束之前的列表
                if (currentList) {
                    htmlContent += `<${currentList}>${listItems.join('')}</${currentList}>`;
                    currentList = null;
                    listItems = [];
                }
                
                const title = line.replace(/^### /, '').trim();
                htmlContent += `<h3>${title}</h3>`;
                continue;
            }
            
            // 处理四级标题 ####
            if (line.startsWith('#### ')) {
                // 结束之前的列表
                if (currentList) {
                    htmlContent += `<${currentList}>${listItems.join('')}</${currentList}>`;
                    currentList = null;
                    listItems = [];
                }
                
                const subtitle = line.replace(/^#### /, '').trim();
                htmlContent += `<h4>${subtitle}</h4>`;
                continue;
            }
            
            // 处理无序列表项 -
            if (line.startsWith('- ')) {
                // 如果之前不是无序列表，结束之前的列表并开始新的
                if (currentList && currentList !== 'ul') {
                    htmlContent += `<${currentList}>${listItems.join('')}</${currentList}>`;
                    listItems = [];
                }
                currentList = 'ul';
                
                const listItem = line.replace(/^- /, '').trim();
                listItems.push(`<li>${listItem}</li>`);
                continue;
            }
            
            // 处理有序列表项 数字.
            if (/^\d+\.\s/.test(line)) {
                // 如果之前不是有序列表，结束之前的列表并开始新的
                if (currentList && currentList !== 'ol') {
                    htmlContent += `<${currentList}>${listItems.join('')}</${currentList}>`;
                    listItems = [];
                }
                currentList = 'ol';
                
                const listItem = line.replace(/^\d+\.\s/, '').trim();
                listItems.push(`<li>${listItem}</li>`);
                continue;
            }
            
            // 普通段落文本
            if (line !== '') {
                // 结束之前的列表
                if (currentList) {
                    htmlContent += `<${currentList}>${listItems.join('')}</${currentList}>`;
                    currentList = null;
                    listItems = [];
                }
                
                // 处理粗体标记 **text**
                let processedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                
                // 如果这行看起来像是独立的段落，用p标签包装
                htmlContent += `<p>${processedLine}</p>`;
            }
            
        } catch (error) {
            console.error('❌ 处理行时发生错误:', line, error);
            // 跳过有问题的行，继续处理
            continue;
        }
    }
    
    // 结束最后的列表（如果有）
    if (currentList && listItems.length > 0) {
        htmlContent += `<${currentList}>${listItems.join('')}</${currentList}>`;
    }

    // 最终清理
    htmlContent = htmlContent.replace(/undefined/g, '').trim();

    // 最终检查
    if (!htmlContent || htmlContent === '') {
        console.error('❌ 最终HTML内容为空');
        showErrorMessage('生成的内容无法正确显示，请重新尝试。');
        return;
    }

    console.log('✅ 最终HTML内容:', htmlContent);

    // 创建完整的结果HTML结构
    const resultHTML = `
        <div class="result-container ai-burst">
            <h2>🌟 AI灵感宝可梦诞生！</h2>
            <div class="inspiration-card ai-generated pop-in">
                ${htmlContent}
                <div class="ai-footer">
                    <p>✨ 恭喜！您的专属AI创意宝可梦已经成功孵化！</p>
                    <p>🤖 由 DeepSeek AI 智能生成</p>
                </div>
            </div>
        </div>
    `;
    
    // 只替换result-content部分，保留保存图片按钮
    const resultContent = resultDisplay.querySelector('.result-content');
    if (resultContent) {
        resultContent.innerHTML = resultHTML;
        console.log('✅ AI内容已显示在result-content中');
    } else {
        // 如果没有找到result-content，则替换整个resultDisplay但保留按钮
        const actionButtonContainer = resultDisplay.querySelector('.action-button-container');
        resultDisplay.innerHTML = `
            <h2>🌟 灵感宝可梦诞生！</h2>
            <div class="result-content">
                ${resultHTML}
            </div>
        `;
        // 重新添加按钮容器
        if (actionButtonContainer) {
            resultDisplay.appendChild(actionButtonContainer);
        }
        console.log('✅ AI内容已显示，按钮容器已保留');
    }
    
    // 显示保存图片按钮
    console.log('🔍 尝试显示保存图片按钮...');
    const actionButtonContainer = document.querySelector('.action-button-container');
    console.log('🔍 找到按钮容器:', actionButtonContainer);
    
    if (actionButtonContainer) {
        actionButtonContainer.style.display = 'block';
        console.log('✅ 保存图片按钮容器已显示');
        
        // 重置按钮状态
        const saveButton = document.getElementById('saveImageButton');
        console.log('🔍 找到保存按钮:', saveButton);
        
        if (saveButton) {
            saveButton.disabled = false;
            saveButton.textContent = '保存图片 🖼️';
            saveButton.style.backgroundColor = '';
            console.log('✅ 保存图片按钮状态已重置');
        }
    } else {
        console.error('❌ 未找到保存图片按钮容器');
    }
    
    // 滚动到结果区域
    resultDisplay.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
    });
    
    console.log('🎉 AI灵感展示完成！');
}

/**
 * 处理生成按钮点击事件
 */
async function handleGenerateButtonClick() {
    console.log('🎯 生成按钮被点击！');
    
    if (!generateButton) return;
    
    try {
        // ===== 第一阶段：充能动画 =====
        console.log('⚡ 开始精灵球充能动画...');
        generateButton.classList.add('is-charging');
        
        // 禁用按钮防止重复点击
        generateButton.disabled = true;
        
        // 收集用户输入数据
        const userData = collectInputs();
        console.log('📊 收集到的用户数据:', userData);
        
        // 验证用户输入
        const validation = validateInputs(userData);
        
        // 显示验证警告（如果有）
        if (validation.warnings.length > 0) {
            console.warn('⚠️ 输入建议:', validation.warnings);
        }
        
        // 构建AI提示词
        const promptPayload = buildAIPrompt(userData);
        console.log('🎨 构建的提示词载荷:', promptPayload);
        
        // 等待充能动画完成（1.5秒）
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // ===== 第二阶段：开启动画 + 显示加载 =====
        console.log('🔥 开始精灵球开启动画...');
        
        // 移除充能状态，添加开启状态
        generateButton.classList.remove('is-charging');
        generateButton.classList.add('is-opening');
        
        // 短暂延迟后显示加载动画
        setTimeout(() => {
            showLoadingAnimation();
        }, 500);
        
        // 等待开启动画的主要部分完成（1秒）
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // ===== 第三阶段：AI调用 =====
        try {
            console.log('🤖 开始调用AI API...');
            const aiResponseMarkdown = await callAIApi(promptPayload);
            
            // ===== 第四阶段：结果展示动画 =====
            if (aiResponseMarkdown && aiResponseMarkdown.trim() !== '') {
                console.log('✨ 准备展示AI结果...');
                
                // 等待开启动画完全结束
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // 显示AI生成的内容（带动画）
                displayAIInspiration(aiResponseMarkdown);
                
                console.log('🎉 AI灵感展示完成！');
                
            } else {
                // 如果AI返回空内容
                console.log('⚠️ AI返回空内容，显示错误信息');
                await new Promise(resolve => setTimeout(resolve, 1000));
                showErrorMessage('AI生成的内容为空，请尝试提供更多输入信息或重新生成。');
            }
            
        } catch (error) {
            console.error('🚨 AI调用过程中发生错误:', error);
            await new Promise(resolve => setTimeout(resolve, 1000));
            showErrorMessage(`生成过程中发生错误: ${error.message}`);
        }
        
        // ===== 第五阶段：按钮恢复 =====
        console.log('🔄 恢复按钮状态...');
        
        // 清理动画类并恢复按钮
        setTimeout(() => {
            generateButton.classList.remove('is-opening');
            generateButton.classList.add('reset-animation');
            generateButton.disabled = false;
            
            // 清理重置动画类
            setTimeout(() => {
                generateButton.classList.remove('reset-animation');
            }, 1000);
            
        }, 500);
        
    } catch (error) {
        // 全局错误处理
        console.error('🚨 生成过程中发生严重错误:', error);
        
        // 恢复按钮状态
        generateButton.classList.remove('is-charging', 'is-opening');
        generateButton.classList.add('reset-animation');
        generateButton.disabled = false;
        
        // 显示错误
        showErrorMessage(`处理请求时发生错误: ${error.message}`);
        
        // 清理重置动画类
        setTimeout(() => {
            generateButton.classList.remove('reset-animation');
        }, 1000);
    }
}

/**
 * 处理示例按钮点击事件
 * @param {HTMLElement} button - 被点击的示例按钮
 */
function handleExampleButtonClick(button) {
    const exampleText = button.getAttribute('data-text');
    const fusionInput = document.getElementById('fusionPrototypes');
    
    if (!fusionInput || !exampleText) return;
    
    // 添加点击动画效果
    button.style.transform = 'translateY(-1px) scale(0.98)';
    
    // 如果输入框已有内容，用逗号分隔添加新内容
    if (fusionInput.value.trim() !== '') {
        fusionInput.value += ', ' + exampleText;
    } else {
        fusionInput.value = exampleText;
    }
    
    // 添加输入框聚焦效果
    fusionInput.focus();
    fusionInput.style.borderColor = '#e74c3c';
    
    // 恢复按钮状态
    setTimeout(() => {
        button.style.transform = '';
        fusionInput.style.borderColor = '#fd79a8'; // Revert to original or default focus color
    }, 150);
    
    console.log('✨ 示例文本已添加:', exampleText);
}

/**
 * 处理保存图片按钮点击事件
 */
async function handleSaveImageClick() {
    if (!saveImageButton || !resultDisplay) return;

    console.log('🖼️ 保存图片按钮被点击！');

    try {
        // 获取目标元素：AI生成的灵感卡片
        const resultContent = resultDisplay.querySelector('.result-content');
        const inspirationCard = resultContent ? resultContent.querySelector('.inspiration-card') : null;
        
        // 前置检查：如果没有灵感卡片，显示提示
        if (!inspirationCard) {
            console.warn('⚠️ 没有找到可保存的灵感卡片');
            showErrorMessage('请先生成AI灵感，然后再保存图片！', true);
            return;
        }

        // 检查是否为占位符内容
        const placeholderText = resultContent.querySelector('.placeholder-text');
        if (placeholderText && placeholderText.offsetParent !== null) {
            console.warn('⚠️ 当前显示的是占位符内容');
            showErrorMessage('请先生成AI灵感，当前是初始占位符。', true);
            return;
        }

        // 临时禁用按钮并显示进度提示
        saveImageButton.disabled = true;
        saveImageButton.textContent = '生成中...请稍候 ⏳';
        
        console.log('🎨 开始生成图片...');

        // 临时隐藏 ai-footer（包含"恭喜"和"由 DeepSeek AI 智能生成"的文字）
        const aiFooter = inspirationCard.querySelector('.ai-footer');
        let footerOriginalDisplay = null;
        if (aiFooter) {
            footerOriginalDisplay = aiFooter.style.display;
            aiFooter.style.display = 'none';
            console.log('✅ 已临时隐藏AI页脚文字');
        }

        // 滚动到灵感卡片顶部，确保完整可见
        inspirationCard.scrollIntoView({ behavior: 'instant', block: 'start' });
        
        // 等待一小段时间确保滚动和布局完成
        await new Promise(resolve => setTimeout(resolve, 300));

        // 使用html2canvas渲染灵感卡片（完整内容）
        const canvas = await html2canvas(inspirationCard, {
            scale: 2,                    // 高分辨率
            logging: false,              // 减少控制台输出
            useCORS: true,               // 支持跨域资源
            allowTaint: true,            // 允许跨域图片
            backgroundColor: '#ffffff',  // 设置背景色
            scrollX: 0,                  // 重置水平滚动
            scrollY: 0,                  // 重置垂直滚动
            // 移除width和height限制，让html2canvas自动计算完整尺寸
            foreignObjectRendering: false, // 提高兼容性
            imageTimeout: 15000,         // 增加图片加载超时时间
            removeContainer: true        // 渲染后清理临时容器
        });

        // 恢复 ai-footer 的显示状态
        if (aiFooter && footerOriginalDisplay !== null) {
            aiFooter.style.display = footerOriginalDisplay;
            console.log('✅ 已恢复AI页脚文字显示');
        }

        console.log('✅ 图片渲染完成');

        // 获取图片的Data URL
        const dataURL = canvas.toDataURL('image/png');
        
        // 生成文件名（包含时间戳）
        const now = new Date();
        const timestamp = now.getFullYear() + 
            String(now.getMonth() + 1).padStart(2, '0') + 
            String(now.getDate()).padStart(2, '0') + '-' +
            String(now.getHours()).padStart(2, '0') + 
            String(now.getMinutes()).padStart(2, '0');
        const filename = `灵感精灵球-创意灵感-${timestamp}.png`;

        // 创建临时下载链接并触发下载
        const downloadLink = document.createElement('a');
        downloadLink.href = dataURL;
        downloadLink.download = filename;
        downloadLink.style.display = 'none';
        
        // 添加到DOM，触发下载，然后移除
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        console.log('📁 图片下载已触发:', filename);

        // 显示成功状态
        saveImageButton.textContent = '已保存！ 🎉';
        saveImageButton.style.backgroundColor = '#2ecc71';
        
        // 3秒后恢复按钮状态
        setTimeout(() => {
            saveImageButton.disabled = false;
            saveImageButton.textContent = '保存图片 🖼️';
            saveImageButton.style.backgroundColor = '';
        }, 3000);

    } catch (error) {
        console.error('❌ 保存图片时发生错误:', error);
        
        // 如果出错，确保恢复 ai-footer 显示
        const aiFooter = document.querySelector('.ai-footer');
        if (aiFooter && aiFooter.style.display === 'none') {
            aiFooter.style.display = '';
            console.log('✅ 错误处理：已恢复AI页脚文字显示');
        }
        
        // 显示用户友好的错误信息
        let errorMessage = '图片生成失败，请稍后再试。';
        if (error.message.includes('html2canvas')) {
            errorMessage = '图片渲染失败，请检查浏览器兼容性。';
        } else if (error.message.includes('download')) {
            errorMessage = '图片下载失败，请检查浏览器设置。';
        }
        
        showErrorMessage(errorMessage, true);
        
        // 恢复按钮状态
        saveImageButton.disabled = false;
        saveImageButton.textContent = '保存图片 🖼️';
        saveImageButton.style.backgroundColor = '';
    }
}

/**
 * 初始化所有事件监听器
 */
function initEventListeners() {
    console.log('🎮 初始化事件监听器...');
    
    // 1. 生成按钮事件监听器
    if (generateButton) {
        generateButton.addEventListener('click', handleGenerateButtonClick);
        console.log('✅ 生成按钮事件监听器已设置');
    } else {
        console.error('❌ 未找到生成按钮元素');
    }
    
    // 2. 示例按钮事件监听器
    const exampleButtons = document.querySelectorAll('.example-btn');
    if (exampleButtons.length > 0) {
        exampleButtons.forEach(button => {
            button.addEventListener('click', function() {
                handleExampleButtonClick(this);
            });
        });
        console.log(`✅ ${exampleButtons.length} 个示例按钮事件监听器已设置`);
    } else {
        console.warn('⚠️ 未找到示例按钮元素');
    }

    // 3. 保存图片按钮事件监听器
    if (saveImageButton) {
        saveImageButton.addEventListener('click', handleSaveImageClick);
        console.log('✅ 保存图片按钮事件监听器已设置');
    } else {
        console.warn('⚠️ 未找到保存图片按钮元素');
    }
    
    // 4. 添加表单输入变化监听（可选，用于实时反馈）
    const allInputs = document.querySelectorAll('input, textarea, select');
    console.log(`📊 检测到 ${allInputs.length} 个表单元素`);
    
    // 5. 添加键盘快捷键支持（可选）
    document.addEventListener('keydown', function(event) {
        // Ctrl + Enter 快速生成
        if (event.ctrlKey && event.key === 'Enter') {
            event.preventDefault();
            if (generateButton && !generateButton.disabled) {
                handleGenerateButtonClick();
                console.log('⌨️ 检测到快捷键 Ctrl+Enter，触发生成功能');
            }
        }
    });
    
    console.log('🎯 所有事件监听器初始化完成！');
}

/**
 * 应用初始化函数
 */
function initApp() {
    console.log('🚀 灵感精灵球应用初始化中...');

    // Initialize DOM elements
    generateButton = document.getElementById('generateButton');
    resultDisplay = document.getElementById('resultDisplay');
    saveImageButton = document.getElementById('saveImageButton');
    
    // 初始化事件监听器
    initEventListeners();
    
    // 初始时隐藏保存图片按钮
    const actionButtonContainer = document.querySelector('.action-button-container');
    if (actionButtonContainer) {
        actionButtonContainer.style.display = 'none';
        console.log('✅ 保存图片按钮已初始隐藏');
    }
    
    // 输出调试信息
    console.log('🎮 灵感精灵球已准备就绪！');
    console.log('✨ 点击生成按钮来孵化你的创意宝可梦！');
    console.log('💡 提示：使用 Ctrl+Enter 快捷键也可以快速生成灵感');
    console.log('🔧 当前阶段：第四阶段 - 保存图片功能已添加');
    console.log('🔑 DeepSeek API已配置完成');
    console.log('🎆 新功能：保存图片功能！');
}

// 确保DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', initApp); 