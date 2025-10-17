// performanceModule.js
let reviews = [];

export function init() {
    if (!localStorage.getItem('reviews')) {
        reviews = [];
        saveReviews();
    } else {
        reviews = JSON.parse(localStorage.getItem('reviews'));
    }
}

export function addReview(employeeId, rating, feedback) {
    reviews.push({ employeeId, date: new Date().toISOString(), rating, feedback });
    saveReviews();
}

export function getAverageRating(employeeId) {
    const empReviews = reviews.filter(r => r.employeeId === employeeId);
    if (empReviews.length === 0) return 0;
    return empReviews.reduce((sum, r) => sum + r.rating, 0) / empReviews.length;
}

function saveReviews() {
    localStorage.setItem('reviews', JSON.stringify(reviews));
}

export function render(content) {
    content.innerHTML = `
        <h2>Đánh giá Hiệu suất</h2>
        <input type="number" id="rev-emp-id" placeholder="ID Nhân viên">
        <input type="number" id="rating" min="1" max="5" placeholder="Rating 1-5">
        <input type="text" id="feedback" placeholder="Feedback">
        <button id="add-review">Thêm</button>
        <table id="rev-table">
            <thead><tr><th>Nhân viên</th><th>Rating Trung bình</th></tr></thead>
            <tbody></tbody>
        </table>
    `;

    document.getElementById('add-review').addEventListener('click', () => {
        const empId = parseInt(document.getElementById('rev-emp-id').value);
        const rating = parseInt(document.getElementById('rating').value);
        const feedback = document.getElementById('feedback').value;
        if (rating >= 1 && rating <= 5) {
            addReview(empId, rating, feedback);
            alert('Thêm thành công');
        } else {
            alert('Rating không hợp lệ');
        }
    });

    // Display top performers
    const uniqueEmps = [...new Set(reviews.map(r => r.employeeId))];
    const report = uniqueEmps.map(id => ({ id, avg: getAverageRating(id) })).sort((a, b) => b.avg - a.avg);
    const tbody = document.querySelector('#rev-table tbody');
    tbody.innerHTML = report.map(r => `<tr><td>${r.id}</td><td>${r.avg.toFixed(2)}</td></tr>`).join('');
}