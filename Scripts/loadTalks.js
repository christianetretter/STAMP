function loadTalks() {
    fetch('../../Data/talks.csv')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.text();
        })
        .then(data => {
            const talks = parseCSV(data);
            const container = document.querySelector('.talks-container');
            container.innerHTML = ''; // Clear existing content
            
            talks.forEach(talk => {
                const talkCard = document.createElement('div');
                talkCard.className = 'talk-card';
                talkCard.innerHTML = `
                    <div class="talk-header" onclick="toggleAbstract(this)">
                        <div class="talk-info">
                            <h3 class="talk-title">${talk.title}</h3>
                            <div class="talk-meta">
                                <p class="talk-author">${talk.author}</p>
                                <p class="talk-time">${talk.time}</p>
                            </div>
                        </div>
                        <div class="talk-toggle">
                            <img src="../../Images/dropdown_arrow.png" alt="Toggle" class="toggle-icon">
                        </div>
                    </div>
                    <div class="talk-abstract math-tex">
                        <p>${talk.abstract}</p>
                    </div>
                `;
                container.appendChild(talkCard);
            });

            // Initial render of all LaTeX
            if (window.MathJax) {
                MathJax.typesetPromise();
            }
        })
        .catch(error => {
            console.error('Error loading talks:', error);
            const container = document.querySelector('.talks-container');
            container.innerHTML = '<p class="error">Error loading talks. Please reload the page.</p>';
        });
}

function parseCSV(csv) {
    const lines = csv.split('\n');
    const headers = parseCSVLine(lines[0]);
    
    return lines.slice(1)
        .filter(line => line.trim() !== '')
        .map(line => {
            const values = parseCSVLine(line);
            return {
                number: values[0],
                title: values[1],
                author: values[2],
                time: values[3],
                abstract: values[4]
            };
        });
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                // Escaped quote
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current);
    return result;
}

function toggleAbstract(element) {
    const card = element.closest('.talk-card');
    const abstract = card.querySelector('.talk-abstract');
    const toggle = card.querySelector('.talk-toggle');
    
    element.classList.toggle('active');
    abstract.classList.toggle('active');
    toggle.classList.toggle('active');

    // Re-render LaTeX when opening the abstract
    if (abstract.classList.contains('active') && window.MathJax) {
        MathJax.typesetPromise([abstract]).catch(function (err) {
            console.log('MathJax error: ' + err.message);
        });
    }
}

// Load talks when the page loads
document.addEventListener('DOMContentLoaded', loadTalks); 