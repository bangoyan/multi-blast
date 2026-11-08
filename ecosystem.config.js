module.exports = {
  apps: [
    {
      name: 'multiblast-web',
      cwd: 'apps/web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3005',
      env: {
        NODE_ENV: 'production',
        PORT: 3005,
      },
      autorestart: true,
      max_memory_restart: '500M',
    },
    {
      name: 'multiblast-worker',
      cwd: 'apps/worker',
      script: 'node_modules/.bin/tsx',
      args: 'src/index.ts',
      env: {
        NODE_ENV: 'production',
      },
      autorestart: true,
      max_memory_restart: '300M',
    },
  ],
}
