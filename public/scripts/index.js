document.addEventListener('DOMContentLoaded', () => {
    const db_url = '<%= process.env.REACT_APP_JSON_DB_API_BASE_URL %>';
    const searchTermInput = document.getElementById('searchTerm');
    const searchForm = document.getElementById('search-form');
    const uploadButton = document.getElementById('upload-button');
    const randomButton = document.getElementById('random-button');
    const randomThumbnailsContainer = document.getElementById('random-thumbnails');
  
    let thumbnails = [];
    let randomThumbnails = [];
  
    const fetchThumbnails = async () => {
      try {
        const response = await fetch(`${db_url}/thumbnails`);
        const data = await response.json();
        thumbnails = data;
        setRandomThumbnails(generateRandomThumbnails(data));
      } catch (error) {
        console.error('Error fetching thumbnails:', error);
      }
    };
  
    const generateRandomThumbnails = (thumbnails) => {
      const shuffled = [...thumbnails].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 3);
    };
  
    const setRandomThumbnails = (thumbnails) => {
      randomThumbnailsContainer.innerHTML = '';
      thumbnails.forEach((thumbnail, index) => {
        const img = document.createElement('img');
        img.src = thumbnail.url;
        img.alt = thumbnail.name;
        img.style.filter = 'blur(10px)';
        img.style.maxWidth = '100px';
        img.style.maxHeight = '100px';
        img.style.margin = 'auto';
        img.style.padding = '5px';
        img.style.borderRadius = '5px';
        img.addEventListener('click', () => {
          window.location.href = `/image/${thumbnail.id}`;
        });
        randomThumbnailsContainer.appendChild(img);
      });
    };
  
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const searchTerm = searchTermInput.value;
      window.location.href = `/gallery?search=${searchTerm}`;
    });
  
    uploadButton.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '/upload';
    });
  
    randomButton.addEventListener('click', () => {
      const randomIndex = Math.floor(Math.random() * localStorage.getItem('imagesLength') + 1);
      window.location.href = `/image/${randomIndex}`;
    });
  
    fetchThumbnails();
  
    setInterval(() => {
      setRandomThumbnails(generateRandomThumbnails(thumbnails));
    }, 10000);
  });
  