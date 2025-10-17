// deleteEmployeeModule.js
import * as EmployeeDb from './employeeDbModule.js';

export function render(content) {
    content.innerHTML = `
        <h2>Xóa Nhân viên</h2>
        <input type="number" id="delete-id" placeholder="ID Nhân viên">
        <button id="delete-employee">Xóa</button>
    `;

    document.getElementById('delete-employee').addEventListener('click', () => {
        const id = parseInt(document.getElementById('delete-id').value);
        const emp = EmployeeDb.getEmployeeById(id);
        if (emp && confirm(`Xác nhận xóa ${emp.name}?`)) {
            EmployeeDb.deleteEmployee(id);
            alert('Xóa thành công');
        } else {
            alert('Không tìm thấy hoặc hủy');
        }
    });
}