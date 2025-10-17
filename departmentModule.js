// departmentModule.js
let departments = [];

export function init() {
    console.log('Department.init() called');
    if (!localStorage.getItem('departments')) {
        console.log('No departments in localStorage, initializing...');
        departments = [
            { id: 1, name: 'IT', managerId: 1 },
            { id: 2, name: 'HR', managerId: 2 }
        ];
        saveDepartments();
        console.log('Sample departments saved:', departments.length);
    } else {
        departments = JSON.parse(localStorage.getItem('departments'));
        console.log('Departments loaded from localStorage:', departments.length);
    }
}

export function getAllDepartments() {
    return [...departments];
}

export function getDepartmentById(id) {
    return departments.find(d => d.id === id);
}

export function addDepartment(name) {
    const id = Math.max(...departments.map(d => d.id)) + 1;
    departments.push({ id, name, managerId: null });
    saveDepartments();
}

export function editDepartment(id, newName) {
    const dept = getDepartmentById(id);
    if (dept) {
        dept.name = newName;
        saveDepartments();
    }
}

export function deleteDepartment(id) {
    departments = departments.filter(d => d.id !== id);
    saveDepartments();
}

function saveDepartments() {
    localStorage.setItem('departments', JSON.stringify(departments));
}

export function render(content) {
    content.innerHTML = `
        <h2>Quản lý Phòng ban</h2>
        <input type="text" id="dept-name" placeholder="Tên phòng ban">
        <button id="add-dept">Thêm</button>
        <table id="dept-table">
            <thead><tr><th>ID</th><th>Tên</th><th>Hành động</th></tr></thead>
            <tbody>${getAllDepartments().map(d => `<tr><td>${d.id}</td><td>${d.name}</td><td><button data-id="${d.id}" class="edit">Sửa</button><button data-id="${d.id}" class="delete">Xóa</button></td></tr>`).join('')}</tbody>
        </table>
    `;

    document.getElementById('add-dept').addEventListener('click', () => {
        const name = document.getElementById('dept-name').value;
        if (name) {
            addDepartment(name);
            render(content);
        }
    });

    document.querySelectorAll('.edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const newName = prompt('Tên mới:');
            if (newName) {
                editDepartment(id, newName);
                render(content);
            }
        });
    });

    document.querySelectorAll('.delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            if (confirm('Xác nhận xóa?')) {
                deleteDepartment(id);
                render(content);
            }
        });
    });
}