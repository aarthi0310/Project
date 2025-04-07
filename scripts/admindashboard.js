const API_URL = "http://localhost:8081/api";

        document.addEventListener('DOMContentLoaded', () => {
            const token = localStorage.getItem('jwtToken');
            if (!token) {
                window.location.href = '/admin/adminlogin.html';
                return;
            }
            loadDashboardData();
            setupMobileMenu();
        });

        function setupMobileMenu() {
            const toggle = document.querySelector('.mobile-menu-toggle');
            const sidebar = document.querySelector('.fixed-sidebar');
            const overlay = document.querySelector('.sidebar-overlay');
            toggle.addEventListener('click', () => {
                sidebar.classList.toggle('show');
                overlay.classList.toggle('active');
                overlay.style.display = sidebar.classList.contains('show') ? 'block' : 'none';
            });
            overlay.addEventListener('click', () => {
                sidebar.classList.remove('show');
                overlay.classList.remove('active');
                setTimeout(() => overlay.style.display = 'none', 300);
            });
        }

        async function fetchWithAuth(url) {
            const token = localStorage.getItem('jwtToken');
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('jwtToken');
                    window.location.href = '/admin/adminlogin.html';
                }
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        }

        async function loadDashboardData() {
            try {
                // Total Subscribers
                const users = await fetchWithAuth(`${API_URL}/users/count`);
                document.getElementById('totalSubscribers').textContent = users.count;

                // Active Plans
                const plans = await fetchWithAuth(`${API_URL}/plans/analytics`);
                document.getElementById('activePlans').textContent = plans.activePlans;

                // Expiring Plans
                const expiring = await fetchWithAuth(`${API_URL}/recharge/expiring?days=3`);
                document.getElementById('expiringPlans').textContent = expiring.length;
                document.getElementById('expiringCount').textContent = `${expiring.length} Plans`;
                renderExpiringPlans(expiring);

                // Revenue Data
                const revenueData = await fetchWithAuth(`${API_URL}/recharge/revenue`);
                document.getElementById('monthlyRevenue').textContent = `₹${revenueData.currentMonth.toFixed(2)}`;
                renderRevenueChart(revenueData.lastSixMonths);

                // Popular Plans
                const popularPlans = await fetchWithAuth(`${API_URL}/recharge/popular-plans`);
                renderPopularPlansChart(popularPlans);

            } catch (error) {
                console.error('Error loading dashboard:', error);
            }
        }

        function renderExpiringPlans(plans) {
            const list = document.getElementById('expiringPlansList');
            list.innerHTML = plans.map(plan => `
                <div class="plan-item">
                    <div class="plan-details">
                        <div class="plan-customer">${plan.name || 'Unknown'}</div>
                        <div class="plan-info">Plan: ${plan.planName} • ${plan.phoneNumber}</div>
                    </div>
                    <div class="plan-expiry">
                        <i class="fas fa-clock mr-1"></i> Expires ${new Date(plan.expiryDate).toLocaleDateString()}
                    </div>
                </div>
            `).join('');
        }

        function renderRevenueChart(data) {
            const ctx = document.getElementById('revenueChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Revenue (₹)',
                        data: data.values,
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        borderColor: 'rgba(37, 99, 235, 1)',
                        borderWidth: 2,
                        tension: 0.3,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: false },
                        x: { grid: { display: false } }
                    }
                }
            });
        }

        function renderPopularPlansChart(data) {
            const ctx = document.getElementById('popularPlansChart').getContext('2d');
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: data.map(item => item.planName),
                    datasets: [{
                        data: data.map(item => item.count),
                        backgroundColor: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    cutout: '70%',
                    plugins: { legend: { position: 'right' } }
                }
            });
        }