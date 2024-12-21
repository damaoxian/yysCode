document.addEventListener('DOMContentLoaded', function() {
    // Populate age dropdowns
    const minAgeSelect = document.querySelector('.age-min');
    const maxAgeSelect = document.querySelector('.age-max');
    
    for(let i = 18; i <= 80; i += 5) {
        const optionMin = document.createElement('option');
        const optionMax = document.createElement('option');
        
        optionMin.value = i;
        optionMin.textContent = i;
        optionMax.value = i;
        optionMax.textContent = i;
        
        minAgeSelect.appendChild(optionMin);
        maxAgeSelect.appendChild(optionMax.cloneNode(true));
    }
    
    // Add 80+ option to max age
    const optionMax = document.createElement('option');
    optionMax.value = '80+';
    optionMax.textContent = '80+';
    maxAgeSelect.appendChild(optionMax);
    
    // Form submission
    document.querySelector('form').addEventListener('submit', function(e) {
        e.preventDefault();
        // Handle form submission logic here
        alert('Feature coming soon!');
    });
}); 