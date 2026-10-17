// Proxy para optcgapi.com (One Piece). Se llama como /px/op/<ruta> (ver vercel.json).
// Normaliza SIEMPRE la barra final, porque esa API la exige y Vercel puede quitarla al reescribir.
module.exports = async (req, res) => {
  const raw = String((req.query && req.query.p) || '');
  let p;
  try { p = decodeURIComponent(raw); } catch (e) { p = raw; }
  p = p.replace(/^\/+|\/+$/g, '');
  if (!p || p.includes('..') || !/^[\w\-./ ]+$/.test(p)) {
    res.status(400).json({ error: 'ruta no válida' });
    return;
  }
  const upstream = 'https://optcgapi.com/api/' + p.split('/').map(encodeURIComponent).join('/') + '/';
  try {
    const r = await fetch(upstream, {
      redirect: 'follow',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; AbreSobres/1.0)'
      }
    });
    const body = await r.text();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', r.ok ? 'public, s-maxage=3600, stale-while-revalidate=86400' : 'no-store');
    res.status(r.status).send(body);
  } catch (e) {
    res.status(502).json({ error: 'No se pudo contactar con optcgapi: ' + e.message });
  }
};
