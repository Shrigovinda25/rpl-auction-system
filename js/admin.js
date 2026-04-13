const SESSION_KEY = "rpl_auth_session";

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupAuthListeners();
    setupTabNavigation();
    initAdmin();
    // Re-render when state changes (e.g. from reset)
    window.addEventListener('stateUpdated', renderAdminData);
});

/**
 * Tab Navigation — switches between tab panes
 */
function setupTabNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    const panes = document.querySelectorAll('.tab-pane');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.dataset.tab;

            // Deactivate all tabs
            tabs.forEach(t => {
                t.classList.remove('active', 'border-b-2', 'border-blue-500', 'text-white');
                t.classList.add('text-gray-500');
            });

            // Activate clicked tab
            tab.classList.add('active', 'border-b-2', 'border-blue-500', 'text-white');
            tab.classList.remove('text-gray-500');

            // Hide all panes, show target
            panes.forEach(p => p.classList.add('hidden'));
            const targetPane = document.getElementById(targetId);
            if (targetPane) targetPane.classList.remove('hidden');
        });
    });
}

function checkAuth() {
    const session = sessionStorage.getItem(SESSION_KEY);
    if (session === "true") {
        showDashboard();
    }
}

function showDashboard() {
    const authPortal = document.getElementById('auth-portal');
    const adminDashboard = document.getElementById('admin-dashboard');
    if (authPortal) authPortal.classList.add('hidden');
    if (adminDashboard) {
        adminDashboard.classList.remove('hidden');
        setTimeout(() => {
            adminDashboard.classList.remove('opacity-0');
        }, 10);
    }
}

function setupAuthListeners() {
    const loginBtn = document.getElementById('btn-login');
    const logoutBtn = document.getElementById('btn-logout');
    const userInp = document.getElementById('admin-user');
    const passInp = document.getElementById('admin-pass');
    const errorMsg = document.getElementById('auth-error');

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const config = getAuthConfig();
            const cloudPass = (config && config.password) ? config.password.trim().toLowerCase() : "";
            
            // Check both boxes in case the user typed in either one
            const val1 = userInp.value.trim().toLowerCase();
            const val2 = passInp.value.trim().toLowerCase();

            if (val1 === cloudPass || val2 === cloudPass) {
                sessionStorage.setItem(SESSION_KEY, "true");
                loginBtn.innerHTML = '<i class="fas fa-check mr-2"></i> Access Granted';
                loginBtn.classList.replace('bg-gradient-to-r', 'bg-emerald-600');
                showDashboard();
            } else {
                errorMsg.textContent = "Wrong password! Please try again.";
                errorMsg.classList.remove('hidden');
                passInp.value = "";
                setTimeout(() => errorMsg.classList.add('hidden'), 3000);
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem(SESSION_KEY);
            location.reload();
        });
    }

    // Enter key support
    [userInp, passInp].forEach(inp => {
        if (inp) {
            inp.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') loginBtn.click();
            });
        }
    });
}

function initAdmin() {
    renderAdminData();
    setupEventListeners();
}

let isAdvancing = false;

function renderAdminData() {
    try {
        const s = getState();
        // Fallback for missing state property
        const selIdx = s.auctionState.selectedTeamIndex;

    // Status Badge
    const badge = document.getElementById('auction-status-badge');
    if (badge) {
        badge.textContent = s.auctionState.isLive ? "LIVE" : "PAUSED";
        badge.className = s.auctionState.isLive
            ? "px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-semibold border border-emerald-500/30"
            : "px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-sm font-semibold border border-yellow-500/30";
    }

    // Auction Hall elements (only render if they exist on the page)
    const liveCtn = document.getElementById('live-player-card');
    const msgCtn = document.getElementById('no-player-msg');

    if (liveCtn && msgCtn) {
        if (s.auctionState.isLive) {
            const goLiveBtn = document.getElementById('btn-go-live');
            const pauseBtn = document.getElementById('btn-pause');
            if (goLiveBtn) goLiveBtn.classList.add('opacity-50', 'cursor-not-allowed');
            if (pauseBtn) pauseBtn.classList.remove('opacity-50', 'cursor-not-allowed');

            const activePlayer = s.players[s.auctionState.currentPlayerIndex];
            if (activePlayer) {
                liveCtn.classList.remove('hidden');
                msgCtn.classList.add('hidden');

                document.getElementById('live-player-img').src = activePlayer.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(activePlayer.name)}&background=random&size=200`;
                document.getElementById('live-player-name').textContent = activePlayer.name;
                document.getElementById('live-player-base').textContent = activePlayer.basePrice;
                const bidInput = document.getElementById('bid-amount');
                if (bidInput && !bidInput.dataset.userEditing) {
                    bidInput.value = activePlayer.basePrice;
                }
                if (typeof updateBidPreview === 'function') updateBidPreview();
                liveCtn.classList.remove('opacity-60', 'pointer-events-none');
            } else {
                liveCtn.classList.add('hidden');
                msgCtn.classList.remove('hidden');
                msgCtn.innerHTML = '<i class="fas fa-check-circle text-emerald-500 text-3xl mb-4"></i><p class="text-xs font-bold text-gray-600 uppercase tracking-widest">Auction Finished!</p>';
            }
        } else {
            const goLiveBtn = document.getElementById('btn-go-live');
            const pauseBtn = document.getElementById('btn-pause');
            if (goLiveBtn) goLiveBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            if (pauseBtn) pauseBtn.classList.add('opacity-50', 'cursor-not-allowed');
            liveCtn.classList.add('hidden');
            msgCtn.classList.remove('hidden');
            msgCtn.innerHTML = '<i class="fas fa-satellite text-gray-700 text-3xl mb-4"></i><p class="text-xs font-bold text-gray-600 uppercase tracking-widest">Auction Standby</p><p class="text-[10px] text-gray-700 mt-1 italic">Click \'Go Live\' to begin session.</p>';
        }
    }

    // Populate Teams Buttons
    const teamBtnCtn = document.getElementById('bid-team-buttons');
    if (teamBtnCtn) {
        teamBtnCtn.innerHTML = '';
        const isWaiting = s.auctionState.status === "Waiting";
        s.teams.forEach((t, i) => {
            const isSelected = i === selIdx;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `p-3 rounded border text-left transition team-selector-btn ${isSelected 
                ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-900/50 scale-105 z-10' 
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500 hover:bg-gray-700'}`;
            btn.dataset.index = i; // For event delegation
            btn.innerHTML = `
                <div class="flex justify-between items-center pointer-events-none">
                    <div class="flex items-center gap-3">
                        ${t.logo ? `<img src="${t.logo}" class="w-14 h-14 rounded-full border border-white/20 object-cover bg-white/10">` : `<div class="w-14 h-14 rounded-full bg-blue-600/20 flex items-center justify-center text-sm font-black">${t.name.charAt(0)}</div>`}
                        <span class="font-bold">${t.name}</span>
                    </div>
                    <span class="text-xs ${isSelected ? 'text-blue-100' : 'text-gray-500'} font-mono">${t.purse} RC</span>
                </div>
            `;
            teamBtnCtn.appendChild(btn);
        });
    }

    // Populate Player counts & tables
    const pCountEl = document.getElementById('player-count-stat');
    if (pCountEl) pCountEl.textContent = s.players.length;
    
    const tCountEl = document.getElementById('team-count-stat');
    if (tCountEl) tCountEl.textContent = s.teams.length;

    const pTbody = document.getElementById('player-table-body');
    if (pTbody) {
        pTbody.innerHTML = '';
        s.players.forEach((p, idx) => {
            let statusBadge = `<span class="px-2 py-1 text-xs rounded bg-blue-500/20 text-blue-400">Waiting</span>`;
            if (p.status === "Selected") statusBadge = `<span class="px-2 py-1 text-xs rounded bg-emerald-500/20 text-emerald-400">Selected</span>`;
            if (p.status === "Not Selected") statusBadge = `<span class="px-2 py-1 text-xs rounded bg-red-500/20 text-red-400">Not Selected</span>`;

            // Use 'sp' (not 's') to avoid shadowing the outer state variable
            const sports = Array.isArray(p.sport) ? p.sport : [p.sport];
            const sportTags = sports.map(sp => `<span class="px-1.5 py-0.5 text-xs rounded bg-purple-500/20 text-purple-300 mr-1">${sp}</span>`).join('');

            const isActive = idx === s.auctionState.currentPlayerIndex && s.auctionState.isLive;
            pTbody.innerHTML += `
                <tr class="${isActive ? 'bg-blue-900/30 border-blue-500/30' : 'hover:bg-white/5'} border-b border-gray-700 transition-colors">
                    <td class="px-4 py-3 font-semibold text-sm ${isActive ? 'text-blue-200' : 'text-white'}">${p.name} ${isActive ? '<span class="ml-1 text-[9px] bg-blue-500 text-white px-1.5 rounded font-black uppercase">ON AIR</span>' : ''}</td>
                    <td class="px-4 py-3 text-gray-400 text-xs">${sportTags} • ${p.gender}</td>
                    <td class="px-4 py-3 font-mono text-sm">${p.basePrice} RC</td>
                    <td class="px-4 py-3">${statusBadge}</td>
                </tr>
            `;
        });
    }

    // Populate Teams Grid
    const tGrid = document.getElementById('teams-grid');
    if (tGrid) {
        tGrid.innerHTML = '';
        s.teams.forEach((t, i) => {
            tGrid.innerHTML += `
                <div class="bg-gray-800 p-4 rounded-xl border border-white/5 flex flex-col justify-between group hover:border-blue-500/30 transition-all shadow-lg">
                    <div class="flex gap-4 items-start mb-3">
                        <div class="flex-shrink-0 relative">
                            ${t.logo ? `<img src="${t.logo}" class="w-20 h-20 rounded-xl border border-white/10 object-cover shadow-lg bg-white/5">` : `<div class="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 flex items-center justify-center text-2xl font-black text-blue-400">${t.name.charAt(0)}</div>`}
                        </div>
                        <div class="flex-grow">
                            <h3 class="font-black text-sm flex justify-between items-center text-white uppercase tracking-tighter">
                                ${t.name}
                                <button onclick="editTeam(${i})" class="text-gray-500 hover:text-blue-400 transition-colors"><i class="fas fa-edit text-[10px]"></i></button>
                            </h3>
                            <p class="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">C: ${t.captain}</p>
                            <p class="text-[9px] font-bold text-gray-500 uppercase tracking-widest">VC: ${t.viceCaptain}</p>
                        </div>
                    </div>
                    <div class="mt-2 p-2 bg-gray-900 rounded text-center">
                        <div class="text-sm text-gray-400">Purse</div>
                        <div class="text-xl font-bold text-emerald-400 font-mono">${t.purse} RC</div>
                    </div>
                    <div class="text-xs text-gray-500 mt-2 flex justify-between">
                        <span>Squad: ${(t.players || []).length}</span>
                        <span>M:${t.maleCount || 0} / F:${t.femaleCount || 0}</span>
                    </div>
                </div>
            `;
        });
    }
    } catch (e) {
        console.error("Error rendering admin data:", e);
    }

    // Render Admin Matches
    if (typeof renderAdminMatches === 'function') renderAdminMatches();
}

/**
 * Event Binding
 */
function setupEventListeners() {
    // Add Single Player
    const addPlayerForm = document.getElementById('add-player-form');
    if (addPlayerForm) {
        addPlayerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const state = getState();

            // Collect all checked sports
            const checkedSports = [...document.querySelectorAll('.p-sport-cb:checked')].map(cb => cb.value);
            if (checkedSports.length === 0) {
                Swal.fire('Select Sports', 'Please select at least one sport for this player.', 'warning');
                return;
            }

            const p = {
                name: document.getElementById('p-name').value,
                sport: checkedSports,       // Array of sports
                gender: document.getElementById('p-gender').value,
                basePrice: parseInt(document.getElementById('p-price').value),
                image: document.getElementById('p-img').value || null,
                achievements: document.getElementById('p-achievements').value || "None",
                status: "Waiting"
            };
            state.players.push(p);
            saveState(state);

            // Reset form including all checkboxes
            document.getElementById('add-player-form').reset();
            document.querySelectorAll('.p-sport-cb').forEach(cb => cb.checked = false);

            Swal.fire({ title: 'Added!', text: 'Player manually added', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
        });
    }

    // Team Selection Event Delegation (Auction Hall only)
    const bidTeamBtns = document.getElementById('bid-team-buttons');
    if (bidTeamBtns) {
        bidTeamBtns.addEventListener('click', (e) => {
            const btn = e.target.closest('.team-selector-btn');
            if (!btn) return;
            
            const idx = parseInt(btn.dataset.index);
            const state = getState();
            state.auctionState.selectedTeamIndex = idx;
            state.auctionState.leadingTeam = state.teams[idx]?.name || null;
            
            // If current bid is 0, start it at the player's base price when a team is first selected
            if (state.auctionState.currentBid === 0) {
                const player = state.players[state.auctionState.currentPlayerIndex];
                if (player) {
                    state.auctionState.currentBid = player.basePrice;
                    const bidInp = document.getElementById('bid-amount');
                    if (bidInp) bidInp.value = player.basePrice;
                }
            }
            
            saveState(state);
            updateBidPreview();
        });
    }

    // Excel Upload
    const btnUploadExcel = document.getElementById('btn-upload-excel');
    if (btnUploadExcel) {
        btnUploadExcel.addEventListener('click', () => {
            const fileInput = document.getElementById('excel-file');
            if (!fileInput.files[0]) {
                Swal.fire('Error', 'Please select an Excel file first.', 'error'); return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const rows = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

                    const state = getState();
                    let added = 0;
                    rows.forEach(row => {
                        const flatRow = {};
                        for (let key in row) {
                            // Aggressively clean keys (remove weird leading commas, line breaks, and whitespace)
                            const cleanKey = key.trim().toLowerCase().replace(/[\n\r]+/g, ' ').replace(/\s+/g, ' ');
                            flatRow[cleanKey] = row[key];
                        }

                        const name = flatRow['player name'] || flatRow['name'] || '';
                        if (!name || name === 'Player Name') return; // Skip header clones

                        const rawSport = flatRow['select sport'] || flatRow['sport'] || flatRow['sports'] || 'Unknown';
                        const sportArr = Array.isArray(rawSport) 
                            ? rawSport 
                            : typeof rawSport === 'string'
                              ? rawSport.split(/[;,]+/).map(s => s.trim()).filter(Boolean)
                              : [String(rawSport)];

                        const rawBase = flatRow['base price'] || flatRow['baseprice'];
                        const basePrice = parseInt(rawBase) || 0;

                        let image = flatRow['player image'] || flatRow['image url'] || flatRow['imageurl'] || flatRow['image'] || null;
                        if (image && typeof image === 'string' && image.includes('drive.google.com')) {
                            const idMatch = image.match(/[?&]id=([a-zA-Z0-9_-]+)/) || image.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
                            const fileId = idMatch ? idMatch[1] : null;
                            if (fileId) image = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
                        }

                        // Combined Achievements & Cricket Role
                        const achKey = Object.keys(flatRow).find(k => k.includes('achievements')) || 'achievements';
                        let achievements = flatRow[achKey] || 'None';
                        
                        const roleKey = Object.keys(flatRow).find(k => k.includes('cricket') && k.includes('as ?')) || 'role';
                        if (flatRow[roleKey]) {
                            achievements = `Role: ${flatRow[roleKey]} | ${achievements}`;
                        }

                        state.players.push({
                            name: name,
                            sport: sportArr,
                            gender: flatRow['gender'] || 'Male',
                            basePrice: basePrice,
                            image: image,
                            achievements: achievements,
                            status: 'Waiting'
                        });
                        added++;
                    });

                    saveState(state);
                    Swal.fire('Success', `${added} players uploaded.`, 'success');
                    fileInput.value = '';
                } catch (err) {
                    console.error('Excel/CSV parse error:', err);
                    Swal.fire('Error', 'Failed to parse the file. Please check the columns.', 'error');
                }
            };
            reader.readAsArrayBuffer(fileInput.files[0]);
        });
    }

    // Add Team
    const btnAddTeam = document.getElementById('btn-add-team');
    if (btnAddTeam) {
        btnAddTeam.addEventListener('click', async () => {
            const { value: formValues } = await Swal.fire({
                title: 'Add New Team',
                html: `
                    <input id="swal-t-name" class="swal2-input" placeholder="Team Name">
                    <input id="swal-t-c" class="swal2-input" placeholder="Captain">
                    <input id="swal-t-vc" class="swal2-input" placeholder="Vice Captain">
                    <input id="swal-t-purse" type="number" class="swal2-input" placeholder="Starting Purse" value="10000">
                `,
                focusConfirm: false,
                preConfirm: () => {
                    return [
                        document.getElementById('swal-t-name').value,
                        document.getElementById('swal-t-c').value,
                        document.getElementById('swal-t-vc').value,
                        parseInt(document.getElementById('swal-t-purse').value)
                    ]
                }
            });

            if (formValues && formValues[0]) {
                const state = getState();
                state.teams.push({
                    name: formValues[0].toUpperCase(), captain: formValues[1] || 'TBD', viceCaptain: formValues[2] || 'TBD',
                    purse: formValues[3] || 10000, players: [], maleCount: 0, femaleCount: 0
                });
                saveState(state);
                Swal.fire('Added', 'Team added successfully', 'success');
            }
        });
    }

    // Auction Controls (only bind if elements exist — Auction Hall may be removed)
    const goLiveBtn = document.getElementById('btn-go-live');
    const pauseBtn = document.getElementById('btn-pause');
    const nextBtn = document.getElementById('btn-next');
    const bidAmountInput = document.getElementById('bid-amount');
    const sellBtn = document.getElementById('btn-sell');
    const unsoldBtn = document.getElementById('btn-unsold');

    if (goLiveBtn) {
        goLiveBtn.addEventListener('click', () => {
            const s = getState();
            s.auctionState.isLive = true;
            if (s.players[s.auctionState.currentPlayerIndex]?.status !== "Waiting") {
                const nextWaiting = s.players.findIndex(p => p.status === "Waiting");
                if (nextWaiting !== -1) s.auctionState.currentPlayerIndex = nextWaiting;
            }
            s.auctionState.status = "Waiting";
            s.auctionState.selectedTeamIndex = null;
            s.auctionState.leadingTeam = null;
            s.auctionState.currentBid = 0;
            saveState(s);
        });
    }

    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            const s = getState();
            s.auctionState.isLive = false;
            saveState(s);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const s = getState();
            if (s.auctionState.currentPlayerIndex < s.players.length - 1) {
                let found = false;
                for (let i = s.auctionState.currentPlayerIndex + 1; i < s.players.length; i++) {
                    if (s.players[i].status === "Waiting") {
                        s.auctionState.currentPlayerIndex = i;
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    s.auctionState.currentPlayerIndex++;
                }
                s.auctionState.status = s.players[s.auctionState.currentPlayerIndex].status;
                s.auctionState.selectedTeamIndex = null;
                s.auctionState.leadingTeam = null;
                s.auctionState.currentBid = 0;
            } else {
                Swal.fire('Auctions over!', 'No more players in list', 'info');
            }
            saveState(s);
        });
    }

    if (bidAmountInput) {
        bidAmountInput.addEventListener('input', (e) => {
            e.target.dataset.userEditing = 'true';
            updateBidPreview();
            const s = getState();
            s.auctionState.currentBid = parseInt(e.target.value) || 0;
            saveState(s);
        });
    }

    // Quick Bid Buttons
    document.querySelectorAll('.btn-quick-bid').forEach(btn => {
        btn.addEventListener('click', () => {
            const bidInput = document.getElementById('bid-amount');
            if (!bidInput) return;
            const currentVal = parseInt(bidInput.value) || 0;
            const increment = parseInt(btn.dataset.amount) || 0;
            
            bidInput.value = currentVal + increment;
            bidInput.dataset.userEditing = 'true';
            updateBidPreview();

            const s = getState();
            s.auctionState.currentBid = parseInt(bidInput.value);
            s.auctionState.leadingTeam = s.teams[s.auctionState.selectedTeamIndex]?.name || null;
            saveState(s);
        });
    });

    // Handle Bids (only if Auction Hall elements exist)
    if (sellBtn) {
    sellBtn.addEventListener('click', () => {
        if (isAdvancing) return; // Prevent double trigger
        const s = getState();
        const pIdx = s.auctionState.currentPlayerIndex;
        const player = s.players[pIdx];
        if (!player || player.status !== "Waiting") return;

        const bidInput = document.getElementById('bid-amount');
        const bidAmount = parseInt(bidInput.value);
        if (s.auctionState.selectedTeamIndex === null || s.auctionState.selectedTeamIndex === undefined) {
            Swal.fire('No Team', 'Please select a team from the list first.', 'error');
            return;
        }
        const team = s.teams[s.auctionState.selectedTeamIndex];
        
        if (!team) {
            Swal.fire('No Team', 'Please select a valid team first.', 'error');
            return;
        }

        if (!bidAmount || bidAmount <= 0) {
            Swal.fire('Invalid Bid', 'Please enter a valid bid amount.', 'error');
            return;
        }
        if (bidAmount > team.purse) {
            Swal.fire('Invalid Bid', 'Team does not have enough purse!', 'error');
            return;
        }

        isAdvancing = true;
        
        // Deduct immediately
        team.purse -= bidAmount;
        if (!team.players) team.players = [];
        team.players.push({ name: player.name, price: bidAmount });
        if (player.gender === "Male") team.maleCount = (team.maleCount || 0) + 1;
        if (player.gender === "Female") team.femaleCount = (team.femaleCount || 0) + 1;

        player.status = "Selected";
        player.soldTo = team.name;
        player.soldPrice = bidAmount;

        s.auctionState.status = "Selected";
        s.auctionState.leadingTeam = team.name;
        s.auctionState.currentBid = bidAmount;
        
        saveState(s);

        Swal.fire({
            title: 'SELECTED! 🎉',
            html: `<b>${player.name}</b> selected for <b>${team.name}</b>. Advance in 2s...`,
            icon: 'success',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000
        });

        // Delay Advancement locally
        setTimeout(() => {
            isAdvancing = false;
            const newState = getState();
            autoAdvanceToNextPlayer(newState);
            saveState(newState);
        }, 2000);
    });
    } // end if (sellBtn)

    if (unsoldBtn) {
    unsoldBtn.addEventListener('click', () => {
        if (isAdvancing) return;
        const s = getState();
        const pIdx = s.auctionState.currentPlayerIndex;
        const player = s.players[pIdx];
        if (!player || player.status !== "Waiting") return;

        isAdvancing = true;

        const playerName = player.name;
        player.status = "Not Selected";
        s.auctionState.status = "Not Selected";
        
        saveState(s);

        Swal.fire({
            title: 'Not Selected',
            text: `${playerName} was not selected. Advance in 2s...`,
            icon: 'info',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000
        });

        // Delay Advancement
        setTimeout(() => {
            isAdvancing = false;
            const newState = getState();
            autoAdvanceToNextPlayer(newState);
            saveState(newState);
        }, 2000);
    });
    } // end if (unsoldBtn)

    // Reset Global State
    document.getElementById('btn-reset-state').addEventListener('click', () => {
        Swal.fire({
            title: 'Reset Auction?',
            text: "This will wipe all players, teams, and bids. This cannot be undone!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, reset everything!'
        }).then((result) => {
            if (result.isConfirmed) {
                window.resetState();
                location.reload();
            }
        });
    });

    // Export Results CSV
    const exportBtn = document.getElementById('btn-export');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const s = getState();
            // Separate and sort by Gender
            const males = s.players.filter(p => p.gender === "Male");
            const females = s.players.filter(p => p.gender === "Female");

            let csvContent = "\ufeff"; // BOM for Excel UTF-8 support
            
            // Male Section
            csvContent += "SECTION,MALE PLAYERS\n";
            csvContent += "Player Name,Sport,Gender,Base Price,Sold Price,Team,Status\n";
            males.forEach(p => {
                csvContent += `"${p.name}","${(p.sport || []).join('; ')}","${p.gender}",${p.basePrice},${p.soldPrice || 0},"${p.soldTo || 'None'}","${p.status}"\n`;
            });

            csvContent += "\nSECTION,FEMALE PLAYERS\n";
            csvContent += "Player Name,Sport,Gender,Base Price,Sold Price,Team,Status\n";
            females.forEach(p => {
                csvContent += `"${p.name}","${(p.sport || []).join('; ')}","${p.gender}",${p.basePrice},${p.soldPrice || 0},"${p.soldTo || 'None'}","${p.status}"\n`;
            });

            // Summary Section
            csvContent += "\nOVERALL SUMMARY\n";
            const soldTotal = s.players.filter(p => p.status === "Selected").length;
            const unsoldTotal = s.players.filter(p => p.status === "Not Selected").length;
            const totalPurseSpent = s.players.reduce((sum, p) => sum + (p.soldPrice || 0), 0);

            csvContent += `Total Players Registered: ,${s.players.length}\n`;
            csvContent += `Total Players Sold: ,${soldTotal}\n`;
            csvContent += `Total Players Not Selected: ,${unsoldTotal}\n`;
            csvContent += `Total Male Players: ,${males.length}\n`;
            csvContent += `Total Female Players: ,${females.length}\n`;
            csvContent += `Total Purse Spent (RC): ,${totalPurseSpent}\n`;
            csvContent += `Export Time: ,${new Date().toLocaleString()}\n`;

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `RPL_Auction_Final_Results_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    // Restoring Unsold (Not Selected) Players
    const restoreBtn = document.getElementById('btn-restore-unsold');
    if (restoreBtn) {
        restoreBtn.addEventListener('click', () => {
            const s = getState();
            const unsoldPlayers = s.players.filter(p => p.status === "Not Selected");

            if (unsoldPlayers.length === 0) {
                Swal.fire('No Players', 'There are no "Not Selected" players to restore.', 'info');
                return;
            }

            Swal.fire({
                title: 'Re-Auction Round?',
                text: `Give a second chance to ${unsoldPlayers.length} players?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#7c3aed',
                confirmButtonText: 'Yes, Restore Them'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Reset statuses
                    s.players.forEach(p => {
                        if (p.status === "Not Selected") {
                            p.status = "Waiting";
                        }
                    });

                    // Set index to the first of the newly reset players
                    const firstWaiting = s.players.findIndex(p => p.status === "Waiting");
                    if (firstWaiting !== -1) {
                        s.auctionState.currentPlayerIndex = firstWaiting;
                    }

                    s.auctionState.status = "Waiting";
                    s.auctionState.selectedTeamIndex = null;
                    s.auctionState.leadingTeam = null;
                    s.auctionState.currentBid = 0;
                    
                    saveState(s);
                    Swal.fire('Restored!', 'Not Selected players are back in the pool.', 'success');
                }
            });
        });
    }

    // Tournament Events
    setupTournamentListeners();
}

// Global exposes
window.editTeam = async (index) => {
    const s = getState();
    const t = s.teams[index];
    const { value: formValues } = await Swal.fire({
        title: 'Edit Team details',
        html: `
            <div class="space-y-2">
                <input id="swal-e-name" class="swal2-input !mt-2" placeholder="Team Name" value="${t.name}">
                <input id="swal-e-c" class="swal2-input !mt-2" placeholder="Captain" value="${t.captain}">
                <input id="swal-e-vc" class="swal2-input !mt-2" placeholder="Vice Captain" value="${t.viceCaptain}">
                <input id="swal-e-purse" type="number" class="swal2-input !mt-2" placeholder="Purse" value="${t.purse}">
            </div>
        `,
        focusConfirm: false,
        preConfirm: () => [
            document.getElementById('swal-e-name').value,
            document.getElementById('swal-e-c').value,
            document.getElementById('swal-e-vc').value,
            parseInt(document.getElementById('swal-e-purse').value)
        ]
    });

    if (formValues && formValues[0]) {
        t.name = formValues[0].toUpperCase();
        t.captain = formValues[1];
        t.viceCaptain = formValues[2];
        t.purse = formValues[3];
        saveState(s);
    }
};

/**
 * Auto-advance to the next player with status "Waiting"
 */
function autoAdvanceToNextPlayer(s) {
    const currentIdx = s.auctionState.currentPlayerIndex;
    let nextIdx = -1;
    for (let i = currentIdx + 1; i < s.players.length; i++) {
        if (s.players[i].status === "Waiting") {
            nextIdx = i;
            break;
        }
    }
    if (nextIdx !== -1) {
        s.auctionState.currentPlayerIndex = nextIdx;
        s.auctionState.status = "Waiting";
        s.auctionState.currentBid = 0;
        s.auctionState.leadingTeam = null;
        s.auctionState.selectedTeamIndex = null;
        // Reset bid input for next player
        const bidInput = document.getElementById('bid-amount');
        if (bidInput) {
            bidInput.dataset.userEditing = '';
            bidInput.value = s.players[nextIdx].basePrice;
        }
    } else {
        // All players done
        s.auctionState.isLive = false;
    }
}

/**
 * Update the live bid preview card showing team, captain, VC and bid
 */
function updateBidPreview() {
    const s = getState();
    const previewEl = document.getElementById('bid-preview-card');
    if (!previewEl) return;

    const bidInput = document.getElementById('bid-amount');
    const bidAmount = parseInt(bidInput.value) || 0;

    const team = s.teams[s.auctionState.selectedTeamIndex];
    if (!team) {
        previewEl.classList.add('hidden');
        return;
    }

    const remaining = team.purse - bidAmount;
    const isAffordable = bidAmount <= team.purse && bidAmount > 0;

    const teamColors = ['from-blue-600 to-blue-900', 'from-pink-600 to-purple-900', 'from-emerald-600 to-teal-900'];
    const colorClass = teamColors[s.auctionState.selectedTeamIndex % teamColors.length] || 'from-gray-600 to-gray-900';

    previewEl.classList.remove('hidden');
    previewEl.innerHTML = `
        <div class="rounded-xl bg-gradient-to-br ${colorClass} border border-white/10 p-4 shadow-xl">
            <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-bold uppercase tracking-widest text-white/60">Bidding For</span>
                <span class="text-xs px-2 py-0.5 rounded-full font-semibold ${isAffordable ? 'bg-emerald-500/30 text-emerald-300' : (bidAmount > 0 ? 'bg-red-500/30 text-red-300' : 'bg-gray-500/30 text-gray-300')}">
                    ${isAffordable ? '✓ Affordable' : (bidAmount > 0 ? '✗ Over Budget' : 'Enter Amount')}
                </span>
            </div>
            <div class="flex items-center gap-4 mb-3">
                ${team.logo ? `<img src="${team.logo}" class="w-20 h-20 rounded-lg border border-white/20 object-cover shadow-lg bg-white/10">` : ''}
                <div>
                    <h3 class="text-2xl font-black text-white drop-shadow-lg uppercase tracking-tighter leading-tight">${team.name}</h3>
                    <div class="flex gap-3 text-[10px] text-white/60">
                        <span><i class="fas fa-crown text-yellow-400 mr-1"></i>${team.captain}</span>
                        <span><i class="fas fa-star text-blue-300 mr-1"></i>${team.viceCaptain}</span>
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-3 gap-2 text-center">
                <div class="bg-black/30 rounded-lg p-2">
                    <div class="text-xs text-white/50 mb-1">Purse</div>
                    <div class="text-base font-bold text-emerald-300 font-mono">${team.purse} RC</div>
                </div>
                <div class="bg-black/30 rounded-lg p-2">
                    <div class="text-xs text-white/50 mb-1">Bid</div>
                    <div class="text-base font-bold ${isAffordable ? 'text-white' : 'text-red-400'} font-mono">${bidAmount > 0 ? bidAmount + ' RC' : '—'}</div>
                </div>
                <div class="bg-black/30 rounded-lg p-2">
                    <div class="text-xs text-white/50 mb-1">Remaining</div>
                    <div class="text-base font-bold ${remaining >= 0 ? 'text-emerald-300' : 'text-red-400'} font-mono">${bidAmount > 0 ? remaining + ' RC' : '—'}</div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Tournament Management Logic
 */
function renderAdminMatches() {
    const matchList = document.getElementById('admin-matches-list');
    const ongoingSelector = document.getElementById('ongoing-matches-selector');
    
    if (matchList) matchList.innerHTML = '';
    if (ongoingSelector) ongoingSelector.innerHTML = '';

    const s = getState();
    const matches = s.matches || [];
    
    if (matches.length === 0) {
        if (matchList) matchList.innerHTML = '<p class="text-[10px] text-gray-500 italic p-4 text-center border border-dashed border-white/5 rounded-xl">No active matches logged.</p>';
        if (ongoingSelector) ongoingSelector.innerHTML = '<p class="text-[10px] text-gray-500 italic p-4 text-center border border-dashed border-white/5 rounded-xl">No matches found to stream.</p>';
        return;
    }

    matches.forEach((m, idx) => {
        let scText = m.score ? `<span class="bg-gray-700 px-2 py-0.5 rounded text-white font-mono">${m.score}</span>` : '<span class="text-gray-500 italic">Not Started</span>';
        let winText = m.winner ? `<span class="text-emerald-400 font-bold ml-2">(${m.winner} Won)</span>` : '';
        const isFinished = !!m.winner;

        // Common Header
        const matchInfo = `
            <div class="flex justify-between items-center mb-2">
                <span class="text-[9px] font-black uppercase text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">${m.sport} • ${m.stage}</span>
                <button onclick="deleteMatch(${idx})" class="text-red-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition"><i class="fas fa-trash text-xs"></i></button>
            </div>
            <div class="flex flex-col gap-1">
                <div class="flex justify-between items-center text-xs font-bold text-gray-300">
                    <span class="truncate w-full text-blue-400">${m.team1}</span>
                    <span class="text-gray-600 mx-2 text-[10px] italic w-[20px] text-center">VS</span>
                    <span class="truncate w-full text-right text-pink-400">${m.team2}</span>
                </div>
                <!-- optional players -->
                ${m.playerA || m.playerB ? `
                <div class="flex justify-between items-center text-[9px] font-medium text-gray-500 mt-1">
                    <span class="truncate w-full">${m.playerA || ''}</span>
                    <span class="truncate w-full text-right">${m.playerB || ''}</span>
                </div>` : ''}
            </div>
            <div class="text-[10px] text-gray-500 mt-2">${m.details || 'No details'}</div>
            <div class="flex items-center text-[10px] justify-between mt-2 pt-2 border-t border-white/5">
                <div>Score: ${scText} ${winText}</div>
            </div>
        `;

        if (matchList) {
            matchList.innerHTML += `
                <div class="bg-black/30 p-4 rounded-2xl border border-white/5 flex flex-col relative group hover:border-amber-500/30 transition shadow-lg">
                    ${matchInfo}
                </div>
            `;
        }

        // Only show unfinished matches in the ongoing selector, or style finished ones distinctly
        if (ongoingSelector) {
            ongoingSelector.innerHTML += `
                <div class="bg-cardBg p-4 rounded-2xl border ${isFinished ? 'border-white/5 opacity-50' : 'border-emerald-500/30'} flex flex-col relative group hover:border-emerald-500 transition shadow-lg cursor-pointer" onclick="activateLiveMatch(${idx})">
                    ${matchInfo}
                    ${!isFinished ? `
                    <div class="mt-3">
                        <button class="w-full py-2 bg-emerald-500/10 text-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all"><i class="fas fa-play mr-1"></i> Start Live Scoring</button>
                    </div>` : `
                    <div class="mt-3">
                        <div class="w-full py-2 bg-white/5 text-gray-500 rounded-lg text-[9px] font-black uppercase tracking-widest text-center">Match Finished</div>
                    </div>`}
                </div>
            `;
        }
    });
}

function setupTournamentListeners() {
    // --- State for inline match form ---
    let selectedSport = null;
    let selectedStage = null;
    let selectedTeamA = null;
    let selectedTeamB = null;
    let selectedWinner = 'auto';

    const ACTIVE_SPORT = 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-900/40';
    const INACTIVE_SPORT = 'bg-white/5 border-white/10 text-gray-400';
    const ACTIVE_STAGE = 'bg-amber-600 border-amber-400 text-white shadow-lg shadow-amber-900/40';
    const INACTIVE_STAGE = 'bg-white/5 border-white/10 text-gray-400';
    const ACTIVE_TEAM_A = 'bg-blue-600 border-blue-400 text-white shadow-lg';
    const INACTIVE_TEAM = 'bg-white/5 border-white/10 text-gray-400';
    const ACTIVE_TEAM_B = 'bg-pink-600 border-pink-400 text-white shadow-lg';
    const ACTIVE_WINNER = 'bg-emerald-600 border-emerald-400 text-white shadow-lg';
    const INACTIVE_WINNER = 'bg-white/5 border-white/10 text-gray-400';

    function splitClasses(str) { return str.split(' ').filter(Boolean); }

    // Render team buttons into Team A & Team B selectors
    function renderTeamButtons() {
        const freshState = getState();
        const teams = freshState.teams && freshState.teams.length > 0
            ? freshState.teams
            : [{ name: "ROBO KNIGHTS" }, { name: "FLASHING BOTS \ud83e\udd16" }, { name: "TECH TITANS \ud83e\udd16" }];

        const teamAContainer = document.getElementById('teamA-selector');
        const teamBContainer = document.getElementById('teamB-selector');
        const winnerTeamsContainer = document.getElementById('dynamic-winner-teams');
        if (!teamAContainer || !teamBContainer) return;

        teamAContainer.innerHTML = '';
        teamBContainer.innerHTML = '';
        if (winnerTeamsContainer) winnerTeamsContainer.innerHTML = '';

        teams.forEach(t => {
            const logoHtml = t.logo ? `<img src="${t.logo}" class="w-6 h-6 rounded-full inline-block mr-2 align-middle border border-white/20 bg-white/10">` : '';

            const btnA = document.createElement('button');
            btnA.type = 'button';
            btnA.className = `teamA-btn p-3 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all active:scale-95 text-center ${INACTIVE_TEAM}`;
            btnA.dataset.team = t.name;
            btnA.innerHTML = `<span class="pointer-events-none">${logoHtml}${t.name}</span>`;
            teamAContainer.appendChild(btnA);

            const btnB = document.createElement('button');
            btnB.type = 'button';
            btnB.className = `teamB-btn p-3 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all active:scale-95 text-center ${INACTIVE_TEAM}`;
            btnB.dataset.team = t.name;
            btnB.innerHTML = `<span class="pointer-events-none">${logoHtml}${t.name}</span>`;
            teamBContainer.appendChild(btnB);

            if (winnerTeamsContainer) {
                const btnW = document.createElement('button');
                btnW.type = 'button';
                btnW.className = `winner-btn p-3 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all active:scale-95 text-center ${INACTIVE_WINNER}`;
                btnW.dataset.winner = t.name;
                btnW.innerHTML = `<span class="pointer-events-none">${logoHtml}${t.name}</span>`;
                winnerTeamsContainer.appendChild(btnW);
            }
        });
    }

    // Initial render & re-render on state update
    renderTeamButtons();
    window.addEventListener('stateUpdated', renderTeamButtons);

    // Set "Auto" winner as default active
    document.querySelectorAll('.winner-btn').forEach(btn => {
        if (btn.dataset.winner === 'auto') {
            btn.classList.remove(...splitClasses(INACTIVE_WINNER));
            btn.classList.add(...splitClasses(ACTIVE_WINNER));
        }
    });

    // --- Sport Buttons ---
    document.getElementById('sport-selector')?.addEventListener('click', (e) => {
        const btn = e.target.closest('.sport-btn');
        if (!btn) return;
        selectedSport = btn.dataset.sport;
        document.querySelectorAll('.sport-btn').forEach(b => { b.classList.remove(...splitClasses(ACTIVE_SPORT)); b.classList.add(...splitClasses(INACTIVE_SPORT)); });
        btn.classList.remove(...splitClasses(INACTIVE_SPORT));
        btn.classList.add(...splitClasses(ACTIVE_SPORT));

        // Toggle Badminton specific options
        const badOptions = document.getElementById('badminton-options');
        const playerAContainer = document.getElementById('playerA-container');
        const playerBContainer = document.getElementById('playerB-container');

        if (selectedSport === 'Badminton') {
            if (badOptions) badOptions.classList.remove('hidden');
            if (playerAContainer) playerAContainer.classList.remove('hidden');
            if (playerBContainer) playerBContainer.classList.remove('hidden');
        } else if (selectedSport === 'Cricket') {
            if (badOptions) badOptions.classList.add('hidden');
            if (playerAContainer) playerAContainer.classList.remove('hidden');
            if (playerBContainer) playerBContainer.classList.remove('hidden');
            // Update placeholder text for cricket context
            const pA1 = document.getElementById('playerA-name');
            const pB1 = document.getElementById('playerB-name');
            if (pA1) pA1.placeholder = 'Team A Captain / Key Player';
            if (pB1) pB1.placeholder = 'Team B Captain / Key Player';
        } else {
            if (badOptions) badOptions.classList.add('hidden');
            if (playerAContainer) playerAContainer.classList.add('hidden');
            if (playerBContainer) playerBContainer.classList.add('hidden');
        }

    });

    // --- Badminton Category Buttons ---
    document.getElementById('badminton-category-selector')?.addEventListener('click', (e) => {
        const btn = e.target.closest('.badminton-cat-btn');
        if (!btn) return;
        
        // Reset styles first
        document.querySelectorAll('.badminton-cat-btn').forEach(b => {
             b.classList.add('bg-white/5', 'border-white/10', 'text-gray-400');
             b.classList.remove('bg-blue-600', 'bg-pink-600', 'bg-purple-600', 'text-white', 'border-blue-400', 'border-pink-400', 'border-purple-400');
        });

        const cat = btn.dataset.category;
        
        // Highlight logic
        if (cat.includes('Mixed')) btn.classList.add('bg-purple-600', 'text-white', 'border-purple-400');
        else if (cat.includes('Girls')) btn.classList.add('bg-pink-600', 'text-white', 'border-pink-400');
        else btn.classList.add('bg-blue-600', 'text-white', 'border-blue-400');
        btn.classList.remove('bg-white/5', 'border-white/10', 'text-gray-400');

        const detailsInput = document.getElementById('match-details');
        if (detailsInput) detailsInput.value = cat;

        // Toggle Doubles Inputs
        const isDoubles = cat.toLowerCase().includes('doubles');
        const pA2 = document.getElementById('playerA2-name');
        const pB2 = document.getElementById('playerB2-name');
        
        if (isDoubles) {
            pA2?.classList.remove('hidden');
            pB2?.classList.remove('hidden');
        } else {
            pA2?.classList.add('hidden');
            pB2?.classList.add('hidden');
        }
    });

    // --- Stage Buttons ---
    document.getElementById('stage-selector')?.addEventListener('click', (e) => {
        const btn = e.target.closest('.stage-btn');
        if (!btn) return;
        selectedStage = btn.dataset.stage;
        document.querySelectorAll('.stage-btn').forEach(b => { b.classList.remove(...splitClasses(ACTIVE_STAGE)); b.classList.add(...splitClasses(INACTIVE_STAGE)); });
        btn.classList.remove(...splitClasses(INACTIVE_STAGE));
        btn.classList.add(...splitClasses(ACTIVE_STAGE));
    });

    // --- Team A Buttons ---
    document.getElementById('teamA-selector')?.addEventListener('click', (e) => {
        const btn = e.target.closest('.teamA-btn');
        if (!btn) return;
        const teamChosen = btn.dataset.team;

        if (teamChosen === selectedTeamB) {
            Swal.fire({ title: 'Invalid Selection', text: 'You cannot pick the same team for both slots!', icon: 'error', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
            return;
        }

        selectedTeamA = teamChosen;
        document.querySelectorAll('.teamA-btn').forEach(b => { b.classList.remove(...splitClasses(ACTIVE_TEAM_A)); b.classList.add(...splitClasses(INACTIVE_TEAM)); });
        btn.classList.remove(...splitClasses(INACTIVE_TEAM));
        btn.classList.add(...splitClasses(ACTIVE_TEAM_A));
    });

    // --- Team B Buttons ---
    document.getElementById('teamB-selector')?.addEventListener('click', (e) => {
        const btn = e.target.closest('.teamB-btn');
        if (!btn) return;
        const teamChosen = btn.dataset.team;

        if (teamChosen === selectedTeamA) {
            Swal.fire({ title: 'Invalid Selection', text: 'You cannot pick the same team for both slots!', icon: 'error', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
            return;
        }

        selectedTeamB = teamChosen;
        document.querySelectorAll('.teamB-btn').forEach(b => { b.classList.remove(...splitClasses(ACTIVE_TEAM_B)); b.classList.add(...splitClasses(INACTIVE_TEAM)); });
        btn.classList.remove(...splitClasses(INACTIVE_TEAM));
        btn.classList.add(...splitClasses(ACTIVE_TEAM_B));
    });

    // --- Winner Buttons ---
    document.getElementById('winner-selector')?.addEventListener('click', (e) => {
        const btn = e.target.closest('.winner-btn');
        if (!btn) return;
        selectedWinner = btn.dataset.winner;
        document.querySelectorAll('.winner-btn').forEach(b => { b.classList.remove(...splitClasses(ACTIVE_WINNER)); b.classList.add(...splitClasses(INACTIVE_WINNER)); });
        btn.classList.remove(...splitClasses(INACTIVE_WINNER));
        btn.classList.add(...splitClasses(ACTIVE_WINNER));
    });

    // --- Submit Match (Schedule Only) ---
    const submitBtn = document.getElementById('btn-submit-match');
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            if (!selectedSport) { Swal.fire('Select Sport', 'Please select a sport first.', 'warning'); return; }
            if (!selectedStage) { Swal.fire('Select Stage', 'Please select a match stage.', 'warning'); return; }
            if (!selectedTeamA || !selectedTeamB) { Swal.fire('Select Teams', 'Please select both Team A and Team B.', 'warning'); return; }
            if (selectedTeamA === selectedTeamB) { Swal.fire('Same Team', 'Team A and Team B must be different!', 'error'); return; }

            const playerA1 = document.getElementById('playerA-name').value || '';
            const playerA2 = document.getElementById('playerA2-name').value || '';
            const playerB1 = document.getElementById('playerB-name').value || '';
            const playerB2 = document.getElementById('playerB2-name').value || '';
            let details = document.getElementById('match-details').value || '';

            // Format player strings
            let teamAStr = playerA1;
            if (playerA2) teamAStr += ` & ${playerA2}`;
            
            let teamBStr = playerB1;
            if (playerB2) teamBStr += ` & ${playerB2}`;

            // Final Details construction
            let finalDetails = details;
            if (selectedSport === 'Badminton' && (teamAStr || teamBStr)) {
                finalDetails += ` (${teamAStr || 'TBD'} vs ${teamBStr || 'TBD'})`;
            }

            const s = getState();
            if (!s.matches) s.matches = [];
            // Create match object
            s.matches.push({ 
                sport: selectedSport, 
                stage: selectedStage, 
                team1: selectedTeamA, 
                team2: selectedTeamB, 
                playerA: teamAStr,
                playerB: teamBStr,
                score: null, 
                winner: null, 
                details: finalDetails 
            });
            saveState(s);
            Swal.fire({ title: 'Match Scheduled!', text: `${selectedTeamA} vs ${selectedTeamB} \u2014 ${selectedSport}`, icon: 'success', shadow: true, timer: 3000 });

            // Reset form
            selectedSport = null; selectedStage = null; selectedTeamA = null; selectedTeamB = null;
            document.querySelectorAll('.sport-btn').forEach(b => { b.classList.remove(...splitClasses(ACTIVE_SPORT)); b.classList.add(...splitClasses(INACTIVE_SPORT)); });
            document.querySelectorAll('.stage-btn').forEach(b => { b.classList.remove(...splitClasses(ACTIVE_STAGE)); b.classList.add(...splitClasses(INACTIVE_STAGE)); });
            document.querySelectorAll('.teamA-btn').forEach(b => { b.classList.remove(...splitClasses(ACTIVE_TEAM_A)); b.classList.add(...splitClasses(INACTIVE_TEAM)); });
            document.querySelectorAll('.teamB-btn').forEach(b => { b.classList.remove(...splitClasses(ACTIVE_TEAM_B)); b.classList.add(...splitClasses(INACTIVE_TEAM)); });
            
            document.getElementById('playerA-name').value = '';
            document.getElementById('playerA2-name').value = '';
            document.getElementById('playerB-name').value = '';
            document.getElementById('playerB2-name').value = '';
            document.getElementById('match-details').value = '';
            document.getElementById('playerA2-name').classList.add('hidden');
            document.getElementById('playerB2-name').classList.add('hidden');
            document.getElementById('badminton-options').classList.add('hidden');
            // Reset player visibility to hidden by default (only visible for badminton)
            document.getElementById('playerA-container').classList.add('hidden');
            document.getElementById('playerB-container').classList.add('hidden');
        });
    }

    setupLiveMatchListeners();
    const setRankBtn = document.getElementById('btn-set-rankings');
    if (setRankBtn) {
        setRankBtn.addEventListener('click', async () => {
            const s = getState();
            const ranks = s.tournamentRankings || {};
            // Always read fresh teams list
            const freshTeams = s.teams && s.teams.length > 0
                ? s.teams.map(t => t.name)
                : ["ROBO KNIGHTS", "FLASHING BOTS 🤖", "TECH TITANS 🤖"];
            const teamOptions = ['<option value="">None</option>'].concat(freshTeams.map(t => `<option value="${t}">${t}</option>`)).join('');
            
            const buildSportSelects = (sportName) => {
                const r = ranks[sportName] || {};
                return `
                    <div class="bg-black/20 p-3 rounded-xl border border-white/10 mb-3">
                        <div class="text-xs font-bold text-yellow-500 mb-2 uppercase">${sportName}</div>
                        <div class="flex gap-2">
                            <select id="rank-${sportName}-1" class="swal2-input !mt-0 w-1/3 text-[10px]"><option value="" disabled>1st Place</option>${teamOptions.replace(`value="${r['1st']}"`, `value="${r['1st']}" selected`)}</select>
                            <select id="rank-${sportName}-2" class="swal2-input !mt-0 w-1/3 text-[10px]"><option value="" disabled>2nd Place</option>${teamOptions.replace(`value="${r['2nd']}"`, `value="${r['2nd']}" selected`)}</select>
                            <select id="rank-${sportName}-3" class="swal2-input !mt-0 w-1/3 text-[10px]"><option value="" disabled>3rd Place</option>${teamOptions.replace(`value="${r['3rd']}"`, `value="${r['3rd']}" selected`)}</select>
                        </div>
                    </div>
                `;
            };

            const { value: formValues } = await Swal.fire({
                title: 'Assign Final Sport Rankings',
                html: `
                    <div class="text-left max-h-[60vh] overflow-y-auto pr-2">
                        ${buildSportSelects('Cricket')}
                        ${buildSportSelects('Badminton')}
                        ${buildSportSelects('Volleyball')}
                        ${buildSportSelects('Tug of War')}
                    </div>
                `,
                width: '700px',
                focusConfirm: false,
                preConfirm: () => {
                    const getRanks = (sport) => ({
                        "1st": document.getElementById(`rank-${sport}-1`).value,
                        "2nd": document.getElementById(`rank-${sport}-2`).value,
                        "3rd": document.getElementById(`rank-${sport}-3`).value,
                    });
                    return {
                        "Cricket": getRanks("Cricket"),
                        "Badminton": getRanks("Badminton"),
                        "Volleyball": getRanks("Volleyball"),
                        "Tug of War": getRanks("Tug of War")
                    };
                }
            });

            if (formValues) {
                const s = getState();
                s.tournamentRankings = formValues;
                saveState(s);
                Swal.fire({ title: 'Rankings Updated!', text: 'RPL points will now reflect the new placements.', icon: 'success' });
            }
        });
    }
}

let activeLiveMatchIndex = null;
let currentScoreA = 0;
let currentScoreB = 0;

// Cricket specific tracking
let currentWickets = 0;
let currentOvers = 0;
let currentBalls = 0;
let maxOversLimit = 8;
let batsman1IsStriker = true;   // true = batsman1 on strike, false = batsman2
let batsman1Runs = 0;
let batsman1BallsFaced = 0;
let batsman2Runs = 0;
let batsman2BallsFaced = 0;
let bowlerStats = {};           // { "BowlerName": { balls: 0, runs: 0, wickets: 0 } }
let battingCard = [];           // [ { name, runs, balls, out: false } ]
let overBallLog = [];           // Current over: [ { label: '1', type: 'run'|'four'|'six'|'dot'|'wide'|'nb'|'wicket' } ]
let allOversLog = [];           // Previous overs: [ { bowler, balls: [...] } ]
let isFreeHit = false;          // True if the next delivery is a Free Hit
let ballHistory = [];           // Stack for undo


function setupLiveMatchListeners() {
    // --- Cricket Input Listeners (save batsmen/bowler to Firebase) ---
    ['cricket-batsman1', 'cricket-batsman2', 'cricket-bowler', 'cricket-batting-team', 'cricket-toss-winner', 'cricket-toss-decision'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', (e) => {
            if (activeLiveMatchIndex === null) return;
            const s = getState();
            const m = s.matches[activeLiveMatchIndex];
            if (!m.cricketData) m.cricketData = {};
            if (id === 'cricket-batsman1') m.cricketData.batsman1 = e.target.value;
            if (id === 'cricket-batsman2') m.cricketData.batsman2 = e.target.value;
            if (id === 'cricket-bowler')   m.cricketData.bowler  = e.target.value;
            if (id === 'cricket-batting-team') m.cricketData.battingTeam = e.target.value;
            if (id === 'cricket-toss-winner') m.cricketData.tossWinner = e.target.value;
            if (id === 'cricket-toss-decision') m.cricketData.tossDecision = e.target.value;
            saveStateSilent(s);
        });
    });

    ['btn-innings-1', 'btn-innings-2'].forEach(id => {
        document.getElementById(id)?.addEventListener('click', (e) => {
            if (activeLiveMatchIndex === null) return;
            const s = getState();
            const m = s.matches[activeLiveMatchIndex];
            if (!m.cricketData) m.cricketData = {};
            m.cricketData.activeInnings = e.target.dataset.innings;
            saveStateSilent(s);
            // Quick UI update
            document.getElementById('btn-innings-1').className = m.cricketData.activeInnings === '2' ? 'px-4 py-2 text-[10px] font-black uppercase tracking-wider text-gray-500 hover:text-white transition-all' : 'px-4 py-2 text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white transition-all';
            document.getElementById('btn-innings-2').className = m.cricketData.activeInnings === '2' ? 'px-4 py-2 text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white transition-all' : 'px-4 py-2 text-[10px] font-black uppercase tracking-wider text-gray-500 hover:text-white transition-all';
        });
    });

    // --- Cricket Ball Buttons ---
    document.querySelectorAll('.cricket-ball-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (activeLiveMatchIndex === null) return;
            handleCricketBall(btn.dataset.val);
        });
    });

    // --- Swap Strike Button ---
    document.getElementById('btn-swap-strike')?.addEventListener('click', () => {
        batsman1IsStriker = !batsman1IsStriker;
        updateBatsmanStrikeUI();
    });

    // --- Undo Last Ball ---
    document.getElementById('btn-undo-ball')?.addEventListener('click', () => {
        if (ballHistory.length === 0) {
            Swal.fire({ title: 'Nothing to undo', icon: 'info', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
            return;
        }
        const prev = ballHistory.pop();
        currentScoreA       = prev.scoreA;
        currentWickets      = prev.wickets;
        currentOvers        = prev.overs;
        currentBalls        = prev.balls;
        batsman1IsStriker   = prev.striker;
        batsman1Runs        = prev.b1runs;
        batsman1BallsFaced  = prev.b1balls;
        batsman2Runs        = prev.b2runs;
        batsman2BallsFaced  = prev.b2balls;
        bowlerStats         = prev.bowlerStats;
        battingCard         = JSON.parse(JSON.stringify(prev.battingCard));
        overBallLog         = JSON.parse(JSON.stringify(prev.overBallLog));
        allOversLog         = JSON.parse(JSON.stringify(prev.allOversLog));
        isFreeHit           = prev.isFreeHit || false;
        updateCricketUI();
        const s = getState();
        s.matches[activeLiveMatchIndex].score = `${currentScoreA}/${currentWickets} (${currentOvers}.${currentBalls})`;
        saveStateSilent(s);
    });

    // --- Generic Live Score Buttons (for non-cricket sports) ---
    document.querySelectorAll('.live-score-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (activeLiveMatchIndex === null) return;
            const target = btn.dataset.target;
            const action = btn.dataset.action;
            if (target === 'A') {
                if (action === 'increment') currentScoreA++;
                if (action === 'decrement' && currentScoreA > 0) currentScoreA--;
                document.getElementById('live-score-teamA').textContent = currentScoreA;
            } else {
                if (action === 'increment') currentScoreB++;
                if (action === 'decrement' && currentScoreB > 0) currentScoreB--;
                document.getElementById('live-score-teamB').textContent = currentScoreB;
            }
            const s = getState();
            if (s.matches && s.matches[activeLiveMatchIndex]) {
                s.matches[activeLiveMatchIndex].score = `${currentScoreA} - ${currentScoreB}`;
                saveStateSilent(s);
            }
        });
    });

    // --- Complete Match Logic ---
    const btnComplete = document.getElementById('btn-complete-live-match');
    if (btnComplete) {
        btnComplete.addEventListener('click', () => {
            if (activeLiveMatchIndex === null) return;
            const s = getState();
            const m = s.matches[activeLiveMatchIndex];
            const winnerSelect = document.getElementById('live-winner-select').value;
            let finalWinner = '';
            if (winnerSelect === 'auto') {
                if (currentScoreA > currentScoreB) finalWinner = m.team1;
                else if (currentScoreB > currentScoreA) finalWinner = m.team2;
                else finalWinner = 'Draw';
            } else {
                finalWinner = winnerSelect;
            }
            // For non-cricket, store the simple A-B score; cricket already stores its own
            if (m.sport !== 'Cricket') {
                m.score = `${currentScoreA} - ${currentScoreB}`;
            }
            m.winner = finalWinner;
            saveState(s);
            Swal.fire({ title: 'Match Finished!', text: `Winner: ${finalWinner}`, icon: 'success' });
            activeLiveMatchIndex = null;
            renderAdminMatches();
            document.getElementById('live-scoreboard-panel').classList.add('hidden');
            document.getElementById('live-empty-state').classList.remove('hidden');
        });
    }
}

window.activateLiveMatch = async (idx) => {
    const s = getState();
    const m = s.matches[idx];
    if (!m) return;

    activeLiveMatchIndex = idx;
    const isCricket = m.sport === 'Cricket';
    if (!m.cricketData) m.cricketData = {};
    const cd = m.cricketData;

    // Startup Wizard for Cricket Matches
    if (isCricket) {
        // Step 1-3: Toss & Teams (Only if not already set)
        if (!cd.tossWinner) {
            // Team confirmation
            const { value: formTeams } = await Swal.fire({
                title: 'Match Setup (1/5)',
                text: 'Confirm Team Names',
                html: `
                    <select id="swal-t1" class="swal2-select" style="display:flex; margin: 10px auto; max-width: 80%;">
                        <option value="" disabled ${!m.team1 ? 'selected' : ''}>Select Team 1</option>
                        ${s.teams.map(t => `<option value="${t.name}" ${m.team1 === t.name ? 'selected' : ''}>${t.name}</option>`).join('')}
                    </select>
                    <select id="swal-t2" class="swal2-select" style="display:flex; margin: 10px auto; max-width: 80%;">
                        <option value="" disabled ${!m.team2 ? 'selected' : ''}>Select Team 2</option>
                        ${s.teams.map(t => `<option value="${t.name}" ${m.team2 === t.name ? 'selected' : ''}>${t.name}</option>`).join('')}
                    </select>
                `,
                focusConfirm: false,
                allowOutsideClick: false,
                preConfirm: () => {
                    const t1 = document.getElementById('swal-t1').value;
                    const t2 = document.getElementById('swal-t2').value;
                    if (!t1 || !t2) Swal.showValidationMessage('Both teams must be selected');
                    return { t1, t2 };
                }
            });
            m.team1 = formTeams.t1;
            m.team2 = formTeams.t2;

            const { value: tossWin } = await Swal.fire({
                title: 'Match Setup (2/5)',
                text: 'Who won the toss?',
                input: 'select',
                inputOptions: { [m.team1]: m.team1, [m.team2]: m.team2 },
                allowOutsideClick: false,
                inputValidator: (val) => !val ? 'Select toss winner!' : null
            });
            cd.tossWinner = tossWin;

            const { value: tossDec } = await Swal.fire({
                title: 'Match Setup (3/5)',
                text: `What did ${tossWin} choose to do?`,
                input: 'select',
                inputOptions: { 'Bat': 'Bat', 'Bowl': 'Bowl' },
                allowOutsideClick: false,
                inputValidator: (val) => !val ? 'Select decision!' : null
            });
            cd.tossDecision = tossDec;
            cd.battingTeam = tossDec === 'Bat' ? tossWin : (tossWin === m.team1 ? m.team2 : m.team1);
            cd.activeInnings = '1';
        }

        // Steps 4-5: Players (Prompt if missing, e.g. start of match or new innings)
        if (!cd.batsman1 || !cd.bowler) {
            const { value: formBatsmen } = await Swal.fire({
                title: 'Opening Batsmen',
                html: `
                    <input id="swal-b1" class="swal2-input" placeholder="Striker Name">
                    <input id="swal-b2" class="swal2-input" placeholder="Non-Striker Name">
                `,
                focusConfirm: false,
                allowOutsideClick: false,
                preConfirm: () => {
                    const b1 = document.getElementById('swal-b1').value.trim();
                    const b2 = document.getElementById('swal-b2').value.trim();
                    if (!b1 || !b2) Swal.showValidationMessage('Both names are required');
                    return { b1, b2 };
                }
            });
            cd.batsman1 = formBatsmen.b1;
            cd.batsman2 = formBatsmen.b2;
            if (!cd.battingCard) cd.battingCard = [];
            cd.battingCard.push({ name: cd.batsman1, runs: 0, balls: 0, out: false });
            cd.battingCard.push({ name: cd.batsman2, runs: 0, balls: 0, out: false });

            const { value: bName } = await Swal.fire({
                title: 'Opening Bowler',
                text: 'Enter bowler name:',
                input: 'text',
                allowOutsideClick: false,
                inputValidator: (val) => !val ? 'Name is required' : null
            });
            cd.bowler = bName;
            if (!cd.bowlerStats) cd.bowlerStats = {};
            if (!cd.bowlerStats[bName]) cd.bowlerStats[bName] = { balls: 0, runs: 0, wickets: 0 };
        }
        saveState(s);
    }

    // Toggle Panels
    const genericUI = document.getElementById('generic-scoreboard');
    const cricketUI = document.getElementById('cricket-scoreboard');
    if (genericUI) genericUI.classList.toggle('hidden', isCricket);
    if (cricketUI) cricketUI.classList.toggle('hidden', !isCricket);

    // Initial Scoring Logic
    currentScoreA = 0; currentScoreB = 0;
    currentWickets = 0; currentOvers = 0; currentBalls = 0;
    batsman1IsStriker = true;
    batsman1Runs = 0; batsman1BallsFaced = 0;
    batsman2Runs = 0; batsman2BallsFaced = 0;
    bowlerStats = {};
    battingCard = [];
    overBallLog = [];
    allOversLog = [];
    isFreeHit = false;
    ballHistory = [];

    // Restore Match State
    if (m.score) {
        if (isCricket) {
            const mt = m.score.match(/(\d+)\/(\d+)\s*\((\d+)\.(\d+)\)/);
            if (mt) {
                currentScoreA = parseInt(mt[1]) || 0;
                currentWickets = parseInt(mt[2]) || 0;
                currentOvers = parseInt(mt[3]) || 0;
                currentBalls = parseInt(mt[4]) || 0;
            }
        } else {
            const parts = m.score.split('-');
            if (parts.length === 2) {
                currentScoreA = parseInt(parts[0].trim()) || 0;
                currentScoreB = parseInt(parts[1].trim()) || 0;
            }
        }
    }

    if (isCricket) {
        // Correct naming sync
        batsman1Runs       = cd.currentScoreA !== undefined ? (cd.batsman1Runs || 0) : (cd.b1runs || 0);
        batsman1BallsFaced = cd.currentScoreA !== undefined ? (cd.batsman1Balls || 0) : (cd.b1balls || 0);
        batsman2Runs       = cd.currentScoreA !== undefined ? (cd.batsman2Runs || 0) : (cd.b2runs || 0);
        batsman2BallsFaced = cd.currentScoreA !== undefined ? (cd.batsman2Balls || 0) : (cd.b2balls || 0);
        batsman1IsStriker  = cd.batsman1IsStriker !== false;
        
        bowlerStats = cd.bowlerStats || {};
        battingCard = cd.battingCard || [];
        overBallLog = cd.overBallLog || [];
        allOversLog = cd.allOversLog || [];
        isFreeHit   = cd.isFreeHit || false;

        // Target UI
        const tCon = document.getElementById('cricket-target-container');
        const tVal = document.getElementById('cricket-target-val');
        if (cd.activeInnings === '2' && cd.targetScore) {
            if (tCon && tVal) {
                tCon.classList.remove('hidden');
                tVal.textContent = cd.targetScore;
            }
        } else {
            tCon?.classList.add('hidden');
        }

        // Max Overs
        maxOversLimit = (m.stage === 'Final') ? 10 : 8;
        const maxOversEl = document.getElementById('cricket-max-overs');
        if (maxOversEl) maxOversEl.textContent = `/ ${maxOversLimit}`;

        // Inputs
        document.getElementById('cricket-batsman1').value = cd.batsman1 || '';
        document.getElementById('cricket-batsman2').value = cd.batsman2 || '';
        document.getElementById('cricket-bowler').value   = cd.bowler || '';
        
        const battingSelect = document.getElementById('cricket-batting-team');
        if (battingSelect) {
            battingSelect.innerHTML = `<option value="">Select Team</option><option value="${m.team1}">${m.team1}</option><option value="${m.team2}">${m.team2}</option>`;
            battingSelect.value = cd.battingTeam || '';
        }

        const tossSelect = document.getElementById('cricket-toss-winner');
        if (tossSelect) {
            tossSelect.innerHTML = `<option value="">Select</option><option value="${m.team1}">${m.team1}</option><option value="${m.team2}">${m.team2}</option>`;
            tossSelect.value = cd.tossWinner || '';
        }
        const decisionSelect = document.getElementById('cricket-toss-decision');
        if (decisionSelect) decisionSelect.value = cd.tossDecision || '';

        // Innings Toggle
        const activeInn = cd.activeInnings || '1';
        const b1 = document.getElementById('btn-innings-1');
        const b2 = document.getElementById('btn-innings-2');
        if (b1) b1.className = activeInn === '2' ? 'px-4 py-2 text-[10px] font-black uppercase tracking-wider text-gray-500 hover:text-white transition-all' : 'px-4 py-2 text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white transition-all';
        if (b2) b2.className = activeInn === '2' ? 'px-4 py-2 text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white transition-all' : 'px-4 py-2 text-[10px] font-black uppercase tracking-wider text-gray-500 hover:text-white transition-all';

        updateCricketUI();
    } else {
        document.getElementById('live-score-teamA').textContent = currentScoreA;
        document.getElementById('live-score-teamB').textContent = currentScoreB;
    }

    // Common Text
    document.getElementById('live-sport-badge').textContent   = `${m.sport} • ${m.stage}`;
    document.getElementById('live-match-details').textContent = m.details || 'No Extra Details';
    document.getElementById('live-teamA-name').textContent    = m.team1;
    document.getElementById('live-teamB-name').textContent    = m.team2;

    const liveWinnerSelect = document.getElementById('live-winner-select');
    if (liveWinnerSelect) {
        liveWinnerSelect.innerHTML = `
            <option value="auto">Auto (Higher score)</option>
            <option value="Draw">Draw Match</option>
            <option value="${m.team1}">${m.team1}</option>
            <option value="${m.team2}">${m.team2}</option>
        `;
    }

    document.getElementById('live-scoreboard-panel').classList.remove('hidden');
    document.getElementById('live-empty-state').classList.add('hidden');
};

function updateCricketUI() {
    document.getElementById('cricket-live-score').textContent    = currentScoreA;
    document.getElementById('cricket-live-wickets').textContent  = currentWickets;
    document.getElementById('cricket-current-over').textContent  = `${currentOvers}.${currentBalls}`;
    const liveOverInline = document.getElementById('cricket-live-over-inline');
    if (liveOverInline) liveOverInline.textContent = `${currentOvers}.${currentBalls}`;
    document.getElementById('batsman1-runs').textContent  = batsman1Runs;
    document.getElementById('batsman1-balls').textContent = batsman1BallsFaced;
    document.getElementById('batsman2-runs').textContent  = batsman2Runs;
    document.getElementById('batsman2-balls').textContent = batsman2BallsFaced;
    updateBatsmanStrikeUI();
    renderBowlerStats();
    renderBattingStats();
    renderOverTracker();
}

function renderOverTracker() {
    const container = document.getElementById('over-ball-circles');
    const prevList  = document.getElementById('prev-overs-list');
    const overNum   = document.getElementById('over-tracker-num');
    const bowlerLbl = document.getElementById('over-tracker-bowler');
    const fhBadge   = document.getElementById('free-hit-badge');
    if (!container) return;

    // Current over number
    if (overNum)   overNum.textContent = currentOvers + 1;
    if (bowlerLbl) bowlerLbl.textContent = document.getElementById('cricket-bowler')?.value || '';
    if (fhBadge)   fhBadge.classList.toggle('hidden', !isFreeHit);

    // Color map for ball types
    const colorMap = {
        'dot':    'bg-gray-600 border-gray-500 text-gray-200',
        'run':    'bg-emerald-600 border-emerald-400 text-white',
        'four':   'bg-blue-600 border-blue-400 text-white',
        'six':    'bg-purple-600 border-purple-400 text-white',
        'wide':   'bg-orange-500 border-orange-400 text-white',
        'nb':     'bg-orange-500 border-orange-400 text-white',
        'wicket': 'bg-red-600 border-red-400 text-white',
    };

    // Render current over circles
    let html = '';
    const legalBallsBowled = overBallLog.filter(b => b.type !== 'wide' && b.type !== 'nb').length;
    const totalSlotsToShow = overBallLog.length + Math.max(0, 6 - legalBallsBowled);
    
    for (let i = 0; i < totalSlotsToShow; i++) {
        if (i < overBallLog.length) {
            const b = overBallLog[i];
            const cls = colorMap[b.type] || colorMap['run'];
            html += `<div class="w-10 h-10 rounded-full border-2 ${cls} flex items-center justify-center text-[10px] font-black shadow-lg transition-all animate-[scale-in_0.2s_ease-out]">${b.label}</div>`;
        } else {
            html += `<div class="w-10 h-10 rounded-full border-2 border-white/10 bg-transparent"></div>`;
        }
    }
    container.innerHTML = html;

    // Render previous overs
    if (prevList) {
        if (allOversLog.length === 0) {
            prevList.innerHTML = '';
        } else {
            let prevHtml = '';
            for (let oi = allOversLog.length - 1; oi >= Math.max(0, allOversLog.length - 5); oi--) {
                const ov = allOversLog[oi];
                let ballsHtml = '';
                for (const b of ov.balls) {
                    const cls = colorMap[b.type] || colorMap['run'];
                    ballsHtml += `<div class="w-6 h-6 rounded-full border ${cls} flex items-center justify-center text-[9px] font-bold">${b.label}</div>`;
                }
                const totalRuns = ov.balls.reduce((s, b) => s + (b.runs || 0), 0);
                prevHtml += `
                    <div class="flex items-center gap-2 bg-white/3 rounded-lg px-3 py-1.5">
                        <span class="text-[9px] font-bold text-gray-500 shrink-0 w-16">Ov ${oi + 1}</span>
                        <div class="flex gap-1 flex-1">${ballsHtml}</div>
                        <span class="text-[10px] font-black text-gray-300 shrink-0">${totalRuns}r</span>
                    </div>
                `;
            }
            prevList.innerHTML = prevHtml;
        }
    }
}

function renderBattingStats() {
    const list = document.getElementById('batting-stats-body');
    if (!list) return;
    if (battingCard.length === 0) {
        list.innerHTML = '<div class="px-4 py-3 text-center text-[10px] text-gray-600 font-bold uppercase tracking-widest">No batsmen yet</div>';
        return;
    }
    let html = '';
    for (const b of battingCard) {
        const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(0) : '-';
        const statusColor = b.out ? 'text-red-400' : 'text-emerald-400';
        const statusDot   = b.out
            ? `<span class="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mr-1"></span>`
            : `<span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1"></span>`;
        html += `
            <div class="grid grid-cols-4 px-4 py-2 text-xs font-bold ${statusColor}">
                <span class="text-white truncate pr-2 flex items-center">${statusDot}${b.name}</span>
                <span class="text-center font-mono">${b.runs}</span>
                <span class="text-center font-mono">${b.balls}</span>
                <span class="text-center font-mono text-gray-400">${sr}</span>
            </div>
        `;
    }
    list.innerHTML = html;
}

function renderBowlerStats() {
    const list = document.getElementById('bowler-stats-body');
    if (!list) return;
    
    if (Object.keys(bowlerStats).length === 0) {
        list.innerHTML = '<div class="px-4 py-3 text-center text-[10px] text-gray-600 font-bold uppercase tracking-widest">No bowlers yet</div>';
        return;
    }
    
    let html = '';
    for (const [name, stats] of Object.entries(bowlerStats)) {
        const o = Math.floor(stats.balls / 6);
        const b = stats.balls % 6;
        html += `
            <div class="grid grid-cols-4 px-4 py-2 text-xs font-bold text-gray-400">
                <span class="text-white truncate pr-2">${name}</span>
                <span class="text-center font-mono">${o}.${b}</span>
                <span class="text-center font-mono">${stats.runs}</span>
                <span class="text-center font-mono text-amber-500">${stats.wickets}</span>
            </div>
        `;
    }
    list.innerHTML = html;
}

function updateBatsmanStrikeUI() {
    const card1   = document.getElementById('batsman1-card');
    const card2   = document.getElementById('batsman2-card');
    const badge1  = document.getElementById('batsman1-strike-badge');
    const badge2  = document.getElementById('batsman2-strike-badge');
    if (!card1 || !card2) return;
    if (batsman1IsStriker) {
        card1.classList.add('border-blue-500/40', 'bg-blue-900/20'); card1.classList.remove('bg-white/5', 'border-white/10', 'opacity-70');
        card2.classList.add('bg-white/5', 'border-white/10', 'opacity-70'); card2.classList.remove('border-blue-500/40', 'bg-blue-900/20');
        badge1.classList.remove('hidden'); badge2.classList.add('hidden');
    } else {
        card2.classList.add('border-blue-500/40', 'bg-blue-900/20'); card2.classList.remove('bg-white/5', 'border-white/10', 'opacity-70');
        card1.classList.add('bg-white/5', 'border-white/10', 'opacity-70'); card1.classList.remove('border-blue-500/40', 'bg-blue-900/20');
        badge2.classList.remove('hidden'); badge1.classList.add('hidden');
    }
}

async function handleCricketBall(val) {
    if (activeLiveMatchIndex === null) return;
    if (currentOvers >= maxOversLimit) {
        Swal.fire('Overs Complete', `Maximum ${maxOversLimit} overs reached!`, 'warning');
        return;
    }

    // Helper: sync battingCard entry for current batsmen
    const syncBattingCard = () => {
        const b1name = (document.getElementById('cricket-batsman1')?.value || '').trim();
        const b2name = (document.getElementById('cricket-batsman2')?.value || '').trim();
        const update = (name, runs, balls) => {
            if (!name) return;
            const idx = battingCard.findIndex(e => e.name === name && !e.out);
            if (idx >= 0) { battingCard[idx].runs = runs; battingCard[idx].balls = balls; }
            else battingCard.push({ name, runs, balls, out: false });
        };
        update(b1name, batsman1Runs, batsman1BallsFaced);
        update(b2name, batsman2Runs, batsman2BallsFaced);
    };

    // Save snapshot for undo
    syncBattingCard();
    ballHistory.push({
        scoreA: currentScoreA, wickets: currentWickets,
        overs: currentOvers,   balls: currentBalls,
        striker: batsman1IsStriker,
        b1runs: batsman1Runs, b1balls: batsman1BallsFaced,
        b2runs: batsman2Runs, b2balls: batsman2BallsFaced,
        bowlerStats: JSON.parse(JSON.stringify(bowlerStats)),
        battingCard:  JSON.parse(JSON.stringify(battingCard)),
        overBallLog:  JSON.parse(JSON.stringify(overBallLog)),
        allOversLog:  JSON.parse(JSON.stringify(allOversLog)),
        isFreeHit:    isFreeHit
    });

    const isWide   = (val === 'wd');
    const isNoBall = (val === 'nb');
    const isWicket = (val === 'w');
    const isBye    = (val === 'bye');
    const isExtra  = isWide || isNoBall || isBye;

    let runsThisBall = 0;
    
    // Get current bowler
    const bowlerInput = document.getElementById('cricket-bowler');
    const bowlerName = bowlerInput ? (bowlerInput.value.trim() || 'Unknown Bowler') : 'Unknown Bowler';
    if (!bowlerStats[bowlerName]) {
        bowlerStats[bowlerName] = { balls: 0, runs: 0, wickets: 0 };
    }

    let overCompleted = false;

    if (isNoBall) {
        // No Ball: +1 penalty always; then ask for runs off the bat
        let nbValue = '0';
        const { value: selectedRun } = await Swal.fire({
            title: 'No Ball — Runs off the bat?',
            html: `<div id="nb-run-btns" style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:10px">
                ${[0,1,2,3,4,6].map(r => `<button class="swal2-confirm swal2-styled" style="min-width:44px;font-size:1.1rem;padding:6px 10px; margin: 0;" data-r="${r}">${r}</button>`).join('')}
            </div>`,
            showConfirmButton: false,
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            didOpen: () => {
                const container = document.getElementById('nb-run-btns');
                container.onclick = (e) => {
                    const btn = e.target.closest('[data-r]');
                    if (btn) {
                        nbValue = btn.dataset.r;
                        Swal.clickConfirm();
                    }
                };
            },
            preConfirm: () => nbValue
        });

        if (selectedRun === undefined) { ballHistory.pop(); return; }
        const selected = parseInt(selectedRun) || 0;
        runsThisBall = 1 + selected;
        // No ball: ball not counted, but striker gets credit for their runs
        const batRuns = selected;
        if (batsman1IsStriker) { batsman1Runs += batRuns; }
        else { batsman2Runs += batRuns; }
        // Auto-swap if odd bat runs
        if (batRuns % 2 === 1) batsman1IsStriker = !batsman1IsStriker;

        // Set Free Hit for NEXT ball
        isFreeHit = true;

    } else if (isWide) {
        runsThisBall = 1;
        // Wide: no runs to batsman, ball not counted
    } else if (isBye) {
        let byeValue = '1';
        const { value: selectedRun } = await Swal.fire({
            title: 'Byes?',
            html: `<div id="bye-run-btns" style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:10px">
                ${[1,2,3,4].map(r => `<button class="swal2-confirm swal2-styled" style="min-width:44px;font-size:1.1rem;padding:6px 10px; margin: 0;" data-r="${r}">${r}</button>`).join('')}
            </div>`,
            showConfirmButton: false,
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            didOpen: () => {
                const container = document.getElementById('bye-run-btns');
                container.onclick = (e) => {
                    const btn = e.target.closest('[data-r]');
                    if (btn) {
                        byeValue = btn.dataset.r;
                        Swal.clickConfirm();
                    }
                };
            },
            preConfirm: () => byeValue
        });

        if (selectedRun === undefined) { ballHistory.pop(); return; }
        const selected = parseInt(selectedRun) || 1;
        runsThisBall = selected; // No +1 penalty for byes, standard cricket rules
        
        // Count ball for batsman but NOT runs
        if (batsman1IsStriker) batsman1BallsFaced++;
        else batsman2BallsFaced++;
        
        currentBalls++;
        // Legal delivery (Bye) clears Free Hit
        isFreeHit = false;

        if (currentBalls >= 6) {
            currentOvers++; currentBalls = 0; batsman1IsStriker = !batsman1IsStriker; overCompleted = true;
        } else if (selected % 2 === 1) { // swap strike on odd byes
            batsman1IsStriker = !batsman1IsStriker;
        }
    } else if (isWicket) {
        runsThisBall = 0;
        currentWickets++;
        
        // Legal delivery (even a wicket) usually clears Free Hit unless it was a wide/NB wicket... but here val='w' is normal wicket
        isFreeHit = false;

        let newBatsmanName = '';
        const { value: batName } = await Swal.fire({
            title: 'Wicket!',
            text: 'Enter new batsman name:',
            input: 'text',
            icon: 'error',
            allowOutsideClick: false,
            inputValidator: (value) => !value ? 'You need to write a name!' : null
        });
        if (batName) newBatsmanName = batName;

        // Mark dismissed batsman as Out in batting card
        if (batsman1IsStriker) {
            batsman1BallsFaced++; // final ball faced
            const dName = (document.getElementById('cricket-batsman1')?.value || '').trim();
            const dIdx = battingCard.findIndex(e => e.name === dName && !e.out);
            if (dIdx >= 0) { battingCard[dIdx].runs = batsman1Runs; battingCard[dIdx].balls = batsman1BallsFaced; battingCard[dIdx].out = true; }
            // New batsman in
            document.getElementById('cricket-batsman1').value = newBatsmanName;
            batsman1Runs = 0; batsman1BallsFaced = 0;
            if (newBatsmanName) battingCard.push({ name: newBatsmanName, runs: 0, balls: 0, out: false });
        } else {
            batsman2BallsFaced++;
            const dName = (document.getElementById('cricket-batsman2')?.value || '').trim();
            const dIdx = battingCard.findIndex(e => e.name === dName && !e.out);
            if (dIdx >= 0) { battingCard[dIdx].runs = batsman2Runs; battingCard[dIdx].balls = batsman2BallsFaced; battingCard[dIdx].out = true; }
            document.getElementById('cricket-batsman2').value = newBatsmanName;
            batsman2Runs = 0; batsman2BallsFaced = 0;
            if (newBatsmanName) battingCard.push({ name: newBatsmanName, runs: 0, balls: 0, out: false });
        }
        
        currentBalls++;
        if (currentBalls >= 6) { currentOvers++; currentBalls = 0; batsman1IsStriker = !batsman1IsStriker; overCompleted = true; }
    } else {
        // Normal delivery
        runsThisBall = parseInt(val) || 0;
        if (batsman1IsStriker) {
            batsman1Runs += runsThisBall;
            batsman1BallsFaced++;
        } else {
            batsman2Runs += runsThisBall;
            batsman2BallsFaced++;
        }
        currentBalls++;
        
        // Legal delivery clears Free Hit
        isFreeHit = false;

        if (currentBalls >= 6) {
            currentOvers++; currentBalls = 0;
            // End of over: swap strike
            batsman1IsStriker = !batsman1IsStriker;
            overCompleted = true;
        } else if (runsThisBall % 2 === 1) {
            // Odd runs mid-over: swap strike
            batsman1IsStriker = !batsman1IsStriker;
        }
    }

    // Update bowler stats
    if (!isBye) bowlerStats[bowlerName].runs += runsThisBall;
    if (isWicket) bowlerStats[bowlerName].wickets++;
    if (!isWide && !isNoBall) bowlerStats[bowlerName].balls++;

    // Track ball in over log (colored circles)
    let ballType = 'run';
    let ballLabel = String(runsThisBall);
    if (isWicket)       { ballType = 'wicket'; ballLabel = 'W'; }
    else if (isWide)    { ballType = 'wide';   ballLabel = 'Wd'; }
    else if (isNoBall)  { 
        ballType = 'nb'; 
        const batR = runsThisBall - 1;
        ballLabel = batR > 0 ? `NB+${batR}` : 'NB'; 
    }
    else if (isBye)     { 
        ballType = 'dot'; 
        ballLabel = `${runsThisBall}B`; 
    }
    else if (runsThisBall === 0) { ballType = 'dot'; ballLabel = '•'; }
    else if (runsThisBall === 4) { ballType = 'four'; }
    else if (runsThisBall === 6) { ballType = 'six'; }
    overBallLog.push({ label: ballLabel, type: ballType, runs: runsThisBall });

    // If over completed, archive current over and reset
    if (overCompleted) {
        allOversLog.push({ bowler: bowlerName, balls: [...overBallLog] });
        overBallLog = [];
    }

    // Add runs to team total (except wickets)
    if (!isWicket) currentScoreA += runsThisBall;

    // Final sync of batsman card before UI update and save
    syncBattingCard();

    // Persist to Firebase (also saves batsman & bowler data)
    const s = getState();
    const m = s.matches[activeLiveMatchIndex];
    if (!m.cricketData) m.cricketData = {};
    
    m.cricketData.currentScoreA = currentScoreA;
    m.cricketData.currentWickets = currentWickets;
    m.cricketData.currentOvers  = currentOvers;
    m.cricketData.currentBalls  = currentBalls;
    m.cricketData.batsman1IsStriker = batsman1IsStriker;
    m.cricketData.batsman1Runs  = batsman1Runs;
    m.cricketData.batsman1Balls = batsman1BallsFaced;
    m.cricketData.batsman2Runs  = batsman2Runs;
    m.cricketData.batsman2Balls = batsman2BallsFaced;
    m.cricketData.bowlerStats = bowlerStats;
    syncBattingCard(); // ensure latest live values are written before save
    m.cricketData.battingCard = battingCard;
    m.cricketData.overBallLog = overBallLog;
    m.cricketData.allOversLog = allOversLog;
    m.cricketData.isFreeHit   = isFreeHit;
    // Also save the current values from the inputs to preserve the batsman swap
    m.cricketData.batsman1 = document.getElementById('cricket-batsman1').value;
    m.cricketData.batsman2 = document.getElementById('cricket-batsman2').value;
    m.cricketData.bowler = document.getElementById('cricket-bowler').value;
    saveStateSilent(s);
    
    // Final UI update
    updateCricketUI();
    
    // Check for Innings Over
    checkInningsOverConditions(m, overCompleted);
}

async function checkInningsOverConditions(match, overCompletedStatus) {
    const cd = match.cricketData;
    const isFirstInnings = (cd.activeInnings !== '2');
    const matchFinished = (cd.activeInnings === '2' && (currentScoreA >= cd.targetScore || (currentWickets >= 10 || (currentOvers >= maxOversLimit && currentBalls === 0))));

    if (isFirstInnings && (currentWickets >= 10 || (currentOvers >= maxOversLimit && currentBalls === 0))) {
        const target = currentScoreA + 1;
        const { isConfirmed } = await Swal.fire({
            title: '1st Innings Complete!',
            html: `<div class="text-center">
                <p class="text-xl font-bold text-emerald-500 mb-2">Score: ${currentScoreA}/${currentWickets}</p>
                <p class="text-lg font-black text-amber-500">Target: ${target} runs</p>
                <p class="mt-4 text-sm text-gray-400">Would you like to switch to the 2nd Innings and interchange roles?</p>
            </div>`,
            icon: 'success',
            showCancelButton: true,
            confirmButtonText: 'Start 2nd Innings',
            confirmButtonColor: '#10b981',
            cancelButtonText: 'Stay here',
            allowOutsideClick: false
        });

        if (isConfirmed) {
            handleInningsTransition(match, target);
        }
    } else if (matchFinished) {
        let winnerMsg = "";
        if (currentScoreA >= cd.targetScore) {
            winnerMsg = `${cd.battingTeam} won the match!`;
        } else {
            const bowlingTeam = (match.team1 === cd.battingTeam) ? match.team2 : match.team1;
            winnerMsg = `${bowlingTeam} won the match!`;
        }

        Swal.fire({
            title: 'Match Finished!',
            text: winnerMsg,
            icon: 'success',
            confirmButtonText: 'View Summary'
        });
    } else if (overCompletedStatus) {
        // Prompt for new bowler logic
        const { value: bowName } = await Swal.fire({
            title: 'End of Over',
            text: 'Enter next bowler name:',
            input: 'text',
            icon: 'info',
            allowOutsideClick: false,
            inputValidator: (value) => !value ? 'You need to write a name!' : null
        });
        if (bowName) {
            document.getElementById('cricket-bowler').value = bowName;
            match.cricketData.bowler = bowName;
            if (!bowlerStats[bowName]) {
                bowlerStats[bowName] = { balls: 0, runs: 0, wickets: 0 };
            }
            saveStateSilent(getState());
            updateCricketUI();
        }
    }
}

async function handleInningsTransition(match, target) {
    // Interchange Roles
    const oldBattingTeam = match.cricketData.battingTeam;
    const newBattingTeam = (match.team1 === oldBattingTeam) ? match.team2 : match.team1;
    
    // Update Firebase State
    const s = getState();
    const m = s.matches[activeLiveMatchIndex];
    
    m.cricketData.activeInnings = '2';
    m.cricketData.targetScore = target;
    m.cricketData.firstInningsScore = currentScoreA;
    m.cricketData.battingTeam = newBattingTeam;
    
    // Reset Counters
    m.cricketData.currentScoreA = 0;
    m.cricketData.currentWickets = 0;
    m.cricketData.currentOvers = 0;
    m.cricketData.currentBalls = 0;
    m.cricketData.isFreeHit = false;
    m.cricketData.overBallLog = [];
    m.cricketData.allOversLog = [];
    m.cricketData.bowlerStats = {};
    m.cricketData.battingCard = [];
    
    m.score = `0/0 (0.0)`;
    
    await saveState(s);
    
    Swal.fire({
        title: 'Roles Interchanged!',
        text: `${newBattingTeam} is now batting. Please set the new Opening Batsmen and Bowler.`,
        icon: 'info'
    }).then(() => {
        activateLiveMatch(activeLiveMatchIndex); // Re-init wizard for 2nd innings setup
    });
}

window.deleteMatch = (idx) => {
    Swal.fire({
        title: 'Delete Match?',
        text: "Remove this match from the schedule?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Delete'
    }).then((result) => {
        if (result.isConfirmed) {
            const s = getState();
            s.matches.splice(idx, 1);
            saveState(s);
        }
    });
};


// --- Download Overall Results Logic ---
window.downloadOverallResults = () => {
    const s = typeof getState === 'function' ? getState() : (window.getState ? window.getState() : null);
    if (!s || !s.teams) {
        Swal.fire('Error', 'No data available to download.', 'error');
        return;
    }

    const rankings = s.tournamentRankings || {};
    const POINT_TEMPLATE = {
        "Cricket": { "1st": 100, "2nd": 70, "3rd": 50 },
        "Badminton": { "1st": 70, "2nd": 50, "3rd": 30 },
        "Volleyball": { "1st": 70, "2nd": 50, "3rd": 30 },
        "Tug of War": { "1st": 40, "2nd": 25, "3rd": 15 }
    };

    // Calculate current RPL scores
    let teamScores = [];
    s.teams.forEach(t => {
        let stats = {
            name: t.name,
            cricket: '-',
            badminton: '-',
            volleyball: '-',
            tug: '-',
            total: 0
        };

        // Check rankings for each sport
        Object.keys(rankings).forEach(sport => {
            const res = rankings[sport];
            if (!res) return;
            
            let pos = '';
            if (res['1st'] === t.name) pos = '1st';
            else if (res['2nd'] === t.name) pos = '2nd';
            else if (res['3rd'] === t.name) pos = '3rd';

            if (pos) {
                const pts = (POINT_TEMPLATE[sport] && POINT_TEMPLATE[sport][pos]) ? POINT_TEMPLATE[sport][pos] : 0;
                stats.total += pts;
                
                if (sport === 'Cricket') stats.cricket = pos + ` (${pts})`;
                if (sport === 'Badminton') stats.badminton = pos + ` (${pts})`;
                if (sport === 'Volleyball') stats.volleyball = pos + ` (${pts})`;
                if (sport === 'Tug of War') stats.tug = pos + ` (${pts})`;
            }
        });

        teamScores.push(stats);
    });

    // Sort by total points
    teamScores.sort((a,b) => b.total - a.total);

    // Create CSV
    let csvContent = "Rank,Team Name,Total Points,Cricket,Badminton,Volleyball,Tug of War\n";

    teamScores.forEach((row, idx) => {
        const line = [
            idx + 1,
            `"${row.name}"`,
            row.total,
            `"${row.cricket}"`,
            `"${row.badminton}"`,
            `"${row.volleyball}"`,
            `"${row.tug}"`
        ].join(",");
        csvContent += line + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `RPL_2026_Overall_Standings_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    Swal.fire({ title: 'Success!', text: 'Tournament summary downloaded successfully.', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
};

// Add listener for the button added in HTML
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btn-download-overall-results');
    if (btn) {
        btn.addEventListener('click', () => window.downloadOverallResults());
    }
});
