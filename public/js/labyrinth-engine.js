// Ball Labyrinth Engine
// Autism Learning Platform - Magnetic Wooden Ball Maze with Black Wall Obstacles & Multi-Ball Matching.

(() => {
    'use strict';

    const LABYRINTH_LEVELS = [
        {
            id: 'lvl1',
            title: { fr: 'Niveau 1 : 2 Billes', en: 'Level 1: 2 Balls' },
            rows: 5,
            cols: 5,
            // 0 = open path, 1 = black wall cell blocking passage
            grid: [
                [0, 0, 1, 0, 0],
                [0, 0, 1, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 1, 1, 1, 0],
                [0, 0, 0, 0, 0]
            ],
            balls: [
                { id: 'red', color: '#FF595E', bgLight: '#FFE5E6', text: '', name: { fr: 'bille rouge', en: 'red ball' }, x: 0, y: 0 },
                { id: 'blue', color: '#1982C4', bgLight: '#E0F2FE', text: '', name: { fr: 'bille bleue', en: 'blue ball' }, x: 0, y: 4 }
            ],
            targets: [
                { id: 'red', color: '#FF595E', bgLight: '#FFE5E6', text: '', name: { fr: 'trou rouge', en: 'red pocket' }, x: 4, y: 0 },
                { id: 'blue', color: '#1982C4', bgLight: '#E0F2FE', text: '', name: { fr: 'trou bleu', en: 'blue pocket' }, x: 4, y: 4 }
            ]
        },
        {
            id: 'lvl2',
            title: { fr: 'Niveau 2 : Détours', en: 'Level 2: Detours' },
            rows: 5,
            cols: 6,
            grid: [
                [0, 1, 0, 0, 0, 0],
                [0, 1, 0, 1, 1, 0],
                [0, 0, 0, 1, 0, 0],
                [1, 1, 0, 0, 0, 1],
                [0, 0, 0, 1, 0, 0]
            ],
            balls: [
                { id: 'red', color: '#FF595E', bgLight: '#FFE5E6', text: '', name: { fr: 'bille rouge', en: 'red ball' }, x: 0, y: 0 },
                { id: 'yellow', color: '#F4A261', bgLight: '#FEF3C7', text: '', name: { fr: 'bille orange', en: 'orange ball' }, x: 0, y: 4 },
                { id: 'green', color: '#52B788', bgLight: '#DCFCE7', text: '', name: { fr: 'bille verte', en: 'green ball' }, x: 2, y: 0 }
            ],
            targets: [
                { id: 'red', color: '#FF595E', bgLight: '#FFE5E6', text: '', name: { fr: 'trou rouge', en: 'red pocket' }, x: 5, y: 2 },
                { id: 'yellow', color: '#F4A261', bgLight: '#FEF3C7', text: '', name: { fr: 'trou orange', en: 'orange pocket' }, x: 5, y: 0 },
                { id: 'green', color: '#52B788', bgLight: '#DCFCE7', text: '', name: { fr: 'trou vert', en: 'green pocket' }, x: 5, y: 4 }
            ]
        },
        {
            id: 'lvl3',
            title: { fr: 'Niveau 3 : 4 Couleurs', en: 'Level 3: 4 Colors' },
            rows: 6,
            cols: 6,
            grid: [
                [0, 0, 1, 0, 0, 0],
                [1, 0, 1, 0, 1, 0],
                [0, 0, 0, 0, 1, 0],
                [0, 1, 1, 0, 0, 0],
                [0, 0, 1, 1, 1, 0],
                [1, 0, 0, 0, 0, 0]
            ],
            balls: [
                { id: 'red', color: '#FF595E', bgLight: '#FFE5E6', text: '', name: { fr: 'bille rouge', en: 'red ball' }, x: 0, y: 0 },
                { id: 'blue', color: '#1982C4', bgLight: '#E0F2FE', text: '', name: { fr: 'bille bleue', en: 'blue ball' }, x: 0, y: 2 },
                { id: 'green', color: '#52B788', bgLight: '#DCFCE7', text: '', name: { fr: 'bille verte', en: 'green ball' }, x: 3, y: 0 },
                { id: 'purple', color: '#8338EC', bgLight: '#F3E8FF', text: '', name: { fr: 'bille violette', en: 'purple ball' }, x: 1, y: 5 }
            ],
            targets: [
                { id: 'red', color: '#FF595E', bgLight: '#FFE5E6', text: '', name: { fr: 'trou rouge', en: 'red pocket' }, x: 5, y: 5 },
                { id: 'blue', color: '#1982C4', bgLight: '#E0F2FE', text: '', name: { fr: 'trou bleu', en: 'blue pocket' }, x: 5, y: 0 },
                { id: 'green', color: '#52B788', bgLight: '#DCFCE7', text: '', name: { fr: 'trou vert', en: 'green pocket' }, x: 0, y: 4 },
                { id: 'purple', color: '#8338EC', bgLight: '#F3E8FF', text: '', name: { fr: 'trou violet', en: 'purple pocket' }, x: 3, y: 3 }
            ]
        },
        {
            id: 'lvl4',
            title: { fr: 'Niveau 4 : Chiffres 1-2-3-4', en: 'Level 4: Numbers 1-2-3-4' },
            rows: 6,
            cols: 6,
            grid: [
                [0, 0, 0, 1, 0, 0],
                [0, 1, 0, 1, 0, 1],
                [0, 1, 0, 0, 0, 0],
                [0, 0, 1, 1, 0, 1],
                [1, 0, 0, 0, 0, 0],
                [0, 0, 1, 0, 1, 0]
            ],
            balls: [
                { id: 'n1', color: '#FF595E', bgLight: '#FFE5E6', text: '1', name: { fr: 'bille numéro 1', en: 'ball number 1' }, x: 0, y: 0 },
                { id: 'n2', color: '#1982C4', bgLight: '#E0F2FE', text: '2', name: { fr: 'bille numéro 2', en: 'ball number 2' }, x: 4, y: 0 },
                { id: 'n3', color: '#52B788', bgLight: '#DCFCE7', text: '3', name: { fr: 'bille numéro 3', en: 'ball number 3' }, x: 0, y: 5 },
                { id: 'n4', color: '#8338EC', bgLight: '#F3E8FF', text: '4', name: { fr: 'bille numéro 4', en: 'ball number 4' }, x: 5, y: 5 }
            ],
            targets: [
                { id: 'n1', color: '#FF595E', bgLight: '#FFE5E6', text: '1', name: { fr: 'case 1', en: 'pocket 1' }, x: 5, y: 2 },
                { id: 'n2', color: '#1982C4', bgLight: '#E0F2FE', text: '2', name: { fr: 'case 2', en: 'pocket 2' }, x: 1, y: 4 },
                { id: 'n3', color: '#52B788', bgLight: '#DCFCE7', text: '3', name: { fr: 'case 3', en: 'pocket 3' }, x: 3, y: 5 },
                { id: 'n4', color: '#8338EC', bgLight: '#F3E8FF', text: '4', name: { fr: 'case 4', en: 'pocket 4' }, x: 2, y: 1 }
            ]
        }
    ];

    let currentLevelIdx = 0;
    let state = null;
    let soundEnabled = localStorage.getItem('alp_sound') !== 'false';
    let lang = localStorage.getItem('alp_lang') || localStorage.getItem('appLang') || 'fr';

    const dirWords = {
        fr: { up: 'Haut', down: 'Bas', left: 'Gauche', right: 'Droite' },
        en: { up: 'Up', down: 'Down', left: 'Left', right: 'Right' }
    };

    let audioCtx = null;
    function getAudioContext() {
        if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContextClass();
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
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

    function playSoftTone(freq = 520, duration = 0.12) {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {}
    }

    function playCelebrationChord() {
        if (!soundEnabled) return;
        const ctx = getAudioContext();
        if (!ctx) return;
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + (idx * 0.08));
            gain.gain.setValueAtTime(0, ctx.currentTime + (idx * 0.08));
            gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + (idx * 0.08) + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (idx * 0.08) + 0.5);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + (idx * 0.08));
            osc.stop(ctx.currentTime + (idx * 0.08) + 0.55);
        });
    }

    function loadLevel(index) {
        currentLevelIdx = index;
        const template = LABYRINTH_LEVELS[currentLevelIdx];

        state = {
            rows: template.rows,
            cols: template.cols,
            grid: template.grid,
            balls: template.balls.map(b => ({ ...b, solved: false })),
            targets: template.targets.map(t => ({ ...t, filled: false })),
            activeBallId: template.balls[0].id
        };

        if (window.AlpTracker) {
            window.AlpTracker.onQuestionStart(`labyrinth_${template.id}`);
        }

        renderLevelPills();
        renderAll(true);
    }

    function renderLevelPills() {
        const container = document.getElementById('level-pills');
        if (!container) return;
        container.innerHTML = '';
        LABYRINTH_LEVELS.forEach((lvl, idx) => {
            const btn = document.createElement('button');
            btn.className = 'routine-pill' + (idx === currentLevelIdx ? ' active' : '');
            btn.innerText = lvl.title[lang] || lvl.title.fr;
            btn.onclick = () => loadLevel(idx);
            container.appendChild(btn);
        });
    }

    function getPromptText() {
        const activeBall = state.balls.find(b => b.id === state.activeBallId && !b.solved);
        if (!activeBall) {
            return lang === 'fr'
                ? 'Bravo ! Toutes les billes sont arrivées ! 🌟'
                : 'Awesome! All balls reached their goals! 🌟';
        }
        const matchingTarget = state.targets.find(t => t.id === activeBall.id);
        const ballName = activeBall.name[lang] || activeBall.name.fr;
        const targetName = matchingTarget.name[lang] || matchingTarget.name.fr;
        return lang === 'fr'
            ? `Guide la ${ballName} vers le ${targetName}`
            : `Guide the ${ballName} to the ${targetName}`;
    }

    function selectBall(ballId) {
        const ball = state.balls.find(b => b.id === ballId);
        if (!ball || ball.solved) return;
        state.activeBallId = ballId;
        playSoftTone(440, 0.08);
        renderAll(true);
    }

    function renderStatusBar() {
        const bar = document.getElementById('targets-status-bar');
        if (!bar) return;
        bar.innerHTML = '';

        state.balls.forEach(ball => {
            const chip = document.createElement('button');
            chip.className = 'status-chip';
            if (ball.solved) chip.classList.add('solved');
            else if (ball.id === state.activeBallId) chip.classList.add('active');

            const dot = `<span style="display:inline-block;width:16px;height:16px;border-radius:50%;background:${ball.color};"></span>`;
            const check = ball.solved ? ' ✅' : '';
            chip.innerHTML = `${dot} <span>${ball.name[lang] || ball.name.fr}${check}</span>`;
            chip.onclick = () => selectBall(ball.id);
            bar.appendChild(chip);
        });
    }

    function renderBoard() {
        const gridEl = document.getElementById('labyrinth-grid');
        if (!gridEl) return;
        gridEl.innerHTML = '';
        gridEl.style.gridTemplateColumns = `repeat(${state.cols}, auto)`;

        for (let y = 0; y < state.rows; y++) {
            for (let x = 0; x < state.cols; x++) {
                const cell = document.createElement('div');
                cell.className = 'lab-cell';

                // 1. Black Wall Blocker Cell
                if (state.grid[y][x] === 1) {
                    cell.classList.add('wall');
                    cell.setAttribute('aria-label', 'Wall');
                    gridEl.appendChild(cell);
                    continue;
                }

                // 2. Target Pocket on cell
                const target = state.targets.find(t => t.x === x && t.y === y);
                if (target) {
                    const pocket = document.createElement('div');
                    pocket.className = 'target-pocket' + (target.filled ? ' filled' : '');
                    pocket.style.color = target.color;
                    pocket.style.backgroundColor = target.bgLight;
                    pocket.innerText = target.filled ? '⭐' : target.text;
                    cell.appendChild(pocket);
                }

                // 3. Unsolved Ball on cell
                const ball = state.balls.find(b => !b.solved && b.x === x && b.y === y);
                if (ball) {
                    const marble = document.createElement('div');
                    marble.className = 'marble-ball' + (ball.id === state.activeBallId ? ' active-ball' : '');
                    marble.style.backgroundColor = ball.color;
                    marble.innerText = ball.text;
                    marble.onclick = (e) => {
                        e.stopPropagation();
                        selectBall(ball.id);
                    };
                    cell.appendChild(marble);
                }

                gridEl.appendChild(cell);
            }
        }
    }

    function renderAll(shouldSpeak = false) {
        const prompt = getPromptText();
        const promptEl = document.getElementById('prompt-label');
        if (promptEl) promptEl.innerText = prompt;
        if (shouldSpeak) speak(prompt);

        renderStatusBar();
        renderBoard();
    }

    function moveActiveBall(dx, dy, dirName) {
        const ball = state.balls.find(b => b.id === state.activeBallId && !b.solved);
        if (!ball) return;

        const nx = ball.x + dx;
        const ny = ball.y + dy;

        // Visual flash on D-Pad button
        const btnId = `btn-${dirName}`;
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.classList.add('btn-active');
            setTimeout(() => btn.classList.remove('btn-active'), 180);
        }

        // Announce spoken direction
        if (dirName && dirWords[lang] && dirWords[lang][dirName]) {
            speak(dirWords[lang][dirName]);
        }

        // 1. Check outer grid boundaries
        if (nx < 0 || nx >= state.cols || ny < 0 || ny >= state.rows) {
            playSoftTone(220, 0.05);
            return;
        }

        // 2. Check black wall blocker cell
        if (state.grid[ny][nx] === 1) {
            playSoftTone(220, 0.05);
            return;
        }

        // 3. Check if another unsolved ball blocks path
        const blockedByOtherBall = state.balls.some(b => !b.solved && b.id !== ball.id && b.x === nx && b.y === ny);
        if (blockedByOtherBall) {
            playSoftTone(220, 0.05);
            return;
        }

        // Valid move!
        ball.x = nx;
        ball.y = ny;
        playSoftTone(360, 0.06);

        if (window.AlpTracker) {
            window.AlpTracker.onAttempt(true, dirName);
        }

        // 4. Check if ball reached its matching target pocket
        const matchingTarget = state.targets.find(t => t.id === ball.id && t.x === nx && t.y === ny);
        if (matchingTarget) {
            ball.solved = true;
            matchingTarget.filled = true;
            playSoftTone(660, 0.18);

            // Automatically switch to next remaining ball
            const nextBall = state.balls.find(b => !b.solved);
            if (nextBall) {
                state.activeBallId = nextBall.id;
                renderAll(true);
            } else {
                // All targets completed!
                if (window.AlpTracker) {
                    window.AlpTracker.onTrialSuccess(`labyrinth_${LABYRINTH_LEVELS[currentLevelIdx].id}`);
                }
                playCelebrationChord();
                renderAll(true);
                setTimeout(() => {
                    const nextLevel = (currentLevelIdx + 1) % LABYRINTH_LEVELS.length;
                    loadLevel(nextLevel);
                }, 2400);
            }
            return;
        }

        renderBoard();
    }

    function setupControls() {
        // D-Pad Button Controls
        document.getElementById('btn-up')?.addEventListener('click', () => moveActiveBall(0, -1, 'up'));
        document.getElementById('btn-down')?.addEventListener('click', () => moveActiveBall(0, 1, 'down'));
        document.getElementById('btn-left')?.addEventListener('click', () => moveActiveBall(-1, 0, 'left'));
        document.getElementById('btn-right')?.addEventListener('click', () => moveActiveBall(1, 0, 'right'));

        // Keyboard Arrow & Number Support
        window.addEventListener('keydown', (e) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
            const code = e.code;
            const key = e.key;

            if (code === 'ArrowUp' || key === 'ArrowUp' || key === '2' || code === 'Digit2') {
                e.preventDefault();
                moveActiveBall(0, -1, 'up');
            } else if (code === 'ArrowDown' || key === 'ArrowDown' || key === '3' || code === 'Digit3') {
                e.preventDefault();
                moveActiveBall(0, 1, 'down');
            } else if (code === 'ArrowLeft' || key === 'ArrowLeft' || key === '1' || code === 'Digit1') {
                e.preventDefault();
                moveActiveBall(-1, 0, 'left');
            } else if (code === 'ArrowRight' || key === 'ArrowRight' || key === '4' || code === 'Digit4') {
                e.preventDefault();
                moveActiveBall(1, 0, 'right');
            }
        });

        // Reset & Audio & Language Controls
        document.getElementById('reset-level-btn')?.addEventListener('click', () => loadLevel(currentLevelIdx));
        document.getElementById('speak-prompt-btn')?.addEventListener('click', () => speak(getPromptText()));

        const soundBtn = document.getElementById('sound-toggle-btn');
        if (soundBtn) {
            soundBtn.innerText = soundEnabled ? '🔊' : '🔇';
            soundBtn.onclick = () => {
                soundEnabled = !soundEnabled;
                localStorage.setItem('alp_sound', soundEnabled);
                soundBtn.innerText = soundEnabled ? '🔊' : '🔇';
                if (soundEnabled) speak(getPromptText());
                else if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            };
        }

        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                lang = btn.dataset.lang;
                localStorage.setItem('alp_lang', lang);
                localStorage.setItem('appLang', lang);

                const homeBtn = document.getElementById('home-btn');
                if (homeBtn) homeBtn.innerText = lang === 'fr' ? '⬅️ Accueil' : '⬅️ Home';

                const titleEl = document.getElementById('activity-title');
                if (titleEl) titleEl.innerText = lang === 'fr' ? '🔮 Labyrinthe à billes' : '🔮 Ball Labyrinth';

                const resetBtn = document.getElementById('reset-level-btn');
                if (resetBtn) resetBtn.innerText = lang === 'fr' ? '🔄 Recommencer ce niveau' : '🔄 Restart Level';

                renderLevelPills();
                renderAll(true);
            };
        });
    }

    function init() {
        setupControls();
        loadLevel(0);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
