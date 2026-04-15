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
  matches: [
    // MATCH 1: ROBO vs TECH
    { sport: 'Badminton', stage: 'League', team1: 'ROBO KNIGHTS', team2: 'TECH TITANS 🤖', playerA: 'Akshay', playerB: 'Harsha', score: '12 - 15', winner: 'TECH', details: 'Boys Singles' },
    { sport: 'Badminton', stage: 'League', team1: 'ROBO KNIGHTS', team2: 'TECH TITANS 🤖', playerA: 'Varsha', playerB: 'Shrushti', score: '15 - 9', winner: 'ROBO', details: 'Girls Singles' },
    { sport: 'Badminton', stage: 'League', team1: 'ROBO KNIGHTS', team2: 'TECH TITANS 🤖', playerA: 'Shashank & Hitarth', playerB: 'Gaurav & Abhay', score: '15 - 13', winner: 'ROBO', details: 'Boys Doubles' },
    { sport: 'Badminton', stage: 'League', team1: 'ROBO KNIGHTS', team2: 'TECH TITANS 🤖', playerA: 'Varsha & Bhoomika', playerB: 'Lakshmi & Farah', score: '4 - 15', winner: 'TECH', details: 'Girls Doubles' },
    { sport: 'Badminton', stage: 'League', team1: 'ROBO KNIGHTS', team2: 'TECH TITANS 🤖', playerA: 'Shashank & Bhoomika', playerB: 'Gaurav & Shrushti', score: '14 - 16', winner: 'TECH', details: 'Mixed Doubles' },
    
    // MATCH 2: TECH vs FLASHING
    { sport: 'Badminton', stage: 'League', team1: 'TECH TITANS 🤖', team2: 'FLASHING BOTS 🤖', playerA: 'Harsh', playerB: 'Mallik', score: '15 - 13', winner: 'TECH', details: 'Boys Singles' },
    { sport: 'Badminton', stage: 'League', team1: 'TECH TITANS 🤖', team2: 'FLASHING BOTS 🤖', playerA: 'Ilaf', playerB: 'Farsha', score: '12 - 15', winner: 'FLASHING', details: 'Girls Singles' },
    { sport: 'Badminton', stage: 'League', team1: 'TECH TITANS 🤖', team2: 'FLASHING BOTS 🤖', playerA: 'Gaurav & Abhay', playerB: 'Chidanand & Anup', score: '15 - 5', winner: 'TECH', details: 'Boys Doubles' },
    { sport: 'Badminton', stage: 'League', team1: 'TECH TITANS 🤖', team2: 'FLASHING BOTS 🤖', playerA: 'Priyal & Ilaf', playerB: 'Shrushti & Lakshmi', score: '5 - 15', winner: 'FLASHING', details: 'Girls Doubles' },
    { sport: 'Badminton', stage: 'League', team1: 'TECH TITANS 🤖', team2: 'FLASHING BOTS 🤖', playerA: 'Gaurav & Farah', playerB: 'Priya & Mallik', score: '5 - 15', winner: 'FLASHING', details: 'Mixed Doubles' },

    // MATCH 3: FLASHING vs ROBO
    { sport: 'Badminton', stage: 'League', team1: 'FLASHING BOTS 🤖', team2: 'ROBO KNIGHTS', playerA: 'Akshay', playerB: 'Mallik', score: '8 - 15', winner: 'ROBO', details: 'Boys Singles' },
    { sport: 'Badminton', stage: 'League', team1: 'FLASHING BOTS 🤖', team2: 'ROBO KNIGHTS', playerA: 'Ilaf', playerB: 'Bhoomika', score: '15 - 5', winner: 'FLASHING', details: 'Girls Singles' },
    { sport: 'Badminton', stage: 'League', team1: 'FLASHING BOTS 🤖', team2: 'ROBO KNIGHTS', playerA: 'Chidanand & Anup', playerB: 'Godwin & Shashank', score: '9 - 15', winner: 'ROBO', details: 'Boys Doubles' },
    { sport: 'Badminton', stage: 'League', team1: 'FLASHING BOTS 🤖', team2: 'ROBO KNIGHTS', playerA: 'Priya & Ilaf', playerB: 'Bhoomika & Varsha', score: '15 - 3', winner: 'FLASHING', details: 'Girls Doubles' },
    { sport: 'Badminton', stage: 'League', team1: 'FLASHING BOTS 🤖', team2: 'ROBO KNIGHTS', playerA: 'Priya & Mallik', playerB: 'Shashank & Varsha', score: '15 - 11', winner: 'FLASHING', details: 'Mixed Doubles' },

    // SEMI FINAL: ROBO vs TECH
    { sport: 'Badminton', stage: 'Semi-Final', team1: 'ROBO KNIGHTS', team2: 'TECH TITANS 🤖', playerA: 'Akshay', playerB: 'Harsh', score: '15 - 3', winner: 'ROBO', details: 'Boys Singles' },
    { sport: 'Badminton', stage: 'Semi-Final', team1: 'ROBO KNIGHTS', team2: 'TECH TITANS 🤖', playerA: 'Varsha', playerB: 'Farah', score: '18 - 16', winner: 'ROBO', details: 'Girls Singles' },
    { sport: 'Badminton', stage: 'Semi-Final', team1: 'ROBO KNIGHTS', team2: 'TECH TITANS 🤖', playerA: 'Shashank & Hitarth', playerB: 'Abhay & Gaurav', score: '15 - 5', winner: 'ROBO', details: 'Boys Doubles' },

    // FINALS: ROBO vs FLASHING
    { sport: 'Badminton', stage: 'Final', team1: 'ROBO KNIGHTS', team2: 'FLASHING BOTS 🤖', playerA: 'Akshay', playerB: 'Chidanand', score: '15 - 13', winner: 'ROBO', details: 'Boys Singles' },
    { sport: 'Badminton', stage: 'Final', team1: 'ROBO KNIGHTS', team2: 'FLASHING BOTS 🤖', playerA: 'Varsha', playerB: 'Ilaf', score: '15 - 12', winner: 'ROBO', details: 'Girls Singles' },
    { sport: 'Badminton', stage: 'Final', team1: 'ROBO KNIGHTS', team2: 'FLASHING BOTS 🤖', playerA: 'Shashank & Hitarth', playerB: 'Mallik & Anup', score: '15 - 11', winner: 'ROBO', details: 'Boys Doubles' },

    // VOLLEYBALL LEAGUE
    { sport: 'Volleyball', stage: 'League', team1: 'ROBO KNIGHTS', team2: 'TECH TITANS 🤖', score: '8 - 15', winner: 'TECH', details: 'League Match' },
    { sport: 'Volleyball', stage: 'League', team1: 'TECH TITANS 🤖', team2: 'FLASHING BOTS 🤖', score: '15 - 8', winner: 'TECH', details: 'League Match' },

    // VOLLEYBALL PLAYOFFS
    { sport: 'Volleyball', stage: 'Semi-Final', team1: 'ROBO KNIGHTS', team2: 'FLASHING BOTS 🤖', score: '0 - 2 (11-15, 3-15)', winner: 'FLASHING', details: 'Semi-Final' },
    { sport: 'Volleyball', stage: 'Final', team1: 'FLASHING BOTS 🤖', team2: 'TECH TITANS 🤖', score: '1 - 2 (15-25, 25-24, 23-25)', winner: 'TECH', details: 'Grand Final' },

    // CRICKET MATCHES
    { 
      sport: 'Cricket', stage: 'League', team1: 'ROBO KNIGHTS', team2: 'TECH TITANS 🤖', 
      score: '91/3 (10.0) - 92/4 (8.5)', winner: 'TECH', details: 'League match 01',
      cricketData: {
        innings1: {
          score: 91, wickets: 3, overs: '10.0',
          batting: [
            { name: 'Vijay Kumar', runs: 11, balls: 9, fours: 0, sixes: 1, howOut: 'b Vicky' },
            { name: 'Shrigovinda K', runs: 26, balls: 19, fours: 3, sixes: 0, howOut: 'c & b Harsh' },
            { name: 'Akshay S', runs: 41, balls: 25, fours: 2, sixes: 4, howOut: 'c Vicky b Harsh' },
            { name: 'Ravindra', runs: 1, balls: 7, fours: 0, sixes: 0, howOut: 'not out' },
            { name: 'Shreyas K', runs: 0, balls: 2, fours: 0, sixes: 0, howOut: 'not out' }
          ],
          bowling: [
            { name: 'Chinmay', overs: '3.0', maidens: 0, runs: 9, wickets: 0 },
            { name: 'Vinayak', overs: '2.0', maidens: 0, runs: 16, wickets: 0 },
            { name: 'Vicky', overs: '2.0', maidens: 0, runs: 30, wickets: 1 },
            { name: 'Dakash', overs: '1.0', maidens: 0, runs: 17, wickets: 0 },
            { name: 'Harsh', overs: '2.0', maidens: 0, runs: 19, wickets: 2 }
          ]
        },
        innings2: {
          score: 92, wickets: 4, overs: '8.5',
          batting: [
            { name: 'Faroz', runs: 4, balls: 4, fours: 1, sixes: 0, howOut: 'c Ravindra b Tanmay H' },
            { name: 'Abhay', runs: 1, balls: 2, fours: 0, sixes: 0, howOut: 'c Shrigovinda K b Shrigovinda' },
            { name: 'Aditya', runs: 6, balls: 3, fours: 1, sixes: 0, howOut: 'b Shrigovinda' },
            { name: 'Chinmay', runs: 46, balls: 29, fours: 4, sixes: 2, howOut: 'not out' },
            { name: 'Dakash', runs: 12, balls: 11, fours: 2, sixes: 0, howOut: 'b Vijay Kumar' },
            { name: 'Vinayak', runs: 2, balls: 4, fours: 0, sixes: 0, howOut: 'not out' }
          ],
          bowling: [
            { name: 'Tanmay H', overs: '2.0', maidens: 0, runs: 23, wickets: 1 },
            { name: 'Shrigovinda', overs: '1.0', maidens: 0, runs: 7, wickets: 2 },
            { name: 'Shrigovinda K', overs: '1.0', maidens: 0, runs: 19, wickets: 0 },
            { name: 'Shreyas K', overs: '1.0', maidens: 0, runs: 14, wickets: 0 },
            { name: 'Vijay Kumar', overs: '2.0', maidens: 0, runs: 10, wickets: 1 },
            { name: 'Shrigovinda', overs: '1.0', maidens: 0, runs: 13, wickets: 0 }
          ]
        }
      }
    },
    { 
      sport: 'Cricket', stage: 'League', team1: 'FLASHING BOTS 🤖', team2: 'TECH TITANS 🤖', 
      score: '83/3 (8.0) - 85/2 (6.5)', winner: 'TECH', details: 'League match 02',
      cricketData: {
        innings1: {
          score: 83, wickets: 3, overs: '8.0',
          batting: [
            { name: 'Darshan', runs: 22, balls: 10, fours: 1, sixes: 2, howOut: 'c Nisar b Vinayak' },
            { name: 'Sushrut', runs: 0, balls: 1, fours: 0, sixes: 0, howOut: 'c Fairoz b Vinayak' },
            { name: 'Shiv', runs: 20, balls: 20, fours: 2, sixes: 0, howOut: 'not out' },
            { name: 'Aditya', runs: 14, balls: 8, fours: 1, sixes: 1, howOut: 'c Fairoz b Vinayak' },
            { name: 'Sudev', runs: 17, balls: 10, fours: 1, sixes: 1, howOut: 'not out' }
          ],
          bowling: [
            { name: 'Vinayak', overs: '3.0', maidens: 0, runs: 33, wickets: 2 },
            { name: 'Vinayak', overs: '2.0', maidens: 0, runs: 18, wickets: 0 },
            { name: 'Vicky', overs: '1.0', maidens: 0, runs: 17, wickets: 0 },
            { name: 'Vinayak', overs: '2.0', maidens: 0, runs: 15, wickets: 1 }
          ]
        },
        innings2: {
          score: 85, wickets: 2, overs: '6.5',
          batting: [
            { name: 'Fairoz', runs: 54, balls: 26, fours: 5, sixes: 4, howOut: 'not out' },
            { name: 'Abhay', runs: 14, balls: 8, fours: 1, sixes: 1, howOut: 'c Darshan b Aditya' },
            { name: 'Aditya', runs: 1, balls: 2, fours: 0, sixes: 0, howOut: 'c Anup b Aditya' },
            { name: 'Nisar', runs: 3, balls: 5, fours: 0, sixes: 0, howOut: 'not out' }
          ],
          bowling: [
            { name: 'Shiv', overs: '2.0', maidens: 0, runs: 22, wickets: 0 },
            { name: 'Darshan', overs: '1.5', maidens: 0, runs: 32, wickets: 0 },
            { name: 'Aditya', overs: '2.0', maidens: 0, runs: 13, wickets: 2 },
            { name: 'Sudev', overs: '1.0', maidens: 0, runs: 18, wickets: 0 }
          ]
        }
      }
    },
    { 
      sport: 'Cricket', stage: 'Semi-Final', team1: 'ROBO KNIGHTS', team2: 'FLASHING BOTS 🤖', 
      score: '71/10 (9.2) - 75/4 (5.7)', winner: 'FLASHING', details: 'Semi-Finals',
      cricketData: {
        innings1: {
          score: 71, wickets: 10, overs: '9.2',
          batting: [
            { name: 'Akshay', runs: 8, balls: 8, fours: 1, sixes: 0, howOut: 'c Darshan b Aditya' },
            { name: 'Vijay Kumar', runs: 12, balls: 9, fours: 1, sixes: 0, howOut: 'c Sushrut b Aditya' },
            { name: 'Shrigovinda', runs: 14, balls: 5, fours: 2, sixes: 1, howOut: 'c Aditya b Shiv' },
            { name: 'Ravindra', runs: 6, balls: 4, fours: 1, sixes: 0, howOut: 'c & b Aditya' },
            { name: 'Shashank', runs: 7, balls: 9, fours: 1, sixes: 0, howOut: 'c Shiv b Anup' },
            { name: 'Shreyas', runs: 0, balls: 2, fours: 0, sixes: 0, howOut: 'b Aditya' },
            { name: 'Prajwal', runs: 0, balls: 2, fours: 0, sixes: 0, howOut: 'st Abhishek D b Aditya' },
            { name: 'Navdeep', runs: 5, balls: 7, fours: 0, sixes: 0, howOut: 'c & b Anup' },
            { name: 'Rohit P', runs: 3, balls: 4, fours: 0, sixes: 0, howOut: 'not out' },
            { name: 'Tanmay', runs: 0, balls: 4, fours: 0, sixes: 0, howOut: 'c Mallik b Shiv' },
            { name: 'Nagraj', runs: 0, balls: 2, fours: 0, sixes: 0, howOut: 'b Aditya' }
          ],
          bowling: [
            { name: 'Shiv', overs: '3.0', maidens: 0, runs: 19, wickets: 2 },
            { name: 'Aditya', overs: '2.2', maidens: 0, runs: 29, wickets: 3 },
            { name: 'Aditya', overs: '2.0', maidens: 0, runs: 8, wickets: 3 },
            { name: 'Sudev', overs: '1.0', maidens: 0, runs: 7, wickets: 0 },
            { name: 'Anup', overs: '1.0', maidens: 0, runs: 7, wickets: 2 }
          ]
        },
        innings2: {
          score: 75, wickets: 4, overs: '5.7',
          batting: [
            { name: 'Darshan', runs: 40, balls: 13, fours: 4, sixes: 3, howOut: 'b Akshay' },
            { name: 'Sushrut', runs: 6, balls: 12, fours: 1, sixes: 0, howOut: 'c Vijay Kumar b Akshay' },
            { name: 'Sudev', runs: 6, balls: 7, fours: 1, sixes: 0, howOut: 'c Vijay Kumar b Akshay' },
            { name: 'Vinayak B', runs: 0, balls: 1, fours: 0, sixes: 0, howOut: 'b Vijay Kumar' },
            { name: 'Shiv', runs: 6, balls: 3, fours: 1, sixes: 0, howOut: 'not out' },
            { name: 'Aditya', runs: 1, balls: 1, fours: 0, sixes: 0, howOut: 'not out' }
          ],
          bowling: [
            { name: 'Tanmay', overs: '1.0', maidens: 0, runs: 17, wickets: 0 },
            { name: 'Nagraj', overs: '1.0', maidens: 0, runs: 30, wickets: 0 },
            { name: 'Vijay Kumar', overs: '2.0', maidens: 0, runs: 7, wickets: 1 },
            { name: 'Akshay', overs: '1.4', maidens: 0, runs: 21, wickets: 3 }
          ]
        }
      }
    },
    { 
      sport: 'Cricket', stage: 'Final', team1: 'FLASHING BOTS 🤖', team2: 'TECH TITANS 🤖', 
      score: '104/6 (10.0) - 108/5 (9.4)', winner: 'TECH', details: 'Finals',
      cricketData: {
        innings1: {
          score: 104, wickets: 6, overs: '10.0',
          batting: [
            { name: 'Darshan', runs: 21, balls: 16, fours: 2, sixes: 1, howOut: 'b Vinayak' },
            { name: 'Shiv', runs: 10, balls: 4, fours: 2, sixes: 0, howOut: 'b Vinayak' },
            { name: 'Aditya', runs: 25, balls: 19, fours: 2, sixes: 1, howOut: 'b Vicky' },
            { name: 'Sushrut', runs: 14, balls: 11, fours: 1, sixes: 0, howOut: 'b Vinayak' },
            { name: 'Sudev', runs: 4, balls: 3, fours: 1, sixes: 0, howOut: 'b Vicky' },
            { name: 'Abhishek D', runs: 10, balls: 6, fours: 1, sixes: 0, howOut: 'not out' },
            { name: 'Aditya', runs: 4, balls: 4, fours: 0, sixes: 0, howOut: 'b Vicky' },
            { name: 'Anup', runs: 0, balls: 0, fours: 0, sixes: 0, howOut: 'not out' }
          ],
          bowling: [
            { name: 'Vinayak', overs: '1.0', maidens: 0, runs: 16, wickets: 1 },
            { name: 'Vinayak', overs: '3.0', maidens: 0, runs: 25, wickets: 1 },
            { name: 'Vicky', overs: '2.0', maidens: 0, runs: 23, wickets: 2 },
            { name: 'Vinayak', overs: '1.0', maidens: 0, runs: 9, wickets: 1 },
            { name: 'Vicky', overs: '2.0', maidens: 0, runs: 23, wickets: 1 },
            { name: 'Harsh', overs: '1.0', maidens: 0, runs: 8, wickets: 0 }
          ]
        },
        innings2: {
          score: 108, wickets: 5, overs: '9.4',
          batting: [
            { name: 'Abhay', runs: 18, balls: 12, fours: 2, sixes: 0, howOut: 'b Aditya' },
            { name: 'Fairoz', runs: 26, balls: 15, fours: 4, sixes: 0, howOut: 'b Aditya' },
            { name: 'Chinmay', runs: 34, balls: 16, fours: 3, sixes: 2, howOut: 'not out' },
            { name: 'Daksh', runs: 4, balls: 6, fours: 0, sixes: 0, howOut: 'b Aditya' },
            { name: 'Aditya', runs: 13, balls: 6, fours: 2, sixes: 0, howOut: 'b Shiv' },
            { name: 'Vinayak', runs: 4, balls: 2, fours: 1, sixes: 0, howOut: 'b Shiv' },
            { name: 'Nisar', runs: 0, balls: 1, fours: 0, sixes: 0, howOut: 'not out' }
          ],
          bowling: [
            { name: 'Shiv', overs: '3.0', maidens: 0, runs: 32, wickets: 2 },
            { name: 'Aditya', overs: '3.0', maidens: 0, runs: 31, wickets: 2 },
            { name: 'Aditya', overs: '1.0', maidens: 0, runs: 4, wickets: 1 },
            { name: 'Sudev', overs: '2.0', maidens: 0, runs: 24, wickets: 0 },
            { name: 'Shivkumar', overs: '0.3', maidens: 0, runs: 17, wickets: 0 }
          ]
        }
      }
    }
  ],
  tournamentRankings: {
      "Cricket": { "1st": "TECH TITANS 🤖", "2nd": "FLASHING BOTS 🤖", "3rd": "ROBO KNIGHTS" },
      "Badminton": { "1st": "ROBO KNIGHTS", "2nd": "FLASHING BOTS 🤖", "3rd": "TECH TITANS 🤖" },
      "Volleyball": { "1st": "TECH TITANS 🤖", "2nd": "FLASHING BOTS 🤖", "3rd": "ROBO KNIGHTS" },
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
    if (!s.matches) s.matches = [];

    // DATA CLEANUP: Explicitly remove Girls Doubles from Semi-Final as requested
    s.matches = s.matches.filter(m => {
        const stage = (m.stage || "").toUpperCase();
        const details = (m.details || "").toUpperCase();
        return !(stage.includes('SEMI') && details.includes('GIRLS DOUBLES'));
    });

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
