const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.post('/upload', upload.array('files'), (req, res) => {
    const files = req.files.map(file => file.path);

    // Ensure the showreels directory exists
    const showreelsDir = path.join(__dirname, 'showreels');
    if (!fs.existsSync(showreelsDir)) {
        fs.mkdirSync(showreelsDir);
    }

    // Process the files to create a showreel
    const outputFileName = `${Date.now()}.mp4`;
    const outputFilePath = path.join(showreelsDir, outputFileName);

    // Resize images to fit within a 1280x720 box while maintaining aspect ratio and adding black bars
    const resizeFilter = 'scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1';

    const inputs = files.map(file => `-i ${file}`).join(' ');
    const filters = files.map((file, index) => `[${index}:v]${resizeFilter},tpad=stop_mode=clone:stop_duration=1[v${index}]`).join(';');
    const concatFilter = files.map((file, index) => `[v${index}]`).join('') + `concat=n=${files.length}:v=1:a=0,format=yuv420p[v]`;

    const ffmpegCommand = `ffmpeg -y ${inputs} -filter_complex "${filters};${concatFilter}" -map "[v]" ${outputFilePath}`;

    exec(ffmpegCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            console.error(`stderr: ${stderr}`);
            return res.status(500).json({ error: 'Error creating showreel' });
        }

        const downloadUrl = `/showreels/${outputFileName}`;
        res.json({ downloadUrl });
    });
});

// Serve showreels directory as static files
app.use('/showreels', express.static(path.join(__dirname, 'showreels')));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});