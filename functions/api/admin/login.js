// 관리자 로그인
export async function onRequest(context) {
  const { request, env } = context;
  const db = env['clean-otalk-db'];

  // CORS 헤더
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // OPTIONS 요청 처리
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // POST: 로그인
  if (request.method === 'POST') {
    try {
      const { password } = await request.json();

      if (!password) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: '비밀번호를 입력해주세요.' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 관리자 비밀번호 조회
      const admin = await db.prepare(
        'SELECT password FROM admin LIMIT 1'
      ).first();

      if (!admin) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: '관리자 정보를 찾을 수 없습니다.' 
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 비밀번호 비교
      if (admin.password === password) {
        return new Response(JSON.stringify({ 
          success: true 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        return new Response(JSON.stringify({ 
          success: false, 
          error: '비밀번호가 일치하지 않습니다.' 
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } catch (error) {
      console.error('Error during login:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: '로그인 처리 중 오류가 발생했습니다.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response('Method not allowed', {
    status: 405,
    headers: corsHeaders,
  });
}

