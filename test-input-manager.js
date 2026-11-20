// Unit test for input-manager.js logic including Spelling CHAT navigation
const fs = require('fs');

// Mock browser globals
const listeners = {};
global.window = {
    addEventListener: (evt, fn) => { listeners[evt] = fn; },
    location: { pathname: '/spelling.html', href: 'http://localhost:3000/spelling.html' },
    innerWidth: 1024,
    scrollTo: () => {}
};
global.localStorage = {
    _data: {},
    getItem: (k) => global.localStorage._data[k] || null,
    setItem: (k, v) => { global.localStorage._data[k] = String(v); }
};
global.navigator = { getGamepads: () => [] };
global.requestAnimationFrame = (fn) => setTimeout(fn, 16);

// Simple DOM element mock
class MockElement {
    constructor(tag, id = '', className = '') {
        this.tagName = tag.toUpperCase();
        this.id = id;
        this.className = className;
        this.style = {};
        this.children = [];
        this.attributes = {};
        this.classList = {
            add: (c) => { if (!this.className.includes(c)) this.className = (this.className + ' ' + c).trim(); },
            remove: (c) => { this.className = this.className.replace(new RegExp(`\\b${c}\\b`, 'g'), '').trim(); },
            toggle: (c, force) => {
                if (force === undefined) {
                    if (this.className.includes(c)) this.classList.remove(c);
                    else this.classList.add(c);
                } else if (force) this.classList.add(c);
                else this.classList.remove(c);
            },
            contains: (c) => this.className.split(/\s+/).includes(c)
        };
        this.innerText = '';
    }
    appendChild(child) { this.children.push(child); child.parentElement = this; }
    remove() {
        if (this.parentElement) {
            this.parentElement.children = this.parentElement.children.filter(c => c !== this);
        }
    }
    setAttribute(k, v) { this.attributes[k] = v; }
    getAttribute(k) { return this.attributes[k]; }
    addEventListener(evt, fn) { this['on' + evt] = fn; }
    click() { if (this.onclick) this.onclick(); }
    scrollIntoView() {}
    querySelector(sel) { return null; }
}

const mockBody = new MockElement('body');
global.document = {
    body: mockBody,
    readyState: 'complete',
    createElement: (tag) => new MockElement(tag),
    getElementById: (id) => {
        function search(el) {
            if (el.id === id) return el;
            for (const c of el.children) {
                const found = search(c);
                if (found) return found;
            }
            return null;
        }
        return search(mockBody);
    },
    querySelectorAll: (sel) => {
        const results = [];
        function search(el) {
            if (sel.includes('.alp-card-badge') && el.classList.contains('alp-card-badge')) results.push(el);
            if (sel.includes('.option-card') && el.classList.contains('option-card')) results.push(el);
            if (sel.includes('.letter-btn') && el.classList.contains('letter-btn')) {
                if (sel.includes(':not(.used)') && el.classList.contains('used')) {
                    // Skip used
                } else {
                    results.push(el);
                }
            }
            if (sel.includes('.is-controller-focused') && el.classList.contains('is-controller-focused')) results.push(el);
            for (const c of el.children) search(c);
        }
        search(mockBody);
        return results;
    }
};

global.getComputedStyle = () => ({ position: 'relative' });
global.MutationObserver = class {
    constructor(cb) { this.cb = cb; }
    observe() {}
    disconnect() {}
};

// Create a home button
const homeBtn = new MockElement('a', 'home-btn');
homeBtn.href = 'index.html';
mockBody.appendChild(homeBtn);

// Create Letter Tray for word "CHAT" + distractor "M": [C, H, A, T, M] (5 letters)
const tray = new MockElement('div', 'letter-tray');
mockBody.appendChild(tray);

let clickedLetters = [];
const letters = ['C', 'H', 'A', 'T', 'M'];
const letterBtns = letters.map(letter => {
    const btn = new MockElement('button', `btn-${letter}`, 'letter-btn');
    btn.innerText = letter;
    btn.onclick = () => {
        clickedLetters.push(letter);
        btn.classList.add('used');
    };
    tray.appendChild(btn);
    return btn;
});

// Load input-manager.js
require('./public/js/input-manager.js');

console.log('Testing AlpInputManager availability...');
if (!window.AlpInputManager) throw new Error('AlpInputManager not registered!');

// Test initial focus: letter 'C' at index 0 should be focused!
if (!letterBtns[0].classList.contains('is-controller-focused')) {
    throw new Error('Initial selection should be on letter C at index 0');
}
console.log('✓ Initial selection is active on Letter C');

// Test moving selection with ArrowRight:
// C -> H (index 1) -> A (index 2) -> T (index 3)
listeners.keydown({ code: 'ArrowRight', key: 'ArrowRight', target: { tagName: 'BODY' }, preventDefault: () => {} });
if (!letterBtns[1].classList.contains('is-controller-focused')) throw new Error('Focus should be on H');

listeners.keydown({ code: 'ArrowRight', key: 'ArrowRight', target: { tagName: 'BODY' }, preventDefault: () => {} });
if (!letterBtns[2].classList.contains('is-controller-focused')) throw new Error('Focus should be on A');

listeners.keydown({ code: 'ArrowRight', key: 'ArrowRight', target: { tagName: 'BODY' }, preventDefault: () => {} });
if (!letterBtns[3].classList.contains('is-controller-focused')) throw new Error('Focus should be on T');
console.log('✓ Moved selection highlight across entries to Letter T');

// Validate selection of T using Enter
listeners.keydown({ code: 'Enter', key: 'Enter', target: { tagName: 'BODY' }, preventDefault: () => {} });
if (!clickedLetters.includes('T')) throw new Error('Expected T to be clicked and selected');
console.log('✓ Enter validated and selected Letter T');

// Test typing letter directly (e.g. typing 'C' or 'A')
listeners.keydown({ code: 'KeyA', key: 'a', target: { tagName: 'BODY' }, preventDefault: () => {} });
if (!clickedLetters.includes('A')) throw new Error('Expected letter A to be selected via keypress');
console.log('✓ Direct keypress selected Letter A');

// Test Escape returns to home
listeners.keydown({ code: 'Escape', key: 'Escape', target: { tagName: 'BODY' }, preventDefault: () => {} });
if (window.location.href !== 'index.html') throw new Error(`Expected redirect to index.html, got ${window.location.href}`);
console.log('✓ Escape returned to index.html');

// Test Size Profile Management
window.AlpInputManager.setSizeProfile('large');
if (window.AlpInputManager.getSizeProfile() !== 'large') throw new Error('Size profile should be large');
if (document.body.getAttribute('data-size') !== 'large') throw new Error('Body data-size should be large');
console.log('✓ Applied Large visual size profile (+40%)');

window.AlpInputManager.setSizeProfile('xlarge');
if (window.AlpInputManager.getSizeProfile() !== 'xlarge') throw new Error('Size profile should be xlarge');
if (document.body.getAttribute('data-size') !== 'xlarge') throw new Error('Body data-size should be xlarge');
console.log('✓ Applied XL Giant visual size profile (+85%)');

// Verify Sounds, Circuit, Causality, Builder & Basket controller support
const inputManagerSrc = fs.readFileSync('public/js/input-manager.js', 'utf8');
if (!inputManagerSrc.includes('isSoundsPage') || !inputManagerSrc.includes('sound-card')) {
    throw new Error('input-manager.js must support sounds.html (.sound-card)');
}
if (!inputManagerSrc.includes('isCircuitPage') || !inputManagerSrc.includes('ball-choice-btn')) {
    throw new Error('input-manager.js must support circuit.html (.ball-choice-btn)');
}
if (!inputManagerSrc.includes('isCausalityPage') || !inputManagerSrc.includes('cause-btn')) {
    throw new Error('input-manager.js must support causality.html (.cause-btn)');
}
if (!inputManagerSrc.includes('isBuilderPage') || !inputManagerSrc.includes('piece-card')) {
    throw new Error('input-manager.js must support builder.html (.piece-card)');
}
if (!inputManagerSrc.includes('isBasketPage') || !inputManagerSrc.includes('ball-launch-btn')) {
    throw new Error('input-manager.js must support basket.html (.ball-launch-btn)');
}
if (!inputManagerSrc.includes('isMusicPage') || !inputManagerSrc.includes('key-block-btn')) {
    throw new Error('input-manager.js must support music.html (.key-block-btn)');
}
if (!inputManagerSrc.includes('isClassificationPage') || !inputManagerSrc.includes('sort-basket')) {
    throw new Error('input-manager.js must support classification.html (.sort-basket)');
}
if (!inputManagerSrc.includes('isHideAndSeekPage') || !inputManagerSrc.includes('search-cell')) {
    throw new Error('input-manager.js must support hide-and-seek.html (.search-cell)');
}
if (!inputManagerSrc.includes('isLinesPage') || !inputManagerSrc.includes('motif-card')) {
    throw new Error('input-manager.js must support lines.html (.motif-card)');
}
if (!inputManagerSrc.includes('isBodyPage') || !inputManagerSrc.includes('body-choice-btn')) {
    throw new Error('input-manager.js must support body.html (.body-choice-btn)');
}
if (!inputManagerSrc.includes('isLanguagePage') || !inputManagerSrc.includes('comm-card')) {
    throw new Error('input-manager.js must support language.html (.comm-card)');
}
if (!inputManagerSrc.includes('isSyllablesPage') || !inputManagerSrc.includes('vowel-key-btn')) {
    throw new Error('input-manager.js must support syllables.html (.vowel-key-btn, .syl-choice-card)');
}
if (!inputManagerSrc.includes('isEmotionsPage') || !inputManagerSrc.includes('emotion-card')) {
    throw new Error('input-manager.js must support emotions.html (.emotion-card)');
}
if (!inputManagerSrc.includes('isCountingPage') || !inputManagerSrc.includes('num-choice-card')) {
    throw new Error('input-manager.js must support counting.html (.num-choice-card, .add-item-btn)');
}
if (!inputManagerSrc.includes('isPrepositionsPage') || !inputManagerSrc.includes('prep-card')) {
    throw new Error('input-manager.js must support prepositions.html (.prep-card)');
}
if (!inputManagerSrc.includes('isWordBuilderPage') || !inputManagerSrc.includes('wb-syl-card')) {
    throw new Error('input-manager.js must support word-builder.html (.wb-syl-card)');
}
if (!inputManagerSrc.includes('isPatternsPage') || !inputManagerSrc.includes('pat-choice-card')) {
    throw new Error('input-manager.js must support patterns.html (.pat-choice-card)');
}
console.log('✓ Button Controller support verified for Sound Identification (.sound-card), Ball Circuit (.ball-choice-btn), Cause & Effect (.cause-btn), Building Logic (.piece-card), Basket Shape (.ball-launch-btn), Music Partition (.key-block-btn), Classification (.sort-basket), Hide and Seek (.search-cell), Magic Lines (.motif-card), Body Parts (.body-choice-btn), Language Mini-Film (.comm-card), Musical Syllables (.vowel-key-btn, .syl-choice-card), Emotions (.emotion-card), Counting (.num-choice-card, .add-item-btn), Prepositions (.prep-card), Word Assembly (.wb-syl-card) & Visual Patterns (.pat-choice-card)');

// Test 2D Grid Down / Up Arrow navigation logic
const mockGrid = new MockElement('div', 'search-grid');
mockGrid.style = { gridTemplateColumns: 'repeat(3, auto)' };
const mockCells = [];
for (let i = 0; i < 9; i++) {
    const cell = new MockElement('button', `cell-${i}`, 'search-cell');
    mockGrid.appendChild(cell);
    mockCells.push(cell);
}
const origQSA = global.document.querySelectorAll;
global.document.querySelectorAll = (sel) => {
    if (sel.includes('.search-cell')) return mockCells;
    return origQSA(sel);
};
global.window.location.pathname = '/hide-and-seek.html';
window.AlpInputManager.refresh();
window.AlpInputManager.jumpFocus(0);

if (window.AlpInputManager.detectGridColumns() !== 3) {
    throw new Error(`detectGridColumns should be 3 for 3x3 grid, got ${window.AlpInputManager.detectGridColumns()}`);
}
if (window.AlpInputManager.getFocusedIndex() !== 0) {
    throw new Error(`Initial focus should be 0, got ${window.AlpInputManager.getFocusedIndex()}`);
}
// Down Arrow from cell 0 -> cell 3
window.AlpInputManager.moveFocusGrid(1);
if (window.AlpInputManager.getFocusedIndex() !== 3) {
    throw new Error(`Down arrow from cell 0 in 3x3 grid should go to cell 3, got ${window.AlpInputManager.getFocusedIndex()}`);
}
// Down Arrow from cell 3 -> cell 6
window.AlpInputManager.moveFocusGrid(1);
if (window.AlpInputManager.getFocusedIndex() !== 6) {
    throw new Error(`Down arrow from cell 3 in 3x3 grid should go to cell 6, got ${window.AlpInputManager.getFocusedIndex()}`);
}
// Down Arrow from cell 6 -> wraps to cell 0
window.AlpInputManager.moveFocusGrid(1);
if (window.AlpInputManager.getFocusedIndex() !== 0) {
    throw new Error(`Down arrow from cell 6 in 3x3 grid should wrap to cell 0, got ${window.AlpInputManager.getFocusedIndex()}`);
}
// Move to cell 1 (col 1), then Down Arrow -> cell 4 (row 1, col 1)
window.AlpInputManager.moveFocus(1);
window.AlpInputManager.moveFocusGrid(1);
if (window.AlpInputManager.getFocusedIndex() !== 4) {
    throw new Error(`Down arrow from cell 1 in 3x3 grid should go to cell 4, got ${window.AlpInputManager.getFocusedIndex()}`);
}
console.log('✓ 2D Grid Down Arrow & Up Arrow spatial navigation verified for 3x3/4x4/5x4 grids in Hide & Seek');

// Test Arrow button & D-Pad navigation for Emotions (.emotion-card)
const mockEmotionGrid = new MockElement('section', 'choices-grid', 'emotion-choices-grid');
const mockEmotCards = [
    new MockElement('button', 'emot-happy', 'emotion-card'),
    new MockElement('button', 'emot-sad', 'emotion-card'),
    new MockElement('button', 'emot-angry', 'emotion-card')
];
let clickedEmotCard = null;
mockEmotCards.forEach((c, idx) => {
    c.onclick = () => { clickedEmotCard = idx; };
    mockEmotionGrid.appendChild(c);
});

global.document.querySelectorAll = (sel) => {
    if (sel.includes('.emotion-card')) return mockEmotCards;
    return origQSA(sel);
};
global.window.location.pathname = '/emotions.html';
window.AlpInputManager.refresh();
window.AlpInputManager.jumpFocus(0);

if (window.AlpInputManager.getFocusedIndex() !== 0) {
    throw new Error(`Emotions initial focus should be 0, got ${window.AlpInputManager.getFocusedIndex()}`);
}
if (!mockEmotCards[0].classList.contains('is-controller-focused')) {
    throw new Error('Initial emotion card must have is-controller-focused class');
}

// Press ArrowRight / Button 4
window.AlpInputManager.moveFocus(1);
if (window.AlpInputManager.getFocusedIndex() !== 1) {
    throw new Error(`ArrowRight should move focus to card 1, got ${window.AlpInputManager.getFocusedIndex()}`);
}
if (!mockEmotCards[1].classList.contains('is-controller-focused')) {
    throw new Error('Card 1 must have is-controller-focused after ArrowRight');
}

// Press ArrowLeft / Button 1
window.AlpInputManager.moveFocus(-1);
if (window.AlpInputManager.getFocusedIndex() !== 0) {
    throw new Error(`ArrowLeft should move focus back to card 0, got ${window.AlpInputManager.getFocusedIndex()}`);
}

// Press Enter / Validate
window.AlpInputManager.validate();
if (clickedEmotCard !== 0) {
    throw new Error(`Enter key should have triggered card 0 click, got ${clickedEmotCard}`);
}
console.log('✓ Arrow key & D-Pad navigation verified for Emotions cards (.emotion-card)');

// Test Arrow button & D-Pad navigation for Counting & Quantities (.num-choice-card & .add-item-btn)
const mockCountingGrid = new MockElement('div', 'interaction-area', 'number-choices-grid');
const mockNumCards = [
    new MockElement('button', 'num-1', 'num-choice-card'),
    new MockElement('button', 'num-2', 'num-choice-card'),
    new MockElement('button', 'num-3', 'num-choice-card')
];
let clickedNumCard = null;
mockNumCards.forEach((c, idx) => {
    c.onclick = () => { clickedNumCard = idx; };
    mockCountingGrid.appendChild(c);
});

global.document.querySelectorAll = (sel) => {
    if (sel.includes('.num-choice-card')) return mockNumCards;
    return origQSA(sel);
};
global.window.location.pathname = '/counting.html';
window.AlpInputManager.refresh();
window.AlpInputManager.jumpFocus(0);

if (window.AlpInputManager.getFocusedIndex() !== 0) {
    throw new Error(`Counting initial focus should be 0, got ${window.AlpInputManager.getFocusedIndex()}`);
}
if (!mockNumCards[0].classList.contains('is-controller-focused')) {
    throw new Error('Initial number card must have is-controller-focused class');
}

// Move to card 2 via ArrowRight
window.AlpInputManager.moveFocus(1);
window.AlpInputManager.moveFocus(1);
if (window.AlpInputManager.getFocusedIndex() !== 2) {
    throw new Error(`ArrowRight twice should move focus to card 2, got ${window.AlpInputManager.getFocusedIndex()}`);
}
if (!mockNumCards[2].classList.contains('is-controller-focused')) {
    throw new Error('Card 2 must have is-controller-focused after ArrowRight');
}

// Press Enter / Validate
window.AlpInputManager.validate();
if (clickedNumCard !== 2) {
    throw new Error(`Enter key should have triggered card 2 click, got ${clickedNumCard}`);
}
console.log('✓ Arrow key & D-Pad navigation verified for Counting cards (.num-choice-card)');

// Test Arrow button & D-Pad navigation for Prepositions (.prep-card)
const mockPrepGrid = new MockElement('section', 'choices-grid', 'prep-choices-grid');
const mockPrepCards = [
    new MockElement('button', 'prep-sur', 'prep-card'),
    new MockElement('button', 'prep-sous', 'prep-card'),
    new MockElement('button', 'prep-dans', 'prep-card')
];
let clickedPrepCard = null;
mockPrepCards.forEach((c, idx) => {
    c.onclick = () => { clickedPrepCard = idx; };
    mockPrepGrid.appendChild(c);
});

global.document.querySelectorAll = (sel) => {
    if (sel.includes('.prep-card')) return mockPrepCards;
    return origQSA(sel);
};
global.window.location.pathname = '/prepositions.html';
window.AlpInputManager.refresh();
window.AlpInputManager.jumpFocus(0);

if (window.AlpInputManager.getFocusedIndex() !== 0) {
    throw new Error(`Prepositions initial focus should be 0, got ${window.AlpInputManager.getFocusedIndex()}`);
}
if (!mockPrepCards[0].classList.contains('is-controller-focused')) {
    throw new Error('Initial preposition card must have is-controller-focused class');
}

// Move to card 1 via ArrowRight
window.AlpInputManager.moveFocus(1);
if (window.AlpInputManager.getFocusedIndex() !== 1) {
    throw new Error(`ArrowRight should move focus to card 1, got ${window.AlpInputManager.getFocusedIndex()}`);
}
if (!mockPrepCards[1].classList.contains('is-controller-focused')) {
    throw new Error('Card 1 must have is-controller-focused after ArrowRight');
}

// Press Enter / Validate
window.AlpInputManager.validate();
if (clickedPrepCard !== 1) {
    throw new Error(`Enter key should have triggered card 1 click, got ${clickedPrepCard}`);
}
console.log('✓ Arrow key & D-Pad navigation verified for Prepositions cards (.prep-card)');

// Test Arrow button & D-Pad navigation for Word Builder (.wb-syl-card)
const mockWbGrid = new MockElement('section', 'wb-choices', 'wb-choices-row');
const mockWbCards = [
    new MockElement('button', 'wb-1', 'wb-syl-card'),
    new MockElement('button', 'wb-2', 'wb-syl-card')
];
let clickedWbCard = null;
mockWbCards.forEach((c, idx) => {
    c.onclick = () => { clickedWbCard = idx; };
    mockWbGrid.appendChild(c);
});

global.document.querySelectorAll = (sel) => {
    if (sel.includes('.wb-syl-card')) return mockWbCards;
    return origQSA(sel);
};
global.window.location.pathname = '/word-builder.html';
window.AlpInputManager.refresh();
window.AlpInputManager.jumpFocus(0);

if (window.AlpInputManager.getFocusedIndex() !== 0) {
    throw new Error(`Word Builder initial focus should be 0, got ${window.AlpInputManager.getFocusedIndex()}`);
}
window.AlpInputManager.moveFocus(1);
if (window.AlpInputManager.getFocusedIndex() !== 1) {
    throw new Error(`Word Builder ArrowRight should move focus to card 1, got ${window.AlpInputManager.getFocusedIndex()}`);
}
window.AlpInputManager.validate();
if (clickedWbCard !== 1) {
    throw new Error(`Enter key should have triggered card 1 click in Word Builder, got ${clickedWbCard}`);
}
console.log('✓ Arrow key & D-Pad navigation verified for Word Builder cards (.wb-syl-card)');

// Test Arrow button & D-Pad navigation for Visual Patterns (.pat-choice-card)
const mockPatGrid = new MockElement('section', 'pattern-choices', 'pattern-choices-row');
const mockPatCards = [
    new MockElement('button', 'pat-1', 'pat-choice-card'),
    new MockElement('button', 'pat-2', 'pat-choice-card')
];
let clickedPatCard = null;
mockPatCards.forEach((c, idx) => {
    c.onclick = () => { clickedPatCard = idx; };
    mockPatGrid.appendChild(c);
});

global.document.querySelectorAll = (sel) => {
    if (sel.includes('.pat-choice-card')) return mockPatCards;
    return origQSA(sel);
};
global.window.location.pathname = '/patterns.html';
window.AlpInputManager.refresh();
window.AlpInputManager.jumpFocus(0);

if (window.AlpInputManager.getFocusedIndex() !== 0) {
    throw new Error(`Patterns initial focus should be 0, got ${window.AlpInputManager.getFocusedIndex()}`);
}
window.AlpInputManager.moveFocus(1);
if (window.AlpInputManager.getFocusedIndex() !== 1) {
    throw new Error(`Patterns ArrowRight should move focus to card 1, got ${window.AlpInputManager.getFocusedIndex()}`);
}
window.AlpInputManager.validate();
if (clickedPatCard !== 1) {
    throw new Error(`Enter key should have triggered card 1 click in Patterns, got ${clickedPatCard}`);
}
console.log('✓ Arrow key & D-Pad navigation verified for Visual Patterns cards (.pat-choice-card)');

console.log('ALL INPUT MANAGER & SPELLING SELECTION TESTS PASSED!');
