document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const toggleButton = document.querySelector('.toggle-button');
    const toggleText = document.querySelector('.toggle-text');

    toggleButton.addEventListener('click', () => {
        body.classList.toggle('toggled');
        
        // Toggle the text between "worst" and "best"
        if (toggleText.textContent === 'worst') {
            toggleText.textContent = 'best';
        } else {
            toggleText.textContent = 'worst';
        }
    });
}); 