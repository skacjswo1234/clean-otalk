// 관리자 비밀번호 변경
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

  // POST: 비밀번호 변경
  if (request.method === 'POST') {
    try {
      const { currentPassword, newPassword } = await request.json();

      if (!currentPassword || !newPassword) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: '현재 비밀번호와 새 비밀번호를 모두 입력해주세요.' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (newPassword.length < 4) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: '새 비밀번호는 최소 4자 이상이어야 합니다.' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 현재 비밀번호 확인
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

      if (admin.password !== currentPassword) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: '현재 비밀번호가 일치하지 않습니다.' 
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 비밀번호 변경
      await db.prepare(
        'UPDATE admin SET password = ?, updated_at = datetime("now") WHERE id = (SELECT id FROM admin LIMIT 1)'
      ).bind(newPassword).run();

      return new Response(JSON.stringify({ 
        success: true,
        message: '비밀번호가 변경되었습니다.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error changing password:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: '비밀번호 변경 중 오류가 발생했습니다.' 
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

