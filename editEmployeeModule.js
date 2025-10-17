// editEmployeeModule.js
import * as EmployeeDb from './employeeDbModule.js';
import * as Department from './departmentModule.js';
import * as Position from './positionModule.js';

// Closure for edit state
const createEditState = () => {
    let currentEmployee = null;
    return {
        setEmployee(emp) { currentEmployee = emp; },
        getEmployee() { return currentEmployee; }
    };
};
const editState = createEditState();

function validateInput(data) {
    // Similar to add
    return data.name && data.salary > 0 && data.departmentId && data.positionId;
}

export function render(content) {
    content.innerHTML = `
        <h2>Sửa Nhân viên</h2>
        <input type="number" id="search-id" placeholder="ID Nhân viên">
        <button id="load-employee">Tải</button>
        <form id="edit-employee" style="display: none;">
            <input type="text" id="edit-name" placeholder="Tên">
            <select id="edit-departmentId"></select>
            <select id="edit-positionId"></select>
            <input type="number" id="edit-salary" placeholder="Lương">
            <input type="date" id="edit-hireDate">
            <button type="submit">Cập nhật</button>
        </form>
    `;

    const departments = Department.getAllDepartments();
    const positions = Position.getAllPositions();
    const deptSelect = document.getElementById('edit-departmentId');
    deptSelect.innerHTML = departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    const posSelect = document.getElementById('edit-positionId');
    posSelect.innerHTML = positions.map(p => `<option value="${p.id}">${p.title}</option>`).join('');

    document.getElementById('load-employee').addEventListener('click', () => {
        const id = parseInt(document.getElementById('search-id').value);
        const emp = EmployeeDb.getEmployeeById(id);
        if (emp) {
            editState.setEmployee(emp);
            document.getElementById('edit-name').value = emp.name;
            deptSelect.value = emp.departmentId;
            posSelect.value = emp.positionId;
            document.getElementById('edit-salary').value = emp.salary;
            document.getElementById('edit-hireDate').value = emp.hireDate;
            document.getElementById('edit-employee').style.display = 'block';
        } else {
            alert('Không tìm thấy');
        }
    });

    document.getElementById('edit-employee').addEventListener('submit', (e) => {
        e.preventDefault();
        const updates = {
            name: document.getElementById('edit-name').value,
            departmentId: parseInt(document.getElementById('edit-departmentId').value),
            positionId: parseInt(document.getElementById('edit-positionId').value),
            salary: parseFloat(document.getElementById('edit-salary').value),
            hireDate: document.getElementById('edit-hireDate').value
        };
        if (validateInput(updates)) {
            if (confirm('Xác nhận cập nhật?')) {
                EmployeeDb.updateEmployee(editState.getEmployee().id, updates);
                alert('Cập nhật thành công');
                render(content);
            }
        } else {
            alert('Dữ liệu không hợp lệ');
        }
    });
}