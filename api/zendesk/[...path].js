// Vercel serverless function to proxy Zendesk API requests
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    // Get the API path from the dynamic route
    const { path } = req.query;

    if (!path || !Array.isArray(path)) {
      return res.status(400).json({
        error: "API path is required",
        received: path,
      });
    }

    // Build the Zendesk API URL
    const apiPath = path.join("/");
    const zendeskUrl = `https://builderio.zendesk.com/api/v2/${apiPath}`;

    // Add query parameters from the original request
    const url = new URL(zendeskUrl);
    Object.keys(req.query).forEach((key) => {
      if (key !== "path" && req.query[key]) {
        url.searchParams.append(key, req.query[key]);
      }
    });

    // Create authorization header with your credentials
    const credentials = Buffer.from(
      "sheema@builder.io/token:rr6vo0JeEn867MXTgT9f1UvByuWzCxf76YTrjeRA",
    ).toString("base64");

    console.log("Proxying request to:", url.toString());

    // Make the request to Zendesk
    const response = await fetch(url.toString(), {
      method: req.method,
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "CES-Analyzer/1.0",
      },
      body:
        req.method !== "GET" && req.method !== "HEAD"
          ? JSON.stringify(req.body)
          : undefined,
    });

    if (!response.ok) {
      console.error(
        `Zendesk API error: ${response.status} ${response.statusText}`,
      );
      const errorText = await response.text().catch(() => "No error details");
      return res.status(response.status).json({
        error: `Zendesk API error: ${response.status} ${response.statusText}`,
        details: errorText,
        url: url.toString(),
      });
    }

    const data = await response.json();
    console.log("Zendesk response success, returning data");

    res.status(200).json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}
