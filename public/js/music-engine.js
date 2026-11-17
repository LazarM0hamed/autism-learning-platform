// Music Partition Engine
// Autism Learning Platform - Nursery Rhyme Melody Reproduction using Color-Coded Note Blocks (Do - Ré - Mi - Fa - Sol - La - Si)
// 1-to-1 Column Alignment, Animated Marimba Demo Playback, Progressive Lengths & Dancing Comptine Reward.

(() => {
    'use strict';

    const NOTES_SCALE = [
        { id: 'Do',  freq: 261.63, color: '#FF595E', darkText: false },
        { id: 'Ré',  freq: 293.66, color: '#F77F00', darkText: false },
        { id: 'Mi',  freq: 329.63, color: '#FFCA3A', darkText: true  },
        { id: 'Fa',  freq: 349.23, color: '#52B788', darkText: false },
        { id: 'Sol', freq: 392.00, color: '#1982C4', darkText: false },
        { id: 'La',  freq: 440.00, color: '#6A4C93', darkText: false },
        { id: 'Si',  freq: 493.88, color: '#D63384', darkText: false }
    ];

    // Extra frequencies used only in full reward extracts (e.g. low Sol3)
    const EXTRA_FREQS = {
        Sol3: 196.00,
        Do5:  523.25
    };

    const COMPTINES = [
        {
            id: 'frere_jacques',
            icon: '🔔',
            title: { fr: 'Frère Jacques', en: 'Frère Jacques' },
            sequences: {
                3: ['Do', 'Ré', 'Mi'],
                5: ['Do', 'Ré', 'Mi', 'Do', 'Do'],
                8: ['Do', 'Ré', 'Mi', 'Do', 'Do', 'Ré', 'Mi', 'Do']
            },
            rewardMelody: [
                { note: 'Do', dur: 0.30 }, { note: 'Ré', dur: 0.30 }, { note: 'Mi', dur: 0.30 }, { note: 'Do', dur: 0.36 },
                { note: 'Do', dur: 0.30 }, { note: 'Ré', dur: 0.30 }, { note: 'Mi', dur: 0.30 }, { note: 'Do', dur: 0.36 },
                { note: 'Mi', dur: 0.30 }, { note: 'Fa', dur: 0.30 }, { note: 'Sol', dur: 0.58 },
                { note: 'Mi', dur: 0.30 }, { note: 'Fa', dur: 0.30 }, { note: 'Sol', dur: 0.62 }
            ]
        },
        {
            id: 'claire_lune',
            icon: '🌙',
            title: { fr: 'Au clair de la lune', en: 'Au clair de la lune' },
            sequences: {
                3: ['Do', 'Do', 'Do'],
                5: ['Do', 'Do', 'Do', 'Ré', 'Mi'],
                8: ['Do', 'Do', 'Do', 'Ré', 'Mi', 'Ré', 'Do', 'Mi']
            },
            rewardMelody: [
                { note: 'Do', dur: 0.28 }, { note: 'Do', dur: 0.28 }, { note: 'Do', dur: 0.28 }, { note: 'Ré', dur: 0.28 },
                { note: 'Mi', dur: 0.50 }, { note: 'Ré', dur: 0.50 },
                { note: 'Do', dur: 0.28 }, { note: 'Mi', dur: 0.28 }, { note: 'Ré', dur: 0.28 }, { note: 'Ré', dur: 0.28 },
                { note: 'Do', dur: 0.68 }
            ]
        },
        {
            id: 'ainsi_font',
            icon: '🎭',
            title: { fr: 'Ainsi font, font, font', en: 'Ainsi font, font, font' },
            sequences: {
                3: ['Do', 'Mi', 'Sol'],
                5: ['Do', 'Mi', 'Sol', 'Sol', 'Sol'],
                8: ['Do', 'Mi', 'Sol', 'Sol', 'Sol', 'La', 'Sol', 'Fa']
            },
            rewardMelody: [
                { note: 'Do', dur: 0.26 }, { note: 'Mi', dur: 0.26 }, { note: 'Sol', dur: 0.34 }, { note: 'Sol', dur: 0.34 }, { note: 'Sol', dur: 0.48 },
                { note: 'La', dur: 0.23 }, { note: 'Sol', dur: 0.23 }, { note: 'Fa', dur: 0.23 }, { note: 'Mi', dur: 0.23 },
                { note: 'Ré', dur: 0.23 }, { note: 'Fa', dur: 0.23 }, { note: 'Mi', dur: 0.56 }
            ]
        },
        {
            id: 'vous_dirai_je',
            icon: '⭐',
            title: { fr: 'Ah ! vous dirai-je, maman', en: 'Twinkle, Twinkle, Little Star' },
            sequences: {
                3: ['Do', 'Do', 'Sol'],
                5: ['Do', 'Do', 'Sol', 'Sol', 'La'],
                8: ['Do', 'Do', 'Sol', 'Sol', 'La', 'La', 'Sol', 'Fa']
            },
            rewardMelody: [
                { note: 'Do', dur: 0.28 }, { note: 'Do', dur: 0.28 }, { note: 'Sol', dur: 0.28 }, { note: 'Sol', dur: 0.28 },
                { note: 'La', dur: 0.28 }, { note: 'La', dur: 0.28 }, { note: 'Sol', dur: 0.54 },
                { note: 'Fa', dur: 0.28 }, { note: 'Fa', dur: 0.28 }, { note: 'Mi', dur: 0.28 }, { note: 'Mi', dur: 0.28 },
                { note: 'Ré', dur: 0.28 }, { note: 'Ré', dur: 0.28 }, { note: 'Do', dur: 0.64 }
            ]
        },
        {
            id: 'bon_tabac',
            icon: '🎶',
            title: { fr: "J'ai du bon tabac", en: "J'ai du bon tabac" },
            sequences: {
                3: ['Do', 'Ré', 'Mi'],
                5: ['Do', 'Ré', 'Mi', 'Do', 'Ré'],
                8: ['Do', 'Ré', 'Mi', 'Do', 'Ré', 'Ré', 'Mi', 'Fa']
            },
            rewardMelody: [
                { note: 'Do', dur: 0.26 }, { note: 'Ré', dur: 0.26 }, { note: 'Mi', dur: 0.26 }, { note: 'Do', dur: 0.26 }, { note: 'Ré', dur: 0.48 },
                { note: 'Ré', dur: 0.26 }, { note: 'Mi', dur: 0.26 }, { note: 'Fa', dur: 0.48 }, { note: 'Fa', dur: 0.48 },
                { note: 'Mi', dur: 0.48 }, { note: 'Mi', dur: 0.60 }
            ]
        }
    ];

    let lang = localStorage.getItem('alp_lang') || localStorage.getItem('appLang') || 'fr';
    let soundEnabled = localStorage.getItem('alp_sound') !== 'false';
    let currentSongIdx = 0;
    let sequenceLength = 3; // 3, 5, or 8
    let targetSequence = [];
    let playerNotes = [];
    let isPlayingDemo = false;
    let isPlayingReward = false;
    let demoTimers = [];
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

    function getNoteMeta(noteId) {
        return NOTES_SCALE.find(n => n.id === noteId) || {
            id: noteId,
            freq: EXTRA_FREQS[noteId] || 261.63,
            color: '#4299E1',
            darkText: false
        };
    }

    /* Warm Marimba / Xylophone Tone Synthesizer */
    function playMusicalNote(noteId, durationSec = 0.45) {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            const now = ctx.currentTime;
            const meta = getNoteMeta(noteId);

            // Fundamental sine + gentle octave harmonic for warm wooden xylophone clarity
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gain = ctx.createGain();
            const overtoneGain = ctx.createGain();

            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(meta.freq, now);

            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(meta.freq * 2, now);
            overtoneGain.gain.setValueAtTime(0.14, now);
            overtoneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.32, now + 0.018);
            gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

            osc1.connect(gain);
            osc2.connect(overtoneGain);
            overtoneGain.connect(gain);
            gain.connect(ctx.destination);

            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + durationSec + 0.03);
            osc2.stop(now + durationSec + 0.03);
        } catch (e) {}
    }

    function clearPendingTimers() {
        demoTimers.forEach(t => clearTimeout(t));
        demoTimers = [];
    }

    function renderSongPills() {
        const container = document.getElementById('song-pills');
        if (!container) return;
        container.innerHTML = '';
        COMPTINES.forEach((song, idx) => {
            const btn = document.createElement('button');
            btn.className = 'routine-pill' + (idx === currentSongIdx ? ' active' : '');
            btn.innerText = `${song.icon} ${song.title[lang] || song.title.fr}`;
            btn.onclick = () => loadSong(idx);
            container.appendChild(btn);
        });
    }

    function loadSong(idx) {
        clearPendingTimers();
        currentSongIdx = idx;
        isPlayingDemo = false;
        isPlayingReward = false;

        const song = COMPTINES[currentSongIdx];
        targetSequence = [...song.sequences[sequenceLength]];
        playerNotes = [];

        if (window.AlpTracker) {
            window.AlpTracker.onQuestionStart(`music_${song.id}_${sequenceLength}`);
        }

        const rew = document.getElementById('reward-stage');
        if (rew) rew.classList.remove('visible');
        const sIcon = document.getElementById('song-icon');
        if (sIcon) sIcon.innerText = song.icon;
        const sTitle = document.getElementById('song-title');
        if (sTitle) sTitle.innerText = song.title[lang] || song.title.fr;

        renderSongPills();
        renderKeyboard();
        renderPartition();
        updatePrompt(false);

        // Automatically play the model partition so the child sees & hears it
        demoTimers.push(setTimeout(() => playModelDemo(), 350));
    }

    function getPromptText() {
        const song = COMPTINES[currentSongIdx];
        if (playerNotes.length >= targetSequence.length) {
            return lang === 'fr'
                ? `Bravo ! Écoute la mélodie de « ${song.title.fr} » ! 🎶`
                : `Awesome! Listen to "${song.title.en}"! 🎶`;
        }
        const nextNote = targetSequence[playerNotes.length];
        return lang === 'fr'
            ? `Reproduis la partition : appuie sur ${nextNote}`
            : `Copy the melody: tap ${nextNote}`;
    }

    function updatePrompt(shouldSpeak = false) {
        const text = getPromptText();
        const pEl = document.getElementById('prompt-label');
        if (pEl) pEl.innerText = text;
        if (shouldSpeak) speak(text);
    }

    /* Render Both Model Partition & Player Partition Columns */
    function renderPartition() {
        const modelTrack = document.getElementById('model-track');
        const playerTrack = document.getElementById('player-track');
        if (!modelTrack || !playerTrack) return;
        modelTrack.innerHTML = '';
        playerTrack.innerHTML = '';

        targetSequence.forEach((noteId, idx) => {
            const meta = getNoteMeta(noteId);

            // 1. Model Note Pill
            const modelPill = document.createElement('div');
            modelPill.className = 'note-pill' + (meta.darkText ? ' dark-text' : '');
            modelPill.id = `model-note-${idx}`;
            modelPill.style.backgroundColor = meta.color;
            modelPill.innerHTML = `<span>${meta.id}</span>`;
            modelTrack.appendChild(modelPill);

            // 2. Player Slot (Filled Note or Dashed Empty Target)
            if (idx < playerNotes.length) {
                const pMeta = getNoteMeta(playerNotes[idx]);
                const filledPill = document.createElement('div');
                filledPill.className = 'note-pill' + (pMeta.darkText ? ' dark-text' : '');
                filledPill.style.backgroundColor = pMeta.color;
                filledPill.innerHTML = `<span>${pMeta.id}</span>`;
                playerTrack.appendChild(filledPill);
            } else {
                const emptySlot = document.createElement('div');
                emptySlot.className = 'note-slot-empty' + (idx === playerNotes.length ? ' active-slot' : '');
                emptySlot.innerText = idx + 1;
                playerTrack.appendChild(emptySlot);
            }
        });
    }

    /* Render Bottom Do -> Si Keyboard Blocks */
    function renderKeyboard() {
        const tray = document.getElementById('keyboard-tray');
        if (!tray) return;
        tray.innerHTML = '';

        NOTES_SCALE.forEach(note => {
            const btn = document.createElement('button');
            btn.className = 'key-block-btn' + (note.darkText ? ' dark-text' : '');
            btn.id = `key-btn-${note.id}`;
            btn.style.backgroundColor = note.color;
            btn.setAttribute('tabindex', '0');
            btn.setAttribute('role', 'button');
            btn.setAttribute('aria-label', note.id);
            btn.innerHTML = `<span class="key-dot"></span><span>${note.id}</span>`;

            btn.onclick = () => handleKeyTap(note.id);
            tray.appendChild(btn);
        });
    }

    /* Play & Light Up the Model Partition Sequentially */
    function playModelDemo() {
        if (isPlayingDemo || isPlayingReward) return;
        clearPendingTimers();
        isPlayingDemo = true;

        const stepMs = 460;
        targetSequence.forEach((noteId, idx) => {
            const tOn = setTimeout(() => {
                playMusicalNote(noteId, 0.42);
                const pill = document.getElementById(`model-note-${idx}`);
                if (pill) pill.classList.add('playing-now');
            }, idx * stepMs);

            const tOff = setTimeout(() => {
                const pill = document.getElementById(`model-note-${idx}`);
                if (pill) pill.classList.remove('playing-now');
            }, idx * stepMs + 360);

            demoTimers.push(tOn, tOff);
        });

        const tEnd = setTimeout(() => {
            isPlayingDemo = false;
            updatePrompt(false);
        }, targetSequence.length * stepMs + 100);
        demoTimers.push(tEnd);
    }

    /* Handle Child Tapping a Note Block */
    function handleKeyTap(noteId) {
        if (isPlayingDemo || isPlayingReward) return;
        if (playerNotes.length >= targetSequence.length) return;

        // Always play the note so the child gets immediate musical feedback
        playMusicalNote(noteId, 0.45);

        const expectedNoteId = targetSequence[playerNotes.length];
        const isCorrect = (noteId === expectedNoteId);

        if (window.AlpTracker) {
            window.AlpTracker.onAttempt(isCorrect, noteId);
        }

        if (isCorrect) {
            playerNotes.push(noteId);
            renderPartition();

            if (playerNotes.length >= targetSequence.length) {
                const song = COMPTINES[currentSongIdx];
                if (window.AlpTracker) {
                    window.AlpTracker.onTrialSuccess(`music_${song.id}_${sequenceLength}`);
                }
                updatePrompt(true);
                demoTimers.push(setTimeout(() => playComptineReward(), 650));
            } else {
                updatePrompt(false);
            }
        } else {
            // Gentle visual cue on the expected model block without harsh buzzers
            const hintEl = document.getElementById(`model-note-${playerNotes.length}`);
            if (hintEl) {
                hintEl.classList.remove('hint-pulse');
                void hintEl.offsetWidth;
                hintEl.classList.add('hint-pulse');
            }
        }
    }

    /* Grand Finale: Play Full Comptine Melody Extract + Animated Dancing Musical Stage */
    function playComptineReward() {
        isPlayingReward = true;
        const song = COMPTINES[currentSongIdx];
        const stage = document.getElementById('reward-stage');
        const svg = document.getElementById('reward-svg');
        if (stage) stage.classList.add('visible');

        let elapsedSec = 0;
        song.rewardMelody.forEach((step, idx) => {
            const meta = getNoteMeta(step.note);
            const startMs = Math.round(elapsedSec * 1000);

            const timer = setTimeout(() => {
                playMusicalNote(step.note, step.dur + 0.14);

                // Highlight matching key on bottom keyboard during reward playback
                document.querySelectorAll('.key-block-btn').forEach(b => b.classList.remove('pressed'));
                const keyBtn = document.getElementById(`key-btn-${step.note}`);
                if (keyBtn) keyBtn.classList.add('pressed');

                // Animate dancing comptine character + dancing equalizers + floating notes
                const bounceY = idx % 2 === 0 ? -12 : 4;
                const tilt = idx % 2 === 0 ? -10 : 10;
                const noteX = 110 + ((idx * 37) % 340);

                if (svg) {
                    svg.innerHTML = `
                        <rect width="560" height="140" rx="16" fill="transparent"/>
                        <!-- Pulsing Colored Sound Bars -->
                        ${NOTES_SCALE.map((n, bIdx) => {
                            const h = n.id === step.note ? 78 : 24 + ((idx + bIdx) % 3) * 12;
                            return `<rect x="${45 + bIdx * 70}" y="${122 - h}" width="42" height="${h}" rx="10" fill="${n.color}" opacity="${n.id === step.note ? '1' : '0.45'}"/>`;
                        }).join('')}
                        <!-- Dancing Comptine Icon -->
                        <g transform="translate(280, ${74 + bounceY}) rotate(${tilt})">
                            <circle cx="0" cy="0" r="36" fill="#FFFFFF" stroke="${meta.color}" stroke-width="5"/>
                            <text x="0" y="14" font-size="42" text-anchor="middle">${song.icon}</text>
                        </g>
                        <!-- Floating Musical Notes -->
                        <text x="${noteX}" y="36" font-size="28" fill="${meta.color}">🎵</text>
                        <text x="${520 - noteX}" y="42" font-size="26">🎶</text>
                        <text x="280" y="132" font-size="16" font-weight="bold" fill="#2D3748" text-anchor="middle">
                            ${song.title[lang] || song.title.fr} — ${step.note} ♪
                        </text>
                    `;
                }
            }, startMs);

            demoTimers.push(timer);
            elapsedSec += step.dur;
        });

        const finishTimer = setTimeout(() => {
            document.querySelectorAll('.key-block-btn').forEach(b => b.classList.remove('pressed'));
            isPlayingReward = false;
            // Advance automatically to the next comptine
            const nextSong = (currentSongIdx + 1) % COMPTINES.length;
            loadSong(nextSong);
        }, Math.round(elapsedSec * 1000) + 950);

        demoTimers.push(finishTimer);
    }

    function setupControls() {
        // Length Switcher Buttons (3, 5, 8 Notes)
        document.querySelectorAll('.len-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.len-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                sequenceLength = parseInt(btn.dataset.len, 10);
                loadSong(currentSongIdx);
            };
        });

        document.getElementById('listen-model-btn')?.addEventListener('click', () => playModelDemo());
        document.getElementById('speak-prompt-btn')?.addEventListener('click', () => updatePrompt(true));

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

        // Direct number keys 1-7 for Do-Ré-Mi-Fa-Sol-La-Si
        window.addEventListener('keydown', (e) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
            if (['1', '2', '3', '4', '5', '6', '7'].includes(e.key)) {
                const idx = parseInt(e.key, 10) - 1;
                if (idx >= 0 && idx < NOTES_SCALE.length) {
                    handleKeyTap(NOTES_SCALE[idx].id);
                }
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
                if (titleEl) titleEl.innerText = lang === 'fr' ? '🎵 Partition Musicale' : '🎵 Music Partition';

                const lmText = document.getElementById('listen-model-text');
                if (lmText) lmText.innerText = lang === 'fr' ? 'Écouter le modèle' : 'Listen to model';

                const mrCaption = document.getElementById('model-row-caption');
                if (mrCaption) mrCaption.innerText = lang === 'fr' ? '🎼 Modèle à reproduire' : '🎼 Model to copy';

                const prCaption = document.getElementById('player-row-caption');
                if (prCaption) prCaption.innerText = lang === 'fr' ? '🎹 Ta partition' : '🎹 Your partition';

                const sTitle = document.getElementById('song-title');
                if (sTitle) sTitle.innerText = COMPTINES[currentSongIdx].title[lang] || COMPTINES[currentSongIdx].title.fr;

                renderSongPills();
                updatePrompt(true);
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
        if (titleEl) titleEl.innerText = lang === 'fr' ? '🎵 Partition Musicale' : '🎵 Music Partition';

        const lmText = document.getElementById('listen-model-text');
        if (lmText) lmText.innerText = lang === 'fr' ? 'Écouter le modèle' : 'Listen to model';

        const mrCaption = document.getElementById('model-row-caption');
        if (mrCaption) mrCaption.innerText = lang === 'fr' ? '🎼 Modèle à reproduire' : '🎼 Model to copy';

        const prCaption = document.getElementById('player-row-caption');
        if (prCaption) prCaption.innerText = lang === 'fr' ? '🎹 Ta partition' : '🎹 Your partition';

        setupControls();
        loadSong(0);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
