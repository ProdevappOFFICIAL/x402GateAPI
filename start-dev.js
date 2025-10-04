const { spawn } = require('child_process');
const fs = require('fs');

console.log('🔨 Building project...');

// Build the project first
const build = spawn('npm', ['run', 'build'], { stdio: 'inherit', shell: true });

build.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Build completed successfully');
    console.log('🚀 Starting server...');
    
    // Start the server
    const server = spawn('node', ['dist/index.js'], { stdio: 'inherit', shell: true });
    
    server.on('close', (serverCode) => {
      console.log(`Server exited with code ${serverCode}`);
    });
  } else {
    console.error('❌ Build failed');
  }
});