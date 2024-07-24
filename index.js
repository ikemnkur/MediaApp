const socket = new WebSocket('ws://localhost:5000');

socket.addEventListener('open', () => {
  console.log('Connected to WebSocket');
});

document.getElementById('search-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const query = document.getElementById('search-input').value;
  socket.send(JSON.stringify({ type: 'search', query }));
});

socket.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  if (data.results) {
    // Handle displaying search results
    console.log(data.results);
  }
});

// Load random thumbnails
fetch('/random-thumbnails')
  .then(response => response.json())
  .then(data => {
    const randomThumbnailsDiv = document.getElementById('random-thumbnails');
    data.forEach(thumbnail => {
      const img = document.createElement('img');
      img.src = thumbnail.url;
      randomThumbnailsDiv.appendChild(img);
    });
  });

document.getElementById('random-media').addEventListener('click', () => {
  fetch('/random-media')
    .then(response => response.json())
    .then(data => {
      window.location.href = `/media-viewer.html?id=${data.id}`;
    });
});
