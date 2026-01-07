/**
 * 配额查询 API - Next.js Route Handler
 * 查询用户的每日生成配额
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 初始化 Supabase 客户端
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing');
  }

  return createClient(supabaseUrl, supabaseKey);
}

// 获取用户今日使用次数
async function getTodayUsage(userId: string): Promise<number> {
  try {
    const supabase = getSupabaseClient();
    
    // 获取今天的开始时间（UTC）
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    
    const { data, error } = await supabase
      .from('prompt_generations')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .gte('created_at', today.toISOString());

    if (error) {
      console.error('Error querying usage:', error);
      return 0;
    }

    return data?.length || 0;
  } catch (error) {
    console.error('Error getting today usage:', error);
    return 0;
  }
}

// 计算重置时间（UTC 午夜）
function getResetTime(timezoneOffset: number = 0): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  
  // 调整到用户时区
  const userTime = new Date(tomorrow.getTime() + timezoneOffset * 60 * 1000);
  return userTime.toISOString();
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id') || 'test_user';
    const accountType = (searchParams.get('account_type') || 'free') as 'free' | 'pro';
    const timezoneOffset = parseInt(searchParams.get('timezone_offset') || '0');

    // 获取今日使用次数
    const used = await getTodayUsage(userId);

    // 根据账户类型确定总配额
    const total = accountType === 'pro' ? 100 : 5;

    // 计算重置时间
    const resetTime = getResetTime(timezoneOffset);

    // 判断是否可以继续生成
    const canGenerate = used < total;

    return NextResponse.json({
      used,
      total,
      reset_time: resetTime,
      can_generate: canGenerate,
    });

  } catch (error: any) {
    console.error('Quota query error:', error);
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
