const headerTemplate = (html: string) => {
    return `
        <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body class="w-[600px] h-[200px] bg-black/50 flex flex-col items-center align-center justify-center">
                ${html}
            </body>
        </html>
    `;
}

export { headerTemplate };