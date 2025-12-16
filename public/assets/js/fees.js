/* =====================================================
   CONFIG
===================================================== */
const BACKEND_URL = "https://booklandbackend.onrender.com";
const FALLBACK_TEXT = "N/A";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache
const PDF_PREVIEW_MODAL_ID = "pdfPreviewModal";
let feesCache = {data: null, timestamp: 0};

/* =====================================================
   HELPERS
===================================================== */
function qs(id) {
    return document.getElementById(id);
}

function qsa(selector) {
    return document.querySelectorAll(selector);
}

function formatKES(amount) {
    if (amount === null || amount === undefined || isNaN(amount)) return "KES 0";
    return "KES " + Number(amount).toLocaleString("en-KE");
}

function safeText(text) {
    return text || FALLBACK_TEXT;
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/* =====================================================
   FEES - FIXED FETCH REQUEST
===================================================== */
async function loadFeeStructure() {
    const tableBody = qs("feesTableBody");
    if (!tableBody) return;

    // Show loading state
    tableBody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading fee structure...</span>
                </div>
                <p class="mt-2 text-muted">Loading fee information...</p>
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
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        // FIXED: No custom headers to avoid CORS preflight
        const res = await fetch(`${BACKEND_URL}/api/fees/`, {
            signal: controller.signal
            // No headers = no CORS preflight required
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
            if (res.status === 404) throw new Error('Fee data not found');
            if (res.status >= 500) throw new Error('Server error');
            throw new Error(`Failed to fetch fees: ${res.status}`);
        }

        const data = await res.json();

        // Validate data structure
        if (!Array.isArray(data)) {
            throw new Error('Invalid data format received');
        }

        // Cache the data
        feesCache = {data: data, timestamp: Date.now()};

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
                <td colspan="6" class="text-center py-5">
                    <div class="alert alert-danger" role="alert">
                        <i class="bi bi-exclamation-triangle-fill me-2"></i>
                        <strong>Failed to load fee structure</strong>
                        <p class="mb-0 mt-2 small">${escapeHtml(error.name === 'AbortError' ? 'Request timeout. Please check your connection.' : 'Please try again later.')}</p>
                        <button class="btn btn-sm btn-outline-danger mt-3" onclick="loadFeeStructure()">
                            <i class="bi bi-arrow-clockwise"></i> Retry
                        </button>
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
                <td colspan="6" class="text-center py-5">
                    <div class="alert alert-info" role="alert">
                        <i class="bi bi-info-circle-fill me-2"></i>
                        <strong>No fee structure available</strong>
                        <p class="mb-0 mt-2 small">Fee information will be updated soon.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    data.forEach((fee, index) => {
        const row = document.createElement("tr");
        row.className = "fee-row";
        row.setAttribute("data-aos", "fade-up");
        row.setAttribute("data-aos-delay", index * 100);
        row.setAttribute("data-fee-id", fee.id || index);

        // Create download button - SIMPLIFIED
        let downloadBtn = `<span class="text-muted">${FALLBACK_TEXT}</span>`;

        if (fee.file) {
            downloadBtn = `
                <a href="${escapeHtml(fee.file)}"
                   class="btn btn-primary btn-sm"
                   target="_blank"
                   rel="noopener noreferrer"
                   aria-label="Download fee structure for ${escapeHtml(fee.level)}">
                    <i class="bi bi-file-earmark-arrow-down"></i>
                    Download PDF
                </a>`;
        }

        row.innerHTML = `
            <td class="align-middle">
                <strong>${escapeHtml(safeText(fee.level))}</strong>
            </td>
            <td class="align-middle">${formatKES(fee.tuition_per_term)}</td>
            <td class="align-middle">${formatKES(fee.meals_fee)}</td>
            <td class="align-middle">${formatKES(fee.transport_fee)}</td>
            <td class="align-middle">
                <span class="badge bg-success fs-6">${formatKES(fee.total_fee)}</span>
            </td>
            <td class="align-middle">${downloadBtn}</td>
        `;

        tableBody.appendChild(row);
    });

    // Refresh AOS animations if available
    if (window.AOS) {
        AOS.refresh();
    }
}

function showToast(message, type = 'info') {
    // Simple console fallback
    console.log(`${type.toUpperCase()}: ${message}`);

    // If Bootstrap available, use toast
    if (typeof bootstrap !== 'undefined' && bootstrap.Toast) {
        const toastId = `toast-${Date.now()}`;
        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = `toast align-items-center text-bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');

        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi ${type === 'success' ? 'bi-check-circle' : type === 'warning' ? 'bi-exclamation-triangle' : 'bi-info-circle'} me-2"></i>
                    ${escapeHtml(message)}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;

        let toastContainer = qs('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }

        toastContainer.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast, {delay: 3000});
        bsToast.show();

        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }
}

/* =====================================================
   INIT
===================================================== */
function initializeFeeStructure() {
    // Initial load
    loadFeeStructure();

    // Refresh button
    const refreshBtn = qs("refreshFeesBtn");
    if (refreshBtn) {
        refreshBtn.addEventListener("click", () => {
            feesCache = {data: null, timestamp: 0};
            loadFeeStructure();
        });
    }

    // Auto-refresh every 30 minutes
    setInterval(() => {
        feesCache = {data: null, timestamp: 0};
        loadFeeStructure();
    }, 30 * 60 * 1000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFeeStructure);
} else {
    initializeFeeStructure();
}