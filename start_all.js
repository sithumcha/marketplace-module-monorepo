const { spawn } = require('child_process');
const path = require('path');

const isDev = process.argv.includes('--dev') || process.env.NODE_ENV === 'development';

const services = isDev ? [
  { name: 'Backend API', cmd: 'npm', args: ['run', 'dev'], cwd: path.join(__dirname, 'backend'), port: 5000 },
  { name: 'Admin Panel (Vite Dev)', cmd: 'npm', args: ['run', 'dev'], cwd: path.join(__dirname, 'admin-panel'), port: 3001 },
  { name: 'Client Web (Vite Dev)', cmd: 'npm', args: ['run', 'dev'], cwd: path.join(__dirname, 'client-web'), port: 3002 },
  { name: 'Mobile Web App', cmd: 'npx', args: ['serve', '-s', 'build/web', '-l', '3000'], cwd: path.join(__dirname, 'mobile-app'), port: 3000 },
] : [
  { name: 'Backend API', cmd: 'node', args: ['server.js'], cwd: path.join(__dirname, 'backend'), port: 5000 },
  { name: 'Admin Panel', cmd: 'npx', args: ['serve', '-s', 'dist', '-l', '3001'], cwd: path.join(__dirname, 'admin-panel'), port: 3001 },
  { name: 'Client Web', cmd: 'npx', args: ['serve', '-s', 'dist', '-l', '3002'], cwd: path.join(__dirname, 'client-web'), port: 3002 },
  { name: 'Mobile Web App', cmd: 'npx', args: ['serve', '-s', 'build/web', '-l', '3000'], cwd: path.join(__dirname, 'mobile-app'), port: 3000 },
];

console.log('====================================================');
console.log(`🚀 Launching Marketplace Monorepo Services [${isDev ? 'DEVELOPMENT MODE' : 'PRODUCTION SERVE MODE'}]`);
console.log('====================================================');

services.forEach(service => {
  console.log(` Starting ${service.name} on http://localhost:${service.port}`);
  const proc = spawn(service.cmd, service.args, {
    cwd: service.cwd,
    stdio: 'pipe',
    shell: true,
    env: process.env
  });

  proc.stdout.on('data', data => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      if (line) console.log(`[${service.name}] ${line}`);
    });
  });

  proc.stderr.on('data', data => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      if (line) console.error(`[${service.name} ERR] ${line}`);
    });
  });

  proc.on('close', code => {
    console.log(`[${service.name}] Exited with status code ${code}`);
  });
});

