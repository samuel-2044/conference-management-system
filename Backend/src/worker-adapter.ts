import type { Env } from "./types";

export function createWorkerApp(expressApp: any) {
  return {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
      return handleExpressRequest(expressApp, request, env, ctx);
    },
  };
}

async function handleExpressRequest(
  app: any,
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": request.headers.get("origin") || "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  const url = new URL(request.url);

  // Read request body
  let body = "";
  const contentType = request.headers.get("content-type") || "";
  const isBodyMethod = ["POST", "PUT", "PATCH", "DELETE"].includes(request.method);
  if (isBodyMethod) {
    body = await request.text();
  }

  // Parse cookies
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies: Record<string, string> = {};
  for (const pair of cookieHeader.split(";")) {
    const [key, ...valueParts] = pair.split("=");
    if (key) {
      cookies[key.trim()] = valueParts.join("=").trim();
    }
  }

  // Build Express-compatible request object
  const req: any = {
    method: request.method,
    url: url.pathname + url.search,
    originalUrl: url.pathname + url.search,
    path: url.pathname,
    query: Object.fromEntries(url.searchParams.entries()),
    headers: Object.fromEntries(request.headers.entries()),
    cookies,
    body,
    rawBody: body,
    socket: { encrypted: request.protocol === "https:", remoteAddress: "127.0.0.1" },
    connection: { encrypted: request.protocol === "https:" },
    ip: "127.0.0.1",
    ips: [],
    route: undefined,
    baseUrl: "",
    fresh: false,
    stale: false,
    xhr: request.headers.get("x-requested-with") === "XMLHttpRequest",
    protocol: request.protocol,
    secure: request.protocol === "https:",
    subdomains: [],
    accepts: () => undefined,
    acceptsCharsets: () => undefined,
    acceptsEncodings: () => undefined,
    acceptsLanguages: () => undefined,
    range: () => undefined,
    param: () => undefined,
    is: () => undefined,
    get: (name: string) => request.headers.get(name.toLowerCase()) ?? "",
    env,
    ctx,
  };

  // Parse JSON body if applicable
  if (body && contentType.includes("application/json")) {
    try {
      req.body = JSON.parse(body);
    } catch {
      req.body = body;
    }
  }

  // --- Authentication: look up session user in D1 before calling Express ---
  const sessionId = cookies.session_id;
  if (sessionId && env.convene_db) {
    try {
      const user = await env.convene_db
        .prepare("SELECT * FROM users WHERE id = ?")
        .bind(sessionId)
        .first();
      if (user) {
        req.user = {
          id: user.id,
          roleId: user.role_id,
          name: user.name,
          email: user.email,
          roleName: user.role_name,
          status: user.status,
        };
      }
    } catch {
      // Auth lookup failure is not fatal; routes will handle 401
    }
  }

  // Build Express-compatible response object
  const responseHeaders: Record<string, string> = {};
  let bodyChunks: string[] = [];
  let finished = false;

  const res: any = {
    statusCode: 200,
    statusMessage: "",
    getHeader: (name: string) => responseHeaders[name.toLowerCase()],
    setHeader: (name: string, value: string | string[]) => {
      responseHeaders[name.toLowerCase()] = Array.isArray(value)
        ? value.join(", ")
        : String(value);
    },
    removeHeader: (name: string) => {
      delete responseHeaders[name.toLowerCase()];
    },
    writeHead: (code: number, headers?: Record<string, string>) => {
      res.statusCode = code;
      if (headers) {
        for (const [key, value] of Object.entries(headers)) {
          responseHeaders[key.toLowerCase()] = String(value);
        }
      }
    },
    write: (chunk: string | Buffer) => {
      bodyChunks.push(typeof chunk === "string" ? chunk : chunk.toString());
    },
    end: (chunk?: string | Buffer) => {
      if (chunk) {
        bodyChunks.push(typeof chunk === "string" ? chunk : chunk.toString());
      }
      finished = true;
    },
    status: (code: number) => {
      res.statusCode = code;
      return res;
    },
    json: (data: any) => {
      responseHeaders["content-type"] = "application/json";
      res.end(JSON.stringify(data));
    },
    send: (data: any) => {
      if (typeof data === "object") {
        responseHeaders["content-type"] = "application/json";
        res.end(JSON.stringify(data));
      } else {
        responseHeaders["content-type"] = "text/html";
        res.end(String(data));
      }
    },
    redirect: (url: string) => {
      responseHeaders["location"] = url;
      res.statusCode = 302;
      res.end();
    },
    cookie: (name: string, value: string, options?: any) => {
      let cookie = `${name}=${value}`;
      if (options?.maxAge) cookie += `; Max-Age=${options.maxAge}`;
      if (options?.path) cookie += `; Path=${options.path}`;
      if (options?.domain) cookie += `; Domain=${options.domain}`;
      if (options?.secure) cookie += `; Secure`;
      if (options?.httpOnly) cookie += `; HttpOnly`;
      if (options?.sameSite) {
        const value = String(options.sameSite);
        const normalized =
          value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
        cookie += `; SameSite=${normalized}`;
      }
      const existing = responseHeaders["set-cookie"] || "";
      responseHeaders["set-cookie"] = existing
        ? `${existing}, ${cookie}`
        : cookie;
    },
    clearCookie: (name: string, options?: any) => {
      res.cookie(name, "", { ...options, maxAge: 0 });
    },
    append: (name: string, value: string) => {
      const existing = responseHeaders[name.toLowerCase()] || "";
      responseHeaders[name.toLowerCase()] = existing
        ? `${existing}, ${value}`
        : value;
    },
    vary: () => {},
    attachment: (filename?: string) => {
      if (filename) {
        responseHeaders["content-disposition"] = `attachment; filename="${filename}"`;
      }
    },
    download: () => {},
    type: (type: string) => {
      responseHeaders["content-type"] = type;
      return res;
    },
    format: () => {},
    locals: {},
    render: () => {},
  };

  return new Promise((resolve) => {
    const originalEnd = res.end.bind(res);
    res.end = (chunk?: string | Buffer) => {
      if (chunk) {
        bodyChunks.push(typeof chunk === "string" ? chunk : chunk.toString());
      }
      finished = true;

      const responseBody = bodyChunks.join("");
      const headers: Record<string, string> = { ...responseHeaders };

      const setCookie = res.getHeader("set-cookie");
      if (setCookie) {
        headers["set-cookie"] = setCookie;
      }

      const webResponse = new Response(responseBody, {
        status: res.statusCode,
        headers: {
          ...headers,
          "Access-Control-Allow-Origin": request.headers.get("origin") || "*",
          "Access-Control-Allow-Credentials": "true",
        },
      });

      resolve(webResponse);
      return originalEnd(chunk);
    };

    try {
      app(req, res);
    } catch (err) {
      if (!finished) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: "Internal server error" }));
      }
    }

    if (finished) {
      const responseBody = bodyChunks.join("");
      const headers: Record<string, string> = { ...responseHeaders };
      const setCookie = res.getHeader("set-cookie");
      if (setCookie) {
        headers["set-cookie"] = setCookie;
      }
      resolve(new Response(responseBody, { 
        status: res.statusCode, 
        headers: {
          ...headers,
          "Access-Control-Allow-Origin": request.headers.get("origin") || "*",
          "Access-Control-Allow-Credentials": "true",
        }
      }));
    }
  });
}
