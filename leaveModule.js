// leaveModule.js
let leaves = [];
const defaultBalance = { annual: 20, sick: 10 };

export function init() {
    if (!localStorage.getItem('leaves')) {
        leaves = [];
        saveLeaves();
    } else {
        leaves = JSON.parse(localStorage.getItem('leaves'));
    }
    if (!localStorage.getItem('leaveBalances')) {
        localStorage.setItem('leaveBalances', JSON.stringify({}));
    }
}

export function requestLeave(employeeId, startDate, endDate, type) {
    const id = leaves.length + 1;
    leaves.push({ id, employeeId, startDate, endDate, type, status: 'pending' });
    saveLeaves();
}

export function approveLeave(leaveId) {
    const leave = leaves.find(l => l.id === leaveId);
    if (leave) {
        leave.status = 'approved';
        updateBalance(leave.employeeId, leave.type, -1 * daysBetween(leave.startDate, leave.endDate)); // Simplified
        saveLeaves();
    }
}

function daysBetween(start, end) {
    return (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24) + 1;
}

function updateBalance(empId, type, delta) {
    const balances = JSON.parse(localStorage.getItem('leaveBalances'));
    if (!balances[empId]) balances[empId] = { ...defaultBalance };
    balances[empId][type] += delta;
    localStorage.setItem('leaveBalances', JSON.stringify(balances));
}

export function getLeaveBalance(empId) {
    const balances = JSON.parse(localStorage.getItem('leaveBalances'));
    return balances[empId] || { ...defaultBalance };
}

function saveLeaves() {
    localStorage.setItem('leaves', JSON.stringify(leaves));
}

export function render(content) {
    content.innerHTML = `
        <h2>Quản lý Nghỉ phép</h2>
        <input type="number" id="leave-emp-id" placeholder="ID Nhân viên">
        <input type="date" id="start-date">
        <input type="date" id="end-date">
        <select id="leave-type"><option value="Nghỉ phép năm">Nghỉ phép năm</option><option value="Nghỉ ốm">Nghỉ ốm</option></select>
        <button id="request-leave">Yêu cầu</button>
        <table id="leave-table">
            <thead><tr><th>ID</th><th>Nhân viên</th><th>Bắt đầu</th><th>Kết thúc</th><th>Loại</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
            <tbody>${leaves.map(l => `<tr><td>${l.id}</td><td>${l.employeeId}</td><td>${l.startDate}</td><td>${l.endDate}</td><td>${l.type}</td><td>${l.status}</td><td>${l.status === 'pending' ? `<button data-id="${l.id}" class="approve">Duyệt</button>` : ''}</td></tr>`).join('')}</tbody>
        </table>
    `;

    document.getElementById('request-leave').addEventListener('click', () => {
        const empId = parseInt(document.getElementById('leave-emp-id').value);
        const start = document.getElementById('start-date').value;
        const end = document.getElementById('end-date').value;
        const type = document.getElementById('leave-type').value;
        requestLeave(empId, start, end, type);
        render(content);
    });

    document.querySelectorAll('.approve').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            approveLeave(id);
            render(content);
        });
    });
}