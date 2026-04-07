const SESSION_KEY = "rpl_auth_session";

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupAuthListeners();
    initAdmin();
    // Re-render when state changes (e.g. from reset)
    window.addEventListener('stateUpdated', renderAdminData);
});

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
    const liveCtn = document.getElementById('live-player-card');
    const msgCtn = document.getElementById('no-player-msg');

    if (s.auctionState.isLive) {
        badge.textContent = "LIVE";
        badge.className = "px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-semibold border border-emerald-500/30";
        document.getElementById('btn-go-live').classList.add('opacity-50', 'cursor-not-allowed');
        document.getElementById('btn-pause').classList.remove('opacity-50', 'cursor-not-allowed');

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

            // Buttons are no longer disabled for the admin as per user request
            // but we still track status for internal logic
            const isWaiting = s.auctionState.status === "Waiting";
            
            // We only show the opacity effect on the projected card, 
            // but let's keep the admin display clear.
            liveCtn.classList.remove('opacity-60', 'pointer-events-none');

        } else {
            liveCtn.classList.add('hidden');
            msgCtn.classList.remove('hidden');
            msgCtn.textContent = "Auction Finished!";
        }
    } else {
        badge.textContent = "PAUSED";
        badge.className = "px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-sm font-semibold border border-yellow-500/30";
        document.getElementById('btn-go-live').classList.remove('opacity-50', 'cursor-not-allowed');
        document.getElementById('btn-pause').classList.add('opacity-50', 'cursor-not-allowed');
        liveCtn.classList.add('hidden');
        msgCtn.classList.remove('hidden');
        msgCtn.textContent = "Auction is paused. Click 'Go Live' to project.";
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
    const pCountEl = document.getElementById('player-count');
    if (pCountEl) pCountEl.textContent = `${s.players.length} Players`;
    
    const pTbody = document.getElementById('player-table-body');
    if (pTbody) {
        pTbody.innerHTML = '';
        s.players.forEach((p, idx) => {
            let statusBadge = `<span class="px-2 py-1 text-xs rounded bg-blue-500/20 text-blue-400">Waiting</span>`;
            if (p.status === "Selected") statusBadge = `<span class="px-2 py-1 text-xs rounded bg-emerald-500/20 text-emerald-400">Selected</span>`;
            if (p.status === "Not Selected") statusBadge = `<span class="px-2 py-1 text-xs rounded bg-red-500/20 text-red-400">Not Selected</span>`;

            const sports = Array.isArray(p.sport) ? p.sport : [p.sport];
            const sportTags = sports.map(s => `<span class="px-1.5 py-0.5 text-xs rounded bg-purple-500/20 text-purple-300 mr-1">${s}</span>`).join('');

            pTbody.innerHTML += `
                <tr class="${idx === s.auctionState.currentPlayerIndex && s.auctionState.isLive ? 'bg-gray-700' : 'bg-gray-800'} border-b border-gray-700">
                    <td class="px-4 py-3 font-semibold">${p.name}</td>
                    <td class="px-4 py-3 text-gray-400 text-xs">${sportTags} • ${p.gender}</td>
                    <td class="px-4 py-3">${p.basePrice}</td>
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
}

/**
 * Event Binding
 */
function setupEventListeners() {
    // Add Single Player
    document.getElementById('add-player-form').addEventListener('submit', (e) => {
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

    // Team Selection Event Delegation
    document.getElementById('bid-team-buttons').addEventListener('click', (e) => {
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

    // Excel Upload
    document.getElementById('btn-upload-excel').addEventListener('click', () => {
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

    // Add Team
    document.getElementById('btn-add-team').addEventListener('click', async () => {
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

    // Auction Controls
    document.getElementById('btn-go-live').addEventListener('click', () => {
        const s = getState();
        s.auctionState.isLive = true;

        // Find first player who is "Waiting" if current is already decided
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

    document.getElementById('btn-pause').addEventListener('click', () => {
        const s = getState();
        s.auctionState.isLive = false;
        saveState(s);
    });

    document.getElementById('btn-next').addEventListener('click', () => {
        const s = getState();
        if (s.auctionState.currentPlayerIndex < s.players.length - 1) {
            // Find next waiting player
            let found = false;
            for (let i = s.auctionState.currentPlayerIndex + 1; i < s.players.length; i++) {
                if (s.players[i].status === "Waiting") {
                    s.auctionState.currentPlayerIndex = i;
                    found = true;
                    break;
                }
            }
            if (!found) {
                // Just go next anyway if they want to review
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

    // Live Bid Preview: update when amount or team changes
    document.getElementById('bid-amount').addEventListener('input', (e) => {
        e.target.dataset.userEditing = 'true';
        updateBidPreview();
        
        // Push live bid to state for auction screen
        const s = getState();
        s.auctionState.currentBid = parseInt(e.target.value) || 0;
        saveState(s);
    });

    // Team selection is now handled by buttons in renderAdminData()
    // No need for 'change' listener on bid-team-select as it's gone

    // Quick Bid Buttons
    document.querySelectorAll('.btn-quick-bid').forEach(btn => {
        btn.addEventListener('click', () => {
            const bidInput = document.getElementById('bid-amount');
            const currentVal = parseInt(bidInput.value) || 0;
            const increment = parseInt(btn.dataset.amount) || 0;
            
            // Set amount and flag as user editing
            bidInput.value = currentVal + increment;
            bidInput.dataset.userEditing = 'true';
            updateBidPreview();

            // Push live bid/team to state for auction screen
            const s = getState();
            s.auctionState.currentBid = parseInt(bidInput.value);
            s.auctionState.leadingTeam = s.teams[s.auctionState.selectedTeamIndex]?.name || null;
            saveState(s);
        });
    });

    // Handle Bids
    document.getElementById('btn-sell').addEventListener('click', () => {
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

    document.getElementById('btn-unsold').addEventListener('click', () => {
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
