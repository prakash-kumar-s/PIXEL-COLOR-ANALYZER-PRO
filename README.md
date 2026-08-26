Pixel Color Analyzer Pro
     A professional web application for extracting, analyzing, and exploring colors from images, webcam feeds, and URLs.

🌟 Features

🎨 Image Upload - Upload images and click on any pixel to get detailed color information
📷 Web Camera - Use your webcam to analyze colors in real-time
🔗 URL Paste - Load images from web URLs and analyze their colors
🎯 Color Detection - Get RGB, HEX, and HSL values with accurate color names
📊 Color History - Track and revisit recently selected colors
🖼️ Color Palette - Automatically extract dominant colors from images
🔍 Zoom Controls - Zoom in/out on images for precise color picking
📚 URL History - Save and quickly reload recent image URLs
📱 Responsive Design - Works perfectly on desktop and mobile devices
🌙 Dark Theme - Easy on the eyes with modern dark interface

🛠️ Development Setup
    For development or if you want to use the build tools:

Prerequisites

    Node.js (version 14 or higher)
    npm (comes with Node.js)

Installation Steps

    1.Install Node.js
        Download from nodejs.org
        Run the installer and follow the setup instructions
    2.Verify Installation
        bash
            node --version
            npm --version
    3.Set up the project
        bash
        # Navigate to the project folder
            cd pixel-color-analyzer

        # Install dependencies
            npm install
    4.Run the development server
        bash
            npm run dev

This will start a local development server and automatically open the application in your browser at http://localhost:3000


📁 File Structure
text
pixel-color-analyzer-pro/
├── 📄 index.html          # Main HTML file with embedded CSS
├── 📄 main.js            # Application entry point and module imports
├── 📄 colorAnalyzer.js   # Color analysis and database functionality
├── 📄 imageUploader.js   # Image upload and canvas handling
├── 📄 cameraAnalyzer.js  # Webcam access and video processing
├── 📄 urlPaste.js        # URL image loading and history management
├── 📄 colors.csv         # Comprehensive color name database (950+ colors)
├── 📄 package.json       # Project configuration and dependencies
├── 📄 vite.config.js    # Vite build tool configuration
└── 📄 package-lock.json # Dependency lock file

🎯 Usage Guide

📤 Image Upload
1.Click on the "Image Upload" tab
2.Click the upload area or drag & drop an image file
3.Supported formats: JPG, PNG, GIF, WEBP
4.Click anywhere on the image to get color information
5.Use zoom controls for precise color selection

📷 Web Camera
1.Click on the "Web Camera" tab
2.Click "Start Camera" to enable your webcam (grant permissions)
3.Click anywhere on the live video feed to analyze colors
4.Use "Capture Frame" to save a snapshot
5.Click "Stop Camera" when finished

🔗 URL Paste
1.Click on the "Paste URL" tab
2.Find an image online and right-click → "Copy image address"
3.Paste the URL into the input field
4.Click "Load Image" to load and analyze
5.Recent URLs are saved for quick access

🎨 Color Information Display
For each color selected, you get:

RGB Values - Red, Green, Blue components (0-255)
HEX Code - Standard web color code (#RRGGBB)
HSL Values - Hue, Saturation, Lightness
Color Name - Closest named color from database
Visual Preview - Large color swatch
History - Last 10 selected colors for quick reference