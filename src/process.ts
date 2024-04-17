process.on('uncaughtException', (err) => {
    console.error("[Uncaught Exception] Error", err)
});

process.on('unhandledRejection', (err) => {
    console.error("[Unhandled Rejection] Error", err)
});