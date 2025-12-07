export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS 헤더 설정
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // OPTIONS 요청 처리
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // 관리자 페이지 서빙
    if (path === '/admin' || path === '/admin.html') {
      const adminHtml = await fetch('https://raw.githubusercontent.com/your-repo/admin.html').catch(() => null);
      if (adminHtml) {
        return new Response(adminHtml.body, {
          headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
        });
      }
      // 로컬 파일 시스템에서는 직접 읽을 수 없으므로, 정적 파일로 배포해야 함
      return new Response('관리자 페이지를 로드할 수 없습니다. admin.html 파일을 정적 호스팅하세요.', {
        status: 404,
        headers: corsHeaders,
      });
    }

    // API 엔드포인트: 문의 목록 조회
    if (path === '/api/inquiries' && request.method === 'GET') {
      try {
        const db = env['clean-otalk-db'];
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

    // API 엔드포인트: 문의 상세 조회
    if (path.startsWith('/api/inquiries/') && request.method === 'GET') {
      try {
        const id = path.split('/').pop();
        const db = env['clean-otalk-db'];
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

    // API 엔드포인트: 문의 생성 (기존 폼에서 사용)
    if (path === '/api/inquiries' && request.method === 'POST') {
      try {
        const data = await request.json();
        const db = env['clean-otalk-db'];

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

    // 404 처리
    return new Response('Not Found', {
      status: 404,
      headers: corsHeaders,
    });
  },
};

