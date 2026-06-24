// ===================================
// DASHBOARD.JS - Dashboard Functionality
// ===================================

let charts = {};

// ===================================
// INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
    initializeCharts();
});

// ===================================
// LOAD DASHBOARD DATA
// ===================================

async function loadDashboardData() {
    try {
        showLoading(true);

        // Fetch statistics
        const statsData = await fetchAPI('/questions/stats');
        if (statsData && statsData.success) {
            updateStatistics(statsData.data);
        }

        // Fetch recent questions
        const questionsData = await fetchAPI('/questions?limit=5');
        if (questionsData && questionsData.success) {
            populateRecentQuestions(questionsData.data.questions);
        }

        // Fetch chart data
        await loadChartData();

    } catch (error) {
        console.error('Error loading dashboard:', error);
        showToast('Failed to load dashboard data', 'danger', 'Error');
    } finally {
        showLoading(false);
    }
}

function updateStatistics(data) {
    document.getElementById('totalQuestions').textContent = data.totalQuestions || 0;
    document.getElementById('totalSubjects').textContent = data.totalSubjects || 0;
    document.getElementById('duplicateQuestions').textContent = data.duplicateQuestions || 0;
    document.getElementById('aiPredictions').textContent = data.aiPredictions || 0;
}

function populateRecentQuestions(questions) {
    const table = document.getElementById('recentQuestionsTable');
    if (!table) return;

    if (questions.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4">
                    <i class="fas fa-inbox"></i> No questions yet
                </td>
            </tr>
        `;
        return;
    }

    table.innerHTML = questions.map(q => `
        <tr>
            <td>
                <span class="text-truncate" style="max-width: 200px;">
                    ${q.questionText.substring(0, 50)}...
                </span>
            </td>
            <td>${q.subject || 'N/A'}</td>
            <td>
                <span class="badge bg-${getDifficultyColor(q.difficulty)}">
                    ${q.difficulty || 'N/A'}
                </span>
            </td>
            <td>
                <span class="badge bg-${getStatusColor(q.status)}">
                    ${q.status || 'draft'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-info" onclick="editQuestion('${q._id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteQuestion('${q._id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function getDifficultyColor(difficulty) {
    const colors = {
        'Easy': 'success',
        'Medium': 'warning',
        'Hard': 'danger'
    };
    return colors[difficulty] || 'secondary';
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
// LOAD CHART DATA
// ===================================

async function loadChartData() {
    try {
        const data = await fetchAPI('/questions/analytics');
        if (data && data.success) {
            updateCharts(data.data);
        }
    } catch (error) {
        console.error('Error loading chart data:', error);
    }
}

function updateCharts(data) {
    // Subject Distribution
    if (charts.subject) {
        charts.subject.data.labels = data.subjectDistribution.map(item => item.subject);
        charts.subject.data.datasets[0].data = data.subjectDistribution.map(item => item.count);
        charts.subject.update();
    }

    // Difficulty Distribution
    if (charts.difficulty) {
        charts.difficulty.data.labels = data.difficultyDistribution.map(item => item.difficulty);
        charts.difficulty.data.datasets[0].data = data.difficultyDistribution.map(item => item.count);
        charts.difficulty.update();
    }

    // Duplicate Percentage
    if (charts.duplicate) {
        const duplicatePercent = data.duplicatePercentage || 0;
        charts.duplicate.data.datasets[0].data = [duplicatePercent, 100 - duplicatePercent];
        charts.duplicate.update();
    }

    // Most Asked Topics
    if (charts.topics) {
        charts.topics.data.labels = data.mostAskedTopics.map(item => item.topic).slice(0, 10);
        charts.topics.data.datasets[0].data = data.mostAskedTopics.map(item => item.count).slice(0, 10);
        charts.topics.update();
    }
}

// ===================================
// CHART INITIALIZATION
// ===================================

function initializeCharts() {
    // Subject Distribution Chart
    const subjectCtx = document.getElementById('subjectChart');
    if (subjectCtx) {
        charts.subject = new Chart(subjectCtx, {
            type: 'doughnut',
            data: {
                labels: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science'],
                datasets: [{
                    data: [30, 25, 20, 15, 10],
                    backgroundColor: [
                        '#667eea',
                        '#764ba2',
                        '#f093fb',
                        '#f5576c',
                        '#4facfe'
                    ],
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        labels: { color: 'rgba(255, 255, 255, 0.8)' }
                    }
                }
            }
        });
    }

    // Difficulty Distribution Chart
    const difficultyCtx = document.getElementById('difficultyChart');
    if (difficultyCtx) {
        charts.difficulty = new Chart(difficultyCtx, {
            type: 'bar',
            data: {
                labels: ['Easy', 'Medium', 'Hard'],
                datasets: [{
                    label: 'Questions',
                    data: [40, 35, 25],
                    backgroundColor: [
                        'rgba(72, 187, 120, 0.8)',
                        'rgba(237, 137, 54, 0.8)',
                        'rgba(245, 101, 101, 0.8)'
                    ],
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: 'rgba(255, 255, 255, 0.8)' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: {
                        ticks: { color: 'rgba(255, 255, 255, 0.8)' },
                        grid: { display: false }
                    }
                }
            }
        });
    }

    // Duplicate Percentage Chart
    const duplicateCtx = document.getElementById('duplicateChart');
    if (duplicateCtx) {
        charts.duplicate = new Chart(duplicateCtx, {
            type: 'pie',
            data: {
                labels: ['Duplicates', 'Unique'],
                datasets: [{
                    data: [15, 85],
                    backgroundColor: [
                        'rgba(245, 101, 101, 0.8)',
                        'rgba(72, 187, 120, 0.8)'
                    ],
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        labels: { color: 'rgba(255, 255, 255, 0.8)' }
                    }
                }
            }
        });
    }

    // Most Asked Topics Chart
    const topicsCtx = document.getElementById('topicsChart');
    if (topicsCtx) {
        charts.topics = new Chart(topicsCtx, {
            type: 'horizontalBar',
            data: {
                labels: ['Calculus', 'Algebra', 'Geometry', 'Statistics', 'Trigonometry'],
                datasets: [{
                    label: 'Questions',
                    data: [45, 38, 32, 28, 25],
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderRadius: 8
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: { color: 'rgba(255, 255, 255, 0.8)' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        ticks: { color: 'rgba(255, 255, 255, 0.8)' },
                        grid: { display: false }
                    }
                }
            }
        });
    }
}

// ===================================
// ACTIONS
// ===================================

function editQuestion(id) {
    window.location.href = `/edit-question.html?id=${id}`;
}

async function deleteQuestion(id) {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
        showLoading(true);
        const data = await fetchAPI(`/questions/${id}`, { method: 'DELETE' });

        if (data && data.success) {
            showToast('Question deleted successfully', 'success', 'Success');
            loadDashboardData();
        } else {
            showToast(data.message || 'Failed to delete question', 'danger', 'Error');
        }
    } catch (error) {
        showToast('Error deleting question', 'danger', 'Error');
    } finally {
        showLoading(false);
    }
}
