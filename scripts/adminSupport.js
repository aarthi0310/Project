let allTickets = [];
let filteredTickets = [];
let currentPage = 1;
const ticketsPerPage = 10;

// Fetch with authentication
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('jwtToken');
    console.log("Using JWT Token in fetchWithAuth:", token);
    if (token) {
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };
    } else {
        console.warn('No JWT token found in localStorage');
    }
    return fetch(url, options);
}

async function loadTickets() {
    try {
        const response = await fetchWithAuth('http://localhost:8081/api/support/tickets');
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                console.warn("Unauthorized or Forbidden access. Token may be invalid or expired.");
                localStorage.removeItem('jwtToken');
                window.location.href = '/admin/adminlogin.html';
                throw new Error('Unauthorized access. Redirecting to login page.');
            }
            throw new Error(`Failed to fetch tickets: ${response.status}`);
        }
        allTickets = await response.json();
        console.log("Fetched tickets:", allTickets);
        filteredTickets = [...allTickets];
        renderTickets();
        updateDashboardStats();
    } catch (error) {
        console.error("Error loading tickets:", error);
        showMessage(`Error loading tickets: ${error.message}`, 'error');
    }
}

function renderTickets() {
    const tableBody = document.getElementById('ticketsTableBody');
    const mobileView = document.getElementById('mobileTicketsView');
    tableBody.innerHTML = '';
    mobileView.innerHTML = '';

    const start = (currentPage - 1) * ticketsPerPage;
    const end = start + ticketsPerPage;
    const paginatedTickets = filteredTickets.slice(start, end);

    paginatedTickets.forEach(ticket => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-blue-600">${ticket.ticketId}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="h-8 w-8 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center">
                        <span class="text-gray-500 font-medium">${ticket.customerName.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${ticket.customerName}</div>
                        <div class="text-sm text-gray-500">${ticket.mobile}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getIssueTypeStyle(ticket.issueType)}">
                    ${ticket.issueTypeName}
                </span>
            </td>
            <td class="px-6 py-4">
                <div class="text-sm text-gray-900 truncate max-w-xs">${ticket.description}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${formatDateTime(ticket.submittedDate)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(ticket.status)}">
                    ${ticket.status}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button onclick="viewTicketDetails('${ticket.ticketId}')" class="text-blue-600 hover:text-blue-900 mr-3">
                    <i class="fas fa-eye"></i> View
                </button>
            </td>
        `;
        tableBody.appendChild(row);

        const card = document.createElement('div');
        card.className = 'bg-white border rounded-lg shadow-sm';
        card.innerHTML = `
            <div class="p-4 border-b flex justify-between items-center">
                <div>
                    <span class="text-blue-600 font-semibold">${ticket.ticketId}</span>
                    <span class="ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(ticket.status)}">
                        ${ticket.status}
                    </span>
                </div>
            </div>
            <div class="p-4">
                <div class="flex items-center mb-3">
                    <div class="h-8 w-8 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center">
                        <span class="text-gray-500 font-medium">${ticket.customerName.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <div class="ml-3">
                        <div class="text-sm font-medium">${ticket.customerName}</div>
                        <div class="text-xs text-gray-500">${ticket.mobile}</div>
                    </div>
                </div>
                <div class="mb-3">
                    <span class="inline-block px-2 py-1 text-xs font-semibold rounded-full ${getIssueTypeStyle(ticket.issueType)} mb-2">
                        ${ticket.issueTypeName}
                    </span>
                    <p class="text-sm text-gray-700">${ticket.description}</p>
                </div>
                <div class="text-xs text-gray-500 mb-3">
                    Submitted: ${formatDateTime(ticket.submittedDate)}
                </div>
                <button onclick="viewTicketDetails('${ticket.ticketId}')" class="w-full bg-blue-50 text-blue-600 p-2 rounded text-center">
                    <i class="fas fa-eye"></i> View Details
                </button>
            </div>
        `;
        mobileView.appendChild(card);
    });

    document.getElementById('ticketsShown').textContent = paginatedTickets.length;
    document.getElementById('totalTicketsCount').textContent = filteredTickets.length;
    document.getElementById('currentPage').textContent = currentPage;

    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = end >= filteredTickets.length;
}

function updateDashboardStats() {
    const totalTickets = filteredTickets.length;
    document.getElementById('totalTickets').textContent = totalTickets;
}

function formatDateTime(dateTime) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateTime).toLocaleString(undefined, options);
}

function getIssueTypeStyle(issueType) {
    switch (issueType) {
        case 'network': return 'bg-green-100 text-green-800';
        case 'billing': return 'bg-yellow-100 text-yellow-800';
        case 'technical': return 'bg-blue-100 text-blue-800';
        case 'plans': return 'bg-purple-100 text-purple-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

function getStatusStyle(status) {
    switch (status) {
        case 'New': return 'bg-blue-100 text-blue-600';
        case 'In Progress': return 'bg-yellow-100 text-yellow-600';
        case 'Resolved': return 'bg-green-100 text-green-600';
        case 'Closed': return 'bg-gray-100 text-gray-600';
        default: return 'bg-gray-200 text-gray-600';
    }
}

async function viewTicketDetails(ticketId) {
    try {
        const response = await fetchWithAuth(`http://localhost:8081/api/support/ticket/${ticketId}`);
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                console.warn("Unauthorized or Forbidden access. Token may be invalid or expired.");
                localStorage.removeItem('jwtToken');
                window.location.href = '/admin/adminlogin.html';
                throw new Error('Unauthorized access. Redirecting to login page.');
            }
            throw new Error(`Failed to fetch ticket details: ${response.status}`);
        }
        const ticket = await response.json();
        console.log("Fetched ticket details:", ticket);
        if (ticket) {
            document.getElementById('modalTicketId').textContent = ticket.ticketId;
            document.getElementById('modalStatus').textContent = ticket.status;
            document.getElementById('modalIssueType').textContent = ticket.issueTypeName;
            document.getElementById('modalSubmitted').textContent = formatDateTime(ticket.submittedDate);
            document.getElementById('modalUpdated').textContent = formatDateTime(ticket.lastUpdated);
            document.getElementById('modalName').textContent = ticket.customerName;
            document.getElementById('modalMobile').textContent = ticket.mobile;
            document.getElementById('modalDescription').textContent = ticket.description;

            const communicationContainer = document.getElementById('modalCommunication');
            communicationContainer.innerHTML = '';
            ticket.communication.forEach(comm => {
                const messageDiv = document.createElement('div');
                messageDiv.className = 'border p-2 rounded mb-2';
                messageDiv.innerHTML = `<strong>${comm.sender}:</strong> <span>${comm.message}</span> <small class="text-gray-500">(${formatDateTime(comm.timestamp)})</small>`;
                communicationContainer.appendChild(messageDiv);
            });

            // Reset reply form
            const replyForm = document.getElementById('replyForm');
            replyForm.reset();
            replyForm.dataset.ticketId = ticket.ticketId; // Store ticketId in form

            document.getElementById('ticketModal').style.display = 'block';
        }
    } catch (error) {
        console.error("Error fetching ticket details:", error);
        showMessage(`Error fetching ticket details: ${error.message}`, 'error');
    }
}

async function sendReply(ticketId, replyMessage, sender) {
    try {
        const response = await fetchWithAuth('http://localhost:8081/api/support/reply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ticketId: ticketId,
                replyMessage: replyMessage,
                sender: sender
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to send reply: ${response.status}`);
        }

        const updatedTicket = await response.json();
        console.log("Reply sent and ticket updated:", updatedTicket);
        showMessage('Reply sent successfully! Ticket has been closed.', 'success');

        // Update communication history in modal
        const communicationContainer = document.getElementById('modalCommunication');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'border p-2 rounded mb-2';
        messageDiv.innerHTML = `<strong>${sender}:</strong> <span>${replyMessage}</span> <small class="text-gray-500">(${formatDateTime(updatedTicket.lastUpdated)})</small>`;
        communicationContainer.appendChild(messageDiv);

        // Update ticket status and last updated in modal
        document.getElementById('modalStatus').textContent = updatedTicket.status;
        document.getElementById('modalUpdated').textContent = formatDateTime(updatedTicket.lastUpdated);

        // Update allTickets and filteredTickets
        const ticketIndex = allTickets.findIndex(t => t.ticketId === ticketId);
        if (ticketIndex !== -1) {
            allTickets[ticketIndex] = updatedTicket;
            const filteredIndex = filteredTickets.findIndex(t => t.ticketId === ticketId);
            if (filteredIndex !== -1) {
                filteredTickets[filteredIndex] = updatedTicket;
            }
            renderTickets();
        }

        // Clear reply form
        document.getElementById('replyForm').reset();
    } catch (error) {
        console.error("Error sending reply:", error);
        showMessage(`Error sending reply: ${error.message}`, 'error');
    }
}

function closeTicketModal() {
    document.getElementById('ticketModal').style.display = 'none';
}

function applyFilters() {
    const searchTerm = document.getElementById('searchTickets').value.trim().toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const issueTypeFilter = document.getElementById('issueTypeFilter').value;

    filteredTickets = allTickets.filter(ticket => {
        const matchesSearch = (
            (ticket.ticketId && ticket.ticketId.toLowerCase().includes(searchTerm)) ||
            (ticket.customerName && ticket.customerName.toLowerCase().includes(searchTerm)) ||
            (ticket.mobile && ticket.mobile.toLowerCase().includes(searchTerm)) ||
            (ticket.description && ticket.description.toLowerCase().includes(searchTerm))
        );
        const matchesStatus = !statusFilter || ticket.status === statusFilter;
        const matchesIssueType = !issueTypeFilter || ticket.issueType === issueTypeFilter;

        return matchesSearch && matchesStatus && matchesIssueType;
    });

    currentPage = 1; // Reset to first page
    renderTickets();
    updateDashboardStats();
}

function resetFilters() {
    document.getElementById('searchTickets').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('issueTypeFilter').value = '';
    filteredTickets = [...allTickets];
    currentPage = 1;
    renderTickets();
    updateDashboardStats();
}

function showMessage(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-4 py-2 rounded-lg text-white ${type === 'success' ? 'bg-green-600' : 'bg-red-600'} shadow-lg z-50`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('opacity-0', 'transition-opacity', 'duration-500');
        setTimeout(() => document.body.removeChild(toast), 500);
    }, 3000);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Check if the user is logged in (token exists)
    const token = localStorage.getItem('jwtToken');
    console.log("JWT Token from localStorage:", token);
    if (!token) {
        console.warn("No JWT token found. Redirecting to login page.");
        window.location.href = '/admin/adminlogin.html';
        return;
    }

    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    mobileMenuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
        sidebarOverlay.classList.toggle('hidden');
    });
    
    sidebarOverlay.addEventListener('click', function() {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.add('hidden');
    });

    const toggleFilters = document.getElementById('toggleFilters');
    const filterContainer = document.getElementById('filterContainer');
    const filterIcon = document.getElementById('filterIcon');
    
    toggleFilters.addEventListener('click', function() {
        filterContainer.classList.toggle('hidden');
        filterIcon.classList.toggle('fa-chevron-down');
        filterIcon.classList.toggle('fa-chevron-up');
    });

    document.getElementById('applyFilters').addEventListener('click', applyFilters);
    document.getElementById('resetFilters').addEventListener('click', resetFilters);
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTickets();
        }
    });
    document.getElementById('nextPage').addEventListener('click', () => {
        if (currentPage * ticketsPerPage < filteredTickets.length) {
            currentPage++;
            renderTickets();
        }
    });

    // Optional: Real-time search on input change
    document.getElementById('searchTickets').addEventListener('input', applyFilters);

    // Reply form submission
    document.getElementById('replyForm').addEventListener('submit', async function(event) {
        event.preventDefault();
        const ticketId = this.dataset.ticketId;
        const replyMessage = document.getElementById('replyMessage').value.trim();
        const sender = document.getElementById('sender').value.trim();

        if (!replyMessage) {
            showMessage('Reply message cannot be empty', 'error');
            return;
        }
        if (!sender) {
            showMessage('Sender name cannot be empty', 'error');
            return;
        }

        await sendReply(ticketId, replyMessage, sender);
    });

    loadTickets(); // Load tickets on page load
});