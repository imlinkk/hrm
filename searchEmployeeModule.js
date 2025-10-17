// searchEmployeeModule.js
import * as EmployeeDb from './employeeDbModule.js';
import * as Department from './departmentModule.js';
import * as Position from './positionModule.js';

// Higher-order for filter
const createFilter = (nameRegex, deptId, minSal, maxSal) => (emp) => {
    return (!nameRegex || nameRegex.test(emp.name)) &&
           (!deptId || emp.departmentId === deptId) &&
           (minSal === null || emp.salary >= minSal) &&
           (maxSal === null || emp.salary <= maxSal);
};

export function render(content) {
    const departments = Department.getAllDepartments();

    content.innerHTML = `
        <h2>Tìm kiếm nhân viên</h2>
        <form id="search-form">
            <input type="text" id="search-name" placeholder="Tên">
            <select id="search-dept">
                <option value="">Tất cả</option>
                ${departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
            </select>
            <input type="number" id="min-salary" placeholder="Lương min">
            <input type="number" id="max-salary" placeholder="Lương max">
            <button type="submit">Tìm</button>
        </form>
        <table id="results">
            <thead><tr><th>ID</th><th>Tên</th><th>Phòng ban</th><th>Vị trí</th><th>Lương</th><th>Ngày tuyển</th></tr></thead>
            <tbody></tbody>
        </table>
    `;

    document.getElementById('search-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('search-name').value;
        const nameRegex = name ? new RegExp(name, 'i') : null;
        const deptId = parseInt(document.getElementById('search-dept').value) || null;
        const minSal = parseFloat(document.getElementById('min-salary').value) || null;
        const maxSal = parseFloat(document.getElementById('max-salary').value) || null;

        const filter = createFilter(nameRegex, deptId, minSal, maxSal);
        let results = EmployeeDb.filterEmployees(filter)();
        results = EmployeeDb.sortEmployees((a, b) => b.salary - a.salary)(); // Sort by salary desc

        const tbody = document.querySelector('#results tbody');
        tbody.innerHTML = results.map(emp => {
            const dept = Department.getDepartmentById(emp.departmentId)?.name || 'N/A';
            const pos = Position.getPositionById(emp.positionId)?.title || 'N/A';
            return `<tr><td>${emp.id}</td><td>${emp.name}</td><td>${dept}</td><td>${pos}</td><td>${emp.salary}</td><td>${emp.hireDate}</td></tr>`;
        }).join('');
    });
}