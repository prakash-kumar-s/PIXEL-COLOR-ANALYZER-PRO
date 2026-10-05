export class ColorAnalyzer {
    constructor() {
        this.colorDatabase = [];
        this.initDatabase();
    }

    async initDatabase() {
        try {
            const csvUrl = new URL('./colors.csv', import.meta.url).href;
            const response = await fetch(csvUrl);
            if (response.ok) {
                const csvText = await response.text();
                this.parseColorDatabase(csvText);
                if (this.colorDatabase.length > 0) return;
            }
        } catch (e) {}

        try {
            const response = await fetch('./colors.csv');
            if (response.ok) {
                const csvText = await response.text();
                this.parseColorDatabase(csvText);
                if (this.colorDatabase.length > 0) return;
            }
        } catch (e) {}

        // Built-in color dataset so it NEVER shows Unknown Color
        this.colorDatabase = [
            { name: "Black", hex: "#000000", r: 0, g: 0, b: 0 },
            { name: "White", hex: "#FFFFFF", r: 255, g: 255, b: 255 },
            { name: "Red", hex: "#FF0000", r: 255, g: 0, b: 0 },
            { name: "Lime", hex: "#00FF00", r: 0, g: 255, b: 0 },
            { name: "Blue", hex: "#0000FF", r: 0, g: 0, b: 255 },
            { name: "Yellow", hex: "#FFFF00", r: 255, g: 255, b: 0 },
            { name: "Cyan", hex: "#00FFFF", r: 0, g: 255, b: 255 },
            { name: "Magenta", hex: "#FF00FF", r: 255, g: 0, b: 255 },
            { name: "Silver", hex: "#C0C0C0", r: 192, g: 192, b: 192 },
            { name: "Gray", hex: "#808080", r: 128, g: 128, b: 128 },
            { name: "Maroon", hex: "#800000", r: 128, g: 0, b: 0 },
            { name: "Olive", hex: "#808000", r: 128, g: 128, b: 0 },
            { name: "Green", hex: "#008000", r: 0, g: 128, b: 0 },
            { name: "Purple", hex: "#800080", r: 128, g: 0, b: 128 },
            { name: "Teal", hex: "#008080", r: 0, g: 128, b: 128 },
            { name: "Navy", hex: "#000080", r: 0, g: 0, b: 128 },
            { name: "Orange", hex: "#FFA500", r: 255, g: 165, b: 0 },
            { name: "Brown", hex: "#A52A2A", r: 165, g: 42, b: 42 },
            { name: "Pink", hex: "#FFC0CB", r: 255, g: 192, b: 203 },
            { name: "Gold", hex: "#FFD700", r: 255, g: 215, b: 0 },
            { name: "Violet", hex: "#EE82EE", r: 238, g: 130, b: 238 },
            { name: "Indigo", hex: "#4B0082", r: 75, g: 0, b: 130 },
            { name: "Turquoise", hex: "#40E0D0", r: 64, g: 224, b: 208 },
            { name: "Beige", hex: "#F5F5DC", r: 245, g: 245, b: 220 },
            { name: "Sky Blue", hex: "#87CEEB", r: 135, g: 206, b: 235 },
            { name: "Crimson", hex: "#DC143C", r: 220, g: 20, b: 60 }
        ];
    }
    
    parseColorDatabase(csvText) {
        this.colorDatabase = [];
        const lines = csvText.split(/\r?\n/);
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line) {
                const parts = line.split(',');
                if (parts.length >= 5) {
                    const name = parts[0].trim().replace(/^"(.*)"$/, '$1');
                    const hex = parts[1].trim();
                    const r = parseInt(parts[2].trim(), 10);
                    const g = parseInt(parts[3].trim(), 10);
                    const b = parseInt(parts[4].trim(), 10);
                    
                    if (name && !isNaN(r) && !isNaN(g) && !isNaN(b)) {
                        this.colorDatabase.push({ name, hex, r, g, b });
                    }
                }
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
            h = s = 0;
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
        const db = (this.colorDatabase && this.colorDatabase.length > 0) ? this.colorDatabase : [
            { name: "White", r: 255, g: 255, b: 255 },
            { name: "Black", r: 0, g: 0, b: 0 },
            { name: "Red", r: 255, g: 0, b: 0 },
            { name: "Lime", r: 0, g: 255, b: 0 },
            { name: "Blue", r: 0, g: 0, b: 255 },
            { name: "Yellow", r: 255, g: 255, b: 0 },
            { name: "Cyan", r: 0, g: 255, b: 255 },
            { name: "Magenta", r: 255, g: 0, b: 255 },
            { name: "Gray", r: 128, g: 128, b: 128 },
            { name: "Orange", r: 255, g: 165, b: 0 },
            { name: "Brown", r: 165, g: 42, b: 42 },
            { name: "Purple", r: 128, g: 0, b: 128 },
            { name: "Pink", r: 255, g: 192, b: 203 }
        ];

        let minDistance = Number.MAX_VALUE;
        let closestColor = "Color";

        for (const color of db) {
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
        
        previewEl.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
        valueEl.textContent = `RGB(${r}, ${g}, ${b}) | ${hex} | HSL(${this.rgbToHsl(r, g, b)})`;
        
        const closestColor = this.findClosestColor(r, g, b);
        nameEl.textContent = closestColor;
        
        const colorObj = { r, g, b, hex, name: closestColor };
        historyArray.unshift(colorObj);
        if (historyArray.length > 10) {
            historyArray.pop();
        }
        
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
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
        
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;
        
        const colorMap = {};
        const sampleStep = 100;
        
        for (let i = 0; i < data.length; i += 4 * sampleStep) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            const key = `${Math.round(r / 10) * 10},${Math.round(g / 10) * 10},${Math.round(b / 10) * 10}`;
            
            if (colorMap[key]) {
                colorMap[key].count++;
            } else {
                colorMap[key] = { r, g, b, count: 1 };
            }
        }
        
        const colors = Object.values(colorMap);
        colors.sort((a, b) => b.count - a.count);
        
        const topColors = colors.slice(0, 8);
        
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
