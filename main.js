document.addEventListener('DOMContentLoaded', (event) => {
    const webcamSelect = document.getElementById('webcam-select');
    const validateBtn = document.getElementById('validate-btn');
    const webcamVideo = document.getElementById('webcam-video');
    const captureBtn = document.getElementById('capture-btn');
    const capturedImage = document.getElementById('captured-image');
    const saveBtn = document.getElementById('save-btn');
    let currentStream;

    async function getWebcams() {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        videoDevices.forEach((device, index) => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.text = device.label || `Webcam ${index + 1}`;
            webcamSelect.appendChild(option);
        });
    }

    getWebcams();

    async function startWebcam(deviceId) {
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
        }
        const constraints = {
            video: { deviceId: { exact: deviceId } }
        };
        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        webcamVideo.srcObject = currentStream;
        webcamVideo.play();
    }

    validateBtn.addEventListener('click', () => {
        const selectedDeviceId = webcamSelect.value;
        startWebcam(selectedDeviceId);
        captureBtn.classList.remove('hidden');
    });

    function captureImage() {
        const canvas = document.createElement('canvas');
        canvas.width = webcamVideo.videoWidth;
        canvas.height = webcamVideo.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(webcamVideo, 0, 0, canvas.width, canvas.height);
        
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg; 
            data[i + 1] = avg; 
            data[i + 2] = avg; 
        }
        context.putImageData(imageData, 0, 0);

        const dataUrl = canvas.toDataURL('image/png');
        capturedImage.src = dataUrl;
        capturedImage.classList.remove('hidden');
        saveBtn.classList.remove('hidden');
    }

    captureBtn.addEventListener('click', captureImage);

    function saveImage() {
        const a = document.createElement('a');
        a.href = capturedImage.src;
        a.download = 'captured-image.png';
        a.click();
    }
    
    saveBtn.addEventListener('click', saveImage);
});
