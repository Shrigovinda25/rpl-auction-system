/**
 * Global State Management and Utilities
 */

const STORAGE_KEY = 'rpl_auction_state';

const defaultState = {
  players: [],
  teams: [
    { name: "Team Alpha", captain: "Shashank", viceCaptain: "Shrigovinda", purse: 9000, players: [], maleCount: 0, femaleCount: 0 },
    { name: "Team Beta", captain: "Priya", viceCaptain: "Maitri", purse: 9000, players: [], maleCount: 0, femaleCount: 0 },
    { name: "Team Gamma", captain: "Aditya", viceCaptain: "Abhay", purse: 9000, players: [], maleCount: 0, femaleCount: 0 }
  ],
  auctionState: {
    isLive: false,
    currentPlayerIndex: 0,
    currentBid: 0,
    leadingTeam: null,
    selectedTeamIndex: 0,
    status: "Waiting" // Waiting, Selected, Not Selected
  }
};

/**
 * Retrieve the current global state
 */
function getState() {
    const rawState = localStorage.getItem(STORAGE_KEY);
    if (!rawState) {
        // Initialize state if it's not present
        saveState(defaultState);
        return defaultState;
    }
    try {
        return JSON.parse(rawState);
    } catch (e) {
        console.error("Failed to parse state from localStorage, resetting to default.", e);
        saveState(defaultState);
        return defaultState;
    }
}

/**
 * Save the global state and dispatch an event so the current tab can react.
 * (Other tabs will react via the native 'storage' event).
 */
function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event('stateUpdated'));
}

/**
 * Reset the state (usually triggered by Admin)
 */
function resetState() {
    if(confirm("Are you sure you want to reset the auction state completely? All teams, players and bids will be wiped!")) {
        saveState(defaultState);
        alert("Auction state has been reset.");
    }
}

/**
 * Listen to cross-tab storage changes and dispatch 'stateUpdated' internally
 * so our UI can update seamlessly whether the change happened here or elsewhere.
 */
window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
        window.dispatchEvent(new Event('stateUpdated'));
    }
});
