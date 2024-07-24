document.addEventListener('DOMContentLoaded', () => {
    const db_url = 'http://localhost:5000'; // Replace with your backend URL
    const form = document.getElementById('upload-form');
    const nameInput = document.getElementById('name');
    const nicknameInput = document.getElementById('nickname');
    const tagsInput = document.getElementById('tags');
    const fileInput = document.getElementById('file');
    const previewContainer = document.getElementById('preview-container');
    const previewImage = document.getElementById('preview');
    const uploadButton = document.getElementById('upload-button');
    const backButton = document.getElementById('back-button');
    let file = null;
  
    fileInput.addEventListener('change', (e) => {
      file = e.target.files[0];
      if (file) {
        previewImage.src = URL.createObjectURL(file);
        previewContainer.style.display = 'block';
      }
    });
  
    const resizeImage = (imageFile, callback) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
  
      img.onload = () => {
        const scaleFactor = 1 / 4;
        canvas.width = img.width * scaleFactor;
        canvas.height = img.height * scaleFactor;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
        canvas.toBlob(callback, 'image/jpeg');
      };
  
      img.src = URL.createObjectURL(imageFile);
    };
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      uploadButton.disabled = true;
      uploadButton.textContent = 'Uploading...';
  
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'qusohlag'); // Replace with your upload preset
  
      try {
        // Upload original image
        const response = await fetch('https://api.cloudinary.com/v1_1/dfquan1h5/image/upload', {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        const imageUrl = data.secure_url;
  
        // Create and upload thumbnail
        resizeImage(file, async (thumbnailBlob) => {
          const thumbnailFormData = new FormData();
          thumbnailFormData.append('file', thumbnailBlob);
          thumbnailFormData.append('upload_preset', 'qusohlag'); // Replace with your upload preset
  
          const thumbnailResponse = await fetch('https://api.cloudinary.com/v1_1/dfquan1h5/image/upload', {
            method: 'POST',
            body: thumbnailFormData
          });
          const thumbnailData = await thumbnailResponse.json();
          const thumbnailUrl = thumbnailData.secure_url;
  
          const timestamp = new Date().toISOString();
          const tags = tagsInput.value.split(',').map(tag => tag.trim());
          const imageData = {
            name: nameInput.value,
            nickname: nicknameInput.value,
            tags: tags,
            url: imageUrl,
            timestamp: timestamp,
            thumbnailUrl: thumbnailUrl,
          };
  
          // POST the image data to your server
          const uploadResponse = await fetch(`${db_url}/upload`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(imageData),
          });
  
          const result = await uploadResponse.json();
  
          // Reset form fields
          nameInput.value = '';
          nicknameInput.value = '';
          tagsInput.value = '';
          fileInput.value = '';
          previewContainer.style.display = 'none';
          uploadButton.disabled = false;
          uploadButton.textContent = 'Upload Image';
  
          // Navigate to the ImageViewer page with the new image ID
          window.location.href = `/image-viewer.html?id=${result.imageId}`;
        });
      } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        uploadButton.disabled = false;
        uploadButton.textContent = 'Upload Image';
      }
    });
  
    backButton.addEventListener('click', () => {
      window.history.back();
    });
  });
  