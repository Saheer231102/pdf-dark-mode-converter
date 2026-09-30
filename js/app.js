/**
 * PDF Dark Mode Converter - Main Application Engine
 * High-performance, GPU-accelerated client-side PDF Dark Mode processor.
 */

(function () {
    'use strict';

    // =========================================================================
    // Theme Definitions & State
    // =========================================================================
    const THEMES = {
        claude: {
            name: 'Claude Warm',
            desc: 'Warm dark charcoal, soothing contrast',
            r: 42, g: 37, b: 34,
            hex: '#2a2522'
        },
        oled: {
            name: 'OLED Black',
            desc: 'Pure pitch black, zero emission',
            r: 0, g: 0, b: 0,
            hex: '#000000'
        },
        chatgpt: {
            name: 'ChatGPT Cool',
            desc: 'Slate modern grey, clean feel',
            r: 52, g: 53, b: 65,
            hex: '#343541'
        },
        sepia: {
            name: 'Sepia Night',
            desc: 'Gentle amber warmth for night owls',
            r: 40, g: 35, b: 25,
            hex: '#282319'
        },
        midnight: {
            name: 'Midnight Blue',
            desc: 'Deep cosmic navy blue tone',
            r: 25, g: 30, b: 45,
            hex: '#191e2d'
        },
        forest: {
            name: 'Forest Green',
            desc: 'Calming organic pine dark emerald',
            r: 25, g: 35, b: 30,
            hex: '#19231e'
        },
        nord: {
            name: 'Nord Arctic',
            desc: 'Scandinavian dark slate frost',
            r: 36, g: 41, b: 51,
            hex: '#242933'
        },
        dracula: {
            name: 'Dracula Violet',
            desc: 'Subtle dark purple tone',
            r: 40, g: 42, b: 54,
            hex: '#282a36'
        },
        custom: {
            name: 'Custom Tint',
            desc: 'Your personalized dark palette',
            r: 30, g: 30, b: 30,
            hex: '#1e1e1e'
        }
    };

    // Application Global State
    const state = {
        selectedThemeKey: 'claude',
        inversionMode: 'tinted', // 'tinted' or 'high-contrast'
        scale: 2.0, // Default 2.0x DPI
        originalPdfData: null,
        originalFileName: '',
        originalFileSize: 0,
        pdfTotalPages: 0,
        currentRenderId: 0,
        isProcessing: false,
        modifiedPdfBytes: null,
        convertedPages: [], // [{ idx, pageNum, blob, previewUrl, width, height }]
        currentReaderPageIndex: 0,
        currentZoom: 1.0,
        viewMode: 'grid', // 'grid' or 'reader'
        activeLightboxIndex: 0
    };

    // Library endpoints
    const PDF_JS_SRC = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js";
    const PDF_WORKER_SRC = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
    const PDF_LIB_SRC = "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.11.0/pdf-lib.min.js";

    let pdfLibReadyPromise = null;

    // =========================================================================
    // DOM Element References
    // =========================================================================
    const elements = {
        body: document.body,
        dropzone: document.getElementById('dropzone'),
        fileInput: document.getElementById('fileInput'),
        dropzonePrompt: document.getElementById('dropzonePrompt'),
        fileActiveInfo: document.getElementById('fileActiveInfo'),
        fileNameDisplay: document.getElementById('fileNameDisplay'),
        fileSizeDisplay: document.getElementById('fileSizeDisplay'),
        filePagesDisplay: document.getElementById('filePagesDisplay'),
        btnChangeFile: document.getElementById('btnChangeFile'),
        btnClearFile: document.getElementById('btnClearFile'),
        themesGrid: document.getElementById('themesGrid'),
        customColorPicker: document.getElementById('customColorPicker'),
        scaleSelector: document.getElementById('scaleSelector'),
        modeSelector: document.getElementById('modeSelector'),
        pageRangeInput: document.getElementById('pageRangeInput'),
        progressCard: document.getElementById('progressCard'),
        progressFill: document.getElementById('progressFill'),
        progressPercent: document.getElementById('progressPercent'),
        progressStatusText: document.getElementById('progressStatusText'),
        progressPageCounter: document.getElementById('progressPageCounter'),
        btnCancelConversion: document.getElementById('btnCancelConversion'),
        workspaceSection: document.getElementById('workspaceSection'),
        workspaceFileName: document.getElementById('workspaceFileName'),
        workspaceThemeBadge: document.getElementById('workspaceThemeBadge'),
        workspacePageBadge: document.getElementById('workspacePageBadge'),
        btnDownloadPdf: document.getElementById('btnDownloadPdf'),
        btnReconvert: document.getElementById('btnReconvert'),
        viewModeToggle: document.getElementById('viewModeToggle'),
        pdfGridView: document.getElementById('pdfGridView'),
        pdfReaderView: document.getElementById('pdfReaderView'),
        readerPageImg: document.getElementById('readerPageImg'),
        readerPageInput: document.getElementById('readerPageInput'),
        readerTotalPages: document.getElementById('readerTotalPages'),
        btnReaderPrev: document.getElementById('btnReaderPrev'),
        btnReaderNext: document.getElementById('btnReaderNext'),
        btnReaderZoomIn: document.getElementById('btnReaderZoomIn'),
        btnReaderZoomOut: document.getElementById('btnReaderZoomOut'),
        btnReaderZoomReset: document.getElementById('btnReaderZoomReset'),
        windowDragOverlay: document.getElementById('windowDragOverlay'),
        helpModalBackdrop: document.getElementById('helpModalBackdrop'),
        btnOpenHelp: document.getElementById('btnOpenHelp'),
        btnCloseHelp: document.getElementById('btnCloseHelp'),
        lightboxModalBackdrop: document.getElementById('lightboxModalBackdrop'),
        lightboxImg: document.getElementById('lightboxImg'),
        btnCloseLightbox: document.getElementById('btnCloseLightbox'),
        btnLightboxDownloadPage: document.getElementById('btnLightboxDownloadPage'),
        toastContainer: document.getElementById('toastContainer')
    };

    // =========================================================================
    // PDF Library Loader
    // =========================================================================
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.crossOrigin = 'anonymous';
            script.referrerPolicy = 'no-referrer';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load ${src}`));
            document.head.appendChild(script);
        });
    }

    function loadPdfLibraries() {
        if (pdfLibReadyPromise) return pdfLibReadyPromise;
        pdfLibReadyPromise = (async () => {
            await Promise.all([loadScript(PDF_JS_SRC), loadScript(PDF_LIB_SRC)]);
            if (window.pdfjsLib) {
                window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC;
            }
        })();
        return pdfLibReadyPromise;
    }

    async function ensurePdfLibraries() {
        try {
            await loadPdfLibraries();
        } catch (err) {
            showToast('Unable to load PDF libraries. Check connection.', 'error');
            throw err;
        }
    }

    // Trigger preload early in background
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => loadPdfLibraries().catch(() => {}));
    } else {
        loadPdfLibraries().catch(() => {});
    }

    // =========================================================================
    // Toast Notification System
    // =========================================================================
    function showToast(message, type = 'info', duration = 3200) {
        if (!elements.toastContainer) return;
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const iconSvg = type === 'success'
            ? `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`
            : type === 'error'
            ? `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
            : `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;

        toast.innerHTML = `${iconSvg}<span>${message}</span>`;
        elements.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(12px)';
            toast.style.transition = 'all 0.25s ease';
            setTimeout(() => toast.remove(), 260);
        }, duration);
    }

    // =========================================================================
    // Format Utilities
    // =========================================================================
    function formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    function hexToRgb(hex) {
        const cleaned = hex.replace(/^#/, '');
        const bigint = parseInt(cleaned, 16);
        return {
            r: (bigint >> 16) & 255,
            g: (bigint >> 8) & 255,
            b: bigint & 255
        };
    }

    // =========================================================================
    // Theme Management
    // =========================================================================
    function getActiveTheme() {
        if (state.selectedThemeKey === 'custom') {
            return THEMES.custom;
        }
        return THEMES[state.selectedThemeKey] || THEMES.claude;
    }

    function applyAmbientGlow() {
        const theme = getActiveTheme();
        document.documentElement.style.setProperty('--bg-tint', `rgb(${theme.r}, ${theme.g}, ${theme.b})`);
    }

    function renderThemeCards() {
        if (!elements.themesGrid) return;
        elements.themesGrid.innerHTML = '';

        Object.keys(THEMES).forEach((key) => {
            const theme = THEMES[key];
            const isCustom = key === 'custom';
            const isActive = state.selectedThemeKey === key;

            const card = document.createElement('div');
            card.className = `theme-card ${isActive ? 'active' : ''}`;
            card.setAttribute('data-theme', key);
            card.setAttribute('role', 'radio');
            card.setAttribute('aria-checked', isActive ? 'true' : 'false');
            card.setAttribute('tabindex', '0');

            let swatchHtml = '';
            if (isCustom) {
                swatchHtml = `
                    <div class="custom-color-input-wrapper">
                        <input type="color" id="customColorPickerInput" class="custom-color-picker" value="${theme.hex}" title="Pick custom color">
                    </div>
                `;
            } else {
                swatchHtml = `<div class="theme-swatch" style="background-color: ${theme.hex};"></div>`;
            }

            card.innerHTML = `
                <div class="theme-card-top">
                    ${swatchHtml}
                    <svg class="theme-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                </div>
                <div class="theme-name">${theme.name}</div>
                <div class="theme-desc">${theme.desc}</div>
            `;

            // Selection Handler
            card.addEventListener('click', (e) => {
                if (e.target.id === 'customColorPickerInput') return; // let native color picker handle itself
                selectTheme(key);
            });

            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectTheme(key);
                }
            });

            elements.themesGrid.appendChild(card);
        });

        // Attach custom color picker listener
        const customInput = document.getElementById('customColorPickerInput');
        if (customInput) {
            customInput.addEventListener('input', (e) => {
                const hex = e.target.value;
                const rgb = hexToRgb(hex);
                THEMES.custom.hex = hex;
                THEMES.custom.r = rgb.r;
                THEMES.custom.g = rgb.g;
                THEMES.custom.b = rgb.b;
                selectTheme('custom');
            });
        }
    }

    function selectTheme(themeKey) {
        state.selectedThemeKey = themeKey;
        applyAmbientGlow();

        // Update active class on cards
        document.querySelectorAll('.theme-card').forEach((card) => {
            const isMatch = card.getAttribute('data-theme') === themeKey;
            card.classList.toggle('active', isMatch);
            card.setAttribute('aria-checked', isMatch ? 'true' : 'false');
        });

        const theme = getActiveTheme();
        if (elements.workspaceThemeBadge) {
            elements.workspaceThemeBadge.textContent = theme.name;
        }

        // Auto re-render if a file has already been loaded and converted
        if (state.originalPdfData && !state.isProcessing) {
            startConversion();
        }
    }

    // =========================================================================
    // File Management & Upload
    // =========================================================================
    function setupDropzone() {
        const dropzone = elements.dropzone;
        const fileInput = elements.fileInput;
        if (!dropzone || !fileInput) return;

        dropzone.addEventListener('click', (e) => {
            // Prevent re-trigger if clicking change or clear buttons
            if (e.target.closest('#btnChangeFile') || e.target.closest('#btnClearFile')) return;
            if (state.isProcessing) return;
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                processSelectedFile(e.target.files[0]);
            }
        });

        // Local dropzone drag events
        ['dragenter', 'dragover'].forEach(name => {
            dropzone.addEventListener(name, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach(name => {
            dropzone.addEventListener(name, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.remove('drag-over');
            });
        });

        dropzone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
                processSelectedFile(files[0]);
            }
        });

        // Window-wide drag overlay
        let dragCounter = 0;
        window.addEventListener('dragenter', (e) => {
            if (e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
                dragCounter++;
                if (elements.windowDragOverlay) elements.windowDragOverlay.style.display = 'flex';
            }
        });

        window.addEventListener('dragleave', () => {
            dragCounter--;
            if (dragCounter <= 0) {
                dragCounter = 0;
                if (elements.windowDragOverlay) elements.windowDragOverlay.style.display = 'none';
            }
        });

        window.addEventListener('dragover', (e) => e.preventDefault());

        window.addEventListener('drop', (e) => {
            e.preventDefault();
            dragCounter = 0;
            if (elements.windowDragOverlay) elements.windowDragOverlay.style.display = 'none';
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                processSelectedFile(e.dataTransfer.files[0]);
            }
        });

        // Change and Clear actions
        if (elements.btnChangeFile) {
            elements.btnChangeFile.addEventListener('click', (e) => {
                e.stopPropagation();
                fileInput.value = '';
                fileInput.click();
            });
        }

        if (elements.btnClearFile) {
            elements.btnClearFile.addEventListener('click', (e) => {
                e.stopPropagation();
                resetFile();
            });
        }
    }

    function processSelectedFile(file) {
        if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
            showToast('Please select a valid PDF file.', 'error');
            return;
        }

        state.originalFileName = file.name.replace(/\.pdf$/i, '');
        state.originalFileSize = file.size;

        const reader = new FileReader();
        reader.onload = async function () {
            const data = new Uint8Array(this.result);
            state.originalPdfData = data;

            // Load and get page count
            try {
                await ensurePdfLibraries();
                const pdf = await pdfjsLib.getDocument({ data: data }).promise;
                state.pdfTotalPages = pdf.numPages;

                updateFileActiveCard();
                showToast(`Loaded ${file.name} (${pdf.numPages} pages)`, 'success');

                // Automatically start conversion
                startConversion();
            } catch (err) {
                console.error(err);
                showToast('Failed to inspect PDF. The file may be corrupt or encrypted.', 'error');
            }
        };
        reader.readAsArrayBuffer(file);
    }

    function updateFileActiveCard() {
        if (!elements.dropzone) return;
        elements.dropzone.classList.add('has-file');
        if (elements.dropzonePrompt) elements.dropzonePrompt.style.display = 'none';
        if (elements.fileActiveInfo) elements.fileActiveInfo.style.display = 'flex';

        if (elements.fileNameDisplay) elements.fileNameDisplay.textContent = state.originalFileName + '.pdf';
        if (elements.fileSizeDisplay) elements.fileSizeDisplay.textContent = formatBytes(state.originalFileSize);
        if (elements.filePagesDisplay) elements.filePagesDisplay.textContent = `${state.pdfTotalPages} Pages`;
    }

    function resetFile() {
        state.currentRenderId++;
        state.isProcessing = false;
        state.originalPdfData = null;
        state.originalFileName = '';
        state.originalFileSize = 0;
        state.pdfTotalPages = 0;
        state.modifiedPdfBytes = null;
        clearPreviews();

        if (elements.fileInput) elements.fileInput.value = '';
        if (elements.dropzone) elements.dropzone.classList.remove('has-file');
        if (elements.dropzonePrompt) elements.dropzonePrompt.style.display = 'flex';
        if (elements.fileActiveInfo) elements.fileActiveInfo.style.display = 'none';
        if (elements.progressCard) elements.progressCard.style.display = 'none';
        if (elements.workspaceSection) elements.workspaceSection.style.display = 'none';

        showToast('Document cleared', 'info');
    }

    // =========================================================================
    // Core Rendering & GPU Inversion Engine
    // =========================================================================
    function parsePageRange(rangeStr, totalPages) {
        if (!rangeStr || !rangeStr.trim() || rangeStr.trim().toLowerCase() === 'all') {
            return Array.from({ length: totalPages }, (_, i) => i);
        }

        const indices = new Set();
        const parts = rangeStr.split(',');

        for (let part of parts) {
            part = part.trim();
            if (part.includes('-')) {
                const [start, end] = part.split('-').map(n => parseInt(n.trim(), 10));
                if (!isNaN(start) && !isNaN(end)) {
                    for (let p = Math.max(1, start); p <= Math.min(totalPages, end); p++) {
                        indices.add(p - 1);
                    }
                }
            } else {
                const p = parseInt(part, 10);
                if (!isNaN(p) && p >= 1 && p <= totalPages) {
                    indices.add(p - 1);
                }
            }
        }

        const result = Array.from(indices).sort((a, b) => a - b);
        return result.length > 0 ? result : Array.from({ length: totalPages }, (_, i) => i);
    }

    function clearPreviews() {
        state.convertedPages.forEach(p => {
            if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
        });
        state.convertedPages = [];
        if (elements.pdfGridView) elements.pdfGridView.innerHTML = '';
        if (elements.readerPageImg) elements.readerPageImg.src = '';
    }

    async function startConversion() {
        if (!state.originalPdfData) return;

        await ensurePdfLibraries();
        const renderId = ++state.currentRenderId;
        state.isProcessing = true;

        const theme = getActiveTheme();
        applyAmbientGlow();

        // UI progress setup
        if (elements.progressCard) elements.progressCard.style.display = 'block';
        if (elements.progressFill) elements.progressFill.style.width = '0%';
        if (elements.progressPercent) elements.progressPercent.textContent = '0%';
        if (elements.progressStatusText) elements.progressStatusText.textContent = 'Initializing GPU compositor...';
        if (elements.workspaceSection) elements.workspaceSection.style.display = 'none';

        clearPreviews();

        try {
            const pdf = await pdfjsLib.getDocument({ data: state.originalPdfData }).promise;
            const targetPages = parsePageRange(elements.pageRangeInput ? elements.pageRangeInput.value : '', pdf.numPages);
            const totalTargetPages = targetPages.length;

            if (elements.progressPageCounter) {
                elements.progressPageCounter.textContent = `0 of ${totalTargetPages} pages`;
            }

            const pdfDoc = await PDFLib.PDFDocument.create();
            const concurrency = Math.min(Math.max(navigator.hardwareConcurrency || 2, 2), 4);
            const scale = state.scale;
            const pageResults = new Map();
            let nextTargetIndex = 0;
            let nextToInsert = 0;
            let completedCount = 0;

            // Worker function to render and apply GPU dark mode
            async function processPage(targetIdx) {
                if (renderId !== state.currentRenderId) return null;

                const actualPageNumber = targetPages[targetIdx] + 1;
                const page = await pdf.getPage(actualPageNumber);
                const viewport = page.getViewport({ scale });

                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const ctx = canvas.getContext('2d', { alpha: false });

                // Render page to canvas
                await page.render({ canvasContext: ctx, viewport }).promise;

                if (renderId !== state.currentRenderId) {
                    page.cleanup();
                    return null;
                }

                // GPU compositing dark mode
                ctx.save();
                ctx.globalCompositeOperation = 'difference';
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                if (state.inversionMode === 'tinted') {
                    ctx.globalCompositeOperation = 'screen';
                    ctx.fillStyle = `rgb(${theme.r}, ${theme.g}, ${theme.b})`;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                ctx.restore();

                if (renderId !== state.currentRenderId) {
                    page.cleanup();
                    return null;
                }

                // Compress to JPEG blob
                const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.90));
                const imgBytes = await blob.arrayBuffer();
                const previewUrl = URL.createObjectURL(blob);

                // Cleanup memory
                canvas.width = 1;
                canvas.height = 1;
                page.cleanup();

                return {
                    targetIdx,
                    actualPageNumber,
                    imgBytes,
                    width: viewport.width,
                    height: viewport.height,
                    previewUrl,
                    blob
                };
            }

            // Concurrency pool
            const workers = Array.from({ length: concurrency }, async () => {
                while (nextTargetIndex < totalTargetPages && renderId === state.currentRenderId) {
                    const idx = nextTargetIndex++;
                    const result = await processPage(idx);
                    if (result && renderId === state.currentRenderId) {
                        pageResults.set(idx, result);
                    }
                }
            });

            // Ordered PDF Assembler
            const inserter = (async () => {
                while (nextToInsert < totalTargetPages && renderId === state.currentRenderId) {
                    if (pageResults.has(nextToInsert)) {
                        const item = pageResults.get(nextToInsert);
                        pageResults.delete(nextToInsert);

                        // Embed into PDF
                        const embeddedImage = await pdfDoc.embedJpg(item.imgBytes);
                        const newPage = pdfDoc.addPage([item.width, item.height]);
                        newPage.drawImage(embeddedImage, {
                            x: 0,
                            y: 0,
                            width: item.width,
                            height: item.height
                        });

                        // Store in converted pages list
                        state.convertedPages.push({
                            idx: nextToInsert,
                            pageNumber: item.actualPageNumber,
                            blob: item.blob,
                            previewUrl: item.previewUrl,
                            width: item.width,
                            height: item.height
                        });

                        // Append live preview card into grid
                        appendGridCard(state.convertedPages[state.convertedPages.length - 1]);

                        item.imgBytes = null;
                        completedCount++;
                        nextToInsert++;

                        // Update progress bar
                        const pct = Math.round((completedCount / totalTargetPages) * 100);
                        if (elements.progressFill) elements.progressFill.style.width = `${pct}%`;
                        if (elements.progressPercent) elements.progressPercent.textContent = `${pct}%`;
                        if (elements.progressPageCounter) {
                            elements.progressPageCounter.textContent = `${completedCount} of ${totalTargetPages} pages`;
                        }
                        if (elements.progressStatusText) {
                            elements.progressStatusText.textContent = `Converting page ${completedCount}...`;
                        }
                    } else {
                        await new Promise(r => setTimeout(r, 6));
                    }
                }
            })();

            await Promise.all([...workers, inserter]);

            if (renderId !== state.currentRenderId) return;

            if (elements.progressStatusText) elements.progressStatusText.textContent = 'Saving PDF document...';
            state.modifiedPdfBytes = await pdfDoc.save();

            if (renderId !== state.currentRenderId) return;

            // Finalize UI
            state.isProcessing = false;
            if (elements.progressCard) elements.progressCard.style.display = 'none';
            setupWorkspaceDisplay(totalTargetPages);
            showToast('Conversion complete! Ready for download.', 'success');

        } catch (err) {
            console.error(err);
            state.isProcessing = false;
            if (elements.progressCard) elements.progressCard.style.display = 'none';
            showToast('Conversion encountered an error.', 'error');
        }
    }

    // =========================================================================
    // Workspace & Preview Renderers
    // =========================================================================
    function setupWorkspaceDisplay(totalConverted) {
        if (!elements.workspaceSection) return;
        elements.workspaceSection.style.display = 'block';

        const theme = getActiveTheme();
        if (elements.workspaceFileName) elements.workspaceFileName.textContent = `${state.originalFileName}.pdf`;
        if (elements.workspaceThemeBadge) elements.workspaceThemeBadge.textContent = theme.name;
        if (elements.workspacePageBadge) elements.workspacePageBadge.textContent = `${totalConverted} Pages`;

        state.currentReaderPageIndex = 0;
        updateReaderView();
    }

    function appendGridCard(pageData) {
        if (!elements.pdfGridView) return;

        const card = document.createElement('div');
        card.className = 'page-card';
        card.setAttribute('data-index', pageData.idx);

        card.innerHTML = `
            <div class="page-thumbnail-wrapper">
                <img class="page-thumbnail-img" src="${pageData.previewUrl}" alt="Page ${pageData.pageNumber}" loading="lazy">
                <div class="page-card-overlay">
                    <button class="overlay-action-btn" title="Inspect Fullscreen" data-action="zoom">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                        </svg>
                    </button>
                    <button class="overlay-action-btn" title="Download Page Image" data-action="download-page">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="page-card-footer">
                <span class="page-number-badge">Page ${pageData.pageNumber}</span>
                <span style="font-size: 0.75rem; color: var(--text-muted);">${Math.round(pageData.width / state.scale)} × ${Math.round(pageData.height / state.scale)} pt</span>
            </div>
        `;

        card.querySelector('[data-action="zoom"]').addEventListener('click', (e) => {
            e.stopPropagation();
            openLightbox(pageData.idx);
        });

        card.querySelector('[data-action="download-page"]').addEventListener('click', (e) => {
            e.stopPropagation();
            downloadPageImage(pageData);
        });

        card.querySelector('.page-thumbnail-wrapper').addEventListener('click', () => {
            openLightbox(pageData.idx);
        });

        elements.pdfGridView.appendChild(card);
    }

    function updateReaderView() {
        if (state.convertedPages.length === 0) return;
        const pageData = state.convertedPages[state.currentReaderPageIndex];
        if (!pageData) return;

        if (elements.readerPageImg) {
            elements.readerPageImg.src = pageData.previewUrl;
            elements.readerPageImg.style.transform = `scale(${state.currentZoom})`;
        }

        if (elements.readerPageInput) elements.readerPageInput.value = state.currentReaderPageIndex + 1;
        if (elements.readerTotalPages) elements.readerTotalPages.textContent = `/ ${state.convertedPages.length}`;

        if (elements.btnReaderPrev) elements.btnReaderPrev.disabled = state.currentReaderPageIndex === 0;
        if (elements.btnReaderNext) elements.btnReaderNext.disabled = state.currentReaderPageIndex === state.convertedPages.length - 1;
    }

    function switchViewMode(mode) {
        state.viewMode = mode;
        const isGrid = mode === 'grid';

        if (elements.pdfGridView) elements.pdfGridView.style.display = isGrid ? 'grid' : 'none';
        if (elements.pdfReaderView) elements.pdfReaderView.style.display = isGrid ? 'none' : 'flex';

        document.querySelectorAll('.view-toggle-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
        });

        if (!isGrid) {
            updateReaderView();
        }
    }

    // =========================================================================
    // Lightbox & Modal Functions
    // =========================================================================
    function openLightbox(index) {
        state.activeLightboxIndex = index;
        const pageData = state.convertedPages[index];
        if (!pageData || !elements.lightboxModalBackdrop) return;

        elements.lightboxImg.src = pageData.previewUrl;
        elements.lightboxModalBackdrop.style.display = 'flex';
    }

    function closeLightbox() {
        if (elements.lightboxModalBackdrop) {
            elements.lightboxModalBackdrop.style.display = 'none';
        }
    }

    function openHelp() {
        if (elements.helpModalBackdrop) elements.helpModalBackdrop.style.display = 'flex';
    }

    function closeHelp() {
        if (elements.helpModalBackdrop) elements.helpModalBackdrop.style.display = 'none';
    }

    // =========================================================================
    // Downloads & Exports
    // =========================================================================
    function triggerPdfDownload() {
        if (!state.modifiedPdfBytes) {
            showToast('No converted document available to download.', 'error');
            return;
        }

        const theme = getActiveTheme();
        const themeSlug = theme.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        const filename = `${state.originalFileName || 'document'}_${themeSlug}_dark.pdf`;

        const blob = new Blob([state.modifiedPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showToast(`Downloading ${filename}`, 'success');
    }

    function downloadPageImage(pageData) {
        if (!pageData || !pageData.blob) return;
        const filename = `${state.originalFileName || 'document'}_page_${pageData.pageNumber}.jpg`;
        const url = URL.createObjectURL(pageData.blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showToast(`Saved page ${pageData.pageNumber} as image`, 'success');
    }

    // =========================================================================
    // Event Listeners & Initializers
    // =========================================================================
    function setupEventListeners() {
        setupDropzone();

        // Scale Selector (Segmented buttons)
        if (elements.scaleSelector) {
            elements.scaleSelector.addEventListener('click', (e) => {
                const btn = e.target.closest('.segmented-btn');
                if (!btn) return;
                const scaleVal = parseFloat(btn.getAttribute('data-scale'));
                if (!isNaN(scaleVal)) {
                    state.scale = scaleVal;
                    elements.scaleSelector.querySelectorAll('.segmented-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    if (state.originalPdfData && !state.isProcessing) {
                        startConversion();
                    }
                }
            });
        }

        // Inversion Mode Selector
        if (elements.modeSelector) {
            elements.modeSelector.addEventListener('click', (e) => {
                const btn = e.target.closest('.segmented-btn');
                if (!btn) return;
                const modeVal = btn.getAttribute('data-mode');
                if (modeVal) {
                    state.inversionMode = modeVal;
                    elements.modeSelector.querySelectorAll('.segmented-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    if (state.originalPdfData && !state.isProcessing) {
                        startConversion();
                    }
                }
            });
        }

        // Cancel Conversion
        if (elements.btnCancelConversion) {
            elements.btnCancelConversion.addEventListener('click', () => {
                state.currentRenderId++;
                state.isProcessing = false;
                if (elements.progressCard) elements.progressCard.style.display = 'none';
                showToast('Conversion cancelled.', 'info');
            });
        }

        // Download Action
        if (elements.btnDownloadPdf) {
            elements.btnDownloadPdf.addEventListener('click', triggerPdfDownload);
        }

        // Reconvert Action
        if (elements.btnReconvert) {
            elements.btnReconvert.addEventListener('click', () => {
                if (state.originalPdfData && !state.isProcessing) {
                    startConversion();
                }
            });
        }

        // View Mode Toggle
        if (elements.viewModeToggle) {
            elements.viewModeToggle.addEventListener('click', (e) => {
                const btn = e.target.closest('.view-toggle-btn');
                if (!btn) return;
                const mode = btn.getAttribute('data-mode');
                if (mode) switchViewMode(mode);
            });
        }

        // Reader Controls
        if (elements.btnReaderPrev) {
            elements.btnReaderPrev.addEventListener('click', () => {
                if (state.currentReaderPageIndex > 0) {
                    state.currentReaderPageIndex--;
                    updateReaderView();
                }
            });
        }

        if (elements.btnReaderNext) {
            elements.btnReaderNext.addEventListener('click', () => {
                if (state.currentReaderPageIndex < state.convertedPages.length - 1) {
                    state.currentReaderPageIndex++;
                    updateReaderView();
                }
            });
        }

        if (elements.readerPageInput) {
            elements.readerPageInput.addEventListener('change', (e) => {
                const targetPage = parseInt(e.target.value, 10);
                if (!isNaN(targetPage) && targetPage >= 1 && targetPage <= state.convertedPages.length) {
                    state.currentReaderPageIndex = targetPage - 1;
                    updateReaderView();
                } else {
                    updateReaderView();
                }
            });
        }

        // Zoom Controls
        if (elements.btnReaderZoomIn) {
            elements.btnReaderZoomIn.addEventListener('click', () => {
                state.currentZoom = Math.min(2.5, state.currentZoom + 0.2);
                updateReaderView();
            });
        }

        if (elements.btnReaderZoomOut) {
            elements.btnReaderZoomOut.addEventListener('click', () => {
                state.currentZoom = Math.max(0.6, state.currentZoom - 0.2);
                updateReaderView();
            });
        }

        if (elements.btnReaderZoomReset) {
            elements.btnReaderZoomReset.addEventListener('click', () => {
                state.currentZoom = 1.0;
                updateReaderView();
            });
        }

        // Lightbox Modal
        if (elements.btnCloseLightbox) {
            elements.btnCloseLightbox.addEventListener('click', closeLightbox);
        }

        if (elements.lightboxModalBackdrop) {
            elements.lightboxModalBackdrop.addEventListener('click', (e) => {
                if (e.target === elements.lightboxModalBackdrop) closeLightbox();
            });
        }

        if (elements.btnLightboxDownloadPage) {
            elements.btnLightboxDownloadPage.addEventListener('click', () => {
                const pageData = state.convertedPages[state.activeLightboxIndex];
                if (pageData) downloadPageImage(pageData);
            });
        }

        // Help Modal
        if (elements.btnOpenHelp) {
            elements.btnOpenHelp.addEventListener('click', openHelp);
        }

        if (elements.btnCloseHelp) {
            elements.btnCloseHelp.addEventListener('click', closeHelp);
        }

        if (elements.helpModalBackdrop) {
            elements.helpModalBackdrop.addEventListener('click', (e) => {
                if (e.target === elements.helpModalBackdrop) closeHelp();
            });
        }

        // Global Keyboard Shortcuts
        window.addEventListener('keydown', (e) => {
            // Escape to close modals
            if (e.key === 'Escape') {
                closeLightbox();
                closeHelp();
            }

            // Ctrl/Cmd + O: Open file
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
                e.preventDefault();
                if (elements.fileInput) elements.fileInput.click();
            }

            // Ctrl/Cmd + S: Download PDF if available
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
                if (state.modifiedPdfBytes) {
                    e.preventDefault();
                    triggerPdfDownload();
                }
            }

            // Arrow keys in reader mode
            if (state.viewMode === 'reader' && state.convertedPages.length > 0) {
                if (e.key === 'ArrowLeft' && state.currentReaderPageIndex > 0) {
                    state.currentReaderPageIndex--;
                    updateReaderView();
                } else if (e.key === 'ArrowRight' && state.currentReaderPageIndex < state.convertedPages.length - 1) {
                    state.currentReaderPageIndex++;
                    updateReaderView();
                }
            }
        });
    }

    // =========================================================================
    // Initialization
    // =========================================================================
    function init() {
        renderThemeCards();
        applyAmbientGlow();
        setupEventListeners();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
