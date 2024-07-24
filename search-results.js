document.addEventListener('DOMContentLoaded', () => {
    const db_url = 'http://localhost:5000'; // Replace with your backend URL
    const searchParams = new URLSearchParams(window.location.search);
    const searchTerm = searchParams.get('search');
    const searchTermElement = document.getElementById('search-term');
    const filteredImagesContainer = document.getElementById('filtered-images-container');
    const noImagesFound = document.getElementById('no-images-found');
    const randomButton = document.getElementById('random-button');
    const backButton = document.getElementById('back-button');
    const searchButton = document.getElementById('search-button');
    let images = [];
  
    searchTermElement.textContent = `Search Term: "${searchTerm}"`;
  
    fetch(`${db_url}/thumbnails`)
      .then(response => response.json())
      .then(data => {
        images = data;
        filterImages();
      });
  
    const filterImages = () => {
      const filteredImages = images.filter(image => 
        image.tags.includes(searchTerm.toLocaleLowerCase()) || 
        JSON.stringify(image.tags).includes(searchTerm.toLocaleLowerCase()) || 
        image.name.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())
      );
  
      filteredImagesContainer.innerHTML = '';
      if (filteredImages.length > 0) {
        filteredImages.forEach(image => {
          const imgElement = document.createElement('img');
          imgElement.src = image.url;
          imgElement.alt = image.name;
          imgElement.style = 'width: 150px; filter: blur(5px); margin: auto; padding: 5px; cursor: pointer;';
          imgElement.addEventListener('click', () => {
            window.location.href = `/image-viewer.html?id=${image.id}`;
          });
          filteredImagesContainer.appendChild(imgElement);
        });
        noImagesFound.style.display = 'none';
      } else {
        noImagesFound.style.display = 'flex';
      }
    };
  
    randomButton.addEventListener('click', () => {
      const randomId = Math.floor(Math.random() * images.length) + 1;
      window.location.href = `/image-viewer.html?id=${randomId}`;
    });
  
    backButton.addEventListener('click', () => {
      window.history.back();
    });
  
    searchButton.addEventListener('click', () => {
      window.location.href = '/';
    });
  });
  