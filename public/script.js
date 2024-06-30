const filesInput = document.getElementById('files');
const createShowreelBtn = document.getElementById('createShowreelBtn');
const tooltip = document.getElementById('tooltip');

filesInput.addEventListener('change', function(event) {
    const gridContainer = document.getElementById('gridContainer');
    gridContainer.innerHTML = ''; // Clear the grid before adding new images
    const files = Array.from(event.target.files);

    // Enable or disable the Create Showreel button based on the number of files
    createShowreelBtn.disabled = files.length < 6;

    files.forEach((file, index) => {
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
                // Remove file from input.files
                const dt = new DataTransfer();
                files.forEach((f, i) => {
                    if (i !== index) dt.items.add(f);
                });
                filesInput.files = dt.files;

                // Update the Create Showreel button state
                createShowreelBtn.disabled = dt.files.length < 6;
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
    var formData = new FormData(this);
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