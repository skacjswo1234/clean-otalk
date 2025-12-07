// 문의 상세 조회, 상태 업데이트, 삭제
export async function onRequest(context) {
  const { request, env, params } = context;
  const db = env['clean-otalk-db'];
  const id = params.id;

  // CORS 헤더
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // OPTIONS 요청 처리
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // GET: 문의 상세 조회
  if (request.method === 'GET') {
    try {
      const result = await db.prepare(
        'SELECT * FROM inquiries WHERE id = ?'
      ).bind(id).first();

      if (!result) {
        return new Response(JSON.stringify({ error: '문의를 찾을 수 없습니다.' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error fetching inquiry detail:', error);
      return new Response(JSON.stringify({ error: '문의 상세 정보를 불러오는데 실패했습니다.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  // PATCH: 상태 업데이트
  if (request.method === 'PATCH') {
    try {
      const { status } = await request.json();

      if (!status) {
        return new Response(JSON.stringify({ error: '상태값을 입력해주세요.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 유효한 상태값 확인
      const validStatuses = ['new', 'read', 'processing', 'completed'];
      if (!validStatuses.includes(status)) {
        return new Response(JSON.stringify({ error: '유효하지 않은 상태값입니다.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 상태 업데이트
      await db.prepare(
        'UPDATE inquiries SET status = ?, updated_at = datetime("now") WHERE id = ?'
      ).bind(status, id).run();

      return new Response(JSON.stringify({ 
        success: true,
        message: '상태가 업데이트되었습니다.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      return new Response(JSON.stringify({ error: '상태 업데이트 중 오류가 발생했습니다.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  // DELETE: 문의 삭제
  if (request.method === 'DELETE') {
    try {
      // 문의 삭제
      const result = await db.prepare(
        'DELETE FROM inquiries WHERE id = ?'
      ).bind(id).run();

      if (result.meta.changes === 0) {
        return new Response(JSON.stringify({ error: '문의를 찾을 수 없습니다.' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ 
        success: true,
        message: '문의가 삭제되었습니다.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      return new Response(JSON.stringify({ error: '문의 삭제 중 오류가 발생했습니다.' }), {
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

