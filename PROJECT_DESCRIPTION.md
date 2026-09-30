# PDF Dark Mode Converter - Project Overview & Technical Architecture

## 📖 Introduction
**PDF Dark Mode Converter** is a high-performance, privacy-first web application designed to convert PDF documents into comfortable, eye-friendly dark mode themes.

Unlike traditional online PDF converters that upload user files to remote cloud servers, this tool executes **100% locally inside the user's web browser** using modern browser standards: WebAssembly, HTML5 Canvas 2D blend modes, and Web Workers.

---

## 🚀 Key Features

### 1. 🛡️ 100% Client-Side Privacy Guarantee
- **Zero Server Uploads**: Sensitive contracts, medical documents, research papers, and private documents never leave the client device.
- **In-Memory Operation**: All rendering and composition happen strictly in volatile browser RAM and are immediately deallocated.
- **No Telemetry / No Tracking**: Zero analytics trackers or tracking scripts.

### 2. ⚡ Multi-Core & GPU Accelerated Engine
- **Parallel Hardware Concurrency**: Automatically measures the system's available CPU cores (`navigator.hardwareConcurrency`) and distributes page rendering across parallel worker threads.
- **GPU Canvas Compositing**: Uses hardware-accelerated 2D canvas blend operations (`difference` and `screen`) rather than slow JavaScript pixel loops, processing pages 10–15× faster.
- **Direct Stream PDF Embedding**: Re-encodes pages to optimized JPEG streams and embeds them directly into a newly generated PDF document via PDF-Lib.

### 3. 🎨 Rich Reading Palettes & Custom Themes
Includes carefully calibrated color profiles designed for nocturnal reading and OLED power savings:
1. **Claude Warm** (`rgb(42, 37, 34)`): Soft dark charcoal with a gentle warm cast, minimizing blue light.
2. **OLED Black** (`rgb(0, 0, 0)`): Pure pitch black, turning off pixels on OLED displays for zero light emission and maximum battery savings.
3. **ChatGPT Cool** (`rgb(52, 53, 65)`): Slate cool grey tone matching modern IDEs and editors.
4. **Sepia Night** (`rgb(40, 35, 25)`): Muted amber warmth tailored for late-night reading.
5. **Midnight Blue** (`rgb(25, 30, 45)`): Deep navy blue palette enhancing reading focus.
6. **Forest Green** (`rgb(25, 35, 30)`): Calming organic dark pine tint.
7. **Nord Arctic** (`rgb(36, 41, 51)`): Crisp Scandinavian dark slate frost.
8. **Dracula Violet** (`rgb(40, 42, 54)`): Elegant dark violet theme.
9. **Custom Tint**: Interactive HTML5 color picker allowing users to dial in any hex color for their background.

### 4. 🎛️ Fine-Tuning & Inversion Modes
- **Inversion Style**: Toggle between *Tinted Dark Mode* (color inversion + theme tinting) and *High Contrast Invert* (pure black and white inversion).
- **Resolution Quality Presets**:
  - *Standard (1.5x)*: Rapid processing, smaller output file size.
  - *High-Res (2.0x)*: Balanced default, sharp vector text rendering.
  - *Ultra (2.5x)*: High-density rendering for fine mathematical formulas and blueprints.
- **Page Range Filter**: Convert specific pages (e.g. `1-5, 8, 12-20`) or the entire document.

### 5. 🖥️ Interactive Workspace & Document Viewer
- **Grid View**: Responsive multi-column page grid with page badges, dimensions, fullscreen inspection, and individual page image export (JPG).
- **Reader View**: Continuous single-page reader with previous/next navigation, jump-to-page input, and zoom controls (50% to 250%).
- **Fullscreen Lightbox**: Inspect any page at full resolution with a single click or keyboard navigation.
- **Quick Re-render**: Switch themes or adjust resolution and re-render without re-uploading the PDF.

### 6. ⌨️ Keyboard Shortcuts
- `Ctrl + O`: Open file picker
- `Ctrl + S`: Download converted PDF
- `←` / `→`: Navigate pages in Reader mode
- `Esc`: Close open modal / Lightbox

---

## 📈 Google Auto Ads & Layout Optimization

The interface has been strategically engineered to accommodate **Google AdSense Auto Ads** while preserving an optimal user experience and adhering to Google AdSense program policies:

1. **Dedicated Ad Placement Slots**:
   - **Top Leaderboard Banner**: Positioned underneath the header and above the hero section.
   - **Mid-Content In-Feed Banner**: Placed between the conversion workspace and the features bento grid.
   - **Bottom Horizontal Banner**: Placed directly above the footer.
2. **Cumulative Layout Shift (CLS) Prevention**:
   - Ad slots have pre-allocated minimum heights (`min-height: 90px` on desktop, `60px` on mobile) so the arrival of an ad does not jar or displace active buttons.
3. **Accidental Click Protection (Policy Compliance)**:
   - All ad zones are distinctly marked with a clear `ADVERTISEMENT` header and isolated from core application actions (e.g., the "Download Dark PDF" button and file dropzone).
4. **Mobile Anchor & Vignette Safety**:
   - The main container incorporates bottom safe-padding (`padding-bottom: calc(90px + env(safe-area-inset-bottom, 16px))`) to ensure Google's fixed bottom anchor ads never obscure buttons, controls, or footer links.
5. **Desktop Side Rail Room**:
   - The application layout is centered with a constrained max-width (`1200px`), giving Google Auto Ads ample peripheral space to display desktop side-rail ads without encroaching on content.

---

## 📂 Project Structure

```
pdf-dark-mode-converter/
├── index.html               # Main application HTML5 markup & AdSense tags
├── css/
│   └── style.css            # Complete design system, themes, and ad styles
├── js/
│   └── app.js               # Core processing engine, UI state, & multi-threading
├── img/                     # Icons and branding assets
├── favicon.ico              # Website favicon
├── robots.txt               # Search engine crawl rules
├── .gitignore               # Excludes OS files, test PDFs, temp files
├── LICENSE                  # MIT License
├── README.md                # Project documentation
└── PROJECT_DESCRIPTION.md   # Detailed architecture & feature description
```

---

## 🛠️ Technology Stack

- **PDF.js (`v2.16.105`)**: Client-side PDF page rasterization and metadata extraction.
- **PDF-Lib (`v1.11.0`)**: Client-side vector PDF creation and image stream embedding.
- **HTML5 Canvas 2D**: GPU-accelerated compositing blend modes (`difference`, `screen`).
- **Google AdSense Auto Ads**: Monetization script with non-intrusive container architecture.
- **Vanilla JavaScript & Modern CSS**: Zero heavy frameworks, zero build steps, ultra-fast initial load.

---

## 💻 Local Development

To run the project locally:

```bash
# 1. Clone the repository
git clone https://github.com/saheer231102/pdf-dark-mode-converter.git

# 2. Open the directory
cd pdf-dark-mode-converter

# 3. Serve via any local HTTP server (e.g. Python)
python -m http.server 8080

# 4. Open in browser
http://localhost:8080
```
