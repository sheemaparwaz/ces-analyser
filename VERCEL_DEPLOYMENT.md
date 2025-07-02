# Vercel Deployment Guide for Zendesk Integration

## 🚀 Quick Deployment Steps

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy Your App

```bash
vercel --prod
```

## 📋 What We've Set Up

### ✅ Serverless Function (`api/zendesk.js`)

- Proxies all Zendesk API calls to bypass CORS
- Handles authentication with your credentials
- Supports GET, POST, PUT, DELETE methods
- Automatic error handling and logging

### ✅ Live API Service (`src/lib/zendeskApiLive.ts`)

- Uses Vercel proxy instead of direct API calls
- Transforms Zendesk data to your app format
- Extracts CES scores from custom field `31797439524887`
- Calculates real analytics from your tickets

### ✅ Smart Data Source Switching

- Automatically tries live connection first
- Falls back to demo data if proxy unavailable
- Shows connection status in settings
- Toast notifications for connection success

## 🔧 How It Works

1. **App tries live connection** → `/api/zendesk/tickets.json`
2. **Vercel function proxies** → `https://builderio.zendesk.com/api/v2/tickets.json`
3. **Returns real data** → Your dashboard shows live Zendesk tickets!

## 📊 What You'll See

Once deployed, your app will:

- ✅ **Fetch real tickets** from your Zendesk
- ✅ **Show actual CES scores** from custom field
- ✅ **Calculate live analytics** from your data
- ✅ **Update CES scores** directly in Zendesk
- ✅ **Display real trends** and insights

## 🎯 Testing After Deployment

1. **Check Settings Dialog** (⚙️ icon) - should show "Connected via Vercel proxy"
2. **View Dashboard** - real ticket counts and CES averages
3. **Browse Ticket Analysis** - your actual tickets with CES scores
4. **Test Predictions** - AI analysis of your real data

## 🐛 Troubleshooting

### If connection still fails:

1. Check Vercel function logs: `vercel logs`
2. Verify your Zendesk credentials in the proxy
3. Ensure CES custom field exists with ID `31797439524887`

### Common Issues:

- **"API path is required"** → Check Vercel routing
- **"401 Unauthorized"** → Verify Zendesk credentials
- **"Field not found"** → Confirm CES field ID

## 🔐 Security Note

Your API token is securely stored in the Vercel function (server-side) and never exposed to browsers. This is much safer than frontend-only solutions.

## 🎉 Ready to Deploy!

Run `vercel --prod` and your CES Analyzer will be live with real Zendesk data in minutes!
