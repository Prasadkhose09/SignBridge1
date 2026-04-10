const JAVA_API_URL = 'https://signbridge-kh2j.onrender.com/sign-language';
const FLASK_URL    = import.meta.env.VITE_FLASK_URL || '/api/python';

export const checkHealth = async () => {
    try {
        const response = await fetch(`${JAVA_API_URL}/health`);
        return await response.json();
    } catch (e) {
        throw new Error('Backend Unavailable');
    }
};

export const fetchDictionary = async () => {
    try {
        const response = await fetch(`${JAVA_API_URL}/dictionary`);
        if (!response.ok) throw new Error('Failed to fetch dictionary');
        return await response.json();
    } catch (e) {
        console.error(e);
        return ['Hello', 'Hi', 'Good evening', 'How are u', 'I am fine', 'I need water', 'Thank You']; // Fallback
    }
};

export const fetchPrediction = async (frameData, sequenceNumber) => {
    try {
        const response = await fetch(`${FLASK_URL}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ frameData, sequenceNumber })
        });
        if (!response.ok) throw new Error('Prediction API Error');
        return await response.json();
    } catch (e) {
        console.error('Prediction call failed', e);
        return null;
    }
};

export const resetPrediction = async () => {
    try {
        await fetch(`${FLASK_URL}/reset`, { method: 'POST' });
    } catch (e) {
        console.error('Reset call failed', e);
    }
};
