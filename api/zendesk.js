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
    // Get the Zendesk API path from query parameters
    const { path, ...queryParams } = req.query;

    if (!path) {
      return res.status(400).json({ error: "API path is required" });
    }

    // Build the Zendesk API URL
    const zendeskUrl = `https://builderio.zendesk.com/api/v2/${Array.isArray(path) ? path.join("/") : path}`;

    // Add query parameters if they exist
    const url = new URL(zendeskUrl);
    Object.keys(queryParams).forEach((key) => {
      if (queryParams[key]) {
        url.searchParams.append(key, queryParams[key]);
      }
    });

    // Create authorization header
    const credentials = Buffer.from(
      "sheema@builder.io/token:rr6vo0JeEn867MXTgT9f1UvByuWzCxf76YTrjeRA",
    ).toString("base64");

    // Make the request to Zendesk
    const response = await fetch(url.toString(), {
      method: req.method,
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
        Accept: "application/json",
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
      return res.status(response.status).json({
        error: `Zendesk API error: ${response.status} ${response.statusText}`,
        details: await response.text().catch(() => "No details available"),
      });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
}
