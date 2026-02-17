/**
 * Frontend Example: Using API Keys for Third-Party Access
 * 
 * This example shows how to use API keys to access x402Layer APIs
 * from a frontend application without requiring user login.
 */

const API_KEY = process.env.X402_API_KEY || 'x402_your_api_key_here';
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';

interface Api {
  apiId: string;
  name: string;
  originalUrl: string;
  wrapperUrl: string;
  pricePerRequest: number;
  minPrice: number;
  maxPrice: number;
  network: 'TESTNET' | 'MAINNET';
  facilitatorUrl: string;
  stacksAddress: string;
  isActive: boolean;
  createdAt: string;
}

interface ApiMetrics {
  apiId: string;
  apiName: string;
  metrics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    successRate: number;
    totalRevenue: number;
  };
}

/**
 * List all available APIs
 */
async function listApis(): Promise<Api[]> {
  const response = await fetch(`${BASE_URL}/apis`, {
    method: 'GET',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to list APIs');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Get details for a specific API
 */
async function getApi(apiId: string): Promise<Api> {
  const response = await fetch(`${BASE_URL}/apis/${apiId}`, {
    method: 'GET',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to get API');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Get metrics for a specific API
 */
async function getApiMetrics(apiId: string): Promise<ApiMetrics> {
  const response = await fetch(`${BASE_URL}/apis/${apiId}/metrics`, {
    method: 'GET',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to get metrics');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Call a wrapped API endpoint (requires payment)
 */
async function callWrappedApi(
  apiId: string,
  endpoint: string,
  options: {
    method?: string;
    body?: any;
    paymentSignature: string;
  }
): Promise<any> {
  const { method = 'GET', body, paymentSignature } = options;

  const response = await fetch(`${BASE_URL}/w/${apiId}${endpoint}`, {
    method,
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json',
      'Payment-Signature': paymentSignature
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'API call failed');
  }

  return await response.json();
}

/**
 * Example: Display all APIs in a UI
 */
async function displayApis() {
  try {
    console.log('📋 Fetching available APIs...');
    const apis = await listApis();
    
    console.log(`\n✅ Found ${apis.length} APIs:\n`);
    
    for (const api of apis) {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📦 ${api.name}`);
      console.log(`   ID: ${api.apiId}`);
      console.log(`   Original: ${api.originalUrl}`);
      console.log(`   Wrapper: ${api.wrapperUrl}`);
      console.log(`   Price: ${api.pricePerRequest} STX`);
      console.log(`   Network: ${api.network}`);
      console.log(`   Status: ${api.isActive ? '🟢 Active' : '🔴 Inactive'}`);
      
      // Get metrics for each API
      try {
        const metrics = await getApiMetrics(api.apiId);
        console.log(`   Requests: ${metrics.metrics.totalRequests} (${metrics.metrics.successRate}% success)`);
        console.log(`   Revenue: ${metrics.metrics.totalRevenue} STX`);
      } catch (error) {
        console.log(`   Metrics: Unable to fetch`);
      }
    }
    
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

/**
 * Example: Call a specific API
 */
async function exampleApiCall() {
  try {
    // First, get the API details
    const apiId = 'your-api-id-here';
    const api = await getApi(apiId);
    
    console.log(`\n🔗 Calling API: ${api.name}`);
    console.log(`   Price: ${api.pricePerRequest} STX`);
    
    // In a real app, you'd get this from your Stacks wallet
    const paymentSignature = 'your-payment-signature-here';
    
    // Make the API call
    const result = await callWrappedApi(apiId, '/endpoint', {
      method: 'GET',
      paymentSignature
    });
    
    console.log('✅ API Response:', result);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

/**
 * React Component Example
 */
const ReactExample = `
import React, { useEffect, useState } from 'react';

function ApiList() {
  const [apis, setApis] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApis() {
      try {
        const response = await fetch('${BASE_URL}/apis', {
          headers: {
            'X-API-Key': '${API_KEY}'
          }
        });
        const data = await response.json();
        setApis(data.data);
      } catch (error) {
        console.error('Failed to fetch APIs:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchApis();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Available APIs</h1>
      {apis.map(api => (
        <div key={api.apiId} className="api-card">
          <h2>{api.name}</h2>
          <p>Price: {api.pricePerRequest} STX</p>
          <p>Network: {api.network}</p>
          <button onClick={() => callApi(api.apiId)}>
            Call API
          </button>
        </div>
      ))}
    </div>
  );
}
`;

// Run examples
if (require.main === module) {
  console.log('🚀 x402Layer API Key Examples\n');
  
  // Display all APIs
  displayApis().then(() => {
    console.log('\n💡 React Component Example:');
    console.log(ReactExample);
  });
}

export {
  listApis,
  getApi,
  getApiMetrics,
  callWrappedApi
};


/**
 * Create a new API (now available with API key!)
 */
async function createApi(apiData: {
  name: string;
  originalUrl: string;
  pricePerRequest: number;
  minPrice?: number;
  maxPrice?: number;
  network: 'TESTNET' | 'MAINNET';
  facilitatorUrl: string;
  stacksAddress: string;
}): Promise<Api> {
  const response = await fetch(`${BASE_URL}/apis`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(apiData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to create API');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Update an existing API (now available with API key!)
 */
async function updateApi(
  apiId: string,
  updates: {
    pricePerRequest?: number;
    minPrice?: number;
    maxPrice?: number;
    isActive?: boolean;
    network?: 'TESTNET' | 'MAINNET';
    facilitatorUrl?: string;
    stacksAddress?: string;
  }
): Promise<Api> {
  const response = await fetch(`${BASE_URL}/apis/${apiId}`, {
    method: 'PATCH',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to update API');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Delete an API (now available with API key!)
 */
async function deleteApi(apiId: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/apis/${apiId}`, {
    method: 'DELETE',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to delete API');
  }
}

/**
 * Example: Full CRUD operations with API key
 */
async function fullCrudExample() {
  try {
    console.log('\n🚀 Full CRUD Example with API Key\n');

    // 1. Create a new API
    console.log('1️⃣ Creating new API...');
    const newApi = await createApi({
      name: 'Weather API',
      originalUrl: 'https://api.weather.com',
      pricePerRequest: 0.5,
      minPrice: 0.1,
      maxPrice: 10,
      network: 'TESTNET',
      facilitatorUrl: 'https://facilitator.example.com',
      stacksAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
    });
    console.log(`✅ Created: ${newApi.name} (${newApi.apiId})`);

    // 2. Read the API
    console.log('\n2️⃣ Reading API details...');
    const api = await getApi(newApi.apiId);
    console.log(`✅ Retrieved: ${api.name} - Price: ${api.pricePerRequest} STX`);

    // 3. Update the API
    console.log('\n3️⃣ Updating API price...');
    const updatedApi = await updateApi(newApi.apiId, {
      pricePerRequest: 1.0
    });
    console.log(`✅ Updated: Price changed to ${updatedApi.pricePerRequest} STX`);

    // 4. Get metrics
    console.log('\n4️⃣ Fetching metrics...');
    const metrics = await getApiMetrics(newApi.apiId);
    console.log(`✅ Metrics: ${metrics.metrics.totalRequests} requests`);

    // 5. Delete the API
    console.log('\n5️⃣ Deleting API...');
    await deleteApi(newApi.apiId);
    console.log(`✅ Deleted: ${newApi.name}`);

    console.log('\n🎉 Full CRUD cycle completed!\n');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

/**
 * Updated React Component with Create/Update/Delete
 */
const FullReactExample = `
import React, { useEffect, useState } from 'react';

function ApiManager() {
  const [apis, setApis] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_KEY = process.env.REACT_APP_X402_API_KEY;

  // Fetch all APIs
  useEffect(() => {
    fetchApis();
  }, []);

  async function fetchApis() {
    try {
      const response = await fetch('${BASE_URL}/apis', {
        headers: { 'X-API-Key': API_KEY }
      });
      const data = await response.json();
      setApis(data.data);
    } catch (error) {
      console.error('Failed to fetch APIs:', error);
    } finally {
      setLoading(false);
    }
  }

  // Create new API
  async function createApi(apiData) {
    try {
      const response = await fetch('${BASE_URL}/apis', {
        method: 'POST',
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiData)
      });
      const data = await response.json();
      setApis([...apis, data.data]);
      alert('API created successfully!');
    } catch (error) {
      alert('Failed to create API: ' + error.message);
    }
  }

  // Update API
  async function updateApi(apiId, updates) {
    try {
      const response = await fetch(\`${BASE_URL}/apis/\${apiId}\`, {
        method: 'PATCH',
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      setApis(apis.map(api => api.apiId === apiId ? data.data : api));
      alert('API updated successfully!');
    } catch (error) {
      alert('Failed to update API: ' + error.message);
    }
  }

  // Delete API
  async function deleteApi(apiId) {
    if (!confirm('Are you sure you want to delete this API?')) return;
    
    try {
      await fetch(\`${BASE_URL}/apis/\${apiId}\`, {
        method: 'DELETE',
        headers: { 'X-API-Key': API_KEY }
      });
      setApis(apis.filter(api => api.apiId !== apiId));
      alert('API deleted successfully!');
    } catch (error) {
      alert('Failed to delete API: ' + error.message);
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>API Manager</h1>
      
      <button onClick={() => {
        const name = prompt('API Name:');
        const url = prompt('Original URL:');
        const price = parseFloat(prompt('Price per request (STX):'));
        
        createApi({
          name,
          originalUrl: url,
          pricePerRequest: price,
          network: 'TESTNET',
          facilitatorUrl: 'https://facilitator.example.com',
          stacksAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
        });
      }}>
        ➕ Create New API
      </button>

      <div className="api-list">
        {apis.map(api => (
          <div key={api.apiId} className="api-card">
            <h2>{api.name}</h2>
            <p>Price: {api.pricePerRequest} STX</p>
            <p>Status: {api.isActive ? '🟢 Active' : '🔴 Inactive'}</p>
            
            <button onClick={() => {
              const newPrice = parseFloat(prompt('New price:', api.pricePerRequest));
              updateApi(api.apiId, { pricePerRequest: newPrice });
            }}>
              ✏️ Edit
            </button>
            
            <button onClick={() => {
              updateApi(api.apiId, { isActive: !api.isActive });
            }}>
              {api.isActive ? '⏸️ Disable' : '▶️ Enable'}
            </button>
            
            <button onClick={() => deleteApi(api.apiId)}>
              🗑️ Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
`;

// Export new functions
export {
  listApis,
  getApi,
  getApiMetrics,
  callWrappedApi,
  createApi,
  updateApi,
  deleteApi,
  fullCrudExample
};
