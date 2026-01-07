/**
 * 版本管理 API - Next.js Route Handler
 * 保存和查询提示词版本
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

// GET: 查询版本列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id') || 'test_user';
    const limit = parseInt(searchParams.get('limit') || '10');

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('prompt_versions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error querying versions:', error);
      return NextResponse.json(
        { error: 'Failed to query versions' },
        { status: 500 }
      );
    }

    // 格式化返回数据
    const versions = (data || []).map(v => ({
      id: v.id,
      user_id: v.user_id,
      content: v.content,
      type: v.type,
      created_at: v.created_at,
      formatted_title: `${v.type === 'save' ? '保存' : '优化'} - ${new Date(v.created_at).toLocaleString('zh-CN')}`,
    }));

    return NextResponse.json(versions);

  } catch (error: any) {
    console.error('Version query error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: 保存新版本
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.content) {
      return NextResponse.json(
        { error: '缺少必需字段: content' },
        { status: 400 }
      );
    }

    const userId = body.user_id || 'test_user';
    const content = body.content;
    const type = body.type || 'save';

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('prompt_versions')
      .insert({
        user_id: userId,
        content: content,
        type: type,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving version:', error);
      return NextResponse.json(
        { error: 'Failed to save version' },
        { status: 500 }
      );
    }

    // 格式化返回数据
    const version = {
      id: data.id,
      user_id: data.user_id,
      content: data.content,
      type: data.type,
      created_at: data.created_at,
      formatted_title: `${data.type === 'save' ? '保存' : '优化'} - ${new Date(data.created_at).toLocaleString('zh-CN')}`,
    };

    return NextResponse.json(version);

  } catch (error: any) {
    console.error('Version save error:', error);
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
