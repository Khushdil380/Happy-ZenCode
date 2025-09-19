# Happy Zencode - Image Management Guide

## How to Add Background Images

### Method 1: Using Commands (Recommended)
1. Open Command Palette (`Ctrl+Shift+P`)
2. Type and select one of these commands:

**Available Commands:**
- **`Happy Zencode: Add Background Image`** - Browse and select image files
- **`Happy Zencode: Remove Background Image`** - Remove existing images  
- **`Happy Zencode: Open Background Settings`** - Open VS Code settings for background
- **`Happy Zencode: Install`** - Apply background changes
- **`Happy Zencode: Show Status`** - Check extension status
- **`Happy Zencode: Select Built-in Theme`** - Choose from 5 built-in themes

### Method 2: Manual Settings Configuration
Add images directly to your `settings.json`:

```json
{
  "background.enabled": true,
  "background.editor": {
    "images": [
      "file:///c:/Users/admin/Desktop/4.jpg",
      "file:///c:/path/to/another/image.png"
    ],
    "opacity": 0.6,
    "useFront": true
  }
}
```

## Step-by-Step Workflow

1. **Install Extension**: Install the new `happy-zencode-1.0.7.vsix`
2. **Add Images**: Use `Happy Zencode: Add Background Image` command
3. **Install Patches**: Run `Happy Zencode: Install` to apply changes
4. **Restart VS Code**: Restart to see the background images

## Supported Image Formats
- PNG (.png)
- JPEG (.jpg, .jpeg)  
- GIF (.gif)
- WebP (.webp)
- SVG (.svg)

## Configuration Options

```json
{
  "background.enabled": true,
  "background.autoInstall": true,
  "background.editor": {
    "images": ["file:///path/to/image.jpg"],
    "opacity": 0.1,           // 0 = transparent, 1 = opaque
    "useFront": true,         // true = above code, false = behind code
    "style": {},              // Custom CSS styles
    "styles": [],             // Individual styles per image
    "interval": 0,            // Carousel interval (seconds, 0 = disabled)
    "random": false           // Random image selection
  }
}
```

## Troubleshooting

If backgrounds don't appear:
1. Check `Happy Zencode: Show Status` for issues
2. Ensure images use `file:///` protocol (not just `file://`)
3. Run `Happy Zencode: Install` to apply patches
4. Restart VS Code after installation
5. Check that `background.enabled` is `true`

## Built-in Themes

The extension includes 5 pre-configured themes:
- Space Theme
- Ocean Theme  
- Forest Theme
- Desert Theme
- Abstract Theme

Access via `Happy Zencode: Select Built-in Theme` command.