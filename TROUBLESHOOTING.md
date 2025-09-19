# 🔧 Troubleshooting Guide for Happy Zencode

## ❌ Error: "Could not locate VS Code installation directory"

### Problem Description:
This error occurs when the extension cannot find VS Code's installation files to modify them for background image injection.

### 💡 **Solution Options:**

#### Option 1: Install Custom CSS Extension (Recommended)
1. **Install the helper extension:**
   - Open VS Code Extensions (`Ctrl+Shift+X`)
   - Search for "Custom CSS and JS Loader"
   - Install by "be5invis"

2. **Use Happy Zencode:**
   - Click "🎨 Happy Zencode" in status bar
   - Select your theme
   - Click "Install Theme"
   - Follow the prompts to use Custom CSS extension
   - Run "Reload Custom CSS" command when prompted

#### Option 2: Manual CSS Installation
1. **Enable Custom CSS extension settings:**
   - Open VS Code Settings (`Ctrl+,`)
   - Search for "vscode_custom_css"
   - Set `"vscode_custom_css.policy": true`

2. **Get CSS from Happy Zencode:**
   - Open Happy Zencode configuration
   - Copy the generated CSS
   - Add it to Custom CSS extension

#### Option 3: Run as Administrator (Windows)
1. **Close VS Code completely**
2. **Right-click on VS Code icon**
3. **Select "Run as administrator"**
4. **Try installing Happy Zencode theme again**

#### Option 4: Developer Mode Installation
If you're running the extension in development mode:
1. **Package the extension:**
   ```bash
   npm install -g vsce
   vsce package
   ```
2. **Install the packaged extension:**
   - `Ctrl+Shift+P` → "Extensions: Install from VSIX"
   - Select the generated `.vsix` file

### 🎯 **Current Behavior with Fixes:**

The extension now has **automatic fallback methods**:
1. **First:** Tries to modify VS Code files directly
2. **If that fails:** Tries to use Custom CSS extension
3. **If that fails:** Applies color themes only
4. **Always:** Gives you options to proceed

### ✅ **What Works Without File Modification:**
- ✅ Color themes (syntax highlighting colors)
- ✅ Workbench color customizations  
- ✅ Extension configuration UI
- ✅ Theme switching

### ❌ **What Requires File Modification or Custom CSS:**
- ❌ Background images
- ❌ Advanced visual effects
- ❌ Multi-area image placement

---

## 🖼️ Problem: Images Not Showing (Even After Installation)

### Step-by-Step Debugging:

#### 1. **Verify Installation Success**
- Look for "Installation successful" message
- Check if you restarted VS Code after installation

#### 2. **Check Image Files**
Verify your image structure:
```
Happy-Zencode/assets/
├── window/     [1.png, 2.png, 3.png, 4.png, 5.png]
├── psidebar/   [1.png, 2.png, 3.png, 4.png, 5.png]
├── editor/     [1.png, 2.png, 3.png, 4.png, 5.png]
├── ssidebar/   [1.png, 2.png, 3.png, 4.png, 5.png]
├── panel/      [1.png, 2.png, 3.png, 4.png, 5.png]
└── Welcome/    [1.png, 2.png, 3.png, 4.png, 5.png]
```

#### 3. **Test with High Opacity**
1. Open Happy Zencode configuration
2. Set all opacity values to 0.8 or higher
3. Check if images become visible

#### 4. **Check Developer Console**
1. `Help` → `Toggle Developer Tools`
2. Look for errors in Console tab
3. Check Network tab for failed image loads

#### 5. **Try Different Theme**
1. Switch between built-in themes
2. Check if any theme shows images
3. Try "Custom Theme" with your own uploaded image

---

## 🔄 General Troubleshooting Steps

### Step 1: Complete Reinstall
1. **Uninstall theme:**
   - Open Happy Zencode configuration
   - Click "Uninstall Theme"
   - Restart VS Code

2. **Reinstall theme:**
   - Click "Install Theme"
   - Follow all prompts
   - Restart VS Code

### Step 2: Check VS Code Version
- **Minimum required:** VS Code 1.104.0+
- **Update VS Code** if you're on an older version

### Step 3: Check Extension Host
If running in development:
1. Press `F5` to launch Extension Development Host
2. Test the extension in the new window
3. Check the original VS Code console for errors

### Step 4: File Permissions
- Ensure Happy Zencode folder has read permissions
- Images should not be in restricted directories
- Try copying images to a different location

---

## 🚀 Alternative Solutions

### Use Web-Based Images
Instead of local files, try HTTPS URLs:
1. Upload your images to GitHub, Imgur, or similar
2. Use the image URLs in Happy Zencode
3. Example: `https://i.imgur.com/yourimage.png`

### Simplified Setup
For basic theming without images:
1. Use built-in VS Code color themes
2. Modify `settings.json` directly:
```json
{
    "workbench.colorCustomizations": {
        "editor.background": "#001122",
        "sideBar.background": "#002244"
    }
}
```

---

## 📞 Still Having Issues?

### Check These Files:
1. **Extension logs:** Check VS Code Output panel
2. **Console errors:** Developer Tools → Console
3. **File paths:** Verify image paths are correct

### Report Issues:
If none of these solutions work:
1. Note your VS Code version
2. Note your operating system
3. Include any error messages
4. Describe what you've tried

The extension is designed to gracefully handle most installation scenarios, so you should at least get color themes working even if background images don't display.