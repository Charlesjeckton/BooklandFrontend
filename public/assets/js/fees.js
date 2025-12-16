/* =====================================================
   CONFIG
===================================================== */
const BACKEND_URL = "https://booklandbackend.onrender.com"; // backend API URL
const FALLBACK_TEXT = "N/A"; // fallback text for missing fields

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

/* =====================================================
   FEES
===================================================== */
async function loadFeeStructure() {
    const tableBody = qs("feesTableBody");
    if (!tableBody) return;

    try {
        const res = await fetch(`${BACKEND_URL}/api/fees/`);
        if (!res.ok) throw new Error(`Failed to fetch fees: ${res.statusText}`);

        const data = await res.json();
        tableBody.innerHTML = "";

        if (!Array.isArray(data) || data.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">
                        No fee structure available.
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
                    <a href="${fee.file}"
                       class="btn btn-primary btn-sm"
                       target="_blank"
                       rel="noopener noreferrer">
                        <i class="bi bi-file-earmark-arrow-down"></i>
                        Download PDF
                    </a>
                  `
                : `<span class="text-muted">${FALLBACK_TEXT}</span>`;

            row.innerHTML = `
                <td>${safeText(fee.level)}</td>
                <td>${formatKES(fee.tuition_per_term)}</td>
                <td>${formatKES(fee.meals_fee)}</td>
                <td>${formatKES(fee.transport_fee)}</td>
                <td><strong>${formatKES(fee.total_fee)}</strong></td>
                <td>${downloadBtn}</td>
            `;

            tableBody.appendChild(row);
        });

        if (window.AOS) AOS.refresh();

    } catch (error) {
        console.error("Error loading fees:", error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-danger text-center">
                    Failed to load fee structure.
                </td>
            </tr>
        `;
    }
}

/* =====================================================
   INIT
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
    loadFeeStructure();
});
