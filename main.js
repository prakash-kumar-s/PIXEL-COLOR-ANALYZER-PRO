// main.js - REMOVE this line:
// import '@fortawesome/fontawesome-free/css/all.min.css';

// Import your modules
import { ColorAnalyzer } from './colorAnalyzer.js';
import { ImageUploader } from './imageUploader.js';
import { CameraAnalyzer } from './cameraAnalyzer.js';
import { URLPaste } from './urlPaste.js';

// Initialize modules
const colorAnalyzer = new ColorAnalyzer();
const imageUploader = new ImageUploader(colorAnalyzer);
const cameraAnalyzer = new CameraAnalyzer(colorAnalyzer);
const urlPaste = new URLPaste(colorAnalyzer);

// Tab navigation
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all tabs and pages
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding page
        tab.classList.add('active');
        document.getElementById(tab.dataset.page).classList.add('active');
    });
});