document.addEventListener('DOMContentLoaded', () => {
    const commentForm = document.getElementById('comment-form');
    const commentsList = document.getElementById('comments-list');
    const dbUrl = 'http://localhost:5000'; // Replace with your backend URL
    const imageId = new URLSearchParams(window.location.search).get('id');
  
    const fetchComments = () => {
      fetch(`${dbUrl}/comments?imageId=${imageId}`)
        .then(response => response.json())
        .then(data => {
          commentsList.innerHTML = '';
          if (Array.isArray(data) && data.length > 0) {
            data.forEach(comment => {
              const commentElement = document.createElement('div');
              commentElement.className = 'comment';
              commentElement.innerHTML = `
                <p><strong>${comment.nickname}</strong> (${new Date(comment.timestamp).toLocaleString()})</p>
                <p>${comment.comment}</p>
              `;
              commentsList.appendChild(commentElement);
            });
          } else {
            commentsList.innerHTML = '<p>No comments yet. Be the first to comment!</p>';
          }
        })
        .catch(error => console.error('Error fetching comments:', error));
    };
  
    commentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nickname = document.getElementById('nickname').value;
      const comment = document.getElementById('comment').value;
  
      if (nickname && comment) {
        const newComment = {
          imageId,
          nickname,
          comment,
          timestamp: new Date().toISOString(),
        };
  
        console.log('Submitting comment:', newComment);
  
        const response = await fetch(`${dbUrl}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newComment),
        });
  
        if (response.ok) {
          console.log('Comment submitted successfully');
          fetchComments();
          commentForm.reset();
        } else {
          console.error('Error submitting comment:', response.statusText);
        }
      }
    });
  
    fetchComments();
  });
  