// 문의 목록 조회 및 생성
export async function onRequest(context) {
  const { request, env } = context;
  const db = env['clean-otalk-db'];

  // CORS 헤더
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // OPTIONS 요청 처리
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // GET: 문의 목록 조회
  if (request.method === 'GET') {
    try {
      const result = await db.prepare(
        'SELECT * FROM inquiries ORDER BY created_at DESC'
      ).all();

      return new Response(JSON.stringify(result.results || []), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      return new Response(JSON.stringify({ error: '문의 목록을 불러오는데 실패했습니다.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  // POST: 문의 생성
  if (request.method === 'POST') {
    try {
      const data = await request.json();

      const result = await db.prepare(
        `INSERT INTO inquiries (name, phone, service, area, address, date, message, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`
      ).bind(
        data.name || '',
        data.phone || '',
        data.service || '',
        data.area || '',
        data.address || '',
        data.date || '',
        data.message || ''
      ).run();

      return new Response(JSON.stringify({ 
        success: true, 
        id: result.meta.last_row_id 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error creating inquiry:', error);
      return new Response(JSON.stringify({ error: '문의를 저장하는데 실패했습니다.' }), {
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

