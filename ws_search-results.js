document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('search');
    const searchTermElement = document.getElementById('search-term');
    const resultsContainer = document.getElementById('results-container');
    const randomBtn = document.getElementById('random-btn');
    const backBtn = document.getElementById('back-btn');
    const searchBtn = document.getElementById('search-btn');
    const ws = new WebSocket('ws://localhost:5000');
  
    searchTermElement.textContent = `Search Term: "${searchTerm}"`;
  
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'fetchThumbnails' }));
    };
  
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'thumbnails') {
        const filteredImages = data.data.filter(image => image.tags.includes(searchTerm.toLowerCase()) || JSON.stringify(image.tags).includes(searchTerm.toLowerCase()) || image.name.toLowerCase().includes(searchTerm.toLowerCase()));
        if (filteredImages.length > 0) {
          localStorage.setItem('imagesLength', filteredImages.length);
          resultsContainer.innerHTML = '';
          filteredImages.forEach(image => {
            const imgElement = document.createElement('img');
            imgElement.src = image.url;
            imgElement.alt = image.name;
            imgElement.style.width = '150px';
            imgElement.style.filter = 'blur(5px)';
            imgElement.style.margin = 'auto';
            imgElement.style.padding = '5px';
            imgElement.style.cursor = 'pointer';
            imgElement.addEventListener('click', () => {
              window.location.href = `/image-viewer.html?id=${image.id}`;
            });
            resultsContainer.appendChild(imgElement);
          });
        } else {
          resultsContainer.innerHTML = '<div style="height: 400px; margin: auto; max-width: 600px; display: flex; background: #FFEEEE;"><h2 style="margin: auto;">No images found</h2></div>';
        }
      }
    };
  
    randomBtn.addEventListener('click', () => {
      const imagesLength = localStorage.getItem('imagesLength');
      const randomId = Math.floor(Math.random() * imagesLength) + 1;
      window.location.href = `/image-viewer.html?id=${randomId}`;
    });
  
    backBtn.addEventListener('click', () => {
      window.history.back();
    });
  
    searchBtn.addEventListener('click', () => {
      window.location.href = '/';
    });
  });
  