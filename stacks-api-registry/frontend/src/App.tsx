import { useState, useEffect } from 'react';
import ApiForm from './components/ApiForm';
import ApiList from './components/ApiList';
import LandingPage from './components/LandingPage';
import ApiProxyManager from './components/ApiProxyManager';
import ApiKeyManager from './components/ApiKeyManager';
import Docs from './components/Docs';
import { createApi, updateApi, deleteApi, getApi, getAllApis } from './utils/stacks';
import { ApiConfig, ApiData } from './types';
import ConnectWallet, { userSession } from './components/connectWallet';
import { ShieldCheck } from 'lucide-react';

// Define the available tabs
type TabType = 'registry' | 'proxy' | 'docs';

function App() {
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('registry'); // Tab State
  
  const [userAddress, setUserAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentApi, setCurrentApi] = useState<ApiConfig | undefined>();
  const [apis, setApis] = useState<Array<ApiData & { apiName: string }>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);

  // 1. Initial Client Check
useEffect(() => {
  setIsClient(true);
}, []);

// 2. Auth Check
useEffect(() => {
  if (userSession.isUserSignedIn()) {
    setIsAuthenticated(true);
    const userData = userSession.loadUserData();
    setUserAddress(userData.profile.stxAddress.testnet);
  }
}, []);

// 3. New: Load APIs automatically once authenticated
useEffect(() => {
  if (isAuthenticated) {
    handleLoadAll();
    // Check for existing API key in localStorage
    const existingKey = localStorage.getItem('x402_api_key');
    if (existingKey) {
      setApiKey(existingKey);
    }
    // JWT token is not used - API key authentication is sufficient
    // If you need JWT authentication, implement proper wallet-based login
  }
}, [isAuthenticated]); // Only runs when isAuthenticated becomes true




  // --- Logic Handlers (Existing) ---
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setMessage('Please enter an API name to search');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const apiData = await getApi(searchQuery.trim());
      const existingIndex = apis.findIndex(a => a.apiName === searchQuery.trim());
      if (existingIndex >= 0) {
        const updatedApis = [...apis];
        updatedApis[existingIndex] = { ...apiData, apiName: searchQuery.trim() };
        setApis(updatedApis);
      } else {
        setApis([...apis, { ...apiData, apiName: searchQuery.trim() }]);
      }
      setMessage(`✅ API "${searchQuery.trim()}" loaded successfully!`);
      setSearchQuery('');
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'API not found'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadAll = async () => {
    setLoading(true);
    setMessage('');
    try {
      const allApis = await getAllApis();
      setApis(allApis);
      setMessage(`✅ Loaded ${allApis.length} API(s) from blockchain`);
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Failed to load APIs'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (config: ApiConfig) => {
    setLoading(true);
    setMessage('');
    try {
      if (editMode) {
        await updateApi(config.apiName, config.allowedAgents, config.cooldownBlocks, config.verifyAgent);
        setMessage('✅ Update submitted! Wait 10-30s for blockchain confirmation.');
      } else {
        await createApi(config.apiName, config.allowedAgents, config.cooldownBlocks, config.verifyAgent);
        setMessage(`✅ Creation submitted for "${config.apiName}"!`);
      }
      setEditMode(false);
      setCurrentApi(undefined);
      setShowForm(false);
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (api: ApiData & { apiName: string }) => {
    setCurrentApi({
      apiName: api.apiName,
      allowedAgents: api.allowedAgents,
      cooldownBlocks: api.cooldownBlocks,
      verifyAgent: api.verifyAgent,
    });
    setEditMode(true);
    setShowForm(true);
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (apiName: string) => {
    if (!confirm(`Are you sure you want to delete "${apiName}"?`)) return;
    setLoading(true);
    try {
      await deleteApi(apiName);
      setMessage('✅ Deletion submitted!');
      setTimeout(() => {
        setApis(apis.filter(a => a.apiName !== apiName));
      }, 2000);
      setShowForm(false);
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setCurrentApi(undefined);
    setShowForm(false);
    setMessage('');
  };

  const handleNewApi = () => {
    setEditMode(false);
    setCurrentApi(undefined);
    setShowForm(true);
    setMessage('');
  };

  const handleApiKeyGenerated = (key: string) => {
    setApiKey(key);
    setMessage('✅ API Key generated and saved successfully!');
  };

  if (!isClient) return null;
  if (!isAuthenticated) return <LandingPage />;

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-slate-100 antialiased">
      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
           <div className="h-8 w-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.4)]">
             <ShieldCheck className="text-white w-5 h-5" />
          </div>
            <span className="text-xl font-bold tracking-tight">x402Guard</span>
          </div>
          <div className="flex items-center gap-3">
            <ApiKeyManager 
              onApiKeyGenerated={handleApiKeyGenerated} 
              currentApiKey={apiKey}
              walletAddress={userAddress}
            />
            <ConnectWallet />
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Dashboard</h1>
           
          </div>
        </div>

        {/* --- Tab Switcher --- */}
        <div className="flex border-b border-slate-200 mb-8">
          <button
            onClick={() => setActiveTab('registry')}
            className={`px-6 py-3 text-sm font-semibold transition-all border-b-2 ${
              activeTab === 'registry' 
              ? 'border-slate-900 text-slate-900' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Registry API Rules
          </button>
          <button
            onClick={() => setActiveTab('proxy')}
            className={`px-6 py-3 text-sm font-semibold transition-all border-b-2 ${
              activeTab === 'proxy' 
              ? 'border-slate-900 text-slate-900' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            API Proxy
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-6 py-3 text-sm font-semibold transition-all border-b-2 ${
              activeTab === 'docs' 
              ? 'border-slate-900 text-slate-900' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Docs
          </button>
        </div>

        {/* Message Alert (Global) */}
        {message && (
          <div className={`mb-8 p-4 rounded-lg border flex items-center justify-between ${
            message.includes('❌') ? 'bg-red-50 border-red-200 text-red-900' : 'bg-slate-50 border-slate-200 text-slate-900'
          }`}>
            <span className="text-sm font-medium">{message}</span>
            <button onClick={() => setMessage('')} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>
        )}

        {/* --- TAB 1: REGISTRY CONTENT --- */}
        {activeTab === 'registry' && (
          <div className="animate-in fade-in duration-500">
            <div className="flex justify-end mb-6 gap-3">
              <button
                onClick={handleLoadAll}
                disabled={loading}
                className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                Refresh Chain
              </button>
              {!showForm && (
                <button
                  onClick={handleNewApi}
                  className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800"
                >
                  + Create API Rules
                </button>
              )}
            </div>

            <section className="mb-12">
              {showForm ? (
                <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm transition-all">
                  <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold">{editMode ? 'Edit API Rules' : 'Register API Rules'}</h2>
                    <button onClick={handleCancelEdit} className="text-sm text-slate-500 hover:text-slate-900 font-medium">Cancel</button>
                  </div>
                  <ApiForm onSubmit={handleSubmit} initialData={currentApi} isEdit={editMode} />
                </div>
              ) : apis.length === 0 && !loading && (
                <div className="border-2 border-dashed border-slate-200 rounded-2xl py-20 text-center flex flex-col items-center gap-4">
                  <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">🔍</div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">No APIs found</h3>
                    <p className="text-slate-500 text-sm">Sync from the blockchain or register a new one.</p>
                  </div>
                </div>
              )}
            </section>

            {/* Search Bar */}
            <div className="flex gap-2 mb-8">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Filter by API name..."
                className="flex-1 h-10 px-4 rounded-md border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-slate-950 outline-none"
              />
              <button onClick={handleSearch} className="h-10 px-6 rounded-md bg-slate-900 text-white text-sm font-medium hover:bg-slate-800">
                Search
              </button>
            </div>

            {loading && (
              <div className="flex justify-center py-6">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
              </div>
            )}

            <div className="space-y-4">
              <ApiList apis={apis} onEdit={handleEdit} onDelete={handleDelete} userAddress={userAddress} />
            </div>
          </div>
        )}

        {/* --- TAB 2: API PROXY CONTENT --- */}
        {activeTab === 'proxy' && (
          <div className="animate-in fade-in duration-500">
            <ApiProxyManager apiKey={apiKey} />
          </div>
        )}

        {/* --- TAB 3: DOCS CONTENT --- */}
        {activeTab === 'docs' && (
          <div className="animate-in fade-in duration-500">
            <Docs />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;