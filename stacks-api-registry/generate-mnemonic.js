// Generate a testnet mnemonic
import { generateSecretKey, generateWallet } from '@stacks/wallet-sdk';

async function generateMnemonic() {
  const secretKey = generateSecretKey();
  const wallet = await generateWallet({
    secretKey,
    password: 'temp-password'
  });
  
  console.log('\n=== TESTNET WALLET GENERATED ===');
  console.log('\nMnemonic (24 words):');
  console.log(secretKey);
  console.log('\nTestnet Address:');
  console.log(wallet.accounts[0].stxAddress);
  console.log('\n⚠️  IMPORTANT: Save this mnemonic securely!');
  console.log('⚠️  Never share it or commit it to git!\n');
}

generateMnemonic().catch(console.error);
