import React from 'react';
import axios from 'axios';

const InactivationButton = () => {
    const handleModeChange = (newMode) => {
        axios.post('http://localhost:4000/api/updateConfig', { newConfig: newMode })
            .then(response => {
                console.log(response.data); // Output: Config updated successfully.
                // Optionally handle success feedback or UI updates
            })
            .catch(error => {
                console.error('Error updating config:', error);
                // Handle error scenarios
            });
    };

    return (
        <button onClick={() => handleModeChange('inactive')}>
            Inactive Mode
        </button>
    );
};

export default InactivationButton;
