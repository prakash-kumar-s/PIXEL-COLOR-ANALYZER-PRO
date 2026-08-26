export class URLPaste {
    constructor(colorAnalyzer) {
        this.colorAnalyzer = colorAnalyzer;
        this.imageUrlInput = document.getElementById('imageUrlInput');
        this.loadUrlBtn = document.getElementById('loadUrlBtn');
        this.urlLoading = document.getElementById('urlLoading');
        this.urlImageContainer = document.getElementById('urlImageContainer');
        this.urlImageCanvas = document.getElementById('urlImageCanvas');
        this.urlColorPreview = document.getElementById('urlColorPreview');
        this.urlColorValue = document.getElementById('urlColorValue');
        this.urlColorName = document.getElementById('urlColorName');
        this.urlColorHistory = document.getElementById('urlColorHistory');
        this.urlColorPalette = document.getElementById('urlColorPalette');
        this.urlZoomInBtn = document.getElementById('urlZoomIn');
        this.urlZoomOutBtn = document.getElementById('urlZoomOut');
        this.urlResetZoomBtn = document.getElementById('urlResetZoom');
        this.urlHistoryList = document.getElementById('urlHistoryList');
        
        this.urlImageScale = 1;
        this.urlColorHistoryArray = [];
        this.currentUrlImage = null;
        this.urlHistory = JSON.parse(localStorage.getItem('urlImageHistory')) || [];
        
        this.init();
    }
    
    init() {
        // URL loading
        this.loadUrlBtn.addEventListener('click', () => {
            this.loadImageFromUrl();
        });
        
        this.imageUrlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.loadImageFromUrl();
            }
        });
        
        // Auto-detect Google Images URLs and convert them
        this.imageUrlInput.addEventListener('paste', async (e) => {
            const pastedText = e.clipboardData.getData('text');
            this.imageUrlInput.style.borderColor = 'var(--success)';
            
            // Check if it's a Google Images URL
            if (this.isGoogleImagesUrl(pastedText)) {
                e.preventDefault();
                this.imageUrlInput.value = 'Converting Google Images link...';
                
                try {
                    const directUrl = await this.convertGoogleImagesUrl(pastedText);
                    if (directUrl) {
                        this.imageUrlInput.value = directUrl;
                        setTimeout(() => this.loadImageFromUrl(), 500);
                    } else {
                        this.imageUrlInput.value = pastedText;
                        this.showGoogleImagesHelp();
                    }
                } catch (error) {
                    this.imageUrlInput.value = pastedText;
                    this.showGoogleImagesHelp();
                }
            }
            
            setTimeout(() => {
                this.imageUrlInput.style.borderColor = 'var(--primary)';
            }, 1000);
        });
        
        // Handle pixel color detection on canvas
        this.urlImageCanvas.addEventListener('click', (e) => {
            if (!this.currentUrlImage) return;
            
            const rect = this.urlImageCanvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) / this.urlImageScale;
            const y = (e.clientY - rect.top) / this.urlImageScale;
            
            const ctx = this.urlImageCanvas.getContext('2d');
            const pixel = ctx.getImageData(x, y, 1, 1).data;
            
            const r = pixel[0];
            const g = pixel[1];
            const b = pixel[2];
            
            this.colorAnalyzer.updateColorInfo(
                r, g, b,
                this.urlColorPreview, this.urlColorValue, this.urlColorName,
                this.urlColorHistory, this.urlColorHistoryArray
            );
        });
        
        // Zoom functionality
        this.urlZoomInBtn.addEventListener('click', () => {
            if (this.urlImageScale < 3) {
                this.urlImageScale += 0.1;
                this.applyUrlZoom();
            }
        });
        
        this.urlZoomOutBtn.addEventListener('click', () => {
            if (this.urlImageScale > 0.5) {
                this.urlImageScale -= 0.1;
                this.applyUrlZoom();
            }
        });
        
        this.urlResetZoomBtn.addEventListener('click', () => {
            this.urlImageScale = 1;
            this.applyUrlZoom();
        });
        
        // Initialize URL history
        this.updateUrlHistory();
    }
    
    isGoogleImagesUrl(url) {
        return url.includes('google.com') && (url.includes('/imgres') || url.includes('&imgurl='));
    }
    
    async convertGoogleImagesUrl(googleUrl) {
        try {
            // Extract image URL from Google Images redirect URL
            const urlParams = new URLSearchParams(new URL(googleUrl).search);
            const imgUrl = urlParams.get('imgurl') || urlParams.get('imgrefurl');
            
            if (imgUrl) {
                return imgUrl;
            }
            
            // Alternative method: try to extract from the URL structure
            const matches = googleUrl.match(/imgurl=([^&]+)/);
            if (matches && matches[1]) {
                return decodeURIComponent(matches[1]);
            }
            
            return null;
        } catch (error) {
            console.error('Error converting Google URL:', error);
            return null;
        }
    }
    
    showGoogleImagesHelp() {
        const helpHtml = `
            <div style="background: var(--warning); color: white; padding: 15px; border-radius: 10px; margin: 10px 0;">
                <h4><i class="fas fa-info-circle"></i> Google Images Detected</h4>
                <p>For Google Images, you need to get the direct image URL:</p>
                <ol style="text-align: left; margin: 10px 0;">
                    <li>Right-click on the image in Google Images</li>
                    <li>Select <strong>"Copy image address"</strong> (not "Copy link address")</li>
                    <li>Paste that URL here</li>
                </ol>
                <p><small>Or try these working image sources instead:</small></p>
                <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px;">
                    <button onclick="document.getElementById('imageUrlInput').value='https://picsum.photos/600/400'" style="padding: 5px 10px; background: white; color: var(--dark); border: none; border-radius: 5px; cursor: pointer;">Random Image</button>
                    <button onclick="document.getElementById('imageUrlInput').value='https://placekitten.com/600/400'" style="padding: 5px 10px; background: white; color: var(--dark); border: none; border-radius: 5px; cursor: pointer;">Kitten</button>
                </div>
            </div>
        `;
        
        // Insert help message after the URL input
        const existingHelp = document.getElementById('google-images-help');
        if (existingHelp) {
            existingHelp.remove();
        }
        
        const helpDiv = document.createElement('div');
        helpDiv.id = 'google-images-help';
        helpDiv.innerHTML = helpHtml;
        this.imageUrlInput.parentNode.parentNode.insertBefore(helpDiv, this.imageUrlInput.parentNode.nextSibling);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (helpDiv.parentNode) {
                helpDiv.remove();
            }
        }, 10000);
    }
    
    async loadImageFromUrl() {
        const url = this.imageUrlInput.value.trim();
        
        if (!url) {
            alert('Please enter an image URL');
            return;
        }
        
        // Show loading state
        this.urlLoading.style.display = 'block';
        this.loadUrlBtn.disabled = true;
        this.loadUrlBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        
        try {
            await this.handleImageFromUrl(url);
            // Clear input on success
            this.imageUrlInput.value = '';
        } catch (error) {
            console.error('URL load error:', error);
            
            if (url.includes('google.com')) {
                this.showGoogleImagesHelp();
            } else {
                alert('Error: ' + error.message + '\n\nTry using a direct image link from:\n• Unsplash.com\n• Picsum.photos\n• Placeholder.com\n\nOr right-click and "Copy image address" instead of "Copy link".');
            }
        } finally {
            // Reset button and loading
            this.urlLoading.style.display = 'none';
            this.loadUrlBtn.innerHTML = '<i class="fas fa-download"></i> Load Image';
            this.loadUrlBtn.disabled = false;
        }
    }
    
    async handleImageFromUrl(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            // Try with CORS first
            img.crossOrigin = "anonymous";
            
            img.onload = () => {
                // Add to history on successful load
                this.addUrlToHistory(url);
                
                this.currentUrlImage = img;
                this.urlImageScale = 1;
                
                const maxWidth = 600;
                const ratio = Math.min(maxWidth / img.width, 1);
                this.urlImageCanvas.width = img.width * ratio;
                this.urlImageCanvas.height = img.height * ratio;
                
                const ctx = this.urlImageCanvas.getContext('2d');
                ctx.drawImage(img, 0, 0, this.urlImageCanvas.width, this.urlImageCanvas.height);
                
                this.urlImageContainer.style.display = 'block';
                this.urlImageContainer.scrollIntoView({ behavior: 'smooth' });
                
                this.colorAnalyzer.extractColorPalette(
                    img, 
                    this.urlColorPalette, 
                    (r, g, b) => {
                        this.colorAnalyzer.updateColorInfo(
                            r, g, b,
                            this.urlColorPreview, this.urlColorValue, this.urlColorName,
                            this.urlColorHistory, this.urlColorHistoryArray
                        );
                    }
                );
                
                resolve();
            };
            
            img.onerror = () => {
                // Try without CORS as fallback
                const imgFallback = new Image();
                imgFallback.crossOrigin = null;
                
                imgFallback.onload = () => {
                    this.addUrlToHistory(url);
                    this.currentUrlImage = imgFallback;
                    this.urlImageScale = 1;
                    
                    const maxWidth = 600;
                    const ratio = Math.min(maxWidth / imgFallback.width, 1);
                    this.urlImageCanvas.width = imgFallback.width * ratio;
                    this.urlImageCanvas.height = imgFallback.height * ratio;
                    
                    const ctx = this.urlImageCanvas.getContext('2d');
                    ctx.drawImage(imgFallback, 0, 0, this.urlImageCanvas.width, this.urlImageCanvas.height);
                    
                    this.urlImageContainer.style.display = 'block';
                    this.colorAnalyzer.extractColorPalette(imgFallback, this.urlColorPalette, (r, g, b) => {
                        this.colorAnalyzer.updateColorInfo(r, g, b, this.urlColorPreview, this.urlColorValue, this.urlColorName, this.urlColorHistory, this.urlColorHistoryArray);
                    });
                    
                    resolve();
                };
                
                imgFallback.onerror = () => {
                    reject(new Error('Cannot load image. The server may block external requests.'));
                };
                
                imgFallback.src = url;
            };
            
            img.src = url;
        });
    }
    
    addUrlToHistory(url) {
        this.urlHistory = this.urlHistory.filter(item => item !== url);
        this.urlHistory.unshift(url);
        this.urlHistory = this.urlHistory.slice(0, 10);
        localStorage.setItem('urlImageHistory', JSON.stringify(this.urlHistory));
        this.updateUrlHistory();
    }
    
    removeUrlFromHistory(url) {
        this.urlHistory = this.urlHistory.filter(item => item !== url);
        localStorage.setItem('urlImageHistory', JSON.stringify(this.urlHistory));
        this.updateUrlHistory();
    }
    
    updateUrlHistory() {
        this.urlHistoryList.innerHTML = '';
        
        if (this.urlHistory.length === 0) {
            this.urlHistoryList.innerHTML = '<div class="url-history-empty">No recent URLs yet</div>';
            return;
        }
        
        this.urlHistory.forEach(url => {
            const historyItem = document.createElement('div');
            historyItem.className = 'url-history-item';
            historyItem.innerHTML = `
                <span class="url-truncate" title="${url}">${this.truncateUrl(url)}</span>
                <div class="url-actions">
                    <button class="url-load-btn" title="Load this URL">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="url-delete-btn" title="Remove from history">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            historyItem.querySelector('.url-load-btn').addEventListener('click', () => {
                this.imageUrlInput.value = url;
                this.loadImageFromUrl();
            });
            
            historyItem.querySelector('.url-delete-btn').addEventListener('click', () => {
                this.removeUrlFromHistory(url);
            });
            
            this.urlHistoryList.appendChild(historyItem);
        });
    }
    
    truncateUrl(url, maxLength = 50) {
        return url.length > maxLength ? url.substring(0, maxLength) + '...' : url;
    }
    
    applyUrlZoom() {
        if (!this.currentUrlImage) return;
        
        const ctx = this.urlImageCanvas.getContext('2d');
        ctx.clearRect(0, 0, this.urlImageCanvas.width, this.urlImageCanvas.height);
        
        const scaledWidth = this.currentUrlImage.width * this.urlImageScale;
        const scaledHeight = this.currentUrlImage.height * this.urlImageScale;
        
        if (scaledWidth > this.urlImageCanvas.width || scaledHeight > this.urlImageCanvas.height) {
            this.urlImageCanvas.width = Math.min(scaledWidth, 800);
            this.urlImageCanvas.height = Math.min(scaledHeight, 600);
        }
        
        ctx.drawImage(this.currentUrlImage, 0, 0, scaledWidth, scaledHeight);
    }
}