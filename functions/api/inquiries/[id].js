// 문의 상세 조회
export async function onRequest(context) {
  const { request, env, params } = context;
  const db = env['clean-otalk-db'];
  const id = params.id;

  // CORS 헤더
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

  return new Response('Method not allowed', {
    status: 405,
    headers: corsHeaders,
  });
}

