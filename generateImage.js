const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

function generateIntroImage(text, outputPath) {
    const width = 1280;
    const height = 720;
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    // Set background color
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, width, height);

    // Set text properties
    context.fillStyle = '#000000';
    context.font = '48px sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    // Draw text
    context.fillText(text, width / 2, height / 2);

    // Save the image
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
}

module.exports = generateIntroImage;