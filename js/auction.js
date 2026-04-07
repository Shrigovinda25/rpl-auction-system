document.addEventListener('DOMContentLoaded', () => {
    // Initial Render
    renderAuctionUI();

    // Listen for cross-tab state updates
    window.addEventListener('stateUpdated', renderAuctionUI);
});

let lastPlayerIdx = -1;
let lastStatus = null;

function renderAuctionUI() {
    const s = getState();

    // Connection Status
    const connEl = document.getElementById('connection-status');
    if (s.auctionState.isLive) {
        connEl.innerHTML = `<span class="h-4 w-4 rounded-full bg-emerald-500 animate-pulse mr-2"></span> <span class="text-emerald-400 text-lg">LIVE</span>`;
    } else {
        connEl.innerHTML = `<span class="h-4 w-4 rounded-full bg-red-500 mr-2"></span> <span class="text-red-400 text-lg">OFFLINE</span>`;
    }

    // Main Spotlight Area
    const playerSpotlightEl = document.getElementById('player-spotlight');
    const noLivePlayerEl = document.getElementById('no-live-player');

    if (!s.auctionState.isLive) {
        playerSpotlightEl.classList.add('hidden');
        noLivePlayerEl.classList.remove('hidden');
    } else {
        const activePlayer = s.players[s.auctionState.currentPlayerIndex];

        if (!activePlayer) {
            playerSpotlightEl.classList.add('hidden');
            noLivePlayerEl.classList.remove('hidden');
            noLivePlayerEl.innerHTML = `<h2 class="text-3xl font-bold text-gray-400">Auction Concluded</h2>`;
        } else {
            playerSpotlightEl.classList.remove('hidden');
            noLivePlayerEl.classList.add('hidden');

            const imgUrl = (activePlayer.image && activePlayer.image.trim() !== '') ? activePlayer.image.trim() : `https://ui-avatars.com/api/?name=${encodeURIComponent(activePlayer.name)}&background=random&size=400`;
            document.getElementById('disp-img').src = imgUrl;
            document.getElementById('disp-name').textContent = activePlayer.name;

            // Multi-sport: render each sport as a pill badge
            const sports = Array.isArray(activePlayer.sport) ? activePlayer.sport : [activePlayer.sport];
            document.getElementById('disp-sport').innerHTML = sports
                .map(s => `<span class="bg-purple-600/80 text-white px-3 py-1 rounded shadow text-base font-semibold tracking-wider font-mono uppercase backdrop-blur-sm mr-1">${s}</span>`)
                .join('');

            document.getElementById('disp-gender').innerHTML = activePlayer.gender === 'Male' ? `<i class="fas fa-mars text-blue-300"></i> Male` : `<i class="fas fa-venus text-pink-300"></i> Female`;
            document.getElementById('disp-achievements').textContent = activePlayer.achievements;
            document.getElementById('disp-base').innerHTML = `${activePlayer.basePrice} <span class="text-blue-400 text-2xl">RC</span>`;

            // Status Overlay & Side Panel Logic
            const overlay = document.getElementById('status-overlay');
            const bidStatusCard = document.getElementById('bid-status-card');
            const bidBgAnim = document.getElementById('bid-bg-anim');
            const bidHeadline = document.getElementById('bid-headline');
            const bidLabel = document.getElementById('bid-label');
            const bidPriceCtn = document.getElementById('bid-price-ctn');
            const bidPrice = document.getElementById('bid-price');

            // Determine if player has changed to trigger some entry anim
            if (lastPlayerIdx !== s.auctionState.currentPlayerIndex) {
                // Trigger subtle flash / re-render animation
                playerSpotlightEl.classList.remove('animate-fade-in');
                void playerSpotlightEl.offsetWidth; // trigger reflow
                playerSpotlightEl.classList.add('animate-fade-in');
            }

            if (activePlayer.status === "Waiting") {
                overlay.innerHTML = `<span class="bg-blue-600 border-2 border-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.6)] px-4 py-2 rounded-full text-xl font-bold uppercase tracking-wider backdrop-blur-sm">Accepting Bids</span>`;

                if (s.auctionState.selectedTeamIndex !== null && s.auctionState.selectedTeamIndex !== undefined) {
                    const logoSrc = s.teams[s.auctionState.selectedTeamIndex]?.logo;
                    bidCardColors(bidBgAnim, 'bg-blue-600');
                    bidLabel.innerHTML = `
                        <div class="flex items-center justify-center gap-2 mb-1">
                            ${logoSrc ? `<img src="${logoSrc}" class="w-12 h-12 rounded-full border border-white/30 object-cover">` : ''}
                            <span>${s.auctionState.leadingTeam || "Current Bid"}</span>
                        </div>
                    `;
                    bidHeadline.textContent = "BID NOW!";
                    bidHeadline.className = "text-4xl md:text-5xl font-black mb-4 uppercase drop-shadow-lg text-blue-300 animate-pulse";
                    
                    bidPriceCtn.classList.remove('hidden');
                    bidPrice.textContent = `${s.auctionState.currentBid} RC`;
                    bidPrice.className = "text-6xl text-blue-400 font-mono font-bold drop-shadow-xl";
                } else {
                    bidCardColors(bidBgAnim, 'bg-gray-700');
                    bidLabel.textContent = "Current Status";
                    bidHeadline.textContent = "WAITING FOR BID";
                    bidHeadline.className = "text-4xl md:text-5xl font-black mb-4 uppercase drop-shadow-lg text-gray-400";
                    bidPriceCtn.classList.add('hidden');
                }
            }
            else if (activePlayer.status === "Selected") {
                overlay.innerHTML = `<div class="transform -rotate-12 bg-emerald-600 border-4 border-white text-white shadow-[0_0_40px_rgba(16,185,129,0.9)] px-6 py-3 font-black text-2xl md:text-3xl uppercase tracking-widest text-center whitespace-nowrap rounded-sm backdrop-blur-sm"><i class="fas fa-check-circle mr-2"></i> SELECTED BY<br/><span class="text-emerald-100">${activePlayer.soldTo}</span></div>`;

                bidCardColors(bidBgAnim, 'bg-emerald-600');
                bidLabel.textContent = "Acquired By";
                bidHeadline.textContent = activePlayer.soldTo || "Unknown Team";
                bidHeadline.className = "text-4xl md:text-5xl font-black mb-4 uppercase drop-shadow-lg text-emerald-300";

                bidPriceCtn.classList.remove('hidden');
                bidPrice.textContent = `${activePlayer.soldPrice} RC`;
                bidPrice.classList.remove('text-red-400');
                bidPrice.classList.add('text-emerald-400');

                // Trigger confetti exactly once when newly sold
                if (lastStatus !== "Selected" || lastPlayerIdx !== s.auctionState.currentPlayerIndex) {
                    throwConfetti();
                }
            }
            else if (activePlayer.status === "Not Selected") {
                overlay.innerHTML = `<div class="transform -rotate-12 bg-red-600 border-4 border-white text-white shadow-[0_0_40px_rgba(220,38,38,0.9)] px-8 py-3 font-black text-3xl md:text-4xl uppercase tracking-widest text-center whitespace-nowrap rounded-sm backdrop-blur-sm">NOT SELECTED</div>`;

                bidCardColors(bidBgAnim, 'bg-red-600');
                bidLabel.textContent = "Auction Result";
                bidHeadline.textContent = "PLAYER NOT SELECTED";
                bidHeadline.className = "text-4xl md:text-5xl font-black mb-4 uppercase drop-shadow-lg text-red-400";
                bidPriceCtn.classList.add('hidden');
            }

            lastPlayerIdx = s.auctionState.currentPlayerIndex;
            lastStatus = activePlayer.status;
        }
    }

    // Populate Side Stats
    document.getElementById('stat-total-players').textContent = s.players.length;
    document.getElementById('stat-unsold').textContent = s.players.filter(p => p.status === "Not Selected").length;

    // Populate Team Grids at the bottom
    const tg = document.getElementById('auction-teams-grid');
    tg.innerHTML = '';
    s.teams.forEach((t, i) => {
        tg.innerHTML += `
            <div class="bg-gray-800 rounded-xl p-4 border-l-4 border-emerald-500 relative overflow-hidden cursor-pointer hover:bg-gray-700 transition-all hover:scale-[1.03] active:scale-95 group shadow-lg" onclick="showTeamSquad(${i})">
                <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <i class="fas fa-search-plus text-gray-500 text-xs"></i>
                </div>
                <div class="flex items-center gap-3 mb-2">
                    ${t.logo ? `<img src="${t.logo}" class="w-16 h-16 rounded-xl border border-white/10 object-cover shadow-md bg-white/5">` : `<div class="w-16 h-16 rounded-xl bg-emerald-500/20 flex items-center justify-center font-black text-emerald-400 border border-emerald-500/20 text-xl">${t.name.charAt(0)}</div>`}
                    <h4 class="font-bold text-lg text-gray-200 truncate">${t.name}</h4>
                </div>
                <p class="text-3xl font-mono font-black text-emerald-400 drop-shadow-md my-1">${t.purse} <span class="text-sm text-gray-400 uppercase">RC</span></p>
                <div class="flex justify-between text-[10px] text-gray-400 bg-gray-900/50 rounded-lg p-2 mt-2 border border-white/5">
                    <span title="Total Squad"><i class="fas fa-users mr-1"></i>${(t.players || []).length}</span>
                    <span title="Males" class="text-blue-400/80"><i class="fas fa-mars mr-1"></i>${t.maleCount || 0}</span>
                    <span title="Females" class="text-pink-400/80"><i class="fas fa-venus mr-1"></i>${t.femaleCount || 0}</span>
                </div>
            </div>
        `;
    });
}

function bidCardColors(elem, colorClass) {
    elem.classList.remove('bg-blue-600', 'bg-emerald-600', 'bg-red-600');
    elem.classList.add(colorClass);
}

function throwConfetti() {
    if (typeof confetti !== 'undefined') {
        const duration = 2 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({
                ...defaults, particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                ...defaults, particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 250);
    }
}

/**
 * Show Detailed Team Squad Modal
 */
window.showTeamSquad = function(index) {
    const s = getState();
    const t = s.teams[index];
    if (!t) return;

    const modal = document.getElementById('team-modal');
    const playerList = document.getElementById('modal-player-list');
    
    // Header Info
    const iconEl = document.getElementById('modal-team-icon');
    if (t.logo) {
        iconEl.innerHTML = `<img src="${t.logo}" class="w-full h-full object-cover rounded-xl">`;
        iconEl.className = "w-32 h-32 rounded-xl bg-white/10 p-1 shadow-2xl border border-white/20 overflow-hidden";
    } else {
        iconEl.textContent = t.name.charAt(0).toUpperCase();
        iconEl.className = "w-32 h-32 rounded-xl bg-blue-600 flex items-center justify-center text-6xl font-black italic shadow-xl";
    }
    document.getElementById('modal-team-name').textContent = t.name;
    document.getElementById('modal-captain').querySelector('span').textContent = t.captain || 'TBD';
    document.getElementById('modal-vice-captain').querySelector('span').textContent = t.viceCaptain || 'TBD';
    document.getElementById('modal-squad-count').textContent = t.players.length;
    document.getElementById('modal-purse').textContent = `${t.purse} RC`;

    // Player List
    playerList.innerHTML = '';
    if (t.players.length === 0) {
        playerList.innerHTML = `<div class="col-span-full py-8 text-center text-gray-500 italic">No players acquired yet.</div>`;
    } else {
        t.players.forEach(p => {
            playerList.innerHTML += `
                <div class="bg-white/5 border border-white/5 p-3 rounded-xl flex justify-between items-center hover:bg-white/10 transition-colors">
                    <span class="font-bold text-gray-200">${p.name}</span>
                    <span class="font-mono text-emerald-400 text-sm font-bold">${p.price} RC</span>
                </div>
            `;
        });
    }

    // Open Animation
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('.transform').classList.remove('scale-95');
    }, 10);
};

window.closeTeamModal = function() {
    const modal = document.getElementById('team-modal');
    modal.classList.add('opacity-0');
    modal.querySelector('.transform').classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300); // Corrected transition time
};
