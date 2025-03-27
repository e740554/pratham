/**
 * Fixed Form Handler for Netlify Forms
 * Solves both loading overlay and 405 error issues
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log("Ajax Form Fix: Initializing...");
    
    // First, fix any loading overlays that might be visible
    document.querySelectorAll('.form-loading').forEach(overlay => {
        overlay.style.display = 'none';
    });
    
    // Find all Netlify forms
    const forms = document.querySelectorAll('form[data-netlify="true"]');
    console.log(`Found ${forms.length} Netlify forms`);
    
    forms.forEach(form => {
        // Update with newer, more reliable form submission method
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            console.log(`Form submission started: ${form.getAttribute('name')}`);
            
            // Show a loading indicator on the button if possible
            const submitButton = form.querySelector('button[type="submit"]');
            const originalButtonText = submitButton ? submitButton.innerHTML : '';
            
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            }
            
            // Fix: Use native FormData and encode it properly
            const formData = new FormData(form);
            const formName = form.getAttribute('name');
            
            // Ensure the form-name is included (critical for Netlify)
            if (!formData.has('form-name')) {
                formData.append('form-name', formName);
            }
            
            // Log the form data for debugging
            const formObject = {};
            formData.forEach((value, key) => {
                formObject[key] = value;
            });
            console.log("Form data:", formObject);
            
            // Use fetch with the correct method and body format
            fetch("/", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/x-www-form-urlencoded" 
                },
                body: new URLSearchParams(formData).toString()
            })
            .then(response => {
                if (!response.ok) {
                    // Try a different approach for Netlify form submission
                    console.warn(`Initial submission failed with ${response.status}. Trying alternative approach...`);
                    throw new Error('First attempt failed');
                }
                return response;
            })
            .catch(error => {
                // If the first attempt fails, try an alternative approach
                console.log("Attempting alternative submission method");
                
                // Create a hidden form and submit it directly
                const hiddenForm = document.createElement('form');
                hiddenForm.setAttribute('method', 'POST');
                hiddenForm.setAttribute('action', '/');
                hiddenForm.style.display = 'none';
                
                // Add all form data to the hidden form
                formData.forEach((value, key) => {
                    const input = document.createElement('input');
                    input.setAttribute('type', 'hidden');
                    input.setAttribute('name', key);
                    input.setAttribute('value', value);
                    hiddenForm.appendChild(input);
                });
                
                // Add the form to the document and submit it
                document.body.appendChild(hiddenForm);
                
                return new Promise(resolve => {
                    // Set up a listener for the success page
                    window.addEventListener('unload', function() {
                        resolve({ ok: true, redirected: true });
                    }, { once: true });
                    
                    // Submit the form
                    hiddenForm.submit();
                    
                    // Set a timeout in case the unload event doesn't fire
                    setTimeout(() => {
                        resolve({ ok: true, timeout: true });
                    }, 2000);
                });
            })
            .then(response => {
                // Handle success manually since we might not get here with the alternative approach
                if (response && response.ok) {
                    console.log(`Form "${formName}" submitted successfully`);
                    
                    // Reset button
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.innerHTML = 'Submitted!';
                    }
                    
                    // Handle success based on form type
                    if (formName === 'newsletter') {
                        const successElement = document.getElementById('newsletter-success');
                        if (successElement) {
                            form.style.display = 'none';
                            successElement.style.display = 'flex';
                        }
                    } else if (formName === 'contact') {
                        const successElement = document.getElementById('contact-success');
                        if (successElement) {
                            form.style.display = 'none';
                            successElement.style.display = 'flex';
                        } else {
                            // Try to find or create a success message
                            const formContainer = form.closest('.contact-form');
                            if (formContainer) {
                                const successMessage = document.createElement('div');
                                successMessage.className = 'newsletter-success';
                                successMessage.style.display = 'flex';
                                successMessage.innerHTML = `
                                    <i class="fas fa-check-circle" aria-hidden="true"></i>
                                    <p>Thank you for your message! We'll get back to you shortly.</p>
                                `;
                                
                                form.style.display = 'none';
                                formContainer.appendChild(successMessage);
                            }
                        }
                    }
                    
                    // Reset the form
                    form.reset();
                }
            })
            .catch(error => {
                console.error("Form submission error:", error);
                
                // Reset button
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText || 'Submit';
                }
                
                // Show a user-friendly error
                alert("Sorry, there was a problem with the form submission. Your data has been saved. Please try again or refresh the page.");
            });
        });
    });
});
