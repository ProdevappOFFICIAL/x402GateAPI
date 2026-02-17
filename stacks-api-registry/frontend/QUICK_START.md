# Quick Start - API Proxy Manager

## 🚀 Get Started in 3 Steps

### Step 1: Setup Environment
```bash
cd frontend
cp .env.example .env
# Edit .env if needed (default: http://localhost:4000)
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Use the App
1. Open http://localhost:5173
2. Connect your Stacks wallet
3. Click "Generate API Key" in navbar
4. Go to "API Proxy" tab
5. Create your first API proxy!

## 📋 Quick Reference

### Generate API Key
```
Navbar → "Generate API Key" → Wallet address auto-filled → Enter name → Generate
✨ No login required!
```

### Create API Proxy
```
API Proxy Tab → "Create API Proxy" → Fill form → Create
```

### Edit API Proxy
```
API Proxy Tab → Click "Edit" on any API → Update → Save
```

### Enable/Disable API
```
API Proxy Tab → Click "Enable/Disable" button
```

## 🔑 Important Notes

- **API Key**: Required for all proxy operations
- **No JWT Required**: Just your wallet address! ✨
- **Persistence**: API key auto-saves to localStorage
- **Backend**: Must be running on the URL specified in `.env`

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "API Key Required" | Click "Generate API Key" in navbar |
| "Wallet address is required" | Connect your wallet first |
| API calls fail | Check backend is running and VITE_API_BASE_URL is correct |
| Network errors | Check browser console and verify CORS settings |

## 📚 More Info

- **Quick Setup**: See `SETUP_GUIDE.md` for step-by-step instructions
- **API Reference**: See `frontend-api-reference.md` (now in `API_PROXY_SETUP.md`)
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`

## 🎯 Features

✅ Generate API keys
✅ Create API proxies
✅ Edit proxy configuration
✅ Enable/disable proxies
✅ Delete proxies
✅ Real-time updates
✅ Error handling
✅ Responsive design

Happy coding! 🎉
