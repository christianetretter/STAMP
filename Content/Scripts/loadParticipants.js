function loadParticipants() {
    fetch('../../Data/participants.csv')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.text();
        })
        .then(data => {
            const participants = parseCSV(data);
            const container = document.querySelector('.participants-list');
            container.innerHTML = ''; // Clear existing content
            
            participants.forEach(participant => {
                const row = document.createElement('div');
                row.className = 'participant-row';
                row.innerHTML = `
                    <span class="participant-number">${participant.number}.</span>
                    <h3>${participant.name}</h3>
                    <p class="participant-affiliation">${participant.affiliation}</p>
                `;
                container.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading participants:', error);
            const container = document.querySelector('.participants-list');
            container.innerHTML = '<p class="error">Error loading participants. Please try again later.</p>';
        });
}

function parseCSV(csv) {
    const lines = csv.split('\n');
    const headers = lines[0].split(',');
    
    return lines.slice(1)
        .filter(line => line.trim() !== '') // Remove empty lines
        .map(line => {
            const values = line.split(',');
            return {
                number: values[0],
                name: values[1],
                affiliation: values[2]
            };
        });
}

// Load participants when the page loads
document.addEventListener('DOMContentLoaded', loadParticipants); 