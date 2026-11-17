// Universal Find & Match Game Engine with Multi-Category Mixing, Filtering & Bilingual Accommodations
(() => {
    'use strict';

    // Registered Categories for Find & Match
    const CATEGORIES = [
        { id: 'all', emoji: '🌟', label: { en: 'All Categories', fr: 'Tout mélanger' } },
        { id: 'transport', emoji: '🚗', label: { en: 'Transport', fr: 'Transports' }, file: 'transport.json' },
        { id: 'animals', emoji: '🐶', label: { en: 'Animals', fr: 'Animaux' }, file: 'animals.json' },
        { id: 'routines', emoji: '🦷', label: { en: 'Daily Routines', fr: 'Routines' }, file: 'routines.json' },
        { id: 'numbers', emoji: '🔢', label: { en: 'Numbers', fr: 'Nombres' }, file: 'numbers.json' },
        { id: 'fruits', emoji: '🍎', label: { en: 'Fruits', fr: 'Fruits' }, file: 'fruits.json' },
        { id: 'shapes', emoji: '🔺', label: { en: 'Shapes', fr: 'Formes' }, file: 'shapes.json' },
        { id: 'clothes', emoji: '👕', label: { en: 'Clothes', fr: 'Vêtements' }, file: 'clothes.json' }
    ];

    // State
    let selectedCategoryId = 'all';
    let categoryCache = {};
    let allCategoryItems = [];
    let allItems = [];
    let currentTarget = null;
    let previousTargetId = null;
    let isTransitioning = false;
    let soundEnabled = localStorage.getItem('alp_sound') !== 'false';
    let currentLang = localStorage.getItem('alp_lang') || 'en';
    let optionCount = parseInt(localStorage.getItem('alp_options') || '3', 10);
    let currentRoundOptions = [];

    // UI Translations
    const uiStrings = {
        en: {
            home: "⬅️ Home",
            choices: "Choices:",
            empty: "No items found in this category.",
            error: "Category coming soon!",
            allTitle: "🌟 All Categories"
        },
        fr: {
            home: "⬅️ Accueil",
            choices: "Choix :",
            empty: "Aucun élément dans cette catégorie.",
            error: "Catégorie bientôt disponible !",
            allTitle: "🌟 Tout mélanger"
        }
    };

    // Audio Context (Web Audio API for gentle chimes)
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

    // Play a gentle, soothing musical chime on correct answer
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

    // Gentle low woodblock tone for soft nudge
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

    // Bilingual Helpers
    function getItemLabel(item, lang = currentLang) {
        if (!item) return '';
        if (typeof item.label === 'object' && item.label !== null) {
            return item.label[lang] || item.label.en || item.label.fr || '';
        }
        return item.label || '';
    }

    function getCategoryName(data, lang = currentLang) {
        if (!data) return '';
        if (typeof data.categoryName === 'object' && data.categoryName !== null) {
            return data.categoryName[lang] || data.categoryName.en || data.categoryName.fr || '';
        }
        return data.categoryName || '';
    }

    function getPromptText(item, lang = currentLang) {
        const label = getItemLabel(item, lang);
        if (lang === 'fr') {
            return `Trouve : ${label}`;
        }
        return `Find the ${label}`;
    }

    // Text to Speech Helper with French / English voice matching
    function speakText(text, lang = currentLang) {
        if (!soundEnabled || !('speechSynthesis' in window)) return;
        try {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang === 'fr' ? 'fr-FR' : 'en-US';
            utterance.rate = 0.9;
            utterance.pitch = 1.05;

            const voices = window.speechSynthesis.getVoices();
            const voicePrefix = lang === 'fr' ? 'fr' : 'en';
            const matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith(voicePrefix));
            if (matchedVoice) {
                utterance.voice = matchedVoice;
            }

            window.speechSynthesis.speak(utterance);
        } catch (e) {
            console.warn('Speech synthesis error:', e);
        }
    }

    // Render in-activity category filter pills
    function renderCategoryFilterPills() {
        const container = document.getElementById('category-filter-pills');
        if (!container) return;
        container.innerHTML = '';

        CATEGORIES.forEach(cat => {
            const pill = document.createElement('button');
            pill.className = `routine-pill ${selectedCategoryId === cat.id ? 'active' : ''}`;
            const labelText = cat.label[currentLang] || cat.label.en;
            pill.innerText = `${cat.emoji} ${labelText}`;
            pill.setAttribute('data-category', cat.id);

            pill.onclick = () => {
                if (selectedCategoryId === cat.id) return;
                switchCategory(cat.id);
            };

            container.appendChild(pill);
        });
    }

    // Switch Category filter
    function switchCategory(catId) {
        selectedCategoryId = catId;

        // Update pills
        document.querySelectorAll('#category-filter-pills .routine-pill').forEach(pill => {
            pill.classList.toggle('active', pill.getAttribute('data-category') === selectedCategoryId);
        });

        // Set active items pool
        if (selectedCategoryId === 'all') {
            allItems = allCategoryItems;
        } else if (categoryCache[selectedCategoryId] && categoryCache[selectedCategoryId].items) {
            allItems = categoryCache[selectedCategoryId].items;
        } else {
            allItems = allCategoryItems;
        }

        updateCategoryTitle();

        // Update URL state cleanly without reload
        if (window.history && window.history.replaceState) {
            const newUrl = selectedCategoryId === 'all' ? 'game.html' : `game.html?category=${selectedCategoryId}`;
            window.history.replaceState(null, '', newUrl);
        }

        previousTargetId = null;
        loadNextRound();
    }

    function updateCategoryTitle() {
        const titleElem = document.getElementById('category-title');
        if (!titleElem) return;

        if (selectedCategoryId === 'all') {
            const t = uiStrings[currentLang] || uiStrings.en;
            titleElem.innerText = t.allTitle;
        } else if (categoryCache[selectedCategoryId]) {
            const data = categoryCache[selectedCategoryId];
            const name = getCategoryName(data, currentLang);
            titleElem.innerText = `${data.categoryEmoji || ''} ${name}`;
        }
    }

    function updateUIStaticText() {
        document.documentElement.lang = currentLang;
        const t = uiStrings[currentLang] || uiStrings.en;

        const homeBtn = document.getElementById('home-btn');
        if (homeBtn) homeBtn.innerText = t.home;

        const choicesLabel = document.getElementById('choices-label');
        if (choicesLabel) choicesLabel.innerText = t.choices;

        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLang);
        });

        renderCategoryFilterPills();
        updateCategoryTitle();
    }

    // Setup controls (language switcher, sound toggle, repeat prompt, difficulty)
    function setupControls() {
        // Language Buttons
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.onclick = () => {
                const selected = btn.getAttribute('data-lang');
                if (selected === currentLang) return;
                currentLang = selected;
                localStorage.setItem('alp_lang', currentLang);

                updateUIStaticText();

                if (currentTarget) {
                    const promptLabel = document.getElementById('prompt-label');
                    if (promptLabel) promptLabel.innerText = getPromptText(currentTarget, currentLang);
                    speakText(getPromptText(currentTarget, currentLang));
                }

                // Update card labels without resetting round
                if (currentRoundOptions.length > 0) {
                    renderOptions(currentRoundOptions);
                }
            };
        });

        // Sound Toggle
        const soundBtn = document.getElementById('sound-toggle-btn');
        if (soundBtn) {
            soundBtn.innerText = soundEnabled ? '🔊' : '🔇';
            soundBtn.setAttribute('aria-label', soundEnabled ? 'Sound is on' : 'Sound is muted');
            soundBtn.onclick = () => {
                soundEnabled = !soundEnabled;
                localStorage.setItem('alp_sound', soundEnabled);
                soundBtn.innerText = soundEnabled ? '🔊' : '🔇';
                soundBtn.setAttribute('aria-label', soundEnabled ? 'Sound is on' : 'Sound is muted');
                if (soundEnabled && currentTarget) {
                    speakText(getPromptText(currentTarget, currentLang));
                } else if (!soundEnabled && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                }
            };
        }

        // Repeat prompt
        const speakBtn = document.getElementById('speak-prompt-btn');
        if (speakBtn) {
            speakBtn.onclick = () => {
                if (currentTarget) {
                    speakText(getPromptText(currentTarget, currentLang));
                }
            };
        }

        // Difficulty pills (2, 3, 4 options)
        const pills = document.querySelectorAll('.difficulty-pill');
        pills.forEach(pill => {
            const count = parseInt(pill.getAttribute('data-count'), 10);
            if (count === optionCount) pill.classList.add('active');

            pill.onclick = () => {
                pills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                optionCount = count;
                localStorage.setItem('alp_options', count);
                loadNextRound();
            };
        });

        // Ensure voices are loaded for SpeechSynthesis
        if ('speechSynthesis' in window) {
            window.speechSynthesis.onvoiceschanged = () => {
                window.speechSynthesis.getVoices();
            };
        }
    }

    // Load next round
    function loadNextRound() {
        if (!allItems.length) return;
        isTransitioning = false;

        let candidates = allItems.length > 1 
            ? allItems.filter(item => item.id !== previousTargetId) 
            : allItems;
        currentTarget = candidates[Math.floor(Math.random() * candidates.length)];
        previousTargetId = currentTarget.id;

        if (window.AlpTracker) {
            window.AlpTracker.onQuestionStart(currentTarget.id);
        }

        const promptLabel = document.getElementById('prompt-label');
        if (promptLabel) {
            promptLabel.innerText = getPromptText(currentTarget, currentLang);
        }

        speakText(getPromptText(currentTarget, currentLang));

        const distractors = allItems.filter(item => item.id !== currentTarget.id);
        const shuffledDistractors = distractors.sort(() => 0.5 - Math.random());
        const selectedDistractors = shuffledDistractors.slice(0, Math.min(distractors.length, optionCount - 1));

        currentRoundOptions = [currentTarget, ...selectedDistractors].sort(() => 0.5 - Math.random());

        renderOptions(currentRoundOptions);
    }

    // Render option cards
    function renderOptions(options) {
        const container = document.getElementById('options-container');
        if (!container) return;
        container.innerHTML = '';

        options.forEach(item => {
            const card = document.createElement('div');
            card.className = 'option-card';
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');

            const itemLabel = getItemLabel(item, currentLang);
            card.setAttribute('aria-label', itemLabel);

            if (item.image) {
                const img = document.createElement('img');
                img.className = 'option-img';
                img.src = item.image;
                img.alt = itemLabel;
                img.onerror = () => {
                    img.style.display = 'none';
                };
                card.appendChild(img);
            }

            const labelSpan = document.createElement('span');
            labelSpan.className = 'option-label';
            labelSpan.innerText = itemLabel;
            card.appendChild(labelSpan);

            const handleSelection = () => {
                if (isTransitioning) return;

                if (item.id === currentTarget.id) {
                    isTransitioning = true;
                    if (window.AlpTracker) {
                        window.AlpTracker.onAttempt(true, item.id);
                        window.AlpTracker.onTrialSuccess(item.id);
                    }
                    card.classList.add('success');
                    playGentleSuccessSound();
                    speakText(itemLabel);

                    setTimeout(() => {
                        loadNextRound();
                    }, 1400);
                } else {
                    if (window.AlpTracker) {
                        window.AlpTracker.onAttempt(false, item.id);
                    }
                    card.classList.remove('gentle-retry');
                    void card.offsetWidth;
                    card.classList.add('gentle-retry');
                    playSoftNudgeSound();
                    speakText(itemLabel);
                }
            };

            card.onclick = handleSelection;
            card.onkeydown = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelection();
                }
            };

            container.appendChild(card);
        });
    }

    // Initialize Game & Preload Categories
    function init() {
        const urlParams = new URLSearchParams(window.location.search);
        selectedCategoryId = urlParams.get('category') || 'all';

        setupControls();
        updateUIStaticText();

        const fileCategories = CATEGORIES.filter(c => c.file);
        const fetchPromises = fileCategories.map(c => 
            fetch(`data/${c.file}`)
                .then(res => {
                    if (!res.ok) throw new Error(`Category ${c.id} not found`);
                    return res.json();
                })
                .then(data => ({ id: c.id, data }))
        );

        Promise.all(fetchPromises)
            .then(results => {
                allCategoryItems = [];
                results.forEach(({ id, data }) => {
                    categoryCache[id] = data;
                    if (Array.isArray(data.items)) {
                        allCategoryItems.push(...data.items);
                    }
                });

                // Apply initial category selection
                if (selectedCategoryId === 'all') {
                    allItems = allCategoryItems;
                } else if (categoryCache[selectedCategoryId] && categoryCache[selectedCategoryId].items) {
                    allItems = categoryCache[selectedCategoryId].items;
                } else {
                    selectedCategoryId = 'all';
                    allItems = allCategoryItems;
                }

                renderCategoryFilterPills();
                updateCategoryTitle();

                if (allItems.length === 0) {
                    const t = uiStrings[currentLang] || uiStrings.en;
                    document.getElementById('prompt-label').innerText = t.empty;
                    return;
                }

                loadNextRound();
            })
            .catch(err => {
                console.error('Error preloading categories:', err);
                const t = uiStrings[currentLang] || uiStrings.en;
                const promptElem = document.getElementById('prompt-label');
                if (promptElem) promptElem.innerText = t.error;
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
