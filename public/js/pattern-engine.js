// Suite / Pattern Engine
(() => {
    let patterns = [];
    let currentIndex = 0;
    let currentPattern = null;
    let isTransitioning = false;
    let soundEnabled = localStorage.getItem('alp_sound') !== 'false';
    let currentLang = localStorage.getItem('alp_lang') || 'en';

    const uiStrings = {
        en: {
            title: "🧩 Complete the Pattern",
            prompt: "What comes next?",
            home: "⬅️ Home",
            goodJob: "Great job!"
        },
        fr: {
            title: "🧩 Complète la suite",
            prompt: "Quelle est la suite ?",
            home: "⬅️ Accueil",
            goodJob: "Bravo !"
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

    function getItemLabel(item) {
        if (!item) return '';
        if (typeof item.label === 'object') {
            return item.label[currentLang] || item.label.en || item.label.fr || '';
        }
        return item.label || '';
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
        const promptElem = document.getElementById('prompt-label');
        if (promptElem) promptElem.innerText = t.prompt;
        const homeBtn = document.getElementById('home-btn');
        if (homeBtn) homeBtn.innerText = t.home;

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
                if (currentPattern) {
                    renderPatternRound();
                    speakText(uiStrings[currentLang].prompt);
                }
            };
        });

        const soundBtn = document.getElementById('sound-toggle-btn');
        if (soundBtn) {
            soundBtn.innerText = soundEnabled ? '🔊' : '🔇';
            soundBtn.onclick = () => {
                soundEnabled = !soundEnabled;
                localStorage.setItem('alp_sound', soundEnabled);
                soundBtn.innerText = soundEnabled ? '🔊' : '🔇';
                if (soundEnabled) speakText(uiStrings[currentLang].prompt);
                else if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            };
        }

        const speakBtn = document.getElementById('speak-prompt-btn');
        if (speakBtn) {
            speakBtn.onclick = () => {
                speakText(uiStrings[currentLang].prompt);
            };
        }
    }

    function init() {
        setupControls();
        updateUIStaticText();

        fetch('data/patterns.json')
            .then(res => res.json())
            .then(data => {
                patterns = data.patterns || [];
                if (patterns.length > 0) {
                    currentIndex = 0;
                    renderPatternRound();
                }
            })
            .catch(err => console.error(err));
    }

    function renderPatternRound() {
        if (!patterns.length) return;
        isTransitioning = false;
        currentPattern = patterns[currentIndex % patterns.length];

        if (window.AlpTracker && currentPattern.target) {
            window.AlpTracker.onQuestionStart(currentPattern.target.id);
        }

        const track = document.getElementById('pattern-track');
        if (!track) return;
        track.innerHTML = '';

        // Render given items
        currentPattern.sequence.forEach(item => {
            const slot = document.createElement('div');
            slot.className = 'pattern-slot';
            slot.innerHTML = `<img src="${item.image}" alt="${getItemLabel(item)}">`;
            track.appendChild(slot);
        });

        // Render missing target slot
        const missingSlot = document.createElement('div');
        missingSlot.className = 'pattern-slot missing';
        missingSlot.id = 'missing-slot';
        missingSlot.innerText = '❓';
        track.appendChild(missingSlot);

        // Render options
        const container = document.getElementById('options-container');
        if (!container) return;
        container.innerHTML = '';

        const allOptions = [currentPattern.target, ...currentPattern.distractors].sort(() => 0.5 - Math.random());

        allOptions.forEach(opt => {
            const card = document.createElement('div');
            card.className = 'option-card';
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');

            const labelText = getItemLabel(opt);
            card.innerHTML = `
                <img class="option-img" src="${opt.image}" alt="${labelText}">
                <span class="option-label">${labelText}</span>
            `;

            card.onclick = () => {
                if (isTransitioning) return;

                if (opt.id === currentPattern.target.id) {
                    isTransitioning = true;
                    if (window.AlpTracker) {
                        window.AlpTracker.onAttempt(true, opt.id);
                        window.AlpTracker.onTrialSuccess(opt.id);
                    }
                    card.classList.add('success');
                    playGentleSuccessSound();

                    // Fill missing slot
                    missingSlot.classList.remove('missing');
                    missingSlot.innerHTML = `<img src="${opt.image}" alt="${labelText}">`;

                    speakText(`${labelText}!`);

                    setTimeout(() => {
                        currentIndex++;
                        renderPatternRound();
                    }, 1400);
                } else {
                    if (window.AlpTracker) {
                        window.AlpTracker.onAttempt(false, opt.id);
                    }
                    card.classList.remove('gentle-retry');
                    void card.offsetWidth;
                    card.classList.add('gentle-retry');
                    playSoftNudgeSound();
                    speakText(labelText);
                }
            };

            container.appendChild(card);
        });

        speakText(uiStrings[currentLang].prompt);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
