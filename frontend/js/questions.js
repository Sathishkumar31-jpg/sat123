// ===================================
// QUESTIONS.JS - Questions Management
// ===================================

let currentPage = 1;
let pageSize = 50;
let totalPages = 1;

// ===================================
// PAGE INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    // Questions Page
    if (document.getElementById('questionsTable')) {
        loadQuestions();
        initializeFilters();
    }

    // Add Question Page
    if (document.getElementById('addQuestionForm')) {
        initializeAddQuestion();
    }

    // Edit Question Page
    if (document.getElementById('editQuestionForm')) {
        initializeEditQuestion();
    }
});

// ===================================
// LOAD QUESTIONS
// ===================================

async function loadQuestions(page = 1) {
    try {
        showLoading(true);
        currentPage = page;

        const filters = getFilters();
        const queryParams = new URLSearchParams({
            page,
            limit: pageSize,
            ...filters
        });

        const data = await fetchAPI(`/questions?${queryParams}`);

        if (data && data.success) {
            populateQuestionsTable(data.data.questions);
            totalPages = data.data.totalPages;
            updatePagination(data.data.currentPage, data.data.totalPages);
        }
    } catch (error) {
        showToast('Failed to load questions', 'danger', 'Error');
    } finally {
        showLoading(false);
    }
}

function populateQuestionsTable(questions) {
    const table = document.getElementById('questionsTable');
    if (!table) return;

    if (!questions || questions.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;padding:40px;color:#8b949e;">
                    <i class="fas fa-inbox" style="font-size:2rem;display:block;margin-bottom:8px;"></i>
                    No questions found
                </td>
            </tr>
        `;
        return;
    }

    table.innerHTML = questions.map(q => {
        const diffClass = q.difficulty === 'Easy' ? 'diff-easy' : q.difficulty === 'Medium' ? 'diff-medium' : 'diff-hard';
        const tags = (q.tags || []).map(t => `<span class="tag-pill">${t}</span>`).join('');
        // Subject — wrap long names so they look like screenshot (2-line pills)
        const subjLines = (q.subject || 'N/A').split(' ');
        const subjHtml = subjLines.length > 1
            ? `<span class="subject-pill">${subjLines[0]}<br>${subjLines.slice(1).join(' ')}</span>`
            : `<span class="subject-pill">${q.subject || 'N/A'}</span>`;

        return `
        <tr>
            <td><div class="q-text">${q.questionText}</div></td>
            <td>${subjHtml}</td>
            <td>${tags || '<span style="color:#484f58">—</span>'}</td>
            <td><span class="${diffClass}">${q.difficulty || 'Easy'}</span></td>
            <td><span class="bloom-pill">${q.bloomLevel || 'Understand'}</span></td>
            <td>
                <div class="action-btns">
                    <button class="icon-btn" title="Edit Question" onclick="location.href='edit-question.html?id=${q._id}'">
                        <i class="far fa-edit"></i>
                    </button>
                    <button class="icon-btn del" title="Delete" onclick="confirmDelete('${q._id}')">
                        <i class="far fa-trash-alt"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    }).join('');
}


function getStatusColor(status) {
    const colors = {
        'draft': 'secondary',
        'published': 'success',
        'archived': 'warning'
    };
    return colors[status] || 'secondary';
}

// ===================================
// FILTERS
// ===================================

function initializeFilters() {
    const filterSubject = document.getElementById('filterSubject');
    const filterDifficulty = document.getElementById('filterDifficulty');
    const filterStatus = document.getElementById('filterStatus');
    const resetFilters = document.getElementById('resetFilters');
    const searchQuestions = document.getElementById('searchQuestions');

    if (filterSubject) filterSubject.addEventListener('change', () => loadQuestions());
    if (filterDifficulty) filterDifficulty.addEventListener('change', () => loadQuestions());
    if (filterStatus) filterStatus.addEventListener('change', () => loadQuestions());
    if (resetFilters) resetFilters.addEventListener('click', resetAllFilters);
    if (searchQuestions) {
        let searchTimeout;
        searchQuestions.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => loadQuestions(), 500);
        });
    }
}

function getFilters() {
    return {
        subject: document.getElementById('filterSubject')?.value || '',
        difficulty: document.getElementById('filterDifficulty')?.value || '',
        status: document.getElementById('filterStatus')?.value || '',
        search: document.getElementById('searchQuestions')?.value || ''
    };
}

function resetAllFilters() {
    const filterSubject = document.getElementById('filterSubject');
    const filterDifficulty = document.getElementById('filterDifficulty');
    const filterStatus = document.getElementById('filterStatus');
    const searchQuestions = document.getElementById('searchQuestions');

    if (filterSubject) filterSubject.value = '';
    if (filterDifficulty) filterDifficulty.value = '';
    if (filterStatus) filterStatus.value = '';
    if (searchQuestions) searchQuestions.value = '';

    loadQuestions();
}

// ===================================
// PAGINATION
// ===================================

function updatePagination(current, total) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    pagination.innerHTML = '';

    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${current === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#" onclick="loadQuestions(${current - 1})">Previous</a>`;
    pagination.appendChild(prevLi);

    // Page numbers
    for (let i = 1; i <= total; i++) {
        if (i === current) {
            const activeLi = document.createElement('li');
            activeLi.className = 'page-item active';
            activeLi.innerHTML = `<span class="page-link">${i}</span>`;
            pagination.appendChild(activeLi);
        } else if (i === 1 || i === total || (i >= current - 2 && i <= current + 2)) {
            const li = document.createElement('li');
            li.className = 'page-item';
            li.innerHTML = `<a class="page-link" href="#" onclick="loadQuestions(${i})">${i}</a>`;
            pagination.appendChild(li);
        }
    }

    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${current === total ? 'disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#" onclick="loadQuestions(${current + 1})">Next</a>`;
    pagination.appendChild(nextLi);
}

// ===================================
// DELETE QUESTION
// ===================================

let selectedDeleteId = null;

function confirmDelete(id) {
    selectedDeleteId = id;
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    deleteModal.show();
}

document.addEventListener('DOMContentLoaded', () => {
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', async () => {
            if (!selectedDeleteId) return;

            try {
                showLoading(true);
                const data = await fetchAPI(`/questions/${selectedDeleteId}`, { method: 'DELETE' });

                if (data && data.success) {
                    showToast('Question deleted successfully', 'success', 'Success');
                    loadQuestions();
                    bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
                } else {
                    showToast(data.message || 'Failed to delete question', 'danger', 'Error');
                }
            } catch (error) {
                showToast('Error deleting question', 'danger', 'Error');
            } finally {
                showLoading(false);
            }
        });
    }
});

// ===================================
// ADD QUESTION
// ===================================

function initializeAddQuestion() {
    const form = document.getElementById('addQuestionForm');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const addOptionBtn = document.getElementById('addOptionBtn');

    if (form) form.addEventListener('submit', submitQuestion);
    if (analyzeBtn) analyzeBtn.addEventListener('click', analyzeQuestion);
    if (addOptionBtn) addOptionBtn.addEventListener('click', addOptionField);
}

function addOptionField() {
    const container = document.getElementById('optionsContainer');
    const optionCount = container.querySelectorAll('.option-item').length;
    const letter = String.fromCharCode(65 + optionCount);

    const optionHtml = `
        <div class="option-item mb-3 glassmorphic p-3">
            <div class="d-flex gap-2">
                <span class="option-label">${letter}.</span>
                <input type="text" class="form-control option-input" placeholder="Option ${letter}" required>
                <button type="button" class="btn btn-sm btn-danger" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', optionHtml);
}

async function submitQuestion(e) {
    e.preventDefault();

    const questionText = document.getElementById('questionText').value;
    const subject = document.getElementById('subject').value;
    const difficulty = document.getElementById('difficulty').value;
    const correctAnswer = document.getElementById('correctAnswer').value;
    const status = document.getElementById('status').value;
    const tags = document.getElementById('tags').value;
    const bloomLevel = document.getElementById('bloomLevel').value;
    const explanation = document.getElementById('explanation').value;

    const options = Array.from(document.querySelectorAll('.option-input'))
        .map((input, index) => ({
            letter: String.fromCharCode(65 + index),
            text: input.value
        }));

    const questionData = {
        questionText,
        subject,
        difficulty,
        options,
        correctAnswer,
        status,
        tags: tags.split(',').map(t => t.trim()),
        bloomLevel,
        explanation
    };

    try {
        showLoading(true);
        const data = await fetchAPI('/questions', {
            method: 'POST',
            body: JSON.stringify(questionData)
        });

        if (data && data.success) {
            showToast('Question created successfully', 'success', 'Success');
            setTimeout(() => window.location.href = '/questions.html', 1000);
        } else {
            showToast(data.message || 'Failed to create question', 'danger', 'Error');
        }
    } catch (error) {
        showToast('Error creating question', 'danger', 'Error');
    } finally {
        showLoading(false);
    }
}

async function analyzeQuestion() {
    const questionText = document.getElementById('questionText').value;
    if (!questionText) {
        showToast('Please enter a question first', 'warning', 'Warning');
        return;
    }

    try {
        showLoading(true);
        const data = await fetchAPI('/ai/analyze', {
            method: 'POST',
            body: JSON.stringify({ question: questionText })
        });

        if (data && data.success) {
            const suggestions = data.data;
            const suggestionsList = document.getElementById('suggestionsList');
            
            suggestionsList.innerHTML = `
                <p><strong>Subject:</strong> ${suggestions.subject}</p>
                <p><strong>Difficulty:</strong> ${suggestions.difficulty}</p>
                <p><strong>Bloom Level:</strong> ${suggestions.bloomLevel}</p>
                <p><strong>Suggested Tags:</strong> ${suggestions.tags.join(', ')}</p>
            `;

            document.getElementById('aiSuggestions').style.display = 'block';
            showToast('AI analysis complete', 'success', 'Success');
        }
    } catch (error) {
        showToast('Error analyzing question', 'danger', 'Error');
    } finally {
        showLoading(false);
    }
}

// ===================================
// EDIT QUESTION
// ===================================

function initializeEditQuestion() {
    const urlParams = new URLSearchParams(window.location.search);
    const questionId = urlParams.get('id');

    if (questionId) {
        loadQuestionForEdit(questionId);
    }

    const form = document.getElementById('editQuestionForm');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const addOptionBtn = document.getElementById('addOptionBtn');

    if (form) form.addEventListener('submit', submitEditQuestion);
    if (analyzeBtn) analyzeBtn.addEventListener('click', analyzeQuestion);
    if (addOptionBtn) addOptionBtn.addEventListener('click', addOptionField);
}

async function loadQuestionForEdit(id) {
    try {
        showLoading(true);
        const data = await fetchAPI(`/questions/${id}`);

        if (data && data.success) {
            const question = data.data;
            document.getElementById('questionId').value = question._id;
            document.getElementById('questionText').value = question.questionText;
            document.getElementById('subject').value = question.subject;
            document.getElementById('difficulty').value = question.difficulty;
            document.getElementById('correctAnswer').value = question.correctAnswer;
            document.getElementById('status').value = question.status;
            document.getElementById('tags').value = question.tags.join(', ');
            document.getElementById('bloomLevel').value = question.bloomLevel || '';
            document.getElementById('explanation').value = question.explanation || '';

            // Populate options
            const container = document.getElementById('optionsContainer');
            container.innerHTML = question.options.map((opt, idx) => `
                <div class="option-item mb-3 glassmorphic p-3">
                    <div class="d-flex gap-2">
                        <span class="option-label">${opt.letter}.</span>
                        <input type="text" class="form-control option-input" value="${opt.text}" required>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        showToast('Failed to load question', 'danger', 'Error');
    } finally {
        showLoading(false);
    }
}

async function submitEditQuestion(e) {
    e.preventDefault();

    const questionId = document.getElementById('questionId').value;
    const questionText = document.getElementById('questionText').value;
    const subject = document.getElementById('subject').value;
    const difficulty = document.getElementById('difficulty').value;
    const correctAnswer = document.getElementById('correctAnswer').value;
    const status = document.getElementById('status').value;
    const tags = document.getElementById('tags').value;
    const bloomLevel = document.getElementById('bloomLevel').value;
    const explanation = document.getElementById('explanation').value;

    const options = Array.from(document.querySelectorAll('.option-input'))
        .map((input, index) => ({
            letter: String.fromCharCode(65 + index),
            text: input.value
        }));

    const questionData = {
        questionText,
        subject,
        difficulty,
        options,
        correctAnswer,
        status,
        tags: tags.split(',').map(t => t.trim()),
        bloomLevel,
        explanation
    };

    try {
        showLoading(true);
        const data = await fetchAPI(`/questions/${questionId}`, {
            method: 'PUT',
            body: JSON.stringify(questionData)
        });

        if (data && data.success) {
            showToast('Question updated successfully', 'success', 'Success');
            setTimeout(() => window.location.href = '/questions.html', 1000);
        } else {
            showToast(data.message || 'Failed to update question', 'danger', 'Error');
        }
    } catch (error) {
        showToast('Error updating question', 'danger', 'Error');
    } finally {
        showLoading(false);
    }
}
