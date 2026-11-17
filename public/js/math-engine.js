// Basic Math & Visual Counting Engine
(() => {
    let mode = 'counting'; // 'counting' | 'addition'
    let currentTargetNumber = 1;
    let isTransitioning = false;
    let soundEnabled = localStorage.getItem('alp_sound') !== 'false';
    let currentLang = localStorage.getItem('alp_lang') || 'en';

    const itemsPool = [
        { id: 'apple', label: { en: 'apple', fr: 'pomme' }, image: 'assets/photos/apple.svg' },
        { id: 'star', label: { en: 'star', fr: 'étoile' }, image: 'assets/photos/star.svg' },
        { id: 'duck', label: { en: 'duck', fr: 'canard' }, image: 'assets/photos/duck.svg' },
        { id: 'heart', label: { en: 'heart', fr: 'cœur' }, image: 'assets/photos/heart.svg' },
        { id: 'cat', label: { en: 'cat', fr: 'chat' }, image: 'assets/photos/cat.svg' }
    ];

    const uiStrings = {
        en: {
            title: "🔢 Counting & Math",
            home: "⬅️ Home",
            countMode: "🍎 Counting",
            addMode: "➕ Simple Addition",
            countPrompt: "How many?",
            addPrompt: "How many in total?"
        },
        fr: {
            title: "🔢 Compter & Petits Calculs",
            home: "⬅️ Accueil",
            countMode: "🍎 Compter",
            addMode: "➕ Addition simple",
            countPrompt: "Combien y en a-t-il ?",
            addPrompt: "Combien au total ?"
        }
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

    function playGentleSuccessSound() {
        if (!soundEnabled) return;
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const notes = [523.25, 659.25, 783.99];
        notes.forEach((freq, index) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + (index * 0.08));
            gain.gain.setValueAtTime(0, now + (index * 0.08));
            gain.gain.linearRampToValueAtTime(0.12, now + (index * 0.08) + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, now + (index * 0.08) + 0.5);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + (index * 0.08));
            osc.stop(now + (index * 0.08) + 0.55);
        });
    }

    function playSoftNudgeSound() {
        if (!soundEnabled) return;
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.15);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
    }

    function playPopTone(pitchMultiplier = 1) {
        if (!soundEnabled) return;
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440 * pitchMultiplier, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
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

    function updateUIStaticText() {
        document.documentElement.lang = currentLang;
        const t = uiStrings[currentLang] || uiStrings.en;
        const titleElem = document.getElementById('activity-title');
        if (titleElem) titleElem.innerText = t.title;
        const homeBtn = document.getElementById('home-btn');
        if (homeBtn) homeBtn.innerText = t.home;

        const countBtn = document.getElementById('mode-count-btn');
        if (countBtn) countBtn.innerText = t.countMode;
        const addBtn = document.getElementById('mode-add-btn');
        if (addBtn) addBtn.innerText = t.addMode;

        const promptElem = document.getElementById('prompt-label');
        if (promptElem) {
            promptElem.innerText = mode === 'counting' ? t.countPrompt : t.addPrompt;
        }

        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLang);
        });
    }

    function setupControls() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.onclick = () => {
                const selected = btn.getAttribute('data-lang');
                if (selected === currentLang) return;
                currentLang = selected;
                localStorage.setItem('alp_lang', currentLang);
                updateUIStaticText();
                loadRound();
            };
        });

        const countBtn = document.getElementById('mode-count-btn');
        const addBtn = document.getElementById('mode-add-btn');
        if (countBtn && addBtn) {
            countBtn.onclick = () => {
                if (mode === 'counting') return;
                mode = 'counting';
                countBtn.classList.add('active');
                addBtn.classList.remove('active');
                updateUIStaticText();
                loadRound();
            };
            addBtn.onclick = () => {
                if (mode === 'addition') return;
                mode = 'addition';
                addBtn.classList.add('active');
                countBtn.classList.remove('active');
                updateUIStaticText();
                loadRound();
            };
        }

        const soundBtn = document.getElementById('sound-toggle-btn');
        if (soundBtn) {
            soundBtn.innerText = soundEnabled ? '🔊' : '🔇';
            soundBtn.onclick = () => {
                soundEnabled = !soundEnabled;
                localStorage.setItem('alp_sound', soundEnabled);
                soundBtn.innerText = soundEnabled ? '🔊' : '🔇';
                if (soundEnabled) speakPrompt();
                else if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            };
        }

        const speakBtn = document.getElementById('speak-prompt-btn');
        if (speakBtn) {
            speakBtn.onclick = () => {
                speakPrompt();
            };
        }
    }

    function speakPrompt() {
        const t = uiStrings[currentLang] || uiStrings.en;
        speakText(mode === 'counting' ? t.countPrompt : t.addPrompt);
    }

    function init() {
        setupControls();
        updateUIStaticText();
        loadRound();
    }

    function loadRound() {
        isTransitioning = false;
        const display = document.getElementById('math-display');
        if (!display) return;
        display.innerHTML = '';

        const itemObj = itemsPool[Math.floor(Math.random() * itemsPool.length)];

        if (mode === 'counting') {
            // Pick a count between 1 and 5
            currentTargetNumber = Math.floor(Math.random() * 5) + 1;

            for (let i = 1; i <= currentTargetNumber; i++) {
                const img = document.createElement('img');
                img.className = 'math-item';
                img.src = itemObj.image;
                img.alt = `${i}`;
                img.title = `Tap to count`;

                img.onclick = () => {
                    playPopTone(1 + (i * 0.15));
                    speakText(`${i}`);
                    img.style.transform = 'scale(1.25)';
                    setTimeout(() => { img.style.transform = 'scale(1)'; }, 200);
                };

                display.appendChild(img);
            }
        } else {
            // Addition mode: a + b <= 5
            const a = Math.floor(Math.random() * 3) + 1; // 1 to 3
            const b = Math.floor(Math.random() * 2) + 1; // 1 to 2
            currentTargetNumber = a + b;

            // Group A
            for (let i = 0; i < a; i++) {
                const img = document.createElement('img');
                img.className = 'math-item';
                img.src = itemObj.image;
                display.appendChild(img);
            }

            // Plus operator
            const plus = document.createElement('span');
            plus.className = 'math-operator';
            plus.innerText = '+';
            display.appendChild(plus);

            // Group B
            for (let i = 0; i < b; i++) {
                const img = document.createElement('img');
                img.className = 'math-item';
                img.src = itemObj.image;
                display.appendChild(img);
            }

            // Equals operator
            const equals = document.createElement('span');
            equals.className = 'math-operator';
            equals.innerText = '=';
            display.appendChild(equals);

            const question = document.createElement('span');
            question.className = 'math-operator';
            question.style.color = '#3B82F6';
            question.innerText = '?';
            display.appendChild(question);
        }

        renderNumberOptions(currentTargetNumber);
        speakPrompt();
    }

    function renderNumberOptions(targetNum) {
        if (window.AlpTracker) {
            window.AlpTracker.onQuestionStart(`num_${targetNum}`);
        }

        const container = document.getElementById('options-container');
        if (!container) return;
        container.innerHTML = '';

        // Select 2 distractors from 1..5
        const allNums = [1, 2, 3, 4, 5];
        const distractors = allNums.filter(n => n !== targetNum).sort(() => 0.5 - Math.random()).slice(0, 2);
        const options = [targetNum, ...distractors].sort((a, b) => a - b);

        options.forEach(num => {
            const card = document.createElement('div');
            card.className = 'option-card';
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');

            card.innerHTML = `
                <img class="option-img" src="assets/photos/number-${num}.svg" alt="${num}">
                <span class="option-label" style="font-size: 1.4rem;">${num}</span>
            `;

            card.onclick = () => {
                if (isTransitioning) return;

                if (num === targetNum) {
                    isTransitioning = true;
                    if (window.AlpTracker) {
                        window.AlpTracker.onAttempt(true, num);
                        window.AlpTracker.onTrialSuccess(`num_${targetNum}`);
                    }
                    card.classList.add('success');
                    playGentleSuccessSound();
                    speakText(`${num}!`);

                    setTimeout(() => {
                        loadRound();
                    }, 1400);
                } else {
                    if (window.AlpTracker) {
                        window.AlpTracker.onAttempt(false, num);
                    }
                    card.classList.remove('gentle-retry');
                    void card.offsetWidth;
                    card.classList.add('gentle-retry');
                    playSoftNudgeSound();
                    speakText(`${num}`);
                }
            };

            container.appendChild(card);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
