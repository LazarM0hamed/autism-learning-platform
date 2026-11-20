/**
 * Calm-Down & Sensory Regulation Corner Engine (Activity #31)
 * Zero-pressure sensory sanctuary (no timers, no scores, no failures) offering:
 * 1. Guided Breathing Bubble with harmonic tone swell
 * 2. Pastel Sensory Pop-It (20 bubbles) with flip reset
 * 3. Soothing Ambient Soundscapes (Rain, Ocean Waves, Wind Chimes)
 */

(() => {
    'use strict';

    const POPIT_ROW_COLORS = ['#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA'];

    let lang = localStorage.getItem('alp_lang') || localStorage.getItem('appLang') || 'fr';
    let soundEnabled = localStorage.getItem('alp_sound') !== 'false';
    let activeTool = 'breath'; // 'breath' | 'popit' | 'sounds'
    let breathRunning = true;
    let breathRafId = null;
    let breathStartTime = performance.now();
    let lastBreathPhase = '';

    let poppedStates = Array(20).fill(false);
    let activeAmbientType = null; // 'rain' | 'waves' | 'chimes' | null
    let ambientStopper = null;
    let ambientAnimId = null;
    let audioCtx = null;

    function getAudioContext() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        return audioCtx;
    }

    function stopAllContinuousAudio() {
        if (breathRafId) {
            cancelAnimationFrame(breathRafId);
            breathRafId = null;
        }
        if (ambientAnimId) {
            cancelAnimationFrame(ambientAnimId);
            ambientAnimId = null;
        }
        if (ambientStopper) {
            ambientStopper();
            ambientStopper = null;
        }
        activeAmbientType = null;
    }

    function playBubblePopSound(pitchOffset = 0) {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(280 + pitchOffset, now);
            osc.frequency.exponentialRampToValueAtTime(620 + pitchOffset, now + 0.08);
            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.1);
        } catch (e) {}
    }

    function playBreathPad(rising = true) {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(rising ? 174.61 : 261.63, now);
            osc.frequency.linearRampToValueAtTime(rising ? 261.63 : 174.61, now + 3.8);
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.08, now + 1.8);
            gain.gain.linearRampToValueAtTime(0.001, now + 3.9);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 4.0);
        } catch (e) {}
    }

    /* ============================================================================
       TOOL 1: GUIDED BREATHING BUBBLE (4s Inhale -> 1s Hold -> 4s Exhale)
       ============================================================================ */

    function renderBreathingTool() {
        stopAllContinuousAudio();
        const ws = document.getElementById('calm-workspace');
        if (!ws) return;

        ws.innerHTML = `
            <div class="breathing-card">
                <div class="breath-cue-text" id="breath-cue">${lang === 'fr' ? 'Inspire doucement...' : 'Breathe in slowly...'}</div>
                <div class="breath-visual-box">
                    <div class="breath-halo" id="breath-halo"></div>
                    <div class="breath-core" id="breath-core">🌸</div>
                </div>
                <button type="button" class="calm-action-btn" id="breath-toggle-btn">
                    ${breathRunning ? (lang === 'fr' ? '⏸️ Pause' : '⏸️ Pause') : (lang === 'fr' ? '▶️ Reprendre' : '▶️ Resume')}
                </button>
            </div>
        `;

        const toggleBtn = document.getElementById('breath-toggle-btn');
        if (toggleBtn) {
            toggleBtn.onclick = () => {
                breathRunning = !breathRunning;
                if (breathRunning) {
                    breathStartTime = performance.now();
                    lastBreathPhase = '';
                    runBreathLoop();
                }
                toggleBtn.innerText = breathRunning
                    ? (lang === 'fr' ? '⏸️ Pause' : '⏸️ Pause')
                    : (lang === 'fr' ? '▶️ Reprendre' : '▶️ Resume');
            };
        }

        if (breathRunning) {
            breathStartTime = performance.now();
            lastBreathPhase = '';
            runBreathLoop();
        }

        if (window.AlpInputManager && typeof window.AlpInputManager.refresh === 'function') {
            window.AlpInputManager.refresh();
        }
    }

    function runBreathLoop() {
        const cycleMs = 9000;

        function step(now) {
            if (!breathRunning || activeTool !== 'breath') return;
            const elapsed = (now - breathStartTime) % cycleMs;
            const cueEl = document.getElementById('breath-cue');
            const coreEl = document.getElementById('breath-core');
            const haloEl = document.getElementById('breath-halo');

            let scale = 0.58;
            let phase = 'inhale';

            if (elapsed < 4000) {
                phase = 'inhale';
                const t = elapsed / 4000;
                const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
                scale = 0.58 + 0.44 * ease;
                if (cueEl) cueEl.innerText = lang === 'fr' ? 'Inspire doucement... 🌬️' : 'Breathe in slowly... 🌬️';
            } else if (elapsed < 5000) {
                phase = 'hold';
                scale = 1.02;
                if (cueEl) cueEl.innerText = lang === 'fr' ? 'Garde un instant... ✨' : 'Hold gently... ✨';
            } else {
                phase = 'exhale';
                const t = (elapsed - 5000) / 4000;
                const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
                scale = 1.02 - 0.44 * ease;
                if (cueEl) cueEl.innerText = lang === 'fr' ? 'Souffle doucement... 🍃' : 'Breathe out slowly... 🍃';
            }

            if (phase !== lastBreathPhase) {
                lastBreathPhase = phase;
                if (phase === 'inhale') playBreathPad(true);
                else if (phase === 'exhale') playBreathPad(false);
            }

            if (coreEl) coreEl.style.transform = `scale(${scale.toFixed(3)})`;
            if (haloEl) haloEl.style.transform = `scale(${(scale * 1.08).toFixed(3)})`;

            breathRafId = requestAnimationFrame(step);
        }

        breathRafId = requestAnimationFrame(step);
    }

    /* ============================================================================
       TOOL 2: PASTEL SENSORY POP-IT
       ============================================================================ */

    function renderPopItTool() {
        stopAllContinuousAudio();
        const ws = document.getElementById('calm-workspace');
        if (!ws) return;

        let bubblesHtml = '';
        for (let i = 0; i < 20; i++) {
            const row = Math.floor(i / 5);
            const bg = POPIT_ROW_COLORS[row];
            const cls = 'pop-bubble' + (poppedStates[i] ? ' popped' : '');
            bubblesHtml += `<button type="button" class="${cls}" style="background:${bg};" data-idx="${i}" aria-label="Pop bubble ${i + 1}"></button>`;
        }

        ws.innerHTML = `
            <div class="popit-board">
                <div class="popit-grid" id="popit-grid">${bubblesHtml}</div>
                <button type="button" class="calm-action-btn" id="flip-popit-btn">
                    🔄 ${lang === 'fr' ? 'Retourner le Pop-It' : 'Flip Pop-It'}
                </button>
            </div>
        `;

        document.querySelectorAll('.pop-bubble').forEach(btn => {
            btn.onclick = () => {
                const idx = parseInt(btn.dataset.idx, 10);
                poppedStates[idx] = !poppedStates[idx];
                btn.classList.toggle('popped', poppedStates[idx]);
                playBubblePopSound((idx % 5) * 45);
            };
        });

        const flipBtn = document.getElementById('flip-popit-btn');
        if (flipBtn) {
            flipBtn.onclick = () => {
                poppedStates = Array(20).fill(false);
                playBubblePopSound(180);
                renderPopItTool();
            };
        }

        if (window.AlpInputManager && typeof window.AlpInputManager.refresh === 'function') {
            window.AlpInputManager.refresh();
        }
    }

    /* ============================================================================
       TOOL 3: AMBIENT SOOTHING SOUNDSCAPES (Rain, Waves, Wind Chimes)
       ============================================================================ */

    function renderSoundsTool() {
        stopAllContinuousAudio();
        const ws = document.getElementById('calm-workspace');
        if (!ws) return;

        ws.innerHTML = `
            <div class="soundscape-card">
                <svg id="ambient-svg" viewBox="0 0 460 170" style="width:100%;border-radius:18px;background:#EFF6FF;">
                    <circle cx="380" cy="42" r="18" fill="#FACC15" opacity="0.8"/>
                    <path d="M0,125 Q115,105 230,125 T460,125 L460,170 L0,170 Z" fill="#93C5FD" opacity="0.65"/>
                    <g id="ambient-particles"></g>
                </svg>
                <div class="ambient-buttons-row">
                    <button type="button" class="ambient-btn" id="amb-rain-btn">🌧️ ${lang === 'fr' ? 'Pluie douce' : 'Soft Rain'}</button>
                    <button type="button" class="ambient-btn" id="amb-waves-btn">🌊 ${lang === 'fr' ? 'Vagues' : 'Ocean Waves'}</button>
                    <button type="button" class="ambient-btn" id="amb-chimes-btn">🎐 ${lang === 'fr' ? 'Carillon' : 'Wind Chimes'}</button>
                </div>
            </div>
        `;

        const rainBtn = document.getElementById('amb-rain-btn');
        if (rainBtn) rainBtn.onclick = () => toggleAmbient('rain', 'amb-rain-btn');

        const wavesBtn = document.getElementById('amb-waves-btn');
        if (wavesBtn) wavesBtn.onclick = () => toggleAmbient('waves', 'amb-waves-btn');

        const chimesBtn = document.getElementById('amb-chimes-btn');
        if (chimesBtn) chimesBtn.onclick = () => toggleAmbient('chimes', 'amb-chimes-btn');

        if (window.AlpInputManager && typeof window.AlpInputManager.refresh === 'function') {
            window.AlpInputManager.refresh();
        }
    }

    function toggleAmbient(type, btnId) {
        const wasSame = activeAmbientType === type;
        stopAllContinuousAudio();
        document.querySelectorAll('.ambient-btn').forEach(b => b.classList.remove('active'));

        if (wasSame || !soundEnabled) return;

        activeAmbientType = type;
        const targetBtn = document.getElementById(btnId);
        if (targetBtn) targetBtn.classList.add('active');
        startAmbientAudio(type);
        startAmbientVisuals(type);
    }

    function startAmbientAudio(type) {
        const ctx = getAudioContext();

        if (type === 'rain' || type === 'waves') {
            const bufferSize = ctx.sampleRate * 3;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            noise.loop = true;

            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = type === 'rain' ? 650 : 320;

            const gain = ctx.createGain();
            gain.gain.value = type === 'rain' ? 0.08 : 0.14;

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            noise.start();

            let waveInterval = null;
            if (type === 'waves') {
                let phase = 0;
                waveInterval = setInterval(() => {
                    phase += 0.15;
                    const swell = 0.06 + (Math.sin(phase) + 1) * 0.06;
                    gain.gain.setTargetAtTime(swell, ctx.currentTime, 0.2);
                    filter.frequency.setTargetAtTime(220 + (Math.sin(phase) + 1) * 160, ctx.currentTime, 0.2);
                }, 250);
            }

            ambientStopper = () => {
                if (waveInterval) clearInterval(waveInterval);
                try { noise.stop(); noise.disconnect(); } catch (e) {}
            };
        } else if (type === 'chimes') {
            const scale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
            const chimeTimer = setInterval(() => {
                if (!soundEnabled) return;
                const f = scale[Math.floor(Math.random() * scale.length)];
                const now = ctx.currentTime;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, now);
                gain.gain.setValueAtTime(0.001, now);
                gain.gain.linearRampToValueAtTime(0.09, now + 0.03);
                gain.gain.exponentialRampToValueAtTime(0.0008, now + 2.2);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 2.3);
            }, 1400);

            ambientStopper = () => clearInterval(chimeTimer);
        }
    }

    function startAmbientVisuals(type) {
        const startTime = performance.now();
        function draw(now) {
            if (activeAmbientType !== type) return;
            const t = (now - startTime) / 1000;
            const layer = document.getElementById('ambient-particles');
            if (layer) {
                if (type === 'rain') {
                    let drops = '';
                    for (let i = 0; i < 12; i++) {
                        const x = 35 + i * 36;
                        const y = ((t * 95 + i * 29) % 140) + 10;
                        drops += `<line x1="${x}" y1="${y.toFixed(1)}" x2="${x - 4}" y2="${(y + 12).toFixed(1)}" stroke="#3B82F6" stroke-width="3" stroke-linecap="round"/>`;
                    }
                    layer.innerHTML = drops;
                } else if (type === 'waves') {
                    const shift = Math.sin(t * 1.4) * 18;
                    layer.innerHTML = `<path d="M${(-20 + shift).toFixed(1)},118 Q115,96 230,118 T480,118 L480,170 L-20,170 Z" fill="#60A5FA" opacity="0.55"/>`;
                } else {
                    const sway = Math.sin(t * 2) * 8;
                    layer.innerHTML = `<text x="${(230 + sway).toFixed(1)}" y="78" font-size="44" text-anchor="middle">🎐✨</text>`;
                }
            }
            ambientAnimId = requestAnimationFrame(draw);
        }
        ambientAnimId = requestAnimationFrame(draw);
    }

    function selectTool(tool, btnId) {
        activeTool = tool;
        document.querySelectorAll('.routine-pill').forEach(b => b.classList.remove('active'));
        const activeBtn = document.getElementById(btnId);
        if (activeBtn) activeBtn.classList.add('active');

        if (tool === 'breath') renderBreathingTool();
        else if (tool === 'popit') renderPopItTool();
        else renderSoundsTool();

        if (window.AlpInputManager && typeof window.AlpInputManager.refresh === 'function') {
            window.AlpInputManager.refresh();
        }
    }

    function setupControls() {
        const breathBtn = document.getElementById('tool-breath-btn');
        if (breathBtn) breathBtn.onclick = () => selectTool('breath', 'tool-breath-btn');

        const popitBtn = document.getElementById('tool-popit-btn');
        if (popitBtn) popitBtn.onclick = () => selectTool('popit', 'tool-popit-btn');

        const soundsBtn = document.getElementById('tool-sounds-btn');
        if (soundsBtn) soundsBtn.onclick = () => selectTool('sounds', 'tool-sounds-btn');

        const soundBtn = document.getElementById('sound-toggle-btn');
        if (soundBtn) {
            soundBtn.innerText = soundEnabled ? '🔊' : '🔇';
            soundBtn.onclick = () => {
                soundEnabled = !soundEnabled;
                localStorage.setItem('alp_sound', soundEnabled ? 'true' : 'false');
                soundBtn.innerText = soundEnabled ? '🔊' : '🔇';
                if (!soundEnabled && ambientStopper) {
                    stopAllContinuousAudio();
                    document.querySelectorAll('.ambient-btn').forEach(b => b.classList.remove('active'));
                }
            };
        }

        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
            btn.onclick = () => {
                lang = btn.getAttribute('data-lang');
                localStorage.setItem('alp_lang', lang);
                document.querySelectorAll('.lang-btn').forEach(b => {
                    b.classList.toggle('active', b.getAttribute('data-lang') === lang);
                });

                const homeBtn = document.getElementById('home-btn');
                if (homeBtn) homeBtn.innerText = lang === 'fr' ? '⬅️ Accueil' : '⬅️ Home';

                const title = document.getElementById('activity-title');
                if (title) title.innerText = lang === 'fr' ? '🌿 Coin Calme' : '🌿 Calm Corner';

                if (breathBtn) breathBtn.innerText = lang === 'fr' ? '🫧 Bulle de Respiration' : '🫧 Breathing Bubble';
                if (popitBtn) popitBtn.innerText = lang === 'fr' ? '🔘 Pop-It Sensoriel' : '🔘 Sensory Pop-It';
                if (soundsBtn) soundsBtn.innerText = lang === 'fr' ? '🌧️ Sons Apaisants' : '🌧️ Soothing Sounds';

                const prompt = document.getElementById('prompt-label');
                if (prompt) prompt.innerText = lang === 'fr' ? 'Prends un moment calme pour toi' : 'Take a calm moment for yourself';

                selectTool(activeTool, `tool-${activeTool}-btn`);
            };
        });
    }

    window.addEventListener('beforeunload', stopAllContinuousAudio);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setupControls();
            renderBreathingTool();
        });
    } else {
        setupControls();
        renderBreathingTool();
    }
})();
