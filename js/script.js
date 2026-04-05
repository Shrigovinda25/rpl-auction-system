import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Full Firebase configuration for maximum stability
const firebaseConfig = {
  apiKey: "AIzaSyDnJ0KWlqwdYhuR2g4nvLheQxc56r6tk1g",
  authDomain: "rpl-auction-abf32.firebaseapp.com",
  projectId: "rpl-auction-abf32",
  storageBucket: "rpl-auction-abf32.firebasestorage.app",
  messagingSenderId: "786517772604",
  appId: "1:786517772604:web:35a665273ecdb93682b639",
  measurementId: "G-FR1LLDCEVW",
  databaseURL: "https://rpl-auction-abf32-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const STATE_PATH = 'rpl_auction/state';
const CONFIG_PATH = 'rpl_auction/config'; // Lowercase path as per standard

// Player Data
const HARDCODED_PLAYERS = [
  { "name": "Navdeep patil", "sport": ["Cricket", "Volleyball"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1MaQDht_trzhXXFIQdPCF3GlorBUjHVUx&sz=w1000", "achievements": "Role: Batsman | I always give my 100% on field", "status": "Waiting" },
  { "name": "Daksh Tiwari", "sport": ["Cricket", "Tug of War"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1uQObdEbKC-aYgAHqKVYT3V_bRKcnVA9v&sz=w1000", "achievements": "Role: Bowler | Been to a cricket coaching as a bowler", "status": "Waiting" },
  { "name": "Hitarth Panchal", "sport": ["Cricket", "Volleyball", "Batminton", "Tug of War"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1KKwW_NgJZxxqgu5V5Mq5_5xCbrWhEuJi&sz=w1000", "achievements": "Role: All-rounder | Since School days I'm playing all the above sports and also was a Inter School player", "status": "Waiting" },
  { "name": "VINAYAK S NAREGAL", "sport": ["Cricket", "Volleyball"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=18NHUcQS5N2Lj-d8peXvP95XirldiR1jV&sz=w1000", "achievements": "Role: All-rounder | Im good allrounder", "status": "Waiting" },
  { "name": "Ravindra Jainar", "sport": ["Cricket"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=13fZcFiVw1fgi0J8MumFviKEQsP8aRwoX&sz=w1000", "achievements": "Role: Batsman | RPL winner 2025", "status": "Waiting" },
  { "name": "Chinmay Patil", "sport": ["Cricket", "Volleyball", "Batminton"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1PuPOccs61yHajly_gyCbYjv2kpjK0Eeo&sz=w1000", "achievements": "Role: All-rounder | Secured 'RUNNERS UP' titles consecutively in cricket during 11th & 12th std in our pu college. Can bring balance to the team as an all rounder & I can contribute to win matches.", "status": "Waiting" },
  { "name": "Tanmay Hiremath", "sport": ["Cricket", "Batminton"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1npNYjZjmRw5Ox9YOUH9nDsvzy8D6-dFo&sz=w1000", "achievements": "Role: Bowler | Hello", "status": "Waiting" },
  { "name": "Anup Wadekar", "sport": ["Cricket", "Volleyball", "Tug of War"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1CHSUUSf8qPmsIwG-70akq8UXccq6wqAB&sz=w1000", "achievements": "Role: All-rounder | I am good player", "status": "Waiting" },
  { "name": "Maitri", "sport": ["Cricket", "Volleyball", "Tug of War"], "gender": "Female", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=17ozedLpjStRdMCj_shR6zw-9PyDGXn8g&sz=w1000", "achievements": "Role: All-rounder | University Blue in Cricket, runner up in volleyball .", "status": "Waiting" },
  { "name": "Farha Naaz Kundagol", "sport": ["Cricket", "Volleyball", "Batminton"], "gender": "Female", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1VSi_QRAP_aHyRiBzhMbStg7M0KHcVkoG&sz=w1000", "achievements": "Role: All-rounder | I have been choosen to play for the University.", "status": "Waiting" },
  { "name": "Fairoz", "sport": ["Cricket", "Volleyball"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1KTAxOlVc9FoprDe6aDbjblWCcl_aRQxB&sz=w1000", "achievements": "Role: Batsman | Im interested in cricket lot n i love to play cricket lott 🏏", "status": "Waiting" },
  { "name": "Malik Nadaf", "sport": ["Cricket"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1-Ts1CNHP1N-QzVRp6EISnM7G36-3ELT-&sz=w1000", "achievements": "Role: Batsman | I Had Been Selected in School Team in my TENVICS", "status": "Waiting" },
  { "name": "Bhoomika Hotagi", "sport": ["Cricket"], "gender": "Female", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1REn3e83emgm0g5cLQ6BjuV1gNepNhOKi&sz=w1000", "achievements": "Role: Batsman | Nil", "status": "Waiting" },
  { "name": "Harsh Kampli", "sport": ["Cricket", "Batminton", "Tug of War"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=14KAQ6dUdg0VSG9CL1qAGapm3lNI0vCvd&sz=w1000", "achievements": "Role: All-rounder | Badminton correct spelling got aiti. Have played Proffessional cricket ,don’t know about tennis ball cricket though.", "status": "Waiting" },
  { "name": "Ishwar Sarawad", "sport": ["Cricket", "Volleyball", "Batminton"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1lOwbTbCEMQ3_ap3L3o1iuTK3zUFv-aY5&sz=w1000", "achievements": "Role: Batsman | I am Ishwar", "status": "Waiting" },
  { "name": "Kartik p", "sport": ["Volleyball", "Batminton", "Tug of War"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1BjFXUh_XuPVzq2VFEL7rfW8P1-9XOIWV&sz=w1000", "achievements": "I have experienced Volleyball talluk level", "status": "Waiting" },
  { "name": "Varsha", "sport": ["Cricket", "Batminton", "Tug of War"], "gender": "Female", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1VYHNdWm4sE0r2wLFP2p6hnfg4nCZCQxg&sz=w1000", "achievements": "Role: All-rounder | Played for university in cricket", "status": "Waiting" },
  { "name": "Abhishek", "sport": ["Cricket", "Volleyball", "Tug of War"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1r_wet_i4W53gp6furlQ1kh_GVnsjDVE1&sz=w1000", "achievements": "Role: All-rounder | I am allrounder", "status": "Waiting" },
  { "name": "Vijay Kumar B", "sport": ["Cricket", "Volleyball", "Batminton", "Tug of War"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1UwBOp6XGLMrQ4lJYujf3K5uecNo-SV2I&sz=w1000", "achievements": "Role: All-rounder | I'm Good all rounder", "status": "Waiting" },
  { "name": "Chidanand Karennavar", "sport": ["Cricket", "Batminton"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1j88KscUzOs7nQFA3le4SjcO_XOHkSXJ5&sz=w1000", "achievements": "Role: Bowler | .....for mental/emotional support 😝", "status": "Waiting" },
  { "name": "Godwin Anthony", "sport": ["Cricket", "Volleyball", "Batminton"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1odyYgOdszhLbUXIL82tApIOJVf-qID4B&sz=w1000", "achievements": "Role: All-rounder | A player with good reflexes , since I used to play badminton a very long back..", "status": "Waiting" },
  { "name": "DARSHAN", "sport": ["Cricket", "Volleyball"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1aT6n1Wi8kGJY3UEEOTx8HddzGE0HoWqW&sz=w1000", "achievements": "Role: All-rounder | Being part of the team will help me stay in a strong and focused space for the interdepartment cricket matches.", "status": "Waiting" }
];

const defaultState = {
  players: HARDCODED_PLAYERS,
  teams: [
    { name: "Alpha", captain: "Shashank kurtakoti", viceCaptain: "Shrigovinda T Kulkarni", purse: 10000, players: [], maleCount: 0, femaleCount: 0 },
    { name: "Beta", captain: "Priya H", viceCaptain: "Maitri M", purse: 10000, players: [], maleCount: 0, femaleCount: 0 },
    { name: "Gamma", captain: "Aditya", viceCaptain: "Abhay Patil", purse: 10000, players: [], maleCount: 0, femaleCount: 0 }
  ],
  auctionState: { isLive: false, currentPlayerIndex: 0, currentBid: 0, leadingTeam: null, selectedTeamIndex: null, status: "Waiting" }
};

const defaultAuthConfig = {
  password: "Shrigovinda8618104226"
};

let localCacheState = defaultState;
let localAuthConfig = defaultAuthConfig;

// Helper to sanitize state (Firebase doesn't store empty arrays)
function normalizeState(s) {
    if (!s) return defaultState;
    if (!s.players) s.players = [];
    if (!s.teams) s.teams = [];
    s.teams.forEach(t => {
        if (!t.players) t.players = [];
        if (t.maleCount === undefined) t.maleCount = 0;
        if (t.femaleCount === undefined) t.femaleCount = 0;
    });
    if (!s.auctionState) s.auctionState = defaultState.auctionState;
    return s;
}

// Auction State Listener
onValue(ref(db, STATE_PATH), (snapshot) => {
    const data = snapshot.val();
    if (data) {
        localCacheState = normalizeState(data);
        window.dispatchEvent(new Event('stateUpdated'));
    } else {
        saveState(defaultState);
    }
});

// Intelligent Auth Config Sync (Handles both 'Config' and 'config' folders)
onValue(ref(db, 'rpl_auction'), (snapshot) => {
    const data = snapshot.val();
    if (data) {
        // Look for any key that is 'config' or 'Config'
        const configNode = data.config || data.Config;
        if (configNode && configNode.password) {
            localAuthConfig = configNode;
        } else if (!data.config && !data.Config) {
            // First run initialization if no config exists anywhere
            set(ref(db, CONFIG_PATH), defaultAuthConfig);
        }
    }
});

window.getState = () => localCacheState;
window.getAuthConfig = () => localAuthConfig;
window.saveState = (state) => {
    localCacheState = state;
    set(ref(db, STATE_PATH), state).catch(console.error);
};
window.resetState = () => window.saveState(defaultState);
