/* =====================================================
   CONFIG
===================================================== */
const BACKEND_URL = "https://booklandbackend.onrender.com";
const FALLBACK_TEXT = "N/A";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache
let feesCache = { data: null, timestamp: 0 };

/* =====================================================
   HELPERS
===================================================== */
function qs(id) {
    return document.getElementById(id);
}

function formatKES(amount) {
    if (amount === null || amount === undefined || isNaN(amount)) return "KES 0";
    return "KES " + Number(amount).toLocaleString("en-KE");
}

function safeText(text) {
    return text || FALLBACK_TEXT;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/* =====================================================
   FEES
===================================================== */
async function loadFeeStructure() {
    const tableBody = qs("feesTableBody");
    if (!tableBody) return;

    // Show loading state
    tableBody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </td>
        </tr>
    `;

    try {
        // Check cache first
        const now = Date.now();
        if (feesCache.data && (now - feesCache.timestamp) < CACHE_TTL) {
            renderFees(feesCache.data, tableBody);
            return;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const res = await fetch(`${BACKEND_URL}/api/fees/`, {
            signal: controller.signal,
            headers: {
                'Accept': 'application/json',
            }
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
            if (res.status === 404) throw new Error('Fee data not found');
            if (res.status >= 500) throw new Error('Server error');
            throw new Error(`Failed to fetch fees: ${res.status}`);
        }

        const data = await res.json();

        // Cache the data
        feesCache = { data: data, timestamp: Date.now() };

        // Render the data
        renderFees(data, tableBody);

    } catch (error) {
        console.error("Error loading fees:", error);

        // Show cached data if available, even if expired
        if (feesCache.data) {
            renderFees(feesCache.data, tableBody);
            showToast('Showing cached data. Some information may be outdated.', 'warning');
            return;
        }

        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-danger text-center">
                    <div>
                        <i class="bi bi-exclamation-triangle fs-4"></i>
                        <p class="mt-2 mb-0">Failed to load fee structure.</p>
                        <small class="text-muted">${error.name === 'AbortError' ? 'Request timeout' : 'Please try again later'}</small>
                    </div>
                </td>
            </tr>
        `;
    }
}

function renderFees(data, tableBody) {
    tableBody.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">
                    <i class="bi bi-info-circle fs-4"></i>
                    <p class="mt-2 mb-0">No fee structure available.</p>
                    <small class="text-muted">Check back later</small>
                </td>
            </tr>
        `;
        return;
    }

    data.forEach((fee, index) => {
        const row = document.createElement("tr");
        row.setAttribute("data-aos", "fade-up");
        row.setAttribute("data-aos-delay", index * 100);

        const downloadBtn = fee.file
            ? `
                <a href="${escapeHtml(fee.file)}"
                   class="btn btn-primary btn-sm"
                   target="_blank"
                   rel="noopener noreferrer"
                   aria-label="Download fee structure for ${escapeHtml(fee.level)}">
                    <i class="bi bi-file-earmark-arrow-down"></i>
                    Download PDF
                </a>
              `
            : `<span class="text-muted">${FALLBACK_TEXT}</span>`;

        row.innerHTML = `
            <td>${escapeHtml(safeText(fee.level))}</td>
            <td>${formatKES(fee.tuition_per_term)}</td>
            <td>${formatKES(fee.meals_fee)}</td>
            <td>${formatKES(fee.transport_fee)}</td>
            <td><strong>${formatKES(fee.total_fee)}</strong></td>
            <td>${downloadBtn}</td>
        `;

        tableBody.appendChild(row);
    });

    if (window.AOS) AOS.refresh();
}

function showToast(message, type = 'info') {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-bg-${type} border-0 position-fixed bottom-0 end-0 m-3`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${escapeHtml(message)}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    document.body.appendChild(toast);

    const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
    bsToast.show();

    toast.addEventListener('hidden.bs.toast', () => {
        document.body.removeChild(toast);
    });
}

/* =====================================================
   INIT & REFRESH
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
    loadFeeStructure();

    // Refresh button (optional)
    const refreshBtn = qs("refreshFeesBtn");
    if (refreshBtn) {
        refreshBtn.addEventListener("click", () => {
            feesCache = { data: null, timestamp: 0 };
            loadFeeStructure();
        });
    }

    // Auto-refresh every 30 minutes
    setInterval(() => {
        feesCache = { data: null, timestamp: 0 };
        loadFeeStructure();
    }, 30 * 60 * 1000);
});