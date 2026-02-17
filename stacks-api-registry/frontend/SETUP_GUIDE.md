# API Proxy Manager - Quick Setup Guide

## 🚀 Getting Started (3 Simple Steps!)

### Step 1: Connect Your Wallet
1. Open the application
2. Click "Connect Wallet" in the navbar
3. Authenticate with your Stacks wallet

### Step 2: Generate API Key (No Login Required!)
1. Click "Generate API Key" in the navbar
2. Your wallet address is automatically filled
3. Enter a name for your key (e.g., "My Frontend App")
4. Click "Generate API Key"
5. Copy and save the key securely
6. The key is automatically saved to your browser

**✨ No JWT or login required! Just your wallet address.**

### Step 3: Start Using API Proxy
1. Navigate to the "API Proxy" tab
2. Click "Create API Proxy"
3. Fill in the form and create your first proxy!

---

## 📋 Features

### API Key Management
- ✅ Generate keys using only your wallet address
- ✅ No authentication or login required
- ✅ Automatic localStorage persistence
- ✅ Copy to clipboard functionality
- ✅ Visual status indicator in navbar

### API Proxy Management
- ✅ Create new API proxies
- ✅ List all your proxies
- ✅ Edit proxy configuration
- ✅ Enable/disable proxies
- ✅ Delete proxies
- ✅ View proxy details

---

## 🔧 Configuration

### Environment Variables

The app uses `VITE_API_BASE_URL` to connect to the backend:

```env
# .env file
VITE_API_BASE_URL=http://localhost:4000
```

For production, update to your production API URL.

---

## 📖 How It Works

### Authentication Flow

```
1. User connects Stacks wallet
   ↓
2. User clicks "Generate API Key"
   ↓
3. Modal opens with wallet address pre-filled
   ↓
4. User enters key name
   ↓
5. API key generated using wallet address (no JWT!)
   ↓
6. Key saved to localStorage
   ↓
7. Key used for all API proxy operations
```

### API Proxy Operations

Once you have an API key, you can:

1. **Create Proxy**: Configure a new API wrapper
   - API Name
   - Original URL
   - Price per request (STX)
   - Network (Testnet/Mainnet)
   - Facilitator URL
   - Stacks Address

2. **Edit Proxy**: Update configuration
   - Change price
   - Update network
   - Modify facilitator URL

3. **Enable/Disable**: Toggle proxy status
   - Active proxies accept requests
   - Inactive proxies are paused

4. **Delete**: Remove proxy permanently
   - Confirmation required
   - Cannot be undone

---

## 🎯 API Endpoints Used

### Public Endpoint (No Auth)
- `POST /apis/keys/generate` - Generate API key with wallet address

### Authenticated Endpoints (API Key Required)
- `POST /apis` - Create API proxy
- `GET /apis` - List all proxies
- `GET /apis/:id` - Get single proxy
- `PATCH /apis/:id` - Update proxy
- `DELETE /apis/:id` - Delete proxy
- `GET /apis/:id/metrics` - Get usage metrics

---

## 💾 Data Storage

### localStorage Keys
- `x402_api_key` - Your generated API key
- Persists across browser sessions
- Cleared when you clear browser data

### State Management
- API key stored in App.tsx state
- Passed to child components via props
- Automatically loaded on mount

---

## 🐛 Troubleshooting

### "API Key Required" Message
**Problem:** Trying to use API Proxy without a key  
**Solution:** Click "Generate API Key" in navbar

### "Wallet address is required"
**Problem:** Trying to generate key without wallet  
**Solution:** Connect your wallet first

### API Calls Failing
**Problem:** Network or backend errors  
**Solution:** 
- Check backend is running
- Verify `VITE_API_BASE_URL` in `.env`
- Check browser console for errors

### Key Not Persisting
**Problem:** API key lost after refresh  
**Solution:**
- Check localStorage is enabled
- Verify key is saved: `localStorage.getItem('x402_api_key')`
- Try generating a new key

---

## 🔒 Security Notes

1. **API Key Storage**: Stored in localStorage (consider more secure options for production)
2. **No JWT Required**: Simplified authentication using wallet address
3. **HTTPS**: Always use HTTPS in production
4. **Environment Variables**: Keep sensitive config out of code
5. **Gitignore**: `.env` file is excluded from version control

---

## 📱 User Interface

### Navbar
```
[Logo] x402Guard    [Generate API Key] [Connect Wallet]
```

### Dashboard Tabs
```
[Registry API Rules] [API Proxy]
```

### API Proxy Tab States

**Without API Key:**
```
┌─────────────────────────────┐
│         🔑                  │
│   API Key Required          │
│                             │
│   Generate an API key from  │
│   the navbar to manage      │
│   your API proxies.         │
└─────────────────────────────┘
```

**With API Key - Empty:**
```
┌─────────────────────────────┐
│  [Refresh] [+ Create Proxy] │
│                             │
│         🔌                  │
│   No API Proxies            │
│                             │
│   Create your first API     │
│   proxy to get started.     │
└─────────────────────────────┘
```

**With API Key - List:**
```
┌─────────────────────────────┐
│  [Refresh] [+ Create Proxy] │
│                             │
│  ┌─────────────────────┐   │
│  │ Weather API [Active]│   │
│  │ Price: 0.5 STX      │   │
│  │ [Edit] [Disable]    │   │
│  └─────────────────────┘   │
└─────────────────────────────┘
```

---

## 🎨 Design System

### Colors
- **Orange (orange-500)**: Brand color, primary actions
- **Slate-900**: Primary text, buttons
- **Slate-600**: Secondary text
- **Green**: Success states, active status
- **Red**: Error states, delete actions

### Components
- Rounded corners: `rounded-xl`, `rounded-lg`
- Borders: `border-slate-200`
- Shadows: `shadow-sm`, `shadow-md`
- Transitions: `transition-colors`, `transition-shadow`

---

## 📚 Additional Resources

- **API Reference**: See `frontend-api-reference.md` for complete API documentation
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`
- **Testing Guide**: See `TESTING_CHECKLIST.md`
- **UI Flow**: See `UI_FLOW.md`

---

## ✅ Quick Checklist

Before you start:
- [ ] Backend server is running
- [ ] `.env` file is configured
- [ ] Wallet is connected
- [ ] API key is generated

Ready to create proxies:
- [ ] Navigate to API Proxy tab
- [ ] Click "Create API Proxy"
- [ ] Fill in all required fields
- [ ] Submit and test!

---

## 🆘 Need Help?

1. Check browser console for errors
2. Verify backend is running: `http://localhost:4000`
3. Check API key exists: `localStorage.getItem('x402_api_key')`
4. Review error messages in the UI
5. Consult the API reference documentation

---

**Happy coding! 🚀**

*Last updated: February 17, 2026*
