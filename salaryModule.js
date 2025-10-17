// salaryModule.js
import * as EmployeeDb from './employeeDbModule.js';

// Format number to VND currency
function formatVND(amount) {
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
    }).format(amount);
}

export function calculateNetSalary(employee) {
    return employee.salary + employee.bonus - employee.deduction;
}

export function generatePayrollReport() {
    return EmployeeDb.getAllEmployees().map(emp => ({
        ...emp,
        netSalary: calculateNetSalary(emp)
    }));
}

// Higher-order for updating salary
const updateField = (field) => (id, value) => {
    const updates = { [field]: parseFloat(value) };
    EmployeeDb.updateEmployee(id, updates);
};

export const updateBonus = updateField('bonus');
export const updateDeduction = updateField('deduction');

export function render(content) {
    const report = generatePayrollReport();

    content.innerHTML = `
        <h2>Quản lý Lương</h2>
        <table>
            <thead><tr><th>ID</th><th>Tên</th><th>Lương cơ bản</th><th>Thưởng</th><th>Khấu trừ</th><th>Lương ròng</th><th>Cập nhật Thưởng</th><th>Cập nhật Khấu trừ</th></tr></thead>
            <tbody>${report.map(emp => `
                <tr>
                    <td>${emp.id}</td>
                    <td>${emp.name}</td>
                    <td>${formatVND(emp.salary)}</td>
                    <td>${formatVND(emp.bonus)}</td>
                    <td>${formatVND(emp.deduction)}</td>
                    <td><strong>${formatVND(emp.netSalary)}</strong></td>
                    <td><input type="number" data-id="${emp.id}" class="bonus-input" placeholder="Nhập số tiền"></td>
                    <td><input type="number" data-id="${emp.id}" class="deduct-input" placeholder="Nhập số tiền"></td>
                </tr>`).join('')}
            </tbody>
        </table>
        <button id="update-salaries">Cập nhật</button>
    `;

    document.getElementById('update-salaries').addEventListener('click', () => {
        document.querySelectorAll('.bonus-input').forEach(input => {
            const value = input.value;
            if (value) updateBonus(parseInt(input.dataset.id), value);
        });
        document.querySelectorAll('.deduct-input').forEach(input => {
            const value = input.value;
            if (value) updateDeduction(parseInt(input.dataset.id), value);
        });
        alert('Cập nhật thành công');
        render(content);
    });
}