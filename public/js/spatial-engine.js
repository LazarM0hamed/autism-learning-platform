// Guide the Animal - Spatial Journey Engine
// Autism Learning Platform - Dual Mode: 2D Grid Maze & 1D Ascending Staircase (Haut & Bas / Up & Down).
// Features: Real-time Directional Voice Feedback, Infinite Random Grid Spawning & Tactile Stepped Stairs.

(() => {
    'use strict';

    const BOARD_SIZE = 4;
    const STAIR_STEPS_COUNT = 5; // Steps 0, 1, 2, 3, 4

    // 2D Grid Scenarios Pool (Infinite Random Matrix Navigation)
    const GRID_PAIRS = [
        {
            id: 'cat_fish',
            char: '🐱',
            target: '🐟',
            name: { en: 'Cat & Fish', fr: 'Chat & Poisson' },
            prompt: { en: 'Help the cat reach the fish!', fr: 'Aide le chat à attraper le poisson !' },
            winText: { en: 'Yum! The cat reached the fish!', fr: 'Miam ! Le chat a attrapé le poisson !' }
        },
        {
            id: 'rabbit_carrot',
            char: '🐰',
            target: '🥕',
            name: { en: 'Rabbit & Carrot', fr: 'Lapin & Carotte' },
            prompt: { en: 'Help the rabbit find the carrot!', fr: 'Aide le lapin à trouver la carotte !' },
            winText: { en: 'Crunch! The rabbit found the carrot!', fr: 'Miam ! Le lapin a trouvé sa carotte !' }
        },
        {
            id: 'bee_flower',
            char: '🐝',
            target: '🌻',
            name: { en: 'Bee & Flower', fr: 'Abeille & Fleur' },
            prompt: { en: 'Fly the bee to the flower!', fr: 'Fais voler l\'abeille jusqu\'à la fleur !' },
            winText: { en: 'Hooray! The bee reached the flower!', fr: 'Bravo ! L\'abeille est sur la fleur !' }
        },
        {
            id: 'dog_bone',
            char: '🐶',
            target: '🦴',
            name: { en: 'Dog & Bone', fr: 'Chien & Os' },
            prompt: { en: 'Help the dog find the bone!', fr: 'Aide le chien à attraper son os !' },
            winText: { en: 'Good dog! Found the bone!', fr: 'Super ! Le chien a son os !' }
        },
        {
            id: 'car_garage',
            char: '🚗',
            target: '🏠',
            name: { en: 'Car & Garage', fr: 'Voiture & Garage' },
            prompt: { en: 'Drive the car to the garage!', fr: 'Conduis la voiture jusqu\'au garage !' },
            winText: { en: 'Beep beep! The car is parked!', fr: 'Vroum ! La voiture est au garage !' }
        },
        {
            id: 'monkey_banana',
            char: '🐒',
            target: '🍌',
            name: { en: 'Monkey & Banana', fr: 'Singe & Banane' },
            prompt: { en: 'Guide the monkey to the banana!', fr: 'Guide le singe jusqu\'à la banane !' },
            winText: { en: 'Delicious! The monkey got the banana!', fr: 'Délicieux ! Le singe a sa banane !' }
        },
        {
            id: 'mouse_cheese',
            char: '🐭',
            target: '🧀',
            name: { en: 'Mouse & Cheese', fr: 'Souris & Fromage' },
            prompt: { en: 'Help the mouse get the cheese!', fr: 'Aide la souris à attraper le fromage !' },
            winText: { en: 'Yum! The mouse got the cheese!', fr: 'Miam ! La souris mange son fromage !' }
        },
        {
            id: 'bear_honey',
            char: '🐻',
            target: '🍯',
            name: { en: 'Bear & Honey', fr: 'Ours & Miel' },
            prompt: { en: 'Guide the bear to the honey pot!', fr: 'Guide l\'ours jusqu\'au pot de miel !' },
            winText: { en: 'Sweet! The bear has honey!', fr: 'Super ! L\'ours a son miel !' }
        },
        {
            id: 'frog_water',
            char: '🐸',
            target: '🪷',
            name: { en: 'Frog & Lilypad', fr: 'Grenouille & Nénuphar' },
            prompt: { en: 'Hop the frog to the lilypad!', fr: 'Fais sauter la grenouille sur le nénuphar !' },
            winText: { en: 'Hop! The frog landed safely!', fr: 'Hop ! La grenouille est sur le nénuphar !' }
        },
        {
            id: 'bird_nest',
            char: '🐦',
            target: '🪺',
            name: { en: 'Bird & Nest', fr: 'Oiseau & Nid' },
            prompt: { en: 'Fly the bird back to its nest!', fr: 'Aide l\'oiseau à rentrer dans son nid !' },
            winText: { en: 'Safe at home in the nest!', fr: 'Youpi ! L\'oiseau est dans son nid !' }
        }
    ];

    // 1D Ascending Staircase Scenarios Pool (Up/Down / Monter/Descendre)
    const STAIRS_SCENARIOS = [
        {
            id: 'stairs_frog_star',
            char: '🐸',
            target: '⭐',
            direction: 'up',
            name: { en: 'Frog climbs UP to Star', fr: 'La Grenouille monte à l\'Étoile' },
            prompt: { en: 'Make the frog jump all the way UP!', fr: 'Fais sauter la grenouille tout en HAUT !' },
            winText: { en: 'Hooray! Reached the star at the TOP!', fr: 'Bravo ! Tout en HAUT sur l\'étoile !' },
            startStep: 0,
            goalStep: 4
        },
        {
            id: 'stairs_frog_pond',
            char: '🐸',
            target: '💧',
            direction: 'down',
            name: { en: 'Frog jumps DOWN to Pond', fr: 'La Grenouille descend dans la Mare' },
            prompt: { en: 'Make the frog jump all the way DOWN!', fr: 'Fais sauter la grenouille tout en BAS !' },
            winText: { en: 'Splash! Reached the water at the BOTTOM!', fr: 'Plouf ! Tout en BAS dans l\'eau !' },
            startStep: 4,
            goalStep: 0
        },
        {
            id: 'stairs_rabbit_carrot',
            char: '🐰',
            target: '🥕',
            direction: 'up',
            name: { en: 'Rabbit hops UP for Carrot', fr: 'Le Lapin monte chercher sa Carotte' },
            prompt: { en: 'Help the rabbit climb UP the stairs!', fr: 'Aide le lapin à monter en HAUT chercher sa carotte !' },
            winText: { en: 'Crunch! Found the carrot at the TOP!', fr: 'Miam ! Le lapin a sa carotte tout en HAUT !' },
            startStep: 0,
            goalStep: 4
        },
        {
            id: 'stairs_cat_milk',
            char: '🐱',
            target: '🥛',
            direction: 'down',
            name: { en: 'Cat climbs DOWN for Milk', fr: 'Le Chat descend boire son Lait' },
            prompt: { en: 'Help the cat climb DOWN the stairs!', fr: 'Aide le chat à descendre en BAS boire son lait !' },
            winText: { en: 'Yum! Reached the milk bowl at the BOTTOM!', fr: 'Miam ! Le chat boit son lait tout en BAS !' },
            startStep: 4,
            goalStep: 0
        },
        {
            id: 'stairs_kangaroo_flag',
            char: '🦘',
            target: '🚩',
            direction: 'up',
            name: { en: 'Kangaroo bounds UP', fr: 'Le Kangourou saute en HAUT' },
            prompt: { en: 'Help the kangaroo hop UP to the flag!', fr: 'Fais sauter le kangourou en HAUT jusqu\'au drapeau !' },
            winText: { en: 'Victory! Reached the flag at the TOP!', fr: 'Youpi ! Le kangourou est en HAUT !' },
            startStep: 1,
            goalStep: 4
        },
        {
            id: 'stairs_child_teddy',
            char: '🧒',
            target: '🧸',
            direction: 'down',
            name: { en: 'Child walks DOWN for Teddy', fr: 'L\'Enfant descend chercher son Nounours' },
            prompt: { en: 'Help the child walk DOWN to get the teddy!', fr: 'Aide l\'enfant à descendre en BAS chercher son nounours !' },
            winText: { en: 'Hooray! Reached the teddy at the BOTTOM!', fr: 'Câlin ! Le doudou est tout en BAS !' },
            startStep: 3,
            goalStep: 0
        }
    ];

    // State
    const STORAGE_KEY_MODE = 'alp_spatial_mode';
    let activeMode = localStorage.getItem(STORAGE_KEY_MODE) || 'grid'; // 'grid' or 'stairs'

    // Grid State
    let selectedGridMode = 'infinite';
    let currentGridScenario = null;
    let charPos = { x: 0, y: 0 };
    let targetPos = { x: 2, y: 0 };
    let visitedCells = new Set();

    // Stairs State
    let currentStairsIndex = 0;
    let currentStairsScenario = null;
    let currentStep = 0;
    let targetStep = 4;

    let isTransitioning = false;
    let soundEnabled = localStorage.getItem('alp_sound') !== 'false';
    let currentLang = localStorage.getItem('alp_lang') || 'en';

    // UI Translations
    const uiStrings = {
        en: {
            home: "⬅️ Home",
            titleGrid: "🧭 Guide the Animal (2D Grid)",
            titleStairs: "🪜 Stairs: Jump UP & DOWN",
            modeGrid: "🗺️ 2D Grid Maze",
            modeStairs: "🪜 Stairs (UP & DOWN)",
            infinitePill: "🎲 Infinite Mix",
            stairsUp: "JUMP UP (Haut)",
            stairsDown: "JUMP DOWN (Bas)",
            up: "Up",
            down: "Down",
            left: "Left",
            right: "Right",
            topLanding: "TOP",
            bottomLanding: "BOTTOM"
        },
        fr: {
            home: "⬅️ Accueil",
            titleGrid: "🧭 Guide l'animal (Grille 2D)",
            titleStairs: "🪜 Escalier : Saute en HAUT et en BAS",
            modeGrid: "🗺️ Grille 2D",
            modeStairs: "🪜 Escalier (HAUT & BAS)",
            infinitePill: "🎲 Mode Infini",
            stairsUp: "MONTER (Haut)",
            stairsDown: "DESCENDRE (Bas)",
            up: "Haut",
            down: "Bas",
            left: "Gauche",
            right: "Droite",
            topLanding: "EN HAUT",
            bottomLanding: "EN BAS"
        }
    };

    // Web Audio API
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

    // Step sound (tactile pop)
    function playStepSound() {
        if (!soundEnabled) return;
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(360, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.06);

        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.07);
    }

    // Ascending Spring sound for jumping UP stairs
    function playSpringUpSound() {
        if (!soundEnabled) return;
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.12);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    // Descending Step sound for jumping DOWN stairs
    function playStepDownSound() {
        if (!soundEnabled) return;
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.13);
    }

    // Victory chime (harmonic major chord)
    function playSuccessChime() {
        if (!soundEnabled) return;
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + (idx * 0.08));

            gain.gain.setValueAtTime(0, now + (idx * 0.08));
            gain.gain.linearRampToValueAtTime(0.12, now + (idx * 0.08) + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, now + (idx * 0.08) + 0.5);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + (idx * 0.08));
            osc.stop(now + (idx * 0.08) + 0.55);
        });
    }

    // Directional Voice
    function speakDirection(dirWord) {
        if (!soundEnabled || !('speechSynthesis' in window)) return;
        try {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(dirWord);
            utterance.lang = currentLang === 'fr' ? 'fr-FR' : 'en-US';
            utterance.rate = 1.15;
            utterance.pitch = 1.1;

            const voices = window.speechSynthesis.getVoices();
            const voicePrefix = currentLang === 'fr' ? 'fr' : 'en';
            const matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith(voicePrefix));
            if (matchedVoice) utterance.voice = matchedVoice;

            window.speechSynthesis.speak(utterance);
        } catch (e) {}
    }

    function speakText(text) {
        if (!soundEnabled || !('speechSynthesis' in window)) return;
        try {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = currentLang === 'fr' ? 'fr-FR' : 'en-US';
            utterance.rate = 0.9;
            utterance.pitch = 1.05;

            const voices = window.speechSynthesis.getVoices();
            const voicePrefix = currentLang === 'fr' ? 'fr' : 'en';
            const matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith(voicePrefix));
            if (matchedVoice) utterance.voice = matchedVoice;

            window.speechSynthesis.speak(utterance);
        } catch (e) {
            console.warn(e);
        }
    }

    // Random Grid Matrix Positions (Manhattan distance >= 2)
    function generateRandomGridPositions() {
        const startX = Math.floor(Math.random() * BOARD_SIZE);
        const startY = Math.floor(Math.random() * BOARD_SIZE);

        let goalX = Math.floor(Math.random() * BOARD_SIZE);
        let goalY = Math.floor(Math.random() * BOARD_SIZE);

        let safety = 0;
        while ((Math.abs(goalX - startX) + Math.abs(goalY - startY) < 2) && safety < 30) {
            goalX = Math.floor(Math.random() * BOARD_SIZE);
            goalY = Math.floor(Math.random() * BOARD_SIZE);
            safety++;
        }

        return {
            start: { x: startX, y: startY },
            goal: { x: goalX, y: goalY }
        };
    }

    function updateUIStaticText() {
        document.documentElement.lang = currentLang;
        const t = uiStrings[currentLang] || uiStrings.en;

        const homeBtn = document.getElementById('home-btn');
        if (homeBtn) homeBtn.innerText = t.home;

        const titleElem = document.getElementById('category-title');
        if (titleElem) titleElem.innerText = (activeMode === 'stairs') ? t.titleStairs : t.titleGrid;

        const lblUp = document.getElementById('lbl-stairs-up');
        if (lblUp) lblUp.innerText = t.stairsUp;

        const lblDown = document.getElementById('lbl-stairs-down');
        if (lblDown) lblDown.innerText = t.stairsDown;

        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLang);
        });

        renderModePills();
        renderScenarioPills();
        updatePrompt();
    }

    // Top Mode Pills (2D Grid vs Stairs)
    function renderModePills() {
        const container = document.getElementById('mode-pills');
        if (!container) return;
        container.innerHTML = '';

        const t = uiStrings[currentLang] || uiStrings.en;

        const gridPill = document.createElement('button');
        gridPill.className = `routine-pill ${activeMode === 'grid' ? 'active' : ''}`;
        gridPill.innerText = t.modeGrid;
        gridPill.onclick = () => switchMode('grid');
        container.appendChild(gridPill);

        const stairsPill = document.createElement('button');
        stairsPill.className = `routine-pill ${activeMode === 'stairs' ? 'active' : ''}`;
        stairsPill.innerText = t.modeStairs;
        stairsPill.onclick = () => switchMode('stairs');
        container.appendChild(stairsPill);
    }

    function switchMode(mode) {
        if (activeMode === mode) return;
        activeMode = mode;
        localStorage.setItem(STORAGE_KEY_MODE, activeMode);

        const t = uiStrings[currentLang] || uiStrings.en;
        const titleElem = document.getElementById('category-title');
        if (titleElem) titleElem.innerText = (activeMode === 'stairs') ? t.titleStairs : t.titleGrid;

        // Toggle container visibility
        const gridContainer = document.getElementById('grid-container');
        const gridControls = document.getElementById('grid-controls');
        const stairsContainer = document.getElementById('stairs-container');
        const stairsControls = document.getElementById('stairs-controls');

        if (activeMode === 'stairs') {
            if (gridContainer) gridContainer.style.display = 'none';
            if (gridControls) gridControls.style.display = 'none';
            if (stairsContainer) stairsContainer.style.display = 'flex';
            if (stairsControls) stairsControls.style.display = 'flex';
        } else {
            if (stairsContainer) stairsContainer.style.display = 'none';
            if (stairsControls) stairsControls.style.display = 'none';
            if (gridContainer) gridContainer.style.display = 'flex';
            if (gridControls) gridControls.style.display = 'grid';
        }

        renderModePills();
        renderScenarioPills();
        initRound();
    }

    function renderScenarioPills() {
        const container = document.getElementById('scenario-pills');
        if (!container) return;
        container.innerHTML = '';

        const t = uiStrings[currentLang] || uiStrings.en;

        if (activeMode === 'grid') {
            // Infinite mix pill
            const infPill = document.createElement('button');
            infPill.className = `routine-pill ${selectedGridMode === 'infinite' ? 'active' : ''}`;
            infPill.innerText = t.infinitePill;
            infPill.onclick = () => {
                selectedGridMode = 'infinite';
                renderScenarioPills();
                initRound();
            };
            container.appendChild(infPill);

            // Specific grid animals
            GRID_PAIRS.forEach(sc => {
                const pill = document.createElement('button');
                pill.className = `routine-pill ${selectedGridMode === sc.id ? 'active' : ''}`;
                const scName = sc.name[currentLang] || sc.name.en;
                pill.innerText = `${sc.char} ➔ ${sc.target} ${scName}`;
                pill.onclick = () => {
                    selectedGridMode = sc.id;
                    renderScenarioPills();
                    initRound();
                };
                container.appendChild(pill);
            });
        } else {
            // Stairs scenarios
            STAIRS_SCENARIOS.forEach((sc, idx) => {
                const pill = document.createElement('button');
                pill.className = `routine-pill ${idx === currentStairsIndex ? 'active' : ''}`;
                const scName = sc.name[currentLang] || sc.name.en;
                const arrow = sc.direction === 'up' ? '⬆️' : '⬇️';
                pill.innerText = `${arrow} ${sc.char} ➔ ${sc.target} ${scName}`;
                pill.onclick = () => {
                    currentStairsIndex = idx;
                    renderScenarioPills();
                    initRound();
                };
                container.appendChild(pill);
            });
        }
    }

    function initRound() {
        isTransitioning = false;

        if (activeMode === 'grid') {
            if (selectedGridMode === 'infinite') {
                currentGridScenario = GRID_PAIRS[Math.floor(Math.random() * GRID_PAIRS.length)];
            } else {
                currentGridScenario = GRID_PAIRS.find(s => s.id === selectedGridMode) || GRID_PAIRS[0];
            }

            const positions = generateRandomGridPositions();
            charPos = positions.start;
            targetPos = positions.goal;
            visitedCells = new Set();
            visitedCells.add(`${charPos.x},${charPos.y}`);

            if (window.AlpTracker) {
                window.AlpTracker.onQuestionStart(`spatial_grid_${currentGridScenario.id}`);
            }

            renderGridBoard();
        } else {
            currentStairsScenario = STAIRS_SCENARIOS[currentStairsIndex % STAIRS_SCENARIOS.length];
            currentStep = currentStairsScenario.startStep;
            targetStep = currentStairsScenario.goalStep;

            if (window.AlpTracker) {
                window.AlpTracker.onQuestionStart(`spatial_stairs_${currentStairsScenario.id}`);
            }

            renderStairsBoard();
        }

        updatePrompt();
        speakCurrentPrompt();
    }

    // ==========================================
    // 2D Grid Maze Rendering & Movement
    // ==========================================

    function renderGridBoard() {
        const board = document.getElementById('spatial-game-board');
        if (!board) return;
        board.innerHTML = '';

        const scenario = currentGridScenario;

        for (let y = 0; y < BOARD_SIZE; y++) {
            for (let x = 0; x < BOARD_SIZE; x++) {
                const cell = document.createElement('div');
                cell.className = 'spatial-cell';
                cell.id = `cell-${x}-${y}`;

                const isChar = (x === charPos.x && y === charPos.y);
                const isTarget = (x === targetPos.x && y === targetPos.y);
                const isVisited = visitedCells.has(`${x},${y}`);

                if (isChar && isTarget) {
                    cell.classList.add('is-character', 'is-success');
                    cell.innerText = `${scenario.char}❤️`;
                } else if (isChar) {
                    cell.classList.add('is-character');
                    cell.innerText = scenario.char;
                } else if (isTarget) {
                    cell.classList.add('is-target');
                    cell.innerText = scenario.target;
                } else if (isVisited) {
                    cell.classList.add('is-visited');
                }

                board.appendChild(cell);
            }
        }
    }

    function moveGrid(dx, dy, dirName) {
        if (isTransitioning) return;

        const newX = charPos.x + dx;
        const newY = charPos.y + dy;

        const btnId = `btn-spatial-${dirName}`;
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.classList.add('btn-active');
            setTimeout(() => btn.classList.remove('btn-active'), 180);
        }

        const t = uiStrings[currentLang] || uiStrings.en;
        speakDirection(t[dirName] || dirName);

        if (newX >= 0 && newX < BOARD_SIZE && newY >= 0 && newY < BOARD_SIZE) {
            charPos.x = newX;
            charPos.y = newY;
            visitedCells.add(`${newX},${newY}`);

            playStepSound();

            if (window.AlpTracker) {
                window.AlpTracker.onAttempt(true, dirName);
            }

            renderGridBoard();
            checkGridWin();
        } else {
            playStepSound();
        }
    }

    function checkGridWin() {
        if (charPos.x === targetPos.x && charPos.y === targetPos.y) {
            isTransitioning = true;
            const scenario = currentGridScenario;

            playSuccessChime();

            if (window.AlpTracker) {
                window.AlpTracker.onTrialSuccess(`spatial_grid_${scenario.id}`);
            }

            const winMsg = scenario.winText[currentLang] || scenario.winText.en;
            const promptElem = document.getElementById('prompt-label');
            if (promptElem) promptElem.innerText = winMsg;

            setTimeout(() => {
                speakText(winMsg);
            }, 100);

            setTimeout(() => {
                initRound();
            }, 2200);
        }
    }

    // ==========================================
    // 1D Ascending Staircase Rendering & Movement
    // ==========================================

    function renderStairsBoard() {
        const board = document.getElementById('stairs-container');
        if (!board) return;
        board.innerHTML = '';

        const scenario = currentStairsScenario;

        for (let i = 0; i < STAIR_STEPS_COUNT; i++) {
            const col = document.createElement('div');
            col.className = `stair-column stair-step-${i}`;

            const isChar = (i === currentStep);
            const isTarget = (i === targetStep);

            const platform = document.createElement('div');
            platform.className = `stair-platform ${isChar ? 'is-occupied' : ''} ${isTarget ? 'is-target-platform' : ''}`;

            if (isChar && isTarget) {
                platform.classList.add('is-success-platform');
                platform.innerHTML = `<span class="stair-actor">${scenario.char}❤️</span>`;
            } else if (isChar) {
                platform.innerHTML = `<span class="stair-actor">${scenario.char}</span>`;
            } else if (isTarget) {
                platform.innerHTML = `<span class="stair-target-item">${scenario.target}</span>`;
            }

            const label = document.createElement('span');
            label.className = 'stair-step-label';
            label.innerText = i === 0 ? (currentLang === 'fr' ? 'BAS' : 'BASE') : (i === 4 ? (currentLang === 'fr' ? 'HAUT' : 'TOP') : `${i}`);

            col.appendChild(platform);
            col.appendChild(label);
            board.appendChild(col);
        }
    }

    function hopStair(delta) {
        if (isTransitioning) return;

        const dirName = delta > 0 ? 'up' : 'down';
        const btnId = `btn-stairs-${dirName}`;
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.classList.add('btn-active');
            setTimeout(() => btn.classList.remove('btn-active'), 180);
        }

        const t = uiStrings[currentLang] || uiStrings.en;
        speakDirection(t[dirName] || dirName);

        const newStep = currentStep + delta;
        if (newStep >= 0 && newStep < STAIR_STEPS_COUNT) {
            currentStep = newStep;

            if (delta > 0) {
                playSpringUpSound();
            } else {
                playStepDownSound();
            }

            if (window.AlpTracker) {
                window.AlpTracker.onAttempt(true, dirName);
            }

            renderStairsBoard();
            checkStairsWin();
        } else {
            playStepSound();
        }
    }

    function checkStairsWin() {
        if (currentStep === targetStep) {
            isTransitioning = true;
            const scenario = currentStairsScenario;

            playSuccessChime();

            if (window.AlpTracker) {
                window.AlpTracker.onTrialSuccess(`spatial_stairs_${scenario.id}`);
            }

            const winMsg = scenario.winText[currentLang] || scenario.winText.en;
            const promptElem = document.getElementById('prompt-label');
            if (promptElem) promptElem.innerText = winMsg;

            setTimeout(() => {
                speakText(winMsg);
            }, 100);

            // Advance to next stairs scenario after celebration
            setTimeout(() => {
                currentStairsIndex = (currentStairsIndex + 1) % STAIRS_SCENARIOS.length;
                renderScenarioPills();
                initRound();
            }, 2400);
        }
    }

    // ==========================================
    // Unified Controls & Keyboard Bindings
    // ==========================================

    function setupControls() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.onclick = () => {
                const selected = btn.getAttribute('data-lang');
                if (selected === currentLang) return;
                currentLang = selected;
                localStorage.setItem('alp_lang', currentLang);

                updateUIStaticText();
                renderModePills();
                renderScenarioPills();
                initRound();
            };
        });

        const soundBtn = document.getElementById('sound-toggle-btn');
        if (soundBtn) {
            soundBtn.innerText = soundEnabled ? '🔊' : '🔇';
            soundBtn.onclick = () => {
                soundEnabled = !soundEnabled;
                localStorage.setItem('alp_sound', soundEnabled);
                soundBtn.innerText = soundEnabled ? '🔊' : '🔇';
                if (soundEnabled) speakCurrentPrompt();
                else if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            };
        }

        const speakBtn = document.getElementById('speak-prompt-btn');
        if (speakBtn) {
            speakBtn.onclick = () => speakCurrentPrompt();
        }

        // 2D Grid D-Pad Click Bindings
        document.getElementById('btn-spatial-up')?.addEventListener('click', () => moveGrid(0, -1, 'up'));
        document.getElementById('btn-spatial-down')?.addEventListener('click', () => moveGrid(0, 1, 'down'));
        document.getElementById('btn-spatial-left')?.addEventListener('click', () => moveGrid(-1, 0, 'left'));
        document.getElementById('btn-spatial-right')?.addEventListener('click', () => moveGrid(1, 0, 'right'));

        // 1D Stairs Click Bindings
        document.getElementById('btn-stairs-up')?.addEventListener('click', () => hopStair(1));
        document.getElementById('btn-stairs-down')?.addEventListener('click', () => hopStair(-1));

        // Keyboard & 4-Button Controller Arrow Bindings
        window.addEventListener('keydown', (e) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
            const code = e.code;
            const key = e.key;

            if (code === 'ArrowUp' || key === 'ArrowUp' || key === '2' || code === 'Digit2' || code === 'Numpad2' || code === 'KeyW' || key === 'w') {
                e.preventDefault();
                if (activeMode === 'stairs') hopStair(1);
                else moveGrid(0, -1, 'up');
            } else if (code === 'ArrowDown' || key === 'ArrowDown' || key === '3' || code === 'Digit3' || code === 'Numpad3' || code === 'KeyS' || key === 's') {
                e.preventDefault();
                if (activeMode === 'stairs') hopStair(-1);
                else moveGrid(0, 1, 'down');
            } else if (code === 'ArrowLeft' || key === 'ArrowLeft' || key === '1' || code === 'Digit1' || code === 'Numpad1' || code === 'KeyA' || key === 'a') {
                e.preventDefault();
                if (activeMode === 'grid') moveGrid(-1, 0, 'left');
            } else if (code === 'ArrowRight' || key === 'ArrowRight' || key === '4' || code === 'Digit4' || code === 'Numpad4' || code === 'KeyD' || key === 'd') {
                e.preventDefault();
                if (activeMode === 'grid') moveGrid(1, 0, 'right');
            }
        });
    }

    function updatePrompt() {
        const promptElem = document.getElementById('prompt-label');
        if (!promptElem) return;

        if (activeMode === 'grid' && currentGridScenario) {
            promptElem.innerText = currentGridScenario.prompt[currentLang] || currentGridScenario.prompt.en;
        } else if (activeMode === 'stairs' && currentStairsScenario) {
            promptElem.innerText = currentStairsScenario.prompt[currentLang] || currentStairsScenario.prompt.en;
        }
    }

    function speakCurrentPrompt() {
        if (activeMode === 'grid' && currentGridScenario) {
            speakText(currentGridScenario.prompt[currentLang] || currentGridScenario.prompt.en);
        } else if (activeMode === 'stairs' && currentStairsScenario) {
            speakText(currentStairsScenario.prompt[currentLang] || currentStairsScenario.prompt.en);
        }
    }

    function init() {
        setupControls();
        updateUIStaticText();

        // Initial layout visibility
        const gridContainer = document.getElementById('grid-container');
        const gridControls = document.getElementById('grid-controls');
        const stairsContainer = document.getElementById('stairs-container');
        const stairsControls = document.getElementById('stairs-controls');

        if (activeMode === 'stairs') {
            if (gridContainer) gridContainer.style.display = 'none';
            if (gridControls) gridControls.style.display = 'none';
            if (stairsContainer) stairsContainer.style.display = 'flex';
            if (stairsControls) stairsControls.style.display = 'flex';
        } else {
            if (stairsContainer) stairsContainer.style.display = 'none';
            if (stairsControls) stairsControls.style.display = 'none';
            if (gridContainer) gridContainer.style.display = 'flex';
            if (gridControls) gridControls.style.display = 'grid';
        }

        initRound();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
