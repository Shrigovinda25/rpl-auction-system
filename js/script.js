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
  // --- FEMALES ---
  { "name": "Minal Dhamnekar", "sport": ["Cricket", "Tug of War"], "gender": "Female", "basePrice": 100, "image": null, "achievements": "Role: Bowler | ..", "status": "Waiting" },
  { "name": "Srushti G Joshi", "sport": ["Batminton", "Tug of War"], "gender": "Female", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=10sEOo76qbgMDsvggJpPiSe9ksDwR9beu&sz=w1000", "achievements": "None", "status": "Waiting" },
  { "name": "Bhoomika Hotagi", "sport": ["Cricket"], "gender": "Female", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1REn3e83emgm0g5cLQ6BjuV1gNepNhOKi&sz=w1000", "achievements": "Role: Batsman | Nil", "status": "Waiting" },
  { "name": "Maitri", "sport": ["Cricket", "Volleyball", "Tug of War"], "gender": "Female", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=17ozedLpjStRdMCj_shR6zw-9PyDGXn8g&sz=w1000", "achievements": "Role: All-rounder | University in Cricket, runner up in volleyball .", "status": "Waiting" },
  { "name": "Farha Naaz Kundagol", "sport": ["Cricket", "Volleyball", "Batminton"], "gender": "Female", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1VSi_QRAP_aHyRiBzhMbStg7M0KHcVkoG&sz=w1000", "achievements": "Role: All-rounder | I have been choosen to play for the University.", "status": "Waiting" },
  { "name": "Varsha", "sport": ["Cricket", "Batminton", "Tug of War"], "gender": "Female", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1VYHNdWm4sE0r2wLFP2p6hnfg4nCZCQxg&sz=w1000", "achievements": "Role: All-rounder | Played for university in cricket", "status": "Waiting" },
  { "name": "Abhinaya S", "sport": ["Batminton"], "gender": "Female", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1znp_mrxF-c6ZeIol96fF8ykJKH0FMUK_&sz=w1000", "achievements": "no achievements", "status": "Waiting" },
  { "name": "Raksha B", "sport": ["Cricket"], "gender": "Female", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=11iF98D-KgZNOE0jdoFgt74-zE_ESwLx2&sz=w1000", "achievements": "Role: All-rounder | I m interested in playing the game and I have quite experience with the game", "status": "Waiting" },
  { "name": "Ilaf Z H", "sport": ["Cricket", "Batminton"], "gender": "Female", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1QOCshbgVbKThIA5UQg6DccIc6hwbLW2R&sz=w1000", "achievements": "Role: All-rounder | I have won several competitions n backed many prices n also i particpate in every game", "status": "Waiting" },
  { "name": "T Sanjana", "sport": ["Cricket", "Tug of War"], "gender": "Female", "basePrice": 100, "image": null, "achievements": "Role: Batsman | District level player", "status": "Waiting" },
  { "name": "Lakshmi Saunshi", "sport": ["Batminton"], "gender": "Female", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1E3Hx9xCMaQ9MqJUmCpUNCpA1ivQUIeMD&sz=w1000", "achievements": "District level football player", "status": "Waiting" },

  // --- MALES ---
  { "name": "Navdeep patil", "sport": ["Cricket", "Volleyball"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1MaQDht_trzhXXFIQdPCF3GlorBUjHVUx&sz=w1000", "achievements": "Role: Batsman | I always give my 100% on field", "status": "Waiting" },
  { "name": "Daksh Tiwari", "sport": ["Cricket", "Tug of War"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1uQObdEbKC-aYgAHqKVYT3V_bRKcnVA9v&sz=w1000", "achievements": "Role: Bowler | Been to a cricket coaching as a bowler", "status": "Waiting" },
  { "name": "Hitarth Panchal", "sport": ["Cricket", "Volleyball", "Batminton", "Tug of War"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1KKwW_NgJZxxqgu5V5Mq5_5xCbrWhEuJi&sz=w1000", "achievements": "Role: All-rounder | Since School days I'm playing all the above sports and also was a Inter School player", "status": "Waiting" },
  { "name": "VINAYAK S NAREGAL", "sport": ["Cricket", "Volleyball"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=18NHUcQS5N2Lj-d8peXvP95XirldiR1jV&sz=w1000", "achievements": "Role: All-rounder | Im good allrounder", "status": "Waiting" },
  { "name": "Ravindra Jainar", "sport": ["Cricket"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=13fZcFiVw1fgi0J8MumFviKEQsP8aRwoX&sz=w1000", "achievements": "Role: Batsman | RPL winner 2025", "status": "Waiting" },
  { "name": "Chinmay Patil", "sport": ["Cricket", "Volleyball", "Batminton"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1PuPOccs61yHajly_gyCbYjv2kpjK0Eeo&sz=w1000", "achievements": "Role: All-rounder | Secured 'RUNNERS UP' titles consecutively in cricket during 11th & 12th std in our pu college. Can bring balance to the team as an all rounder & I can contribute to win matches.", "status": "Waiting" },
  { "name": "Vijay Kumar B", "sport": ["Cricket", "Volleyball"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1UwBOp6XGLMrQ4lJYujf3K5uecNo-SV2I&sz=w1000", "achievements": "Role: All-rounder | I'm Good all rounder", "status": "Waiting" },
  { "name": "Tanmay Hiremath", "sport": ["Cricket", "Batminton"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1npNYjZjmRw5Ox9YOUH9nDsvzy8D6-dFo&sz=w1000", "achievements": "Role: Bowler | Hello", "status": "Waiting" },
  { "name": "Anup Wadekar", "sport": ["Cricket", "Volleyball", "Tug of War"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1CHSUUSf8qPmsIwG-70akq8UXccq6wqAB&sz=w1000", "achievements": "Role: All-rounder | I am good player", "status": "Waiting" },
  { "name": "Fairoz", "sport": ["Cricket", "Volleyball"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1KTAxOlVc9FoprDe6aDbjblWCcl_aRQxB&sz=w1000", "achievements": "Role: Batsman | Im interested in cricket lot n i love to play cricket lott 🏏", "status": "Waiting" },
  { "name": "Malik Nadaf", "sport": ["Cricket"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1-Ts1CNHP1N-QzVRp6EISnM7G36-3ELT-&sz=w1000", "achievements": "Role: Batsman | I Had Been Selected in School Team in my TENVICS", "status": "Waiting" },
  { "name": "Harsh Kampli", "sport": ["Cricket", "Batminton", "Tug of War"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=14KAQ6dUdg0VSG9CL1qAGapm3lNI0vCvd&sz=w1000", "achievements": "Role: All-rounder | Badminton correct spelling got aiti. Have played Proffessional cricket ,don’t know about tennis ball cricket though.", "status": "Waiting" },
  { "name": "Ishwar Sarawad", "sport": ["Cricket", "Volleyball", "Batminton"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1lOwbTbCEMQ3_ap3L3o1iuTK3zUFv-aY5&sz=w1000", "achievements": "Role: Batsman | I am Ishwar", "status": "Waiting" },
  { "name": "Kartik p", "sport": ["Volleyball", "Batminton", "Tug of War"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1BjFXUh_XuPVzq2VFEL7rfW8P1-9XOIWV&sz=w1000", "achievements": "I have experienced Volleyball talluk level", "status": "Waiting" },
  { "name": "Abhishek", "sport": ["Cricket", "Volleyball", "Tug of War"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1r_wet_i4W53gp6furlQ1kh_GVnsjDVE1&sz=w1000", "achievements": "Role: All-rounder | I am allrounder", "status": "Waiting" },
  { "name": "Chidanand Karennavar", "sport": ["Cricket", "Batminton"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1j88KscUzOs7nQFA3le4SjcO_XOHkSXJ5&sz=w1000", "achievements": "Role: Bowler | .....for mental/emotional support 😝", "status": "Waiting" },
  { "name": "Godwin Anthony", "sport": ["Cricket", "Volleyball", "Batminton"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1odyYgOdszhLbUXIL82tApIOJVf-qID4B&sz=w1000", "achievements": "Role: All-rounder | A player with good reflexes , since I used to play badminton a very long back..", "status": "Waiting" },
  { "name": "DARSHAN", "sport": ["Cricket", "Volleyball", "Batminton", "Tug of War"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1aT6n1Wi8kGJY3UEEOTx8HddzGE0HoWqW&sz=w1000", "achievements": "Role: All-rounder | Being part of the team will help me stay in a strong and focused space for the interdepartment cricket matches.", "status": "Waiting" },
  { "name": "Sumanth", "sport": ["Cricket"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1CKPb06m3mGZnrjddWnFDefp7Nl652Gv2&sz=w1000", "achievements": "Role: Batsman | Im good batsmen", "status": "Waiting" },
  { "name": "Bharat", "sport": ["Cricket", "Volleyball", "Batminton"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1GuE9obcpBsR5oEUjRmVwkJVMLkO0_ckP&sz=w1000", "achievements": "Just wanted to play", "status": "Waiting" },
  { "name": "G ROHIT", "sport": ["Cricket", "Tug of War"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1oKHULOW6CnnWQAUnQgd1MiBPS87F559Z&sz=w1000", "achievements": "Role: All-rounder | I am good player", "status": "Waiting" },
  { "name": "Abhishek", "sport": ["Cricket", "Tug of War"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1kU0PUGrEJZCcQiwt_vCP9KkbsbcY2r3C&sz=w1000", "achievements": "Role: Bowler | Good fielder", "status": "Waiting" },
  { "name": "Sujal kamble", "sport": ["Volleyball", "Batminton"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1rVn4caT5CrqSRgjF-ErUh90lqlzeWkes&sz=w1000", "achievements": "Ntg", "status": "Waiting" },
  { "name": "Shlok", "sport": ["Cricket", "Volleyball", "Batminton"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=15FPTm8AKwQtsu22WZ-Zw6efACuUtK73-&sz=w1000", "achievements": "Role: All-rounder | Substitution, Why not?", "status": "Waiting" },
  { "name": "Abidali Mujawar", "sport": ["Cricket", "Volleyball", "Tug of War"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1cj_w6ET6McWW7pb-s9ze0y0Brzxd3tK-&sz=w1000", "achievements": "Role: Batsman | I Played volleyball, cricket tournament.", "status": "Waiting" },
  { "name": "Tabrez", "sport": ["Cricket", "Volleyball"], "gender": "Male", "basePrice": 100, "image": null, "achievements": "Role: All-rounder | Playing since childhood", "status": "Waiting" },
  { "name": "Vijay chipati", "sport": ["Cricket", "Tug of War"], "gender": "Male", "basePrice": 100, "image": null, "achievements": "Role: All-rounder | Xxx", "status": "Waiting" },
  { "name": "Shrigovinda T Kulkarni", "sport": ["Cricket", "Batminton"], "gender": "Male", "basePrice": 100, "image": "https://i.ibb.co/r29v6Cwy/Cropped-Image-1.png", "achievements": "Role: Bowling All-rounder | Bowling runs in my veins", "status": "Waiting" },
  { "name": "Prajwal S M", "sport": ["Cricket", "Volleyball", "Batminton"], "gender": "Male", "basePrice": 100, "image": null, "achievements": "Role: Batsman | I can play both cricket and badminton.", "status": "Waiting" },
  { "name": "Vicky Reddy", "sport": ["Cricket", "Volleyball", "Tug of War"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1J4RY2HSve77lPeW_gaCLbVdXWaSzK3CM&sz=w1000", "achievements": "Role: All-rounder | Just bid on me", "status": "Waiting" },
  { "name": "Shivakumar N", "sport": ["Cricket", "Volleyball"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1p6T_iWJ85KmgGBgmR0c-bPKL2lGe5uqv&sz=w1000", "achievements": "Role: All-rounder | Highest Wicket taker Of season in my first RPL. Leading run Scorer and wicket taker of my team in my second season", "status": "Waiting" },
  { "name": "Sumant Khannur", "sport": ["Cricket", "Tug of War"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=15DC-UndArAX-gWTBua3uW5Q7DqPsR55Z&sz=w1000", "achievements": "Role: All-rounder | You'll get to know on the pitch", "status": "Waiting" },
  { "name": "SUSHRUT", "sport": ["Cricket", "Volleyball", "Batminton", "Tug of War"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1s3zUyFR0yfkhRrbrB6eosZHxOwx4XrrS&sz=w1000", "achievements": "Role: Batsman | 2 Times RPL Runner Ups", "status": "Waiting" },
  { "name": "Shreyas kajagar", "sport": ["Cricket"], "gender": "Male", "basePrice": 100, "image": "https://drive.google.com/thumbnail?id=1ee4Xn05jLm4wLrgfHD1m4N5WAVzniX37&sz=w1000", "achievements": "Role: All-rounder | *************", "status": "Waiting" }
];

const defaultState = {
  players: HARDCODED_PLAYERS,
  teams: [
    { name: "ROBO KNIGHTS", captain: "Akshay Sandur", viceCaptain: "Shashank Kurtakoti", purse: 10000, players: [], maleCount: 0, femaleCount: 0, logo: "assets/logos/robo_knights.jpeg" },
    { name: "FLASHING BOTS 🤖", captain: "Priya Hunswadkar", viceCaptain: "Ayush Marigoudar", purse: 10000, players: [], maleCount: 0, femaleCount: 0, logo: "assets/logos/flashing_bots.jpeg" },
    { name: "TECH TITANS 🤖", captain: "Aditya B", viceCaptain: "Abhay Patil", purse: 10000, players: [], maleCount: 0, femaleCount: 0, logo: "assets/logos/tech_titans.jpeg" }
  ],
  auctionState: { isLive: false, currentPlayerIndex: 0, currentBid: 0, leadingTeam: null, selectedTeamIndex: null, status: "Waiting" },
  matches: [],
  tournamentRankings: {
      "Cricket": { "1st": null, "2nd": null, "3rd": null },
      "Badminton": { "1st": null, "2nd": null, "3rd": null },
      "Volleyball": { "1st": null, "2nd": null, "3rd": null },
      "Tug of War": { "1st": null, "2nd": null, "3rd": null }
  }
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
        // Ensure logos are preserved even if firebase state doesn't have them
        // Foolproof logo preservation
        const upperName = t.name.toUpperCase();
        if (upperName.includes("ROBO")) {
            t.logo = "assets/logos/robo_knights.jpeg";
        } else if (upperName.includes("FLASHING")) {
            t.logo = "assets/logos/flashing_bots.jpeg";
        } else if (upperName.includes("TECH")) {
            t.logo = "assets/logos/tech_titans.jpeg";
        }
    });
    if (!s.auctionState) s.auctionState = defaultState.auctionState;
    if (!s.matches) s.matches = [];
    if (!s.tournamentRankings) s.tournamentRankings = defaultState.tournamentRankings;
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
window.saveStateSilent = (state) => {
    // Just a wrapper to keep paths consistent
    set(ref(db, STATE_PATH), state).catch(console.error);
};
window.resetState = () => window.saveState(defaultState);
