/**
 * 提示词生成 API - Next.js Route Handler
 * 根据选定的框架和追问答案生成优化后的提示词
 */
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface GeneratePromptRequest {
  input: string;
  framework_id: string;
  clarification_answers: {
    goalClarity: string;
    targetAudience: string;
    contextCompleteness: string;
    formatRequirements: string;
    constraints: string;
  };
  attachment_content?: string;
  user_id?: string;
  account_type?: 'free' | 'pro';
  model?: string;
}

// 加载框架详细内容
function loadFrameworkContent(frameworkId: string): string {
  try {
    // 优先从 frontend/skills-main 读取（Vercel 部署）
    let frameworksDir = path.join(process.cwd(), 'skills-main', 'skills', 'prompt-optimizer', 'references', 'frameworks');
    
    if (!fs.existsSync(frameworksDir)) {
      // 尝试从上一级目录读取（本地开发）
      frameworksDir = path.join(process.cwd(), '..', 'skills-main', 'skills', 'prompt-optimizer', 'references', 'frameworks');
    }
    
    if (!fs.existsSync(frameworksDir)) {
      console.warn('Frameworks directory not found');
      return `# ${frameworkId}\n\n这是一个通用的 Prompt 优化框架。`;
    }
    
    const files = fs.readdirSync(frameworksDir);
    
    // 查找匹配的框架文件
    const matchingFile = files.find(file => {
      const fileName = file.replace('.md', '');
      return fileName.toLowerCase().includes(frameworkId.toLowerCase().replace(' framework', ''));
    });

    if (matchingFile) {
      return fs.readFileSync(path.join(frameworksDir, matchingFile), 'utf-8');
    }
  } catch (error) {
    console.error(`Error loading framework content for ${frameworkId}:`, error);
  }
  
  return `# ${frameworkId}\n\n这是一个通用的 Prompt 优化框架。`;
}

// 调用 DeepSeek API 生成优化后的提示词
async function generateOptimizedPrompt(
  userInput: string,
  frameworkContent: string,
  clarificationAnswers: any,
  attachmentContent?: string
): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const baseUrl = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';

  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY not configured');
  }

  const prompt = `你是一个专业的 AI Prompt 工程师。请根据以下信息生成一个优化后的 Markdown 格式提示词。

## 用户原始输入
${userInput}

## 选定的框架
${frameworkContent}

## 追问答案
- 目标清晰度：${clarificationAnswers.goalClarity}
- 目标受众：${clarificationAnswers.targetAudience}
- 上下文完整性：${clarificationAnswers.contextCompleteness}
- 格式要求：${clarificationAnswers.formatRequirements}
- 约束条件：${clarificationAnswers.constraints}

${attachmentContent ? `## 附件内容\n${attachmentContent}\n` : ''}

请按照选定的框架结构，结合用户的原始输入和追问答案，生成一个完整、专业的 Markdown 格式提示词。

要求：
1. 使用 Markdown 格式
2. 结构清晰，层次分明
3. 包含所有必要的上下文信息
4. 符合框架的最佳实践
5. 直接输出优化后的提示词，不要额外的解释

优化后的提示词：`;

  try {
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('DeepSeek API error:', error);
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '生成失败，请重试';
  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: GeneratePromptRequest = await request.json();
    
    // 验证必需字段
    if (!body.input || !body.framework_id || !body.clarification_answers) {
      return NextResponse.json(
        { error: '缺少必需字段' },
        { status: 400 }
      );
    }

    // 加载框架内容
    const frameworkContent = loadFrameworkContent(body.framework_id);

    // 生成优化后的提示词
    const optimizedPrompt = await generateOptimizedPrompt(
      body.input,
      frameworkContent,
      body.clarification_answers,
      body.attachment_content
    );

    // 生成版本 ID（简单实现）
    const versionId = `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({
      output: optimizedPrompt,
      framework_used: body.framework_id,
      version_id: versionId,
    });

  } catch (error: any) {
    console.error('Prompt generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
