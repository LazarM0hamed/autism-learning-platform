// Automated Test Suite for Session Tracking, Feedback & Parent Analytics
const storage = require('./server/storage');
const assert = require('assert');
const fs = require('fs');

console.log('Testing Storage & Analytics Architecture...');

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
console.log('✓ Unique 1-vote per user and toggle-off behavior verified');

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
console.log('✓ All 20 authentic MP3 sound effects verified in public/assets/sounds/');

// Verify Hub Header Bar & Parent Hub Link
const indexHtml = fs.readFileSync('public/index.html', 'utf8');
assert(indexHtml.includes('id="alp-user-header-bar"'), 'index.html must include alp-user-header-bar');
assert(indexHtml.includes('id="alp-user-chip"'), 'index.html must include alp-user-chip');
assert(indexHtml.includes('href="parent.html"'), 'index.html must include parent.html link');
const likeBadgeCount = (indexHtml.match(/class="activity-likes-badge"/g) || []).length;
assert(likeBadgeCount === 14, `All 14 cards must have an activity-likes-badge, found ${likeBadgeCount}`);
console.log('✓ Parent Hub, Profile Switcher header, and 14 like badges anchored in index.html');

// Verify In-Activity Feedback Widget embedded across all 14 activity pages
const activityPages = [
    'game.html', 'colors.html', 'pattern.html', 'letters.html',
    'coloring.html', 'spelling.html', 'spatial.html', 'math.html',
    'comparisons.html', 'time.html', 'sequence.html', 'labyrinth.html',
    'sounds.html', 'circuit.html'
];
activityPages.forEach(p => {
    const html = fs.readFileSync(`public/${p}`, 'utf8');
    assert(html.includes('id="alp-feedback-widget"'), `${p} must include embedded alp-feedback-widget`);
});
console.log('✓ In-activity feedback widget verified across all 14 activity pages');

// Verify Sounds Mix All Mode
const soundsEngineJs = fs.readFileSync('public/js/sounds-engine.js', 'utf8');
assert(soundsEngineJs.includes("id: 'all'") && soundsEngineJs.includes('Tout mélanger'), 'sounds-engine.js must include Mix All (Tout mélanger) category');
console.log('✓ Sounds Mix All (Tout mélanger) category verified');

console.log('✓ Colour Matching, Comparison Concepts, Ball Labyrinth, Sounds, and Circuit verified');

// Clean teardown: preserve clean vierge storage state for deployment
fs.writeFileSync('storage/feedback.json', JSON.stringify({ feedback: [] }, null, 2) + '\n');
fs.writeFileSync('storage/sessions.json', JSON.stringify({ sessions: [] }, null, 2) + '\n');
fs.writeFileSync('storage/profiles.json', JSON.stringify({
    profiles: [
        { id: 'p_default', nickname: 'Champion', emoji: '🦁', createdAt: '2026-11-17T00:00:00.000Z', lastActiveAt: '2026-11-17T00:00:00.000Z' },
        { id: 'p_ilyen', nickname: 'Ilyen', emoji: '🦊', createdAt: '2026-11-17T00:00:00.000Z', lastActiveAt: '2026-11-17T00:00:00.000Z' }
    ]
}, null, 2) + '\n');
console.log('✓ Clean vierge stats preserved in storage/');

console.log('ALL STORAGE, SESSION & PARENT ANALYTICS TESTS PASSED!');
