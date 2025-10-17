// attendanceModule.js
let attendances = [];

export function init() {
    if (!localStorage.getItem('attendances')) {
        attendances = [];
        saveAttendances();
    } else {
        attendances = JSON.parse(localStorage.getItem('attendances'));
    }
}

export function checkIn(employeeId) {
    const today = new Date().toISOString().split('T')[0];
    if (!attendances.find(a => a.date === today && a.employeeId === employeeId)) {
        attendances.push({ date: today, employeeId, checkIn: new Date().toISOString(), checkOut: null });
        saveAttendances();
    }
}

export function checkOut(employeeId) {
    const today = new Date().toISOString().split('T')[0];
    const att = attendances.find(a => a.date === today && a.employeeId === employeeId && !a.checkOut);
    if (att) {
        att.checkOut = new Date().toISOString();
        saveAttendances();
    }
}

export function getAttendanceReport(employeeId, fromDate, toDate) {
    return attendances.filter(a => a.employeeId === employeeId && a.date >= fromDate && a.date <= toDate)
        .map(a => {
            const hours = a.checkOut ? (new Date(a.checkOut) - new Date(a.checkIn)) / (1000 * 60 * 60) : 0;
            return { ...a, hours };
        });
}

function saveAttendances() {
    localStorage.setItem('attendances', JSON.stringify(attendances));
}

export function render(content) {
    content.innerHTML = `
        <h2>Theo dõi Chấm công</h2>
        <input type="number" id="att-emp-id" placeholder="ID Nhân viên">
        <button id="check-in">Check In</button>
        <button id="check-out">Check Out</button>
        <br>
        <input type="date" id="from-date">
        <input type="date" id="to-date">
        <button id="get-report">Xem Report</button>
        <table id="att-report">
            <thead><tr><th>Ngày</th><th>Check In</th><th>Check Out</th><th>Giờ</th></tr></thead>
            <tbody></tbody>
        </table>
    `;

    const empIdInput = document.getElementById('att-emp-id');

    document.getElementById('check-in').addEventListener('click', () => {
        const id = parseInt(empIdInput.value);
        checkIn(id);
        alert('Check In thành công');
    });

    document.getElementById('check-out').addEventListener('click', () => {
        const id = parseInt(empIdInput.value);
        checkOut(id);
        alert('Check Out thành công');
    });

    document.getElementById('get-report').addEventListener('click', () => {
        const id = parseInt(empIdInput.value);
        const from = document.getElementById('from-date').value;
        const to = document.getElementById('to-date').value;
        if (id && from && to) {
            const report = getAttendanceReport(id, from, to);
            const tbody = document.querySelector('#att-report tbody');
            tbody.innerHTML = report.map(r => `<tr><td>${r.date}</td><td>${r.checkIn}</td><td>${r.checkOut || 'N/A'}</td><td>${r.hours.toFixed(2)}</td></tr>`).join('');
        }
    });
}