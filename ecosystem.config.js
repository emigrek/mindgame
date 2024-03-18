module.exports = {
  apps: [
    {
      name: "MG",
      script: "npm run start",
      cron_restart: "0 4 * * *",
      interpreter: 'node',
      interpreterArgs: '--import tsx',
      time: true
    }
  ]
}