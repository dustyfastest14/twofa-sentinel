export async function onRequest(context) {
  const { request } = context;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, PUT, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Webdav-Url',
      },
    });
  }

  const targetUrl = request.headers.get('X-Webdav-Url');
  if (!targetUrl) {
    return new Response(JSON.stringify({ error: 'Missing X-Webdav-Url header' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  const authHeader = request.headers.get('Authorization');
  const headers = {};
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  try {
    let response;
    if (request.method === 'GET') {
      response = await fetch(targetUrl, {
        method: 'GET',
        headers,
      });
    } else if (request.method === 'PUT') {
      const contentType = request.headers.get('Content-Type') || 'application/json';
      headers['Content-Type'] = contentType;
      const body = await request.arrayBuffer();
      response = await fetch(targetUrl, {
        method: 'PUT',
        headers,
        body,
      });
    } else {
      return new Response(JSON.stringify({ error: 'Method not supported' }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const responseBody = await response.arrayBuffer();
    const respHeaders = new Headers();
    respHeaders.set('Access-Control-Allow-Origin', '*');
    respHeaders.set('Content-Type', response.headers.get('Content-Type') || 'application/octet-stream');
    respHeaders.set('X-Upstream-Status', response.status.toString());

    return new Response(responseBody, {
      status: response.status,
      headers: respHeaders,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'WebDAV proxy error' }), {
      status: 502,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
