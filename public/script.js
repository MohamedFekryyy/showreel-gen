const filesInput = document.getElementById('files');
const createShowreelBtn = document.getElementById('createShowreelBtn');
const tooltip = document.getElementById('tooltip');
const gridContainer = document.getElementById('gridContainer');
let allFiles = []; // Array to keep track of all files

filesInput.addEventListener('change', function(event) {
    const newFiles = Array.from(event.target.files);
    allFiles = allFiles.concat(newFiles); // Append new files to the existing files

    // Clear the grid before adding new images
    gridContainer.innerHTML = ''; 

    // Enable or disable the Create Showreel button based on the number of files
    createShowreelBtn.disabled = allFiles.length < 6;

    allFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const div = document.createElement('div');
            div.className = 'grid-item';
            
            const img = document.createElement('img');
            img.src = e.target.result;
            div.appendChild(img);

            const closeButton = document.createElement('button');
            closeButton.className = 'close-icon';
            closeButton.innerHTML = '&times;';
            closeButton.addEventListener('click', () => {
                div.remove();
                // Remove file from allFiles array
                allFiles.splice(index, 1);

                // Update the files input
                const dt = new DataTransfer();
                allFiles.forEach(f => dt.items.add(f));
                filesInput.files = dt.files;

                // Update the Create Showreel button state
                createShowreelBtn.disabled = allFiles.length < 6;
            });

            div.appendChild(closeButton);
            gridContainer.appendChild(div);
        }
        reader.readAsDataURL(file);
    });
});

createShowreelBtn.addEventListener('mouseenter', function() {
    if (createShowreelBtn.disabled) {
        tooltip.style.display = 'block';
    }
});

createShowreelBtn.addEventListener('mouseleave', function() {
    tooltip.style.display = 'none';
});

document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault();
    document.getElementById('loadingSpinner').style.display = 'block';
    const formData = new FormData();
    allFiles.forEach((file) => {
        formData.append('files', file);
    });

    fetch('/upload', {
        method: 'POST',
        body: formData
    }).then(response => response.json())
    .then(data => {
        document.getElementById('loadingSpinner').style.display = 'none';
        var downloadLink = document.getElementById('downloadLink');
        downloadLink.href = data.downloadUrl;
        downloadLink.style.display = 'block';
    }).catch(error => {
        document.getElementById('loadingSpinner').style.display = 'none';
        alert('Error creating showreel.');
    });
});