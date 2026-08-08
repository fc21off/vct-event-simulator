const STORAGE_KEY = 'vct_sandbox_events';

/**
 * Gets all saved custom sandbox events.
 * @returns {Array} Array of custom event objects
 */
export function getSavedCustomEvents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to load custom events from localStorage:', err);
    return [];
  }
}

/**
 * Saves a new custom event.
 * @param {Object} customEvent 
 */
export function saveCustomEvent(customEvent) {
  try {
    const events = getSavedCustomEvents();
    const existingIndex = events.findIndex(e => e.id === customEvent.id);
    if (existingIndex >= 0) {
      events[existingIndex] = customEvent;
    } else {
      events.push(customEvent);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (err) {
    console.error('Failed to save custom event to localStorage:', err);
  }
}

/**
 * Deletes a custom event by ID.
 * @param {string} id 
 */
export function deleteCustomEvent(id) {
  try {
    const events = getSavedCustomEvents().filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (err) {
    console.error('Failed to delete custom event:', err);
  }
}

/**
 * Gets a custom event by ID.
 * @param {string} id 
 * @returns {Object|null}
 */
export function getCustomEventById(id) {
  const events = getSavedCustomEvents();
  return events.find(e => e.id === id) || null;
}
