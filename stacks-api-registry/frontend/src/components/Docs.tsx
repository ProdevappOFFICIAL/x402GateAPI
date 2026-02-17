import { BookOpen, Code, Key, Shield, Zap, Globe, ArrowRight } from 'lucide-react';

function Docs() {
  return (
    <div className="animate-in fade-in duration-500 space-y-8">
      {/* Introduction */}
      <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl font-bold">What is x402Guard?</h2>
        </div>
        <p className="text-slate-600 leading-relaxed mb-4">
          x402Guard is a minimal validation middleware that enables bots and autonomous agents to access wrapped APIs using on-chain rule enforcement powered by x402-stacks on the Stacks blockchain.
        </p>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-slate-900 mb-2">The Flow:</p>
          <div className="flex items-center gap-2 text-sm text-slate-600 flex-wrap">
            <span className="font-mono bg-white px-2 py-1 rounded border border-slate-200">Agent/Bot</span>
            <ArrowRight className="w-4 h-4" />
            <span className="font-mono bg-white px-2 py-1 rounded border border-slate-200">x402Guard</span>
            <ArrowRight className="w-4 h-4" />
            <span className="font-mono bg-white px-2 py-1 rounded border border-slate-200">Smart Contract Validation</span>
            <ArrowRight className="w-4 h-4" />
            <span className="font-mono bg-white px-2 py-1 rounded border border-slate-200">Real API</span>
          </div>
        </div>
        <div className="mt-4 space-y-2 text-slate-600">
          <p className="font-semibold text-slate-900">Key Features:</p>
          <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
            <li>No centralized API keys or billing systems</li>
            <li>On-chain access rules enforced via Clarity smart contracts</li>
            <li>HTTP 402 payment validation using x402-stacks</li>
            <li>Cooldown logic prevents spam at the blockchain level</li>
            <li>Deterministic, agent-native economic validation</li>
          </ul>
        </div>
      </section>

      {/* Architecture Overview */}
      <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl font-bold">Architecture</h2>
        </div>
        <div className="space-y-4">
          <div className="border-l-4 border-orange-500 pl-4">
            <h3 className="font-bold text-slate-900 mb-1">1. Smart Contract (Validation Engine)</h3>
            <p className="text-sm text-slate-600">Stores endpoint rules: allowed agents, cooldown blocks, price requirements. Acts as the decentralized validation authority.</p>
          </div>
          <div className="border-l-4 border-orange-500 pl-4">
            <h3 className="font-bold text-slate-900 mb-1">2. Frontend (Configuration Layer)</h3>
            <p className="text-sm text-slate-600">Configure wrapped APIs, set agent wallets, define cooldown and pricing. All stored in localStorage - no database.</p>
          </div>
          <div className="border-l-4 border-orange-500 pl-4">
            <h3 className="font-bold text-slate-900 mb-1">3. Backend (Ultra Minimal Gateway)</h3>
            <p className="text-sm text-slate-600">Three endpoints: <code className="bg-slate-100 px-1 rounded">/wrap</code> (create wrapped endpoint), <code className="bg-slate-100 px-1 rounded">/api/wrapped/:id</code> (validate & proxy), <code className="bg-slate-100 px-1 rounded">/logs</code> (view requests). Pure validation middleware.</p>
          </div>
        </div>
      </section>

      {/* Why This Matters */}
      <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Why x402Guard Matters</h2>
        <div className="space-y-3 text-slate-600">
          <p className="text-sm">x402Guard shifts API validation from centralized server logic to blockchain-backed programmable enforcement:</p>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="font-bold text-red-900 text-sm mb-2">❌ Traditional APIs</p>
              <ul className="text-xs text-red-800 space-y-1">
                <li>• Centralized API keys</li>
                <li>• Manual subscriptions</li>
                <li>• Off-chain rate limiting</li>
                <li>• Server-side validation</li>
                <li>• Not agent-native</li>
              </ul>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="font-bold text-green-900 text-sm mb-2">✅ x402Guard</p>
              <ul className="text-xs text-green-800 space-y-1">
                <li>• No centralized keys</li>
                <li>• Smart contract rules</li>
                <li>• On-chain cooldown</li>
                <li>• HTTP 402 validation</li>
                <li>• Agent-native design</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Registry Rules */}
      <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl font-bold">Tab 1: Registry API Rules</h2>
        </div>
        <div className="space-y-4 text-slate-600">
          <p>Register and manage on-chain validation rules for your wrapped APIs. These rules are stored in the Clarity smart contract and enforced by the x402Guard gateway:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>API Name:</strong> Unique endpoint identifier (becomes part of <code className="bg-slate-100 px-1 rounded text-xs">/api/wrapped/:id</code>)</li>
            <li><strong>Allowed Agents:</strong> Wallet addresses authorized to call this endpoint</li>
            <li><strong>Cooldown Blocks:</strong> Minimum blocks between requests (on-chain rate limiting)</li>
            <li><strong>Verify Agent:</strong> Require agent signature validation</li>
          </ul>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mt-4">
            <p className="text-sm font-semibold mb-2">How It Works:</p>
            <p className="text-sm">When an agent requests <code className="bg-slate-100 px-1 rounded">/api/wrapped/:id</code>, the backend queries the smart contract to validate: agent identity, cooldown status, and payment. If validation fails, HTTP 402 is returned.</p>
          </div>
        </div>
      </section>

      {/* API Proxy Usage */}
      <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Globe className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl font-bold">Tab 2: API Proxy Manager</h2>
        </div>
        <div className="space-y-4 text-slate-600">
          <p>Wrap external APIs and generate protected endpoints. The backend creates a <code className="bg-slate-100 px-1 rounded text-xs">/api/wrapped/:id</code> endpoint that validates requests against on-chain rules:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>API Name:</strong> Human-readable identifier for your wrapped API</li>
            <li><strong>Original URL:</strong> The real API endpoint being protected</li>
            <li><strong>Wrapper URL:</strong> Generated endpoint (e.g., <code className="bg-slate-100 px-1 rounded text-xs">/api/wrapped/weather-api</code>)</li>
            <li><strong>Price Per Request:</strong> STX cost per call (validated via x402-stacks)</li>
            <li><strong>Stacks Address:</strong> Your wallet for receiving payments</li>
            <li><strong>Network:</strong> Testnet or Mainnet</li>
          </ul>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mt-4">
            <p className="text-sm font-semibold mb-2">Validation Flow:</p>
            <p className="text-sm">Agent → Wrapped Endpoint → Smart Contract Check (agent allowed? cooldown OK? payment made?) → If ✅ forward to real API, if ❌ return HTTP 402</p>
          </div>
        </div>
      </section>

      {/* Code Examples */}
      <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Code className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl font-bold">Code Examples</h2>
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">1. Wrap an API (Backend)</h3>
            <p className="text-slate-600 text-sm mb-3">Create a wrapped endpoint that validates against on-chain rules:</p>
            <div className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm">
{`POST /wrap
Content-Type: application/json

{
  "apiUrl": "https://api.weather.com/v1/forecast",
  "apiName": "weather-api"
}

// Response:
{
  "wrappedEndpoint": "/api/wrapped/weather-api",
  "endpointId": "weather-api"
}`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">2. Register On-Chain Rules (Frontend)</h3>
            <p className="text-slate-600 text-sm mb-3">Store validation rules in the Clarity smart contract:</p>
            <div className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm">
{`import { createApi } from './utils/stacks';

await createApi(
  'weather-api',                    // API name
  ['SP2...', 'SP3...'],            // Allowed agent wallets
  10,                               // Cooldown blocks
  true                              // Verify agent signature
);

// Transaction submitted to blockchain (10-30s confirmation)`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">3. Agent Calls Wrapped API</h3>
            <p className="text-slate-600 text-sm mb-3">Agent makes request with wallet address in header:</p>
            <div className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm">
{`const response = await fetch('http://localhost:4000/api/wrapped/weather-api', {
  method: 'POST',
  headers: {
    'X-Agent-Address': 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ location: 'NYC' })
});

// If validation passes: returns real API response
// If validation fails: returns HTTP 402 Payment Required`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Validation Flow */}
      <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Key className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl font-bold">Request Validation Flow</h2>
        </div>
        <div className="space-y-4">
          <div className="bg-slate-900 text-slate-100 rounded-lg p-6 space-y-3 text-sm font-mono">
            <div className="flex items-start gap-3">
              <span className="text-orange-400 font-bold">1.</span>
              <div>
                <p className="text-slate-300">Agent sends request to wrapped endpoint</p>
                <p className="text-slate-500 text-xs mt-1">POST /api/wrapped/weather-api</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-orange-400 font-bold">2.</span>
              <div>
                <p className="text-slate-300">Backend extracts agent wallet from headers</p>
                <p className="text-slate-500 text-xs mt-1">X-Agent-Address: SP2...</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-orange-400 font-bold">3.</span>
              <div>
                <p className="text-slate-300">Query smart contract for validation</p>
                <p className="text-slate-500 text-xs mt-1">Is agent allowed? Cooldown expired? Payment made?</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400 font-bold">✓</span>
              <div>
                <p className="text-slate-300">If valid: Forward to real API</p>
                <p className="text-slate-500 text-xs mt-1">Return response + log success</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-red-400 font-bold">✗</span>
              <div>
                <p className="text-slate-300">If invalid: Return HTTP 402</p>
                <p className="text-slate-500 text-xs mt-1">Payment Required (x402-stacks)</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-slate-900 mb-2">Cooldown Mode:</p>
            <p className="text-sm text-slate-600">If <code className="bg-white px-1 rounded border border-slate-200">current_block &lt; last_call + cooldown</code>, access is denied. This prevents spam at the blockchain level.</p>
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Additional Resources</h2>
        <div className="space-y-2 text-slate-600">
          <p>For more detailed documentation, check the repository documentation:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Smart Contract Reference (Clarity)</li>
            <li>HTTP/402 Protocol Specification</li>
            <li>Facilitator Integration Guide</li>
            <li>STX Payment Flow Documentation</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

export default Docs;
