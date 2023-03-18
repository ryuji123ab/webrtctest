async function initialize() {
    if (typeof cv === 'undefined') {
        setTimeout(initialize, 50);
        return;
    }

    startCamera();
}

async function startCamera() {
    const video = document.getElementById('video');
    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    video.srcObject = mediaStream;

    video.addEventListener('loadedmetadata', () => {
        video.play();
        drawImage();
    });
}

async function drawImage() {
    const video = document.getElementById('video');
    const cameraCanvas = document.getElementById('cameraCanvas');
    const overlayCanvas = document.getElementById('overlayCanvas');
    const ctxCamera = cameraCanvas.getContext('2d');
    const ctxOverlay = overlayCanvas.getContext('2d');

    ctxCamera.drawImage(video, 0, 0, cameraCanvas.width, cameraCanvas.height);
    ctxOverlay.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    const segmentPositions = [
        [
            { x: 40, y: 20 },  // a (1桁目)
            { x: 90, y: 40 },  // b (1桁目)
            { x: 90, y: 140 }, // c (1桁目)
            { x: 40, y: 160 }, // d (1桁目)
            { x: 0, y: 140 },  // e (1桁目)
            { x: 0, y: 40 },   // f (1桁目)
            { x: 40, y: 80 },  // g (1桁目)
        ],
        [
            { x: 180, y: 20 },  // a (2桁目)
            { x: 230, y: 40 },  // b (2桁目)
            { x: 230, y: 140 }, // c (2桁目)
            { x: 180, y: 160 }, // d (2桁目)
            { x: 140, y: 140 }, // e (2桁目)
            { x: 140, y: 40 },  // f (2桁目)
            { x: 180, y: 80 },  // g (2桁目)
        ],
    ];

    ctxOverlay.fillStyle = 'red';
    segmentPositions.forEach(digitSegmentPositions => {
        digitSegmentPositions.forEach(pos => {
            ctxOverlay.beginPath();
            ctxOverlay.arc(pos.x, pos.y, 2, 0            , 2 * Math.PI);
            ctxOverlay.fill();
        });
    });

    recognizeSevenSegmentDisplay();

    setTimeout(drawImage, 1000 / 30); // 30fps
}

function recognizeSevenSegmentDisplay() {
    const cameraCanvas = document.getElementById('cameraCanvas');
    const resultElement = document.getElementById('result');

    let src = new cv.Mat(cameraCanvas.height, cameraCanvas.width, cv.CV_8UC4);
    let dst = new cv.Mat(cameraCanvas.height, cameraCanvas.width, cv.CV_8UC1);

    const rgba = new cv.matFromArray(cameraCanvas, 24); // 24 for RGBA
    cv.cvtColor(rgba, src, cv.COLOR_RGBA2GRAY);

    cv.threshold(src, dst, 128, 255, cv.THRESH_BINARY);

    const segmentPositions = [
        [
            { x: 40, y: 20 },  // a (1桁目)
            { x: 90, y: 40 },  // b (1桁目)
            { x: 90, y: 140 }, // c (1桁目)
            { x: 40, y: 160 }, // d (1桁目)
            { x: 0, y: 140 },  // e (1桁目)
            { x: 0, y: 40 },   // f (1桁目)
            { x: 40, y: 80 },  // g (1桁目)
        ],
        [
            { x: 180, y: 20 },  // a (2桁目)
            { x: 230, y: 40 },  // b (2桁目)
            { x: 230, y: 140 }, // c (2桁目)
            { x: 180, y: 160 }, // d (2桁目)
            { x: 140, y: 140 }, // e (2桁目)
            { x: 140, y: 40 },  // f (2桁目)
            { x: 180, y: 80 },  // g (2桁目)
        ],
    ];

    const segmentStates = segmentPositions.map(digitSegmentPositions => {
        return digitSegmentPositions.map(pos => {
            const value = dst.ucharPtr(pos.y, pos.x)[0];
            return value === 255;
        });
    });

    const recognizedNumbers = segmentStates.map(getNumberFromSegments);
    resultElement.innerHTML = `Recognized Numbers: ${recognizedNumbers.join("")}`;

    src.delete();
    dst.delete();
}

function getNumberFromSegments(segments) {
    const segmentPatterns = [
        0b0111111, // 0
        0b0001100, // 1
        0b1011011, // 2
        0b1001111, // 3
        0b1101100, // 4
        0b1100111, // 5
        0b1110111, // 6
        0b0001110, // 7
        0b1111111, // 8
        0b1101111, // 9
    ];

    const inputPattern = segments.reduce((acc, segment, idx) => {
        return acc | (segment ? 1 : 0) << idx;
    }, 0);

    for (let i = 0; i < segmentPatterns.length; i++) {
        if (
        segmentPatterns[i] === inputPattern) {
            return i;
        }
    }

    return -1; // 数字が認識できなかった場合
}

