import { AppConfig, UserSession, showConnect, openContractCall } from '@stacks/connect';
import { 
  stringAsciiCV, 
  stringUtf8CV, 
  uintCV, 
  boolCV,
  PostConditionMode,
  AnchorMode,
  fetchCallReadOnlyFunction,
  cvToValue,
  ClarityValue
} from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';

const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

export const connectWallet = () => {
  showConnect({
    appDetails: {
      name: 'API Registry',
      icon: window.location.origin + '/logo.svg',
    },
    redirectTo: '/',
    onFinish: () => {
      window.location.reload();
    },
    userSession,
  });
};

const network = STACKS_TESTNET;
const contractAddress = 'ST3AW560S3EET4NNSC3NG9N6CPNMPGASTMKWX11KG';
const contractName = 'api-registry';

// Fetch all APIs using Stacks API (reads contract events)
export const getAllApis = async () => {
  try {
    // Use Stacks API to get contract transactions
    const apiUrl = `https://api.testnet.hiro.so/extended/v1/address/${contractAddress}.${contractName}/transactions?limit=50`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    // Extract API names from contract call transactions
    const apiNames = new Set<string>();
    
    for (const tx of data.results) {
      if (tx.tx_type === 'contract_call' && 
          tx.contract_call?.function_name === 'create-api' &&
          tx.tx_status === 'success') {
        // Parse the API name from function args
        const args = tx.contract_call.function_args;
        if (args && args[0]) {
          // The first argument is the API name
          const apiName = args[0].repr.replace(/^"(.*)"$/, '$1');
          apiNames.add(apiName);
        }
      }
    }
    
    // Fetch details for each API with txid
    const apis = [];
    for (const apiName of apiNames) {
      try {
        const apiData = await getApi(apiName);
        // Find the transaction ID for this API
        const apiTx = data.results.find((tx: any) => 
          tx.tx_type === 'contract_call' && 
          tx.contract_call?.function_name === 'create-api' &&
          tx.tx_status === 'success' &&
          tx.contract_call.function_args?.[0]?.repr.replace(/^"(.*)"$/, '$1') === apiName
        );
        apis.push({ ...apiData, apiName, txid: apiTx?.tx_id });
      } catch (error) {
        console.log(`API ${apiName} may have been deleted`);
      }
    }
    
    return apis;
  } catch (error) {
    console.error('Error fetching all APIs:', error);
    return [];
  }
};

// Read-only functions
export const getApi = async (apiName: string) => {
  try {
    const response = await fetchCallReadOnlyFunction({
      network,
      contractAddress,
      contractName,
      functionName: 'get-api',
      functionArgs: [stringAsciiCV(apiName)],
      senderAddress: contractAddress,
    });

    console.log('Raw response:', response);

    // Check if response has result property
    const clarityValue = (response as any).result || response;
    const value = cvToValue(clarityValue as ClarityValue);
    
    console.log('Parsed value:', value);

    if (value && typeof value === 'object' && 'value' in value) {
      const data = value.value as any;
      
      // Extract primitive values from nested objects
      const allowedAgents = typeof data['allowed-agents'] === 'object' 
        ? data['allowed-agents'].value 
        : data['allowed-agents'];
      
      const cooldownBlocks = typeof data['cooldown-blocks'] === 'object'
        ? parseInt(data['cooldown-blocks'].value)
        : parseInt(data['cooldown-blocks']);
      
      const verifyAgent = typeof data['verify-agent'] === 'object'
        ? data['verify-agent'].value
        : data['verify-agent'];
      
      const owner = typeof data.owner === 'object'
        ? data.owner.value
        : data.owner;
      
      return {
        allowedAgents: String(allowedAgents || ''),
        cooldownBlocks: isNaN(cooldownBlocks) ? 0 : cooldownBlocks,
        verifyAgent: Boolean(verifyAgent),
        owner: String(owner || ''),
      };
    } else {
      throw new Error('API not found');
    }
  } catch (error) {
    console.error('Error fetching API:', error);
    throw error;
  }
};

export const getApiCount = async () => {
  try {
    const response = await fetchCallReadOnlyFunction({
      network,
      contractAddress,
      contractName,
      functionName: 'get-api-count',
      functionArgs: [],
      senderAddress: contractAddress,
    });

    const clarityValue = (response as any).result || response;
    const value = cvToValue(clarityValue as ClarityValue);
    
    if (value && typeof value === 'object' && 'value' in value) {
      return parseInt(value.value as string);
    }
    return 0;
  } catch (error) {
    console.error('Error fetching API count:', error);
    return 0;
  }
};

export const createApi = async (
  apiName: string,
  allowedAgents: string,
  cooldownBlocks: number,
  verifyAgent: boolean
) => {
  // Validate apiName is ASCII only
  if (!/^[\x00-\x7F]*$/.test(apiName)) {
    throw new Error('API name must contain only ASCII characters (no emojis or special Unicode)');
  }

  return new Promise((resolve, reject) => {
    openContractCall({
      network,
      contractAddress,
      contractName,
      functionName: 'create-api',
      functionArgs: [
        stringAsciiCV(apiName),
        stringUtf8CV(allowedAgents),
        uintCV(cooldownBlocks),
        boolCV(verifyAgent),
      ],
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => {
        console.log('Transaction ID:', data.txId);
        resolve(data);
      },
      onCancel: () => {
        reject(new Error('Transaction cancelled by user'));
      },
    });
  });
};

export const updateApi = async (
  apiName: string,
  allowedAgents: string,
  cooldownBlocks: number,
  verifyAgent: boolean
) => {
  // Validate apiName is ASCII only
  if (!/^[\x00-\x7F]*$/.test(apiName)) {
    throw new Error('API name must contain only ASCII characters (no emojis or special Unicode)');
  }

  return new Promise((resolve, reject) => {
    openContractCall({
      network,
      contractAddress,
      contractName,
      functionName: 'update-api',
      functionArgs: [
        stringAsciiCV(apiName),
        stringUtf8CV(allowedAgents),
        uintCV(cooldownBlocks),
        boolCV(verifyAgent),
      ],
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => {
        console.log('Transaction ID:', data.txId);
        resolve(data);
      },
      onCancel: () => {
        reject(new Error('Transaction cancelled by user'));
      },
    });
  });
};

export const deleteApi = async (apiName: string) => {
  // Validate apiName is ASCII only
  if (!/^[\x00-\x7F]*$/.test(apiName)) {
    throw new Error('API name must contain only ASCII characters (no emojis or special Unicode)');
  }

  return new Promise((resolve, reject) => {
    openContractCall({
      network,
      contractAddress,
      contractName,
      functionName: 'delete-api',
      functionArgs: [stringAsciiCV(apiName)],
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => {
        console.log('Transaction ID:', data.txId);
        resolve(data);
      },
      onCancel: () => {
        reject(new Error('Transaction cancelled by user'));
      },
    });
  });
};
