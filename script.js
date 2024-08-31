const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const convertBtn = document.getElementById('convertBtn');
const uploadSection = document.getElementById('uploadSection');

let images = [];

// Drag-and-drop functionality
uploadSection.addEventListener('dragover', function(e) {
    e.preventDefault();
    uploadSection.style.backgroundColor = '#f0f0f0';
});

uploadSection.addEventListener('dragleave', function() {
    uploadSection.style.backgroundColor = '#fff';
});

uploadSection.addEventListener('drop', function(e) {
    e.preventDefault();
    uploadSection.style.backgroundColor = '#fff';
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
});

imageInput.addEventListener('change', function() {
    const files = Array.from(imageInput.files);
    handleFiles(files);
});

function handleFiles(files) {
    files.forEach((file, index) => {
        if (!file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const imgElement = document.createElement('img');
            imgElement.src = event.target.result;

            const imageContainer = document.createElement('div');
            imageContainer.classList.add('image-container');
            
            // Create image number label
            const imageNumber = document.createElement('div');
            imageNumber.classList.add('image-number');
            imageNumber.textContent = `Image ${images.length + 1}`;

            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '&times;';
            removeBtn.classList.add('remove-btn');
            removeBtn.addEventListener('click', () => {
                imagePreview.removeChild(imageContainer);
                images = images.filter((_, i) => i !== index);
                updateImageNumbers();
            });

            imageContainer.appendChild(imageNumber); // Append image number label
            imageContainer.appendChild(imgElement);
            imageContainer.appendChild(removeBtn);
            imagePreview.appendChild(imageContainer);
            images.push(file);
        };
        reader.readAsDataURL(file);
    });

    // Update image numbers after rearranging or removing images
    updateImageNumbers();

    // Make the images sortable
    Sortable.create(imagePreview, {
        animation: 150,
        onEnd: function(evt) {
            const oldIndex = evt.oldIndex;
            const newIndex = evt.newIndex;
            if (oldIndex !== newIndex) {
                const movedItem = images.splice(oldIndex, 1)[0];
                images.splice(newIndex, 0, movedItem);
            }
            updateImageNumbers();
        }
    });
}

// Update image numbers after rearranging or removing images
function updateImageNumbers() {
    const imageContainers = document.querySelectorAll('.image-container');
    imageContainers.forEach((container, index) => {
        const imageNumber = container.querySelector('.image-number');
        imageNumber.textContent = `Image ${index + 1}`;
    });
}

// Convert images to PDF with proper fitting
convertBtn.addEventListener('click', function() {
    if (images.length === 0) {
        alert("Please select at least one image file.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    let imageCount = 0;

    images.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.src = event.target.result;
            img.onload = function() {
                const imgWidth = img.width;
                const imgHeight = img.height;
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                
                // Calculate the scaling factor to fit the image within the page
                const scaleFactor = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
                const scaledWidth = imgWidth * scaleFactor;
                const scaledHeight = imgHeight * scaleFactor;

                if (index > 0) {
                    pdf.addPage();
                }
                
                // Center the image on the page
                const xOffset = (pdfWidth - scaledWidth) / 2;
                const yOffset = (pdfHeight - scaledHeight) / 2;
                pdf.addImage(img, 'JPEG', xOffset, yOffset, scaledWidth, scaledHeight);
                
                imageCount++;
                if (imageCount === images.length) {
                    pdf.save('images.pdf');
                }
            };
        };
        reader.readAsDataURL(file);
    });
});
