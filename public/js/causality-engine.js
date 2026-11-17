// Cause & Effect Lab Engine
// Autism Learning Platform - 6 Tactile Cause-and-Effect Scenes with Real-Time Equation Banner, Free Play & Mission Modes.

(() => {
    'use strict';

    const CAUSALITY_SCENARIOS = [
        {
            id: 'door',
            title: { fr: '🚪 La Porte', en: '🚪 The Door' },
            freePrompt: { fr: 'Appuie sur les boutons pour ouvrir ou fermer la porte', en: 'Press the buttons to open or close the door' },
            controls: [
                { action: 'open',  style: 'btn-green', icon: '🚪 🟢', label: { fr: 'Ouvrir', en: 'Open Door' } },
                { action: 'close', style: 'btn-red',   icon: '🚪 🔴', label: { fr: 'Fermer', en: 'Close Door' } }
            ]
        },
        {
            id: 'elevator',
            title: { fr: "🛗 L'Ascenseur", en: '🛗 Elevator' },
            freePrompt: { fr: "Appuie sur Monter ou Descendre dans l'ascenseur", en: 'Press Up or Down inside the elevator' },
            controls: [
                { action: 'up',   style: 'btn-blue',  icon: '🛗 ⬆️', label: { fr: 'Monter', en: 'Go Up' } },
                { action: 'down', style: 'btn-amber', icon: '🛗 ⬇️', label: { fr: 'Descendre', en: 'Go Down' } }
            ]
        },
        {
            id: 'bird',
            title: { fr: "🐦 L'Oiseau", en: '🐦 Bird Cage' },
            freePrompt: { fr: "Ouvre la cage pour voir l'oiseau s'envoler !", en: 'Open the cage to watch the bird fly away!' },
            controls: [
                { action: 'open',  style: 'btn-green', icon: '🔓 🐦', label: { fr: 'Ouvrir la cage', en: 'Open Cage' } },
                { action: 'close', style: 'btn-blue',  icon: '🔒 🐦', label: { fr: 'Fermer la cage', en: 'Close Cage' } }
            ]
        },
        {
            id: 'faucet',
            title: { fr: '🚰 Le Robinet', en: '🚰 Water Tap' },
            freePrompt: { fr: "Tourne le robinet pour remplir le verre d'eau", en: 'Turn the tap to fill the glass with water' },
            controls: [
                { action: 'fill',  style: 'btn-blue',  icon: '🚰 💧', label: { fr: 'Remplir le verre', en: 'Fill Glass' } },
                { action: 'empty', style: 'btn-amber', icon: '🔄 🥛', label: { fr: 'Vider le verre', en: 'Empty Glass' } }
            ]
        },
        {
            id: 'glass',
            title: { fr: '🥛 Le Verre Fragile', en: '🥛 Fragile Glass' },
            freePrompt: { fr: 'Que se passe-t-il si on lâche le verre ?', en: 'What happens when we drop the glass?' },
            controls: [
                { action: 'drop',  style: 'btn-red',   icon: '🫳 🥛', label: { fr: 'Lâcher le verre', en: 'Drop Glass' } },
                { action: 'reset', style: 'btn-green', icon: '✨ 🥛', label: { fr: 'Nouveau verre', en: 'New Glass' } }
            ]
        },
        {
            id: 'lamp',
            title: { fr: '💡 La Lumière', en: '💡 Light Switch' },
            freePrompt: { fr: "Appuie sur l'interrupteur pour allumer ou éteindre", en: 'Flip the switch to turn the light on or off' },
            controls: [
                { action: 'on',  style: 'btn-amber', icon: '💡 ☀️', label: { fr: 'Allumer', en: 'Turn On' } },
                { action: 'off', style: 'btn-blue',  icon: '🌙 💤', label: { fr: 'Éteindre', en: 'Turn Off' } }
            ]
        }
    ];

    let soundEnabled = localStorage.getItem('alp_sound') !== 'false';
    let lang = localStorage.getItem('alp_lang') || localStorage.getItem('appLang') || 'fr';
    let gameMode = 'mission'; // 'free' | 'mission' (starts with intentional guided missions)
    let isMixAllMode = true;  // '🎲 Tout mélanger' active by default to cycle missions across scenarios
    let currentScenarioIdx = 0;
    let isBusy = false;
    let missionTargetAction = null;
    let audioCtx = null;
    let celebrationActive = false;
    let particles = [];
    let fireworksAnimFrame = null;

    // Per-scenario physical state
    let sceneState = {
        doorOpen: false,
        elevatorFloor: 2, // 1, 2, or 3
        birdOut: false,
        waterLevel: 0,    // 0 to 100
        glassBroken: false,
        lampOn: false
    };

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

    /* Procedural Web Audio Sound Effects for Each Physical Event */
    function playEffectSound(type) {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            if (!ctx) return;
            const now = ctx.currentTime;

            const playTone = (oscType, f1, f2, start, dur, vol = 0.2) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = oscType;
                osc.frequency.setValueAtTime(f1, now + start);
                if (f2 !== f1) osc.frequency.exponentialRampToValueAtTime(Math.max(20, f2), now + start + dur);
                gain.gain.setValueAtTime(0.001, now + start);
                gain.gain.linearRampToValueAtTime(vol, now + start + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + start);
                osc.stop(now + start + dur + 0.02);
            };

            if (type === 'door-open') {
                playTone('sine', 220, 440, 0, 0.55, 0.18);
                playTone('triangle', 523, 659, 0.55, 0.25, 0.18);
            } else if (type === 'door-close') {
                playTone('sine', 420, 200, 0, 0.5, 0.18);
                playTone('triangle', 160, 110, 0.5, 0.12, 0.22);
            } else if (type === 'elev-up') {
                playTone('sine', 240, 520, 0, 0.75, 0.16);
                playTone('sine', 784, 784, 0.78, 0.3, 0.2);
            } else if (type === 'elev-down') {
                playTone('sine', 520, 240, 0, 0.75, 0.16);
                playTone('sine', 523, 523, 0.78, 0.3, 0.2);
            } else if (type === 'bird-fly') {
                [0, 0.2, 0.42, 0.65].forEach(t => {
                    playTone('sine', 2000, 3100, t, 0.08, 0.16);
                    playTone('sine', 2900, 2100, t + 0.08, 0.08, 0.16);
                });
            } else if (type === 'water-fill') {
                for (let i = 0; i < 10; i++) {
                    const f = 320 + i * 55;
                    playTone('sine', f, f + 90, i * 0.12, 0.11, 0.15);
                }
            } else if (type === 'glass-break') {
                // Gentle crystalline chime-clink (clear feedback without scary loudness)
                [1480, 1960, 2450, 1720, 2890].forEach((f, idx) => {
                    playTone('triangle', f, f * 0.85, idx * 0.04, 0.24, 0.14);
                });
            } else if (type === 'switch-click') {
                playTone('triangle', 680, 320, 0, 0.08, 0.22);
            }
        } catch (e) {}
    }

    /* ============================================================================
       CAUSE -> EFFECT EQUATION BANNER & CLEARING LOGIC
       ============================================================================ */

    function clearEquation() {
        const cEl = document.getElementById('eq-cause-text');
        const eEl = document.getElementById('eq-effect-text');
        if (cEl) cEl.innerText = lang === 'fr' ? '👆 Action' : '👆 Action';
        if (eEl) eEl.innerText = lang === 'fr' ? '✨ Résultat' : '✨ Result';
        const strip = document.getElementById('equation-strip');
        if (strip) strip.classList.remove('active-equation');
    }

    function setEquation(causeStr, effectStr) {
        const cEl = document.getElementById('eq-cause-text');
        const eEl = document.getElementById('eq-effect-text');
        if (cEl) cEl.innerText = `👆 ${causeStr}`;
        if (eEl) eEl.innerText = `✨ ${effectStr}`;
        const strip = document.getElementById('equation-strip');
        if (strip) strip.classList.add('active-equation');
    }

    /* ============================================================================
       CELEBRATORY REWARD: FIREWORKS & FANFARE
       ============================================================================ */

    function playCelebrationFanfare() {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            if (!ctx) return;
            const now = ctx.currentTime;
            // Pentatonic major fanfare chord: C5, E5, G5, A5, C6
            const chord = [523.25, 659.25, 783.99, 880.00, 1046.50];
            chord.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
                osc.frequency.setValueAtTime(freq, now + idx * 0.08);
                gain.gain.setValueAtTime(0.001, now + idx * 0.08);
                gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.45);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + idx * 0.08);
                osc.stop(now + idx * 0.08 + 0.48);
            });
        } catch (e) {}
    }

    function createFireworkBurst(originX, originY, colorPalette) {
        const count = 42;
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.35;
            const speed = 2.4 + Math.random() * 5.2;
            particles.push({
                x: originX,
                y: originY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
                radius: 3 + Math.random() * 4,
                alpha: 1,
                decay: 0.013 + Math.random() * 0.014,
                gravity: 0.11,
                sparkle: Math.random() > 0.4
            });
        }
    }

    function runFireworksAnimation(canvas, ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.vx *= 0.97;
            p.vy *= 0.97;
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                particles.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius * (p.sparkle && Math.random() > 0.5 ? 1.3 : 1), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        if (celebrationActive || particles.length > 0) {
            fireworksAnimFrame = requestAnimationFrame(() => runFireworksAnimation(canvas, ctx));
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    function triggerCelebrationReward(onRewardFinished) {
        celebrationActive = true;
        playCelebrationFanfare();

        const banner = document.getElementById('celebration-banner');
        if (banner) {
            banner.innerText = lang === 'fr' ? '🎉 Bravo ! Mission réussie ! ⭐' : '🎉 Bravo! Mission accomplished! ⭐';
            banner.style.display = 'block';
        }

        speak(lang === 'fr' ? 'Bravo ! Mission réussie !' : 'Bravo! Mission accomplished!');

        const canvas = document.getElementById('celebration-canvas');
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            const ctx = canvas.getContext('2d');
            particles = [];

            const palette = ['#FFD166', '#06D6A0', '#118AB2', '#EF476F', '#8338EC', '#FF9F1C', '#48BB78', '#F6E05E'];

            // Multiple bursts across screen
            createFireworkBurst(canvas.width * 0.32, canvas.height * 0.35, palette);
            createFireworkBurst(canvas.width * 0.68, canvas.height * 0.32, palette);

            setTimeout(() => {
                if (celebrationActive) createFireworkBurst(canvas.width * 0.5, canvas.height * 0.28, palette);
            }, 300);
            setTimeout(() => {
                if (celebrationActive) createFireworkBurst(canvas.width * 0.22, canvas.height * 0.42, palette);
            }, 600);
            setTimeout(() => {
                if (celebrationActive) createFireworkBurst(canvas.width * 0.78, canvas.height * 0.4, palette);
            }, 900);

            if (fireworksAnimFrame) cancelAnimationFrame(fireworksAnimFrame);
            runFireworksAnimation(canvas, ctx);
        }

        setTimeout(() => {
            celebrationActive = false;
            if (banner) banner.style.display = 'none';
            if (onRewardFinished) onRewardFinished();
        }, 2200);
    }

    /* ============================================================================
       SCENARIO SELECTION & PILLS (WITH "TOUT MÉLANGER" / "MIX ALL" SUPPORT)
       ============================================================================ */

    function renderScenarioPills() {
        const container = document.getElementById('scenario-pills');
        if (!container) return;
        container.innerHTML = '';

        // Mix All Pill
        const allBtn = document.createElement('button');
        allBtn.className = 'routine-pill' + (isMixAllMode ? ' active' : '');
        allBtn.innerText = lang === 'fr' ? '🎲 Tout mélanger' : '🎲 Mix All';
        allBtn.onclick = () => {
            if (isMixAllMode) return;
            isMixAllMode = true;
            advanceToNextScenarioInMixAll();
        };
        container.appendChild(allBtn);

        // Individual Scenario Pills
        CAUSALITY_SCENARIOS.forEach((sc, idx) => {
            const btn = document.createElement('button');
            btn.className = 'routine-pill' + (!isMixAllMode && idx === currentScenarioIdx ? ' active' : '');
            btn.innerText = sc.title[lang] || sc.title.fr;
            btn.onclick = () => {
                isMixAllMode = false;
                loadScenario(idx);
            };
            container.appendChild(btn);
        });
    }

    function advanceToNextScenarioInMixAll() {
        clearEquation();
        currentScenarioIdx = (currentScenarioIdx + 1) % CAUSALITY_SCENARIOS.length;
        loadScenario(currentScenarioIdx);
    }

    function loadScenario(idx) {
        currentScenarioIdx = idx;
        isBusy = false;
        clearEquation();

        const sc = CAUSALITY_SCENARIOS[currentScenarioIdx];
        if (window.AlpTracker) {
            window.AlpTracker.onQuestionStart(`causality_${sc.id}`);
        }

        renderScenarioPills();
        renderControls();
        drawCurrentScene();
        setupPromptForMode(true);
    }

    function setupPromptForMode(shouldSpeak = false) {
        const sc = CAUSALITY_SCENARIOS[currentScenarioIdx];

        if (gameMode === 'free') {
            missionTargetAction = null;
            clearEquation();
            const text = sc.freePrompt[lang] || sc.freePrompt.fr;
            const promptEl = document.getElementById('prompt-label');
            if (promptEl) promptEl.innerText = text;

            if (shouldSpeak) speak(text);
            return;
        }

        // Mission Mode: erase equation strip so old action -> result does not linger
        clearEquation();

        // Pick a logical goal based on current scene state
        let mission = null;
        if (sc.id === 'door') {
            mission = !sceneState.doorOpen
                ? { action: 'open', text: { fr: 'Mission : Ouvre la porte pour laisser entrer le garçon !', en: 'Mission: Open the door to let the boy in!' } }
                : { action: 'close', text: { fr: 'Mission : Ferme la porte maintenant !', en: 'Mission: Close the door now!' } };
        } else if (sc.id === 'elevator') {
            mission = sceneState.elevatorFloor < 3
                ? { action: 'up', text: { fr: "Mission : Fais monter l'ascenseur !", en: 'Mission: Send the elevator up!' } }
                : { action: 'down', text: { fr: "Mission : Fais descendre l'ascenseur !", en: 'Mission: Send the elevator down!' } };
        } else if (sc.id === 'bird') {
            mission = !sceneState.birdOut
                ? { action: 'open', text: { fr: "Mission : Ouvre la cage pour que l'oiseau s'envole !", en: 'Mission: Open the cage so the bird flies away!' } }
                : { action: 'close', text: { fr: "Mission : Rappelle l'oiseau et ferme la cage !", en: 'Mission: Call the bird back and close the cage!' } };
        } else if (sc.id === 'faucet') {
            mission = sceneState.waterLevel < 80
                ? { action: 'fill', text: { fr: "Mission : Tourne le robinet pour remplir le verre d'eau !", en: 'Mission: Turn the tap to fill the glass with water!' } }
                : { action: 'empty', text: { fr: 'Mission : Vide le verre !', en: 'Mission: Empty the glass!' } };
        } else if (sc.id === 'glass') {
            mission = !sceneState.glassBroken
                ? { action: 'drop', text: { fr: 'Mission : Lâche le verre pour voir ce qui arrive !', en: 'Mission: Drop the glass to see what happens!' } }
                : { action: 'reset', text: { fr: 'Mission : Remets un verre neuf sur la table !', en: 'Mission: Put a new glass on the table!' } };
        } else if (sc.id === 'lamp') {
            mission = !sceneState.lampOn
                ? { action: 'on', text: { fr: 'Mission : Allume la lumière dans la chambre !', en: 'Mission: Turn on the bedroom light!' } }
                : { action: 'off', text: { fr: 'Mission : Éteins la lumière pour dormir !', en: 'Mission: Turn off the light for sleep!' } };
        }

        missionTargetAction = mission.action;
        const promptStr = mission.text[lang] || mission.text.fr;
        const promptEl = document.getElementById('prompt-label');
        if (promptEl) promptEl.innerText = promptStr;
        if (shouldSpeak) speak(promptStr);
    }

    function renderControls() {
        const sc = CAUSALITY_SCENARIOS[currentScenarioIdx];
        const row = document.getElementById('cause-controls');
        if (!row) return;
        row.innerHTML = '';

        sc.controls.forEach(ctrl => {
            const btn = document.createElement('button');
            btn.className = `cause-btn ${ctrl.style}`;
            btn.setAttribute('tabindex', '0');
            btn.setAttribute('role', 'button');
            btn.setAttribute('aria-label', ctrl.label[lang] || ctrl.label.fr);
            btn.innerHTML = `<span class="cause-icon" aria-hidden="true">${ctrl.icon}</span><span class="cause-label">${ctrl.label[lang] || ctrl.label.fr}</span>`;
            btn.onclick = () => triggerAction(ctrl.action);
            row.appendChild(btn);
        });
    }

    function triggerAction(action) {
        if (isBusy || celebrationActive) return;
        const sc = CAUSALITY_SCENARIOS[currentScenarioIdx];

        // In Mission Mode, verify if action matches goal
        const isMissionMode = (gameMode === 'mission' && missionTargetAction);
        const isCorrect = isMissionMode ? (action === missionTargetAction) : true;

        if (isMissionMode) {
            if (window.AlpTracker) {
                window.AlpTracker.onAttempt(isCorrect, action);
            }

            if (!isCorrect) {
                playEffectSound('switch-click');
                setupPromptForMode(true);
                return;
            } else if (window.AlpTracker) {
                window.AlpTracker.onTrialSuccess(`causality_${sc.id}`);
            }
        }

        const onActionComplete = () => {
            if (isMissionMode && isCorrect) {
                triggerCelebrationReward(() => {
                    isBusy = false;
                    clearEquation();
                    if (isMixAllMode) {
                        advanceToNextScenarioInMixAll();
                    } else {
                        setupPromptForMode(true);
                    }
                });
            } else {
                isBusy = false;
                if (gameMode === 'mission') {
                    setTimeout(() => setupPromptForMode(true), 700);
                }
            }
        };

        if (sc.id === 'door') animateDoor(action === 'open', onActionComplete);
        else if (sc.id === 'elevator') animateElevator(action === 'up' ? 1 : -1, onActionComplete);
        else if (sc.id === 'bird') animateBird(action === 'open', onActionComplete);
        else if (sc.id === 'faucet') animateFaucet(action === 'fill', onActionComplete);
        else if (sc.id === 'glass') animateGlass(action === 'drop', onActionComplete);
        else if (sc.id === 'lamp') animateLamp(action === 'on', onActionComplete);
    }

    /* ============================================================================
       SVG SCENE RENDERERS & SMOOTH ANIMATIONS
       ============================================================================ */

    function drawCurrentScene() {
        const sc = CAUSALITY_SCENARIOS[currentScenarioIdx];
        const svg = document.getElementById('causality-svg');
        if (!svg) return;

        if (sc.id === 'door') {
            const offset = sceneState.doorOpen ? 68 : 0;
            const boyScale = sceneState.doorOpen ? 1.08 : 0.92;
            svg.innerHTML = `
                <rect width="420" height="320" fill="#EDF2F7"/>
                <rect x="0" y="265" width="420" height="55" fill="#CBD5E0"/>
                <!-- Doorway Interior -->
                <rect x="130" y="45" width="160" height="220" rx="8" fill="#FEF3C7" stroke="#A0AEC0" stroke-width="4"/>
                <!-- Friendly Boy Inside -->
                <g id="door-boy" transform="translate(210, 175) scale(${boyScale})">
                    <circle cx="0" cy="-35" r="24" fill="#FBD38D"/>
                    <path d="M-24,-40 Q0,-68 24,-40" fill="#744210"/>
                    <circle cx="-8" cy="-36" r="3" fill="#2D3748"/>
                    <circle cx="8" cy="-36" r="3" fill="#2D3748"/>
                    <path d="M-8,-25 Q0,-17 8,-25" stroke="#2D3748" stroke-width="3" fill="none" stroke-linecap="round"/>
                    <rect x="-22" y="-8" width="44" height="55" rx="12" fill="#4299E1"/>
                    <rect x="-18" y="47" width="14" height="35" rx="5" fill="#2B6CB0"/>
                    <rect x="4" y="47" width="14" height="35" rx="5" fill="#2B6CB0"/>
                </g>
                <!-- Left & Right Sliding Doors -->
                <rect id="door-left" x="${130 - offset}" y="45" width="80" height="220" fill="#63B3ED" stroke="#2B6CB0" stroke-width="3"/>
                <rect id="door-right" x="${210 + offset}" y="45" width="80" height="220" fill="#63B3ED" stroke="#2B6CB0" stroke-width="3"/>
                <!-- Wall Frame Mask -->
                <rect x="45" y="40" width="85" height="230" fill="#E2E8F0"/>
                <rect x="290" y="40" width="85" height="230" fill="#E2E8F0"/>
                <!-- Status Light above Door -->
                <circle cx="210" cy="24" r="10" fill="${sceneState.doorOpen ? '#48BB78' : '#F56565'}"/>
            `;
        } else if (sc.id === 'elevator') {
            const floorY = { 3: 28, 2: 124, 1: 220 }[sceneState.elevatorFloor];
            svg.innerHTML = `
                <rect width="420" height="320" fill="#F7FAFC"/>
                <!-- 3 Building Floors -->
                <rect x="30" y="20" width="360" height="92" rx="10" fill="#EBF8FF" stroke="#BEE3F8" stroke-width="2"/>
                <text x="50" y="72" font-size="22" font-weight="bold" fill="#2B6CB0">3 ☀️ Haut</text>
                <rect x="30" y="116" width="360" height="92" rx="10" fill="#F0FFF4" stroke="#C6F6D5" stroke-width="2"/>
                <text x="50" y="168" font-size="22" font-weight="bold" fill="#276749">2 🏠 Milieu</text>
                <rect x="30" y="212" width="360" height="92" rx="10" fill="#FFF5F5" stroke="#FED7D7" stroke-width="2"/>
                <text x="50" y="264" font-size="22" font-weight="bold" fill="#9B2C2C">1 🌿 Bas</text>
                <!-- Elevator Shaft -->
                <rect x="195" y="20" width="110" height="284" rx="12" fill="#CBD5E0" stroke="#A0AEC0" stroke-width="3"/>
                <line x1="250" y1="20" x2="250" y2="304" stroke="#718096" stroke-width="3" stroke-dasharray="6,6"/>
                <!-- Elevator Cabin -->
                <g id="elev-cabin" transform="translate(205, ${floorY})">
                    <rect x="0" y="0" width="90" height="80" rx="12" fill="#ECC94B" stroke="#B7791F" stroke-width="3"/>
                    <rect x="12" y="12" width="66" height="54" rx="8" fill="#FFFBEB"/>
                    <text x="45" y="52" font-size="34" text-anchor="middle">🧒</text>
                </g>
                <!-- Floor Indicator Panel -->
                <rect x="325" y="75" width="48" height="170" rx="14" fill="#2D3748"/>
                <circle cx="349" cy="110" r="14" fill="${sceneState.elevatorFloor === 3 ? '#48BB78' : '#4A5568'}"/>
                <text x="349" y="116" font-size="15" font-weight="bold" fill="#FFF" text-anchor="middle">3</text>
                <circle cx="349" cy="160" r="14" fill="${sceneState.elevatorFloor === 2 ? '#48BB78' : '#4A5568'}"/>
                <text x="349" y="166" font-size="15" font-weight="bold" fill="#FFF" text-anchor="middle">2</text>
                <circle cx="349" cy="210" r="14" fill="${sceneState.elevatorFloor === 1 ? '#48BB78' : '#4A5568'}"/>
                <text x="349" y="216" font-size="15" font-weight="bold" fill="#FFF" text-anchor="middle">1</text>
            `;
        } else if (sc.id === 'bird') {
            const birdX = sceneState.birdOut ? 335 : 135;
            const birdY = sceneState.birdOut ? 72 : 195;
            const doorAngle = sceneState.birdOut ? -110 : 0;
            svg.innerHTML = `
                <!-- Sky Window on Right -->
                <rect width="420" height="320" fill="#FFFDF7"/>
                <rect x="245" y="30" width="145" height="185" rx="16" fill="#90CDF4" stroke="#B7791F" stroke-width="5"/>
                <circle cx="350" cy="65" r="20" fill="#F6E05E"/>
                <ellipse cx="290" cy="95" rx="26" ry="12" fill="#FFFFFF" opacity="0.9"/>
                <!-- Table -->
                <rect x="0" y="265" width="420" height="55" fill="#DDB892"/>
                <!-- Bird Cage -->
                <path d="M75,140 A60,60 0 0,1 195,140 L195,255 L75,255 Z" fill="none" stroke="#B7791F" stroke-width="5"/>
                <line x1="105" y1="88" x2="105" y2="255" stroke="#B7791F" stroke-width="3"/>
                <line x1="135" y1="80" x2="135" y2="255" stroke="#B7791F" stroke-width="3"/>
                <line x1="165" y1="88" x2="165" y2="255" stroke="#B7791F" stroke-width="3"/>
                <rect x="68" y="250" width="134" height="16" rx="6" fill="#975A16"/>
                <!-- Cage Door -->
                <g id="cage-door" transform="translate(195, 165) rotate(${doorAngle})">
                    <rect x="-38" y="0" width="38" height="75" rx="4" fill="rgba(246, 224, 94, 0.25)" stroke="#D69E2E" stroke-width="4"/>
                </g>
                <!-- Cute Yellow Bird -->
                <g id="bird-sprite" transform="translate(${birdX}, ${birdY})">
                    <circle cx="0" cy="0" r="18" fill="#F6E05E" stroke="#D69E2E" stroke-width="2"/>
                    <polygon points="16,-4 28,0 16,5" fill="#ED8936"/>
                    <circle cx="7" cy="-5" r="3" fill="#2D3748"/>
                    <ellipse id="bird-wing" cx="-4" cy="2" rx="11" ry="7" fill="#ECC94B"/>
                </g>
            `;
        } else if (sc.id === 'faucet') {
            const fillH = Math.round((sceneState.waterLevel / 100) * 105);
            const fillY = 258 - fillH;
            svg.innerHTML = `
                <rect width="420" height="320" fill="#F7FAFC"/>
                <!-- Sink Counter -->
                <rect x="0" y="265" width="420" height="55" fill="#CBD5E0"/>
                <!-- Chrome Faucet -->
                <path d="M90,265 L90,95 Q90,55 135,55 L185,55 Q210,55 210,82 L210,98" fill="none" stroke="#718096" stroke-width="18" stroke-linecap="round"/>
                <!-- Tap Handle -->
                <g id="tap-handle" transform="translate(135, 42) rotate(${sceneState.waterLevel > 0 ? 90 : 0})">
                    <rect x="-24" y="-6" width="48" height="12" rx="6" fill="#4299E1"/>
                </g>
                <!-- Water Stream (hidden unless pouring) -->
                <rect id="water-stream" x="203" y="102" width="14" height="0" rx="6" fill="#63B3ED" opacity="0.85"/>
                <!-- Glass -->
                <rect x="165" y="145" width="90" height="118" rx="10" fill="rgba(255,255,255,0.75)" stroke="#90CDF4" stroke-width="4"/>
                <!-- Water Level Inside Glass -->
                <rect id="glass-water" x="169" y="${fillY}" width="82" height="${fillH}" rx="6" fill="#4299E1" opacity="0.8"/>
            `;
        } else if (sc.id === 'glass') {
            svg.innerHTML = `
                <rect width="420" height="320" fill="#FFFDF9"/>
                <!-- Floor -->
                <rect x="0" y="275" width="420" height="45" fill="#E2E8F0"/>
                <!-- Table on Left -->
                <rect x="20" y="165" width="185" height="18" rx="6" fill="#B7791F"/>
                <rect x="45" y="183" width="18" height="92" fill="#975A16"/>
                <rect x="165" y="183" width="18" height="92" fill="#975A16"/>
                <!-- Intact Glass -->
                <g id="intact-glass" transform="translate(162, 95)" style="display: ${sceneState.glassBroken ? 'none' : 'block'};">
                    <rect x="0" y="0" width="44" height="68" rx="6" fill="#EBF8FF" stroke="#4299E1" stroke-width="3"/>
                    <rect x="4" y="22" width="36" height="42" rx="4" fill="#90CDF4" opacity="0.7"/>
                </g>
                <!-- Broken Glass Pieces on Floor -->
                <g id="broken-pieces" style="display: ${sceneState.glassBroken ? 'block' : 'none'};">
                    <polygon points="220,273 242,255 252,273" fill="#BEE3F8" stroke="#4299E1" stroke-width="2"/>
                    <polygon points="258,273 272,250 288,273" fill="#90CDF4" stroke="#4299E1" stroke-width="2"/>
                    <polygon points="292,273 314,260 322,273" fill="#BEE3F8" stroke="#4299E1" stroke-width="2"/>
                    <ellipse cx="270" cy="275" rx="58" ry="6" fill="#63B3ED" opacity="0.55"/>
                </g>
            `;
        } else if (sc.id === 'lamp') {
            const bg = sceneState.lampOn ? '#FFFBEB' : '#2B3A55';
            const windowFill = sceneState.lampOn ? '#90CDF4' : '#1A202C';
            svg.innerHTML = `
                <rect width="420" height="320" fill="${bg}"/>
                <!-- Window -->
                <rect x="275" y="55" width="105" height="115" rx="12" fill="${windowFill}" stroke="#A0AEC0" stroke-width="4"/>
                ${sceneState.lampOn
                    ? '<circle cx="345" cy="85" r="16" fill="#F6E05E"/>'
                    : '<circle cx="345" cy="85" r="13" fill="#FAF089"/><circle cx="305" cy="105" r="2.5" fill="#FFF"/><circle cx="325" cy="135" r="2.5" fill="#FFF"/>'}
                <!-- Floor & Bed -->
                <rect x="0" y="265" width="420" height="55" fill="${sceneState.lampOn ? '#E6CCB2' : '#1A202C'}"/>
                <text x="115" y="245" font-size="68" text-anchor="middle">🧸</text>
                <!-- Light Cone Rays when ON -->
                <polygon points="180,82 240,82 315,265 105,265" fill="rgba(250, 240, 137, 0.38)" style="display: ${sceneState.lampOn ? 'block' : 'none'};"/>
                <!-- Ceiling Hanging Lamp -->
                <line x1="210" y1="0" x2="210" y2="48" stroke="#718096" stroke-width="4"/>
                <polygon points="175,82 245,82 230,48 190,48" fill="#ED8936"/>
                <circle cx="210" cy="85" r="14" fill="${sceneState.lampOn ? '#FAF089' : '#718096'}"/>
            `;
        }
    }

    /* ---------------- INDIVIDUAL ANIMATION CONTROLLERS ---------------- */

    function animateDoor(open, done) {
        isBusy = true;
        playEffectSound(open ? 'door-open' : 'door-close');
        setEquation(
            open ? (lang === 'fr' ? 'Bouton Ouvrir' : 'Open Button') : (lang === 'fr' ? 'Bouton Fermer' : 'Close Button'),
            open ? (lang === 'fr' ? 'La porte s’ouvre !' : 'The door opens!') : (lang === 'fr' ? 'La porte se ferme !' : 'The door closes!')
        );
        speak(open ? (lang === 'fr' ? 'La porte s’ouvre !' : 'The door opens!') : (lang === 'fr' ? 'La porte se ferme !' : 'The door closes!'));

        const startOffset = sceneState.doorOpen ? 68 : 0;
        const targetOffset = open ? 68 : 0;
        const startTime = performance.now();
        const duration = 600;

        function frame(now) {
            const t = Math.min(1, (now - startTime) / duration);
            const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            const cur = startOffset + (targetOffset - startOffset) * ease;

            const left = document.getElementById('door-left');
            const right = document.getElementById('door-right');
            if (left && right) {
                left.setAttribute('x', (130 - cur).toFixed(1));
                right.setAttribute('x', (210 + cur).toFixed(1));
            }

            if (t < 1) {
                requestAnimationFrame(frame);
            } else {
                sceneState.doorOpen = open;
                drawCurrentScene();
                done();
            }
        }
        requestAnimationFrame(frame);
    }

    function animateElevator(delta, done) {
        const nextFloor = Math.max(1, Math.min(3, sceneState.elevatorFloor + delta));
        if (nextFloor === sceneState.elevatorFloor) {
            done();
            return;
        }

        isBusy = true;
        const goingUp = delta > 0;
        playEffectSound(goingUp ? 'elev-up' : 'elev-down');
        const msg = goingUp
            ? (lang === 'fr' ? `L'ascenseur monte à l'étage ${nextFloor} !` : `Elevator goes up to floor ${nextFloor}!`)
            : (lang === 'fr' ? `L'ascenseur descend à l'étage ${nextFloor} !` : `Elevator goes down to floor ${nextFloor}!`);

        setEquation(
            goingUp ? (lang === 'fr' ? 'Bouton Monter ⬆️' : 'Up Button ⬆️') : (lang === 'fr' ? 'Bouton Descendre ⬇️' : 'Down Button ⬇️'),
            msg
        );
        speak(msg);

        const floorY = { 3: 28, 2: 124, 1: 220 };
        const startY = floorY[sceneState.elevatorFloor];
        const endY = floorY[nextFloor];
        const startTime = performance.now();
        const duration = 800;

        function frame(now) {
            const t = Math.min(1, (now - startTime) / duration);
            const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            const y = startY + (endY - startY) * ease;

            const cabin = document.getElementById('elev-cabin');
            if (cabin) cabin.setAttribute('transform', `translate(205, ${y.toFixed(1)})`);

            if (t < 1) {
                requestAnimationFrame(frame);
            } else {
                sceneState.elevatorFloor = nextFloor;
                drawCurrentScene();
                done();
            }
        }
        requestAnimationFrame(frame);
    }

    function animateBird(flyOut, done) {
        isBusy = true;
        playEffectSound(flyOut ? 'bird-fly' : 'switch-click');
        const msg = flyOut
            ? (lang === 'fr' ? "La cage s'ouvre et l'oiseau s'envole !" : 'The cage opens and the bird flies away!')
            : (lang === 'fr' ? "L'oiseau revient dans sa cage !" : 'The bird returns to its cage!');

        setEquation(
            flyOut ? (lang === 'fr' ? 'Ouvrir la cage 🔓' : 'Open Cage 🔓') : (lang === 'fr' ? 'Fermer la cage 🔒' : 'Close Cage 🔒'),
            msg
        );
        speak(msg);

        const startX = sceneState.birdOut ? 335 : 135;
        const startY = sceneState.birdOut ? 72 : 195;
        const endX = flyOut ? 335 : 135;
        const endY = flyOut ? 72 : 195;
        const startTime = performance.now();
        const duration = 950;

        function frame(now) {
            const t = Math.min(1, (now - startTime) / duration);
            const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            const x = startX + (endX - startX) * ease;
            const arc = Math.sin(t * Math.PI) * -35;
            const y = startY + (endY - startY) * ease + arc;
            const flap = Math.sin(t * Math.PI * 10) * 5;

            const bird = document.getElementById('bird-sprite');
            const wing = document.getElementById('bird-wing');
            const door = document.getElementById('cage-door');
            if (bird) bird.setAttribute('transform', `translate(${x.toFixed(1)}, ${y.toFixed(1)})`);
            if (wing) wing.setAttribute('cy', (2 + flap).toFixed(1));
            if (door) door.setAttribute('transform', `translate(195, 165) rotate(${flyOut ? -110 * ease : -110 * (1 - ease)})`);

            if (t < 1) {
                requestAnimationFrame(frame);
            } else {
                sceneState.birdOut = flyOut;
                drawCurrentScene();
                done();
            }
        }
        requestAnimationFrame(frame);
    }

    function animateFaucet(fill, done) {
        isBusy = true;
        const msg = fill
            ? (lang === 'fr' ? "L'eau coule et remplit le verre !" : 'Water flows and fills the glass!')
            : (lang === 'fr' ? 'Le verre est maintenant vide !' : 'The glass is now empty!');

        setEquation(
            fill ? (lang === 'fr' ? 'Tourner le robinet 🚰' : 'Turn Tap 🚰') : (lang === 'fr' ? 'Vider le verre 🔄' : 'Empty Glass 🔄'),
            msg
        );
        speak(msg);

        if (!fill) {
            playEffectSound('switch-click');
            sceneState.waterLevel = 0;
            drawCurrentScene();
            done();
            return;
        }

        playEffectSound('water-fill');
        const stream = document.getElementById('water-stream');
        const water = document.getElementById('glass-water');
        const handle = document.getElementById('tap-handle');
        if (handle) handle.setAttribute('transform', 'translate(135, 42) rotate(90)');
        if (stream) stream.setAttribute('height', '154');

        const startLevel = sceneState.waterLevel;
        const targetLevel = 92;
        const startTime = performance.now();
        const duration = 1200;

        function frame(now) {
            const t = Math.min(1, (now - startTime) / duration);
            const curLevel = startLevel + (targetLevel - startLevel) * t;
            const fillH = Math.round((curLevel / 100) * 105);
            const fillY = 258 - fillH;

            if (water) {
                water.setAttribute('y', fillY);
                water.setAttribute('height', fillH);
            }

            if (t < 1) {
                requestAnimationFrame(frame);
            } else {
                if (stream) stream.setAttribute('height', '0');
                sceneState.waterLevel = targetLevel;
                drawCurrentScene();
                done();
            }
        }
        requestAnimationFrame(frame);
    }

    function animateGlass(drop, done) {
        isBusy = true;
        if (!drop) {
            playEffectSound('switch-click');
            sceneState.glassBroken = false;
            setEquation(
                lang === 'fr' ? 'Nouveau verre ✨' : 'New Glass ✨',
                lang === 'fr' ? 'Le verre est entier sur la table' : 'Whole glass on the table'
            );
            drawCurrentScene();
            done();
            return;
        }

        const msg = lang === 'fr' ? 'Le verre tombe et se casse !' : 'The glass falls and breaks!';
        setEquation(lang === 'fr' ? 'Lâcher le verre 🫳' : 'Drop Glass 🫳', msg);
        speak(msg);

        const glassEl = document.getElementById('intact-glass');
        const startTime = performance.now();
        const duration = 620;

        function frame(now) {
            const t = Math.min(1, (now - startTime) / duration);
            const gravity = t * t;
            const x = 162 + 85 * t;
            const y = 95 + 150 * gravity;
            const rot = 85 * t;

            if (glassEl) {
                glassEl.setAttribute('transform', `translate(${x.toFixed(1)}, ${y.toFixed(1)}) rotate(${rot.toFixed(1)})`);
            }

            if (t < 1) {
                requestAnimationFrame(frame);
            } else {
                playEffectSound('glass-break');
                sceneState.glassBroken = true;
                drawCurrentScene();
                done();
            }
        }
        requestAnimationFrame(frame);
    }

    function animateLamp(turnOn, done) {
        playEffectSound('switch-click');
        sceneState.lampOn = turnOn;
        const msg = turnOn
            ? (lang === 'fr' ? 'La lumière éclaire la chambre !' : 'The light brightens the room!')
            : (lang === 'fr' ? 'Il fait nuit dans la chambre !' : 'The room is dark for sleep!');
        setEquation(
            turnOn ? (lang === 'fr' ? 'Allumer 💡' : 'Switch On 💡') : (lang === 'fr' ? 'Éteindre 🌙' : 'Switch Off 🌙'),
            msg
        );
        speak(msg);
        drawCurrentScene();
        done();
    }

    function setupControls() {
        document.getElementById('mode-free-btn')?.addEventListener('click', () => {
            gameMode = 'free';
            document.getElementById('mode-free-btn')?.classList.add('active');
            document.getElementById('mode-mission-btn')?.classList.remove('active');
            clearEquation();
            setupPromptForMode(true);
        });

        document.getElementById('mode-mission-btn')?.addEventListener('click', () => {
            gameMode = 'mission';
            document.getElementById('mode-mission-btn')?.classList.add('active');
            document.getElementById('mode-free-btn')?.classList.remove('active');
            clearEquation();
            setupPromptForMode(true);
        });

        document.getElementById('speak-prompt-btn')?.addEventListener('click', () => {
            speak(document.getElementById('prompt-label')?.innerText || '');
        });

        document.getElementById('next-mission-btn')?.addEventListener('click', () => {
            if (isBusy || celebrationActive) return;
            clearEquation();
            if (isMixAllMode) {
                advanceToNextScenarioInMixAll();
            } else {
                currentScenarioIdx = (currentScenarioIdx + 1) % CAUSALITY_SCENARIOS.length;
                loadScenario(currentScenarioIdx);
            }
        });

        const soundBtn = document.getElementById('sound-toggle-btn');
        if (soundBtn) {
            soundBtn.innerText = soundEnabled ? '🔊' : '🔇';
            soundBtn.onclick = () => {
                soundEnabled = !soundEnabled;
                localStorage.setItem('alp_sound', soundEnabled);
                soundBtn.innerText = soundEnabled ? '🔊' : '🔇';
                if (!soundEnabled && 'speechSynthesis' in window) window.speechSynthesis.cancel();
            };
        }

        // Direct number keys 1, 2 to trigger action buttons
        window.addEventListener('keydown', (e) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
            if (['1', '2'].includes(e.key)) {
                const idx = parseInt(e.key, 10) - 1;
                const btns = document.querySelectorAll('.cause-btn');
                if (btns[idx]) btns[idx].click();
            }
        });

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
                if (titleEl) titleEl.innerText = lang === 'fr' ? '⚡ Cause & Effet' : '⚡ Cause & Effect';

                const mFree = document.getElementById('mode-free-btn');
                if (mFree) mFree.innerText = lang === 'fr' ? '🎮 Mode Libre (Découvrir)' : '🎮 Free Mode (Explore)';

                const mMission = document.getElementById('mode-mission-btn');
                if (mMission) mMission.innerText = lang === 'fr' ? '🎯 Mode Mission (Défi)' : '🎯 Mission Mode (Challenge)';

                const nextBtn = document.getElementById('next-mission-btn');
                if (nextBtn) {
                    nextBtn.title = lang === 'fr' ? 'Mission suivante' : 'Next Mission';
                    nextBtn.setAttribute('aria-label', nextBtn.title);
                }

                renderScenarioPills();
                renderControls();
                setupPromptForMode(true);
            };
        });
    }

    function init() {
        document.querySelectorAll('.lang-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.lang === lang);
        });
        const homeBtn = document.getElementById('home-btn');
        if (homeBtn) homeBtn.innerText = lang === 'fr' ? '⬅️ Accueil' : '⬅️ Home';

        const titleEl = document.getElementById('activity-title');
        if (titleEl) titleEl.innerText = lang === 'fr' ? '⚡ Cause & Effet' : '⚡ Cause & Effect';

        const mFree = document.getElementById('mode-free-btn');
        if (mFree) {
            mFree.innerText = lang === 'fr' ? '🎮 Mode Libre (Découvrir)' : '🎮 Free Mode (Explore)';
            mFree.classList.toggle('active', gameMode === 'free');
        }

        const mMission = document.getElementById('mode-mission-btn');
        if (mMission) {
            mMission.innerText = lang === 'fr' ? '🎯 Mode Mission (Défi)' : '🎯 Mission Mode (Challenge)';
            mMission.classList.toggle('active', gameMode === 'mission');
        }

        const nextBtn = document.getElementById('next-mission-btn');
        if (nextBtn) {
            nextBtn.title = lang === 'fr' ? 'Mission suivante' : 'Next Mission';
            nextBtn.setAttribute('aria-label', nextBtn.title);
        }

        setupControls();
        loadScenario(0);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
