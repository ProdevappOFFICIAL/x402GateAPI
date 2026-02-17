import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Power, PowerOff, RefreshCw, X, Key, Globe } from 'lucide-react';

interface ProxyApi {
  apiId: string;
  name: string;
  originalUrl: string;
  wrapperUrl: string;
  pricePerRequest: number;
  minPrice: number;
  maxPrice: number;
  network: string;
  facilitatorUrl: string;
  stacksAddress: string;
  isActive: boolean;
  createdAt: string;
}

interface ApiProxyManagerProps {
  apiKey: string | null;
}

function ApiProxyManager({ apiKey }: ApiProxyManagerProps) {
  const [apis, setApis] = useState<ProxyApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingApi, setEditingApi] = useState<ProxyApi | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    originalUrl: '',
    pricePerRequest: 0.5,
    minPrice: 0.1,
    maxPrice: 10,
    network: 'TESTNET',
    facilitatorUrl: 'https://facilitator.example.com',
    stacksAddress: ''
  });

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

  useEffect(() => {
    if (apiKey) {
      fetchApis();
    }
  }, [apiKey]);

  async function fetchApis() {
    if (!apiKey) return;
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(`${BASE_URL}/v1/apis`, {
        headers: { 'X-API-Key': apiKey }
      });
      const data = await response.json();
      if (data.success) {
        setApis(data.data);
      } else {
        setMessage(`❌ Error: ${data.error.message}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Failed to fetch APIs'}`);
    } finally {
      setLoading(false);
    }
  }

  async function createApi() {
    if (!apiKey) return;
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/v1/apis`, {
        method: 'POST',
        headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        setApis([...apis, data.data]);
        setMessage('✅ API created successfully!');
        resetForm();
      } else {
        setMessage(`❌ Error: ${data.error.message}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Failed to create API'}`);
    } finally {
      setLoading(false);
    }
  }

  async function updateApi(apiId: string, updates: Partial<ProxyApi>) {
    if (!apiKey) return;
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/v1/apis/${apiId}`, {
        method: 'PATCH',
        headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      if (data.success) {
        setApis(apis.map(api => api.apiId === apiId ? data.data : api));
        setMessage('✅ API updated successfully!');
        resetForm();
      } else {
        setMessage(`❌ Error: ${data.error.message}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Failed to update API'}`);
    } finally {
      setLoading(false);
    }
  }

  async function deleteApi(apiId: string, apiName: string) {
    if (!confirm(`Are you sure you want to delete "${apiName}"?`)) return;
    if (!apiKey) return;
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/v1/apis/${apiId}`, {
        method: 'DELETE',
        headers: { 'X-API-Key': apiKey }
      });
      const data = await response.json();
      if (data.success) {
        setApis(apis.filter(api => api.apiId !== apiId));
        setMessage('✅ API deleted successfully!');
      }
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Failed to delete API'}`);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(api: ProxyApi) {
    setEditingApi(api);
    setFormData({
      name: api.name,
      originalUrl: api.originalUrl,
      pricePerRequest: api.pricePerRequest,
      minPrice: api.minPrice,
      maxPrice: api.maxPrice,
      network: api.network,
      facilitatorUrl: api.facilitatorUrl,
      stacksAddress: api.stacksAddress
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingApi) {
      updateApi(editingApi.apiId, formData);
    } else {
      createApi();
    }
  }

  function resetForm() {
    setShowForm(false);
    setEditingApi(null);
    setFormData({
      name: '',
      originalUrl: '',
      pricePerRequest: 0.5,
      minPrice: 0.1,
      maxPrice: 10,
      network: 'TESTNET',
      facilitatorUrl: 'https://facilitator.example.com',
      stacksAddress: ''
    });
  }

  if (!apiKey) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 shadow-sm text-center">
        <div className="h-16 w-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Key className="w-8 h-8 text-orange-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">API Key Required</h3>
        <p className="text-slate-600 max-w-sm mx-auto">
          Please generate or enter an API key in the navbar to manage your proxy services.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {message && (
        <div className={`p-4 rounded-lg border flex items-center justify-between animate-in fade-in slide-in-from-top-2 ${
          message.includes('❌') ? 'bg-red-50 border-red-200 text-red-900' : 'bg-green-50 border-green-200 text-green-900'
        }`}>
          <span className="text-sm font-medium">{message}</span>
          <button onClick={() => setMessage('')} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">API Proxies</h2>
        <div className="flex gap-3">
          <button
            onClick={fetchApis}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm transition-all hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-slate-800"
            >
              <Plus className="w-4 h-4" />
              Create Proxy
            </button>
          )}
        </div>
      </div>

      {/* Management Form */}
      {showForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-md animate-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">
              {editingApi ? 'Update API Configuration' : 'Register New Proxy'}
            </h3>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">API Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-md border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                  placeholder="e.g. Weather Service"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Original Provider URL</label>
                <input
                  type="url"
                  value={formData.originalUrl}
                  onChange={(e) => setFormData({ ...formData, originalUrl: e.target.value })}
                  className="w-full px-4 py-2 rounded-md border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                  placeholder="https://api.external.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Price / Request (STX)</label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.pricePerRequest}
                  onChange={(e) => setFormData({ ...formData, pricePerRequest: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 rounded-md border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none bg-white"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Min Price</label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.minPrice}
                  onChange={(e) => setFormData({ ...formData, minPrice: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 rounded-md border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Max Price</label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.maxPrice}
                  onChange={(e) => setFormData({ ...formData, maxPrice: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 rounded-md border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Network Environment</label>
                <select
                  value={formData.network}
                  onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                  className="w-full px-4 py-2 rounded-md border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none bg-white"
                >
                  <option value="TESTNET">Testnet</option>
                  <option value="MAINNET">Mainnet</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Stacks Address</label>
                <input
                  type="text"
                  value={formData.stacksAddress}
                  onChange={(e) => setFormData({ ...formData, stacksAddress: e.target.value })}
                  className="w-full px-4 py-2 rounded-md border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                  placeholder="SP..."
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Facilitator Gateway URL</label>
              <input
                type="url"
                value={formData.facilitatorUrl}
                onChange={(e) => setFormData({ ...formData, facilitatorUrl: e.target.value })}
                className="w-full px-4 py-2 rounded-md border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-md bg-slate-900 text-white font-bold hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
              >
                {loading ? 'Processing...' : editingApi ? 'Update API Proxy' : 'Launch API Proxy'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-8 py-2.5 rounded-md border border-slate-200 bg-white font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid Display */}
      {!showForm && (
        <>
          {apis.length === 0 && !loading ? (
            <div className="border-2 border-dashed border-slate-200 rounded-2xl py-24 text-center bg-slate-50/50">
              <Globe className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">No Proxies Found</h3>
              <p className="text-slate-500">You haven't registered any API proxies yet.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
              {apis.map((api) => (
                <div key={api.apiId} className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">{api.name}</h3>
                        <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-full ${
                          api.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {api.isActive ? 'Active' : 'Paused'}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-slate-400">{api.apiId}</p>
                    </div>
                    <div className="bg-slate-50 px-3 py-1 rounded-md border border-slate-100">
                      <span className="text-sm font-bold text-slate-900">{api.pricePerRequest}</span>
                      <span className="text-[10px] ml-1 text-slate-500 font-medium">STX</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-tight">Endpoint URL</span>
                      <a href={api.wrapperUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 truncate hover:underline">
                        {api.wrapperUrl}
                      </a>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-tight">Target Provider</span>
                      <span className="text-sm text-slate-600 truncate">{api.originalUrl}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-slate-50">
                    <button
                      onClick={() => handleEdit(api)}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-md transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Configure
                    </button>
                    <button
                      onClick={() => updateApi(api.apiId, { isActive: !api.isActive })}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-md transition-colors"
                    >
                      {api.isActive ? <PowerOff className="w-3.5 h-3.5 text-orange-500" /> : <Power className="w-3.5 h-3.5 text-green-500" />}
                      {api.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => deleteApi(api.apiId, api.name)}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-md transition-colors ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ApiProxyManager;