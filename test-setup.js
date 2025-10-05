// Simple test to verify Solana Pay setup
const { Connection, PublicKey } = require('@solana/web3.js');

async function testSetup() {
  try {
    console.log('Testing Solana Pay setup...');
    
    // Test connection
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    const version = await connection.getVersion();
    console.log('✅ Solana connection successful:', version);
    
    // Test PublicKey creation
    const testKey = new PublicKey('So11111111111111111111111111111111111111112');
    console.log('✅ PublicKey creation successful:', testKey.toString());
    
    // Test Solana Pay import
    const { encodeURL } = require('@solana/pay');
    console.log('✅ Solana Pay import successful');
    
    console.log('🎉 All tests passed! Solana Pay setup is ready.');
    
  } catch (error) {
    console.error('❌ Setup test failed:', error.message);
  }
}

testSetup();