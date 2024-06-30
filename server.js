const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

app.post('/upload', upload.array('files'), (req, res) => {
    const introText = req.body.introText || 'Introductory Text';
    const files = req.files;

    // Create a video from the intro text
    const introVideoPath = path.join(__dirname, 'uploads', 'intro.mp4');
    const textFilePath = path.join(__dirname, 'uploads', 'intro.txt');
    fs.writeFileSync(textFilePath, introText);

    const introCommand = ffmpeg()
        .input('color=c=white:s=1280x720:d=3')
        .inputOptions([
            '-f', 'lavfi',
            '-t', '3'
        ])
        .complexFilter([
            `drawtext=fontfile=/path/to/font.ttf:textfile=${textFilePath}:fontcolor=black:fontsize=48:x=(w-text_w)/2:y=(h-text_h)/2`
        ])
        .outputOptions('-t 3')
        .output(introVideoPath);

    introCommand.on('end', () => {
        // Create videos from images
        const imageVideos = files.map(file => {
            const imageVideoPath = path.join(__dirname, 'uploads', `${file.filename}.mp4`);
            return new Promise((resolve, reject) => {
                ffmpeg(file.path)
                    .loop(3)
                    .size('1280x720')
                    .output(imageVideoPath)
                    .on('end', () => resolve(imageVideoPath))
                    .on('error', reject)
                    .run();
            });
        });

        // Wait for all image videos to be created
        Promise.all(imageVideos).then(imageVideoPaths => {
            // Concatenate intro video with image videos
            const finalVideoPath = path.join(__dirname, 'uploads', 'showreel.mp4');
            ffmpeg()
                .input(introVideoPath)
                .input(...imageVideoPaths)
                .outputOptions('-filter_complex', `[0:v][1:v][2:v][3:v]concat=n=${imageVideoPaths.length + 1}:v=1:a=0,format=yuv420p[v]`)
                .output(finalVideoPath)
                .on('end', () => {
                    res.json({ downloadUrl: `/uploads/showreel.mp4` });
                })
                .on('error', (err) => {
                    console.error(err);
                    res.status(500).send('Error creating showreel');
                })
                .run();
        });
    }).run();
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});