/**
 * Fix for permanent loading overlay on forms
 * Add this script to immediately correct the issue
 */
document.addEventListener('DOMContentLoaded', function() {
    // Find all form loading overlays and hide them
    const loadingOverlays = document.querySelectorAll('.form-loading');
    console.log("Found", loadingOverlays.length, "loading overlays");
    
    loadingOverlays.forEach(overlay => {
        // Hide the overlay
        overlay.style.display = 'none';
        console.log("Fixed overlay:", overlay);
    });
    
    // Ensure forms are interactive
    const forms = document.querySelectorAll('form[data-netlify="true"]');
    forms.forEach(form => {
        // Make sure form is not disabled or has pointer-events: none
        form.style.pointerEvents = 'auto';
        form.style.opacity = '1';
        console.log("Enabled form:", form.getAttribute('name'));
        
        // Check for any disabled inputs and enable them
        const inputs = form.querySelectorAll('input, textarea, select, button');
        inputs.forEach(input => {
            input.disabled = false;
        });
    });
    
    console.log("Form overlay fix applied successfully");
});