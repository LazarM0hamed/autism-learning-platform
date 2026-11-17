// Sound Identification Engine
// Autism Learning Platform - Auditory Discrimination across 4 Categories with Procedural Synthesizer & MP3 Fallback.

(() => {
    'use strict';

    const SOUND_CATEGORIES = [
        {
            id: 'animals',
            title: { fr: '🐾 Animaux', en: '🐾 Animals' },
            prompt: { fr: 'Écoute bien : quel animal fait ce bruit ?', en: 'Listen closely: which animal makes this sound?' },
            items: [
                { id: 'dog',   icon: '🐶', img: 'assets/photos/dog.svg',   label: { fr: 'Le chien',  en: 'Dog' } },
                { id: 'cat',   icon: '🐱', img: 'assets/photos/cat.svg',   label: { fr: 'Le chat',   en: 'Cat' } },
                { id: 'cow',   icon: '🐮', img: 'assets/photos/cow.svg',   label: { fr: 'La vache',  en: 'Cow' } },
                { id: 'bird',  icon: '🐦', img: 'assets/photos/bird.svg',  label: { fr: "L'oiseau",  en: 'Bird' } },
                { id: 'duck',  icon: '🦆', img: 'assets/photos/duck.svg',  label: { fr: 'Le canard', en: 'Duck' } },
                { id: 'sheep', icon: '🐑', img: 'assets/photos/sheep.svg', label: { fr: 'Le mouton', en: 'Sheep' } }
            ]
        },
        {
            id: 'transport',
            title: { fr: '🚗 Transports', en: '🚗 Transport' },
            prompt: { fr: 'Écoute bien : quel transport fait ce bruit ?', en: 'Listen closely: which vehicle makes this sound?' },
            items: [
                { id: 'train',     icon: '🚂', img: 'assets/photos/train.svg', label: { fr: 'Le train',    en: 'Train' } },
                { id: 'moto',      icon: '🏍️', img: 'assets/photos/bike.svg',  label: { fr: 'La moto',     en: 'Motorbike' } },
                { id: 'car',       icon: '🚗', img: 'assets/photos/car.svg',   label: { fr: 'La voiture',  en: 'Car' } },
                { id: 'plane',     icon: '✈️', img: 'assets/photos/plane.svg', label: { fr: "L'avion",     en: 'Airplane' } },
                { id: 'boat',      icon: '⛵', img: 'assets/photos/boat.svg',  label: { fr: 'Le bateau',   en: 'Boat' } },
                { id: 'firetruck', icon: '🚒', img: 'assets/photos/bus.svg',   label: { fr: 'Les pompiers', en: 'Fire Truck' } }
            ]
        },
        {
            id: 'nature',
            title: { fr: '🌿 Nature', en: '🌿 Nature' },
            prompt: { fr: 'Écoute bien : quel bruit de la nature entends-tu ?', en: 'Listen closely: what nature sound is this?' },
            items: [
                { id: 'sea',   icon: '🌊', img: 'assets/photos/sea.svg',   label: { fr: 'La mer',    en: 'Sea Waves' } },
                { id: 'wind',  icon: '💨', img: 'assets/photos/wind.svg',  label: { fr: 'Le vent',   en: 'Wind' } },
                { id: 'storm', icon: '⛈️', img: 'assets/photos/storm.svg', label: { fr: "L'orage",   en: 'Thunderstorm' } },
                { id: 'rain',  icon: '🌧️', img: 'assets/photos/rain.svg',  label: { fr: 'La pluie',  en: 'Rain' } }
            ]
        },
        {
            id: 'instruments',
            title: { fr: '🎸 Instruments', en: '🎸 Instruments' },
            prompt: { fr: 'Écoute bien : quel instrument joue cette musique ?', en: 'Listen closely: which instrument is playing?' },
            items: [
                { id: 'piano',   icon: '🎹', img: 'assets/photos/piano.svg',   label: { fr: 'Le piano',     en: 'Piano' } },
                { id: 'drum',    icon: '🥁', img: 'assets/photos/drum.svg',    label: { fr: 'Le tambour',   en: 'Drum' } },
                { id: 'guitar',  icon: '🎸', img: 'assets/photos/guitar.svg',  label: { fr: 'La guitare',   en: 'Guitar' } },
                { id: 'trumpet', icon: '🎺', img: 'assets/photos/trumpet.svg', label: { fr: 'La trompette', en: 'Trumpet' } }
            ]
        },
        {
            id: 'all',
            title: { fr: '🎲 Tout mélanger', en: '🎲 Mix All' },
            prompt: { fr: 'Écoute bien : qui fait ce bruit ?', en: 'Listen closely: what makes this sound?' },
            items: []
        }
    ];

    let currentCategory = SOUND_CATEGORIES[0];
    let targetItem = null;
    let lastTargetId = null;
    let activeAudioEl = null;
    let audioCtx = null;
    let isTransitioning = false;
    let soundEnabled = localStorage.getItem('alp_sound') !== 'false';
    let lang = localStorage.getItem('alp_lang') || localStorage.getItem('appLang') || 'fr';

    function getAudioContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
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

    /* Try playing assets/sounds/<id>.mp3 first; fall back to Web Audio synthesizer */
    function playSoundEffect(itemId) {
        if (!soundEnabled) return;
        const heroBtn = document.getElementById('replay-fx-btn');
        if (heroBtn) heroBtn.classList.add('playing');

        if (activeAudioEl) {
            activeAudioEl.pause();
            activeAudioEl = null;
        }

        const audio = new Audio(`assets/sounds/${itemId}.mp3`);
        activeAudioEl = audio;

        audio.onended = () => { if (heroBtn) heroBtn.classList.remove('playing'); };
        audio.onerror = () => {
            const durationMs = synthesizeSound(itemId);
            setTimeout(() => { if (heroBtn) heroBtn.classList.remove('playing'); }, durationMs);
        };

        audio.play().catch(() => {
            const durationMs = synthesizeSound(itemId);
            setTimeout(() => { if (heroBtn) heroBtn.classList.remove('playing'); }, durationMs);
        });
    }

    /* Procedural Web Audio Sound Effects so every item works with zero external MP3s */
    function synthesizeSound(id) {
        const ctx = getAudioContext();
        if (!ctx) return 400;
        const now = ctx.currentTime;

        const createNoise = (duration) => {
            const bufferSize = ctx.sampleRate * duration;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            return noise;
        };

        const tone = (type, freqStart, freqEnd, start, dur, vol = 0.22) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freqStart, now + start);
            if (freqEnd !== freqStart) {
                osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), now + start + dur);
            }
            gain.gain.setValueAtTime(0.001, now + start);
            gain.gain.linearRampToValueAtTime(vol, now + start + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + start);
            osc.stop(now + start + dur + 0.02);
        };

        switch (id) {
            // Animals
            case 'dog':
                tone('sawtooth', 260, 140, 0.0, 0.16, 0.25);
                tone('sawtooth', 280, 130, 0.28, 0.18, 0.25);
                return 600;
            case 'cat':
                tone('triangle', 460, 760, 0.0, 0.35, 0.22);
                tone('triangle', 760, 390, 0.35, 0.55, 0.22);
                return 950;
            case 'cow':
                tone('sawtooth', 135, 150, 0.0, 0.5, 0.2);
                tone('sawtooth', 150, 120, 0.5, 0.6, 0.2);
                return 1150;
            case 'bird':
                [0, 0.22, 0.45].forEach(t => {
                    tone('sine', 2100, 3100, t, 0.08, 0.16);
                    tone('sine', 2900, 2200, t + 0.08, 0.08, 0.16);
                });
                return 750;
            case 'duck':
                [0, 0.28, 0.56].forEach(t => tone('sawtooth', 620, 410, t, 0.18, 0.2));
                return 850;
            case 'sheep':
                for (let i = 0; i < 8; i++) {
                    tone('sawtooth', i % 2 === 0 ? 275 : 245, 255, i * 0.1, 0.09, 0.18);
                }
                return 850;

            // Transport
            case 'train':
                tone('triangle', 587, 587, 0.0, 0.35, 0.22);
                tone('triangle', 740, 740, 0.0, 0.35, 0.18);
                tone('triangle', 587, 587, 0.45, 0.55, 0.22);
                tone('triangle', 740, 740, 0.45, 0.55, 0.18);
                return 1050;
            case 'moto':
                tone('sawtooth', 75, 210, 0.0, 0.45, 0.24);
                tone('sawtooth', 210, 110, 0.45, 0.25, 0.2);
                tone('sawtooth', 110, 260, 0.7, 0.5, 0.25);
                return 1250;
            case 'car':
                tone('square', 440, 440, 0.0, 0.18, 0.14);
                tone('square', 554, 554, 0.0, 0.18, 0.14);
                tone('square', 440, 440, 0.28, 0.25, 0.14);
                tone('square', 554, 554, 0.28, 0.25, 0.14);
                return 650;
            case 'plane':
                tone('triangle', 100, 175, 0.0, 0.7, 0.24);
                tone('triangle', 175, 115, 0.7, 0.6, 0.18);
                return 1350;
            case 'boat':
                tone('sawtooth', 110, 108, 0.0, 1.1, 0.22);
                tone('sine', 165, 162, 0.0, 1.1, 0.22);
                return 1150;
            case 'firetruck':
                tone('triangle', 435, 435, 0.0, 0.35, 0.24);
                tone('triangle', 580, 580, 0.35, 0.35, 0.24);
                tone('triangle', 435, 435, 0.7, 0.35, 0.24);
                tone('triangle', 580, 580, 1.05, 0.35, 0.24);
                return 1450;

            // Nature
            case 'sea': {
                const n = createNoise(1.6);
                const filter = ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(180, now);
                filter.frequency.linearRampToValueAtTime(750, now + 0.8);
                filter.frequency.linearRampToValueAtTime(160, now + 1.6);
                const g = ctx.createGain();
                g.gain.setValueAtTime(0.01, now);
                g.gain.linearRampToValueAtTime(0.32, now + 0.8);
                g.gain.linearRampToValueAtTime(0.01, now + 1.6);
                n.connect(filter); filter.connect(g); g.connect(ctx.destination);
                n.start(now); n.stop(now + 1.6);
                return 1650;
            }
            case 'wind': {
                const n = createNoise(1.5);
                const filter = ctx.createBiquadFilter();
                filter.type = 'bandpass';
                filter.Q.value = 6;
                filter.frequency.setValueAtTime(280, now);
                filter.frequency.exponentialRampToValueAtTime(780, now + 0.75);
                filter.frequency.exponentialRampToValueAtTime(310, now + 1.5);
                const g = ctx.createGain();
                g.gain.setValueAtTime(0.02, now);
                g.gain.linearRampToValueAtTime(0.35, now + 0.7);
                g.gain.linearRampToValueAtTime(0.01, now + 1.5);
                n.connect(filter); filter.connect(g); g.connect(ctx.destination);
                n.start(now); n.stop(now + 1.5);
                return 1550;
            }
            case 'storm': {
                const n = createNoise(1.5);
                const filter = ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(140, now);
                const g = ctx.createGain();
                g.gain.setValueAtTime(0.45, now);
                g.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
                n.connect(filter); filter.connect(g); g.connect(ctx.destination);
                n.start(now); n.stop(now + 1.5);
                return 1550;
            }
            case 'rain': {
                const n = createNoise(1.3);
                const filter = ctx.createBiquadFilter();
                filter.type = 'highpass';
                filter.frequency.value = 1800;
                const g = ctx.createGain();
                g.gain.setValueAtTime(0.14, now);
                g.gain.linearRampToValueAtTime(0.01, now + 1.3);
                n.connect(filter); filter.connect(g); g.connect(ctx.destination);
                n.start(now); n.stop(now + 1.3);
                return 1350;
            }

            // Musical Instruments
            case 'piano':
                [261.6, 329.6, 392.0, 523.2].forEach((f, i) => tone('triangle', f, f, i * 0.22, 0.55, 0.26));
                return 1150;
            case 'drum':
                [0, 0.3, 0.6, 0.78].forEach(t => tone('sine', 150, 42, t, 0.22, 0.38));
                return 1050;
            case 'guitar':
                [196.0, 246.9, 293.7, 392.0].forEach((f, i) => tone('sawtooth', f, f, i * 0.08, 0.85, 0.14));
                return 1000;
            case 'trumpet':
                [392.0, 523.2, 659.3, 784.0].forEach((f, i) => tone('sawtooth', f, f, i * 0.2, i === 3 ? 0.5 : 0.18, 0.18));
                return 1150;
            default:
                tone('sine', 440, 440, 0, 0.4, 0.2);
                return 450;
        }
    }

    function renderCategoryPills() {
        const container = document.getElementById('sound-category-pills');
        if (!container) return;
        container.innerHTML = '';
        SOUND_CATEGORIES.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'routine-pill' + (cat.id === currentCategory.id ? ' active' : '');
            btn.innerText = cat.title[lang] || cat.title.fr;
            btn.onclick = () => {
                currentCategory = cat;
                lastTargetId = null;
                startRound();
            };
            container.appendChild(btn);
        });
    }

    function startRound() {
        isTransitioning = false;
        renderCategoryPills();

        const fullPool = currentCategory.id === 'all'
            ? SOUND_CATEGORIES.filter(c => c.id !== 'all').flatMap(c => c.items)
            : currentCategory.items;

        // Pick target item avoiding direct immediate repetition
        const pool = fullPool.filter(i => i.id !== lastTargetId);
        targetItem = pool[Math.floor(Math.random() * pool.length)];
        lastTargetId = targetItem.id;

        if (window.AlpTracker) {
            window.AlpTracker.onQuestionStart(`sounds_${currentCategory.id}_${targetItem.id}`);
        }

        const promptText = currentCategory.prompt[lang] || currentCategory.prompt.fr;
        const promptEl = document.getElementById('prompt-label');
        if (promptEl) promptEl.innerText = promptText;

        const replayTextEl = document.getElementById('replay-fx-text');
        if (replayTextEl) replayTextEl.innerText = lang === 'fr' ? 'Écouter le son' : 'Listen to sound';

        // Pick 2 distractors and shuffle 3 choices
        const distractors = fullPool
            .filter(i => i.id !== targetItem.id)
            .sort(() => 0.5 - Math.random())
            .slice(0, 2);
        const choices = [targetItem, ...distractors].sort(() => 0.5 - Math.random());

        const grid = document.getElementById('options-container');
        if (!grid) return;
        grid.innerHTML = '';

        choices.forEach(item => {
            const card = document.createElement('div');
            card.className = 'sound-card';
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            const itemLabel = item.label[lang] || item.label.fr;
            card.setAttribute('aria-label', itemLabel);

            const visual = document.createElement('div');
            visual.className = 'sound-card-visual';
            const img = document.createElement('img');
            img.src = item.img;
            img.alt = itemLabel;
            img.onerror = () => { visual.innerHTML = item.icon; };
            visual.appendChild(img);
            card.appendChild(visual);

            const lbl = document.createElement('div');
            lbl.className = 'sound-card-label';
            lbl.innerText = itemLabel;
            card.appendChild(lbl);

            card.onclick = () => {
                if (isTransitioning) return;

                if (item.id === targetItem.id) {
                    isTransitioning = true;
                    card.classList.add('correct');

                    if (window.AlpTracker) {
                        window.AlpTracker.onAttempt(true, item.id);
                        window.AlpTracker.onTrialSuccess(`sounds_${currentCategory.id}_${targetItem.id}`);
                    }

                    const praise = lang === 'fr'
                        ? `Bravo ! C'est ${item.label.fr.toLowerCase()} !`
                        : `Great job! That is the ${item.label.en.toLowerCase()}!`;
                    speak(praise);
                    setTimeout(startRound, 2000);
                } else {
                    if (window.AlpTracker) {
                        window.AlpTracker.onAttempt(false, item.id);
                    }
                    card.classList.remove('gentle-retry');
                    void card.offsetWidth;
                    card.classList.add('gentle-retry');
                    // Gentle support: replay target sound without harsh buzzers
                    playSoundEffect(targetItem.id);
                }
            };
            grid.appendChild(card);
        });

        // Automatically play target sound effect shortly after prompt
        setTimeout(() => playSoundEffect(targetItem.id), 350);
    }

    function setupControls() {
        document.getElementById('replay-fx-btn')?.addEventListener('click', () => {
            if (targetItem) playSoundEffect(targetItem.id);
        });

        document.getElementById('speak-prompt-btn')?.addEventListener('click', () => {
            speak(currentCategory.prompt[lang] || currentCategory.prompt.fr);
        });

        const soundBtn = document.getElementById('sound-toggle-btn');
        if (soundBtn) {
            soundBtn.innerText = soundEnabled ? '🔊' : '🔇';
            soundBtn.onclick = () => {
                soundEnabled = !soundEnabled;
                localStorage.setItem('alp_sound', soundEnabled);
                soundBtn.innerText = soundEnabled ? '🔊' : '🔇';
                if (soundEnabled && targetItem) playSoundEffect(targetItem.id);
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
                if (titleEl) titleEl.innerText = lang === 'fr' ? '🔊 Reconnaître les sons' : '🔊 Identify Sounds';

                startRound();
            };
        });
    }

    function init() {
        setupControls();
        startRound();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
