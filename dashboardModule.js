// dashboardModule.js
import * as EmployeeDb from './employeeDbModule.js';
import * as Department from './departmentModule.js';
import * as Position from './positionModule.js';

// Get current user from session
function getCurrentUser() {
    const session = localStorage.getItem('session');
    if (session) {
        const { username } = JSON.parse(session);
        return username;
    }
    return 'User';
}

// Get current date and time greeting
function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
}

// Calculate statistics
function getStatistics() {
    const employees = EmployeeDb.getAllEmployees();
    const departments = Department.getAllDepartments();
    const positions = Position.getAllPositions();
    
    const totalEmployees = employees.length;
    const totalDepartments = departments.length;
    const totalPositions = positions.length;
    
    // Calculate average salary
    const avgSalary = employees.length > 0 
        ? employees.reduce((sum, emp) => sum + emp.salary, 0) / employees.length 
        : 0;
    
    // Get newest employee (by hire date)
    const newestEmployee = employees.length > 0 
        ? employees.reduce((newest, emp) => 
            new Date(emp.hireDate) > new Date(newest.hireDate) ? emp : newest
          )
        : null;
    
    // Calculate employees by department
    const employeesByDept = departments.map(dept => {
        const count = employees.filter(emp => emp.departmentId === dept.id).length;
        return { name: dept.name, count };
    });
    
    return {
        totalEmployees,
        totalDepartments,
        totalPositions,
        avgSalary,
        newestEmployee,
        employeesByDept
    };
}

export function render(content) {
    const username = getCurrentUser();
    const greeting = getGreeting();
    const stats = getStatistics();
    
    content.innerHTML = `
        <div class="dashboard-container">
            <div class="dashboard-header">
                <h2>📊 Bảng Điều Khiển</h2>
                <div class="user-greeting">
                    <h3>${greeting}, <span class="username">${username}</span>! 👋</h3>
                    <p class="current-date">${new Date().toLocaleDateString('vi-VN', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}</p>
                </div>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card stat-primary">
                    <div class="stat-icon">👥</div>
                    <div class="stat-content">
                        <div class="stat-value">${stats.totalEmployees}</div>
                        <div class="stat-label">Tổng Nhân Viên</div>
                    </div>
                </div>
                
                <div class="stat-card stat-success">
                    <div class="stat-icon">🏢</div>
                    <div class="stat-content">
                        <div class="stat-value">${stats.totalDepartments}</div>
                        <div class="stat-label">Phòng Ban</div>
                    </div>
                </div>
                
                <div class="stat-card stat-warning">
                    <div class="stat-icon">💼</div>
                    <div class="stat-content">
                        <div class="stat-value">${stats.totalPositions}</div>
                        <div class="stat-label">Vị Trí</div>
                    </div>
                </div>
                
                <div class="stat-card stat-info">
                    <div class="stat-icon">💰</div>
                    <div class="stat-content">
                        <div class="stat-value">${stats.avgSalary.toLocaleString('vi-VN', { maximumFractionDigits: 0 })}</div>
                        <div class="stat-label">Lương Trung Bình</div>
                    </div>
                </div>
            </div>
            
            <div class="dashboard-content">
                <div class="dashboard-section">
                    <h4>📈 Phân Bổ Nhân Viên Theo Phòng Ban</h4>
                    <div class="department-chart">
                        ${stats.employeesByDept.map(dept => `
                            <div class="dept-bar-container">
                                <div class="dept-label">${dept.name}</div>
                                <div class="dept-bar-wrapper">
                                    <div class="dept-bar" style="width: ${stats.totalEmployees > 0 ? (dept.count / stats.totalEmployees * 100) : 0}%">
                                        <span class="dept-count">${dept.count}</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                ${stats.newestEmployee ? `
                <div class="dashboard-section">
                    <h4>🆕 Nhân Viên Mới Nhất</h4>
                    <div class="newest-employee-card">
                        <div class="employee-avatar">👤</div>
                        <div class="employee-info">
                            <div class="employee-name">${stats.newestEmployee.name}</div>
                            <div class="employee-details">
                                <span>📅 Ngày tuyển: ${new Date(stats.newestEmployee.hireDate).toLocaleDateString('vi-VN')}</span>
                                <span>💰 Lương: ${stats.newestEmployee.salary.toLocaleString('vi-VN')}</span>
                            </div>
                        </div>
                    </div>
                </div>
                ` : ''}
                
                <div class="dashboard-section">
                    <h4>🎯 Tóm Tắt Hệ Thống</h4>
                    <div class="system-summary">
                        <div class="summary-item">
                            <span class="summary-icon">✅</span>
                            <span>Hệ thống hoạt động bình thường</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-icon">📊</span>
                            <span>Dữ liệu được đồng bộ với localStorage</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-icon">🔒</span>
                            <span>Phiên đăng nhập an toàn</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}
