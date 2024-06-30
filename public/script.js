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
        downloadLink.innerText = 'Download Showreel';
    }).catch(error => {
        document.getElementById('loadingSpinner').style.display = 'none';
        alert('Error creating showreel.');
    });
});