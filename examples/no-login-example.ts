/**
 * No Login Required Example
 * 
 * This example shows how to use x402Layer APIs without any login.
 * Just provide your wallet address to get an API key, then use it for everything!
 */

const BASE_URL = 'http://localhost:4000';

// Step 1: Generate API Key (No login required!)
async function getApiKey(walletAddress: string, keyName: string = 'My App'): Promise<string> {
  console.log('🔑 Generating API key for wallet:', walletAddress);
  
  const response = await fetch(`${BASE_URL}/apis/keys/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      walletAddress,
      name: keyName
    })
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to generate API key');
  }

  console.log('✅ API Key generated:', data.data.key);
  console.log('💾 Save this key securely!');
  
  return data.data.key;
}

// Step 2: Create an API using the key
async function createApi(apiKey: string) {
  console.log('\n📦 Creating new API...');
  
  const response = await fetch(`${BASE_URL}/apis`, {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'Weather API',
      originalUrl: 'https://api.weather.com',
      pricePerRequest: 0.5,
      minPrice: 0.1,
      maxPrice: 10,
      network: 'TESTNET',
      facilitatorUrl: 'https://facilitator.example.com',
      stacksAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
    })
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to create API');
  }

  console.log('✅ API created:', data.data.name);
  console.log('🔗 Wrapper URL:', data.data.wrapperUrl);
  
  return data.data;
}

// Step 3: List all APIs
async function listApis(apiKey: string) {
  console.log('\n📋 Fetching all APIs...');
  
  const response = await fetch(`${BASE_URL}/apis`, {
    headers: {
      'X-API-Key': apiKey
    }
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to list APIs');
  }

  console.log(`✅ Found ${data.data.length} APIs`);
  return data.data;
}

// Step 4: Update an API
async function updateApi(apiKey: string, apiId: string, updates: any) {
  console.log('\n✏️ Updating API...');
  
  const response = await fetch(`${BASE_URL}/apis/${apiId}`, {
    method: 'PATCH',
    headers: {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to update API');
  }

  console.log('✅ API updated:', data.data.name);
  return data.data;
}

// Step 5: Delete an API
async function deleteApi(apiKey: string, apiId: string) {
  console.log('\n🗑️ Deleting API...');
  
  const response = await fetch(`${BASE_URL}/apis/${apiId}`, {
    method: 'DELETE',
    headers: {
      'X-API-Key': apiKey
    }
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to delete API');
  }

  console.log('✅ API deleted');
}

// Complete workflow example
async function completeWorkflow() {
  try {
    console.log('🚀 Starting No-Login Workflow\n');
    console.log('=' .repeat(50));

    // Your Stacks wallet address
    const walletAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';

    // Step 1: Get API key (no login!)
    const apiKey = await getApiKey(walletAddress, 'My Frontend App');

    // Step 2: Create an API
    const newApi = await createApi(apiKey);

    // Step 3: List all APIs
    const apis = await listApis(apiKey);
    apis.forEach((api: any) => {
      console.log(`  - ${api.name} (${api.pricePerRequest} STX)`);
    });

    // Step 4: Update the API
    await updateApi(apiKey, newApi.apiId, {
      pricePerRequest: 1.0
    });

    // Step 5: Delete the API
    await deleteApi(apiKey, newApi.apiId);

    console.log('\n' + '='.repeat(50));
    console.log('🎉 Workflow completed successfully!');
    console.log('💡 No login was required at any step!');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
  }
}

// React Component Example
const ReactNoLoginExample = `
import React, { useState, useEffect } from 'react';

function NoLoginApp() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('x402_api_key'));
  const [apis, setApis] = useState([]);
  const [walletAddress, setWalletAddress] = useState('');

  // Generate API key without login
  async function handleGenerateKey() {
    if (!walletAddress) {
      alert('Please enter your wallet address');
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/apis/keys/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          name: 'My App'
        })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('x402_api_key', data.data.key);
        setApiKey(data.data.key);
        alert('API Key generated! You can now use the app.');
      } else {
        alert('Error: ' + data.error.message);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  }

  // Fetch APIs using the key
  async function fetchApis() {
    if (!apiKey) return;

    try {
      const response = await fetch('http://localhost:4000/apis', {
        headers: { 'X-API-Key': apiKey }
      });

      const data = await response.json();
      if (data.success) {
        setApis(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch APIs:', error);
    }
  }

  useEffect(() => {
    if (apiKey) {
      fetchApis();
    }
  }, [apiKey]);

  // No API key yet - show setup screen
  if (!apiKey) {
    return (
      <div className="setup-screen">
        <h1>Welcome to x402Layer</h1>
        <p>No login required! Just enter your wallet address to get started.</p>
        
        <input
          type="text"
          placeholder="Your Stacks wallet address"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          style={{ width: '400px', padding: '10px' }}
        />
        
        <button onClick={handleGenerateKey}>
          Generate API Key
        </button>
      </div>
    );
  }

  // Has API key - show main app
  return (
    <div className="main-app">
      <h1>Your APIs</h1>
      <p>API Key: {apiKey.substring(0, 20)}...</p>
      
      <div className="api-list">
        {apis.map(api => (
          <div key={api.apiId} className="api-card">
            <h3>{api.name}</h3>
            <p>Price: {api.pricePerRequest} STX</p>
            <p>Wrapper: {api.wrapperUrl}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NoLoginApp;
`;

// Run the example
if (require.main === module) {
  completeWorkflow();
}

export {
  getApiKey,
  createApi,
  listApis,
  updateApi,
  deleteApi,
  ReactNoLoginExample
};
