const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureButton = document.getElementById('capture');
const resultElement = document.getElementById('result');
const ctx = canvas.getContext('2d');

navigator.mediaDevices.getUserMedia(
        {{ video: { width: 360, height: 640 }, audio: false })
    .then(stream => {
        video.srcObject = stream;
        video.play();
    })
    .catch(err => {
        console.error('Error accessing camera: ', err);
    });

captureButton.addEventListener('click', () => {
    ctx.drawImage(video, 0, 0, 720,1280);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const binaryImageData = thresholdImage(imageData);
    ctx.putImageData(binaryImageData, 0, 0);
    recognizeTextFromImage();
});

function thresholdImage(imageData) {
    const threshold = 128;
    for (let i = 0; i < imageData.data.length; i += 4) {
        const grayscale = 0.299 * imageData.data[i] + 0.587 * imageData.data[i + 1] + 0.114 * imageData.data[i + 2];
        const binaryValue = grayscale < threshold ? 0 : 255;
        imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = binaryValue;
    }
    return imageData;
}

async function recognizeTextFromImage() {
    try {
        const result = await Tesseract.recognize(canvas, 'eng', {
            logger: m => console.log(m),
        });

        const numbers = result.data.text.match(/\d+/g);
        if (numbers) {
            resultElement.innerHTML = `Recognized Numbers: ${numbers.join(', ')}`;
        } else {
            resultElement.innerHTML = 'No numbers recognized';
        }
    } catch (err) {
        console.error('Error recognizing text from image:', err);
        resultElement.innerHTML = 'Error recognizing text from image';
    }
}
