// Colors Engine
(() => {
    let colorItems = [];
    let currentTarget = null;
    let previousTargetId = null;
    let isTransitioning = false;
    let soundEnabled = localStorage.getItem('alp_sound') !== 'false';
    let currentLang = localStorage.getItem('alp_lang') || 'en';
    let optionCount = parseInt(localStorage.getItem('alp_options') || '3', 10);

    const uiStrings = {
        en: {
            title: "🎨 Colors",
            home: "⬅️ Home",
            promptPrefix: "Find the color:",
            choices: "Choices:"
        },
        fr: {
            title: "🎨 Couleurs",
            home: "⬅️ Accueil",
            promptPrefix: "Trouve la couleur :",
            choices: "Choix :"
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
        const homeBtn = document.getElementById('home-btn');
        if (homeBtn) homeBtn.innerText = t.home;
        const choicesLabel = document.getElementById('choices-label');
        if (choicesLabel) choicesLabel.innerText = t.choices;

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
                if (currentTarget) {
                    updatePrompt();
                    speakPrompt();
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

        const pills = document.querySelectorAll('.difficulty-pill');
        pills.forEach(pill => {
            const count = parseInt(pill.getAttribute('data-count'), 10);
            if (count === optionCount) pill.classList.add('active');

            pill.onclick = () => {
                pills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                optionCount = count;
                localStorage.setItem('alp_options', count);
                loadRound();
            };
        });
    }

    function speakPrompt() {
        if (!currentTarget) return;
        const t = uiStrings[currentLang] || uiStrings.en;
        speakText(`${t.promptPrefix} ${getItemLabel(currentTarget)}`);
    }

    function updatePrompt() {
        const promptElem = document.getElementById('prompt-label');
        if (promptElem && currentTarget) {
            const t = uiStrings[currentLang] || uiStrings.en;
            promptElem.innerText = `${t.promptPrefix} ${getItemLabel(currentTarget)}`;
        }
    }

    function init() {
        setupControls();
        updateUIStaticText();

        fetch('data/colors.json')
            .then(res => res.json())
            .then(data => {
                colorItems = data.items || [];
                if (colorItems.length > 0) {
                    loadRound();
                }
            })
            .catch(err => console.error(err));
    }

    function loadRound() {
        if (!colorItems.length) return;
        isTransitioning = false;

        let candidates = colorItems.length > 1
            ? colorItems.filter(c => c.id !== previousTargetId)
            : colorItems;
        currentTarget = candidates[Math.floor(Math.random() * candidates.length)];
        previousTargetId = currentTarget.id;

        if (window.AlpTracker) {
            window.AlpTracker.onQuestionStart(currentTarget.id);
        }

        updatePrompt();

        const container = document.getElementById('options-container');
        if (!container) return;
        container.innerHTML = '';

        const distractors = colorItems.filter(c => c.id !== currentTarget.id).sort(() => 0.5 - Math.random());
        const selectedDistractors = distractors.slice(0, Math.min(distractors.length, optionCount - 1));
        const roundChoices = [currentTarget, ...selectedDistractors].sort(() => 0.5 - Math.random());

        roundChoices.forEach(item => {
            const card = document.createElement('div');
            card.className = 'option-card';
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');

            const labelText = getItemLabel(item);
            card.innerHTML = `
                <img class="option-img" src="${item.image}" alt="${labelText}">
                <span class="option-label" style="font-size: 1.25rem;">${labelText}</span>
            `;

            card.onclick = () => {
                if (isTransitioning) return;

                if (item.id === currentTarget.id) {
                    isTransitioning = true;
                    if (window.AlpTracker) {
                        window.AlpTracker.onAttempt(true, item.id);
                        window.AlpTracker.onTrialSuccess(item.id);
                    }
                    card.classList.add('success');
                    playGentleSuccessSound();
                    speakText(labelText);

                    setTimeout(() => {
                        loadRound();
                    }, 1400);
                } else {
                    if (window.AlpTracker) {
                        window.AlpTracker.onAttempt(false, item.id);
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

        speakPrompt();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
