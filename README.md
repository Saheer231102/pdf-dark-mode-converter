# PDF Dark Mode Converter 🌙

A fast, private, and client-side web application to convert any PDF file into comfortable, eye-friendly dark mode. Protect your eyes during late-night reading and extend battery life on OLED displays.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Privacy: 100% Client-Side](https://img.shields.io/badge/Privacy-100%25%20Client--Side-brightgreen.svg)](#privacy-guarantee)
[![Acceleration: Multi-Core GPU](https://img.shields.io/badge/GPU-Accelerated-orange.svg)](#performance)

---

## 🌟 Highlights

- **🔒 100% Private & In-Memory**: Files are processed entirely inside your browser using WebAssembly. No documents are ever uploaded to any server.
- **⚡ Hardware Accelerated**: Uses multi-core CPU workers (`navigator.hardwareConcurrency`) and GPU canvas blend modes for lightning-fast conversion.
- **🎨 8 Night Themes + Custom Color**: Choose from Claude Warm, OLED Black, ChatGPT Cool, Sepia Night, Midnight Blue, Forest Green, Nord Arctic, Dracula Violet, or pick your own custom tint.
- **📖 Grid & Reader Modes**: Review converted pages in a thumbnail overview grid or flip through pages in a full-featured single-page reader with zoom controls.
- **🔍 Fullscreen Lightbox & Image Export**: Inspect any converted page at maximum resolution or download individual pages as high-quality images.
- **🎛️ Advanced Controls**: Customize rendering resolution (1.5x, 2.0x, 2.5x), inversion style, and target specific page ranges (e.g. `1-5, 8`).
- **📱 Fully Responsive**: Optimized for desktop, tablet, and mobile screens.

---

## 🚀 Live Demo

Open the tool directly in your browser:  
👉 **[Launch PDF Dark Mode Converter](https://saheer231102.github.io/pdf-dark-mode-converter/)**

---

## 📖 How to Use

1. **Upload**: Drag & drop your PDF file onto the page or click **Browse Files** (Shortcut: `Ctrl + O`).
2. **Select Theme**: Click on your preferred night reading palette or pick a custom background tint.
3. **Customize (Optional)**: Adjust the resolution quality, inversion mode, or set a specific page range.
4. **View & Review**: Toggle between **Grid View** and **Reader View**, zoom in/out, or inspect pages with the fullscreen Lightbox.
5. **Download**: Click **Download Dark PDF** (Shortcut: `Ctrl + S`) to save your converted document.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + O` / `Cmd + O` | Open file picker |
| `Ctrl + S` / `Cmd + S` | Download converted dark mode PDF |
| `←` / `→` | Previous / Next page in Reader mode |
| `Esc` | Close open modals or fullscreen Lightbox |

---

## 🎨 Reading Palettes

| Theme | Hex / RGB | Mood & Purpose |
| :--- | :--- | :--- |
| **Claude Warm** | `#2a2522` | Soothing dark charcoal with warm undertones |
| **OLED Black** | `#000000` | Pure pitch black, maximum battery savings on OLED |
| **ChatGPT Cool** | `#343541` | Modern slate grey tone, easy on the eyes |
| **Sepia Night** | `#282319` | Warm amber glow for nocturnal reading |
| **Midnight Blue** | `#191e2d` | Deep cosmic navy blue for focused study |
| **Forest Green** | `#19231e` | Calming organic dark emerald |
| **Nord Arctic** | `#242933` | Scandinavian dark slate frost |
| **Dracula Violet** | `#282a36` | Refined dark purple hue |
| **Custom Tint** | Any Hex | User-selected background tone |

---

## 🛡️ Privacy Guarantee

All PDF parsing, canvas rendering, color inversion, and document re-assembly run strictly on your local machine using client-side JavaScript and WebAssembly (`pdf.js` & `pdf-lib`). No network requests containing document data are transmitted.

---

## 💻 Local Development

Run the static web application locally with any web server:

```bash
git clone https://github.com/saheer231102/pdf-dark-mode-converter.git
cd pdf-dark-mode-converter
python -m http.server 8080
```

Open `http://localhost:8080` in your web browser.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
