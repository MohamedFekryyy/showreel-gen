const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const generateIntroImage = require('./generateImage');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add a route for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/upload', upload.array('files'), (req, res) => {
    const introText = req.body.introText || 'Introductory Text';
    const files = req.files;

    // Generate an image with the intro text
    const introImagePath = path.join(__dirname, 'uploads', 'intro.png');
    generateIntroImage(introText, introImagePath);

    // Create a video from the intro image
    const introVideoPath = path.join(__dirname, 'uploads', 'intro.mp4');
    ffmpeg(introImagePath)
        .loop(3)
        .size('1280x720')
        .output(introVideoPath)
        .on('end', () => {
            console.log('Intro video created at', introVideoPath);
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
                console.log('All image videos created:', imageVideoPaths);
                // Concatenate intro video with the first image video for testing
                const finalVideoPath = path.join(__dirname, 'uploads', 'showreel.mp4');
                const ffmpegCommand = ffmpeg().input(introVideoPath).input(imageVideoPaths[0]);

                const filterComplex = `[0:v][1:v]concat=n=2:v=1:a=0,format=yuv420p[v]`;

                console.log('Filter complex:', filterComplex);

                ffmpegCommand
                    .outputOptions('-filter_complex', filterComplex)
                    .outputOptions('-map', '[v]')
                    .outputOptions('-loglevel', 'verbose') // Enable verbose logging
                    .output(finalVideoPath)
                    .on('end', () => {
                        console.log('Showreel created at', finalVideoPath);
                        res.json({ downloadUrl: `/uploads/showreel.mp4` });
                    })
                    .on('error', (err) => {
                        console.error('FFmpeg error:', err);
                        res.status(500).send('Error creating showreel');
                    })
                    .run();
            }).catch(err => {
                console.error('Error creating image videos:', err);
                res.status(500).send('Error creating image videos');
            });
        })
        .on('error', (err) => {
            console.error('FFmpeg error:', err);
            res.status(500).send('Error creating intro video');
        })
        .run();
});

app.listen(3001, () => {
    console.log('Server is running on port 3001');
});