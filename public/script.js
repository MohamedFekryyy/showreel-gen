const filesInput = document.getElementById('files');
const nextStepBtn = document.getElementById('nextStepBtn');
const nextStep2Btn = document.getElementById('nextStep2Btn');
const createShowreelBtn = document.getElementById('createShowreelBtn');
const tooltip = document.getElementById('tooltip');
const gridContainer = document.getElementById('gridContainer');
const introTextInput = document.getElementById('introText');
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step3 = document.getElementById('step3');
let allFiles = []; // Array to keep track of all files

const MAX_FILES = 24; // Maximum number of files allowed

function updateNextStepButton() {
    if (allFiles.length >= 4) {
        nextStepBtn.style.display = 'block';
    } else {
        nextStepBtn.style.display = 'none';
    }
}

// Function to update the visibility of the "Create Showreel" button
function updateShowreelButton() {
    if (allFiles.length >= 6) {
        createShowreelBtn.disabled = false;
    } else {
        createShowreelBtn.disabled = true;
    }
}

filesInput.addEventListener('change', function(event) {
    const newFiles = Array.from(event.target.files);
    
    if (allFiles.length + newFiles.length > MAX_FILES) {
        alert(`You can only upload a maximum of ${MAX_FILES} files.`);
        return;
    }

    allFiles = allFiles.concat(newFiles); // Append new files to the existing files

    // Clear the grid before adding new images
    gridContainer.innerHTML = ''; 

    // Update the visibility of the Next Step button
    updateNextStepButton();

    allFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const div = document.createElement('div');
            div.className = 'grid-item';
            div.dataset.index = index; // Set the index as a data attribute
            
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

                // Update the visibility of the Next Step button
                updateNextStepButton();
                updateShowreelButton();
            });

            div.appendChild(closeButton);
            gridContainer.appendChild(div);
        }
        reader.readAsDataURL(file);
    });
});

nextStepBtn.addEventListener('click', function() {
    step1.style.display = 'none';
    step2.style.display = 'block';
});

nextStep2Btn.addEventListener('click', function() {
    step2.style.display = 'none';
    step3.style.display = 'block';
    updateShowreelButton();
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
    const introText = introTextInput.value;

    formData.append('introText', introText); // Add the intro text to the form data
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

// Initialize Sortable on the grid container
new Sortable(gridContainer, {
    animation: 150,
    onEnd: function (/**Event*/evt) {
        // Update allFiles array to match the new order
        const newOrder = [];
        gridContainer.querySelectorAll('.grid-item').forEach(item => {
            const index = parseInt(item.dataset.index, 10);
            newOrder.push(allFiles[index]);
        });
        allFiles = newOrder;

        // Update the files input
        const dt = new DataTransfer();
        allFiles.forEach(f => dt.items.add(f));
        filesInput.files = dt.files;
    },
});