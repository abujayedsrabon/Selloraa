// traditional-frontend/assets/js/ajax-logic.js
// Modern AJAX logic using fetch() to connect to the PHP backend API

const API_URL = '../php/api/vendor_api.php';

// Function to get vendor data by UID
async function getVendorData(uid) {
    try {
        const response = await fetch(`${API_URL}?uid=${uid}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching vendor data:', error);
        return null;
    }
}

// Function to save vendor data (Store Builder)
async function saveVendorData(vendorData) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(vendorData),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error saving vendor data:', error);
        return null;
    }
}

// Example usage on the dashboard page
document.addEventListener('DOMContentLoaded', async () => {
    const storeForm = document.getElementById('store-builder-form');
    if (storeForm) {
        storeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                uid: 'USER_UID_HERE', // This would come from your auth system
                store_name: document.getElementById('store_name').value,
                logo: document.getElementById('logo_url').value,
                location: document.getElementById('location').value,
                package_id: 'Starter'
            };

            const result = await saveVendorData(formData);
            if (result) {
                alert('Store updated successfully! Your slug is: ' + result.slug);
            } else {
                alert('Failed to update store.');
            }
        });
    }
});
