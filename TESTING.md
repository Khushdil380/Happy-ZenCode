# Testing Guide for Happy Zencode Extension

## Quick Testing Methods

### Method 1: Using VS Code Extension Development Host (Recommended)

1. **Open the extension project in VS Code**
   - Open the `Happy-Zencode` folder in VS Code

2. **Build the extension**
   ```bash
   npx tsc -p .
   ```
   Or use Ctrl+Shift+P and run "Tasks: Run Task" → "compile"

3. **Launch Extension Development Host**
   - Press `F5` or use `Ctrl+Shift+P` → "Debug: Start Debugging"
   - This will open a new VS Code window with your extension loaded

4. **Test the extension commands**
   In the new window, press `Ctrl+Shift+P` and look for your commands:
   - `Happy Zencode: Open Configuration`
   - `Happy Zencode: Select Theme`
   - `Happy Zencode: Upload Background Image`
   - `Happy Zencode: Install Theme`
   - `Happy Zencode: Uninstall Theme`
   - `Happy Zencode: Reload Theme`

5. **Check the status bar**
   - Look for the "Happy Zencode" button in the status bar (bottom right)
   - Click it to open the configuration

### Method 2: Manual Testing Checklist

#### Test Extension Activation
- [ ] Extension activates on VS Code startup
- [ ] Status bar item appears with "Happy Zencode" text
- [ ] No console errors in Developer Tools (Help → Toggle Developer Tools)

#### Test Commands
- [ ] **Open Configuration**: Opens the configuration UI
- [ ] **Select Theme**: Shows theme selection options
- [ ] **Upload Background**: Shows area selection and file upload
- [ ] **Install Theme**: Applies the selected theme
- [ ] **Uninstall Theme**: Removes theme modifications
- [ ] **Reload Theme**: Refreshes the current theme

#### Test Theme Functionality
- [ ] Theme selection changes VS Code appearance
- [ ] Background images are applied to selected areas:
  - Window background
  - Primary sidebar
  - Editor area
  - Secondary sidebar
  - Panel (terminal/output)
  - Welcome page
- [ ] Theme persists after VS Code restart

#### Test Configuration
- [ ] Settings are saved properly
- [ ] Custom backgrounds are remembered
- [ ] Theme selection is persistent

### Method 3: Package and Install Locally

1. **Install vsce (VS Code Extension Manager)**
   ```bash
   npm install -g vsce
   ```

2. **Package the extension**
   ```bash
   vsce package
   ```

3. **Install the generated .vsix file**
   ```bash
   code --install-extension happy-zencode-1.0.0.vsix
   ```

### Method 4: Debug with Breakpoints

1. Open the extension source files in VS Code
2. Set breakpoints in the code (click left margin of line numbers)
3. Press `F5` to start debugging
4. When breakpoints are hit, you can inspect variables and step through code

### Common Issues and Troubleshooting

#### Compilation Issues
- Ensure TypeScript compiles without errors: `npx tsc -p .`
- Check the `out` directory is created and contains .js files
- Verify `tsconfig.json` is properly configured

#### Extension Not Loading
- Check the `package.json` main field points to `./out/extension.js`
- Verify activation events are correct
- Look at the Debug Console for error messages

#### Commands Not Appearing
- Ensure commands are registered in `package.json` contributes section
- Check command registration in `extension.ts`
- Verify the extension is activated

#### Theme Not Applying
- Check if VS Code has permissions to modify CSS files
- Look for error messages in the console
- Verify image paths are correct and accessible

### Testing Commands in Terminal

You can also test specific functionality by opening VS Code with your extension:

```bash
# Open VS Code with the extension for testing
code --extensionDevelopmentPath="c:\Users\admin\Desktop\ZenCode\Background\Happy-Zencode"
```

### Automated Testing (Advanced)

Create test files in `src/test/` directory for unit tests:

```typescript
// src/test/suite/extension.test.ts
import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
    test('Extension should be present', () => {
        assert.ok(vscode.extensions.getExtension('Khushdil Ansari.happy-zencode'));
    });

    test('Commands should be registered', async () => {
        const commands = await vscode.commands.getCommands(true);
        assert.ok(commands.includes('happy-zencode.openConfig'));
        assert.ok(commands.includes('happy-zencode.selectTheme'));
    });
});
```

### Success Indicators

Your extension is working correctly if:
- ✅ No compilation errors
- ✅ Extension Development Host opens without errors
- ✅ Commands appear in Command Palette
- ✅ Status bar item is visible and clickable
- ✅ Theme changes are visible in VS Code interface
- ✅ Background images load and display properly
- ✅ Settings persist between restarts

## Quick Start Testing

1. Open terminal in the extension directory
2. Run: `npx tsc -p .`
3. Press `F5` in VS Code
4. In the new window, press `Ctrl+Shift+P`
5. Type "Happy Zencode" and test all commands

Your extension should now be ready for testing!