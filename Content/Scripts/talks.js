function toggleAbstract(header) {
    const abstract = header.nextElementSibling;
    const isActive = header.classList.contains('active');
    
    // Toggle active class on header
    header.classList.toggle('active');
    
    // Toggle abstract visibility
    if (isActive) {
        abstract.classList.remove('active');
    } else {
        abstract.classList.add('active');
        // MathJax neu rendern, wenn der Abstract geöffnet wird
        if (window.MathJax) {
            MathJax.typesetPromise([abstract]).catch(function (err) {
                console.log('MathJax error: ' + err.message);
            });
        }
    }
}

// Initial MathJax rendering when page loads
document.addEventListener('DOMContentLoaded', function() {
    if (window.MathJax) {
        MathJax.typesetPromise().catch(function (err) {
            console.log('MathJax error: ' + err.message);
        });
    }
}); 