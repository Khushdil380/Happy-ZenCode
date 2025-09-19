# Happy Zencode Extension - Complete User Manual

## 📖 Table of Contents
1. [Installation & Setup](#installation--setup)
2. [First Time Configuration](#first-time-configuration)
3. [Using Built-in Themes](#using-built-in-themes)
4. [Uploading Custom Backgrounds](#uploading-custom-backgrounds)
5. [Adjusting Styling Options](#adjusting-styling-options)
6. [Installation Process](#installation-process)
7. [Troubleshooting](#troubleshooting)
8. [Advanced Features](#advanced-features)
9. [FAQ](#faq)

---

## 🚀 Installation & Setup

### Step 1: Install the Extension
1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for "Happy Zencode"
4. Click **Install**

### Step 2: Access the Extension
After installation, you'll see:
- **Status Bar Button**: "🎨 Happy Zencode" in the bottom-right
- **Command Palette**: Type `Happy Zencode` to see available commands

---

## 🎯 First Time Configuration

### Step 1: Open Configuration Panel
**Method 1**: Click the "🎨 Happy Zencode" button in the status bar
**Method 2**: 
1. Press `Ctrl+Shift+P` (Command Palette)
2. Type "Happy Zencode: Open Configuration"
3. Press Enter

### Step 2: Choose Your Theme
The configuration panel will open with 5 theme options:
- **Custom Theme** (default) - Use your own images
- **Zen Ocean** - Blue ocean-inspired theme
- **Zen Forest** - Green nature-inspired theme  
- **Zen Sunset** - Orange/pink sunset theme
- **Zen Night** - Dark night theme
- **Zen Cosmic** - Purple cosmic theme

### Step 3: Install the Theme
1. Select your preferred theme
2. Click **"Install Theme"** button
3. **Important**: Restart VS Code when prompted
4. Your theme will be active after restart

---

## 🎭 Using Built-in Themes

### Quick Theme Selection
1. **Command Palette Method**:
   - Press `Ctrl+Shift+P`
   - Type "Happy Zencode: Select Theme"
   - Choose from the list

2. **Configuration Panel Method**:
   - Click "🎨 Happy Zencode" in status bar
   - Click "Change Theme" button
   - Select your theme

### Theme Details

#### 🌊 Zen Ocean
- **Colors**: Blue tones, ocean-inspired
- **Best for**: Calm, focused coding sessions
- **Opacity**: Window (40%), Editor (10%), Sidebars (30%)

#### 🌲 Zen Forest  
- **Colors**: Green tones, nature-inspired
- **Best for**: Long coding sessions, eye comfort
- **Opacity**: Window (40%), Editor (10%), Sidebars (30%)

#### 🌅 Zen Sunset
- **Colors**: Orange/pink warm tones
- **Best for**: Creative projects, evening coding
- **Opacity**: Window (40%), Editor (10%), Sidebars (30%)

#### 🌙 Zen Night
- **Colors**: Dark tones with subtle highlights
- **Best for**: Night coding, dark environments
- **Opacity**: Window (50%), Editor (20%), Sidebars (40%)

#### 🌌 Zen Cosmic
- **Colors**: Purple cosmic tones
- **Best for**: Creative work, unique aesthetic
- **Opacity**: Window (40%), Editor (10%), Sidebars (30%)

---

## 🖼️ Uploading Custom Backgrounds

### Step 1: Switch to Custom Theme
1. Open Configuration Panel
2. Click "Change Theme"
3. Select "Custom Theme"

### Step 2: Upload Background Images
1. **Command Method**:
   - Press `Ctrl+Shift+P`
   - Type "Happy Zencode: Upload Background Image"
   
2. **Panel Method**:
   - Click "Upload Custom Background" in configuration panel

### Step 3: Choose Target Area
Select which area to customize:
- **Window** - Entire VS Code window background
- **Primary Sidebar** - File explorer area
- **Editor** - Code editing area
- **Secondary Sidebar** - Right sidebar (if enabled)
- **Panel** - Terminal/output area at bottom
- **Welcome Page** - VS Code start screen

### Step 4: Choose Image Source
- **Upload Local Image**: Browse and select from your computer
- **Use Image URL**: Provide HTTPS URL to online image
- **Remove Background**: Clear current background

### Step 5: Supported Image Formats
- PNG, JPG, JPEG, GIF, WebP, BMP, SVG
- **Recommended sizes**: See [Image Size Guide](#recommended-image-sizes)

---

## 🎨 Adjusting Styling Options

### Opacity Controls
Fine-tune transparency for each area:
- **Range**: 0 (invisible) to 1 (fully visible)
- **Recommendations**: 
  - Editor: 0.1-0.2 (keep text readable)
  - Window: 0.3-0.5
  - Sidebars: 0.2-0.4

### Visual Effects

#### Blur Effect
- **Range**: 0-50 pixels
- **Use case**: Soften busy images, reduce distraction

#### Brightness
- **Range**: 0-2 (1 = normal)
- **Use case**: Darken/brighten images for better contrast

#### Contrast  
- **Range**: 0-2 (1 = normal)
- **Use case**: Make images more/less dramatic

#### Saturation
- **Range**: 0-2 (1 = normal)  
- **Use case**: Make colors more vivid or muted

### Image Positioning

#### Background Size
- **Cover**: Scale to fill area (may crop)
- **Contain**: Scale to fit entirely (may have gaps)
- **Auto**: Use original size
- **Stretch**: Fill area exactly (may distort)

#### Background Position
- Center, Top, Bottom, Left, Right
- Corner positions: Top Left, Top Right, etc.

---

## ⚙️ Installation Process

### What Happens During Installation?
1. **Backup Creation**: Original VS Code files are backed up
2. **File Modification**: VS Code's workbench files are modified
3. **CSS Injection**: Custom CSS is injected for backgrounds
4. **Checksum Update**: File integrity checksums are updated

### Installation Steps
1. Click "Install Theme" in configuration panel
2. Wait for "Installation successful" message
3. Click "Restart Now" or restart VS Code manually
4. Your theme will be active after restart

### Uninstallation
1. Open Configuration Panel
2. Click "Uninstall Theme"
3. Restart VS Code
4. All modifications are removed, VS Code returns to original state

---

## 🔧 Troubleshooting

### Problem: Images Not Showing

#### Solution 1: Check File Paths
1. Ensure image files exist in `assets/` folder
2. Verify file names match: `1.png`, `2.png`, etc.
3. Check folder structure:
   ```
   assets/
   ├── window/[1-5].png
   ├── psidebar/[1-5].png  
   ├── editor/[1-5].png
   ├── ssidebar/[1-5].png
   ├── panel/[1-5].png
   └── Welcome/[1-5].png
   ```

#### Solution 2: Reload Theme
1. Open Configuration Panel
2. Click "Reload Theme"
3. Restart VS Code

#### Solution 3: Check Theme Installation
1. Verify you clicked "Install Theme"
2. Ensure you restarted VS Code after installation
3. Try uninstalling and reinstalling

### Problem: "Unsupported" Warning
- **This is normal** when modifying VS Code files
- Click "Don't Show Again" to dismiss
- The extension safely backs up original files

### Problem: Performance Issues
1. **Reduce image file sizes** (< 500KB recommended)
2. **Lower opacity** for heavy images
3. **Reduce blur effects**
4. Use **simpler images** with fewer details

### Problem: Text Not Readable
1. **Lower background opacity** (especially for editor)
2. **Increase brightness** of dark images
3. **Use blur effect** to soften busy images
4. Switch to **Night theme** for better contrast

---

## 🚀 Advanced Features

### Custom CSS
For advanced users, you can add custom CSS:
1. Open VS Code Settings (`Ctrl+,`)
2. Search for "happy-zencode"
3. Add custom CSS in the CSS field

### Environment Variables
Use in file paths:
- `${vscode:workspace}` - Current project folder
- `${vscode:user}` - VS Code user directory  
- `${user:home}` - User home directory

### API Access
Enable API for other extensions:
1. Turn on "API" setting in configuration
2. Other extensions can control Happy Zencode

---

## 📏 Recommended Image Sizes

### Universal Sizes (Simple Approach)
- **Large areas** (Window, Editor, Welcome): `1920x1080`
- **Vertical areas** (Sidebars): `500x1000`
- **Horizontal areas** (Panel): `1920x720`

### Specific Recommendations
- **Window**: `1920x1080` or `2560x1440`
- **Editor**: `1600x900` or `1920x1080`  
- **Primary Sidebar**: `400x800` or `500x1000`
- **Secondary Sidebar**: `400x800` or `500x1000`
- **Panel**: `1600x600` or `1920x720`
- **Welcome Page**: `1200x800` or `1600x900`

### File Size Guidelines
- **Target**: 200KB - 800KB per image
- **Format**: JPG for photos, PNG for graphics
- **Quality**: 85-90% for JPG

---

## ❓ FAQ

### Q: Can I use the extension without internet?
**A**: Yes! The extension works completely offline when using local images.

### Q: Will this affect VS Code performance?
**A**: Minimal impact with optimized images. Use recommended file sizes.

### Q: Can I create my own themes?
**A**: Yes! Use "Custom Theme" and upload your own images for each area.

### Q: Is it safe to modify VS Code files?
**A**: Yes! The extension creates backups and can be safely uninstalled.

### Q: Can I use animated GIFs?
**A**: Yes! GIF animations are supported.

### Q: Why do I see "unsupported" warnings?
**A**: This is normal when modifying VS Code files. The warnings are safe to ignore.

### Q: Can I share my custom themes?
**A**: Yes! Share your `assets/` folder and configuration settings.

### Q: Does this work on all operating systems?
**A**: Yes! Windows, macOS, and Linux are all supported.

---

## 🎯 Quick Start Checklist

- [ ] Install Happy Zencode extension
- [ ] Click "🎨 Happy Zencode" in status bar
- [ ] Choose a theme (or stay with Custom)
- [ ] Click "Install Theme" 
- [ ] Restart VS Code
- [ ] Enjoy your customized coding environment!

---

## 📞 Support

If you encounter issues:
1. Try the troubleshooting steps above
2. Check that all files are in correct locations
3. Ensure you restarted VS Code after installation
4. Try uninstalling and reinstalling the theme

Remember: The extension modifies VS Code files safely and can always be completely removed using the "Uninstall Theme" feature.