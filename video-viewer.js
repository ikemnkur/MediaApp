document.addEventListener('DOMContentLoaded', () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const id = urlParams.get('id');
  const dbUrl = 'http://localhost:5000'; // Replace with your backend URL

  let viewUpdated = false;

  fetch(`${dbUrl}/videos/${id}`)
    .then(response => response.json())
    .then(data => {
      if (data) {
        document.getElementById('video-title').innerText = data.name;
        document.getElementById('video-nickname').innerText = data.nickname;
        document.getElementById('view-count').innerText = data.views;
        document.getElementById('like-count').innerText = data.likes;
        document.getElementById('dislike-count').innerText = data.dislikes;

        const tags = JSON.parse(data.tags);
        const tagsContainer = document.getElementById('video-tags');
        tags.forEach(tag => {
          const tagLink = document.createElement('a');
          tagLink.href = `/gallery?search=${tag}`;
          tagLink.innerText = `${tag}; `;
          tagsContainer.appendChild(tagLink);
        });

        const videoPlayer = document.getElementById('video-player');
        videoPlayer.src = data.url;

        if (!viewUpdated) {
          const newViews = data.views + 1;
          fetch(`${dbUrl}/videos/${id}/views`, {
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
    fetch(`${dbUrl}/videos/${id}/likes`, {
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
    fetch(`${dbUrl}/videos/${id}/dislikes`, {
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
        link.href = videoPlayer.src;
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
        window.location.href = `/video-viewer.html?id=${data.id}`;
      });
  });

  document.getElementById('modal-back-button').addEventListener('click', () => {
    window.history.back();
  });

  document.getElementById('modal-search-button').addEventListener('click', () => {
    window.location.href = '/';
  });
});
