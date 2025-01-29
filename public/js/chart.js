async function fetchUserRegistrations() {
    try {
        const response = await fetch('/analytics/user-registrations', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();

        if (!data.success) {
            console.error("Failed to fetch user registrations");
            return;
        }

        // Extract data
        const labels = data.data.map(item => item.date);
        const counts = data.data.map(item => item.count);
        // const totalUsers = counts.reduce((a, b) => a + b, 0); // Sum of all users

        // Update user count in the UI
        // document.getElementById("totalUsers").textContent = totalUsers;

        // Chart.js Configuration
        const ctx = document.getElementById('registrationChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Registrations',
                    data: counts,
                    borderColor: '#1e1e2d',
                    borderWidth: 2,
                    fill: true,
                    backgroundColor: 'rgba(30, 30, 45, 0.1)', // Light transparent fill
                    tension: 0.3, // Smooth curve
                    pointRadius: 0, // Hide dots by default
                    pointHoverRadius: 6, // Show dots when hovered
                    pointBackgroundColor: "#1e1e2d", // Dark color for hovered points
                    pointBorderColor: "#fff", // White outline for hovered points
                    pointBorderWidth: 2, // Outline size
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        enabled: true, // Enable tooltips
                        mode: "index",
                        intersect: false,
                        backgroundColor: "rgba(0,0,0,0.8)", // Dark background for tooltip
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 12 },
                        padding: 10,
                        cornerRadius: 6,
                        callbacks: {
                            label: function(context) {
                                return ` Inscriptions: ${context.raw}`; // Custom label format
                            }
                        }
                    },
                    legend: {
                        display: false // Hide legend for a clean UI
                    }
                },
                interaction: {
                    mode: "nearest",
                    intersect: false
                },
                scales: {
                    x: {
                        display: false // Hide x-axis labels
                    },
                    y: {
                        display: false // Hide y-axis labels
                    }
                }
            }
        });
                        

    } catch (error) {
        console.error("Error fetching registration data:", error);
    }
}

// Load chart on page load
fetchUserRegistrations();



