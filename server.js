const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Serve the front-end HTML file
app.use(express.static('public'));

app.post('/upload', upload.array('files'), (req, res) => {
    const files = req.files.map(file => file.path);

    // Process the files to create a showreel
    const outputFilePath = path.join('showreels', `${Date.now()}.mp4`);
    const ffmpegCommand = `ffmpeg -y -i ${files.join(' -i ')} -filter_complex "[0:v][1:v]concat=n=${files.length}:v=1:a=0,format=yuv420p[v]" -map "[v]" ${outputFilePath}`;

    exec(ffmpegCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).json({ error: 'Error creating showreel' });
        }

        res.json({ downloadUrl: `/${outputFilePath}` });
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});