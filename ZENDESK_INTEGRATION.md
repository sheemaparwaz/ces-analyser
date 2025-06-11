# Zendesk Integration Guide

## ⚠️ CORS Issue Solution

The "Failed to fetch" error occurs because **browsers block direct API calls to Zendesk due to CORS (Cross-Origin Resource Sharing) restrictions**. This is a security feature that prevents websites from making unauthorized requests to external APIs.

## 🔧 Solutions

### Option 1: Backend Proxy Server (Recommended)

Create a backend API that proxies requests to Zendesk:

```javascript
// Example Express.js backend (server.js)
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Proxy endpoint for Zendesk API
app.get("/api/zendesk/*", async (req, res) => {
  const zendeskUrl = `https://builderio.zendesk.com/api/v2${req.path.replace("/api/zendesk", "")}`;

  const response = await fetch(zendeskUrl, {
    headers: {
      Authorization: `Basic ${Buffer.from("sheema@builder.io/token:rr6vo0JeEn867MXTgT9f1UvByuWzCxf76YTrjeRA").toString("base64")}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  res.json(data);
});

app.listen(3001, () => {
  console.log("Proxy server running on http://localhost:3001");
});
```

Then update the frontend to use your proxy:

```typescript
// Update getZendeskBaseUrl() in src/lib/zendeskApi.ts
const getZendeskBaseUrl = () => {
  return `http://localhost:3001/api/zendesk`; // Use your backend proxy
};
```

### Option 2: Serverless Functions

Deploy serverless functions (Vercel, Netlify, AWS Lambda) to handle Zendesk API calls:

```javascript
// api/zendesk.js (Vercel example)
export default async function handler(req, res) {
  const { path } = req.query;

  const response = await fetch(`https://builderio.zendesk.com/api/v2/${path}`, {
    headers: {
      Authorization: `Basic ${Buffer.from("sheema@builder.io/token:rr6vo0JeEn867MXTgT9f1UvByuWzCxf76YTrjeRA").toString("base64")}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  res.json(data);
}
```

### Option 3: Development Proxy (Quick Testing)

For development testing, you can use a CORS proxy:

```bash
# Install cors-anywhere
npm install -g cors-anywhere

# Run proxy server
cors-anywhere

# Then update the API base URL to:
# http://localhost:8080/https://builderio.zendesk.com/api/v2
```

### Option 4: Browser Extension (Development Only)

Install a CORS browser extension like "CORS Unblock" for development testing only.

## 🎯 Current Status

The application is currently configured with:

- ✅ **Subdomain:** builderio
- ✅ **Email:** sheema@builder.io
- ✅ **Token:** rr6vo0JeEn867MXTgT9f1UvByuWzCxf76YTrjeRA
- ✅ **CES Field ID:** 31797439524887

## 🚀 Next Steps

1. **Choose a solution above** (Backend proxy recommended)
2. **Update the API base URL** in `src/lib/zendeskApi.ts`
3. **Test the connection** using the ⚙️ Settings dialog
4. **Switch to live data** once connected

## 💡 Demo Data

While setting up the backend integration, the application works perfectly with demo data that simulates your Zendesk structure.

## 🔒 Security Note

Never expose API tokens in frontend code. Always use environment variables and backend proxies for production applications.
