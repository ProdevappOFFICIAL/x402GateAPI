import { ApiData } from '../types';

interface ApiListProps {
  apis: Array<ApiData & { apiName: string }>;
  onEdit: (api: ApiData & { apiName: string }) => void;
  onDelete: (apiName: string) => void;
  userAddress: string;
}

export default function ApiList({ apis, onEdit, onDelete, userAddress }: ApiListProps) {
  if (apis.length === 0) {
    return (
      <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
        <p className="text-slate-500 text-sm">No APIs registered yet. Create your first API above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">Registered APIs Rules</h2>
        <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          {apis.length} Total
        </span>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
              <tr>
                <th className="px-6 py-3">API Name</th>
                <th className="px-6 py-3">Configuration</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {apis.map((api) => (
                <tr key={api.apiName} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900">{api.apiName}</span>
                      {api.txid && (
                        <a 
                          href={`https://explorer.hiro.so/txid/${api.txid}?chain=testnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-mono text-slate-400 hover:text-blue-600 truncate max-w-[150px] transition-colors"
                        >
                          TX: {api.txid.slice(0, 12)}...
                        </a>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2 items-center">
                      {/* Badge for Verification Status */}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        api.verifyAgent 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                          : 'bg-slate-50 text-slate-500 border-slate-100'
                      }`}>
                        {api.verifyAgent ? 'Verified' : 'Unverified'}
                      </span>
                      
                      {/* Badge for Cooldown */}
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
                        {api.cooldownBlocks} Blocks
                      </span>

                      {/* Truncated Agents List */}
                      <span className="text-[11px] text-slate-400 font-mono italic truncate max-w-[200px]">
                        {String(api.allowedAgents).slice(0, 30)}...
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right">
                    {api.owner === userAddress ? (
                      <div className="flex justify-end gap-2 transition-opacity">
                        <button
                          onClick={() => onEdit(api)}
                          className="h-8 px-3 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all"
                        >
                          Edit rule
                        </button>
                        <button
                          onClick={() => onDelete(api.apiName)}
                          className="h-8 px-3 rounded-md border border-red-100 bg-red-50 text-xs font-medium text-red-600 hover:bg-red-100 transition-all"
                        >
                          Deactivate rule
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold uppercase text-slate-300">Read Only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}