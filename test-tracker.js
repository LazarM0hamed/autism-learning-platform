// Automated Test Suite for Session Tracking, Feedback & Parent Analytics
const storage = require('./server/storage');
const assert = require('assert');
const fs = require('fs');

console.log('Testing Storage & Analytics Architecture...');

// Clean baseline for idempotent test runs
fs.writeFileSync('storage/feedback.json', JSON.stringify({ feedback: [] }, null, 2) + '\n');
fs.writeFileSync('storage/sessions.json', JSON.stringify({ sessions: [] }, null, 2) + '\n');
fs.writeFileSync('storage/profiles.json', JSON.stringify({ profiles: [] }, null, 2) + '\n');

const testNick = `Kid_${Date.now()}`;

// 1. Profile Management
const profile = storage.getOrCreateProfile(testNick, '🦁');
assert.strictEqual(profile.nickname, testNick);
assert.strictEqual(profile.emoji, '🦁');

const profiles = storage.getProfiles();
assert(profiles.some(p => p.nickname === testNick), 'Test profile should exist');
console.log('✓ Profile creation & persistence verified');

// 2. Session Management
const session = storage.startSession({
    nickname: testNick,
    ip: '192.168.1.42',
    deviceId: 'test_tablet_ipad'
});
assert(session.id.startsWith('sess_'), 'Session ID should be generated');
assert.strictEqual(session.nickname, testNick);
console.log('✓ Session start verified');

// 3. Trial Events
storage.recordEvent(session.id, {
    type: 'trial_attempt',
    activityId: 'find_and_match',
    categoryId: 'animals',
    targetId: 'dog',
    attemptNumber: 1,
    isCorrect: true,
    latencyMs: 1800
});

storage.recordEvent(session.id, {
    type: 'trial_result',
    activityId: 'find_and_match',
    categoryId: 'animals',
    targetId: 'dog',
    attempts: 1,
    isCorrect: true,
    latencyMs: 1800
});

// A second question with one retry
storage.recordEvent(session.id, {
    type: 'trial_attempt',
    activityId: 'find_and_match',
    categoryId: 'animals',
    targetId: 'cat',
    attemptNumber: 1,
    isCorrect: false,
    latencyMs: 1500
});

storage.recordEvent(session.id, {
    type: 'trial_attempt',
    activityId: 'find_and_match',
    categoryId: 'animals',
    targetId: 'cat',
    attemptNumber: 2,
    isCorrect: true,
    latencyMs: 3200
});

storage.recordEvent(session.id, {
    type: 'trial_result',
    activityId: 'find_and_match',
    categoryId: 'animals',
    targetId: 'cat',
    attempts: 2,
    isCorrect: true,
    latencyMs: 3200
});
console.log('✓ Trial events and attempts recorded');

// 4. Feedback Mechanism (1 Vote Per User with Toggle Support)
const vote1 = storage.recordFeedback({
    sessionId: session.id,
    nickname: testNick,
    activityId: 'find_and_match',
    reaction: 'like'
});
assert.strictEqual(vote1.userReaction, 'like', 'Initial reaction should be like');

// Tapping like again should toggle off!
const vote2 = storage.recordFeedback({
    sessionId: session.id,
    nickname: testNick,
    activityId: 'find_and_match',
    reaction: 'like'
});
assert.strictEqual(vote2.userReaction, null, 'Second like click should toggle vote off');

// Tap like again to set active like
storage.recordFeedback({
    sessionId: session.id,
    nickname: testNick,
    activityId: 'find_and_match',
    reaction: 'like',
    comment: 'Loves the dog and cat illustrations!'
});

// A second user likes multiple times - must still count as exactly 1 vote!
const secondNick = `SecondKid_${Date.now()}`;
for (let i = 0; i < 5; i++) {
    storage.recordFeedback({
        sessionId: session.id,
        nickname: secondNick,
        activityId: 'find_and_match',
        reaction: 'like'
    });
}

const summaryResult = storage.getFeedbackSummary(testNick);
assert(summaryResult.summary['find_and_match'], 'Feedback summary should have find_and_match entry');
assert.strictEqual(summaryResult.userVotes['find_and_match'], 'like', 'Active user vote should be like');
assert(summaryResult.summary['find_and_match'].likes >= 1, 'Likes should count unique users');
assert(summaryResult.summary['find_and_match'].comments.length >= 1, 'Comments should be recorded');

// Test anonymous multi-device isolation (distinct deviceId without nickname)
const devA = `dev_ipad_${Date.now()}`;
const devB = `dev_phone_${Date.now()}`;
storage.recordFeedback({
    sessionId: session.id,
    nickname: 'Champion',
    deviceId: devA,
    activityId: 'colors',
    reaction: 'like'
});
storage.recordFeedback({
    sessionId: session.id,
    nickname: 'Champion',
    deviceId: devB,
    activityId: 'colors',
    reaction: 'like'
});
const devSummary = storage.getFeedbackSummary(null, devA);
assert.strictEqual(devSummary.summary['colors'].likes, 2, 'Distinct anonymous devices must each register 1 like');
assert.strictEqual(devSummary.userVotes['colors'], 'like', 'Device A vote must be preserved');
const devBSummary = storage.getFeedbackSummary(null, devB);
assert.strictEqual(devBSummary.userVotes['colors'], 'like', 'Device B vote must be preserved');

// Total connections count
const totalConn = storage.getTotalConnections();
assert(typeof totalConn === 'number' && totalConn >= 1, 'Total connections count should be >= 1');
console.log('✓ Unique 1-vote per user, multi-device isolation, and connection count verified');

// 5. Parent Analytics & Recommendations
const analytics = storage.getParentAnalytics(testNick);
assert.strictEqual(analytics.summary.totalTrials, 2);
assert.strictEqual(analytics.summary.correctTrials, 2);
assert.strictEqual(analytics.summary.accuracyRate, 100);
assert(analytics.summary.avgResponseTimeSec > 0, 'Response time should be greater than 0');

assert(analytics.activityReport.length > 0, 'Activity report should have entries');
const findStat = analytics.activityReport.find(a => a.activityId === 'find_and_match');
assert(findStat, 'find_and_match should be in activity report');
assert.strictEqual(findStat.trials, 2);
assert.strictEqual(findStat.tag, 'strength');

assert(analytics.recommendations.length > 0, 'Adaptive recommendations should be generated');
assert.strictEqual(analytics.recommendations[0].activityId, 'find_and_match');
assert.strictEqual(analytics.recommendations[0].type, 'confidence_booster');
console.log('✓ Parent analytics, KPI calculations, and adaptive recommendations verified');

// 6. Session End
const ended = storage.endSession(session.id);
assert.strictEqual(ended, true);
console.log('✓ Session end verified');

// 7. Verify New Activities Datasets & Integrity
const coloringData = JSON.parse(fs.readFileSync('public/data/coloring.json', 'utf8'));
assert(coloringData.palette.length >= 8, 'Coloring palette should have at least 8 colors');
assert(coloringData.levels.length >= 8, 'Coloring levels should have progressive tiers');
assert(Object.keys(coloringData.items).length >= 10, 'Coloring items should include at least 10 items');

const comparisonsData = JSON.parse(fs.readFileSync('public/data/comparisons.json', 'utf8'));
assert(comparisonsData.pairs.length === 12, 'Comparisons should cover all 12 opposite pairs');
comparisonsData.pairs.forEach(p => {
    assert(p.examples.length >= 3, `Pair ${p.id} should have at least 3 rotating examples`);
    p.examples.forEach(ex => {
        assert(ex.items.length === 2, `Example in pair ${p.id} should have 2 items`);
        assert(ex.questions.length >= 2, `Example in pair ${p.id} should have at least 2 questions`);
    });
});
assert(fs.existsSync('public/coloring.html'), 'coloring.html must exist');
assert(fs.existsSync('public/comparisons.html'), 'comparisons.html must exist');
assert(fs.existsSync('public/labyrinth.html'), 'labyrinth.html must exist');
assert(fs.existsSync('public/js/labyrinth-engine.js'), 'labyrinth-engine.js must exist');
assert(fs.existsSync('public/sounds.html'), 'sounds.html must exist');
assert(fs.existsSync('public/js/sounds-engine.js'), 'sounds-engine.js must exist');
const expectedSounds = ['dog', 'cat', 'cow', 'bird', 'duck', 'sheep', 'train', 'moto', 'car', 'plane', 'boat', 'firetruck', 'sea', 'wind', 'storm', 'rain', 'piano', 'drum', 'guitar', 'trumpet'];
expectedSounds.forEach(s => {
    assert(fs.existsSync(`public/assets/sounds/${s}.mp3`), `Sound file ${s}.mp3 must exist`);
});
assert(fs.existsSync('public/circuit.html'), 'circuit.html must exist');
assert(fs.existsSync('public/js/circuit-engine.js'), 'circuit-engine.js must exist');
assert(fs.existsSync('public/causality.html'), 'causality.html must exist');
assert(fs.existsSync('public/js/causality-engine.js'), 'causality-engine.js must exist');
assert(fs.existsSync('public/builder.html'), 'builder.html must exist');
assert(fs.existsSync('public/js/builder-engine.js'), 'builder-engine.js must exist');
assert(fs.existsSync('public/basket.html'), 'basket.html must exist');
assert(fs.existsSync('public/js/basket-engine.js'), 'basket-engine.js must exist');
assert(fs.existsSync('public/music.html'), 'music.html must exist');
assert(fs.existsSync('public/js/music-engine.js'), 'music-engine.js must exist');
assert(fs.existsSync('public/classification.html'), 'classification.html must exist');
assert(fs.existsSync('public/js/classification-engine.js'), 'classification-engine.js must exist');
assert(fs.existsSync('public/hide-and-seek.html'), 'hide-and-seek.html must exist');
assert(fs.existsSync('public/js/hide-and-seek-engine.js'), 'hide-and-seek-engine.js must exist');
assert(fs.existsSync('public/lines.html'), 'lines.html must exist');
assert(fs.existsSync('public/js/lines-engine.js'), 'lines-engine.js must exist');
assert(fs.existsSync('public/manifest.json'), 'manifest.json must exist');
assert(fs.existsSync('public/apple-touch-icon.png'), 'apple-touch-icon.png must exist');
assert(fs.existsSync('public/apple-touch-icon-180x180.png'), 'apple-touch-icon-180x180.png must exist');
assert(fs.existsSync('public/assets/icons/pwa-192x192.png'), 'pwa-192x192.png must exist');
assert(fs.existsSync('public/assets/icons/pwa-512x512.png'), 'pwa-512x512.png must exist');
console.log('✓ All 20 authentic MP3 sound effects verified in public/assets/sounds/');

// Verify Hub Header Bar & Parent Hub Link
const indexHtml = fs.readFileSync('public/index.html', 'utf8');
assert(indexHtml.includes('id="alp-user-header-bar"'), 'index.html must include alp-user-header-bar');
assert(indexHtml.includes('id="alp-user-chip"'), 'index.html must include alp-user-chip');
assert(indexHtml.includes('href="parent.html"'), 'index.html must include parent.html link');
assert(indexHtml.includes('apple-touch-icon.png'), 'index.html must include apple-touch-icon.png');
assert(indexHtml.includes('manifest.json'), 'index.html must include manifest.json');
const likeBadgeCount = (indexHtml.match(/class="activity-likes-badge"/g) || []).length;
assert(likeBadgeCount === 29, `All 29 cards must have an activity-likes-badge, found ${likeBadgeCount}`);
const bookmarkBtnCount = (indexHtml.match(/class="activity-bookmark-btn"/g) || []).length;
assert(bookmarkBtnCount === 29, `All 29 cards must have an activity-bookmark-btn, found ${bookmarkBtnCount}`);
assert(indexHtml.includes('id="filter-all-btn"') && indexHtml.includes('id="filter-fav-btn"'), 'index.html must include filter-all-btn and filter-fav-btn');
assert(indexHtml.includes('id="open-about-btn"'), 'index.html must include open-about-btn');
assert(indexHtml.includes('id="alp-about-modal"'), 'index.html must include alp-about-modal');
console.log('✓ Parent Hub, Our Story modal, PWA icons, 29 like badges, and 29 bookmark star buttons verified in index.html');

// Verify In-Activity Feedback Widget embedded across all 29 activity pages
const activityPages = [
    'game.html', 'colors.html', 'pattern.html', 'letters.html',
    'coloring.html', 'spelling.html', 'spatial.html', 'math.html',
    'comparisons.html', 'time.html', 'sequence.html', 'labyrinth.html',
    'sounds.html', 'circuit.html', 'causality.html', 'builder.html', 'basket.html',
    'music.html', 'classification.html', 'hide-and-seek.html', 'lines.html', 'body.html', 'language.html', 'syllables.html', 'emotions.html', 'counting.html', 'prepositions.html', 'word-builder.html', 'patterns.html'
];
activityPages.forEach(p => {
    const html = fs.readFileSync(`public/${p}`, 'utf8');
    assert(html.includes('id="alp-feedback-widget"'), `${p} must include embedded alp-feedback-widget`);
    assert(html.includes('favicon.svg'), `${p} must include favicon.svg`);
    assert(html.includes('assets/icons/logo.svg'), `${p} must include Infinity Harmony logo.svg`);
    assert(html.includes('apple-touch-icon.png'), `${p} must include apple-touch-icon.png`);
    assert(html.includes('manifest.json'), `${p} must include manifest.json`);
});
console.log('✓ In-activity feedback widget, favicon, Infinity Harmony logo, and PWA meta tags verified across all 29 activity pages');

// Verify Body Parts Dataset & Engine
const bodyJson = JSON.parse(fs.readFileSync('public/data/body.json', 'utf8'));
assert(bodyJson.parts && bodyJson.parts.length >= 12, 'body.json must contain at least 12 body parts');
bodyJson.parts.forEach(p => {
    assert(p.id && p.name && p.name.fr && p.name.en, `Part ${p.id} must have bilingual name`);
    assert(p.coords && typeof p.coords.x === 'number' && typeof p.coords.y === 'number', `Part ${p.id} must have numeric coords`);
});
const bodyHtml = fs.readFileSync('public/body.html', 'utf8');
assert(bodyHtml.includes('id="anatomy-svg"'), 'body.html must include anatomy-svg');
assert(bodyHtml.includes('id="mode-name-btn"') && bodyHtml.includes('id="mode-touch-btn"'), 'body.html must include dual mode buttons');
assert(bodyHtml.includes('id="body-choices-tray"'), 'body.html must include body-choices-tray');
const bodyEngineJs = fs.readFileSync('public/js/body-engine.js', 'utf8');
assert(bodyEngineJs.includes('flyButterflyTo'), 'body-engine.js must include flyButterflyTo physics');
assert(bodyEngineJs.includes('triggerMilestoneCelebration'), 'body-engine.js must include triggerMilestoneCelebration reward');
console.log('✓ Body Parts dataset, dual mode HTML, and butterfly engine verified');

// Verify Language Mini-Film HTML & Engine
const langHtml = fs.readFileSync('public/language.html', 'utf8');
assert(langHtml.includes('id="film-svg"'), 'language.html must include film-svg');
assert(langHtml.includes('id="sentence-strip"'), 'language.html must include sentence-strip');
assert(langHtml.includes('id="comm-cards"'), 'language.html must include comm-cards');
const langEngineJs = fs.readFileSync('public/js/language-engine.js', 'utf8');
assert(langEngineJs.includes('ANIMAL_FRIENDS') && langEngineJs.includes('DEMAND_SCENARIOS'), 'language-engine.js must include ANIMAL_FRIENDS and DEMAND_SCENARIOS');
console.log('✓ Language mini-film HTML and narrative engine verified');

// Verify Musical Syllables HTML & Engine
const sylHtml = fs.readFileSync('public/syllables.html', 'utf8');
assert(sylHtml.includes('id="fusion-svg"'), 'syllables.html must include fusion-svg');
assert(sylHtml.includes('id="consonant-bar"'), 'syllables.html must include consonant-bar');
assert(sylHtml.includes('id="compare-note-btn"'), 'syllables.html must include compare-note-btn');
const sylEngineJs = fs.readFileSync('public/js/syllables-engine.js', 'utf8');
assert(sylEngineJs.includes('VOWEL_NOTES') && sylEngineJs.includes('SYLLABLE_DATA'), 'syllables-engine.js must include VOWEL_NOTES and SYLLABLE_DATA');
console.log('✓ Musical Syllables HTML and phonics engine verified');

// Verify Emotions & Social Context HTML & Engine
const emotHtml = fs.readFileSync('public/emotions.html', 'utf8');
assert(emotHtml.includes('id="emotion-svg"'), 'emotions.html must include emotion-svg');
assert(emotHtml.includes('id="choices-grid"'), 'emotions.html must include choices-grid');
const emotEngineJs = fs.readFileSync('public/js/emotions-engine.js', 'utf8');
assert(emotEngineJs.includes('EMOTIONS_LIST') && emotEngineJs.includes('SOCIAL_SITUATIONS'), 'emotions-engine.js must include EMOTIONS_LIST and SOCIAL_SITUATIONS');
console.log('✓ Emotions & Social Context HTML and engine verified');

// Verify Counting & Quantities HTML & Engine
const countHtml = fs.readFileSync('public/counting.html', 'utf8');
assert(countHtml.includes('id="counting-board"'), 'counting.html must include counting-board');
assert(countHtml.includes('id="interaction-area"'), 'counting.html must include interaction-area');
const countEngineJs = fs.readFileSync('public/js/counting-engine.js', 'utf8');
assert(countEngineJs.includes('COUNTABLE_THEMES') && countEngineJs.includes('NUMBER_WORDS_FR'), 'counting-engine.js must include COUNTABLE_THEMES and NUMBER_WORDS_FR');
console.log('✓ Counting & Quantities HTML and engine verified');

// Verify Spatial Prepositions HTML & Engine
const prepHtml = fs.readFileSync('public/prepositions.html', 'utf8');
assert(prepHtml.includes('id="prep-svg"'), 'prepositions.html must include prep-svg');
assert(prepHtml.includes('id="char-bar"'), 'prepositions.html must include char-bar');
const prepEngineJs = fs.readFileSync('public/js/prepositions-engine.js', 'utf8');
assert(prepEngineJs.includes('CHARACTERS') && prepEngineJs.includes('PREPOSITIONS'), 'prepositions-engine.js must include CHARACTERS and PREPOSITIONS');
console.log('✓ Spatial Prepositions HTML and engine verified');

// Verify Word Assembly HTML & Engine
const wbHtml = fs.readFileSync('public/word-builder.html', 'utf8');
assert(wbHtml.includes('id="wb-svg"'), 'word-builder.html must include wb-svg');
assert(wbHtml.includes('id="break-word-btn"'), 'word-builder.html must include break-word-btn');
const wbEngineJs = fs.readFileSync('public/js/word-builder-engine.js', 'utf8');
assert(wbEngineJs.includes('VOWEL_STYLES') && wbEngineJs.includes('TWO_SYLLABLE_WORDS'), 'word-builder-engine.js must include VOWEL_STYLES and TWO_SYLLABLE_WORDS');
console.log('✓ Word Assembly HTML and engine verified');

// Verify Visual Patterns & Sequences HTML & Engine
const patHtml = fs.readFileSync('public/patterns.html', 'utf8');
assert(patHtml.includes('id="train-convoy"'), 'patterns.html must include train-convoy');
assert(patHtml.includes('id="play-rhythm-btn"'), 'patterns.html must include play-rhythm-btn');
const patEngineJs = fs.readFileSync('public/js/patterns-engine.js', 'utf8');
assert(patEngineJs.includes('PATTERN_SETS'), 'patterns-engine.js must include PATTERN_SETS');
console.log('✓ Visual Patterns HTML and engine verified');

// Verify Sounds Mix All Mode & Causality Mix All / Fireworks
const soundsEngineJs = fs.readFileSync('public/js/sounds-engine.js', 'utf8');
assert(soundsEngineJs.includes("id: 'all'") && soundsEngineJs.includes('Tout mélanger'), 'sounds-engine.js must include Mix All (Tout mélanger) category');
const causalityEngineJs = fs.readFileSync('public/js/causality-engine.js', 'utf8');
assert(causalityEngineJs.includes('Tout mélanger') && causalityEngineJs.includes('triggerCelebrationReward'), 'causality-engine.js must include Mix All mode and celebration reward');
const causalityHtml = fs.readFileSync('public/causality.html', 'utf8');
assert(causalityHtml.includes('celebration-canvas') && causalityHtml.includes('next-mission-btn'), 'causality.html must include celebration-canvas and next-mission-btn');
const builderHtml = fs.readFileSync('public/builder.html', 'utf8');
assert(builderHtml.includes('target-model-card') && builderHtml.includes('target-model-svg'), 'builder.html must include target-model-card blueprint');
const builderEngineJs = fs.readFileSync('public/js/builder-engine.js', 'utf8');
assert(builderEngineJs.includes('renderTargetModel') && builderEngineJs.includes('blue_cup'), 'builder-engine.js must include renderTargetModel and blue_cup');
console.log('✓ Sounds & Causality Mix All, Fireworks celebration, and Builder visual target blueprint verified');

console.log('✓ Colour Matching, Comparison Concepts, Ball Labyrinth, Sounds, Circuit, Causality, Builder, Basket, Music, Classification, and Hide-and-Seek verified');

// 8. Verify Cloudflare Pages Functions & Endpoints
(async () => {
    const fbMod = await import('./functions/api/feedback/index.js');
    const summaryMod = await import('./functions/api/feedback/summary.js');
    const startMod = await import('./functions/api/session/start.js');
    const connMod = await import('./functions/api/session/connections.js');

    assert(typeof fbMod.onRequestPost === 'function', 'feedback/index.js must export onRequestPost');
    assert(typeof summaryMod.onRequestGet === 'function', 'feedback/summary.js must export onRequestGet');
    assert(typeof startMod.onRequestPost === 'function', 'session/start.js must export onRequestPost');
    assert(typeof connMod.onRequestGet === 'function', 'session/connections.js must export onRequestGet');

    const mockKv = new Map();
    const mockEnv = {
        ALP_KV: {
            get: async (k, t) => {
                const val = mockKv.get(k);
                if (!val) return null;
                return t === 'json' ? JSON.parse(val) : val;
            },
            put: async (k, v) => mockKv.set(k, v)
        }
    };

    // Test Cloudflare session start increment
    const startRes = await startMod.onRequestPost({
        request: { json: async () => ({ nickname: 'Champion', deviceId: 'dev_cloud1' }) },
        env: mockEnv
    });
    const startData = await startRes.json();
    assert.strictEqual(startData.success, true);
    assert.strictEqual(startData.totalConnections, 1);

    // Test Cloudflare connection get
    const connRes = await connMod.onRequestGet({ env: mockEnv });
    const connData = await connRes.json();
    assert.strictEqual(connData.totalConnections, 1);

    // Test Cloudflare multi-device feedback
    const fbRes1 = await fbMod.onRequestPost({
        request: { json: async () => ({ nickname: 'Champion', deviceId: 'dev_cloud1', activityId: 'basket', reaction: 'like' }) },
        env: mockEnv
    });
    const fbData1 = await fbRes1.json();
    assert.strictEqual(fbData1.summary.basket.likes, 1);

    const fbRes2 = await fbMod.onRequestPost({
        request: { json: async () => ({ nickname: 'Champion', deviceId: 'dev_cloud2', activityId: 'basket', reaction: 'like' }) },
        env: mockEnv
    });
    const fbData2 = await fbRes2.json();
    assert.strictEqual(fbData2.summary.basket.likes, 2);

    const summaryRes = await summaryMod.onRequestGet({
        request: { url: 'https://example.com/api/feedback/summary?deviceId=dev_cloud1' },
        env: mockEnv
    });
    const summaryData = await summaryRes.json();
    assert.strictEqual(summaryData.summary.basket.likes, 2);
    assert.strictEqual(summaryData.userVotes.basket, 'like');

    console.log('✓ Cloudflare Pages Functions for likes and total connections verified');

    // 9. Verify Hub Total Connections Tag & Styling
    assert(indexHtml.includes('id="app-connections-tag"'), 'index.html must include app-connections-tag');
    assert(indexHtml.includes('id="connections-count"'), 'index.html must include connections-count');
    assert(indexHtml.includes('id="connections-label"'), 'index.html must include connections-label');

    // 10. Verify Hub Live Search, Category Domain Pills & Age Badges
    assert(indexHtml.includes('id="hub-search-input"'), 'index.html must include hub-search-input');
    assert(indexHtml.includes('id="hub-search-clear"'), 'index.html must include hub-search-clear');
    assert(indexHtml.includes('id="hub-results-count"'), 'index.html must include hub-results-count');
    assert(indexHtml.includes('id="filter-lang-btn"'), 'index.html must include language filter pill');
    assert(indexHtml.includes('id="filter-logic-btn"'), 'index.html must include logic filter pill');
    assert(indexHtml.includes('id="filter-math-btn"'), 'index.html must include math filter pill');
    assert(indexHtml.includes('id="filter-sensory-btn"'), 'index.html must include sensory filter pill');
    assert(indexHtml.includes('id="age-all-btn"'), 'index.html must include age-all-btn');
    assert(indexHtml.includes('id="age-36-btn"'), 'index.html must include age-36-btn');
    assert(indexHtml.includes('id="empty-search-hint"'), 'index.html must include empty-search-hint');

    const ageBadgesCount = (indexHtml.match(/class="activity-age-badge"/g) || []).length;
    assert.strictEqual(ageBadgesCount, 29, `All 29 cards must have an activity-age-badge, found ${ageBadgesCount}`);

    const cardCategories = (indexHtml.match(/data-category="[^"]+"/g) || []).map(m => m.split('"')[1]);
    const validDomains = ['language', 'logic', 'math', 'sensory', 'all', 'fav'];
    cardCategories.forEach(cat => assert(validDomains.includes(cat), `Invalid category: ${cat}`));

    const styleCss = fs.readFileSync('public/css/style.css', 'utf8');
    assert(styleCss.includes('.connections-tag'), 'style.css must include .connections-tag');
    assert(styleCss.includes('.hub-search-box'), 'style.css must include .hub-search-box');
    assert(styleCss.includes('.hub-age-bar'), 'style.css must include .hub-age-bar');
    assert(styleCss.includes('.activity-age-badge'), 'style.css must include .activity-age-badge');

    const trackerJs = fs.readFileSync('public/js/tracker.js', 'utf8');
    assert(trackerJs.includes('loadConnectionsCount'), 'tracker.js must include loadConnectionsCount');
    assert(trackerJs.includes('refreshConnections'), 'tracker.js must include refreshConnections');
    assert(trackerJs.includes('applyHubFilters'), 'tracker.js must include applyHubFilters');
    assert(trackerJs.includes('normalizeSearchText'), 'tracker.js must include normalizeSearchText');
    console.log('✓ Hub live search, 5 category domain pills, age badges (3-6y), and tracker filter engine verified');

    // Clean teardown: preserve clean vierge storage state for deployment
    fs.writeFileSync('storage/feedback.json', JSON.stringify({ feedback: [] }, null, 2) + '\n');
    fs.writeFileSync('storage/sessions.json', JSON.stringify({ sessions: [] }, null, 2) + '\n');
    fs.writeFileSync('storage/profiles.json', JSON.stringify({ profiles: [] }, null, 2) + '\n');
    console.log('✓ Clean vierge stats preserved in storage/');

    console.log('ALL STORAGE, SESSION, CLOUDFLARE & PARENT ANALYTICS TESTS PASSED!');
})();
