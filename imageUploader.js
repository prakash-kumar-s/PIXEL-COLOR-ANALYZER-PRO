export class ImageUploader {
    constructor(colorAnalyzer) {
        this.colorAnalyzer = colorAnalyzer;
        this.fileInput = document.getElementById('fileInput');
        this.dropArea = document.getElementById('dropArea');
        this.imageCanvas = document.getElementById('imageCanvas');
        this.colorPreview = document.getElementById('colorPreview');
        this.colorValue = document.getElementById('colorValue');
        this.colorName = document.getElementById('colorName');
        this.colorHistory = document.getElementById('colorHistory');
        this.colorPalette = document.getElementById('colorPalette');
        this.imageContainer = document.getElementById('imageContainer');
        this.zoomInBtn = document.getElementById('zoomIn');
        this.zoomOutBtn = document.getElementById('zoomOut');
        this.resetZoomBtn = document.getElementById('resetZoom');
        
        this.imageScale = 1;
        this.colorHistoryArray = [];
        this.currentImage = null;
        
        this.init();
    }
    
    init() {
        // File upload
        this.dropArea.addEventListener('click', () => {
            this.fileInput.click();
        });

        this.fileInput.addEventListener('change', () => {
            if (this.fileInput.files.length) {
                this.handleImageUpload(this.fileInput.files[0]);
            }
        });
        
        // Handle pixel color detection on canvas
        this.imageCanvas.addEventListener('click', (e) => {
            const rect = this.imageCanvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) / this.imageScale;
            const y = (e.clientY - rect.top) / this.imageScale;
            
            const ctx = this.imageCanvas.getContext('2d');
            const pixel = ctx.getImageData(x, y, 1, 1).data;
            
            const r = pixel[0];
            const g = pixel[1];
            const b = pixel[2];
            
            this.colorAnalyzer.updateColorInfo(
                r, g, b, 
                this.colorPreview, this.colorValue, this.colorName, 
                this.colorHistory, this.colorHistoryArray
            );
        });
        
        // Zoom functionality
        this.zoomInBtn.addEventListener('click', () => {
            if (this.imageScale < 3) {
                this.imageScale += 0.1;
                this.applyZoom();
            }
        });
        
        this.zoomOutBtn.addEventListener('click', () => {
            if (this.imageScale > 0.5) {
                this.imageScale -= 0.1;
                this.applyZoom();
            }
        });
        
        this.resetZoomBtn.addEventListener('click', () => {
            this.imageScale = 1;
            this.applyZoom();
        });
    }
    
    handleImageUpload(file) {
        if (!file.type.match('image.*')) {
            alert('Please upload an image file (JPG, PNG, GIF, WEBP)');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.currentImage = img;
                // Reset zoom
                this.imageScale = 1;
                // Set canvas dimensions to match image
                const maxWidth = 600;
                const ratio = Math.min(maxWidth / img.width, 1);
                this.imageCanvas.width = img.width * ratio;
                this.imageCanvas.height = img.height * ratio;
                
                // Draw image on canvas
                const ctx = this.imageCanvas.getContext('2d');
                ctx.drawImage(img, 0, 0, this.imageCanvas.width, this.imageCanvas.height);
                
                // Show the image container
                this.imageContainer.style.display = 'block';
                
                // Extract color palette
                this.colorAnalyzer.extractColorPalette(
                    img, 
                    this.colorPalette, 
                    (r, g, b) => {
                        this.colorAnalyzer.updateColorInfo(
                            r, g, b, 
                            this.colorPreview, this.colorValue, this.colorName, 
                            this.colorHistory, this.colorHistoryArray
                        );
                    }
                );
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    applyZoom() {
        if (!this.currentImage) return;
        
        const ctx = this.imageCanvas.getContext('2d');
        ctx.clearRect(0, 0, this.imageCanvas.width, this.imageCanvas.height);
        
        const scaledWidth = this.currentImage.width * this.imageScale;
        const scaledHeight = this.currentImage.height * this.imageScale;
        
        // Adjust canvas size if needed
        if (scaledWidth > this.imageCanvas.width || scaledHeight > this.imageCanvas.height) {
            this.imageCanvas.width = Math.min(scaledWidth, 800);
            this.imageCanvas.height = Math.min(scaledHeight, 600);
        }
        
        ctx.drawImage(this.currentImage, 0, 0, scaledWidth, scaledHeight);
    }
}