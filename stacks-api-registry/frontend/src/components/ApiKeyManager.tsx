import { useState, useEffect } from 'react';
import { Key, Copy, Check, X, Trash2, BarChart3, AlertTriangle, Loader2 } from 'lucide-react';

interface ApiKeyManagerProps {
  onApiKeyGenerated: (apiKey: string) => void;
  currentApiKey: string | null;
  walletAddress: string;
}

interface KeyMetadata {
  id: string;
  name: string;
  keyPreview: string;
  isActive: boolean;
  lastUsedAt: string;
}

function ApiKeyManager({ onApiKeyGenerated, currentApiKey, walletAddress }: ApiKeyManagerProps) {
  const [view, setView] = useState<'list' | 'generate' | 'success'>('list');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');
  const [keys, setKeys] = useState<KeyMetadata[]>([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  async function fetchKeys() {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/v1/apis/keys`, {
        headers: { 'Authorization': `Bearer dev-mock-token` }
      });
      const data = await response.json();
      if (data.success) setKeys(data.data);
    } catch (err) {
      setError("Failed to fetch existing keys.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateKey() {
    if (!keyName.trim()) return setError('Please enter a key name');
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${BASE_URL}/v1/apis/keys/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, name: keyName })
      });

      const data = await response.json();
      if (data.success) {
        setGeneratedKey(data.data.key);
        onApiKeyGenerated(data.data.key);
        localStorage.setItem('x402_api_key', data.data.key);
        setView('success');
      } else {
        setError(data.error?.message || 'Failed to generate key');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function revokeKey(id: string) {
    if (!confirm('Are you sure? This will break any apps using this key.')) return;
    
    try {
      const response = await fetch(`${BASE_URL}/v1/apis/keys/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer dev-mock-token` }
      });
      if (response.ok) fetchKeys();
    } catch (err) {
      setError('Failed to revoke key');
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


const closeModal = () => {
    setIsOpen(false);
    setView('list');
    setKeyName('');
    setGeneratedKey(''); // Clear the secret for security
    setError('');
    setCopied(false);
  };
  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => { setIsOpen(true); fetchKeys(); }}
        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all font-medium text-sm"
      >
        <Key size={16} />
        {currentApiKey ? 'Manage API Keys' : 'Generate API Key'}
      </button>

      {/* Dialog Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          {/* Dialog Surface */}
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="relative px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">API Access</h2>
                <p className="text-xs text-slate-500">Manage your developer credentials</p>
              </div>
              <button 
                onClick={closeModal}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex gap-2 items-center">
                  <AlertTriangle size={16} /> {error}
                </div>
              )}

              {view === 'list' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Keys</span>
                    <button 
                      onClick={() => setView('generate')}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      + New Key
                    </button>
                  </div>

                  {loading && keys.length === 0 ? (
                    <div className="py-10 flex flex-col items-center text-slate-400">
                      <Loader2 className="animate-spin mb-2" size={24} />
                      <span className="text-sm">Loading keys...</span>
                    </div>
                  ) : keys.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <p className="text-sm text-slate-500">No keys generated yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {keys.map((k) => (
                        <div key={k.id} className="group flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">{k.name}</p>
                            <code className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 uppercase">{k.keyPreview}</code>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 text-slate-400 hover:text-slate-600"><BarChart3 size={14} /></button>
                            <button onClick={() => revokeKey(k.id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {view === 'generate' && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Key Name</label>
                    <input
                      autoFocus
                      type="text"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                      placeholder="e.g. My Website API"
                      value={keyName}
                      onChange={(e) => setKeyName(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={() => setView('list')}
                      className="flex-1 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      Back
                    </button>
                    <button 
                      onClick={handleCreateKey}
                      disabled={loading || !keyName}
                      className="flex-1 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                      {loading && <Loader2 size={14} className="animate-spin" />}
                      Generate Key
                    </button>
                  </div>
                </div>
              )}

              {view === 'success' && (
                <div className="space-y-6 text-center">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Check size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Key Generated!</h3>
                    <p className="text-sm text-slate-500 mt-1">Copy it now. For security, we won't show it again.</p>
                  </div>

                  <div className="relative group">
                    <input
                      readOnly
                      value={generatedKey}
                      className="w-full px-4 py-4 pr-12 bg-slate-50 border-2 border-slate-100 rounded-xl font-mono text-sm text-slate-700"
                    />
                    <button 
                      onClick={copyToClipboard}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white shadow-sm border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
                    >
                      {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-slate-400" />}
                    </button>
                  </div>

                  <button 
                    onClick={() => { setView('list'); fetchKeys(); closeModal() }}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ApiKeyManager;