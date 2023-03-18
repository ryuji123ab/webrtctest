// app.js
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureButton = document.getElementById('capture');
const resultElement = document.getElementById('result');
const ctx = canvas.getContext('2d');

navigator.mediaDevices.getUserMedia({ 
    video: { 
        facingMode: 'user', // フロントカメラを使用する場合は 'user' を指定し、バックカメラを使用する場合は 'environment' を指定します。
        width: { ideal: 640 },
        height: { ideal: 480 }
    }, 
    audio: false 
})
.then(stream => {
    video.srcObject = stream;
    video.play();
})
.catch(err => {
    console.error('Error accessing camera: ', err);
});

captureButton.addEventListener('click', () => {
    ctx.drawImage(video, 0, 0, 640, 480);
    recognizeTextFromImage();
});

async function recognizeTextFromImage() {
    try {
        const result = await Tesseract.recognize(canvas, 'eng', {
logger: m => console.log(m),
});   const numbers = result.data.text.match(/\d+/g);
    if (numbers) {
        resultElement.innerHTML = `Recognized Numbers: ${numbers.join(', ')}`;
    } else {
        resultElement.innerHTML = 'No numbers recognized';
    }
} catch (err) {
    console.error('Error recognizing text from image:', err);
    resultElement.innerHTML = 'Error recognizing text from image';
}}
