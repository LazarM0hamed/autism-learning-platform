(() => {
    'use strict';

    const CELL_SIZE = 64;
    const MINI_CELL_SIZE = 34;

    // Precise geometries that perfectly tile the grid in their given orientation
    const PACKING_LEVELS = [
        {
            id: 'lvl1',
            cols: 3, rows: 3,
            pieces: [
                { id: 'p1', color: '#FF595E', blocks: [[0,0],[1,0],[0,1],[1,1]] }, // 2x2 Square
                { id: 'p2', color: '#1982C4', blocks: [[0,0],[1,0],[2,0]] },       // 1x3 Line
                { id: 'p3', color: '#8338EC', blocks: [[0,0],[0,1]] }              // 1x2 Domino
            ]
        },
        {
            id: 'lvl2',
            cols: 4, rows: 3,
            pieces: [
                { id: 'p1', color: '#FF595E', blocks: [[0,0],[1,0],[0,1],[1,1]] }, // 2x2 Square
                { id: 'p2', color: '#FFCA3A', blocks: [[0,0],[1,0],[0,1]] },       // Corner L
                { id: 'p3', color: '#52B788', blocks: [[0,0],[0,1]] },             // Vertical Domino
                { id: 'p4', color: '#1982C4', blocks: [[0,0],[1,0],[2,0]] }        // Horizontal 3-line
            ]
        },
        {
            id: 'lvl3',
            cols: 4, rows: 4,
            pieces: [
                { id: 'p1', color: '#FF595E', blocks: [[0,0],[1,0],[2,0],[1,1]] }, // T-shape down
                { id: 'p2', color: '#1982C4', blocks: [[1,0],[0,1],[1,1],[1,2]] }, // T-shape left
                { id: 'p3', color: '#FFCA3A', blocks: [[0,0],[0,1],[0,2],[1,2]] }, // L-shape
                { id: 'p4', color: '#52B788', blocks: [[0,0],[1,0],[1,1],[2,1]] }  // Z-shape
            ]
        }
    ];

    let lang = localStorage.getItem('alp_lang') || localStorage.getItem('appLang') || 'fr';
    let soundEnabled = true;
    let currentLevel = PACKING_LEVELS[0];

    // Game State
    let boardState = []; // 2D array [y][x] storing piece IDs or null
    let trayPieces = []; // Array of piece IDs not yet placed
    let placedPieces = []; // Array of { id, anchor: {x,y} }
    let selectedPieceId = null;
    let isSolved = false;
    let audioCtx = null;

    function getAudioContext() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        return audioCtx;
    }

    function speak(text) {
        if (!soundEnabled || !('speechSynthesis' in window)) return;
        try {
            window.speechSynthesis.cancel();
            const utter = new SpeechSynthesisUtterance(text);
            utter.lang = lang === 'fr' ? 'fr-FR' : 'en-US';
            utter.rate = 0.94;
            window.speechSynthesis.speak(utter);
        } catch (e) {}
    }

    function playSound(type) {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            if (type === 'select') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(440, now);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                osc.stop(now + 0.11);
            } else if (type === 'snap') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(320, now);
                osc.frequency.exponentialRampToValueAtTime(640, now + 0.12);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                osc.stop(now + 0.16);
            } else if (type === 'remove') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(420, now);
                osc.frequency.exponentialRampToValueAtTime(210, now + 0.12);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                osc.stop(now + 0.16);
            } else if (type === 'boop') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(180, now);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
                osc.stop(now + 0.21);
            }

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
        } catch (e) {}
    }

    function playVictoryFanfare() {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            const now = ctx.currentTime;
            [523.2, 659.3, 784.0, 1046.5].forEach((f, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, now + i * 0.1);
                gain.gain.setValueAtTime(0.2, now + i * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.35);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + i * 0.1);
                osc.stop(now + i * 0.1 + 0.36);
            });
        } catch (e) {}
    }

    function startLevel(lvlIndex) {
        currentLevel = PACKING_LEVELS[lvlIndex];
        isSolved = false;
        selectedPieceId = null;
        placedPieces = [];
        trayPieces = currentLevel.pieces.map(p => p.id).sort(() => Math.random() - 0.5);

        // Initialize empty board state
        boardState = Array(currentLevel.rows).fill(null).map(() => Array(currentLevel.cols).fill(null));

        const svg = document.getElementById('board-svg');
        if (svg) {
            svg.setAttribute('viewBox', `0 0 ${currentLevel.cols * CELL_SIZE} ${currentLevel.rows * CELL_SIZE}`);
            svg.style.width = `${currentLevel.cols * CELL_SIZE}px`;
            svg.style.height = `${currentLevel.rows * CELL_SIZE}px`;
        }

        if (window.AlpTracker) {
            window.AlpTracker.onQuestionStart(`packing_${currentLevel.id}`);
        }

        updatePrompt(true);
        renderAll();

        if (window.AlpInputManager) {
            window.AlpInputManager.refresh();
        }
    }

    function getPromptText() {
        if (isSolved) {
            return lang === 'fr' ? "Bravo ! La valise est prête ! 🧳🌟" : "Great job! The suitcase is packed! 🧳🌟";
        }
        return lang === 'fr' ? "Range toutes les formes dans la valise !" : "Pack all the shapes in the suitcase!";
    }

    function updatePrompt(shouldSpeak = false) {
        const text = getPromptText();
        const label = document.getElementById('prompt-label');
        if (label) label.innerText = text;
        if (shouldSpeak) speak(text);
    }

    // Compute Bounding Box to render perfectly centered mini SVGs in the tray
    function getPieceBounds(blocks) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        blocks.forEach(([x, y]) => {
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
        });
        return { minX, minY, maxX, maxY, w: maxX - minX + 1, h: maxY - minY + 1 };
    }

    function renderTray() {
        const tray = document.getElementById('tray-area');
        if (!tray) return;
        tray.innerHTML = '';

        trayPieces.forEach((pId, idx) => {
            const piece = currentLevel.pieces.find(p => p.id === pId);
            if (!piece) return;
            const bounds = getPieceBounds(piece.blocks);
            const svgW = bounds.w * MINI_CELL_SIZE;
            const svgH = bounds.h * MINI_CELL_SIZE;

            let rectsHtml = '';
            piece.blocks.forEach(([x, y]) => {
                const drawX = (x - bounds.minX) * MINI_CELL_SIZE;
                const drawY = (y - bounds.minY) * MINI_CELL_SIZE;
                rectsHtml += `<rect class="mini-block" x="${drawX}" y="${drawY}" width="${MINI_CELL_SIZE}" height="${MINI_CELL_SIZE}" fill="${piece.color}"/>`;
            });

            const btn = document.createElement('button');
            btn.className = 'tray-piece-btn' + (selectedPieceId === pId ? ' selected' : '');
            btn.setAttribute('aria-label', (lang === 'fr' ? 'Pièce ' : 'Piece ') + (idx + 1));
            btn.setAttribute('title', (lang === 'fr' ? 'Sélectionner la pièce' : 'Select piece'));
            btn.innerHTML = `<svg class="mini-piece-svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}">${rectsHtml}</svg>`;

            btn.onclick = () => {
                if (isSolved) return;
                selectedPieceId = selectedPieceId === pId ? null : pId;
                if (selectedPieceId) playSound('select');
                renderTray();
            };

            tray.appendChild(btn);
        });
    }

    function renderBoard() {
        const svg = document.getElementById('board-svg');
        if (!svg) return;
        let svgHtml = '';

        // 1. Draw Empty Grid Cells
        for (let y = 0; y < currentLevel.rows; y++) {
            for (let x = 0; x < currentLevel.cols; x++) {
                svgHtml += `<rect class="grid-cell" x="${x * CELL_SIZE}" y="${y * CELL_SIZE}" width="${CELL_SIZE}" height="${CELL_SIZE}" onclick="handleGridClick(${x}, ${y})"/>`;
            }
        }

        // 2. Draw Placed Pieces
        placedPieces.forEach(placed => {
            const piece = currentLevel.pieces.find(p => p.id === placed.id);
            if (!piece) return;
            let blocksHtml = '';
            piece.blocks.forEach(([bx, by]) => {
                const drawX = (placed.anchor.x + bx) * CELL_SIZE;
                const drawY = (placed.anchor.y + by) * CELL_SIZE;
                blocksHtml += `<rect class="placed-block" x="${drawX}" y="${drawY}" width="${CELL_SIZE}" height="${CELL_SIZE}" fill="${piece.color}" onclick="handleGridClick(${placed.anchor.x + bx}, ${placed.anchor.y + by})"/>`;
            });

            // Group them so they render together
            svgHtml += `<g>${blocksHtml}</g>`;
        });

        // 3. Victory Stars Overlay
        if (isSolved) {
            const centerX = (currentLevel.cols * CELL_SIZE) / 2;
            const centerY = (currentLevel.rows * CELL_SIZE) / 2;
            svgHtml += `
                <text x="${centerX - 32}" y="${centerY + 16}" font-size="48">⭐</text>
                <text x="${centerX + 16}" y="${centerY - 8}" font-size="34">🌟</text>
            `;
        }

        svg.innerHTML = svgHtml;
    }

    function renderAll() {
        renderTray();
        renderBoard();
    }

    /* Forgiving Placement Algorithm: If the child taps anywhere near where the piece *could* fit, snap it in! */
    window.handleGridClick = function(tx, ty) {
        if (isSolved) return;

        // Check if tapping an already placed piece to remove it
        if (boardState[ty] && boardState[ty][tx] !== null) {
            const clickedPieceId = boardState[ty][tx];

            // Remove from placed list
            placedPieces = placedPieces.filter(p => p.id !== clickedPieceId);

            // Clear from board grid state
            for (let y = 0; y < currentLevel.rows; y++) {
                for (let x = 0; x < currentLevel.cols; x++) {
                    if (boardState[y][x] === clickedPieceId) boardState[y][x] = null;
                }
            }

            // Return to tray
            trayPieces.push(clickedPieceId);
            selectedPieceId = clickedPieceId; // Automatically select the removed piece for quick repositioning
            playSound('remove');
            renderAll();
            return;
        }

        // Try to place the selected piece
        if (!selectedPieceId) return;

        const piece = currentLevel.pieces.find(p => p.id === selectedPieceId);
        if (!piece) return;
        let validAnchors = [];

        // Check all possible anchors to see if any placement covers the tapped cell (tx, ty)
        for (let ay = 0; ay < currentLevel.rows; ay++) {
            for (let ax = 0; ax < currentLevel.cols; ax++) {
                let fits = true;
                let coversTarget = false;

                for (let [bx, by] of piece.blocks) {
                    const cx = ax + bx;
                    const cy = ay + by;

                    if (cx < 0 || cx >= currentLevel.cols || cy < 0 || cy >= currentLevel.rows) {
                        fits = false; break;
                    }
                    if (boardState[cy][cx] !== null) {
                        fits = false; break;
                    }
                    if (cx === tx && cy === ty) {
                        coversTarget = true;
                    }
                }

                if (fits && coversTarget) {
                    validAnchors.push({ x: ax, y: ay });
                }
            }
        }

        if (validAnchors.length > 0) {
            // Found a valid placement! Snap it to the first valid anchor found
            const anchor = validAnchors[0];
            placedPieces.push({ id: piece.id, anchor: anchor });

            // Update board grid state
            for (let [bx, by] of piece.blocks) {
                boardState[anchor.y + by][anchor.x + bx] = piece.id;
            }

            trayPieces = trayPieces.filter(id => id !== piece.id);
            selectedPieceId = null;
            playSound('snap');

            // Check Win Condition
            if (trayPieces.length === 0) {
                isSolved = true;
                playVictoryFanfare();
                updatePrompt(true);

                if (window.AlpTracker) {
                    window.AlpTracker.onTrialSuccess(`packing_${currentLevel.id}`);
                }
            }

            renderAll();

            if (window.AlpInputManager) {
                window.AlpInputManager.refresh();
            }
        } else {
            // Doesn't fit here
            playSound('boop');
            if (window.AlpTracker) {
                window.AlpTracker.onAttempt();
            }

            const frame = document.getElementById('puzzle-frame');
            if (frame) {
                frame.style.transform = 'translate(-4px, 0)';
                setTimeout(() => { if (frame) frame.style.transform = 'translate(4px, 0)'; }, 50);
                setTimeout(() => { if (frame) frame.style.transform = 'translate(0, 0)'; }, 100);
            }
        }
    };

    function applyLangUI() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });

        const homeBtn = document.getElementById('home-btn');
        if (homeBtn) homeBtn.innerText = lang === 'fr' ? '⬅️ Accueil' : '⬅️ Home';

        const actTitle = document.getElementById('activity-title');
        if (actTitle) actTitle.innerText = lang === 'fr' ? '🧩 Puzzle Spatial' : '🧩 Shape Packing';

        const lvl1Btn = document.getElementById('mode-lvl1-btn');
        if (lvl1Btn) lvl1Btn.innerText = lang === 'fr' ? '⭐ Valise 3x3' : '⭐ 3x3 Suitcase';

        const lvl2Btn = document.getElementById('mode-lvl2-btn');
        if (lvl2Btn) lvl2Btn.innerText = lang === 'fr' ? '⭐⭐ Valise 4x3' : '⭐⭐ 4x3 Suitcase';

        const lvl3Btn = document.getElementById('mode-lvl3-btn');
        if (lvl3Btn) lvl3Btn.innerText = lang === 'fr' ? '⭐⭐⭐ Valise 4x4' : '⭐⭐⭐ 4x4 Suitcase';

        updatePrompt(false);
    }

    // Level Switcher Buttons
    const lvl1Btn = document.getElementById('mode-lvl1-btn');
    if (lvl1Btn) {
        lvl1Btn.onclick = () => {
            document.querySelectorAll('.routine-pill').forEach(b => b.classList.remove('active'));
            lvl1Btn.classList.add('active');
            startLevel(0);
        };
    }

    const lvl2Btn = document.getElementById('mode-lvl2-btn');
    if (lvl2Btn) {
        lvl2Btn.onclick = () => {
            document.querySelectorAll('.routine-pill').forEach(b => b.classList.remove('active'));
            lvl2Btn.classList.add('active');
            startLevel(1);
        };
    }

    const lvl3Btn = document.getElementById('mode-lvl3-btn');
    if (lvl3Btn) {
        lvl3Btn.onclick = () => {
            document.querySelectorAll('.routine-pill').forEach(b => b.classList.remove('active'));
            lvl3Btn.classList.add('active');
            startLevel(2);
        };
    }

    const speakBtn = document.getElementById('speak-prompt-btn');
    if (speakBtn) speakBtn.onclick = () => updatePrompt(true);

    const soundToggleBtn = document.getElementById('sound-toggle-btn');
    if (soundToggleBtn) {
        soundToggleBtn.onclick = (e) => {
            soundEnabled = !soundEnabled;
            e.target.innerText = soundEnabled ? '🔊' : '🔇';
        };
    }

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.onclick = () => {
            lang = btn.dataset.lang;
            localStorage.setItem('alp_lang', lang);
            localStorage.setItem('appLang', lang);
            applyLangUI();
            updatePrompt(true);
        };
    });

    window.addEventListener('DOMContentLoaded', () => {
        applyLangUI();
        startLevel(0);
    });

    // Expose for testing if required
    window.PACKING_LEVELS = PACKING_LEVELS;
})();
