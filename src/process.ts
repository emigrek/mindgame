// State is undefined after an uncaught exception; exit and let the process manager restart the bot
process.on('uncaughtException', (err) => {
    console.error("[Uncaught Exception] Error", err)
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error("[Unhandled Rejection] Error", err)
});