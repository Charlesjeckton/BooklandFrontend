// Load Admission Deadlines
fetch('https://booklandbackend.onrender.com/api/admissions-deadlines/')  // <-- replace with your endpoint
    .then(res => res.json())
    .then(data => {
        const container = document.getElementById('admission-deadlines');
        container.innerHTML = '';
        if (data.length === 0) {
            container.innerHTML = '<p>No deadlines have been set yet.</p>';
            return;
        }
        data.forEach(d => {
            const div = document.createElement('div');
            div.className = 'deadline-item';
            div.innerHTML = `<h4>${d.name}</h4><div class="date">${new Date(d.deadline_date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            })}</div>`;
            container.appendChild(div);
        });
    })
    .catch(err => {
        document.getElementById('admission-deadlines').innerHTML = '<p>Failed to load deadlines.</p>';
        console.error(err);
    });

// Request Information Form
document.getElementById('requestInfoForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        message: document.getElementById('message').value,
    };
    fetch('https://booklandbackend.onrender.com/api/request-info/', {  // <-- replace with your endpoint
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData),
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                document.getElementById('successMessage').textContent = data.message || 'Request sent successfully!';
                new bootstrap.Modal(document.getElementById('successModal')).show();
                document.getElementById('requestInfoForm').reset();
            } else {
                document.getElementById('errorMessage').textContent = data.error || 'Something went wrong.';
                new bootstrap.Modal(document.getElementById('errorModal')).show();
            }
        })
        .catch(err => {
            document.getElementById('errorMessage').textContent = 'Error connecting to server.';
            new bootstrap.Modal(document.getElementById('errorModal')).show();
            console.error(err);
        });
});
