// addEmployeeModule.js
import * as EmployeeDb from './employeeDbModule.js';
import * as Department from './departmentModule.js';
import * as Position from './positionModule.js';

function validateInput(data) {
    if (!data.name || data.salary <= 0 || !data.departmentId || !data.positionId) {
        return false;
    }
    return true;
}

export function render(content) {
    const departments = Department.getAllDepartments();
    const positions = Position.getAllPositions();

    content.innerHTML = `
        <h2>Thêm Nhân viên</h2>
        <form id="add-employee">
            <input type="text" id="name" placeholder="Tên">
            <select id="departmentId">
                ${departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
            </select>
            <select id="positionId">
                ${positions.map(p => `<option value="${p.id}">${p.title}</option>`).join('')}
            </select>
            <input type="number" id="salary" placeholder="Lương">
            <input type="date" id="hireDate">
            <button type="submit">Thêm</button>
        </form>
    `;

    document.getElementById('add-employee').addEventListener('submit', (e) => {
        e.preventDefault();
        const employee = {
            name: document.getElementById('name').value,
            departmentId: parseInt(document.getElementById('departmentId').value),
            positionId: parseInt(document.getElementById('positionId').value),
            salary: parseFloat(document.getElementById('salary').value),
            hireDate: document.getElementById('hireDate').value,
            bonus: 0,
            deduction: 0
        };
        if (validateInput(employee)) {
            EmployeeDb.addEmployee(employee);
            alert('Thêm thành công');
            render(content); // Refresh form
        } else {
            alert('Dữ liệu không hợp lệ');
        }
    });
}