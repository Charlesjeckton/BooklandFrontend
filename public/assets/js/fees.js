/* =====================================================
   CONFIG
===================================================== */
const BACKEND_URL = "https://booklandbackend.onrender.com";
const FALLBACK_TEXT = "N/A";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let feesCache = { data: null, timestamp: 0 };

/* =====================================================
   HELPERS
===================================================== */
const $ = id => document.getElementById(id);

const formatKES = amount => {
    if (amount === null || amount === undefined || isNaN(amount)) return "KES 0";
    return "KES " + Number(amount).toLocaleString("en-KE");
};

const escapeHtml = str => {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
};

/* =====================================================
   FEES RENDERING
===================================================== */
async function loadFeeStructure() {
    const tableBody = $("feesTableBody");
    if (!tableBody) return;

    // Show loading state
    tableBody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2 text-muted">Loading fee information...</p>
            </td>
        </tr>
    `;

    try {
        const now = Date.now();
        if (feesCache.data && (now - feesCache.timestamp) < CACHE_TTL) {
            renderFees(feesCache.data, tableBody);
            return;
        }

        const res = await fetch(`${BACKEND_URL}/fees/`);
        if (!res.ok) throw new Error(`Failed to fetch fees: ${res.status}`);
        const data = await res.json();

        if (!Array.isArray(data)) throw new Error("Invalid data format received");

        feesCache = { data, timestamp: Date.now() };
        renderFees(data, tableBody);

    } catch (err) {
        console.error("Error loading fees:", err);
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5">
                    <div class="alert alert-danger">
                        <strong>Failed to load fee structure</strong>
                        <p class="mb-0 mt-2 small">${escapeHtml(err.message)}</p>
                        <button class="btn btn-sm btn-outline-danger mt-3" onclick="loadFeeStructure()">
                            Retry
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }
}

function renderFees(fees, tableBody) {
    tableBody.innerHTML = "";

    if (!fees.length) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5">
                    <div class="alert alert-info">
                        No fee structure available. Fee information will be updated soon.
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    fees.forEach(fee => {
        const row = document.createElement("tr");

        const downloadBtn = fee.file_url
            ? `<a href="${escapeHtml(fee.file_url)}" target="_blank" class="btn btn-primary btn-sm me-1">
                   <i class="bi bi-file-earmark-arrow-down"></i> Download
               </a>`
            : `<span class="text-muted">${FALLBACK_TEXT}</span>`;

        row.innerHTML = `
            <td class="align-middle"><strong>${escapeHtml(fee.level)}</strong></td>
            <td class="align-middle">${formatKES(fee.tuition_per_term)}</td>
            <td class="align-middle">${formatKES(fee.meals_fee)}</td>
            <td class="align-middle">${formatKES(fee.transport_fee)}</td>
            <td class="align-middle"><span class="badge bg-success fs-6">${formatKES(fee.total_fee)}</span></td>
            <td class="align-middle">${downloadBtn}</td>
        `;

        tableBody.appendChild(row);
    });
}

/* =====================================================
   INIT
===================================================== */
document.addEventListener("DOMContentLoaded", loadFeeStructure);
