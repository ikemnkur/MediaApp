document.addEventListener('DOMContentLoaded', () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const id = urlParams.get('id');
  const dbUrl = 'http://localhost:5000'; // Replace with your backend URL

  let viewUpdated = false;

  fetch(`${dbUrl}/images/${id}`)
    .then(response => response.json())
    .then(data => {
      if (data) {
        document.getElementById('image-title').innerText = data.name;
        document.getElementById('image-nickname').innerText = data.nickname;
        document.getElementById('view-count').innerText = data.views;
        document.getElementById('like-count').innerText = data.likes;
        document.getElementById('dislike-count').innerText = data.dislikes;

        const tags = JSON.parse(data.tags);
        const tagsContainer = document.getElementById('image-tags');
        tags.forEach(tag => {
          const tagLink = document.createElement('a');
          tagLink.href = `/gallery?search=${tag}`;
          tagLink.innerText = `${tag}; `;
          tagsContainer.appendChild(tagLink);
        });

        const canvas = document.getElementById('image-canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = data.url;

        img.onload = () => {
          const aspectRatio = img.width / img.height;
          if (aspectRatio > 1) {
            canvas.width = 512;
            canvas.height = 512 / aspectRatio;
          } else {
            canvas.width = 512 * aspectRatio;
            canvas.height = 512;
          }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };

        if (!viewUpdated) {
          const newViews = data.views + 1;
          fetch(`${dbUrl}/images/${id}/views`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ views: newViews }),
          }).then(response => {
            if (response.ok) {
              document.getElementById('view-count').innerText = newViews;
              viewUpdated = true;
            }
          });
        }
      }
    });

  document.getElementById('like-button').addEventListener('click', () => {
    const newLikes = parseInt(document.getElementById('like-count').innerText) + 1;
    fetch(`${dbUrl}/images/${id}/likes`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ likes: newLikes }),
    }).then(response => {
      if (response.ok) {
        document.getElementById('like-count').innerText = newLikes;
      }
    });
  });

  document.getElementById('dislike-button').addEventListener('click', () => {
    const newDislikes = parseInt(document.getElementById('dislike-count').innerText) + 1;
    fetch(`${dbUrl}/images/${id}/dislikes`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dislikes: newDislikes }),
    }).then(response => {
      if (response.ok) {
        document.getElementById('dislike-count').innerText = newDislikes;
      }
    });
  });

  document.getElementById('download-button').addEventListener('click', () => {
    const countdownElem = document.getElementById('countdown');
    let countdown = 30;
    countdownElem.innerText = countdown;

    const modal = document.getElementById('download-modal');
    modal.style.display = 'block';

    const interval = setInterval(() => {
      countdown--;
      countdownElem.innerText = countdown;
      if (countdown <= 0) {
        clearInterval(interval);
        modal.style.display = 'none';
        const link = document.createElement('a');
        link.href = img.src;
        link.download = data.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }, 1000);
  });

  document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('download-modal').style.display = 'none';
  });

  document.getElementById('back-button').addEventListener('click', () => {
    window.history.back();
  });

  document.getElementById('search-button').addEventListener('click', () => {
    window.location.href = '/';
  });

  document.getElementById('random-button').addEventListener('click', () => {
    fetch(`${dbUrl}/random-media`)
      .then(response => response.json())
      .then(data => {
        window.location.href = `/media-viewer.html?id=${data.id}`;
      });
  });

  document.getElementById('modal-back-button').addEventListener('click', () => {
    window.history.back();
  });

  document.getElementById('modal-search-button').addEventListener('click', () => {
    window.location.href = '/';
  });
});
