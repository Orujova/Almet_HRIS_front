module.exports = {
  apps: [{
    name: 'nextjs-prod',
    script: './.next/standalone/server.js',
    cwd: '/var/www/myalmet/frontend',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
  }]
};