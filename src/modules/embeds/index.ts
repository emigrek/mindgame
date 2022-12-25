import * as Canvas from "canvas";

const useEmbedSpacer = async () => {
    const canvas = Canvas.createCanvas(400, 5);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#2f3136";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return {
        attachment: canvas.toBuffer(),
        name: "image.png"
    };
}   

export { useEmbedSpacer };