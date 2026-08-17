export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const forwardedProtocol = request.headers.get("x-forwarded-proto");
    const isLocalDevelopment = url.hostname === "localhost" || url.hostname === "127.0.0.1";

    if (!isLocalDevelopment && (url.protocol === "http:" || forwardedProtocol === "http")) {
      url.protocol = "https:";
      return Response.redirect(url.toString(), 301);
    }

    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

    if (headers.get("content-type")?.includes("text/html")) {
      const nonceBytes = crypto.getRandomValues(new Uint8Array(18));
      const nonce = btoa(String.fromCharCode(...nonceBytes));
      const policy = [
        "default-src 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "frame-ancestors 'none'",
        "form-action 'self'",
        `script-src 'self' 'nonce-${nonce}'`,
        `style-src-elem 'self' https://fonts.googleapis.com 'nonce-${nonce}'`,
        "style-src-attr 'unsafe-inline'",
        "font-src 'self' https://fonts.gstatic.com data:",
        "img-src 'self' data:",
        "connect-src 'self'",
        "media-src 'self'",
        "manifest-src 'self'",
        "worker-src 'self'",
        "upgrade-insecure-requests",
      ].join("; ");

      headers.set("Content-Security-Policy", policy);
      headers.delete("content-length");

      const htmlResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });

      return new HTMLRewriter()
        .on("script", { element: (element) => element.setAttribute("nonce", nonce) })
        .on("style", { element: (element) => element.setAttribute("nonce", nonce) })
        .transform(htmlResponse);
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
