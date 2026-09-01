const { getStore } = require('@netlify/blobs');
const crypto = require('crypto');

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function checkAuth(event) {
  const expected = process.env.APP_PASSWORD;
  if (!expected) return false;
  const header = event.headers['authorization'] || event.headers['Authorization'] || '';
  const provided = header.replace(/^Bearer\s+/i, '');
  if (!provided) return false;
  return safeEqual(provided, expected);
}

exports.handler = async (event) => {
  const cors = {
    'Content-Type': 'application/json; charset=utf-8'
  };

  if (!checkAuth(event)) {
    return { statusCode: 401, headers: cors, body: JSON.stringify({ error: 'unauthorized' }) };
  }

  const store = getStore('yukyu-data');

  if (event.httpMethod === 'GET') {
    const data = await store.get('state', { type: 'json' });
    return { statusCode: 200, headers: cors, body: JSON.stringify(data || { employees: [] }) };
  }

  if (event.httpMethod === 'POST') {
    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch (e) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'invalid_json' }) };
    }
    if (!body || !Array.isArray(body.employees)) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'invalid_payload' }) };
    }
    await store.setJSON('state', { employees: body.employees });
    return { statusCode: 200, headers: cors, body: JSON.stringify({ ok: true }) };
  }

  return { statusCode: 405, headers: cors, body: JSON.stringify({ error: 'method_not_allowed' }) };
};
