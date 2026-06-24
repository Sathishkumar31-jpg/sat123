// ==========================================
// AUTOTAG.JS - Auto Tagging Logic
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    loadQuestionsForTagging();
    const form = document.getElementById('autoTagForm');
    if (form) {
        form.addEventListener('submit', generateAutoTags);
    }
});

let suggestedData = [];

// ==========================================
// LOAD QUESTIONS
// ==========================================

async function loadQuestionsForTagging() {
    const list = document.getElementById('questionsList');
    if (!list) return;

    try {
        const data = await fetchAPI('/questions?limit=10');
        if (data && data.success && data.data.questions) {
            list.innerHTML = data.data.questions.map(q => `
                <div class="form-check mb-2 glassmorphic-sub p-2" style="border-radius:8px;">
                    <input class="form-check-input" type="checkbox" value="${q._id}" id="q_${q._id}" name="questionIds" checked>
                    <label class="form-check-label" for="q_${q._id}" style="font-size:0.85rem;cursor:pointer;">
                        ${q.questionText}
                    </label>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error('Error loading questions:', err);
    }
}

// ==========================================
// GENERATE TAGS
// ==========================================

async function generateAutoTags(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const qIds = formData.getAll('questionIds');

    if (qIds.length === 0) {
        showToast('Please select at least one question', 'warning', 'Warning');
        return;
    }

    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.remove('d-none');

    try {
        // In demo mode, we'll get several results
        const results = [];
        for (const id of qIds) {
            const data = await fetchAPI('/ai/autotag', {
                method: 'POST',
                body: JSON.stringify({ questionId: id })
            });
            if (data && data.success) {
                results.push({ id, ...data.data });
            }
        }

        suggestedData = results;
        displayTagResults(results);
        document.getElementById('resultsSection').style.display = 'block';
        window.scrollTo({ top: document.getElementById('resultsSection').offsetTop - 20, behavior: 'smooth' });

    } catch (err) {
        console.error('Error generating tags:', err);
    } finally {
        overlay.classList.add('d-none');
    }
}

// ==========================================
// DISPLAY RESULTS
// ==========================================

function displayTagResults(results) {
    const container = document.getElementById('tagResults');
    if (!container) return;

    container.innerHTML = results.map(r => `
        <div class="mb-4 p-3 border-bottom" style="border-color:#30363d !important;">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="badge bg-secondary">Question ID: ${r.id}</span>
                <span class="text-info" style="font-size:0.75rem;"><i class="fas fa-brain"></i> AI Confidence High</span>
            </div>
            <div class="row g-2">
                <div class="col-md-4">
                    <small class="text-muted d-block">Suggested Subject</small>
                    <div class="p-2 glassmorphic-sub text-light rounded mt-1">${r.subject}</div>
                </div>
                <div class="col-md-4">
                    <small class="text-muted d-block">Suggested Difficulty</small>
                    <div class="p-2 glassmorphic-sub text-light rounded mt-1">${r.difficulty}</div>
                </div>
                <div class="col-md-4">
                    <small class="text-muted d-block">Bloom Level</small>
                    <div class="p-2 glassmorphic-sub text-light rounded mt-1">${r.bloomLevel}</div>
                </div>
            </div>
            <div class="mt-3">
                <small class="text-muted d-block mb-1">Tags</small>
                ${r.tags.map(t => `<span class="badge rounded-pill bg-primary me-1">${t}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

// ==========================================
// APPLY / REJECT
// ==========================================

const applyBtn = document.getElementById('applySuggestionsBtn');
if (applyBtn) {
    applyBtn.addEventListener('click', () => {
        showToast('Suggestions applied to database! (Demo)', 'success', 'Success');
        setTimeout(() => {
            document.getElementById('resultsSection').style.display = 'none';
        }, 1500);
    });
}

const rejectBtn = document.getElementById('rejectSuggestionsBtn');
if (rejectBtn) {
    rejectBtn.addEventListener('click', () => {
        document.getElementById('resultsSection').style.display = 'none';
        showToast('Suggestions rejected', 'info');
    });
}
