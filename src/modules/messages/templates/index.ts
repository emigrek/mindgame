const headerTemplate = (html: string) => {
    return `
        <html class="bg-transparent">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body class="w-[600px] h-[200px] bg-black/50 flex flex-col items-center align-center justify-center">
                <div class="absolute top-0 left-0 h-full w-[10px] bg-gradient-to-t from-[#00295d] via-[#3691a3] to-[#e7ffff]"></div>
                ${html}
            </body>
        </html>
    `;
}

export { headerTemplate };