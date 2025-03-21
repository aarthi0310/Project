const API_URL = "http://localhost:8081/api/plans";

let currentPage = 0;
const itemsPerPage = 5;

document.addEventListener('DOMContentLoaded', function() {
    loadPlans();
    loadAnalytics();
    setupEventListeners();
    setupMobileMenu();
});

function setupEventListeners() {
    document.getElementById('searchPlans').addEventListener('input', () => loadPlans(0));
    document.getElementById('categoryFilter').addEventListener('change', () => loadPlans(0));
    document.getElementById('statusFilter').addEventListener('change', () => loadPlans(0));
    document.getElementById('planForm').addEventListener('submit', savePlan);
    document.getElementById('prevPage').addEventListener('click', () => loadPlans(currentPage - 1));
    document.getElementById('nextPage').addEventListener('click', () => loadPlans(currentPage + 1));
    document.getElementById('planCategory').addEventListener('change', toggleCustomCategory);
}

function setupMobileMenu() {
    const toggleButton = document.querySelector('.mobile-menu-toggle');
    const sidebar = document.querySelector('.fixed-sidebar');
    toggleButton.addEventListener('click', () => sidebar.classList.toggle('show'));
}

async function loadPlans(page = currentPage) {
    const search = document.getElementById('searchPlans').value;
    const category = document.getElementById('categoryFilter').value === 'all' ? '' : document.getElementById('categoryFilter').value;
    const status = document.getElementById('statusFilter').value === 'all' ? '' : document.getElementById('statusFilter').value;

    try {
        const response = await fetch(`${API_URL}?page=${page}&size=${itemsPerPage}&search=${search}&category=${category}&status=${status}`);
        const data = await response.json();
        currentPage = data.number;

        const tbody = document.getElementById('plansTableBody');
        tbody.innerHTML = '';
        data.content.forEach(plan => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${plan.name}</td>
                <td class="px-6 py-4 whitespace-nowrap">₹${plan.price}</td>
                <td class="px-6 py-4 whitespace-nowrap">${plan.data}</td>
                <td class="px-6 py-4 whitespace-nowrap">${plan.validity}</td>
                <td class="px-6 py-4 whitespace-nowrap">${plan.category}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="status-indicator ${plan.active ? 'status-active' : 'status-inactive'}"></span>
                    ${plan.active ? 'Active' : 'Inactive'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <button class="action-btn edit-btn" onclick="openEditPlanModal(${plan.id})"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" onclick="openDeleteModal(${plan.id})"><i class="fas fa-trash"></i></button>
                    <button class="action-btn" onclick="togglePlanStatus(${plan.id})"><i class="fas fa-power-off"></i></button>
                </td>
            `;
            tbody.appendChild(row);
        });

        updatePagination(data.totalPages);
    } catch (error) {
        console.error('Error loading plans:', error);
    }
}

async function loadAnalytics() {
    try {
        const response = await fetch(`${API_URL}/analytics`);
        const data = await response.json();
        document.getElementById('totalPlans').textContent = data.totalPlans;
        document.getElementById('activePlans').textContent = data.activePlans;
        document.getElementById('avgPrice').textContent = `₹${data.averagePrice.toFixed(2)}`;
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

function updatePagination(totalPages) {
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    const paginationNumbers = document.getElementById('paginationNumbers');

    prevButton.disabled = currentPage === 0;
    nextButton.disabled = currentPage >= totalPages - 1;

    paginationNumbers.innerHTML = '';
    for (let i = 0; i < totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i + 1;
        btn.className = `px-3 py-1 rounded ${i === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-200'}`;
        btn.addEventListener('click', () => loadPlans(i));
        paginationNumbers.appendChild(btn);
    }
}

function openAddPlanModal() {
    document.getElementById('modalTitle').textContent = 'Add New Plan';
    document.getElementById('planId').value = '';
    document.getElementById('planForm').reset();
    document.getElementById('planModal').style.display = 'block';
}

async function openEditPlanModal(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const plan = await response.json();
        document.getElementById('modalTitle').textContent = 'Edit Plan';
        document.getElementById('planId').value = plan.id;
        document.getElementById('planName').value = plan.name;
        document.getElementById('planPrice').value = plan.price;
        document.getElementById('planData').value = plan.data;
        document.getElementById('planValidity').value = plan.validity;
        document.getElementById('planCategory').value = plan.category === 'custom' ? 'custom' : plan.category;
        document.getElementById('customCategory').value = plan.category === 'custom' ? plan.category : '';
        document.getElementById('planModal').style.display = 'block';
        toggleCustomCategory();
    } catch (error) {
        console.error('Error fetching plan:', error);
    }
}

function closePlanModal() {
    document.getElementById('planModal').style.display = 'none';
}

async function savePlan(e) {
    e.preventDefault();
    const id = document.getElementById('planId').value;
    const categorySelect = document.getElementById('planCategory').value;
    const customCategory = document.getElementById('customCategory').value;
    const plan = {
        name: document.getElementById('planName').value,
        price: parseFloat(document.getElementById('planPrice').value),
        data: document.getElementById('planData').value,
        validity: document.getElementById('planValidity').value,
        category: categorySelect === 'custom' ? customCategory : categorySelect,
        active: true // Default to active for new plans
    };

    try {
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/${id}` : API_URL;
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(plan)
        });
        if (response.ok) {
            closePlanModal();
            loadPlans();
            loadAnalytics();
        } else {
            console.error('Error saving plan:', response.statusText);
        }
    } catch (error) {
        console.error('Error saving plan:', error);
    }
}

function openDeleteModal(id) {
    document.getElementById('deletePlanId').value = id;
    document.getElementById('deleteModal').style.display = 'block';
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
}

async function confirmDeletePlan() {
    const id = document.getElementById('deletePlanId').value;
    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (response.ok) {
            closeDeleteModal();
            loadPlans();
            loadAnalytics();
        } else {
            console.error('Error deleting plan:', response.statusText);
        }
    } catch (error) {
        console.error('Error deleting plan:', error);
    }
}

async function togglePlanStatus(id) {
    try {
        const response = await fetch(`${API_URL}/${id}/toggle`, { method: 'PUT' });
        if (response.ok) {
            loadPlans();
            loadAnalytics();
        } else {
            console.error('Error toggling plan status:', response.statusText);
        }
    } catch (error) {
        console.error('Error toggling plan status:', error);
    }
}

async function bulkToggle(active) {
    try {
        const response = await fetch(`${API_URL}/bulk-toggle?active=${active}`, { method: 'PUT' });
        if (response.ok) {
            loadPlans();
            loadAnalytics();
        } else {
            console.error('Error bulk toggling plans:', response.statusText);
        }
    } catch (error) {
        console.error('Error bulk toggling plans:', error);
    }
}

async function downloadCSV() {
    const search = document.getElementById('searchPlans').value;
    const category = document.getElementById('categoryFilter').value === 'all' ? '' : document.getElementById('categoryFilter').value;
    const status = document.getElementById('statusFilter').value === 'all' ? '' : document.getElementById('statusFilter').value;

    try {
        const response = await fetch(`${API_URL}/export-csv?search=${search}&category=${category}&status=${status}`);
        const csv = await response.text();
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'plans.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading CSV:', error);
    }
}

function toggleCustomCategory() {
    const categorySelect = document.getElementById('planCategory').value;
    const customInput = document.getElementById('customCategory');
    customInput.disabled = categorySelect !== 'custom';
    if (categorySelect !== 'custom') customInput.value = '';
}