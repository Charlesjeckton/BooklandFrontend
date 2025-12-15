document.addEventListener("DOMContentLoaded", function () {

    const tableBody = document.getElementById("feesTableBody");

    function formatKES(amount) {
        return "KES " + Number(amount).toLocaleString("en-KE");
    }

    fetch("{% url 'api_fees' %}")
        .then(response => response.json())
        .then(data => {
            tableBody.innerHTML = "";

            if (!data.length) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center">No fee structure available.</td>
                    </tr>
                `;
                return;
            }

            data.forEach((fee, index) => {
                const row = document.createElement("tr");
                row.setAttribute("data-aos", "fade-up");
                row.setAttribute("data-aos-delay", index * 100);

                row.innerHTML = `
                    <td>${fee.level}</td>
                    <td>${formatKES(fee.tuition_per_term)}</td>
                    <td>${formatKES(fee.meals_fee)}</td>
                    <td>${formatKES(fee.transport_fee)}</td>
                    <td><strong>${formatKES(fee.total_fee)}</strong></td>
                    <td>
                        ${
                            fee.file
                                ? `<a href="${fee.file}" class="btn btn-primary" download>
                                       <i class="bi bi-file-earmark-arrow-down"></i> Download (PDF)
                                   </a>`
                                : `<span class="text-muted">N/A</span>`
                        }
                    </td>
                `;

                tableBody.appendChild(row);
            });

            AOS.refresh();
        })
        .catch(error => {
            console.error("Error loading fees:", error);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-danger text-center">
                        Failed to load fee structure.
                    </td>
                </tr>
            `;
        });
});
