(async function(){
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const statusDiv = document.getElementById('status');
  const constraints = { video: { width: 480, height: 360 } };
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
  } catch (e) {
    statusDiv.textContent = 'Webcam permission denied';
    return;
  }

  document.getElementById('captureBtn').addEventListener('click', async () => {
    const form = document.getElementById('registerForm');
    const formData = new FormData(form);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    formData.append('image', dataUrl);
    statusDiv.textContent = 'Registering...';
    try {
      const res = await fetch('/api/register', { method: 'POST', body: formData });
      const json = await res.json();
      if (json.ok) {
        statusDiv.textContent = `Registered student ID ${json.student_id}. Now training...`;
        await fetch('/api/train', { method: 'POST' });
        statusDiv.textContent = 'Training complete.';
      } else {
        statusDiv.textContent = json.error || 'Registration failed';
      }
    } catch (e) {
      statusDiv.textContent = 'Error connecting to server';
    }
  });
})();
