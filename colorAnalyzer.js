export class ColorAnalyzer {
    constructor() {
        this.colorDatabase = [];
        this.loadColorDatabase();
    }
    
    async loadColorDatabase() {
        try {
            const response = await fetch('./colors.csv');
            const csvText = await response.text();
            this.parseColorDatabase(csvText);
        } catch (error) {
            console.error('Error loading color database:', error);
            // Use a fallback minimal dataset
            this.colorDatabase = [
                { name: "White", r: 255, g: 255, b: 255 },
                { name: "Black", r: 0, g: 0, b: 0 },
                { name: "Red", r: 255, g: 0, b: 0 },
                { name: "Green", r: 0, g: 255, b: 0 },
                { name: "Blue", r: 0, g: 0, b: 255 }
            ];
        }
    }
    
    parseColorDatabase(csvText) {
        const lines = csvText.split('\n');
        // Skip header row
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line) {
                const [name, hex, r, g, b] = line.split(',');
                this.colorDatabase.push({
                    name: name,
                    hex: hex,
                    r: parseInt(r),
                    g: parseInt(g),
                    b: parseInt(b)
                });
            }
        }
    }
    
    rgbToHex(r, g, b) {
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    }
    
    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            
            h /= 6;
        }
        
        return `${Math.round(h * 360)}°, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`;
    }
    
    findClosestColor(r, g, b) {
        if (this.colorDatabase.length === 0) {
            return "Loading color database...";
        }
        
        let minDistance = Number.MAX_VALUE;
        let closestColor = "Unknown Color";
        
        for (const color of this.colorDatabase) {
            const distance = Math.sqrt(
                Math.pow(r - color.r, 2) + 
                Math.pow(g - color.g, 2) + 
                Math.pow(b - color.b, 2)
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                closestColor = color.name;
            }
        }
        
        return closestColor;
    }
    
    updateColorInfo(r, g, b, previewEl, valueEl, nameEl, historyEl, historyArray) {
        const hex = this.rgbToHex(r, g, b);
        
        // Update color information
        previewEl.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
        valueEl.textContent = `RGB(${r}, ${g}, ${b}) | ${hex} | HSL(${this.rgbToHsl(r, g, b)})`;
        
        // Find closest color name from our dataset
        const closestColor = this.findClosestColor(r, g, b);
        nameEl.textContent = closestColor;
        
        // Add to color history (limit to 10 colors)
        const colorObj = { r, g, b, hex, name: closestColor };
        historyArray.unshift(colorObj);
        if (historyArray.length > 10) {
            historyArray.pop();
        }
        
        // Update color history display
        historyEl.innerHTML = '';
        historyArray.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'history-swatch';
            swatch.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
            swatch.title = `${color.name} - ${color.hex}`;
            swatch.addEventListener('click', () => {
                previewEl.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
                valueEl.textContent = `RGB(${color.r}, ${color.g}, ${color.b}) | ${color.hex} | HSL(${this.rgbToHsl(color.r, color.g, color.b)})`;
                nameEl.textContent = color.name;
            });
            historyEl.appendChild(swatch);
        });
    }
    
    extractColorPalette(img, paletteEl, callback) {
        // Create a temporary canvas to analyze the image
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
        
        // Get image data
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;
        
        // Sample colors from the image (simplified approach)
        const colorMap = {};
        const sampleStep = 100; // Sample every 100th pixel
        
        for (let i = 0; i < data.length; i += 4 * sampleStep) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Group similar colors
            const key = `${Math.round(r / 10) * 10},${Math.round(g / 10) * 10},${Math.round(b / 10) * 10}`;
            
            if (colorMap[key]) {
                colorMap[key].count++;
            } else {
                colorMap[key] = { r, g, b, count: 1 };
            }
        }
        
        // Convert to array and sort by frequency
        const colors = Object.values(colorMap);
        colors.sort((a, b) => b.count - a.count);
        
        // Take the top 8 colors
        const topColors = colors.slice(0, 8);
        
        // Display the color palette
        paletteEl.innerHTML = '';
        topColors.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'palette-swatch';
            swatch.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
            swatch.title = `RGB(${color.r}, ${color.g}, ${color.b})`;
            
            swatch.addEventListener('click', () => {
                callback(color.r, color.g, color.b);
            });
            
            paletteEl.appendChild(swatch);
        });
    }
}