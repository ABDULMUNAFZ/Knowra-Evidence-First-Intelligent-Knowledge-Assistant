import server from "../dist/server/server.js";

export default async function handler(req, res) {
  try {
    const protocol = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
    const url = new URL(req.url, `${protocol}://${host}`);

    const headers = new Headers();
    for (const [key, val] of Object.entries(req.headers)) {
      if (val != null) {
        if (Array.isArray(val)) {
          val.forEach((v) => headers.append(key, v));
        } else {
          headers.set(key, val);
        }
      }
    }

    let body = null;
    if (req.method !== "GET" && req.method !== "HEAD") {
      const buffers = [];
      for await (const chunk of req) {
        buffers.push(chunk);
      }
      body = Buffer.concat(buffers);
    }

    const request = new Request(url.href, {
      method: req.method,
      headers,
      body: body && body.length > 0 ? body : undefined,
    });

    const response = await server.fetch(request);

    res.statusCode = response.status;
    response.headers.forEach((val, key) => {
      res.setHeader(key, val);
    });

    const arrayBuffer = await response.arrayBuffer();
    res.end(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error("[Vercel API Handler Error]:", err);
    res.statusCode = 500;
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.end(`<!doctype html><html><body><h1>Server Error</h1><p>${err instanceof Error ? err.message : String(err)}</p></body></html>`);
  }
}
