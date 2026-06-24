// ============================================================
// DEMO.JS - Full Demo Mode (No Backend Required)
// Intercepts fetchAPI & auth so the entire app runs offline
// ============================================================

(function () {
    'use strict';

    // ── 1. Inject fake credentials so auth passes ──────────────
    const DEMO_USER = { _id: 'demo001', name: 'Sathish Kumar', email: 'sathishkumark843@gmail.com', role: 'admin' };
    const DEMO_TOKEN = 'demo-mode-token-sqaip-2026';
    localStorage.setItem('sqaip_token', DEMO_TOKEN);
    localStorage.setItem('sqaip_user', JSON.stringify(DEMO_USER));

    // ── 2. Rich mock data ──────────────────────────────────────
    const DEMO_QUESTIONS = [
        { _id: 'q1', questionText: 'What is the time complexity of Binary Search?', subject: 'Computer Science', difficulty: 'Medium', bloomLevel: 'Analyze', status: 'published', tags: ['algorithms', 'search', 'complexity'], options: [{letter:'A',text:'O(n)'},{letter:'B',text:'O(log n)'},{letter:'C',text:'O(n²)'},{letter:'D',text:'O(1)'}], correctAnswer: 'B', explanation: 'Binary search halves the search space each step.' },
        { _id: 'q2', questionText: 'Explain the difference between stack and queue data structures.', subject: 'Computer Science', difficulty: 'Easy', bloomLevel: 'Understand', status: 'published', tags: ['data-structures', 'stack', 'queue'], options: [], correctAnswer: '', explanation: 'Stack is LIFO; Queue is FIFO.' },
        { _id: 'q3', questionText: 'Derive the formula for the area of a circle from first principles.', subject: 'Mathematics', difficulty: 'Hard', bloomLevel: 'Create', status: 'published', tags: ['geometry', 'calculus', 'integration'], options: [], correctAnswer: '', explanation: 'Integrate circumference 2πr from 0 to r.' },
        { _id: 'q4', questionText: 'What is Newton\'s Second Law of Motion?', subject: 'Physics', difficulty: 'Easy', bloomLevel: 'Remember', status: 'published', tags: ['mechanics', 'force', 'newton'], options: [{letter:'A',text:'F=ma'},{letter:'B',text:'E=mc²'},{letter:'C',text:'PV=nRT'},{letter:'D',text:'F=kx'}], correctAnswer: 'A', explanation: 'Force equals mass times acceleration.' },
        { _id: 'q5', questionText: 'Describe the process of photosynthesis and its importance.', subject: 'Biology', difficulty: 'Medium', bloomLevel: 'Understand', status: 'published', tags: ['photosynthesis', 'plants', 'energy'], options: [], correctAnswer: '', explanation: 'Converts CO₂ and H₂O into glucose and O₂ using sunlight.' },
        { _id: 'q6', questionText: 'What are the properties of an ideal gas?', subject: 'Chemistry', difficulty: 'Easy', bloomLevel: 'Remember', status: 'draft', tags: ['gas-laws', 'thermodynamics'], options: [], correctAnswer: '', explanation: 'Ideal gas has elastic collisions, point masses, no intermolecular forces.' },
        { _id: 'q7', questionText: 'Solve: ∫(x² + 3x + 2)dx', subject: 'Mathematics', difficulty: 'Medium', bloomLevel: 'Apply', status: 'published', tags: ['calculus', 'integration'], options: [], correctAnswer: '', explanation: 'x³/3 + 3x²/2 + 2x + C' },
        { _id: 'q8', questionText: 'What is Ohm\'s Law and its applications?', subject: 'Physics', difficulty: 'Easy', bloomLevel: 'Understand', status: 'published', tags: ['electricity', 'circuits', 'ohm'], options: [{letter:'A',text:'V=IR'},{letter:'B',text:'P=IV'},{letter:'C',text:'F=qE'},{letter:'D',text:'E=hf'}], correctAnswer: 'A', explanation: 'Voltage = Current × Resistance.' },
        { _id: 'q9', questionText: 'Explain the concept of recursion with an example.', subject: 'Computer Science', difficulty: 'Hard', bloomLevel: 'Evaluate', status: 'published', tags: ['recursion', 'programming', 'algorithms'], options: [], correctAnswer: '', explanation: 'A function that calls itself with a base case.' },
        { _id: 'q10', questionText: 'What is the Krebs cycle and where does it occur?', subject: 'Biology', difficulty: 'Hard', bloomLevel: 'Analyze', status: 'published', tags: ['metabolism', 'cellular-respiration', 'mitochondria'], options: [], correctAnswer: '', explanation: 'Occurs in mitochondrial matrix; produces NADH, FADH₂, ATP.' },
        { _id: 'q11', questionText: 'What is the difference between ionic and covalent bonds?', subject: 'Chemistry', difficulty: 'Medium', bloomLevel: 'Understand', status: 'published', tags: ['chemical-bonds', 'ionic', 'covalent'], options: [], correctAnswer: '', explanation: 'Ionic: electron transfer; Covalent: electron sharing.' },
        { _id: 'q12', questionText: 'Explain Big-O notation with examples.', subject: 'Computer Science', difficulty: 'Medium', bloomLevel: 'Apply', status: 'published', tags: ['complexity', 'big-o', 'performance'], options: [], correctAnswer: '', explanation: 'Measures algorithm growth rate relative to input size.' },
    ];

    const DEMO_STATS = {
        totalQuestions: 247,
        totalSubjects: 6,
        duplicateQuestions: 18,
        aiPredictions: 312
    };

    const DEMO_ANALYTICS_CARDS = {
        averageDifficulty: 2.4,
        averageScore: 73,
        similarityIndex: 12,
        averageBloomLevel: 3.1
    };

    const DEMO_ANALYTICS_CHARTS = {
        timelineData: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            values: [18, 32, 27, 45, 38, 55]
        },
        bloomData: {
            levels: ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'],
            counts: [38, 52, 45, 61, 28, 23]
        },
        typeData: {
            types: ['Multiple Choice', 'Short Answer', 'Essay', 'True/False'],
            counts: [98, 72, 44, 33]
        },
        performanceData: {
            scores: [88, 81, 92, 85, 90, 83]
        }
    };

    const DEMO_SUBJECT_DIST = [
        { subject: 'Computer Science', count: 72 },
        { subject: 'Mathematics', count: 58 },
        { subject: 'Physics', count: 47 },
        { subject: 'Biology', count: 38 },
        { subject: 'Chemistry', count: 32 }
    ];

    const DEMO_SIMILARITY_BANK = [
        'What is the time complexity of binary search algorithm?',
        'Explain binary search and its time complexity analysis.',
        'Compare linear search and binary search complexity.',
        'How does Newton\'s law of motion apply to everyday life?',
        'What is recursion in programming? Give examples.',
        'Describe photosynthesis and the role of chlorophyll.',
        'What is the derivative of sin(x)?',
        'Explain stack overflow with code examples.',
        'Define polymorphism in object-oriented programming.',
        'What are merge sort advantages over bubble sort?'
    ];

    // ── 3. Demo fetchAPI override ──────────────────────────────
    function buildDemoFetchAPI() {
        return async function demoFetchAPI(endpoint, options = {}) {
            // Simulate network delay (100-400ms)
            await new Promise(r => setTimeout(r, 120 + Math.random() * 280));

            const method = (options.method || 'GET').toUpperCase();
            let body = {};
            try { body = options.body ? JSON.parse(options.body) : {}; } catch (e) {}

            // ── Auth endpoints ──
            if (endpoint.includes('/auth/login')) {
                return { success: true, data: { token: DEMO_TOKEN, user: DEMO_USER }, message: 'Login successful' };
            }
            if (endpoint.includes('/auth/register')) {
                return { success: true, data: { token: DEMO_TOKEN, user: DEMO_USER }, message: 'Registration successful' };
            }
            if (endpoint.includes('/auth/me') || endpoint.includes('/auth/profile')) {
                return { success: true, data: DEMO_USER };
            }
            if (endpoint.includes('/auth/')) {
                return { success: true, data: DEMO_USER };
            }

            // ── Questions stats ──
            if (endpoint.includes('/questions/stats')) {
                return { success: true, data: DEMO_STATS };
            }

            // ── Questions analytics ──
            if (endpoint.includes('/questions/analytics')) {
                return {
                    success: true,
                    data: {
                        subjectDistribution: DEMO_SUBJECT_DIST,
                        difficultyDistribution: [
                            { difficulty: 'Easy', count: 89 },
                            { difficulty: 'Medium', count: 104 },
                            { difficulty: 'Hard', count: 54 }
                        ],
                        duplicatePercentage: 7,
                        mostAskedTopics: [
                            { topic: 'Algorithms', count: 45 },
                            { topic: 'Calculus', count: 38 },
                            { topic: 'Mechanics', count: 32 },
                            { topic: 'Data Structures', count: 28 },
                            { topic: 'Genetics', count: 24 },
                            { topic: 'Thermodynamics', count: 21 }
                        ]
                    }
                };
            }

            // ── Analytics endpoint ──
            if (endpoint.includes('/analytics')) {
                return {
                    success: true,
                    data: { ...DEMO_ANALYTICS_CARDS, ...DEMO_ANALYTICS_CHARTS }
                };
            }

            // ── Single question ──
            if (endpoint.match(/\/questions\/[a-z0-9]+$/) && method === 'GET') {
                const id = endpoint.split('/').pop();
                const q = DEMO_QUESTIONS.find(x => x._id === id) || DEMO_QUESTIONS[0];
                return { success: true, data: q };
            }

            // ── Delete question ──
            if (endpoint.match(/\/questions\/[a-z0-9]+$/) && method === 'DELETE') {
                return { success: true, message: 'Question deleted (demo)' };
            }

            // ── Update question ──
            if (endpoint.match(/\/questions\/[a-z0-9]+$/) && method === 'PUT') {
                return { success: true, data: { ...DEMO_QUESTIONS[0], ...body }, message: 'Question updated (demo)' };
            }

            // ── Create question ──
            if (endpoint.includes('/questions') && method === 'POST') {
                const newQ = { _id: 'new_' + Date.now(), ...body, status: body.status || 'draft' };
                DEMO_QUESTIONS.unshift(newQ);
                return { success: true, data: newQ, message: 'Question created (demo)' };
            }

            // ── List questions ──
            if (endpoint.includes('/questions')) {
                const urlParams = new URLSearchParams(endpoint.split('?')[1] || '');
                const page = parseInt(urlParams.get('page') || '1');
                const limit = parseInt(urlParams.get('limit') || '10');
                const search = (urlParams.get('search') || '').toLowerCase();
                const subject = urlParams.get('subject') || '';
                const difficulty = urlParams.get('difficulty') || '';

                let filtered = DEMO_QUESTIONS.filter(q => {
                    if (search && !q.questionText.toLowerCase().includes(search)) return false;
                    if (subject && q.subject !== subject) return false;
                    if (difficulty && q.difficulty !== difficulty) return false;
                    return true;
                });

                const start = (page - 1) * limit;
                const paginated = filtered.slice(start, start + limit);

                return {
                    success: true,
                    data: {
                        questions: paginated,
                        totalPages: Math.ceil(filtered.length / limit),
                        currentPage: page,
                        total: filtered.length
                    }
                };
            }

            // ── AI Similarity ──
            if (endpoint.includes('/ai/similarity')) {
                const query = (body.question || '').toLowerCase();
                const queryWords = query.split(/\W+/).filter(w => w.length > 3);

                // Score against actual DEMO_QUESTIONS bank for contextual relevance
                const results = DEMO_QUESTIONS.map((q) => {
                    const qText = q.questionText.toLowerCase();
                    const qWords = new Set(qText.split(/\W+/).filter(w => w.length > 3));

                    // Word overlap ratio
                    const overlap = queryWords.filter(w => qWords.has(w)).length;
                    const overlapRatio = queryWords.length > 0 ? overlap / queryWords.length : 0;

                    // Tag/subject boost
                    const tagBoost = q.tags.some(tag => query.includes(tag.toLowerCase())) ? 0.12 : 0;

                    // Final score with small random noise
                    const similarity = Math.min(0.97, Math.max(0.04, overlapRatio * 0.85 + tagBoost + (Math.random() * 0.05)));

                    return { questionText: q.questionText, similarity, subject: q.subject, _id: q._id };
                })
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, body.maxResults || 8);

                return { success: true, data: { results, query: body.question } };
            }

            // ── AI Auto-tag ──
            if (endpoint.includes('/ai/autotag') || endpoint.includes('/ai/tag')) {
                const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science'];
                const levels = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];
                return {
                    success: true,
                    data: {
                        tags: ['algorithm', 'complexity', 'computer-science', 'programming'],
                        subject: subjects[Math.floor(Math.random() * subjects.length)],
                        bloomLevel: levels[Math.floor(Math.random() * levels.length)],
                        difficulty: ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)]
                    }
                };
            }

            // ── AI Analyze ──
            if (endpoint.includes('/ai/analyze')) {
                const levels = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];
                return {
                    success: true,
                    data: {
                        subject: 'Computer Science',
                        difficulty: 'Medium',
                        bloomLevel: levels[Math.floor(Math.random() * levels.length)],
                        tags: ['algorithms', 'complexity', 'programming', 'data-structures'],
                        confidence: 0.87
                    }
                };
            }

            // ── AI Bloom prediction ──
            if (endpoint.includes('/ai/bloom')) {
                const levels = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];
                return {
                    success: true,
                    data: {
                        bloomLevel: levels[Math.floor(Math.random() * levels.length)],
                        confidence: (0.75 + Math.random() * 0.2).toFixed(2),
                        scores: levels.map(() => +(Math.random() * 0.4 + 0.1).toFixed(2))
                    }
                };
            }

            // ── AI Difficulty ──
            if (endpoint.includes('/ai/difficulty')) {
                return {
                    success: true,
                    data: {
                        difficulty: ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)],
                        confidence: (0.80 + Math.random() * 0.18).toFixed(2)
                    }
                };
            }

            // ── AI Duplicate ──
            if (endpoint.includes('/ai/duplicate') || endpoint.includes('/duplicate')) {
                return {
                    success: true,
                    data: {
                        isDuplicate: Math.random() > 0.6,
                        similarity: (0.3 + Math.random() * 0.65).toFixed(2),
                        matches: DEMO_QUESTIONS.slice(0, 3).map(q => ({ ...q, score: +(0.7 + Math.random() * 0.28).toFixed(2) }))
                    }
                };
            }

            // ── Graph / Network data ──
            if (endpoint.includes('/graph') || endpoint.includes('/network')) {
                return {
                    success: true,
                    data: {
                        nodes: [
                            { id: 1, label: 'Computer Science', group: 'subject' },
                            { id: 2, label: 'Mathematics', group: 'subject' },
                            { id: 3, label: 'Physics', group: 'subject' },
                            { id: 4, label: 'Algorithms', group: 'topic' },
                            { id: 5, label: 'Calculus', group: 'topic' },
                            { id: 6, label: 'Mechanics', group: 'topic' },
                            { id: 7, label: 'Data Structures', group: 'topic' },
                            { id: 8, label: 'Integration', group: 'topic' },
                            { id: 9, label: 'Recursion', group: 'topic' },
                            { id: 10, label: 'Sorting', group: 'topic' }
                        ],
                        edges: [
                            { from: 1, to: 4 }, { from: 1, to: 7 }, { from: 1, to: 9 }, { from: 1, to: 10 },
                            { from: 2, to: 5 }, { from: 2, to: 8 },
                            { from: 3, to: 6 },
                            { from: 4, to: 10 }, { from: 4, to: 9 },
                            { from: 5, to: 8 }
                        ]
                    }
                };
            }

            // ── Subject list ──
            if (endpoint.includes('/subjects')) {
                return {
                    success: true,
                    data: ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English']
                };
            }

            // ── Profile update ──
            if (endpoint.includes('/profile') || (endpoint.includes('/users') && method === 'PUT')) {
                return { success: true, data: { ...DEMO_USER, ...body }, message: 'Profile updated (demo)' };
            }

            // ── Default fallback ──
            return { success: true, data: {}, message: 'Demo mode response' };
        };
    }

    // ── 4. Override auth helpers before auth.js runs ──────────
    // We patch window so auth.js picks up the right functions
    window.__DEMO_MODE__ = true;

    // Patch checkAuthentication - always return true (no redirect)
    window.__demoCheckAuth = function () { return true; };

    // Queue the override after DOM is ready (after auth.js defines its fns)
    window.addEventListener('DOMContentLoaded', function patchAuth() {
        // Override fetchAPI
        if (typeof window.fetchAPI !== 'undefined') {
            window.fetchAPI = buildDemoFetchAPI();
        }
        // Override checkAuthentication to never redirect
        if (typeof window.checkAuthentication !== 'undefined') {
            window.checkAuthentication = function () { return true; };
        }
        // Show demo banner
        showDemoBanner();
    }, true); // capture phase so it fires before other DOMContentLoaded

    // Also override immediately (some scripts attach before DOMContentLoaded)
    setTimeout(function () {
        if (typeof window.fetchAPI !== 'undefined') {
            window.fetchAPI = buildDemoFetchAPI();
        }
        if (typeof window.checkAuthentication !== 'undefined') {
            window.checkAuthentication = function () { return true; };
        }
    }, 0);

    // ── 5. Demo banner ─────────────────────────────────────────
    function showDemoBanner() {
        if (document.getElementById('demoBanner')) return;
        const banner = document.createElement('div');
        banner.id = 'demoBanner';
        banner.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; z-index: 99999;
            background: linear-gradient(90deg, #6e40c9, #58a6ff, #3fb950, #f0883e, #6e40c9);
            background-size: 300% 100%;
            animation: demoBannerSlide 4s linear infinite;
            color: #fff; font-size: 0.72rem; font-weight: 700;
            text-align: center; padding: 5px 8px; letter-spacing: 0.5px;
            font-family: 'Inter', sans-serif;
        `;
        banner.innerHTML = '🚀 DEMO MODE — Running without backend &nbsp;|&nbsp; All data is simulated &nbsp;|&nbsp; SQAIP Platform';
        document.body.prepend(banner);
        document.body.style.paddingTop = (document.body.style.paddingTop || '0px');
        // Add keyframe animation
        if (!document.getElementById('demoBannerStyle')) {
            const style = document.createElement('style');
            style.id = 'demoBannerStyle';
            style.textContent = `
                @keyframes demoBannerSlide {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 300% 50%; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // ── 6. Patch auth.js checkAuthentication before it causes redirect ──
    // auth.js calls checkAuthentication() inside DOMContentLoaded.
    // We intercept by defining the function early and making it a no-op.
    // Since this script loads BEFORE auth.js (via HTML script order), 
    // we define stub functions that auth.js will overwrite, then we re-override.
    Object.defineProperty(window, 'checkAuthentication', {
        configurable: true,
        get: function () { return function () { return true; }; },
        set: function (fn) {
            // Replace with our wrapper that always returns true
            Object.defineProperty(window, 'checkAuthentication', {
                configurable: true,
                writable: true,
                value: function () { return true; }
            });
        }
    });

    Object.defineProperty(window, 'fetchAPI', {
        configurable: true,
        get: function () { return buildDemoFetchAPI(); },
        set: function (fn) {
            // Replace with our demo version
            Object.defineProperty(window, 'fetchAPI', {
                configurable: true,
                writable: true,
                value: buildDemoFetchAPI()
            });
        }
    });

    console.log('%c🚀 SQAIP DEMO MODE ACTIVE', 'color:#6e40c9;font-size:1.2rem;font-weight:bold');
    console.log('%cAll API calls are intercepted and returning demo data.', 'color:#58a6ff;');

})();
