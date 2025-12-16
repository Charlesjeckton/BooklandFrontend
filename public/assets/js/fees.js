/* =====================================================
   CONFIG
===================================================== */
const BACKEND_URL = "https://booklandbackend.onrender.com";
const FALLBACK_TEXT = "N/A";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache
const PDF_PREVIEW_MODAL_ID = "pdfPreviewModal";
let feesCache = { data: null, timestamp: 0 };

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

function formatFileSize(bytes) {
    if (!bytes || typeof bytes !== 'number') return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
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

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
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

        const res = await fetch(`${BACKEND_URL}/api/fees/`, {
            signal: controller.signal,
            headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
            },
            cache: 'no-store'
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

        // Create download button with enhanced features
        let downloadBtn = `<span class="text-muted">${FALLBACK_TEXT}</span>`;

        if (fee.file) {
            const fileSizeDisplay = fee.file_size ?
                `<small class="d-block text-muted mt-1">${formatFileSize(fee.file_size)}</small>` : '';

            const previewButton = `
                <button class="btn btn-outline-secondary btn-sm ms-2 preview-pdf"
                        data-level="${escapeHtml(fee.level)}"
                        data-file="${escapeHtml(fee.file)}"
                        aria-label="Preview fee structure for ${escapeHtml(fee.level)}">
                    <i class="bi bi-eye"></i>
                </button>`;

            downloadBtn = `
                <div class="d-flex align-items-center">
                    <a href="${escapeHtml(fee.file)}"
                       class="btn btn-primary btn-sm download-pdf"
                       target="_blank"
                       rel="noopener noreferrer"
                       data-level="${escapeHtml(fee.level)}"
                       aria-label="Download fee structure for ${escapeHtml(fee.level)}">
                        <i class="bi bi-file-earmark-arrow-down"></i>
                        Download
                        ${fileSizeDisplay}
                    </a>
                    ${previewButton}
                </div>`;
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

    // Initialize event listeners after rendering
    initializeFeeTableEvents();

    // Refresh AOS animations
    if (window.AOS) {
        AOS.refresh();
    }
}

function initializeFeeTableEvents() {
    // PDF download tracking
    qsa('.download-pdf').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const level = this.getAttribute('data-level');
            trackPDFDownload(level);

            // Optional: Add download delay for better UX
            setTimeout(() => {
                showToast(`Downloading fee structure for ${level}`, 'success');
            }, 100);
        });
    });

    // PDF preview functionality
    qsa('.preview-pdf').forEach(btn => {
        btn.addEventListener('click', function() {
            const level = this.getAttribute('data-level');
            const fileUrl = this.getAttribute('data-file');
            showPDFPreview(level, fileUrl);
        });
    });

    // Row click for preview (optional)
    qsa('.fee-row').forEach(row => {
        row.addEventListener('click', function(e) {
            // Only trigger if not clicking on a button
            if (!e.target.closest('a') && !e.target.closest('button')) {
                const level = this.querySelector('td:first-child strong').textContent;
                const downloadBtn = this.querySelector('.download-pdf');
                if (downloadBtn) {
                    const fileUrl = downloadBtn.getAttribute('href');
                    showPDFPreview(level, fileUrl);
                }
            }
        });
    });

    // Responsive table adjustments
    const table = qs("feesTableBody")?.closest('table');
    if (table && window.innerWidth < 768) {
        table.classList.add('table-responsive');
    }
}

function showPDFPreview(level, fileUrl) {
    // Create modal if it doesn't exist
    let modal = qs(PDF_PREVIEW_MODAL_ID);

    if (!modal) {
        modal = document.createElement('div');
        modal.id = PDF_PREVIEW_MODAL_ID;
        modal.className = 'modal fade';
        modal.setAttribute('tabindex', '-1');
        modal.setAttribute('aria-labelledby', 'pdfPreviewLabel');
        modal.setAttribute('aria-hidden', 'true');

        modal.innerHTML = `
            <div class="modal-dialog modal-xl modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="pdfPreviewLabel"></h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-0">
                        <iframe class="w-100" style="height: 70vh; min-height: 500px;" 
                                frameborder="0" allowfullscreen></iframe>
                    </div>
                    <div class="modal-footer">
                        <a href="#" class="btn btn-primary download-from-preview" download>
                            <i class="bi bi-download"></i> Download PDF
                        </a>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="bi bi-x-lg"></i> Close
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // Update modal content
    const modalTitle = modal.querySelector('#pdfPreviewLabel');
    const iframe = modal.querySelector('iframe');
    const downloadLink = modal.querySelector('.download-from-preview');

    modalTitle.textContent = `${level} - Fee Structure`;
    iframe.src = fileUrl;
    downloadLink.href = fileUrl;
    downloadLink.setAttribute('download', `fee_structure_${level.replace(/\s+/g, '_')}.pdf`);

    // Show modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();

    // Track preview event
    trackPDFPreview(level);
}

function trackPDFDownload(level) {
    // Analytics integration
    console.log(`PDF Download: ${level}`);

    if (window.gtag) {
        gtag('event', 'download', {
            'event_category': 'Fee Structure',
            'event_label': level,
            'value': 1
        });
    }

    if (window.fbq) {
        fbq('track', 'Lead', { content_name: `Fee Structure - ${level}` });
    }
}

function trackPDFPreview(level) {
    console.log(`PDF Preview: ${level}`);

    if (window.gtag) {
        gtag('event', 'view_item', {
            'event_category': 'Fee Structure',
            'event_label': level
        });
    }
}

function showToast(message, type = 'info') {
    // Check if Bootstrap Toast is available
    if (typeof bootstrap === 'undefined' || !bootstrap.Toast) {
        console.log(`${type.toUpperCase()}: ${message}`);
        return;
    }

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

    // Create toast container if it doesn't exist
    let toastContainer = qs('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }

    toastContainer.appendChild(toast);

    const bsToast = new bootstrap.Toast(toast, {
        delay: 4000,
        autohide: true
    });

    bsToast.show();

    // Remove toast from DOM after it's hidden
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

/* =====================================================
   INIT & REFRESH
===================================================== */
function initializeFeeStructure() {
    // Initial load
    loadFeeStructure();

    // Refresh button
    const refreshBtn = qs("refreshFeesBtn");
    if (refreshBtn) {
        refreshBtn.addEventListener("click", () => {
            feesCache = { data: null, timestamp: 0 };
            loadFeeStructure();
            showToast('Refreshing fee structure...', 'info');
        });
    }

    // Search functionality (if you add search input)
    const searchInput = qs("feeSearchInput");
    if (searchInput) {
        const handleSearch = debounce(() => {
            const searchTerm = searchInput.value.toLowerCase();
            const rows = qsa('.fee-row');

            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });

            if (searchTerm) {
                showToast(`Found ${document.querySelectorAll('.fee-row[style=""]').length} matching records`, 'info');
            }
        }, 300);

        searchInput.addEventListener('input', handleSearch);
    }

    // Auto-refresh with visibility check
    let refreshInterval;

    function setupAutoRefresh() {
        clearInterval(refreshInterval);

        refreshInterval = setInterval(() => {
            // Only refresh if page is visible
            if (!document.hidden) {
                feesCache = { data: null, timestamp: 0 };
                loadFeeStructure();
            }
        }, 30 * 60 * 1000); // 30 minutes
    }

    // Handle page visibility
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            setupAutoRefresh();
        } else {
            clearInterval(refreshInterval);
        }
    });

    setupAutoRefresh();

    // Export functionality (optional)
    const exportBtn = qs("exportFeesBtn");
    if (exportBtn) {
        exportBtn.addEventListener("click", exportFeesToCSV);
    }
}

function exportFeesToCSV() {
    if (!feesCache.data || !Array.isArray(feesCache.data)) {
        showToast('No data available to export', 'warning');
        return;
    }

    const csvContent = [
        ['Level', 'Tuition per Term', 'Meals Fee', 'Transport Fee', 'Total Fee', 'PDF URL'],
        ...feesCache.data.map(fee => [
            fee.level,
            fee.tuition_per_term,
            fee.meals_fee,
            fee.transport_fee,
            fee.total_fee,
            fee.file || ''
        ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fee_structure_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showToast('Fee structure exported successfully', 'success');
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initializeFeeStructure);

// Export functions for global access (optional)
window.refreshFeeStructure = () => {
    feesCache = { data: null, timestamp: 0 };
    loadFeeStructure();
};

window.exportFeeStructure = exportFeesToCSV;