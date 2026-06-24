// ===================================
// ANALYTICS.JS - Analytics Dashboard
// ===================================

let analyticsCharts = {};

document.addEventListener('DOMContentLoaded', () => {
    initializeAnalytics();
    loadAnalyticsData();
});

// ===================================
// INITIALIZE
// ===================================

function initializeAnalytics() {
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', loadAnalyticsData);
    }

    // Set default date range (last 30 days)
    const toDate = new Date();
    const fromDate = new Date(toDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const fromDateInput = document.getElementById('fromDate');
    const toDateInput = document.getElementById('toDate');

    if (fromDateInput) fromDateInput.value = formatDate(fromDate);
    if (toDateInput) toDateInput.value = formatDate(toDate);

    initializeCharts();
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

// ===================================
// LOAD DATA
// ===================================

async function loadAnalyticsData() {
    try {
        showLoading(true);

        const fromDate = document.getElementById('fromDate')?.value;
        const toDate = document.getElementById('toDate')?.value;
        const subject = document.getElementById('filterSubject')?.value;

        const queryParams = new URLSearchParams();
        if (fromDate) queryParams.append('fromDate', fromDate);
        if (toDate) queryParams.append('toDate', toDate);
        if (subject) queryParams.append('subject', subject);

        const data = await fetchAPI(`/analytics?${queryParams}`);

        if (data && data.success) {
            updateAnalyticsCards(data.data);
            updateAnalyticsCharts(data.data);
        }
    } catch (error) {
        console.error('Error loading analytics:', error);
        showToast('Failed to load analytics', 'danger', 'Error');
    } finally {
        showLoading(false);
    }
}

function updateAnalyticsCards(data) {
    document.getElementById('avgDifficulty').textContent = 
        (data.averageDifficulty || 0).toFixed(2);
    document.getElementById('avgScore').textContent = 
        (data.averageScore || 0).toFixed(0) + '%';
    document.getElementById('similarityIndex').textContent = 
        (data.similarityIndex || 0).toFixed(0) + '%';
    document.getElementById('avgBloomLevel').textContent = 
        (data.averageBloomLevel || 0).toFixed(1);
}

// ===================================
// CHARTS
// ===================================

function initializeCharts() {
    // Timeline Chart
    const timelineCtx = document.getElementById('timelineChart');
    if (timelineCtx) {
        analyticsCharts.timeline = new Chart(timelineCtx, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Questions Created',
                    data: [12, 19, 3, 25],
                    borderColor: 'rgba(102, 126, 234, 1)',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { labels: { color: 'rgba(255, 255, 255, 0.8)' } }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: 'rgba(255, 255, 255, 0.8)' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: {
                        ticks: { color: 'rgba(255, 255, 255, 0.8)' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
    }

    // Bloom Taxonomy Chart
    const bloomCtx = document.getElementById('bloomChart');
    if (bloomCtx) {
        analyticsCharts.bloom = new Chart(bloomCtx, {
            type: 'bar',
            data: {
                labels: ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'],
                datasets: [{
                    label: 'Questions',
                    data: [15, 20, 18, 25, 12, 10],
                    backgroundColor: [
                        'rgba(102, 126, 234, 0.8)',
                        'rgba(118, 75, 162, 0.8)',
                        'rgba(240, 147, 251, 0.8)',
                        'rgba(245, 87, 108, 0.8)',
                        'rgba(74, 144, 226, 0.8)',
                        'rgba(76, 175, 80, 0.8)'
                    ],
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

    // Type Chart
    const typeCtx = document.getElementById('typeChart');
    if (typeCtx) {
        analyticsCharts.type = new Chart(typeCtx, {
            type: 'doughnut',
            data: {
                labels: ['Multiple Choice', 'Short Answer', 'Essay', 'True/False'],
                datasets: [{
                    data: [40, 25, 20, 15],
                    backgroundColor: [
                        'rgba(102, 126, 234, 0.8)',
                        'rgba(118, 75, 162, 0.8)',
                        'rgba(240, 147, 251, 0.8)',
                        'rgba(245, 87, 108, 0.8)'
                    ],
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { labels: { color: 'rgba(255, 255, 255, 0.8)' } }
                }
            }
        });
    }

    // Performance Chart
    const performanceCtx = document.getElementById('performanceChart');
    if (performanceCtx) {
        analyticsCharts.performance = new Chart(performanceCtx, {
            type: 'radar',
            data: {
                labels: ['Clarity', 'Relevance', 'Difficulty', 'Depth', 'Engagement', 'Validity'],
                datasets: [{
                    label: 'Performance Score',
                    data: [85, 78, 90, 82, 88, 80],
                    borderColor: 'rgba(102, 126, 234, 1)',
                    backgroundColor: 'rgba(102, 126, 234, 0.2)',
                    borderWidth: 2,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { labels: { color: 'rgba(255, 255, 255, 0.8)' } }
                },
                scales: {
                    r: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: 'rgba(255, 255, 255, 0.8)' }
                    }
                }
            }
        });
    }
}

function updateAnalyticsCharts(data) {
    // Update timeline
    if (analyticsCharts.timeline && data.timelineData) {
        analyticsCharts.timeline.data.labels = data.timelineData.labels;
        analyticsCharts.timeline.data.datasets[0].data = data.timelineData.values;
        analyticsCharts.timeline.update();
    }

    // Update bloom
    if (analyticsCharts.bloom && data.bloomData) {
        analyticsCharts.bloom.data.labels = data.bloomData.levels;
        analyticsCharts.bloom.data.datasets[0].data = data.bloomData.counts;
        analyticsCharts.bloom.update();
    }

    // Update type
    if (analyticsCharts.type && data.typeData) {
        analyticsCharts.type.data.labels = data.typeData.types;
        analyticsCharts.type.data.datasets[0].data = data.typeData.counts;
        analyticsCharts.type.update();
    }

    // Update performance
    if (analyticsCharts.performance && data.performanceData) {
        analyticsCharts.performance.data.datasets[0].data = data.performanceData.scores;
        analyticsCharts.performance.update();
    }
}
