module.exports = {
  apps: [
    {
      name: "MG",
      script: "npm run start",
      cron_restart: "0 4 * * *",
      interpreter: 'node',
      interpreter_args: '--import tsx',
      time: true
    }
  ]
}