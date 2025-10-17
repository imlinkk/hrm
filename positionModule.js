// positionModule.js
let positions = [];

export function init() {
    if (!localStorage.getItem('positions')) {
        positions = [
            { id: 1, title: 'Developer', description: 'Code stuff', salaryBase: 5000 },
            { id: 2, title: 'Manager', description: 'Manage team', salaryBase: 7000 },
            { id: 3, title: 'Analyst', description: 'Analyze data', salaryBase: 6000 }
        ];
        savePositions();
    } else {
        positions = JSON.parse(localStorage.getItem('positions'));
    }
}

export function getAllPositions() {
    return [...positions];
}

export function getPositionById(id) {
    return positions.find(p => p.id === id);
}

export async function addPosition(title, desc) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const id = Math.max(...positions.map(p => p.id)) + 1;
    positions.push({ id, title, description: desc, salaryBase: 0 });
    savePositions();
}

export async function editPosition(id, updates) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const pos = getPositionById(id);
    if (pos) {
        Object.assign(pos, updates);
        savePositions();
    }
}

export async function deletePosition(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    positions = positions.filter(p => p.id !== id);
    savePositions();
}

function savePositions() {
    localStorage.setItem('positions', JSON.stringify(positions));
}

export function render(content) {
    content.innerHTML = `
        <h2>Quản lý Vị trí</h2>
        <input type="text" id="pos-title" placeholder="Tiêu đề">
        <input type="text" id="pos-desc" placeholder="Mô tả">
        <button id="add-pos">Thêm</button>
        <table id="pos-table">
            <thead><tr><th>ID</th><th>Tiêu đề</th><th>Mô tả</th><th>Hành động</th></tr></thead>
            <tbody>${getAllPositions().map(p => `<tr><td>${p.id}</td><td>${p.title}</td><td>${p.description}</td><td><button data-id="${p.id}" class="edit">Sửa</button><button data-id="${p.id}" class="delete">Xóa</button></td></tr>`).join('')}</tbody>
        </table>
    `;

    document.getElementById('add-pos').addEventListener('click', async () => {
        const title = document.getElementById('pos-title').value;
        const desc = document.getElementById('pos-desc').value;
        if (title && desc) {
            await addPosition(title, desc);
            render(content);
        }
    });

    document.querySelectorAll('.edit').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = parseInt(btn.dataset.id);
            const newTitle = prompt('Tiêu đề mới:');
            const newDesc = prompt('Mô tả mới:');
            if (newTitle && newDesc) {
                await editPosition(id, { title: newTitle, description: newDesc });
                render(content);
            }
        });
    });

    document.querySelectorAll('.delete').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = parseInt(btn.dataset.id);
            if (confirm('Xác nhận xóa?')) {
                await deletePosition(id);
                render(content);
            }
        });
    });
}