// Opposites & Comparisons Engine
// Autism Learning Platform - Concrete Pairs of Opposites with Visual Situation Scaffolding.

(() => {
    'use strict';

    let comparisonsData = null;
    let activePairId = 'all'; // 'all' (🎲 Tout mélanger) or specific pair id
    let currentPair = null;
    let currentQuestion = null;
    let currentItems = [];
    let isTransitioning = false;
    let soundEnabled = localStorage.getItem('alp_sound') !== 'false';
    let currentLang = localStorage.getItem('alp_lang') || 'fr';

    const uiStrings = {
        en: {
            title: "⚖️ Opposites & Comparisons",
            home: "⬅️ Home",
            pillAll: "🎲 Mix All Opposites"
        },
        fr: {
            title: "⚖️ Les Contraires & Comparaisons",
            home: "⬅️ Accueil",
            pillAll: "🎲 Tout mélanger"
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
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
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

    function getLabel(obj) {
        if (!obj) return '';
        if (typeof obj === 'object') {
            return obj[currentLang] || obj.fr || obj.en || '';
        }
        return obj || '';
    }

    function speakText(text) {
        if (!soundEnabled || !('speechSynthesis' in window)) return;
        try {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = currentLang === 'fr' ? 'fr-FR' : 'en-US';
            utterance.rate = 0.92;
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
        const t = uiStrings[currentLang] || uiStrings.fr;

        const homeBtn = document.getElementById('home-btn');
        if (homeBtn) homeBtn.innerText = t.home;

        const titleElem = document.getElementById('activity-title');
        if (titleElem) titleElem.innerText = t.title;

        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLang);
        });

        renderConceptPills();
        updatePrompt();
    }

    function setupControls() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.onclick = () => {
                const selected = btn.getAttribute('data-lang');
                if (selected === currentLang) return;
                currentLang = selected;
                localStorage.setItem('alp_lang', currentLang);
                updateUIStaticText();
                renderRound();
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
    }

    function renderConceptPills() {
        const container = document.getElementById('concept-pills');
        if (!container || !comparisonsData) return;
        container.innerHTML = '';

        const t = uiStrings[currentLang] || uiStrings.fr;

        // Mix All Pill
        const allPill = document.createElement('button');
        allPill.className = `routine-pill ${activePairId === 'all' ? 'active' : ''}`;
        allPill.innerText = t.pillAll;
        allPill.onclick = () => {
            if (activePairId === 'all') return;
            activePairId = 'all';
            renderConceptPills();
            renderRound();
        };
        container.appendChild(allPill);

        // Individual Pairs Pills
        comparisonsData.pairs.forEach(p => {
            const pill = document.createElement('button');
            pill.className = `routine-pill ${activePairId === p.id ? 'active' : ''}`;
            pill.innerText = `${p.emoji} ${getLabel(p.title)}`;
            pill.onclick = () => {
                if (activePairId === p.id) return;
                activePairId = p.id;
                renderConceptPills();
                renderRound();
            };
            container.appendChild(pill);
        });
    }

    function renderRound() {
        if (!comparisonsData || !comparisonsData.pairs) return;

        // Select pair
        if (activePairId === 'all') {
            currentPair = comparisonsData.pairs[Math.floor(Math.random() * comparisonsData.pairs.length)];
        } else {
            currentPair = comparisonsData.pairs.find(p => p.id === activePairId) || comparisonsData.pairs[0];
        }

        // Pick a random example variant from the pool of examples (supporting both examples array and legacy format)
        const pool = currentPair.examples || [{ items: currentPair.items, questions: currentPair.questions }];
        const chosenExample = pool[Math.floor(Math.random() * pool.length)];
        const questions = chosenExample.questions || [];
        currentQuestion = questions[Math.floor(Math.random() * questions.length)];
        currentItems = [...chosenExample.items].sort(() => 0.5 - Math.random());
        isTransitioning = false;

        if (window.AlpTracker) {
            window.AlpTracker.onQuestionStart(`comparisons_${currentPair.id}_${currentQuestion.targetTrait}`);
        }

        updatePrompt();
        renderCards();
        speakCurrentPrompt();
    }

    function renderCards() {
        const container = document.getElementById('comparison-cards');
        if (!container || !currentItems) return;
        container.innerHTML = '';

        currentItems.forEach(item => {
            const card = document.createElement('div');
            card.className = `comparison-card ${item.visualClass || ''}`;
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');

            const itemName = getLabel(item.name);
            const traitName = getLabel(item.traitLabel);
            card.setAttribute('aria-label', `${itemName}, ${traitName}`);

            card.innerHTML = `
                <div class="comparison-icon-stage">${item.icon}</div>
                <div class="comparison-card-name">${itemName}</div>
                <div class="comparison-card-badge">${traitName}</div>
            `;

            card.onclick = () => {
                if (isTransitioning) return;

                speakText(itemName);

                const isCorrect = (item.trait === currentQuestion.targetTrait);

                if (isCorrect) {
                    isTransitioning = true;
                    playGentleSuccessSound();
                    card.classList.add('correct');

                    if (window.AlpTracker) {
                        window.AlpTracker.onAttempt(true, item.trait);
                        window.AlpTracker.onTrialSuccess(`comparisons_${currentPair.id}_${currentQuestion.targetTrait}`);
                    }

                    const praiseMsg = getLabel(currentQuestion.praise);
                    const promptElem = document.getElementById('prompt-label');
                    if (promptElem) promptElem.innerText = praiseMsg;

                    setTimeout(() => {
                        speakText(praiseMsg);
                    }, 120);

                    // Advance to next round after celebration
                    setTimeout(() => {
                        renderRound();
                    }, 2400);
                } else {
                    if (window.AlpTracker) {
                        window.AlpTracker.onAttempt(false, item.trait);
                    }
                    card.classList.remove('gentle-retry');
                    void card.offsetWidth;
                    card.classList.add('gentle-retry');
                    playSoftNudgeSound();
                }
            };

            container.appendChild(card);
        });
    }

    function updatePrompt() {
        const promptElem = document.getElementById('prompt-label');
        if (!promptElem || !currentQuestion) return;
        promptElem.innerText = getLabel(currentQuestion.prompt);
    }

    function speakCurrentPrompt() {
        if (currentQuestion) {
            speakText(getLabel(currentQuestion.prompt));
        }
    }

    function init() {
        setupControls();
        updateUIStaticText();

        fetch('data/comparisons.json')
            .then(res => res.json())
            .then(data => {
                comparisonsData = data;
                renderConceptPills();
                renderRound();
            })
            .catch(err => console.error(err));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
