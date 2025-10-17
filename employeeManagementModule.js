// employeeManagementModule.js - Consolidated Employee Management Module
import * as EmployeeDb from './employeeDbModule.js';
import * as Department from './departmentModule.js';
import * as Position from './positionModule.js';

// State management for edit functionality
const createEditState = () => {
    let currentEmployee = null;
    return {
        setEmployee(emp) { currentEmployee = emp; },
        getEmployee() { return currentEmployee; }
    };
};
const editState = createEditState();

// Validation function
function validateInput(data) {
    if (!data.name || data.salary <= 0 || !data.departmentId || !data.positionId) {
        return false;
    }
    return true;
}

// Higher-order function for filtering
const createFilter = (nameRegex, deptId, minSal, maxSal) => (emp) => {
    const nameMatch = !nameRegex || nameRegex.test(emp.name);
    const deptMatch = deptId === null || deptId === undefined || emp.departmentId === deptId;
    const minSalMatch = minSal === null || minSal === undefined || emp.salary >= minSal;
    const maxSalMatch = maxSal === null || maxSal === undefined || emp.salary <= maxSal;
    
    // Debug log for each employee
    if (deptId !== null && deptId !== undefined) {
        console.log(`Checking employee ${emp.name}: deptId=${emp.departmentId}, searching for=${deptId}, match=${deptMatch}`);
    }
    
    return nameMatch && deptMatch && minSalMatch && maxSalMatch;
};

// Render search results table
function renderSearchResults(results) {
    const tbody = document.querySelector('#search-results tbody');
    if (!tbody) return;
    
    if (results.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #999;">📭 Không tìm thấy nhân viên nào phù hợp với tiêu chí tìm kiếm</td></tr>';
        return;
    }
    
    tbody.innerHTML = results.map(emp => {
        const dept = Department.getDepartmentById(emp.departmentId)?.name || 'N/A';
        const pos = Position.getPositionById(emp.positionId)?.title || 'N/A';
        return `<tr>
            <td>${emp.id}</td>
            <td>${emp.name}</td>
            <td>${dept}</td>
            <td>${pos}</td>
            <td>${emp.salary.toLocaleString()}</td>
            <td>${emp.hireDate}</td>
        </tr>`;
    }).join('');
}

// Tab switching
function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(`${tabName}-tab`);
    if (selectedTab) {
        selectedTab.style.display = 'block';
    }
    
    // Add active class to clicked button
    const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

// Render add employee section
function renderAddEmployee() {
    const departments = Department.getAllDepartments();
    const positions = Position.getAllPositions();

    return `
        <h3>Thêm Nhân viên Mới</h3>
        <form id="add-employee-form" class="employee-form">
            <div class="form-group">
                <label for="add-name">Tên nhân viên:</label>
                <input type="text" id="add-name" placeholder="Nhập tên nhân viên" required>
            </div>
            <div class="form-group">
                <label for="add-departmentId">Phòng ban:</label>
                <select id="add-departmentId" required>
                    <option value="">-- Chọn phòng ban --</option>
                    ${departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="add-positionId">Vị trí:</label>
                <select id="add-positionId" required>
                    <option value="">-- Chọn vị trí --</option>
                    ${positions.map(p => `<option value="${p.id}">${p.title}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="add-salary">Lương:</label>
                <input type="number" id="add-salary" placeholder="Nhập lương" min="0" required>
            </div>
            <div class="form-group">
                <label for="add-hireDate">Ngày tuyển dụng:</label>
                <input type="date" id="add-hireDate" required>
            </div>
            <button type="submit" class="btn-primary">➕ Thêm nhân viên</button>
        </form>
    `;
}

// Render edit employee section
function renderEditEmployee() {
    const departments = Department.getAllDepartments();
    const positions = Position.getAllPositions();

    return `
        <h3>Sửa Thông tin Nhân viên</h3>
        <div class="two-column-layout">
            <div class="left-panel">
                <h4>📋 Danh sách Nhân viên</h4>
                <table id="edit-employee-list" class="reference-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên</th>
                            <th>Phòng ban</th>
                            <th>Lương</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
            <div class="right-panel">
                <form id="edit-employee-form" class="employee-form" style="display: none;">
                    <h4>Chỉnh sửa thông tin nhân viên ID: <span id="edit-employee-id"></span></h4>
                    <div class="form-group">
                        <label for="edit-name">Tên nhân viên:</label>
                        <input type="text" id="edit-name" placeholder="Tên nhân viên" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-departmentId">Phòng ban:</label>
                        <select id="edit-departmentId" required>
                            ${departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="edit-positionId">Vị trí:</label>
                        <select id="edit-positionId" required>
                            ${positions.map(p => `<option value="${p.id}">${p.title}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="edit-salary">Lương:</label>
                        <input type="number" id="edit-salary" placeholder="Lương" min="0" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-hireDate">Ngày tuyển dụng:</label>
                        <input type="date" id="edit-hireDate" required>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn-primary">✎ Cập nhật thông tin</button>
                        <button type="button" id="cancel-edit-btn" class="btn-secondary">✖ Hủy</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// Render delete employee section
function renderDeleteEmployee() {
    return `
        <h3>Xóa Nhân viên</h3>
        <div class="two-column-layout">
            <div class="left-panel">
                <h4>📋 Danh sách Nhân viên</h4>
                <table id="delete-employee-list" class="reference-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên</th>
                            <th>Phòng ban</th>
                            <th>Lương</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
            <div class="right-panel">
            </div>
        </div>
    `;
}

// Render search employee section
function renderSearchEmployee() {
    const departments = Department.getAllDepartments();

    return `
        <h3>Tìm kiếm Nhân viên</h3>
        <form id="search-form" class="employee-form">
            <div class="form-group">
                <label for="search-name">Tên:</label>
                <input type="text" id="search-name" placeholder="Nhập tên cần tìm">
            </div>
            <div class="form-group">
                <label for="search-dept">Phòng ban:</label>
                <select id="search-dept">
                    <option value="">Tất cả</option>
                    ${departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="min-salary">Lương tối thiểu:</label>
                <input type="number" id="min-salary" placeholder="Lương min" min="0">
            </div>
            <div class="form-group">
                <label for="max-salary">Lương tối đa:</label>
                <input type="number" id="max-salary" placeholder="Lương max" min="0">
            </div>
            <div class="form-actions">
                <button type="submit" class="btn-primary">🔍 Tìm kiếm</button>
                <button type="button" id="clear-search-btn" class="btn-secondary">✖ Xóa bộ lọc</button>
            </div>
        </form>
        <div id="search-results-container">
            <table id="search-results">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên</th>
                        <th>Phòng ban</th>
                        <th>Vị trí</th>
                        <th>Lương</th>
                        <th>Ngày tuyển</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
    `;
}

// Main render function
export function render(content) {
    content.innerHTML = `
        <div class="employee-management">
            <h2>📋 Quản lý Nhân sự</h2>
            <div class="tab-buttons">
                <button class="tab-button active" data-tab="search" id="search-tab-btn">🔍 Tìm kiếm</button>
                <button class="tab-button" data-tab="add" id="add-tab-btn">➕ Thêm mới</button>
                <button class="tab-button" data-tab="edit" id="edit-tab-btn">✎ Sửa</button>
                <button class="tab-button" data-tab="delete" id="delete-tab-btn">🗑️ Xóa</button>
            </div>
            
            <div class="tab-content active" id="search-tab">
                ${renderSearchEmployee()}
            </div>
            
            <div class="tab-content" id="add-tab">
                ${renderAddEmployee()}
            </div>
            
            <div class="tab-content" id="edit-tab">
                ${renderEditEmployee()}
            </div>
            
            <div class="tab-content" id="delete-tab">
                ${renderDeleteEmployee()}
            </div>
        </div>
    `;

    // Initialize event listeners
    initializeTabButtons();
    initializeAddEmployee(content);
    initializeEditEmployee(content);
    initializeDeleteEmployee();
    initializeSearchEmployee();
}

// Render employee reference list
function renderEmployeeReferenceList(tableId) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    if (!tbody) return;
    
    const employees = EmployeeDb.getAllEmployees();
    const departments = Department.getAllDepartments();
    
    tbody.innerHTML = employees.map(emp => {
        const dept = departments.find(d => d.id === emp.departmentId)?.name || 'N/A';
        const actionButton = tableId === 'edit-employee-list' 
            ? `<button class="btn-quick-edit" data-id="${emp.id}">✎ Sửa</button>`
            : `<button class="btn-quick-delete" data-id="${emp.id}">🗑️ Xóa</button>`;
        
        return `<tr>
            <td>${emp.id}</td>
            <td>${emp.name}</td>
            <td>${dept}</td>
            <td>${emp.salary.toLocaleString()}</td>
            <td>${actionButton}</td>
        </tr>`;
    }).join('');
    
    // Add event listeners for quick action buttons
    if (tableId === 'edit-employee-list') {
        tbody.querySelectorAll('.btn-quick-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                loadEmployeeForEdit(id);
            });
        });
    } else if (tableId === 'delete-employee-list') {
        tbody.querySelectorAll('.btn-quick-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                deleteEmployeeById(id);
            });
        });
    }
}

// Load employee data for editing
function loadEmployeeForEdit(id) {
    const emp = EmployeeDb.getEmployeeById(id);
    const editForm = document.getElementById('edit-employee-form');
    
    if (emp && editForm) {
        editState.setEmployee(emp);
        document.getElementById('edit-employee-id').textContent = emp.id;
        document.getElementById('edit-name').value = emp.name;
        document.getElementById('edit-departmentId').value = emp.departmentId;
        document.getElementById('edit-positionId').value = emp.positionId;
        document.getElementById('edit-salary').value = emp.salary;
        document.getElementById('edit-hireDate').value = emp.hireDate;
        editForm.style.display = 'block';
        
        // Scroll to form
        editForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
        alert('❌ Không tìm thấy nhân viên với ID: ' + id);
    }
}

// Delete employee by ID
function deleteEmployeeById(id) {
    const emp = EmployeeDb.getEmployeeById(id);
    
    if (emp) {
        const dept = Department.getDepartmentById(emp.departmentId)?.name || 'N/A';
        const pos = Position.getPositionById(emp.positionId)?.title || 'N/A';
        
        if (confirm(`Xác nhận xóa nhân viên?

ID: ${emp.id}
Tên: ${emp.name}
Phòng ban: ${dept}
Vị trí: ${pos}

⚠️ Hành động này không thể hoàn tác!`)) {
            EmployeeDb.deleteEmployee(id);
            alert('✅ Xóa nhân viên thành công!');
            // Refresh the employee list
            setTimeout(() => renderEmployeeReferenceList('delete-employee-list'), 50);
        }
    } else {
        alert('❌ Không tìm thấy nhân viên với ID: ' + id);
    }
}

// Initialize tab buttons
function initializeTabButtons() {
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            switchTab(tabName);
            
            // Load employee lists when switching to edit or delete tabs
            if (tabName === 'edit') {
                setTimeout(() => renderEmployeeReferenceList('edit-employee-list'), 100);
            } else if (tabName === 'delete') {
                setTimeout(() => renderEmployeeReferenceList('delete-employee-list'), 100);
            }
        });
    });
}

// Initialize add employee functionality
function initializeAddEmployee(content) {
    const form = document.getElementById('add-employee-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const employee = {
            name: document.getElementById('add-name').value,
            departmentId: parseInt(document.getElementById('add-departmentId').value),
            positionId: parseInt(document.getElementById('add-positionId').value),
            salary: parseFloat(document.getElementById('add-salary').value),
            hireDate: document.getElementById('add-hireDate').value,
            bonus: 0,
            deduction: 0
        };
        
        if (validateInput(employee)) {
            EmployeeDb.addEmployee(employee);
            alert('✅ Thêm nhân viên thành công!');
            form.reset();
            // Optionally switch to search tab to see the new employee
            switchTab('search');
        } else {
            alert('❌ Dữ liệu không hợp lệ. Vui lòng kiểm tra lại!');
        }
    });
}

// Initialize edit employee functionality
function initializeEditEmployee(content) {
    const editForm = document.getElementById('edit-employee-form');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    
    if (!editForm) return;
    
    // Cancel button handler
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            editForm.style.display = 'none';
            editForm.reset();
        });
    }

    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const updates = {
            name: document.getElementById('edit-name').value,
            departmentId: parseInt(document.getElementById('edit-departmentId').value),
            positionId: parseInt(document.getElementById('edit-positionId').value),
            salary: parseFloat(document.getElementById('edit-salary').value),
            hireDate: document.getElementById('edit-hireDate').value
        };
        
        if (validateInput(updates)) {
            if (confirm('Xác nhận cập nhật thông tin nhân viên?')) {
                EmployeeDb.updateEmployee(editState.getEmployee().id, updates);
                alert('✅ Cập nhật thông tin thành công!');
                editForm.style.display = 'none';
                editForm.reset();
                // Refresh the employee list
                setTimeout(() => renderEmployeeReferenceList('edit-employee-list'), 50);
            }
        } else {
            alert('❌ Dữ liệu không hợp lệ. Vui lòng kiểm tra lại!');
        }
    });
}

// Initialize delete employee functionality
function initializeDeleteEmployee() {
    // No initialization needed - delete actions are handled by button clicks in the list
    // The deleteEmployeeById function is called directly from renderEmployeeReferenceList
}

// Initialize search employee functionality
function initializeSearchEmployee() {
    const searchForm = document.getElementById('search-form');
    const clearBtn = document.getElementById('clear-search-btn');
    const searchName = document.getElementById('search-name');
    const searchDept = document.getElementById('search-dept');
    const minSalary = document.getElementById('min-salary');
    const maxSalary = document.getElementById('max-salary');
    
    if (!searchForm) return;

    // Handle search form submission
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        performSearch();
    });
    
    // Real-time search on input
    if (searchName) {
        searchName.addEventListener('input', () => {
            performSearch();
        });
    }
    
    // Real-time search on department change
    if (searchDept) {
        searchDept.addEventListener('change', () => {
            performSearch();
        });
    }
    
    // Real-time search on salary input
    if (minSalary) {
        minSalary.addEventListener('input', () => {
            performSearch();
        });
    }
    
    if (maxSalary) {
        maxSalary.addEventListener('input', () => {
            performSearch();
        });
    }
    
    // Handle clear button
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            // Reset form fields
            searchName.value = '';
            searchDept.value = '';
            minSalary.value = '';
            maxSalary.value = '';
            
            // Clear results
            const tbody = document.querySelector('#search-results tbody');
            if (tbody) {
                tbody.innerHTML = '';
            }
        });
    }
}

// Perform search with current form values
function performSearch() {
    const nameInput = document.getElementById('search-name');
    const deptSelect = document.getElementById('search-dept');
    const minSalInput = document.getElementById('min-salary');
    const maxSalInput = document.getElementById('max-salary');
    
    const name = nameInput ? nameInput.value.trim() : '';
    const deptValue = deptSelect ? deptSelect.value : '';
    const minSalValue = minSalInput ? minSalInput.value : '';
    const maxSalValue = maxSalInput ? maxSalInput.value : '';
    
    // Parse values correctly
    const nameRegex = name ? new RegExp(name, 'i') : null;
    const deptId = deptValue && deptValue !== '' ? parseInt(deptValue) : null;
    const minSal = minSalValue && minSalValue !== '' ? parseFloat(minSalValue) : null;
    const maxSal = maxSalValue && maxSalValue !== '' ? parseFloat(maxSalValue) : null;

    // Debug log to verify search parameters
    console.log('🔍 Tìm kiếm với:', {
        tên: name || '(tất cả)',
        phòngBanId: deptId,
        phòngBanValue: deptValue,
        lươngMin: minSal || '(không giới hạn)',
        lươngMax: maxSal || '(không giới hạn)'
    });
    
    // Get all employees first
    const allEmployees = EmployeeDb.getAllEmployees();
    console.log('📋 Tổng số nhân viên:', allEmployees.length, allEmployees);

    // Manual filtering for better debugging
    let results = allEmployees.filter(emp => {
        // Check name
        const nameMatch = !nameRegex || nameRegex.test(emp.name);
        // Check department
        const deptMatch = deptId === null || emp.departmentId === deptId;
        // Check min salary
        const minSalMatch = minSal === null || emp.salary >= minSal;
        // Check max salary
        const maxSalMatch = maxSal === null || emp.salary <= maxSal;
        
        // Debug each employee when department filter is active
        if (deptId !== null) {
            console.log(`Kiểm tra ${emp.name}: departmentId=${emp.departmentId}, tìm=${deptId}, khớp=${deptMatch}`);
        }
        
        return nameMatch && deptMatch && minSalMatch && maxSalMatch;
    });
    
    // Sort by salary descending
    results.sort((a, b) => b.salary - a.salary);

    console.log(`✅ Tìm thấy ${results.length} nhân viên`, results);
    renderSearchResults(results);
}
