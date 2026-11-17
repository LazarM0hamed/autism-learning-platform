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

// Verify Sounds, Circuit & Causality controller support
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
console.log('✓ Button Controller support verified for Sound Identification (.sound-card), Ball Circuit (.ball-choice-btn) & Cause & Effect (.cause-btn)');

console.log('ALL INPUT MANAGER & SPELLING SELECTION TESTS PASSED!');
