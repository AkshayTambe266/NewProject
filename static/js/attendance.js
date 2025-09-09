(async function(){
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const resultDiv = document.getElementById('result');
  const constraints = { video: { width: 480, height: 360 } };
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
  } catch (e) {
    resultDiv.textContent = 'Webcam permission denied';
    return;
  }

  document.getElementById('recognizeBtn').addEventListener('click', async () => {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    const formData = new FormData();
    formData.append('image', dataUrl);
    resultDiv.textContent = 'Recognizing...';
    try {
      const res = await fetch('/api/recognize', { method: 'POST', body: formData });
      const json = await res.json();
      if (json.ok && json.recognized) {
        resultDiv.textContent = `Marked present: ${json.student.name} (${json.student.roll_no}). Confidence: ${json.confidence.toFixed(1)}`;
      } else if (json.ok) {
        resultDiv.textContent = 'No known face detected.';
      } else {
        resultDiv.textContent = json.error || 'Recognition failed';
      }
    } catch (e) {
      resultDiv.textContent = 'Error connecting to server';
    }
  });
})();
