export class CameraAnalyzer {
    constructor(colorAnalyzer) {
        this.colorAnalyzer = colorAnalyzer;
        this.startCameraBtn = document.getElementById('startCamera');
        this.stopCameraBtn = document.getElementById('stopCamera');
        this.captureFrameBtn = document.getElementById('captureFrame');
        this.video = document.getElementById('video');
        this.cameraContainer = document.getElementById('cameraContainer');
        this.cameraColorPreview = document.getElementById('cameraColorPreview');
        this.cameraColorValue = document.getElementById('cameraColorValue');
        this.cameraColorName = document.getElementById('cameraColorName');
        this.cameraColorHistory = document.getElementById('cameraColorHistory');
        
        this.stream = null;
        this.cameraColorHistoryArray = [];
        
        this.init();
    }
    
    init() {
        this.startCameraBtn.addEventListener('click', () => this.startCamera());
        this.stopCameraBtn.addEventListener('click', () => this.stopCamera());
        this.captureFrameBtn.addEventListener('click', () => this.captureFrame());
        
        // Handle pixel color detection on video
        this.video.addEventListener('click', (e) => {
            if (!this.stream) return;
            
            const rect = this.video.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Create a temporary canvas to get pixel data from video
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = this.video.videoWidth;
            tempCanvas.height = this.video.videoHeight;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(this.video, 0, 0, tempCanvas.width, tempCanvas.height);
            
            // Calculate the actual position in the video
            const scaleX = this.video.videoWidth / rect.width;
            const scaleY = this.video.videoHeight / rect.height;
            const actualX = Math.floor(x * scaleX);
            const actualY = Math.floor(y * scaleY);
            
            const pixel = tempCtx.getImageData(actualX, actualY, 1, 1).data;
            const r = pixel[0];
            const g = pixel[1];
            const b = pixel[2];
            
            this.colorAnalyzer.updateColorInfo(
                r, g, b,
                this.cameraColorPreview, this.cameraColorValue, this.cameraColorName,
                this.cameraColorHistory, this.cameraColorHistoryArray
            );
        });
    }
    
    async startCamera() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
            this.video.srcObject = this.stream;
            this.cameraContainer.style.display = 'block';
            this.startCameraBtn.style.display = 'none';
            this.stopCameraBtn.style.display = 'inline-block';
            this.captureFrameBtn.style.display = 'inline-block';
        } catch (err) {
            alert('Error accessing camera: ' + err.message);
        }
    }
    
    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.video.srcObject = null;
            this.cameraContainer.style.display = 'none';
            this.startCameraBtn.style.display = 'inline-block';
            this.stopCameraBtn.style.display = 'none';
            this.captureFrameBtn.style.display = 'none';
        }
    }
    
    captureFrame() {
        if (!this.stream) return;
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.video.videoWidth;
        tempCanvas.height = this.video.videoHeight;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(this.video, 0, 0, tempCanvas.width, tempCanvas.height);
        
        // Create a new window/tab with the captured frame
        const dataURL = tempCanvas.toDataURL('image/png');
        const newWindow = window.open();
        newWindow.document.write(`<img src="${dataURL}" alt="Captured Frame" style="max-width: 100%;">`);
    }
}