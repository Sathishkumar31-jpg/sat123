// ===================================
// SIMILARITY.JS - Similarity Finder
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('similarityForm');
    if (form) {
        form.addEventListener('submit', findSimilarQuestions);
    }
});

// ===================================
// FIND SIMILAR QUESTIONS
// ===================================

async function findSimilarQuestions(e) {
    e.preventDefault();

    const searchQuery = document.getElementById('searchQuery').value.trim();
    if (!searchQuery) {
        showToast('Please enter a question', 'warning', 'Warning');
        return;
    }

    const searchLoading = document.getElementById('searchLoading');
    const duplicateAlert = document.getElementById('duplicateAlert');
    const resultsSection = document.getElementById('resultsSection');
    const noResults = document.getElementById('noResults');

    if (searchLoading) searchLoading.style.display = 'block';
    if (duplicateAlert) duplicateAlert.classList.remove('visible');
    if (resultsSection) resultsSection.style.display = 'none';
    if (noResults) noResults.style.display = 'none';

    try {
        const token = getToken();
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const rawRes = await fetch(`http://localhost:5000/api/ai/similarity`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                question: searchQuery,
                threshold: 0.3,
                maxResults: 10
            })
        });
        const data = await rawRes.json();

        if (searchLoading) searchLoading.style.display = 'none';

        if (data && data.success && data.data) {
            // Support both data.data.results and data.results
            const rawResults = data.data.results || data.results || [];
            const results = rawResults.filter(r => r.similarity >= 0.3);

            if (results.length > 0) {
                // Check for near-exact duplicate
                const exactMatch = results.find(r => r.similarity >= 0.90);
                if (exactMatch && duplicateAlert) {
                    duplicateAlert.classList.add('visible');
                    document.getElementById('duplicateQuestionText').textContent = exactMatch.questionText;
                }

                displayResults(results);
                if (resultsSection) resultsSection.style.display = 'block';
            } else {
                // Show blinking not found
                showBlinkingNotFound(noResults);
            }
        } else {
            showBlinkingNotFound(noResults);
        }

    } catch (error) {
        console.error('Similarity search error:', error);
        if (searchLoading) searchLoading.style.display = 'none';
        showBlinkingNotFound(noResults);
    }
}

// ===================================
// BLINKING NOT FOUND
// ===================================

function showBlinkingNotFound(el) {
    if (!el) return;
    el.innerHTML = `
        <style>
            @keyframes blinkNotFound {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.4; transform: scale(0.97); }
            }
            .blink-not-found {
                animation: blinkNotFound 1.4s ease-in-out infinite;
            }
        </style>
        <div class="blink-not-found">
            <i class="fas fa-search-minus" style="font-size:2.5rem;margin-bottom:14px;display:block;color:#484f58;"></i>
            <div style="font-size:1rem;font-weight:700;color:#8b949e;">No Similar Questions Found</div>
            <div style="font-size:0.82rem;color:#484f58;margin-top:6px;">Try rephrasing your question or use different keywords.</div>
        </div>
    `;
    el.style.display = 'block';
}

// ===================================
// DISPLAY RESULTS
// ===================================

function displayResults(results) {
    const container = document.getElementById('similarityResults');
    if (!container) return;

    container.innerHTML = results.map((result, index) => {
        const score = Math.round(result.similarity * 100);
        let scoreClass = 'score-green';
        if (score >= 90) scoreClass = 'score-100';
        else if (score >= 50) scoreClass = 'score-yellow';

        return `
            <div class="result-item">
                <div class="result-left">
                    <div class="result-num">${index + 1}</div>
                    <div class="result-text">${result.questionText}</div>
                </div>
                <div class="${scoreClass}">${score}%</div>
            </div>
        `;
    }).join('');
}
