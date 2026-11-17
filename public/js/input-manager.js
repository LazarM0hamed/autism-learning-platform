// Accessible Universal Input Manager for Autism Learning Platform
// Supports 4 Primary Buttons + Enter (Validate) + Escape (Return/Quit)
// Supports Pedagogical Visual Size Profiles (Normal, Large, Extra Large)
// Works with USB HID Keyboards, Custom Macro Pads (RP2040/Arduino), and Gamepads.

(() => {
    'use strict';

    // Configuration & LocalStorage Keys
    const STORAGE_KEY_OVERLAY = 'alp_controller_overlay';
    const STORAGE_KEY_NAV_MODE = 'alp_controller_nav_mode';
    const STORAGE_KEY_SIZE = 'alp_size_profile';
    const STORAGE_KEY_HUD_COLLAPSED = 'alp_controller_hud_collapsed';

    let overlayMode = localStorage.getItem(STORAGE_KEY_OVERLAY) || 'contextual';
    let navMode = localStorage.getItem(STORAGE_KEY_NAV_MODE) || 'cursor'; // 'cursor' (Move & Enter) or 'direct' (1-4 Direct Action)
    let sizeProfile = localStorage.getItem(STORAGE_KEY_SIZE) || 'normal'; // 'normal', 'large', 'xlarge'
    let isHudCollapsed = localStorage.getItem(STORAGE_KEY_HUD_COLLAPSED) === 'true';
    let currentLang = localStorage.getItem('alp_lang') || 'en';

    let activeOptions = [];
    let focusedIndex = 0;
    let observer = null;
    let refreshTimeout = null;

    // Overlay Badge Definitions
    const BADGE_CONFIGS = {
        numbers: [
            { label: '1', color: '#EF4444', text: '1', bgClass: 'badge-btn-1' },
            { label: '2', color: '#10B981', text: '2', bgClass: 'badge-btn-2' },
            { label: '3', color: '#3B82F6', text: '3', bgClass: 'badge-btn-3' },
            { label: '4', color: '#F59E0B', text: '4', bgClass: 'badge-btn-4' }
        ],
        colors: [
            { label: '🔴', color: '#EF4444', text: '🔴 Red', bgClass: 'badge-btn-1' },
            { label: '🟢', color: '#10B981', text: '🟢 Green', bgClass: 'badge-btn-2' },
            { label: '🔵', color: '#3B82F6', text: '🔵 Blue', bgClass: 'badge-btn-3' },
            { label: '🟡', color: '#F59E0B', text: '🟡 Yellow', bgClass: 'badge-btn-4' }
        ],
        arrows: [
            { label: '⬅️', color: '#EF4444', text: '⬅️ Left', bgClass: 'badge-btn-1' },
            { label: '⬆️', color: '#10B981', text: '⬆️ Up', bgClass: 'badge-btn-2' },
            { label: '⬇️', color: '#3B82F6', text: '⬇️ Down', bgClass: 'badge-btn-3' },
            { label: '➡️', color: '#F59E0B', text: '➡️ Right', bgClass: 'badge-btn-4' }
        ],
        letters: [
            { label: 'A', color: '#EF4444', text: 'A', bgClass: 'badge-btn-1' },
            { label: 'B', color: '#10B981', text: 'B', bgClass: 'badge-btn-2' },
            { label: 'C', color: '#3B82F6', text: 'C', bgClass: 'badge-btn-3' },
            { label: 'D', color: '#F59E0B', text: 'D', bgClass: 'badge-btn-4' }
        ]
    };

    function getResolvedBadgeConfig() {
        if (overlayMode === 'contextual') {
            const path = window.location.pathname.toLowerCase();
            if (path.includes('spatial.html')) {
                return BADGE_CONFIGS.arrows;
            }
            if (path.includes('spelling.html')) {
                return BADGE_CONFIGS.letters;
            }
            // Standard dual-cue: Number + Color emoji
            return [
                { label: '1 🔴', color: '#EF4444', text: '1 🔴', bgClass: 'badge-btn-1' },
                { label: '2 🟢', color: '#10B981', text: '2 🟢', bgClass: 'badge-btn-2' },
                { label: '3 🔵', color: '#3B82F6', text: '3 🔵', bgClass: 'badge-btn-3' },
                { label: '4 🟡', color: '#F59E0B', text: '4 🟡', bgClass: 'badge-btn-4' }
            ];
        }
        return BADGE_CONFIGS[overlayMode] || BADGE_CONFIGS.numbers;
    }

    function detectActivityFromPath(path) {
        if (path.includes('letters')) return 'letters_puzzle';
        if (path.includes('game')) return 'find_and_match';
        if (path.includes('pattern')) return 'pattern';
        if (path.includes('spelling')) return 'spelling';
        if (path.includes('sequence')) return 'sequence';
        if (path.includes('math')) return 'math';
        if (path.includes('spatial')) return 'spatial';
        if (path.includes('colors')) return 'colors';
        if (path.includes('time')) return 'time';
        if (path.includes('coloring')) return 'coloring';
        if (path.includes('comparisons')) return 'comparisons';
        if (path.includes('labyrinth')) return 'labyrinth';
        if (path.includes('sounds')) return 'sounds';
        if (path.includes('circuit')) return 'circuit';
        if (path.includes('causality')) return 'causality';
        if (path.includes('builder')) return 'builder';
        if (path.includes('basket')) return 'basket';
        return null;
    }

    function isHubPage() {
        const path = window.location.pathname.toLowerCase();
        if (path.includes('parent.html') || path.endsWith('/parent')) return false;
        if (detectActivityFromPath(path)) return false;
        return path === '' || path === '/' || path.endsWith('/index.html') || path.endsWith('/index');
    }

    function isSpellingPage() {
        return window.location.pathname.toLowerCase().includes('spelling');
    }

    function isSoundsPage() {
        return window.location.pathname.toLowerCase().includes('sounds');
    }

    function isCircuitPage() {
        return window.location.pathname.toLowerCase().includes('circuit');
    }

    function isCausalityPage() {
        return window.location.pathname.toLowerCase().includes('causality');
    }

    function isBuilderPage() {
        return window.location.pathname.toLowerCase().includes('builder');
    }

    function isBasketPage() {
        return window.location.pathname.toLowerCase().includes('basket');
    }

    // Size Profile Management
    function applySizeProfile(size) {
        sizeProfile = size;
        localStorage.setItem(STORAGE_KEY_SIZE, sizeProfile);
        document.body.setAttribute('data-size', sizeProfile);
        updateSizeControlsUI();
    }

    function updateSizeControlsUI() {
        // Sync HUD dropdown
        const select = document.getElementById('alp-size-select');
        if (select && select.value !== sizeProfile) {
            select.value = sizeProfile;
        }

        // Sync all size pills
        document.querySelectorAll('.size-pill').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-size') === sizeProfile);
        });
    }

    // Setup or inject Size Pills into any .settings-bar on the page
    function setupSettingsBarSizeControls() {
        currentLang = localStorage.getItem('alp_lang') || 'en';
        const bars = document.querySelectorAll('.settings-bar');

        bars.forEach(bar => {
            let group = bar.querySelector('.size-pill-group');
            if (!group) {
                group = document.createElement('div');
                group.className = 'size-pill-group';
                group.style.display = 'inline-flex';
                group.style.alignItems = 'center';
                group.style.gap = '8px';

                // If bar already has difficulty pills, insert divider
                if (bar.children.length > 0) {
                    const divider = document.createElement('div');
                    divider.className = 'settings-divider';
                    group.appendChild(divider);
                }

                const label = document.createElement('span');
                label.className = 'settings-label size-bar-label';
                label.innerText = currentLang === 'fr' ? 'Taille :' : 'Size:';

                const btnNormal = document.createElement('button');
                btnNormal.className = `size-pill ${sizeProfile === 'normal' ? 'active' : ''}`;
                btnNormal.setAttribute('data-size', 'normal');
                btnNormal.innerText = currentLang === 'fr' ? 'Normale' : 'Normal';
                btnNormal.title = currentLang === 'fr' ? 'Taille standard' : 'Standard normal size';
                btnNormal.onclick = () => applySizeProfile('normal');

                const btnLarge = document.createElement('button');
                btnLarge.className = `size-pill ${sizeProfile === 'large' ? 'active' : ''}`;
                btnLarge.setAttribute('data-size', 'large');
                btnLarge.innerText = currentLang === 'fr' ? 'Grande' : 'Large';
                btnLarge.title = currentLang === 'fr' ? 'Grande taille (+40%)' : 'Large size (+40%)';
                btnLarge.onclick = () => applySizeProfile('large');

                const btnXLarge = document.createElement('button');
                btnXLarge.className = `size-pill ${sizeProfile === 'xlarge' ? 'active' : ''}`;
                btnXLarge.setAttribute('data-size', 'xlarge');
                btnXLarge.innerText = 'XL';
                btnXLarge.title = currentLang === 'fr' ? 'Très grande taille (+85%)' : 'Extra Large Giant (+85%)';
                btnXLarge.onclick = () => applySizeProfile('xlarge');

                group.appendChild(label);
                group.appendChild(btnNormal);
                group.appendChild(btnLarge);
                group.appendChild(btnXLarge);

                bar.appendChild(group);
            } else {
                const label = group.querySelector('.size-bar-label');
                if (label) label.innerText = currentLang === 'fr' ? 'Taille :' : 'Size:';
                const normalBtn = group.querySelector('.size-pill[data-size="normal"]');
                if (normalBtn) normalBtn.innerText = currentLang === 'fr' ? 'Normale' : 'Normal';
                const largeBtn = group.querySelector('.size-pill[data-size="large"]');
                if (largeBtn) largeBtn.innerText = currentLang === 'fr' ? 'Grande' : 'Large';
            }
        });
    }

    // Refresh Interactive Elements on the Page
    function refreshInteractiveElements() {
        if (isHubPage()) {
            const cards = Array.from(document.querySelectorAll('.activity-card, .category-card'));
            activeOptions = cards;
            clampFocusIndex();
            updateFocusVisuals();
            return;
        }

        // On game/activity pages:
        let items = [];

        if (isSpellingPage()) {
            // In spelling, only available unused letter buttons
            items = Array.from(document.querySelectorAll('#letter-tray .letter-btn:not(.used)'));
        } else if (isSoundsPage()) {
            // In sounds, tactile sound cards
            items = Array.from(document.querySelectorAll('.sound-choices-grid .sound-card, .sound-card'));
        } else if (isCircuitPage()) {
            // In circuit, colored balls in dispenser tray (excluding used)
            items = Array.from(document.querySelectorAll('#ball-tray .ball-choice-btn:not(.used), .ball-choice-btn:not(.used)'));
        } else if (isCausalityPage()) {
            // In causality, tactile cause buttons
            items = Array.from(document.querySelectorAll('#cause-controls .cause-btn, .cause-btn'));
        } else if (isBuilderPage()) {
            // In building logic, piece cards in tray
            items = Array.from(document.querySelectorAll('#pieces-tray .piece-card, .piece-card'));
        } else if (isBasketPage()) {
            // In basket shape, floor balls on court
            items = Array.from(document.querySelectorAll('.ball-launch-btn'));
        } else {
            // Other activities: option cards or step cards
            items = Array.from(document.querySelectorAll('.options-grid .option-card'));
            if (!items.length) {
                items = Array.from(document.querySelectorAll('#step-cards-container .option-card'));
            }
            if (!items.length) {
                items = Array.from(document.querySelectorAll('.sound-card'));
            }
            if (!items.length) {
                items = Array.from(document.querySelectorAll('.ball-choice-btn:not(.used)'));
            }
            if (!items.length) {
                items = Array.from(document.querySelectorAll('.cause-btn'));
            }
            if (!items.length) {
                items = Array.from(document.querySelectorAll('.piece-card'));
            }
            if (!items.length) {
                items = Array.from(document.querySelectorAll('.ball-launch-btn'));
            }
        }

        activeOptions = items;

        // In spelling or when > 4 options, remove any leftover badges
        if (isSpellingPage() || activeOptions.length > 4) {
            document.querySelectorAll('.alp-card-badge').forEach(badge => badge.remove());
        } else if (isBasketPage()) {
            // In basket shape, court balls are SVG elements with built-in native SVG badges.
            // Do not append HTML <span> badges inside SVG elements.
        } else {
            // Idempotently attach or update controller badges (no blinking/recreating)
            const config = getResolvedBadgeConfig();
            activeOptions.forEach((el, index) => {
                const badgeData = config[index];
                if (!badgeData) return;

                let badge = el.querySelector(':scope > .alp-card-badge');
                if (!badge) {
                    badge = document.createElement('span');
                    badge.className = `alp-card-badge ${badgeData.bgClass}`;
                    badge.innerText = badgeData.label;
                    badge.setAttribute('aria-hidden', 'true');

                    if (getComputedStyle(el).position === 'static') {
                        el.style.position = 'relative';
                    }

                    el.appendChild(badge);
                } else {
                    if (badge.innerText !== badgeData.label) {
                        badge.innerText = badgeData.label;
                    }
                    const expectedClass = `alp-card-badge ${badgeData.bgClass}`;
                    if (badge.className !== expectedClass) {
                        badge.className = expectedClass;
                    }
                }
            });
        }

        clampFocusIndex();
        updateFocusVisuals();
        setupSettingsBarSizeControls();
    }

    function clampFocusIndex() {
        if (!activeOptions.length) {
            focusedIndex = 0;
            return;
        }
        if (focusedIndex >= activeOptions.length) {
            focusedIndex = activeOptions.length - 1;
        }
        if (focusedIndex < 0) {
            focusedIndex = 0;
        }
    }

    // Update Visual Selection Focus Highlight (idempotent, no DOM churn)
    function updateFocusVisuals() {
        if (!activeOptions.length) return;

        clampFocusIndex();

        activeOptions.forEach((el, idx) => {
            const shouldBeFocused = (idx === focusedIndex);
            const isCurrentlyFocused = el.classList.contains('is-controller-focused');
            if (shouldBeFocused && !isCurrentlyFocused) {
                el.classList.add('is-controller-focused');
                if (!isBasketPage()) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
                }
            } else if (!shouldBeFocused && isCurrentlyFocused) {
                el.classList.remove('is-controller-focused');
            }
        });
    }

    // Trigger HUD Button Press Animation
    function flashHudButton(btnId) {
        const hudBtn = document.getElementById(`alp-hud-${btnId}`);
        if (hudBtn) {
            hudBtn.classList.remove('btn-active');
            void hudBtn.offsetWidth; // trigger reflow
            hudBtn.classList.add('btn-active');
            setTimeout(() => {
                hudBtn.classList.remove('btn-active');
            }, 250);
        }
    }

    // Move Focus linearly across available elements
    function moveFocus(delta) {
        if (!activeOptions.length) return;
        focusedIndex = (focusedIndex + delta + activeOptions.length) % activeOptions.length;
        updateFocusVisuals();
    }

    // Move Focus across grid rows
    function moveFocusGrid(rowDelta) {
        if (!activeOptions.length) return;
        const cols = window.innerWidth > 700 ? 2 : 1;
        const targetIndex = focusedIndex + (rowDelta * cols);
        if (targetIndex >= 0 && targetIndex < activeOptions.length) {
            focusedIndex = targetIndex;
        } else if (targetIndex < 0) {
            focusedIndex = 0;
        } else {
            focusedIndex = activeOptions.length - 1;
        }
        updateFocusVisuals();
    }

    // Direct Jump to a specific option index
    function jumpFocus(index, autoClick = false) {
        if (!activeOptions.length) return;
        if (index >= 0 && index < activeOptions.length) {
            focusedIndex = index;
            updateFocusVisuals();
            if (autoClick) {
                activeOptions[focusedIndex].click();
            }
        }
    }

    // Primary 4 Buttons Handler (Hardware Buttons 1, 2, 3, 4)
    function handlePrimaryButton(buttonIndex) {
        flashHudButton(`btn-${buttonIndex + 1}`);

        // In Cursor Mode (or Hub or Spelling): buttons act as Up, Down, Left, Right selection navigation
        if (navMode === 'cursor' || isHubPage() || isSpellingPage() || activeOptions.length > 4) {
            if (buttonIndex === 0) moveFocus(-1);        // Button 1: Left / Prev
            else if (buttonIndex === 1) moveFocusGrid(-1); // Button 2: Up
            else if (buttonIndex === 2) moveFocusGrid(1);  // Button 3: Down
            else if (buttonIndex === 3) moveFocus(1);     // Button 4: Right / Next
            return;
        }

        // In Direct Mode with 2-4 fixed cards: buttons 1-4 directly activate option 1-4
        if (activeOptions[buttonIndex]) {
            focusedIndex = buttonIndex;
            updateFocusVisuals();
            activeOptions[buttonIndex].click();
        }
    }

    // Handle Validate (Enter Button)
    function handleValidate() {
        flashHudButton('enter');

        if (activeOptions.length && activeOptions[focusedIndex]) {
            activeOptions[focusedIndex].click();
        }
    }

    // Handle Return / Quit (Escape Button)
    function handleEscape() {
        flashHudButton('esc');

        if (isHubPage()) {
            focusedIndex = 0;
            updateFocusVisuals();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            const homeBtn = document.getElementById('home-btn');
            if (homeBtn && homeBtn.href) {
                window.location.href = homeBtn.href;
            } else {
                window.location.href = 'index.html';
            }
        }
    }

    // Handle Prompt Repeat (Key 'R')
    function handleRepeatPrompt() {
        flashHudButton('repeat');
        const speakBtn = document.getElementById('speak-prompt-btn');
        if (speakBtn) {
            speakBtn.click();
        }
        const replayFxBtn = document.getElementById('replay-fx-btn');
        if (replayFxBtn) {
            replayFxBtn.click();
        }
    }

    // Global Keydown Listener
    function setupKeyboardListener() {
        window.addEventListener('keydown', (e) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

            const code = e.code;
            const key = e.key;

            // Directional Arrow Keys: ALWAYS move the selection cursor
            if (code === 'ArrowLeft') {
                e.preventDefault();
                flashHudButton('btn-1');
                moveFocus(-1);
                return;
            }
            if (code === 'ArrowRight') {
                e.preventDefault();
                flashHudButton('btn-4');
                moveFocus(1);
                return;
            }
            if (code === 'ArrowUp') {
                e.preventDefault();
                flashHudButton('btn-2');
                moveFocusGrid(-1);
                return;
            }
            if (code === 'ArrowDown') {
                e.preventDefault();
                flashHudButton('btn-3');
                moveFocusGrid(1);
                return;
            }

            // Enter / Validate Button
            if (code === 'Enter' || code === 'Space' || key === 'Enter' || key === ' ') {
                e.preventDefault();
                handleValidate();
                return;
            }

            // Escape / Return Button
            if (code === 'Escape' || code === 'Backspace' || key === 'Escape' || key === 'Backspace') {
                e.preventDefault();
                handleEscape();
                return;
            }

            // 'R' for Repeat Voice Prompt
            if (code === 'KeyR' || key === 'r' || key === 'R') {
                e.preventDefault();
                handleRepeatPrompt();
                return;
            }

            // Hardware Controller Numbers 1, 2, 3, 4
            if (['Digit1', 'Numpad1'].includes(code) || key === '1') {
                e.preventDefault();
                handlePrimaryButton(0);
                return;
            }
            if (['Digit2', 'Numpad2'].includes(code) || key === '2') {
                e.preventDefault();
                handlePrimaryButton(1);
                return;
            }
            if (['Digit3', 'Numpad3'].includes(code) || key === '3') {
                e.preventDefault();
                handlePrimaryButton(2);
                return;
            }
            if (['Digit4', 'Numpad4'].includes(code) || key === '4') {
                e.preventDefault();
                handlePrimaryButton(3);
                return;
            }

            // Digits 5 to 9 jump selection directly if entries exist
            if (/^[5-9]$/.test(key)) {
                const idx = parseInt(key, 10) - 1;
                if (idx < activeOptions.length) {
                    e.preventDefault();
                    jumpFocus(idx, navMode === 'direct');
                    return;
                }
            }

            // In spelling activity: allow typing letters directly to select them (e.g. typing 'T', 'C', 'H', 'A')
            if (isSpellingPage() && /^[a-zA-Z]$/.test(key)) {
                const targetLetter = key.toUpperCase();
                const matchedIdx = activeOptions.findIndex(btn => btn.innerText.trim().toUpperCase() === targetLetter);
                if (matchedIdx !== -1) {
                    e.preventDefault();
                    jumpFocus(matchedIdx, true); // Jump and select!
                }
            }
        });
    }

    // Gamepad API Polling Support
    let lastGamepadState = {};
    function pollGamepads() {
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        const gp = gamepads[0];

        if (gp) {
            const checkButton = (btnIdx, action) => {
                const isPressed = gp.buttons[btnIdx] && gp.buttons[btnIdx].pressed;
                const wasPressed = lastGamepadState[btnIdx];
                if (isPressed && !wasPressed) {
                    action();
                }
                lastGamepadState[btnIdx] = isPressed;
            };

            // D-Pad and face buttons mapping:
            checkButton(14, () => { flashHudButton('btn-1'); moveFocus(-1); });       // D-Pad Left
            checkButton(15, () => { flashHudButton('btn-4'); moveFocus(1); });        // D-Pad Right
            checkButton(12, () => { flashHudButton('btn-2'); moveFocusGrid(-1); });   // D-Pad Up
            checkButton(13, () => { flashHudButton('btn-3'); moveFocusGrid(1); });    // D-Pad Down

            // Controller Face Buttons
            checkButton(2, () => handlePrimaryButton(0)); // X / Square
            checkButton(3, () => handlePrimaryButton(1)); // Y / Triangle
            checkButton(0, () => handleValidate());        // A / Cross = Validate
            checkButton(1, () => handleEscape());          // B / Circle = Return/Back

            // Start & Select
            checkButton(9, () => handleValidate());
            checkButton(8, () => handleEscape());

            // Prompt Repeat
            checkButton(4, () => handleRepeatPrompt());
        }

        requestAnimationFrame(pollGamepads);
    }

    // Build Accessible On-Screen Controller HUD
    function renderControllerHud() {
        let existingHud = document.getElementById('alp-controller-hud');
        if (existingHud) existingHud.remove();

        const config = getResolvedBadgeConfig();
        const isCursor = (navMode === 'cursor' || isHubPage() || isSpellingPage() || activeOptions.length > 4);

        const hud = document.createElement('aside');
        hud.id = 'alp-controller-hud';
        hud.className = `alp-controller-hud ${isHudCollapsed ? 'is-collapsed' : ''}`;
        hud.setAttribute('role', 'region');
        hud.setAttribute('aria-label', 'Accessible Controller Bar');

        hud.innerHTML = `
            <div class="hud-main-bar">
                <button id="alp-hud-toggle-btn" class="hud-toggle-btn" title="Toggle Controller Helper" aria-label="Toggle Controller Helper">
                    <span class="hud-icon">🎮</span>
                    <span class="hud-toggle-text">4-Button Controller</span>
                </button>

                <div class="hud-buttons-row">
                    <button class="hud-btn hud-btn-1" id="alp-hud-btn-1" title="Button 1 (Left / Prev)">
                        <span class="hud-key-badge">${isCursor ? '⬅️' : (config[0]?.label || '1')}</span>
                        <span class="hud-btn-sub">${isCursor ? 'Left' : 'Btn 1'}</span>
                    </button>

                    <button class="hud-btn hud-btn-2" id="alp-hud-btn-2" title="Button 2 (Up)">
                        <span class="hud-key-badge">${isCursor ? '⬆️' : (config[1]?.label || '2')}</span>
                        <span class="hud-btn-sub">${isCursor ? 'Up' : 'Btn 2'}</span>
                    </button>

                    <button class="hud-btn hud-btn-3" id="alp-hud-btn-3" title="Button 3 (Down)">
                        <span class="hud-key-badge">${isCursor ? '⬇️' : (config[2]?.label || '3')}</span>
                        <span class="hud-btn-sub">${isCursor ? 'Down' : 'Btn 3'}</span>
                    </button>

                    <button class="hud-btn hud-btn-4" id="alp-hud-btn-4" title="Button 4 (Right / Next)">
                        <span class="hud-key-badge">${isCursor ? '➡️' : (config[3]?.label || '4')}</span>
                        <span class="hud-btn-sub">${isCursor ? 'Right' : 'Btn 4'}</span>
                    </button>

                    <div class="hud-divider"></div>

                    <button class="hud-btn hud-btn-enter" id="alp-hud-enter" title="Validate (Enter / Space)">
                        <span class="hud-key-badge">⏎ Enter</span>
                        <span class="hud-btn-sub">Validate</span>
                    </button>

                    <button class="hud-btn hud-btn-esc" id="alp-hud-esc" title="Return to Home (Esc / Backspace)">
                        <span class="hud-key-badge">⎋ Esc</span>
                        <span class="hud-btn-sub">Home</span>
                    </button>
                </div>

                <div class="hud-config-menu">
                    <label for="alp-size-select" class="hud-select-label">${currentLang === 'fr' ? 'Taille :' : 'Size:'}</label>
                    <select id="alp-size-select" class="hud-overlay-select" aria-label="Visual Size Profile">
                        <option value="normal" ${sizeProfile === 'normal' ? 'selected' : ''}>${currentLang === 'fr' ? 'Normale' : 'Normal'}</option>
                        <option value="large" ${sizeProfile === 'large' ? 'selected' : ''}>${currentLang === 'fr' ? 'Grande (+40%)' : 'Large (+40%)'}</option>
                        <option value="xlarge" ${sizeProfile === 'xlarge' ? 'selected' : ''}>${currentLang === 'fr' ? 'Très grande XL (+85%)' : 'XL Giant (+85%)'}</option>
                    </select>

                    <label for="alp-navmode-select" class="hud-select-label">Mode:</label>
                    <select id="alp-navmode-select" class="hud-overlay-select" aria-label="Controller Navigation Mode">
                        <option value="cursor" ${navMode === 'cursor' ? 'selected' : ''}>${currentLang === 'fr' ? 'Curseur (Déplacer)' : 'Move & Enter'}</option>
                        <option value="direct" ${navMode === 'direct' ? 'selected' : ''}>${currentLang === 'fr' ? 'Direct 1-4' : 'Direct 1-4'}</option>
                    </select>

                    <label for="alp-overlay-select" class="hud-select-label">Overlay:</label>
                    <select id="alp-overlay-select" class="hud-overlay-select" aria-label="Controller keycap overlay mode">
                        <option value="contextual" ${overlayMode === 'contextual' ? 'selected' : ''}>Auto / Smart</option>
                        <option value="numbers" ${overlayMode === 'numbers' ? 'selected' : ''}>Numbers (1-4)</option>
                        <option value="colors" ${overlayMode === 'colors' ? 'selected' : ''}>Colors (🔴🟢🔵🟡)</option>
                        <option value="arrows" ${overlayMode === 'arrows' ? 'selected' : ''}>Arrows (⬅️⬆️⬇️➡️)</option>
                        <option value="letters" ${overlayMode === 'letters' ? 'selected' : ''}>Letters (ABCD)</option>
                    </select>
                </div>
            </div>
        `;

        document.body.appendChild(hud);

        // Bind HUD events
        const toggleBtn = document.getElementById('alp-hud-toggle-btn');
        if (toggleBtn) {
            toggleBtn.onclick = () => {
                isHudCollapsed = !isHudCollapsed;
                localStorage.setItem(STORAGE_KEY_HUD_COLLAPSED, isHudCollapsed);
                hud.classList.toggle('is-collapsed', isHudCollapsed);
            };
        }

        const sizeSelect = document.getElementById('alp-size-select');
        if (sizeSelect) {
            sizeSelect.onchange = (e) => {
                applySizeProfile(e.target.value);
            };
        }

        const navModeSelect = document.getElementById('alp-navmode-select');
        if (navModeSelect) {
            navModeSelect.onchange = (e) => {
                navMode = e.target.value;
                localStorage.setItem(STORAGE_KEY_NAV_MODE, navMode);
                refreshInteractiveElements();
                renderControllerHud();
            };
        }

        const overlaySelect = document.getElementById('alp-overlay-select');
        if (overlaySelect) {
            overlaySelect.onchange = (e) => {
                overlayMode = e.target.value;
                localStorage.setItem(STORAGE_KEY_OVERLAY, overlayMode);
                refreshInteractiveElements();
                renderControllerHud();
            };
        }

        // Allow clicking on HUD buttons to trigger the action
        document.getElementById('alp-hud-btn-1')?.addEventListener('click', () => handlePrimaryButton(0));
        document.getElementById('alp-hud-btn-2')?.addEventListener('click', () => handlePrimaryButton(1));
        document.getElementById('alp-hud-btn-3')?.addEventListener('click', () => handlePrimaryButton(2));
        document.getElementById('alp-hud-btn-4')?.addEventListener('click', () => handlePrimaryButton(3));
        document.getElementById('alp-hud-enter')?.addEventListener('click', () => handleValidate());
        document.getElementById('alp-hud-esc')?.addEventListener('click', () => handleEscape());
    }

    // Watch DOM for dynamic game rounds
    function setupDomObserver() {
        if (observer) observer.disconnect();

        observer = new MutationObserver((mutations) => {
            let shouldRefresh = false;
            for (const m of mutations) {
                if (m.type === 'childList') {
                    // Ignore mutations happening inside cards, letters, HUD, or settings bar
                    if (m.target?.classList?.contains('option-card') ||
                        m.target?.classList?.contains('letter-btn') ||
                        m.target?.classList?.contains('sound-card') ||
                        m.target?.classList?.contains('ball-choice-btn') ||
                        m.target?.classList?.contains('cause-btn') ||
                        m.target?.classList?.contains('piece-card') ||
                        m.target?.classList?.contains('ball-launch-btn') ||
                        m.target?.classList?.contains('settings-bar') ||
                        m.target?.id === 'alp-controller-hud') {
                        continue;
                    }

                    for (const node of m.addedNodes) {
                        if (node.nodeType === 1 && (
                            node.classList?.contains('option-card') ||
                            node.classList?.contains('letter-btn') ||
                            node.classList?.contains('sound-card') ||
                            node.classList?.contains('ball-choice-btn') ||
                            node.classList?.contains('cause-btn') ||
                            node.classList?.contains('piece-card') ||
                            node.classList?.contains('ball-launch-btn')
                        )) {
                            shouldRefresh = true;
                            break;
                        }
                    }
                    if (shouldRefresh) break;

                    for (const node of m.removedNodes) {
                        if (node.nodeType === 1 && (
                            node.classList?.contains('option-card') ||
                            node.classList?.contains('letter-btn') ||
                            node.classList?.contains('sound-card') ||
                            node.classList?.contains('ball-choice-btn') ||
                            node.classList?.contains('cause-btn') ||
                            node.classList?.contains('piece-card') ||
                            node.classList?.contains('ball-launch-btn')
                        )) {
                            shouldRefresh = true;
                            break;
                        }
                    }
                    if (shouldRefresh) break;
                } else if (m.type === 'attributes' && m.attributeName === 'class') {
                    // React when a letter button or ball button becomes 'used'
                    if ((m.target?.classList?.contains('letter-btn') || m.target?.classList?.contains('ball-choice-btn')) && m.target?.classList?.contains('used')) {
                        shouldRefresh = true;
                        break;
                    }
                }
            }

            if (shouldRefresh) {
                clearTimeout(refreshTimeout);
                refreshTimeout = setTimeout(() => {
                    refreshInteractiveElements();
                }, 50);
            }
        });

        observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    }

    // Listen for language switching
    function setupLanguageListener() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                setTimeout(() => {
                    currentLang = localStorage.getItem('alp_lang') || 'en';
                    setupSettingsBarSizeControls();
                    renderControllerHud();
                }, 50);
            });
        });
    }

    // Public API
    window.AlpInputManager = {
        refresh: refreshInteractiveElements,
        setSizeProfile: applySizeProfile,
        getSizeProfile: () => sizeProfile,
        setNavMode: (mode) => {
            navMode = mode;
            localStorage.setItem(STORAGE_KEY_NAV_MODE, mode);
            refreshInteractiveElements();
            renderControllerHud();
        },
        setOverlayMode: (mode) => {
            overlayMode = mode;
            localStorage.setItem(STORAGE_KEY_OVERLAY, mode);
            refreshInteractiveElements();
            renderControllerHud();
        },
        moveFocus,
        moveFocusGrid,
        triggerButton: (idx) => handlePrimaryButton(idx),
        validate: handleValidate,
        escape: handleEscape
    };

    // Initialize
    function init() {
        // Apply initial visual size profile to body
        document.body.setAttribute('data-size', sizeProfile);

        setupKeyboardListener();
        renderControllerHud();
        refreshInteractiveElements();
        setupSettingsBarSizeControls();
        setupDomObserver();
        setupLanguageListener();

        // Start Gamepad API loop if supported
        if ('getGamepads' in navigator) {
            window.addEventListener('gamepadconnected', () => {
                console.log('🎮 Accessible Gamepad Connected!');
            });
            requestAnimationFrame(pollGamepads);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
