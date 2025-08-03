# Vehicle Movement Simulation - Modular Architecture

A well-organized, modular web application that simulates real-time vehicle movement on a map. Built for BLOCKLY TECHNOLOGIES PRIVATE LIMITED as a Frontend Developer Intern assignment.

## 🏗️ **Modular Architecture**

The application has been refactored into a clean, modular structure for better maintainability and scalability.

### **📁 Project Structure**

```
SchoolBus_Assignment/
├── index.html              # Main HTML file
├── styles.css              # CSS styles and responsive design
├── dummy-route.json        # Route data with coordinates and timestamps
├── debug.html              # Debug test page
├── test.html               # Simple test page
├── README.md               # Original documentation
├── README_MODULAR.md       # This modular documentation
├── vercel.json             # Vercel deployment configuration
├── netlify.toml            # Netlify deployment configuration
├── script.js               # Legacy monolithic script (kept for reference)
└── js/                     # Modular JavaScript files
    ├── config.js           # Configuration constants
    ├── utils.js            # Utility functions
    ├── MapManager.js       # Map and marker management
    ├── DataManager.js      # Route data handling
    ├── UIController.js     # User interface management
    ├── VehicleSimulation.js # Main simulation logic
    └── main.js             # Application entry point
```

## 🚀 **Usage**

### **Local Development**
```bash
# Start local server
python3 -m http.server 8080

# Open in browser
http://localhost:8080
```

### **Testing**
- **Main App**: `http://localhost:8080`
- **Debug Test**: `http://localhost:8080/debug.html`
- **Simple Test**: `http://localhost:8080/test.html`

## 🔄 **Migration from Monolithic**

The original `script.js` file has been preserved for reference. The new modular structure:

1. **Maintains all original functionality**
2. **Improves code organization**
3. **Makes debugging easier**
4. **Enables better testing**
5. **Facilitates future enhancements**

## 📊 **File Size Comparison**

| File | Lines | Purpose |
|------|-------|---------|
| `script.js` (legacy) | 527 | Monolithic approach |
| `js/` (modular) | ~1,200 | Distributed across 7 files |
| **Benefits** | - | Better organization, easier maintenance |


