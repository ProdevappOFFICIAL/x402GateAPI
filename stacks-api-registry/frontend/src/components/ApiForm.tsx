import { useState, useEffect } from 'react';
import { ApiConfig } from '../types';

interface ApiFormProps {
  onSubmit: (config: ApiConfig) => void;
  initialData?: ApiConfig;
  isEdit?: boolean;
}

export default function ApiForm({ onSubmit, initialData, isEdit = false }: ApiFormProps) {
  const [formData, setFormData] = useState<ApiConfig>(
    initialData || {
      apiName: '',
      allowedAgents: '',
      cooldownBlocks: 0,
      verifyAgent: false,
    }
  );

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // ASCII Validation
    if (!/^[\x00-\x7F]*$/.test(formData.apiName)) {
      alert('API name must contain only ASCII characters.');
      return;
    }
    
    // Length Validation
    if (formData.apiName.length > 100) return alert('API name too long');
    if (formData.allowedAgents.length > 500) return alert('Allowed agents string too long');
    
    onSubmit(formData);
  };

  const inputStyles = "flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 transition-all";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-6">
        {/* API Name Field */}
        <div className="space-y-2">
          <label className="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-900">
            API Identifier
          </label>
          <input
            type="text"
            value={formData.apiName}
            onChange={(e) => setFormData({ ...formData, apiName: e.target.value })}
            disabled={isEdit}
            maxLength={100}
            placeholder="e.g., payment-gateway-v1"
            className={inputStyles}
            required
          />
          <p className="text-[12px] text-slate-500">ASCII only. This cannot be changed after registration.</p>
        </div>

        {/* Allowed Agents Field */}
        <div className="space-y-2">
          <label className="text-sm font-semibold leading-none text-slate-900">
            Authorized Agent Wallets
          </label>
          <input
            type="text"
            value={formData.allowedAgents}
            onChange={(e) => setFormData({ ...formData, allowedAgents: e.target.value })}
            placeholder="ST123..., ST456..."
            maxLength={500}
            className={inputStyles}
            required
          />
          <p className="text-[12px] text-slate-500">Comma-separated Stacks addresses (max 500 chars).</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cooldown Blocks */}
          <div className="space-y-2">
            <label className="text-sm font-semibold leading-none text-slate-900">
              Cooldown (Blocks)
            </label>
            <input
              type="number"
              value={formData.cooldownBlocks || 0}
              onChange={(e) => setFormData({ ...formData, cooldownBlocks: parseInt(e.target.value) || 0 })}
              min="0"
              className={inputStyles}
              required
            />
          </div>

          {/* Verify Agent Toggle */}
          <div className="flex flex-col justify-end">
            <div className="flex items-center space-x-3 h-10">
              <label className="relative inline-flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.verifyAgent}
                  onChange={(e) => setFormData({ ...formData, verifyAgent: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-slate-900 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5 shadow-inner transition-colors"></div>
                <span className="ml-3 text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                  Enable Agent Verification
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
        <button
          type="submit"
          className="flex-1 inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow transition-all hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 active:scale-[0.98]"
        >
          {isEdit ? 'Save Changes' : 'Confirm Registration'}
        </button>
      </div>
    </form>
  );
}