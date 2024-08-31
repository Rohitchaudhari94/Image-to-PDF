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
            
            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '&times;';
            removeBtn.classList.add('remove-btn');
            removeBtn.addEventListener('click', () => {
                imagePreview.removeChild(imageContainer);
                images = images.filter((_, i) => i !== index);
            });

            imageContainer.appendChild(imgElement);
            imageContainer.appendChild(removeBtn);
            imagePreview.appendChild(imageContainer);
            images.push(file);
        };
        reader.readAsDataURL(file);
    });

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
        }
    });
}

// Convert images to PDF
convertBtn.addEventListener('click', function() {
    if (images.length === 0) {
        alert("Please select at least one image file.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    images.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.src = event.target.result;
            img.onload = function() {
                if (index > 0) {
                    pdf.addPage();
                }
                pdf.addImage(img, 'JPEG', 10, 10, 180, 160);
                if (index === images.length - 1) {
                    pdf.save('images.pdf');
                }
            };
        };
        reader.readAsDataURL(file);
    });
});
