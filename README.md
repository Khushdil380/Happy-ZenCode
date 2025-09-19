# Happy Zencode

A comprehensive VS Code customization extension that combines beautiful themes with customizable background images.

## Features

### 🎭 5 Built-in Themes
- **Zen Ocean** - Calming ocean-inspired blue theme
- **Zen Forest** - Natural forest-inspired green theme  
- **Zen Sunset** - Warm sunset-inspired orange and pink theme
- **Zen Night** - Deep night-inspired dark theme
- **Zen Cosmic** - Mystical cosmic-inspired purple theme

### 🖼️ Custom Background Images
Upload your own background images for different VS Code areas:
- **Window** - Entire VS Code window
- **Primary Sidebar** - File explorer area
- **Editor** - Code editing area  
- **Secondary Sidebar** - Secondary sidebar
- **Panel** - Terminal and output area
- **Welcome Page** - VS Code welcome screen

### 🎨 Advanced Customization
- **Opacity Control** - Adjust transparency for each area
- **Visual Effects** - Blur, brightness, contrast, saturation
- **Image Positioning** - Control size, repeat, and alignment
- **Theme Integration** - Colors and syntax highlighting

## Installation

1. Install from VS Code Extensions Marketplace (search for "Happy Zencode")
2. Or install directly using ID: `your-publisher.happy-zencode`

## Quick Start

1. Open the configuration panel:
   - Use command palette: `Happy Zencode: Open Configuration`
   - Or click the "Happy Zencode" button in the status bar

2. Choose a theme:
   - Select from 5 built-in themes
   - Or create your own custom theme

3. Upload custom backgrounds (optional):
   - Use `Happy Zencode: Upload Background Image`
   - Support for local files and URLs

4. Install the theme:
   - Click "Install Theme" in the configuration panel
   - Restart VS Code when prompted

## Commands

- `Happy Zencode: Open Configuration` - Open the main settings panel
- `Happy Zencode: Select Theme` - Quick theme selector
- `Happy Zencode: Upload Background Image` - Upload custom backgrounds
- `Happy Zencode: Install Theme` - Install theme modifications
- `Happy Zencode: Uninstall Theme` - Remove theme modifications
- `Happy Zencode: Reload Theme` - Refresh with current settings

## Settings

All settings are automatically managed through the configuration UI, but can also be modified in VS Code settings:

- `happy-zencode.selectedTheme` - Currently active theme
- `happy-zencode.customBackgrounds` - Custom background image paths
- `happy-zencode.opacity` - Opacity settings for each area
- `happy-zencode.styling` - Visual effects and positioning
- `happy-zencode.autoInstall` - Auto-install on startup

## Theme URLs

The built-in themes use images hosted on GitHub. To use your own theme images:

1. Upload images to a GitHub repository
2. Update the URLs in the theme definitions
3. Images must be served over HTTPS

## Technical Notes

This extension modifies VS Code's workbench files to inject custom CSS. This approach:

- Provides the most comprehensive theming capabilities
- Requires restart when installing/uninstalling
- May show "unsupported" warnings (these are safe to ignore)
- Automatically backs up original files for safe restoration

## Troubleshooting

**"Unsupported" warning**: This is normal when modifying VS Code files. The extension safely backs up originals.

**Changes not visible**: Restart VS Code after installing the theme.

**Performance issues**: Reduce blur effects or image sizes if experiencing lag.

**Restoration**: Use "Uninstall Theme" to restore VS Code to original state.

## Contributing

This extension is inspired by the excellent [Background](https://github.com/KatsuteDev/Background) extension. 

## License

[Specify your license here]

## Changelog

### 1.0.0
- Initial release
- 5 built-in themes
- Custom background upload system
- Advanced styling controls
- Configuration UI