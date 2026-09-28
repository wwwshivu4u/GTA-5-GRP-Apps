/**
 * SAHP Companion - Core Application Controller
 * Optimized for local file:// and web server execution.
 * Full state persistence mirroring EMS Companion.
 */

(function () {
    'use strict';

    // -----------------------------------------------------
    // 1. CONSTANTS & DEFAULTS
    // -----------------------------------------------------
    const DEFAULT_DISCORD_SERVER_ID = '1035906370102370364';

    const DEFAULT_DISCORD_CHANNELS = {
        finelog: '1256874088140378154',        // #【🎟】fine-log
        arrestlogs: '1126042574168260679',     // #【👮⛓】arrest-logs
        confiscation: '1056669110211182612',   // #【⛔】confiscations-logs
        towing: '1052029071929909368',         // #【🚥】towing-logs
        radiocodes: '1255991443378409688',     // #【📝】radio-codes
        codea: '1154377770168754218',          // #【❌】code-a
        radarlogs: '1266676923514486874',      // #【🚔】radar-logs
        bodycam: '1357931144435466341',        // #bodycam / pov-logs
        interview: '1269769031460851794',      // #📝︱interview-logs
        hiring: '1372874164716699660',         // #📝︱hiring-proofs
        contracts: '1269769097529397299',      // #📃︱contract-logs
        bonus: '1169404214049509396'           // #【💲】bonus-system
    };

    const DEFAULT_SHIFT_RATES = {
        nightPatrol: 35000,
        nightHighway: 40000,
        nightDetective: 30000,
        dayPatrol: 20000,
        dayHighway: 25000,
        dayDetective: 15000,
        towingBounty: 5000,
        arrestBounty: 10000
    };

    const ALL_DUTY_STEPS = [
        'od1', 'od2', 'od3',
        'ref1', 'ref2',
        'sav1', 'sav2',
        'off1', 'off2', 'off3',
        'sw1_1', 'sw1_2', 'sw1_3', 'sw1_4', 'sw1_5',
        'sw2_1', 'sw2_2', 'sw2_3', 'sw2_4', 'sw2_5',
        'sw3_1', 'sw3_2', 'sw3_3', 'sw3_4', 'sw3_5'
    ];

    const STEP_DEPENDENCIES = [
        ['od1', 'od2'], ['od2', 'od3'],
        ['ref1', 'ref2'],
        ['sav1', 'sav2'],
        ['off1', 'off2'], ['off2', 'off3'],
        ['sw1_1', 'sw1_2'], ['sw1_2', 'sw1_3'], ['sw1_3', 'sw1_4'], ['sw1_4', 'sw1_5'],
        ['sw2_1', 'sw2_2'], ['sw2_2', 'sw2_3'], ['sw2_3', 'sw2_4'], ['sw2_4', 'sw2_5'],
        ['sw3_1', 'sw3_2'], ['sw3_2', 'sw3_3'], ['sw3_3', 'sw3_4'], ['sw3_4', 'sw3_5']
    ];

    // -----------------------------------------------------
    // 2. STATE MANAGER (EMS Companion Pattern)
    // -----------------------------------------------------
    const STORAGE_KEY = 'sahp_companion_state_v1';
    const FALLBACK_STORAGE_KEY = 'sahpSettings';
    const LEGACY_STORAGE_KEY = 'lspd_companion_state_v1';
    const DEFAULTS_STORAGE_KEY = 'sahp_companion_user_defaults_v1';

    const BOTTOM_NAV_SERVICES = [
        { id: 'penal', icon: '<span class="material-symbols-outlined icon-gradient-gold">gavel</span>', text: 'PENAL<br>CODES', smallText: 'PENAL<br>CODES', modal: 'modal-penal' },
        { id: 'arrest', icon: '<span class="material-symbols-outlined icon-gradient-rose">timer</span>', text: 'ARREST<br>ENGINE', smallText: 'ARREST<br>ENGINE', modal: 'modal-arrest' },
        { id: 'traffic', icon: '<span class="material-symbols-outlined icon-gradient-cyan">directions_car</span>', text: 'TRAFFIC<br>CODES', smallText: 'TRAFFIC<br>CODES', modal: 'modal-traffic' },
        { id: 'dresscodes', icon: '<span class="material-symbols-outlined icon-gradient-purple">checkroom</span>', text: 'DRESS<br>CODES', smallText: 'DRESS<br>CODES', modal: 'modal-dresscodes' },
        { id: 'rp', icon: '<span class="material-symbols-outlined icon-gradient-emerald">psychology</span>', text: 'ROLEPLAY<br>&amp; SOPS', smallText: 'ROLEPLAY<br>&amp; SOPS', modal: 'modal-roleplay' },
        { id: 'article7', icon: '<span class="material-symbols-outlined icon-gradient-amber">local_parking</span>', text: 'ARTICLE 7<br>PARKING', smallText: 'ARTICLE 7<br>PARKING', modal: 'modal-article7' },
        { id: 'prohibited', icon: '<span class="material-symbols-outlined icon-gradient-rose">block</span>', text: 'PROHIBITED<br>ITEMS', smallText: 'PROHIBITED<br>ITEMS', modal: 'modal-prohibited' },
        { id: 'notes', icon: '<span class="material-symbols-outlined icon-gradient-amber">edit_note</span>', text: 'FIELD<br>NOTEPAD', smallText: 'FIELD<br>NOTEPAD', modal: 'modal-notes' },
        { id: 'settings', icon: '<span class="material-symbols-outlined icon-gradient-slate">settings</span>', text: 'SETTINGS<br>&amp; CONFIG', smallText: 'SETTINGS', modal: 'modal-settings' }
    ];

    class StateManager {
        constructor() {
            this.state = this.getDefaultState();
        }

        getDefaultState() {
            const dutySteps = {};
            ALL_DUTY_STEPS.forEach(step => {
                dutySteps[step] = false;
            });

            return {
                showBootScreen: true,
                soundEnabled: true,
                officerName: '',
                badgeNum: '',
                jobType: 'Highway Patrol',
                discordServerId: DEFAULT_DISCORD_SERVER_ID,
                discordChannels: { ...DEFAULT_DISCORD_CHANNELS },
                shiftRates: { ...DEFAULT_SHIFT_RATES },
                dutySteps,
                isOnDuty: false,
                dutyStartTime: null,
                selectedLocation: 'Patrol (Highway / Paleto)',
                quickNotes: '',
                selectedCharges: [],
                selectedTrafficCharges: [],
                arrestsLogged: 0,
                towsLogged: 0,
                customCommands: {},
                userDefaults: {}
            };
        }

        load() {
            try {
                let saved = localStorage.getItem(STORAGE_KEY);
                if (!saved) {
                    saved = localStorage.getItem(FALLBACK_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY) || localStorage.getItem('lspdSettings');
                }

                if (saved) {
                    const parsed = JSON.parse(saved);
                    this.state = {
                        ...this.getDefaultState(),
                        ...parsed,
                        discordChannels: {
                            ...DEFAULT_DISCORD_CHANNELS,
                            ...(parsed.discordChannels || {})
                        },
                        shiftRates: {
                            ...DEFAULT_SHIFT_RATES,
                            ...(parsed.shiftRates || {})
                        },
                        dutySteps: {
                            ...this.getDefaultState().dutySteps,
                            ...(parsed.dutySteps || {})
                        }
                    };
                }

                // Dedicated persistent duty state recovery
                const explicitDuty = localStorage.getItem('sahp_is_on_duty');
                if (explicitDuty !== null) {
                    this.state.isOnDuty = explicitDuty === '1';
                    if (!this.state.isOnDuty) {
                        this.state.dutyStartTime = null;
                    }
                } else if (this.state.dutyStartTime) {
                    this.state.isOnDuty = true;
                }
            } catch (err) {
                console.error('Failed to load state from localStorage:', err);
                this.state = this.getDefaultState();
            }
            return this.state;
        }

        save() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
                localStorage.setItem('sahp_is_on_duty', this.state.isOnDuty ? '1' : '0');
                if (this.state.dutyStartTime) {
                    localStorage.setItem('sahp_duty_start_time', String(this.state.dutyStartTime));
                } else {
                    localStorage.removeItem('sahp_duty_start_time');
                }
                const statusEl = document.getElementById('notes-auto-save-status');
                if (statusEl) {
                    statusEl.innerHTML = '<span class="material-symbols-outlined" style="font-size:0.95rem;">cloud_done</span> Auto-saved';
                }
            } catch (err) {
                console.error('Failed to save state to localStorage:', err);
            }
        }

        get(key) {
            return this.state[key];
        }

        set(key, value) {
            this.state[key] = value;
            this.save();
        }
    }

    const stateManager = new StateManager();
    let state = stateManager.load();

    // -----------------------------------------------------
    // 2B. BOTTOM NAVIGATION CONTROLLER (EMS Companion Pattern)
    // -----------------------------------------------------
    function renderBottomNav() {
        const currentMainId = stateManager.get('mainNavService') || 'penal';
        const mainService = BOTTOM_NAV_SERVICES.find(s => s.id === currentMainId) || BOTTOM_NAV_SERVICES[0];

        const mainIcon = document.getElementById('main-icon');
        const mainText = document.getElementById('main-text');
        const mainCard = document.getElementById('main-service-card');

        if (mainIcon) mainIcon.innerHTML = mainService.icon;
        if (mainText) mainText.innerHTML = mainService.text;
        if (mainCard) {
            mainCard.onclick = (e) => {
                if (e.target.closest('.nav-dropdown-btn') || e.target.closest('.nav-dropdown-menu')) return;
                openModal(mainService.modal);
            };
        }

        const dropdown = document.getElementById('service-dropdown');
        if (dropdown) {
            dropdown.innerHTML = '';
            BOTTOM_NAV_SERVICES.forEach(s => {
                if (s.id !== currentMainId) {
                    const item = document.createElement('div');
                    item.className = 'nav-dropdown-item';
                    item.innerHTML = `<span>${s.icon}</span> <span>${s.text.replace(/<br>/g, ' ')}</span>`;
                    item.onclick = (e) => {
                        e.stopPropagation();
                        stateManager.set('mainNavService', s.id);
                        dropdown.classList.remove('active');
                        renderBottomNav();
                        if (window.soundSystem && (!window.app || window.app.state.soundEnabled !== false)) {
                            window.soundSystem.playRadioClick();
                        }
                    };
                    dropdown.appendChild(item);
                }
            });
        }

        const secondaryGrid = document.getElementById('secondary-grid');
        if (secondaryGrid) {
            secondaryGrid.innerHTML = '';
            const otherServices = BOTTOM_NAV_SERVICES.filter(s => s.id !== currentMainId);
            let gridItems;
            if (currentMainId === 'settings') {
                gridItems = otherServices.slice(0, 4);
            } else {
                const nonSettings = otherServices.filter(s => s.id !== 'settings');
                const settingsItem = BOTTOM_NAV_SERVICES.find(s => s.id === 'settings') || {
                    id: 'settings',
                    icon: '<span class="material-symbols-outlined icon-gradient-slate">settings</span>',
                    smallText: 'SETTINGS',
                    modal: 'modal-settings'
                };
                gridItems = [...nonSettings.slice(0, 3), settingsItem];
            }

            gridItems.forEach(item => {
                const div = document.createElement('div');
                div.className = 'small-nav-item';
                div.onclick = () => openModal(item.modal);
                div.innerHTML = `
                    <div class="nav-icon-small">${item.icon}</div>
                    <div class="nav-text-small">${item.smallText}</div>
                `;
                secondaryGrid.appendChild(div);
            });
        }
    }

    function toggleDropdown(e) {
        if (e) e.stopPropagation();
        const menu = document.getElementById('service-dropdown');
        if (menu) {
            menu.classList.toggle('active');
            if (window.soundSystem && (!window.app || window.app.state.soundEnabled !== false)) {
                window.soundSystem.playRadioClick();
            }
        }
    }


    // -----------------------------------------------------
    // 3. UI STATE SYNC & INPUT BINDINGS
    // -----------------------------------------------------
    function syncStateToUI() {
        // Officer Profile
        const nameInput = document.getElementById('settingOfficerName');
        if (nameInput) nameInput.value = state.officerName || '';

        const badgeInput = document.getElementById('settingBadgeNum');
        if (badgeInput) badgeInput.value = state.badgeNum || '';

        // Job / Duty Assignment
        const topbarJob = document.getElementById('topbar-job-type');
        if (topbarJob) {
            topbarJob.value = state.jobType || 'Highway Patrol';
        }

        const settingJob = document.getElementById('settingJobType');
        if (settingJob) {
            settingJob.value = state.jobType || 'Highway Patrol';
        }

        updateOfficerTopBarBadge();

        // Boot Screen Toggle
        const bootToggle = document.getElementById('settingShowBootScreen');
        if (bootToggle) {
            bootToggle.checked = state.showBootScreen !== false;
        }

        // Sound FX Toggle
        const soundToggle = document.getElementById('settingSoundFX');
        if (soundToggle) {
            soundToggle.checked = state.soundEnabled !== false;
        }
        updateAudioDockIcon();

        // Discord Channel Inputs
        const srvInput = document.getElementById('settingDiscordServer');
        if (srvInput) srvInput.value = state.discordServerId || DEFAULT_DISCORD_SERVER_ID;

        const chanFine = document.getElementById('settingChanFineLog');
        if (chanFine) chanFine.value = state.discordChannels.finelog || DEFAULT_DISCORD_CHANNELS.finelog || '';

        const chanArr = document.getElementById('settingChanArrest');
        if (chanArr) chanArr.value = state.discordChannels.arrestlogs || DEFAULT_DISCORD_CHANNELS.arrestlogs || '';

        const chanConf = document.getElementById('settingChanConfiscation');
        if (chanConf) chanConf.value = state.discordChannels.confiscation || DEFAULT_DISCORD_CHANNELS.confiscation || '';

        const chanTow = document.getElementById('settingChanTowing');
        if (chanTow) chanTow.value = state.discordChannels.towing || DEFAULT_DISCORD_CHANNELS.towing || '';

        const chanBc = document.getElementById('settingChanBodycam');
        if (chanBc) chanBc.value = state.discordChannels.bodycam || DEFAULT_DISCORD_CHANNELS.bodycam || '';

        const chanRadar = document.getElementById('settingChanRadar');
        if (chanRadar) chanRadar.value = state.discordChannels.radarlogs || DEFAULT_DISCORD_CHANNELS.radarlogs || '';

        const chanRadio = document.getElementById('settingChanRadio');
        if (chanRadio) chanRadio.value = state.discordChannels.radiocodes || DEFAULT_DISCORD_CHANNELS.radiocodes || '';

        // Update Discord button visibility based on whether channel IDs are configured
        updateDiscordButtonsVisibility();

        // Quick Notes
        const notesTextarea = document.getElementById('quick-notes-textarea');
        if (notesTextarea) {
            notesTextarea.value = state.quickNotes || '';
            updateNotepadCounts();
        }

        // Duty Status Persistence & UI Sync
        const explicitDuty = localStorage.getItem('sahp_is_on_duty');
        const isOnDuty = explicitDuty !== null ? explicitDuty === '1' : Boolean(state.isOnDuty || state.dutyStartTime);
        state.isOnDuty = isOnDuty;
        if (!isOnDuty) {
            state.dutyStartTime = null;
        } else if (!state.dutyStartTime) {
            const savedTime = localStorage.getItem('sahp_duty_start_time');
            state.dutyStartTime = savedTime ? parseInt(savedTime, 10) : Date.now();
        }
        setDutyStatusUI(isOnDuty);

        // Bodycam step progression
        checkInitialStepStates();
    }

    function updateDiscordButtonsVisibility() {
        const channels = state.discordChannels || {};
        document.querySelectorAll('.discord-jump-btn').forEach(btn => {
            const channelKey = btn.getAttribute('data-discord-channel');
            const channelId = channelKey && channels[channelKey] ? String(channels[channelKey]).trim() : '';
            if (!channelId || channelId === '') {
                btn.style.display = 'none';
            } else {
                btn.style.display = '';
            }
        });
    }

    function updateOfficerTopBarBadge() {
        const topbarName = document.getElementById('topbar-officer-name');
        if (!topbarName) return;

        const name = (state.officerName || '').trim();
        const badge = (state.badgeNum || '').trim();

        if (name && badge) {
            topbarName.textContent = `${name.toUpperCase()} [${badge}]`;
        } else if (name) {
            topbarName.textContent = name.toUpperCase();
        } else if (badge) {
            topbarName.textContent = `OFFICER [${badge}]`;
        } else {
            topbarName.textContent = 'OFFICER [UNASSIGNED]';
        }
    }

    function bindSettingsEvents() {
        // Officer profile bindings
        const nameInput = document.getElementById('settingOfficerName');
        if (nameInput) {
            nameInput.addEventListener('input', (e) => {
                state.officerName = e.target.value.trim();
                stateManager.save();
                updateOfficerTopBarBadge();
            });
        }

        const badgeInput = document.getElementById('settingBadgeNum');
        if (badgeInput) {
            badgeInput.addEventListener('input', (e) => {
                state.badgeNum = e.target.value.trim();
                stateManager.save();
                updateOfficerTopBarBadge();
            });
        }

        const settingJob = document.getElementById('settingJobType');
        if (settingJob) {
            settingJob.addEventListener('change', (e) => {
                setJobType(e.target.value);
            });
        }

        // Boot screen toggle binding
        const bootToggle = document.getElementById('settingShowBootScreen');
        if (bootToggle) {
            bootToggle.addEventListener('change', (e) => {
                stateManager.set('showBootScreen', e.target.checked);
            });
        }

        // Sound FX toggle binding
        const soundToggle = document.getElementById('settingSoundFX');
        if (soundToggle) {
            soundToggle.addEventListener('change', (e) => {
                stateManager.set('soundEnabled', e.target.checked);
                updateAudioDockIcon();
            });
        }

        // Discord Server & Channel bindings
        const bindInputToState = (elemId, key, isChannel = false) => {
            const el = document.getElementById(elemId);
            if (el) {
                el.addEventListener('input', (e) => {
                    if (isChannel) {
                        state.discordChannels[key] = e.target.value.trim();
                        updateDiscordButtonsVisibility();
                    } else {
                        state[key] = e.target.value.trim();
                    }
                    stateManager.save();
                });
            }
        };

        bindInputToState('settingDiscordServer', 'discordServerId');
        bindInputToState('settingChanFineLog', 'finelog', true);
        bindInputToState('settingChanArrest', 'arrestlogs', true);
        bindInputToState('settingChanConfiscation', 'confiscation', true);
        bindInputToState('settingChanTowing', 'towing', true);
        bindInputToState('settingChanBodycam', 'bodycam', true);
        bindInputToState('settingChanRadar', 'radarlogs', true);
        bindInputToState('settingChanRadio', 'radiocodes', true);
    }

    // -----------------------------------------------------
    // 4. SOUND HELPER (With Mute Check)
    // -----------------------------------------------------
    function playSound(methodName) {
        if (state.soundEnabled === false) return;
        if (window.soundSystem && typeof window.soundSystem[methodName] === 'function') {
            try {
                window.soundSystem[methodName]();
            } catch (e) {
                console.warn('Audio play error:', e);
            }
        }
    }

    function toggleAudio() {
        const current = state.soundEnabled !== false;
        stateManager.set('soundEnabled', !current);
        const soundToggle = document.getElementById('settingSoundFX');
        if (soundToggle) soundToggle.checked = !current;
        updateAudioDockIcon();
        if (!current) playSound('playRadioClick');
    }

    function updateAudioDockIcon() {
        const icon = document.getElementById('dock-audio-icon');
        const isEnabled = state.soundEnabled !== false;
        if (icon) {
            icon.textContent = isEnabled ? 'volume_up' : 'volume_off';
            icon.style.color = isEnabled ? '#38bdf8' : '#94a3b8';
        }
    }

    // -----------------------------------------------------
    // 5. CLOCKS & SHIFT ENGINE
    // -----------------------------------------------------
    const usCurrencyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    });

    function formatCurrency(val) {
        if (val === undefined || val === null || val === '') return '$0';
        if (typeof val === 'number') return usCurrencyFormatter.format(val);
        const cleanStr = String(val).replace(/[^0-9.-]/g, '');
        const num = parseFloat(cleanStr);
        return isNaN(num) ? '$0' : usCurrencyFormatter.format(num);
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function escapeForAttribute(str) {
        if (!str) return '';
        return String(str)
            .replace(/\\/g, '\\\\')
            .replace(/'/g, "\\'")
            .replace(/"/g, '&quot;');
    }

    function getICTime() {
        const now = new Date();
        // Server time follows UK (London) which automatically accounts for British Summer Time (BST) / Daylight Saving Time (DST)
        // BST (Summer): UTC+1 (e.g. 23:28 when UTC is 22:28)
        // GMT (Winter): UTC+0
        try {
            const formatter = new Intl.DateTimeFormat('en-GB', {
                timeZone: 'Europe/London',
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            const parts = formatter.formatToParts(now);
            const partMap = {};
            parts.forEach(p => { partMap[p.type] = p.value; });

            let icHours = parseInt(partMap.hour, 10);
            if (icHours === 24) icHours = 0;
            const icMins = parseInt(partMap.minute, 10);
            const icSecs = parseInt(partMap.second, 10);

            return {
                hours: icHours,
                minutes: icMins,
                seconds: icSecs,
                formattedTime: `${String(icHours).padStart(2, '0')}:${String(icMins).padStart(2, '0')}`,
                formattedFull: `${String(icHours).padStart(2, '0')}:${String(icMins).padStart(2, '0')}:${String(icSecs).padStart(2, '0')}`
            };
        } catch (e) {
            // Fallback calculation accounting for European Daylight Saving Time (UTC+1 in summer, UTC+0 in winter)
            const month = now.getUTCMonth();
            const isDst = month >= 3 && month <= 9;
            const offsetMin = isDst ? 60 : 0;
            const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
            const icTotalMinutes = (utcMinutes + offsetMin + 1440) % 1440;
            const icHours = Math.floor(icTotalMinutes / 60);
            const icMins = Math.floor(icTotalMinutes % 60);
            const icSecs = now.getUTCSeconds();
            return {
                hours: icHours,
                minutes: icMins,
                seconds: icSecs,
                formattedTime: `${String(icHours).padStart(2, '0')}:${String(icMins).padStart(2, '0')}`,
                formattedFull: `${String(icHours).padStart(2, '0')}:${String(icMins).padStart(2, '0')}:${String(icSecs).padStart(2, '0')}`
            };
        }
    }

    function getLocalTime() {
        const now = new Date();
        return {
            hours: now.getHours(),
            minutes: now.getMinutes(),
            seconds: now.getSeconds(),
            formattedTime: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
            formattedFull: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
        };
    }

    function updateLiveClocks() {
        const ic = getICTime();
        const local = getLocalTime();

        let icDigits = document.querySelector('#big-live-clock .ic-digits');
        let localDigits = document.querySelector('#big-live-clock .local-digits');

        if (!icDigits || !localDigits) {
            const bigClockEl = document.getElementById('big-live-clock');
            if (bigClockEl) {
                bigClockEl.innerHTML = `
                    <div class="hud-clock-group">
                        <div class="hud-clock-card ic-card" title="In-City Time (GrandRP Server / BST/GMT)">
                            <div class="hud-clock-badge"><span class="material-symbols-outlined" style="font-size:0.85rem;">schedule</span> IC TIME</div>
                            <div class="hud-clock-digits ic-digits">${ic.formattedFull}</div>
                        </div>
                        <div class="hud-clock-card local-card" title="Local System Time">
                            <div class="hud-clock-badge"><span class="material-symbols-outlined" style="font-size:0.85rem;">public</span> LOCAL TIME</div>
                            <div class="hud-clock-digits local-digits">${local.formattedFull}</div>
                        </div>
                    </div>
                `;
            }
        } else {
            if (icDigits.textContent !== ic.formattedFull) {
                icDigits.textContent = ic.formattedFull;
            }
            if (localDigits.textContent !== local.formattedFull) {
                localDigits.textContent = local.formattedFull;
            }
        }

        const bcLiveTime = document.getElementById('bc-live-time');
        if (bcLiveTime) {
            const bcText = `${ic.formattedTime} (IC) | ${local.formattedTime} (Local)`;
            if (bcLiveTime.textContent !== bcText) {
                bcLiveTime.textContent = bcText;
            }
        }

        if (state.dutyStartTime) {
            updateShiftTimerDisplay();
        }
    }

    function calculateShiftBonus(elapsedHours, isNight) {
        const loc = state.selectedLocation || 'Patrol (Mission Row)';
        const rates = state.shiftRates;
        let baseRate = rates.dayPatrol;

        if (loc.includes('Highway') || loc.includes('SAHP')) {
            baseRate = isNight ? rates.nightHighway : rates.dayHighway;
        } else if (loc.includes('Detective')) {
            baseRate = isNight ? rates.nightDetective : rates.dayDetective;
        } else {
            baseRate = isNight ? rates.nightPatrol : rates.dayPatrol;
        }

        const hourlyPay = Math.round(elapsedHours * baseRate);
        const arrestBonus = (state.arrestsLogged || 0) * (rates.arrestBounty || 10000);
        const towBonus = (state.towsLogged || 0) * (rates.towingBounty || 5000);
        return hourlyPay + arrestBonus + towBonus;
    }

    function updateShiftTimerDisplay() {
        if (!state.dutyStartTime) return;
        const elapsedMs = Date.now() - state.dutyStartTime;
        const totalSecs = Math.floor(elapsedMs / 1000);
        const hrs = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        const secs = totalSecs % 60;

        const mainTimerEl = document.getElementById('compact-main-timer');
        if (mainTimerEl) {
            mainTimerEl.textContent = `${hrs} hr ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }

        const ic = getICTime();
        const isNight = ic.hours >= 0 && ic.hours < 6;
        const nightIcon = document.getElementById('compact-night-icon');
        if (nightIcon) {
            nightIcon.classList.toggle('hidden', !isNight);
        }

        const elapsedHours = elapsedMs / (1000 * 60 * 60);
        const totalBonus = calculateShiftBonus(elapsedHours, isNight);

        const bonusValEl = document.getElementById('compact-bonus-val');
        if (bonusValEl) {
            bonusValEl.textContent = formatCurrency(totalBonus);
        }

        const rect = document.getElementById('progress-outline-rect');
        if (rect) {
            const offset = 1000 - Math.min(1000, (totalSecs % 3600) / 3.6);
            rect.style.strokeDashoffset = offset;
        }
    }

    function setJobType(val) {
        state.jobType = (val || '').trim();
        stateManager.save();
        const topbarJob = document.getElementById('topbar-job-type');
        if (topbarJob && topbarJob.value !== state.jobType) topbarJob.value = state.jobType;
        const settingJob = document.getElementById('settingJobType');
        if (settingJob && settingJob.value !== state.jobType) settingJob.value = state.jobType;
    }

    function setDutyStatusUI(isOnDuty) {
        state.isOnDuty = Boolean(isOnDuty);
        const dutyBtn = document.getElementById('topbar-duty-btn');
        const dutyIcon = document.getElementById('topbar-duty-icon');
        const dutyPill = document.getElementById('modal-duty-status-pill');

        if (dutyBtn) {
            if (isOnDuty) {
                dutyBtn.classList.remove('off-duty');
                dutyBtn.classList.add('on-duty');
                dutyBtn.setAttribute('title', 'Active: ON DUTY [U] (Click to switch OFF DUTY & copy 10-9 command)');
                if (dutyIcon) dutyIcon.textContent = 'local_police';
            } else {
                dutyBtn.classList.remove('on-duty');
                dutyBtn.classList.add('off-duty');
                dutyBtn.setAttribute('title', 'Inactive: OFF DUTY [U] (Click to switch ON DUTY & copy 10-8 command)');
                if (dutyIcon) dutyIcon.textContent = 'power_settings_new';
            }
        }

        if (dutyPill) {
            dutyPill.className = `duty-pill ${isOnDuty ? 'on-duty' : 'off-duty'}`;
            dutyPill.innerHTML = `<span class="pulse-dot"></span> <span class="duty-pill-text">${isOnDuty ? 'ON DUTY' : 'OFF DUTY'}</span>`;
        }
    }

    function toggleDutyStatus() {
        const isCurrentlyOnDuty = Boolean(state.isOnDuty || state.dutyStartTime);

        if (!isCurrentlyOnDuty) {
            // User wants to go ON DUTY
            // 1. Validate / Prompt for Badge ID if missing
            let badge = (state.badgeNum || document.getElementById('settingBadgeNum')?.value || '').trim();
            if (!badge) {
                const promptBadge = prompt('Enter your SAHP Badge ID (e.g. 104) to go On Duty:');
                if (promptBadge && promptBadge.trim()) {
                    badge = promptBadge.trim();
                    state.badgeNum = badge;
                    const badgeInput = document.getElementById('settingBadgeNum');
                    if (badgeInput) badgeInput.value = badge;
                    updateOfficerTopBarBadge();
                    stateManager.save();
                } else {
                    badge = 'TROOPER'; // Fallback so toggling duty is never broken
                }
            }

            // 2. Validate / Default Job Type
            let jobType = (state.jobType || document.getElementById('topbar-job-type')?.value || '').trim();
            if (!jobType) {
                jobType = 'Highway Patrol';
                setJobType(jobType);
            }

            // 3. Format: "10-8 {Duty name} {current IC time}"
            const ic = getICTime();
            const cmd = `10-8 ${jobType} ${ic.formattedTime}`;
            copyToClipboardSilent(cmd);

            state.isOnDuty = true;
            state.dutyStartTime = Date.now();
            stateManager.save();
            playSound('playDutyChime');
            setDutyStatusUI(true);
            showNotificationToast(`ON DUTY: Copied "${cmd}" to clipboard`, 'check_circle');
        } else {
            // User wants to go OFF DUTY
            let jobType = (state.jobType || document.getElementById('topbar-job-type')?.value || 'Highway Patrol').trim();
            const ic = getICTime();
            const cmd = `10-9 ${jobType} ${ic.formattedTime}`;
            copyToClipboardSilent(cmd);

            state.isOnDuty = false;
            state.dutyStartTime = null;
            stateManager.save();
            playSound('playDutyChime');
            setDutyStatusUI(false);
            showNotificationToast(`OFF DUTY: Copied "${cmd}" to clipboard`, 'power_settings_new');
        }
    }

    function startShift(locName) {
        state.selectedLocation = locName || document.getElementById('rota-location')?.value || 'Patrol (Highway / Paleto)';
        state.isOnDuty = true;
        state.dutyStartTime = Date.now();
        stateManager.save();
        playSound('playDutyChime');
        setDutyStatusUI(true);
        updateShiftTimerDisplay();
    }

    function confirmEndShift() {
        state.isOnDuty = false;
        state.dutyStartTime = null;
        stateManager.save();
        playSound('playDutyChime');
        setDutyStatusUI(false);
    }

    function showConfirmEndShift() {
        const compactView = document.getElementById('tb-compact-view');
        const confirmView = document.getElementById('tb-confirm-view');
        if (compactView) compactView.classList.add('hidden');
        if (confirmView) confirmView.classList.remove('hidden');
    }

    function cancelConfirmEndShift() {
        const compactView = document.getElementById('tb-compact-view');
        const confirmView = document.getElementById('tb-confirm-view');
        if (confirmView) confirmView.classList.add('hidden');
        if (compactView) compactView.classList.remove('hidden');
    }

    // -----------------------------------------------------
    // 6. ARREST 25-MINUTE TIMER SYSTEM
    // -----------------------------------------------------
    const ARREST_TOTAL_SECONDS = 25 * 60; // 1500 seconds
    let arrestTimerState = {
        secondsLeft: ARREST_TOTAL_SECONDS,
        isRunning: false,
        isPaused: false,
        interval: null,
        suspectName: ''
    };

    let lawyerSubtimers = {
        private: { secondsLeft: 15 * 60, interval: null, isRunning: false },
        stateCall: { secondsLeft: 2 * 60, interval: null, isRunning: false },
        bodycam: { secondsLeft: 10 * 60, interval: null, isRunning: false }
    };

    function startArrestTimer() {
        if (arrestTimerState.isRunning && !arrestTimerState.isPaused) return;

        playSound('playDutyChime');
        arrestTimerState.isRunning = true;
        arrestTimerState.isPaused = false;

        clearInterval(arrestTimerState.interval);
        arrestTimerState.interval = setInterval(() => {
            if (arrestTimerState.secondsLeft > 0) {
                arrestTimerState.secondsLeft--;
                updateArrestTimerUI();

                if (arrestTimerState.secondsLeft === 300) {
                    playSound('playTimerWarning');
                }
                if (arrestTimerState.secondsLeft === 60) {
                    playSound('playEmergencyAlert');
                }
            } else {
                clearInterval(arrestTimerState.interval);
                arrestTimerState.isRunning = false;
                playSound('playEmergencyAlert');
                alert('🚨 ARREST TIMER EXPIRED! 25-Minute custody limit reached.');
                updateArrestTimerUI();
            }
        }, 1000);

        updateArrestTimerUI();
    }

    function pauseArrestTimerForLawyer() {
        if (!arrestTimerState.isRunning) return;
        arrestTimerState.isPaused = true;
        clearInterval(arrestTimerState.interval);
        playSound('playRadioClick');
        updateArrestTimerUI();
    }

    function resetArrestTimer() {
        clearInterval(arrestTimerState.interval);
        arrestTimerState.secondsLeft = ARREST_TOTAL_SECONDS;
        arrestTimerState.isRunning = false;
        arrestTimerState.isPaused = false;
        playSound('playRadioClick');
        updateArrestTimerUI();
    }

    function updateArrestTimerUI() {
        const mins = Math.floor(arrestTimerState.secondsLeft / 60);
        const secs = arrestTimerState.secondsLeft % 60;
        const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

        // Top bar compact arrest pill (if present)
        const pillVal = document.getElementById('compact-arrest-val');
        if (pillVal) pillVal.textContent = formatted;

        // Floating Tactical Dock badge
        const dockBadge = document.getElementById('dock-arrest-val');
        if (dockBadge) {
            dockBadge.textContent = formatted;
            if (arrestTimerState.isRunning || arrestTimerState.isPaused) {
                dockBadge.classList.remove('hidden');
                dockBadge.style.background = arrestTimerState.isPaused ? '#f59e0b' : (arrestTimerState.secondsLeft <= 300 ? '#ef4444' : '#10b981');
            } else {
                dockBadge.classList.add('hidden');
            }
        }

        // Modal countdown display
        const modalCountdown = document.getElementById('arrest-modal-countdown');
        if (modalCountdown) {
            modalCountdown.textContent = formatted;
            if (arrestTimerState.secondsLeft <= 300) {
                modalCountdown.style.color = '#ef4444';
            } else if (arrestTimerState.isPaused) {
                modalCountdown.style.color = '#f59e0b';
            } else {
                modalCountdown.style.color = '#f8fafc';
            }
        }

        // Status text
        const statusText = document.getElementById('arrest-timer-status-text');
        if (statusText) {
            if (arrestTimerState.isPaused) {
                statusText.innerHTML = '<span style="color:#f59e0b;">⏸ PAUSED (LAWYER REQUESTED)</span>';
            } else if (arrestTimerState.isRunning) {
                statusText.innerHTML = '<span style="color:#10b981;">▶ DETENTION TIMER ACTIVE</span>';
            } else {
                statusText.innerHTML = '<span style="color:var(--text-muted);">STANDBY (25 MINUTE LIMIT)</span>';
            }
        }

        // SVG progress circle
        const progressCircle = document.getElementById('timer-progress-circle');
        if (progressCircle) {
            const circumference = 2 * Math.PI * 75; // r=75 -> ~471
            const offset = circumference - (arrestTimerState.secondsLeft / ARREST_TOTAL_SECONDS) * circumference;
            progressCircle.style.strokeDashoffset = offset;
            if (arrestTimerState.secondsLeft <= 300) {
                progressCircle.style.stroke = '#ef4444';
            } else if (arrestTimerState.isPaused) {
                progressCircle.style.stroke = '#f59e0b';
            } else {
                progressCircle.style.stroke = '#38bdf8';
            }
        }
    }

    function startSubTimer(key, totalSecs, elementId) {
        clearInterval(lawyerSubtimers[key].interval);
        lawyerSubtimers[key].secondsLeft = totalSecs;
        lawyerSubtimers[key].isRunning = true;
        playSound('playRadioClick');

        lawyerSubtimers[key].interval = setInterval(() => {
            if (lawyerSubtimers[key].secondsLeft > 0) {
                lawyerSubtimers[key].secondsLeft--;
                const m = Math.floor(lawyerSubtimers[key].secondsLeft / 60);
                const s = lawyerSubtimers[key].secondsLeft % 60;
                const el = document.getElementById(elementId);
                if (el) el.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
            } else {
                clearInterval(lawyerSubtimers[key].interval);
                lawyerSubtimers[key].isRunning = false;
                playSound('playTimerWarning');
                const el = document.getElementById(elementId);
                if (el) el.textContent = '00:00 EXPIRED';
            }
        }, 1000);
    }

    // -----------------------------------------------------
    // 7. BODYCAM LOGS & STEP PROGRESSION
    // -----------------------------------------------------
    function copyTextToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text);
        }
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        return Promise.resolve();
    }

    function handleBodycamStepClick(btn) {
        const targetId = btn.getAttribute('data-target');
        const contentEl = document.getElementById(targetId);
        if (!contentEl) return;

        let textToCopy = contentEl.innerText.trim();

        copyTextToClipboard(textToCopy).then(() => {
            playSound('playCopyBeep');
            btn.classList.add('btn-success');
            setTimeout(() => btn.classList.remove('btn-success'), 1200);

            // Mark step as completed in state
            state.dutySteps[targetId] = true;
            stateManager.save();

            // Unlock next dependent step
            unlockNextStep(targetId);

            // If Discord action linked
            const discordKey = btn.getAttribute('data-discord-key');
            if (discordKey) {
                const cb = document.getElementById(`cb-${targetId}`);
                const useApp = cb ? cb.checked : true;
                openDiscordChannel(discordKey, useApp);
            }

            // Auto-set duty status when completing step 3
            if (targetId === 'od3') {
                state.isOnDuty = true;
                state.dutyStartTime = Date.now();
                stateManager.save();
                setDutyStatusUI(true);
            }
            if (targetId === 'off3') {
                state.isOnDuty = false;
                state.dutyStartTime = null;
                stateManager.save();
                setDutyStatusUI(false);
            }
        });
    }

    function unlockNextStep(completedStepId) {
        STEP_DEPENDENCIES.forEach(([prereq, next]) => {
            if (prereq === completedStepId) {
                const nextBtn = document.querySelector(`.copy-btn[data-target="${next}"]`);
                if (nextBtn) {
                    nextBtn.removeAttribute('disabled');
                    nextBtn.classList.add('pulse-unlock');
                    setTimeout(() => nextBtn.classList.remove('pulse-unlock'), 2000);
                }
            }
        });
    }

    function checkInitialStepStates() {
        STEP_DEPENDENCIES.forEach(([prereq, next]) => {
            const nextBtn = document.querySelector(`.copy-btn[data-target="${next}"]`);
            if (nextBtn) {
                if (state.dutySteps[prereq]) {
                    nextBtn.removeAttribute('disabled');
                } else {
                    nextBtn.setAttribute('disabled', 'true');
                }
            }
        });
    }

    // -----------------------------------------------------
    // 8. PENAL CODE MDT ENGINE & CHARGE CALCULATOR
    // -----------------------------------------------------
    let currentCategoryFilter = 'ALL';
    let searchQuery = '';

    function renderPenalCodes() {
        const container = document.getElementById('penal-table-body');
        const dataObj = window.SAHP_DATA || window.LSPD_DATA;
        if (!container || !dataObj || !dataObj.penalCodes) return;

        const codes = dataObj.penalCodes;
        const filtered = codes.filter(item => {
            const matchesCat = currentCategoryFilter === 'ALL' || item.category === currentCategoryFilter;
            const q = searchQuery.toLowerCase();
            const matchesQuery = !searchQuery ||
                item.code.toLowerCase().includes(q) ||
                item.title.toLowerCase().includes(q) ||
                item.remarks.toLowerCase().includes(q);
            return matchesCat && matchesQuery;
        });

        if (filtered.length === 0) {
            container.innerHTML = `
                <div style="padding: 2.5rem; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
                    <span class="material-symbols-outlined" style="font-size: 2.5rem; margin-bottom: 0.5rem; opacity: 0.5;">search_off</span><br>
                    No penal codes found matching "${searchQuery}"
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(item => {
            const isSelected = (state.selectedCharges || []).some(c => (c.code || c) === item.code);
            return `
                <div class="penal-row ${isSelected ? 'selected' : ''}" onclick="window.app.toggleSelectCharge('${item.code}')">
                    <span class="penal-badge-code">${item.code}</span>
                    <span style="font-weight:600; color:var(--text-main);">${item.title}</span>
                    <span style="color:#34d399; font-weight:700;">${formatCurrency(item.fineAmount !== undefined ? item.fineAmount : item.fine)}</span>
                    <span style="color:#38bdf8;">${item.sentence}</span>
                    <span class="penal-badge-stars">${item.stars}</span>
                    <span>${item.noBail ? '<span class="penal-badge-bail-no">NO BAIL</span>' : '<span class="penal-badge-bail-yes">BAIL OK</span>'}</span>
                    <span>
                        <input type="checkbox" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation(); window.app.toggleSelectCharge('${item.code}')" style="cursor:pointer; accent-color:var(--secondary);">
                    </span>
                </div>
            `;
        }).join('');
    }

    function toggleSelectCharge(codeStr) {
        const dataObj = window.SAHP_DATA || window.LSPD_DATA;
        if (!dataObj || !dataObj.penalCodes) return;
        const codeObj = dataObj.penalCodes.find(c => c.code === codeStr);
        if (!codeObj) return;

        if (!Array.isArray(state.selectedCharges)) state.selectedCharges = []; const idx = state.selectedCharges.findIndex(c => (c.code || c) === codeStr);
        if (idx !== -1) {
            state.selectedCharges.splice(idx, 1);
        } else {
            state.selectedCharges.push(codeObj);
        }

        stateManager.save();
        playSound('playRadioClick');
        renderPenalCodes();
        updateCitationSummary();
    }

    function clearSelectedCharges() {
        state.selectedCharges = [];
        stateManager.save();
        playSound('playRadioClick');
        renderPenalCodes();
        updateCitationSummary();
    }

    function updateCitationSummary() {
        const count = state.selectedCharges.length;
        let totalFine = 0;
        let totalMonths = 0;
        let maxStars = 0;
        let hasNoBail = false;
        let pdaTextList = [];

        state.selectedCharges.forEach(c => {
            totalFine += (c.fineAmount || 0);
            totalMonths += (c.sentenceMonths || 0);
            if ((c.starCount || 0) > maxStars) maxStars = c.starCount;
            if (c.noBail) hasNoBail = true;
            pdaTextList.push(`${c.code} ${c.title}`);
        });

        const fineEl = document.getElementById('stat-total-fine');
        if (fineEl) fineEl.textContent = formatCurrency(totalFine);

        const sentenceEl = document.getElementById('stat-total-sentence');
        if (sentenceEl) sentenceEl.textContent = totalMonths > 0 ? `${totalMonths} mo` : '-';

        const starsEl = document.getElementById('stat-max-stars');
        if (starsEl) starsEl.textContent = maxStars > 0 ? '⭐'.repeat(maxStars) : '-';

        const bailEl = document.getElementById('stat-bail-status');
        if (bailEl) {
            if (count === 0) {
                bailEl.textContent = '-';
                bailEl.className = 'citation-stat-val';
            } else if (hasNoBail) {
                bailEl.textContent = 'NO BAIL';
                bailEl.className = 'citation-stat-val nobail';
            } else {
                bailEl.textContent = 'ELIGIBLE';
                bailEl.className = 'citation-stat-val money';
            }
        }

        // Render separate input boxes for each charge
        const slotsContainer = document.getElementById('penal-pda-slots-container');
        const countHint = document.getElementById('penal-pda-count-hint');
        if (countHint) {
            countHint.textContent = count === 0 ? 'Paste separately' : `${count} slot${count > 1 ? 's' : ''}`;
        }
        if (slotsContainer) {
            if (pdaTextList.length === 0) {
                slotsContainer.innerHTML = '<div class="pda-empty-hint">Select one or more penal codes above to generate PDA charge slots...</div>';
            } else {
                slotsContainer.innerHTML = pdaTextList.map((chargeText, i) => {
                    const safeText = escapeHtml(chargeText);
                    const safeAttr = escapeForAttribute(chargeText);
                    return `
                        <div class="pda-slot-item">
                            <div class="pda-slot-header">
                                <span class="pda-slot-badge"><span class="material-symbols-outlined" style="font-size:0.75rem;">label</span> Slot #${i + 1}</span>
                                <button type="button" class="pda-slot-copy-btn" onclick="window.app.copyPdaSlotText(this, '${safeAttr}')" title="Copy Slot #${i + 1}">
                                    <span class="material-symbols-outlined" style="font-size:0.75rem;">content_copy</span> Copy
                                </button>
                            </div>
                            <input type="text" class="pda-slot-input" readonly value="${safeText}" onclick="this.select(); window.app.copyPdaSlotText(this, '${safeAttr}')" title="Click to copy Slot #${i + 1}" />
                        </div>
                    `;
                }).join('');
            }
        }

        // Toggle slide-in drawer on the right of the viewport
        const card = document.getElementById('penal-citation-summary');
        const modalPenal = document.getElementById('modal-penal');
        const isPenalModalActive = modalPenal && modalPenal.classList.contains('active');
        const isPenalPane = !document.getElementById('legal-engine-traffic-pane') || document.getElementById('legal-engine-traffic-pane').style.display === 'none';

        if (card) {
            card.classList.toggle('has-charges', isPenalModalActive && isPenalPane && count > 0);
        }
        if (modalPenal) {
            if (isPenalPane) {
                modalPenal.classList.toggle('has-summary-docked', count > 0);
            }
        }
    }

    function copyPdaCitation() {
        if (!state.selectedCharges || state.selectedCharges.length === 0) {
            alert('Please select at least one charge from the Penal Code list first.');
            return;
        }

        const pdaAllText = state.selectedCharges.map(c => `${c.code} ${c.title}`).join(' | ');
        copyTextToClipboard(pdaAllText).then(() => {
            playSound('playCopyBeep');
            const btn = document.getElementById('btn-copy-pda');
            if (btn) {
                btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:0.95rem;">done</span> Copied All!';
                setTimeout(() => {
                    btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:0.95rem;">content_copy</span> Copy All (J)';
                }, 1500);
            }
        });
    }

    // -----------------------------------------------------
    // 9. TRAFFIC CODES & REGULATIONS ENGINE
    // -----------------------------------------------------
    let currentTrafficCategoryFilter = 'ALL';
    let searchTrafficQuery = '';

    function getAllTrafficRegulations() {
        const dataObj = window.SAHP_DATA || window.LSPD_DATA;
        if (!dataObj) return [];

        const tcList = (dataObj.trafficCodes || []).map(item => ({
            ...item,
            isTrafficCode: true,
            starCount: item.starCount !== undefined ? item.starCount : (item.stars && item.stars !== '-' ? (item.stars.match(/⭐|\u2b50/g) || []).length : 0),
            towing: item.towing !== undefined ? item.towing : (
                (item.remarks && /tow/i.test(item.remarks)) ||
                item.category === 'Towing & Impounds' ||
                (item.code && item.code.startsWith('T.C. 6.2')) ||
                item.code === 'T.C. 6.4' ||
                item.code === 'T.C. 8.1'
            )
        }));

        const pcTraffic = (dataObj.penalCodes || [])
            .filter(c => c.category === 'Traffic Regulations (Penal)')
            .map(item => ({
                ...item,
                isPenalTraffic: true,
                towing: item.code === 'P.C. 6.3' // Abandonment of Vehicle
            }));

        return [...tcList, ...pcTraffic];
    }

    function renderTrafficCodes() {
        const container = document.getElementById('traffic-table-body');
        const dataObj = window.SAHP_DATA || window.LSPD_DATA;
        if (!container || !dataObj) return;

        const allTraffic = getAllTrafficRegulations();

        // Update total count badge
        const countBadge = document.getElementById('traffic-total-count');
        if (countBadge) countBadge.textContent = allTraffic.length;

        const filtered = allTraffic.filter(item => {
            let matchesCat = false;
            if (currentTrafficCategoryFilter === 'ALL') {
                matchesCat = true;
            } else if (currentTrafficCategoryFilter === 'Towing & Impounds') {
                matchesCat = item.category === 'Towing & Impounds' || item.towing === true;
            } else {
                matchesCat = item.category === currentTrafficCategoryFilter;
            }

            const q = searchTrafficQuery.toLowerCase();
            const matchesQuery = !searchTrafficQuery ||
                item.code.toLowerCase().includes(q) ||
                item.title.toLowerCase().includes(q) ||
                (item.remarks && item.remarks.toLowerCase().includes(q)) ||
                (item.fine && item.fine.toLowerCase().includes(q));

            return matchesCat && matchesQuery;
        });

        if (filtered.length === 0) {
            container.innerHTML = `
                <div style="padding: 2.5rem; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
                    <span class="material-symbols-outlined" style="font-size: 2.5rem; margin-bottom: 0.5rem; opacity: 0.5;">search_off</span><br>
                    No traffic codes found matching "${searchTrafficQuery}"
                </div>
            `;
            return;
        }

        const selectedList = state.selectedTrafficCharges || [];

        container.innerHTML = filtered.map(item => {
            const isSelected = (selectedList || []).some(c => (c.code || c) === item.code);
            const starsDisplay = item.stars && item.stars !== '-' ? item.stars : '-';

            let bailOrTowBadge = '';
            if (item.noBail) {
                bailOrTowBadge = '<span class="penal-badge-bail-no">NO BAIL</span>';
            } else if (item.towing) {
                bailOrTowBadge = '<span class="traffic-badge-tow">TOWABLE</span>';
            } else if (item.sentenceMonths > 0) {
                bailOrTowBadge = '<span class="penal-badge-bail-yes">BAIL OK</span>';
            } else {
                bailOrTowBadge = '<span class="traffic-badge-cite">CITE ONLY</span>';
            }

            const codeClass = item.isPenalTraffic ? 'traffic-badge-pc' : 'traffic-badge-code';

            return `
                <div class="traffic-row ${isSelected ? 'selected' : ''}" onclick="window.app.toggleSelectTrafficCharge('${item.code}')">
                    <span class="${codeClass}">${item.code}</span>
                    <div>
                        <div style="font-weight:600; color:var(--text-main); line-height:1.35;">${item.title}</div>
                        ${item.remarks ? `<div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">${item.remarks}</div>` : ''}
                    </div>
                    <span style="color:#34d399; font-weight:700;">${item.fine ? formatCurrency(item.fineAmount !== undefined ? item.fineAmount : item.fine) : '-'}</span>
                    <span style="color:#38bdf8;">${item.sentence || '-'}</span>
                    <span class="penal-badge-stars">${starsDisplay}</span>
                    <span>${bailOrTowBadge}</span>
                    <span>
                        <input type="checkbox" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation(); window.app.toggleSelectTrafficCharge('${item.code}')" style="cursor:pointer; accent-color:var(--secondary);">
                    </span>
                </div>
            `;
        }).join('');
    }

    function toggleSelectTrafficCharge(codeStr) {
        const allTraffic = getAllTrafficRegulations();
        const codeObj = allTraffic.find(c => c.code === codeStr);
        if (!codeObj) return;

        if (!Array.isArray(state.selectedTrafficCharges)) {
            state.selectedTrafficCharges = [];
        }

        const idx = state.selectedTrafficCharges.findIndex(c => c.code === codeStr);
        if (idx !== -1) {
            state.selectedTrafficCharges.splice(idx, 1);
        } else {
            state.selectedTrafficCharges.push(codeObj);
        }

        stateManager.save();
        playSound('playRadioClick');
        renderTrafficCodes();
        updateTrafficCitationSummary();
    }

    function clearSelectedTrafficCharges() {
        state.selectedTrafficCharges = [];
        stateManager.save();
        playSound('playRadioClick');
        renderTrafficCodes();
        updateTrafficCitationSummary();
    }

    function updateTrafficCitationSummary() {
        const list = state.selectedTrafficCharges || [];
        const count = list.length;
        let totalFine = 0;
        let totalMonths = 0;
        let maxStars = 0;
        let hasNoBail = false;
        let towingRequired = false;
        let pdaTextList = [];

        list.forEach(c => {
            totalFine += (c.fineAmount || 0);
            totalMonths += (c.sentenceMonths || 0);
            const stars = c.starCount || (c.stars && c.stars !== '-' ? (c.stars.match(/⭐|\u2b50/g) || []).length : 0);
            if (stars > maxStars) maxStars = stars;
            if (c.noBail) hasNoBail = true;
            if (c.towing || (c.remarks && /tow/i.test(c.remarks)) || c.category === 'Towing & Impounds') {
                towingRequired = true;
            }
            pdaTextList.push(`${c.code} ${c.title}`);
        });

        const fineEl = document.getElementById('traffic-stat-total-fine');
        if (fineEl) fineEl.textContent = formatCurrency(totalFine);

        const sentenceEl = document.getElementById('traffic-stat-total-sentence');
        if (sentenceEl) sentenceEl.textContent = totalMonths > 0 ? `${totalMonths} mo` : '-';

        const starsEl = document.getElementById('traffic-stat-max-stars');
        if (starsEl) starsEl.textContent = maxStars > 0 ? '⭐'.repeat(maxStars) : '-';

        const towingEl = document.getElementById('traffic-stat-towing');
        if (towingEl) {
            if (count === 0) {
                towingEl.textContent = '-';
                towingEl.className = 'citation-stat-val';
            } else if (towingRequired) {
                towingEl.textContent = 'TOW AUTHORIZED';
                towingEl.className = 'citation-stat-val traffic-stat-tow';
            } else {
                towingEl.textContent = 'NO TOW';
                towingEl.className = 'citation-stat-val';
            }
        }

        const bailEl = document.getElementById('traffic-stat-bail');
        if (bailEl) {
            if (count === 0) {
                bailEl.textContent = '-';
                bailEl.className = 'citation-stat-val';
            } else if (hasNoBail) {
                bailEl.textContent = 'NO BAIL';
                bailEl.className = 'citation-stat-val nobail';
            } else if (totalMonths > 0) {
                bailEl.textContent = 'ELIGIBLE';
                bailEl.className = 'citation-stat-val money';
            } else {
                bailEl.textContent = 'CITE ONLY';
                bailEl.className = 'citation-stat-val';
            }
        }

        // Render separate input boxes for each traffic charge
        const slotsContainer = document.getElementById('traffic-pda-slots-container');
        const countHint = document.getElementById('traffic-pda-count-hint');
        if (countHint) {
            countHint.textContent = count === 0 ? 'Paste separately' : `${count} slot${count > 1 ? 's' : ''}`;
        }
        if (slotsContainer) {
            if (pdaTextList.length === 0) {
                slotsContainer.innerHTML = '<div class="pda-empty-hint">Select one or more traffic codes or regulations above to generate PDA citation slots...</div>';
            } else {
                slotsContainer.innerHTML = pdaTextList.map((chargeText, i) => {
                    const safeText = escapeHtml(chargeText);
                    const safeAttr = escapeForAttribute(chargeText);
                    return `
                        <div class="pda-slot-item">
                            <div class="pda-slot-header">
                                <span class="pda-slot-badge"><span class="material-symbols-outlined" style="font-size:0.75rem;">label</span> Slot #${i + 1}</span>
                                <button type="button" class="pda-slot-copy-btn" onclick="window.app.copyPdaSlotText(this, '${safeAttr}')" title="Copy Slot #${i + 1}">
                                    <span class="material-symbols-outlined" style="font-size:0.75rem;">content_copy</span> Copy
                                </button>
                            </div>
                            <input type="text" class="pda-slot-input" readonly value="${safeText}" onclick="this.select(); window.app.copyPdaSlotText(this, '${safeAttr}')" title="Click to copy Slot #${i + 1}" />
                        </div>
                    `;
                }).join('');
            }
        }

        // Toggle slide-in drawer on the right of the viewport
        const card = document.getElementById('traffic-citation-summary');
        const modalPenal = document.getElementById('modal-penal');
        const isPenalModalActive = modalPenal && modalPenal.classList.contains('active');
        const isTrafficPane = document.getElementById('legal-engine-traffic-pane') && document.getElementById('legal-engine-traffic-pane').style.display !== 'none';

        if (card) {
            card.classList.toggle('has-charges', isPenalModalActive && isTrafficPane && count > 0);
        }
        if (modalPenal) {
            if (isTrafficPane) {
                modalPenal.classList.toggle('has-summary-docked', count > 0);
            }
        }
    }

    function copyTrafficPdaCitation() {
        if (!state.selectedTrafficCharges || state.selectedTrafficCharges.length === 0) {
            alert('Please select at least one traffic charge first.');
            return;
        }

        const pdaAllText = state.selectedTrafficCharges.map(c => `${c.code} ${c.title}`).join(' | ');
        copyTextToClipboard(pdaAllText).then(() => {
            playSound('playCopyBeep');
            const btn = document.getElementById('btn-copy-traffic-pda');
            if (btn) {
                btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:0.95rem;">done</span> Copied All!';
                setTimeout(() => {
                    btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:0.95rem;">content_copy</span> Copy All (J)';
                }, 1500);
            }
        });
    }

    function transferTrafficToPenalEngine() {
        if (!state.selectedTrafficCharges || state.selectedTrafficCharges.length === 0) {
            alert('No traffic charges selected to transfer.');
            return;
        }

        let addedCount = 0;
        state.selectedTrafficCharges.forEach(tc => {
            if (!state.selectedCharges.some(c => c.code === tc.code)) {
                state.selectedCharges.push(tc);
                addedCount++;
            }
        });

        stateManager.save();
        playSound('playRadioClick');
        renderPenalCodes();
        updateCitationSummary();
        alert(`Transferred ${addedCount} traffic charge(s) to Penal Code Engine!`);
    }

    function calculateImpoundFee(val) {
        const numeric = parseFloat(String(val).replace(/[^\d.]/g, '')) || 0;
        const fee = Math.round(numeric * 0.10); // 10% fee matrix
        const out = document.getElementById('impound-fee-result');
        if (out) {
            out.textContent = formatCurrency(fee);
        }
    }

    // -----------------------------------------------------
    // 10. ARTICLE 7 PARKING REGULATIONS
    // -----------------------------------------------------
    function renderArticle7() {
        const container = document.getElementById('article7-cards-container');
        const dataObj = window.SAHP_DATA || window.LSPD_DATA;
        if (!container || !dataObj || !dataObj.article7) return;

        const locs = dataObj.article7.locations;
        container.innerHTML = locs.map(loc => `
            <div class="glass-section" style="padding: 0.9rem;">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.4rem;">
                    <span style="font-weight:700; color:var(--secondary); font-family:'JetBrains Mono',monospace;">${loc.code}</span>
                    <span style="font-size:0.75rem; background:rgba(56,189,248,0.12); padding:2px 8px; border-radius:6px; color:#94a3b8;">${loc.area}</span>
                </div>
                <div style="font-size:0.95rem; font-weight:700; color:var(--text-main); margin-bottom:0.4rem;">${loc.name}</div>
                <div style="font-size:0.82rem; color:var(--text-muted); line-height:1.45;">${loc.rules}</div>
            </div>
        `).join('');
    }

    // -----------------------------------------------------
    // 11. DISCORD ACTIONS
    // -----------------------------------------------------
    function openDiscordChannel(channelKey, useApp = true) {
        const serverId = state.discordServerId || DEFAULT_DISCORD_SERVER_ID;
        const channelId = (state.discordChannels && state.discordChannels[channelKey] !== undefined)
            ? String(state.discordChannels[channelKey]).trim()
            : (DEFAULT_DISCORD_CHANNELS[channelKey] || '');

        if (!channelId) {
            alert(`Discord Channel ID for #${channelKey.toUpperCase()} is not configured in Settings.`);
            return;
        }

        if (useApp) {
            window.location.href = `discord://discord.com/channels/${serverId}/${channelId}`;
            setTimeout(() => {
                window.open(`https://discord.com/channels/${serverId}/${channelId}`, '_blank');
            }, 1200);
        } else {
            window.open(`https://discord.com/channels/${serverId}/${channelId}`, '_blank');
        }
    }

    // -----------------------------------------------------
    // 12. QUICK NOTEPAD AUTO-SAVE
    // -----------------------------------------------------
    function initNotepad() {
        const textarea = document.getElementById('quick-notes-textarea');
        if (!textarea) return;

        textarea.value = state.quickNotes || '';
        updateNotepadCounts();

        textarea.addEventListener('input', () => {
            state.quickNotes = textarea.value;
            stateManager.save();
            updateNotepadCounts();
        });
    }

    function updateNotepadCounts() {
        const textarea = document.getElementById('quick-notes-textarea');
        const countEl = document.getElementById('notes-char-count');
        if (!textarea || !countEl) return;

        const val = textarea.value;
        const chars = val.length;
        const lines = val ? val.split('\n').length : 0;
        countEl.textContent = `${chars} characters | ${lines} lines`;
    }

    function copyQuickNotes() {
        const textarea = document.getElementById('quick-notes-textarea');
        if (!textarea || !textarea.value) {
            showNotificationToast('Notepad is empty', 'info');
            return;
        }

        copyTextToClipboard(textarea.value).then(() => {
            playSound('playCopyBeep');
            showNotificationToast('Notepad copied to clipboard!', 'content_copy');
        });
    }

    function insertNotepadTimestamp() {
        const textarea = document.getElementById('quick-notes-textarea');
        if (!textarea) return;
        const ic = getICTime();
        const stamp = `[IC ${ic.formattedTime}] `;
        const start = textarea.selectionStart || 0;
        const end = textarea.selectionEnd || 0;
        const val = textarea.value || '';
        textarea.value = val.substring(0, start) + stamp + val.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + stamp.length;
        textarea.focus();
        state.quickNotes = textarea.value;
        stateManager.save();
        updateNotepadCounts();
        playSound('playCopyBeep');
        showNotificationToast(`Inserted timestamp ${stamp.trim()}`, 'schedule');
    }

    function clearQuickNotes() {
        if (!confirm('Are you sure you want to clear your Quick Notepad?')) return;
        const textarea = document.getElementById('quick-notes-textarea');
        if (textarea) textarea.value = '';
        state.quickNotes = '';
        stateManager.save();
        updateNotepadCounts();
        showNotificationToast('Notepad cleared', 'delete_sweep');
    }

    // -----------------------------------------------------
    // 13. CONFIG BACKUP, EXPORT & IMPORT (EMS Format)
    // -----------------------------------------------------
    function exportDb() {
        const filename = (document.getElementById('export-filename-input')?.value.trim() || 'SAHP_Config') + '.txt';
        const dataStr = 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
        const a = document.createElement('a');
        a.href = dataStr;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        playSound('playDutyChime');
    }

    function handleImportDbFile(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const imported = JSON.parse(e.target.result);
                state = {
                    ...stateManager.getDefaultState(),
                    ...imported,
                    discordChannels: {
                        ...DEFAULT_DISCORD_CHANNELS,
                        ...(imported.discordChannels || {})
                    },
                    shiftRates: {
                        ...DEFAULT_SHIFT_RATES,
                        ...(imported.shiftRates || {})
                    }
                };
                stateManager.state = state;
                stateManager.save();
                playSound('playDutyChime');
                alert('Configuration successfully imported! Reloading...');
                location.reload();
            } catch (err) {
                alert('Invalid configuration file. Please verify JSON formatting.');
            }
        };
        reader.readAsText(file);
    }

    function saveCurrentAsDefault() {
        localStorage.setItem(DEFAULTS_STORAGE_KEY, JSON.stringify(state));
        playSound('playDutyChime');
        alert('Current configuration saved as your custom baseline defaults.');
        updateDefaultsBadge();
    }

    function resetToSavedDefaults() {
        const saved = localStorage.getItem(DEFAULTS_STORAGE_KEY);
        if (!saved) {
            alert('No saved baseline defaults found. Save your baseline first.');
            return;
        }
        if (!confirm('Restore your saved baseline defaults?')) return;
        state = JSON.parse(saved);
        stateManager.state = state;
        stateManager.save();
        alert('Restored baseline defaults!');
        location.reload();
    }

    function resetToFactoryDefaults() {
        if (!confirm('WARNING: Factory reset will wipe all custom configurations and return to default SAHP settings. Continue?')) return;
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(FALLBACK_STORAGE_KEY);
        localStorage.removeItem(DEFAULTS_STORAGE_KEY);
        alert('Factory reset complete.');
        location.reload();
    }

    function updateDefaultsBadge() {
        const badge = document.getElementById('user-defaults-status-badge');
        if (!badge) return;
        const hasSaved = !!localStorage.getItem(DEFAULTS_STORAGE_KEY);
        badge.textContent = hasSaved ? 'Custom Baseline Set' : 'No Baseline Set';
        badge.style.color = hasSaved ? '#34d399' : '#fbbf24';
    }

    // -----------------------------------------------------
    // 14. BOOT ANIMATION & INITIALIZATION
    // -----------------------------------------------------
    function initBootScreen() {
        const splash = document.getElementById('ai-splash-screen');
        if (!splash) return;

        // Skip boot screen check
        if (state.showBootScreen === false) {
            splash.style.display = 'none';
            splash.remove();
            return;
        }

        const fill = document.getElementById('splash-progress-fill');
        const text = document.getElementById('splash-status-text');
        const logs = document.getElementById('splash-logs');

        const steps = [
            { pct: 20, text: 'LOADING SAHP CAD / MDT DATABASE...', log: '> HIGHWAY PATROL CAD DATABASE: [ MOUNTED ]' },
            { pct: 50, text: 'FETCHING PENAL & TRAFFIC CODES...', log: '> EN3 PATROLMAN GUIDE: [ VERIFIED ]' },
            { pct: 80, text: 'INITIALIZING 25-MIN ARREST ENGINE...', log: '> DETENTION PROTOCOLS: [ ARMED ]' },
            { pct: 100, text: 'SYSTEM READY. WELCOME TROOPER.', log: '> DISPATCH LINK: [ ONLINE ]' }
        ];

        let i = 0;
        const interval = setInterval(() => {
            if (i < steps.length) {
                if (fill) fill.style.width = `${steps[i].pct}%`;
                if (text) text.textContent = steps[i].text;
                if (logs) {
                    const div = document.createElement('div');
                    div.textContent = steps[i].log;
                    logs.appendChild(div);
                }
                i++;
            } else {
                clearInterval(interval);
                setTimeout(() => {
                    splash.classList.add('fade-out');
                    playSound('playDutyChime');
                    setTimeout(() => {
                        splash.style.display = 'none';
                        splash.remove();
                    }, 400);
                }, 350);
            }
        }, 300);
    }

    // -----------------------------------------------------
    // 15. GLOBAL EXPOSURE & EVENT BINDINGS
    // -----------------------------------------------------
    
    // -----------------------------------------------------
    // 6. MODAL MANAGER (EMS Companion Architecture)
    // -----------------------------------------------------
    class ModalManager {
        constructor() {}
        init() {}
        open(modalId) {
            openModal(modalId);
        }
        closeAll() {
            closeAllModals();
        }
        close(modalId) {
            closeModals(modalId);
        }
    }

    function switchLegalEngineTab(tabName) {
        const penalBtn = document.getElementById('tab-btn-penal');
        const trafficBtn = document.getElementById('tab-btn-traffic');
        const penalPane = document.getElementById('legal-engine-penal-pane');
        const trafficPane = document.getElementById('legal-engine-traffic-pane');
        const penalCard = document.getElementById('penal-citation-summary');
        const trafficCard = document.getElementById('traffic-citation-summary');

        if (tabName === 'traffic') {
            if (penalBtn) penalBtn.classList.remove('active');
            if (trafficBtn) trafficBtn.classList.add('active');
            if (penalPane) penalPane.style.display = 'none';
            if (trafficPane) trafficPane.style.display = 'block';
            if (penalCard) penalCard.classList.remove('has-charges');
            renderTrafficCodes();
            updateTrafficCitationSummary();
        } else {
            if (trafficBtn) trafficBtn.classList.remove('active');
            if (penalBtn) penalBtn.classList.add('active');
            if (trafficPane) trafficPane.style.display = 'none';
            if (penalPane) penalPane.style.display = 'block';
            if (trafficCard) trafficCard.classList.remove('has-charges');
            renderPenalCodes();
            updateCitationSummary();
        }

        if (window.soundSystem && state.soundEnabled !== false) {
            window.soundSystem.playRadioClick();
        }
    }

    function copyPdaSlotText(targetEl, text) {
        if (!text) return;
        copyTextToClipboard(text).then(() => {
            playSound('playCopyBeep');
            const slotItem = targetEl.closest ? targetEl.closest('.pda-slot-item') : null;
            const btn = slotItem ? slotItem.querySelector('.pda-slot-copy-btn') : (targetEl.classList && targetEl.classList.contains('pda-slot-copy-btn') ? targetEl : null);
            if (btn) {
                const prevHtml = btn.innerHTML;
                btn.classList.add('copied');
                btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:0.75rem;">done</span> Copied!';
                setTimeout(() => {
                    btn.classList.remove('copied');
                    btn.innerHTML = prevHtml;
                }, 1400);
            }
        });
    }

    function makeCardDraggable(cardEl, handleEl) {
        if (!cardEl || !handleEl) return;
        let isDragging = false;
        let startPointerX = 0;
        let startPointerY = 0;
        let startCardLeft = 0;
        let startCardTop = 0;

        const onPointerDown = (e) => {
            if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a')) return;
            if (e.pointerType === 'mouse' && e.button !== 0) return;

            // Get exact visual rect in viewport space before modifying any styles
            const rect = cardEl.getBoundingClientRect();
            startPointerX = e.clientX;
            startPointerY = e.clientY;
            startCardLeft = rect.left;
            startCardTop = rect.top;

            isDragging = true;
            cardEl.classList.add('is-dragging');
            cardEl.dataset.isCustomPos = 'true';
            cardEl.style.transition = 'none';

            // Pin card directly at its exact visual pixel coordinates (zero shift)
            cardEl.style.left = `${startCardLeft}px`;
            cardEl.style.top = `${startCardTop}px`;
            cardEl.style.right = 'auto';
            cardEl.style.bottom = 'auto';
            cardEl.style.transform = 'none';

            void cardEl.offsetWidth; // Commit coordinates synchronously

            window.addEventListener('pointermove', onPointerMove, { passive: false });
            window.addEventListener('pointerup', onPointerUp);
            window.addEventListener('pointercancel', onPointerUp);

            e.preventDefault();
        };

        const onPointerMove = (e) => {
            if (!isDragging) return;

            const deltaX = e.clientX - startPointerX;
            const deltaY = e.clientY - startPointerY;

            let newLeft = startCardLeft + deltaX;
            let newTop = startCardTop + deltaY;

            const cardWidth = cardEl.offsetWidth;
            const cardHeight = cardEl.offsetHeight;
            const maxLeft = Math.max(0, window.innerWidth - cardWidth);
            const maxTop = Math.max(0, window.innerHeight - cardHeight);

            newLeft = Math.max(0, Math.min(maxLeft, newLeft));
            newTop = Math.max(0, Math.min(maxTop, newTop));

            cardEl.style.left = `${Math.round(newLeft)}px`;
            cardEl.style.top = `${Math.round(newTop)}px`;

            e.preventDefault();
        };

        const onPointerUp = (e) => {
            if (!isDragging) return;
            isDragging = false;
            cardEl.classList.remove('is-dragging');
            cardEl.style.transition = '';

            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
            window.removeEventListener('pointercancel', onPointerUp);
        };

        const headerEl = cardEl.querySelector('.citation-card-header');
        const dragTarget = headerEl || handleEl;
        dragTarget.addEventListener('pointerdown', onPointerDown);
        dragTarget.addEventListener('dragstart', (e) => e.preventDefault());
        handleEl.addEventListener('dragstart', (e) => e.preventDefault());
    }

    function resetCitationSummaryPos(cardId) {
        const card = document.getElementById(cardId);
        if (!card) return;
        delete card.dataset.isCustomPos;
        card.style.left = '';
        card.style.top = '';
        card.style.right = '';
        card.style.bottom = '';
        card.style.width = '';
        card.style.height = '';
        card.style.transform = '';
        playSound('playRadioClick');
    }

    const modalManager = new ModalManager();

    window.app = {
        state,
        stateManager,
        setJobType,
        switchLegalEngineTab,
        insertNotepadTimestamp,
        showNotificationToast,
        toggleDutyStatus,
        toggleAudio,
        startShift,
        confirmEndShift,
        showConfirmEndShift,
        cancelConfirmEndShift,
        handleBodycamStepClick,
        startArrestTimer,
        pauseArrestTimerForLawyer,
        resetArrestTimer,
        startSubTimer,
        toggleSelectCharge,
        clearSelectedCharges,
        copyPdaCitation,
        copyPdaSlotText,
        resetCitationSummaryPos,
        formatCurrency,
        updateCitationSummary,
        toggleSelectTrafficCharge,
        clearSelectedTrafficCharges,
        copyTrafficPdaCitation,
        updateTrafficCitationSummary,
        transferTrafficToPenalEngine,
        setTrafficCategoryFilter: (cat) => {
            currentTrafficCategoryFilter = cat;
            renderTrafficCodes();
        },
        calculateImpoundFee,
        renderTrafficCodes,
        setPenalCategoryFilter: (cat) => {
            currentCategoryFilter = cat;
            renderPenalCodes();
        },
        renderPenalCodes,
        openDiscordChannel,
        copyQuickNotes,
        clearQuickNotes,
        exportDb,
        handleImportDbFile,
        saveCurrentAsDefault,
        resetToSavedDefaults,
        resetToFactoryDefaults
    };

    document.addEventListener('DOMContentLoaded', () => {
        initBootScreen();
        syncStateToUI();
        bindSettingsEvents();
        initNotepad();
        renderPenalCodes();
        renderTrafficCodes();
        renderArticle7();
        updateCitationSummary();
        updateTrafficCitationSummary();
        updateDefaultsBadge();

        // Initialize Draggable Citation Summaries
        makeCardDraggable(document.getElementById('penal-citation-summary'), document.getElementById('penal-summary-drag-handle'));
        makeCardDraggable(document.getElementById('traffic-citation-summary'), document.getElementById('traffic-summary-drag-handle'));

        // Update live clocks every 1000ms (1s)
        setInterval(updateLiveClocks, 1000);
        updateLiveClocks();

        // Setup import file listener
        const importInput = document.getElementById('import-db-file');
        if (importInput) {
            importInput.addEventListener('change', handleImportDbFile);
        }

        // Search penal codes listener with debounce
        const searchInput = document.getElementById('penal-search-input');
        if (searchInput) {
            let penalSearchDebounce = null;
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value.trim();
                if (penalSearchDebounce) clearTimeout(penalSearchDebounce);
                penalSearchDebounce = setTimeout(() => {
                    renderPenalCodes();
                }, 75);
            });
        }

        // Search traffic codes listener with debounce
        const trafficSearchInput = document.getElementById('traffic-search-input');
        if (trafficSearchInput) {
            let trafficSearchDebounce = null;
            trafficSearchInput.addEventListener('input', (e) => {
                searchTrafficQuery = e.target.value.trim();
                if (trafficSearchDebounce) clearTimeout(trafficSearchDebounce);
                trafficSearchDebounce = setTimeout(() => {
                    renderTrafficCodes();
                }, 75);
            });
        }
    });

})();

// -----------------------------------------------------
// 16. MODAL HELPERS & GLOBAL UI EVENT WRAPPERS
// -----------------------------------------------------
let modalStack = [];

function openModal(modalId) {
    if (modalId === 'modal-traffic') {
        modalId = 'modal-penal';
        if (window.app && window.app.switchLegalEngineTab) {
            window.app.switchLegalEngineTab('traffic');
        }
    }
    const overlay = document.getElementById('modalOverlay');
    const modal = document.getElementById(modalId);
    if (!overlay || !modal) return;

    if (window.soundSystem && (!window.app || window.app.state.soundEnabled !== false)) {
        window.soundSystem.playRadioClick();
    }

    overlay.classList.remove('closing');
    overlay.classList.add('active');

    // Manage modalStack
    if (modalId === 'modal-more') {
        if (!modalStack.includes('modal-more')) {
            // Opening More fresh: dismiss any unrelated active modals
            document.querySelectorAll('#modalOverlay .modal-content.active').forEach(m => {
                if (m.id !== 'modal-more') {
                    m.classList.remove('active', 'closing', 'modal-stacked-active', 'modal-stacked-behind');
                    m.style.transform = '';
                    m.style.opacity = '';
                    m.style.filter = '';
                    m.style.zIndex = '';
                    m.style.boxShadow = '';
                }
            });
            modalStack = ['modal-more'];
        } else {
            // Already has modal-more in stack; bring to top
            const idx = modalStack.indexOf('modal-more');
            modalStack.splice(idx, 1);
            modalStack.push('modal-more');
        }
    } else if (modalStack.includes('modal-more')) {
        // Parent "More" is open: stack this submodal on top of the stack!
        const existingIdx = modalStack.indexOf(modalId);
        if (existingIdx !== -1) {
            modalStack.splice(existingIdx, 1);
        }
        modalStack.push(modalId);
    } else {
        // More is not in the stack: direct modal opening from dashboard/FAB
        document.querySelectorAll('#modalOverlay .modal-content.active').forEach(m => {
            if (m.id !== modalId) {
                m.classList.remove('active', 'closing', 'modal-stacked-active', 'modal-stacked-behind');
                m.style.transform = '';
                m.style.opacity = '';
                m.style.filter = '';
                m.style.zIndex = '';
                m.style.boxShadow = '';
            }
        });
        modalStack = [modalId];
    }

    modal.classList.remove('closing');
    modal.classList.add('active');

    if (modalId === 'modal-penal') {
        setTimeout(() => {
            const isTraffic = document.getElementById('legal-engine-traffic-pane') && document.getElementById('legal-engine-traffic-pane').style.display !== 'none';
            if (isTraffic && window.app && window.app.updateTrafficCitationSummary) {
                window.app.updateTrafficCitationSummary();
            } else if (window.app && window.app.updateCitationSummary) {
                window.app.updateCitationSummary();
            }
        }, 10);
    }

    updateModalStackLayers();
}

function updateModalStackLayers() {
    const total = modalStack.length;
    if (total === 0) return;

    modalStack.forEach((id, index) => {
        const el = document.getElementById(id);
        if (!el) return;

        const depth = (total - 1) - index; // 0 is top-most active
        el.classList.add('active');
        el.classList.remove('closing');

        // zIndex increases with stack position
        const zIndex = 10010 + index * 10;
        el.style.zIndex = zIndex.toString();

        if (depth === 0) {
            // Active top modal
            el.classList.remove('modal-stacked-behind');
            el.classList.add('modal-stacked-active');
            el.style.transform = 'translate3d(0, 0, 0) scale(1)';
            el.style.opacity = '1';
            el.style.filter = 'none';
            el.style.boxShadow = '0 25px 70px rgba(0, 0, 0, 0.95), 0 0 25px rgba(56, 189, 248, 0.25)';
        } else {
            // Layered behind modal
            el.classList.remove('modal-stacked-active');
            el.classList.add('modal-stacked-behind');

            const translateY = -22 * depth;
            const scale = Math.max(0.88, 1 - depth * 0.035);

            el.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
            el.style.opacity = '1';
            el.style.filter = `brightness(${Math.max(0.65, 0.85 - depth * 0.1)})`;
            el.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.9)';
        }
    });
}

function closeSpecificModal(modalId) {
    if (typeof modalId !== 'string') {
        if (modalId && modalId.id) modalId = modalId.id;
    }
    const modal = document.getElementById(modalId);
    if (!modal) return;

    if (window.soundSystem && (!window.app || window.app.state.soundEnabled !== false)) {
        window.soundSystem.playRadioClick();
    }

    const idx = modalStack.indexOf(modalId);
    if (idx !== -1) {
        modalStack.splice(idx, 1);
    }

    modal.classList.add('closing');

    if (modalId === 'modal-penal') {
        const pCard = document.getElementById('penal-citation-summary');
        const tCard = document.getElementById('traffic-citation-summary');
        if (pCard) pCard.classList.remove('has-charges');
        if (tCard) tCard.classList.remove('has-charges');
    }

    if (modalStack.length === 0) {
        const pCard = document.getElementById('penal-citation-summary');
        const tCard = document.getElementById('traffic-citation-summary');
        if (pCard) pCard.classList.remove('has-charges');
        if (tCard) tCard.classList.remove('has-charges');

        const overlay = document.getElementById('modalOverlay');
        if (overlay) overlay.classList.add('closing');
        setTimeout(() => {
            if (overlay) overlay.classList.remove('active', 'closing');
            modal.classList.remove('active', 'closing', 'modal-stacked-active', 'modal-stacked-behind');
            modal.style.transform = '';
            modal.style.opacity = '';
            modal.style.filter = '';
            modal.style.zIndex = '';
            modal.style.boxShadow = '';
        }, 180);
        return;
    }

    setTimeout(() => {
        modal.classList.remove('active', 'closing', 'modal-stacked-active', 'modal-stacked-behind');
        modal.style.transform = '';
        modal.style.opacity = '';
        modal.style.filter = '';
        modal.style.zIndex = '';
        modal.style.boxShadow = '';
    }, 180);

    updateModalStackLayers();
}

function closeAllModals() {
    const overlay = document.getElementById('modalOverlay');
    if (!overlay) return;

    if (window.soundSystem && (!window.app || window.app.state.soundEnabled !== false)) {
        window.soundSystem.playRadioClick();
    }

    const activeModals = document.querySelectorAll('#modalOverlay .modal-content.active');
    if (activeModals.length === 0) {
        overlay.classList.remove('active', 'closing');
        modalStack = [];
        return;
    }

    overlay.classList.add('closing');
    activeModals.forEach(m => {
        m.classList.add('closing');
        m.classList.remove('modal-stacked-active', 'modal-stacked-behind');
    });

    modalStack = [];

    setTimeout(() => {
        overlay.classList.remove('active', 'closing');
        activeModals.forEach(m => {
            m.classList.remove('active', 'closing');
            m.style.transform = '';
            m.style.opacity = '';
            m.style.filter = '';
            m.style.zIndex = '';
            m.style.boxShadow = '';
        });
    }, 180);
}

function closeModals(targetModal) {
    if (window.event && !targetModal) {
        const parentModal = window.event.target.closest('.modal-content');
        if (parentModal && parentModal.id) {
            targetModal = parentModal.id;
        }
    }
    if (targetModal && typeof targetModal === 'string') {
        closeSpecificModal(targetModal);
        return;
    }
    if (modalStack.length > 1) {
        closeSpecificModal(modalStack[modalStack.length - 1]);
    } else {
        closeAllModals();
    }
}

function handleBackdropClick() {
    if (modalStack.length === 0) {
        closeAllModals();
        return;
    }

    const hasMore = modalStack.includes('modal-more');
    if (hasMore) {
        // Find submodals (any modal in stack other than modal-more)
        const subModals = modalStack.filter(id => id !== 'modal-more');
        if (subModals.length > 0) {
            // Dismiss top submodal first
            let targetToClose = modalStack[modalStack.length - 1];
            if (targetToClose === 'modal-more') {
                targetToClose = subModals[subModals.length - 1];
            }
            closeSpecificModal(targetToClose);
            return;
        } else {
            // No submodals active, only modal-more is open -> close modal-more
            closeAllModals();
            return;
        }
    }

    // If modal-more is not in the stack
    if (modalStack.length > 1) {
        const topId = modalStack[modalStack.length - 1];
        closeSpecificModal(topId);
        return;
    }

    closeAllModals();
}

function switchTab(btn, tabId) {
    const parentHeader = btn.parentElement;
    parentHeader.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const modalBody = parentHeader.nextElementSibling;
    modalBody.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    const targetTab = document.getElementById(tabId);
    if (targetTab) targetTab.classList.add('active');
    if (window.soundSystem && (!window.app || window.app.state.soundEnabled !== false)) {
        window.soundSystem.playRadioClick();
    }
}

function switchRadioTab(tabId) {
    document.querySelectorAll('#modal-radio .tab-content').forEach(c => c.classList.remove('active'));
    const target = document.getElementById(tabId);
    if (target) target.classList.add('active');
    if (window.soundSystem && (!window.app || window.app.state.soundEnabled !== false)) {
        window.soundSystem.playRadioClick();
    }
}

function switchDeptTab(tabId) {
    document.querySelectorAll('.dept-chip').forEach(c => c.classList.remove('active'));
    const chip = document.querySelector(`.dept-chip[data-dept-tab="${tabId}"]`);
    if (chip) chip.classList.add('active');

    document.querySelectorAll('.dept-tab-content').forEach(c => c.classList.remove('active'));
    const target = document.getElementById(tabId);
    if (target) target.classList.add('active');
    if (window.soundSystem && (!window.app || window.app.state.soundEnabled !== false)) {
        window.soundSystem.playRadioClick();
    }
}

function filterPenalCategory(chip, categoryName) {
    document.querySelectorAll('.penal-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');

    const container = document.getElementById('penal-table-body');
    const dataObj = window.SAHP_DATA || window.LSPD_DATA;
    if (!container || !dataObj || !dataObj.penalCodes) return;

    const codes = dataObj.penalCodes;
    const q = (document.getElementById('penal-search-input')?.value || '').toLowerCase().trim();
    const filtered = codes.filter(item => {
        const matchesCat = categoryName === 'ALL' || item.category === categoryName;
        const matchesQuery = !q ||
            item.code.toLowerCase().includes(q) ||
            item.title.toLowerCase().includes(q) ||
            item.remarks.toLowerCase().includes(q);
        return matchesCat && matchesQuery;
    });

    container.innerHTML = filtered.map(item => {
        const isSelected = window.app && window.app.state.selectedCharges.some(c => c.code === item.code);
        return `
            <div class="penal-row ${isSelected ? 'selected' : ''}" onclick="window.app.toggleSelectCharge('${item.code}')">
                <span class="penal-badge-code">${item.code}</span>
                <span style="font-weight:600; color:var(--text-main);">${item.title}</span>
                <span style="color:#34d399; font-weight:700;">${item.fine}</span>
                <span style="color:#38bdf8;">${item.sentence}</span>
                <span class="penal-badge-stars">${item.stars}</span>
                <span>${item.noBail ? '<span class="penal-badge-bail-no">NO BAIL</span>' : '<span class="penal-badge-bail-yes">BAIL OK</span>'}</span>
                <span>
                    <input type="checkbox" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation(); window.app.toggleSelectCharge('${item.code}')" style="cursor:pointer; accent-color:var(--secondary);">
                </span>
            </div>
        `;
    }).join('');

    if (window.soundSystem && (!window.app || window.app.state.soundEnabled !== false)) {
        window.soundSystem.playRadioClick();
    }
}

function filterTrafficCategory(chip, categoryName) {
    document.querySelectorAll('#traffic-categories-bar .penal-chip').forEach(c => c.classList.remove('active'));
    if (chip) chip.classList.add('active');

    if (window.app && window.app.setTrafficCategoryFilter) {
        window.app.setTrafficCategoryFilter(categoryName);
    }
    if (window.soundSystem && (!window.app || window.app.state.soundEnabled !== false)) {
        window.soundSystem.playRadioClick();
    }
}

function filterDresscodes(btn, category) {
    document.querySelectorAll('.dresscode-rank-chip').forEach(c => c.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const cards = document.querySelectorAll('.dresscode-card');
    cards.forEach(card => {
        const tier = card.getAttribute('data-tier') || '';
        if (category === 'ALL' || tier === category) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
    if (window.soundSystem && (!window.app || window.app.state.soundEnabled !== false)) {
        window.soundSystem.playRadioClick();
    }
}

function searchDresscodes(query) {
    const q = (query || '').toLowerCase().trim();
    const cards = document.querySelectorAll('.dresscode-card');
    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (!q || text.includes(q)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

function showNotificationToast(msg, icon = 'content_copy') {
    const toast = document.getElementById('tactical-toast');
    if (!toast) return;
    const msgEl = document.getElementById('toast-message');
    const iconEl = toast.querySelector('.material-symbols-outlined');
    if (msgEl) msgEl.textContent = msg;
    if (iconEl) iconEl.textContent = icon;
    toast.classList.add('active');
    if (window._toastTimer) clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => {
        toast.classList.remove('active');
    }, 2800);
}

function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand('copy');
    } catch (err) {
        console.error('Fallback copy failed', err);
    }
    document.body.removeChild(textArea);
}

function copyToClipboardSilent(text) {
    if (!text) return Promise.resolve();
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text).catch(() => {
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
        return Promise.resolve();
    }
}

function copySimple(text) {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => {
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
    if (window.soundSystem && (!window.app || window.app.state.soundEnabled !== false)) {
        window.soundSystem.playCopyBeep();
    }
    showNotificationToast(`Copied: ${text.length > 55 ? text.substring(0, 52) + '...' : text}`, 'content_copy');
}

function openAboutTeam() {
    openModal('modal-about');
    if (window.soundSystem && (!window.app || window.app.state.soundEnabled !== false)) {
        window.soundSystem.playDutyChime();
    }
}

function closeAboutTeam() {
    closeModals('modal-about');
}

window.toggleDropdown = function(e) {
    if (window.app && window.app.toggleDropdown) {
        window.app.toggleDropdown(e);
    }
};

window.renderBottomNav = function() {
    if (window.app && window.app.renderBottomNav) {
        window.app.renderBottomNav();
    }
};

document.addEventListener('click', (e) => {
    if (!e.target.closest('#main-service-card')) {
        document.getElementById('service-dropdown')?.classList.remove('active');
    }
});

// Click on layered behind modal brings it to top
document.addEventListener('click', (e) => {
    const behindModal = e.target.closest('.modal-content.modal-stacked-behind');
    if (behindModal && behindModal.id && modalStack.includes(behindModal.id)) {
        e.stopPropagation();
        e.preventDefault();
        const idx = modalStack.indexOf(behindModal.id);
        if (idx !== -1) {
            modalStack.splice(idx, 1);
            modalStack.push(behindModal.id);
            updateModalStackLayers();
            if (window.soundSystem && (!window.app || window.app.state.soundEnabled !== false)) {
                window.soundSystem.playRadioClick();
            }
        }
    }
}, true);

// Escape key dismisses modals sequentially
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalStack.length > 0) {
        handleBackdropClick();
    }
});

// =====================================================
// 17. TACTICAL OMNI-SEARCH ENGINE (GLOBAL ACROSS ALL CONTENT)
// =====================================================
let omniSearchIndex = null;
let currentOmniFilter = 'ALL';
let currentOmniSelectedIndex = -1;
let omniDebounceTimer = null;

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function escapeQuote(str) {
    return String(str || '')
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '&quot;')
        .replace(/\n/g, ' ');
}

function highlightMatch(text, query) {
    if (!query || !text) return escapeHtml(text || '');
    const terms = query.trim().split(/\s+/).filter(t => t.length > 0);
    if (terms.length === 0) return escapeHtml(text);
    const escapedTerms = terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(${escapedTerms.join('|')})`, 'gi');
    return escapeHtml(text).replace(regex, '<mark>$1</mark>');
}

function buildOmniSearchIndex() {
    omniSearchIndex = [];

    // 1. Penal Codes
    if (window.SAHP_DATA && Array.isArray(window.SAHP_DATA.penalCodes)) {
        window.SAHP_DATA.penalCodes.forEach(p => {
            omniSearchIndex.push({
                id: 'penal-' + p.code,
                category: 'PENAL',
                badgeClass: 'omni-badge-penal',
                badgeIcon: 'gavel',
                badgeText: 'Penal Code',
                title: `${p.code} - ${p.title}`,
                meta: `${p.category || 'Penal'} • Fine: ${p.fine} • Sentence: ${p.sentence || 'None'} • Class: ${p.class || 'N/A'}`,
                snippet: `${p.code} ${p.title} ${p.fine !== '-' ? '| Fine: ' + p.fine : ''} ${p.sentence !== '-' ? '| Sentence: ' + p.sentence : ''}`,
                copyText: `${p.code} - ${p.title} (${p.fine})`,
                searchStr: `${p.code} ${p.title} ${p.category || ''} ${p.fine || ''} ${p.sentence || ''} ${p.class || ''} ${p.remarks || ''}`.toLowerCase(),
                targetModal: 'modal-penal',
                targetTab: 'penal',
                targetCode: p.code
            });
        });
    }

    // 2. Traffic Codes
    if (window.SAHP_DATA && Array.isArray(window.SAHP_DATA.trafficCodes)) {
        window.SAHP_DATA.trafficCodes.forEach(t => {
            omniSearchIndex.push({
                id: 'traffic-' + t.code,
                category: 'TRAFFIC',
                badgeClass: 'omni-badge-traffic',
                badgeIcon: 'traffic',
                badgeText: 'Traffic Code',
                title: `${t.code} - ${t.title}`,
                meta: `${t.category || 'Traffic'} • Fine: ${t.fine} • Points: ${t.points || '0'} • Impound Fee: ${t.impoundFee ? formatCurrency(t.impoundFee) : 'N/A'}`,
                snippet: `${t.code} ${t.title} | Fine: ${t.fine} | Points: ${t.points || 0}`,
                copyText: `${t.code} - ${t.title} (${t.fine})`,
                searchStr: `${t.code} ${t.title} ${t.category || ''} ${t.fine || ''} ${t.points || ''} ${t.remarks || ''}`.toLowerCase(),
                targetModal: 'modal-penal',
                targetTab: 'traffic',
                targetCode: t.code
            });
        });
    }

    // 3. Article 7 Parking Regulations
    if (window.SAHP_DATA && Array.isArray(window.SAHP_DATA.article7)) {
        window.SAHP_DATA.article7.forEach((a, i) => {
            omniSearchIndex.push({
                id: 'parking-' + i,
                category: 'PARKING',
                badgeClass: 'omni-badge-parking',
                badgeIcon: 'local_parking',
                badgeText: 'Article 7 Parking',
                title: a.title,
                meta: `State of San Andreas Parking Code • ${a.subtitle || 'Article 7'}`,
                snippet: a.rule || a.desc || a.title,
                copyText: `${a.title}: ${a.rule || a.desc || ''}`,
                searchStr: `${a.title} ${a.subtitle || ''} ${a.rule || ''} ${a.desc || ''} parking towing yellow red zone`.toLowerCase(),
                targetModal: 'modal-article7',
                targetTab: null,
                targetCode: null
            });
        });
    }

    // 4. Prohibited Items (§2.4)
    if (window.SAHP_DATA && Array.isArray(window.SAHP_DATA.prohibitedItems)) {
        window.SAHP_DATA.prohibitedItems.forEach((item, i) => {
            omniSearchIndex.push({
                id: 'prohibited-' + i,
                category: 'PARKING',
                badgeClass: 'omni-badge-prohibited',
                badgeIcon: 'do_not_disturb_on',
                badgeText: 'Prohibited §2.4',
                title: item.name || item.title,
                meta: `Contraband Classification: ${item.category || 'Illegal'} • Confiscation: ${item.confiscation ? 'YES' : 'NO'}`,
                snippet: `${item.name} (${item.category || 'Contraband'}) - Fine: ${item.fine || 'Confiscation'}`,
                copyText: `§2.4 Prohibited Item: ${item.name} (${item.category || ''})`,
                searchStr: `${item.name} ${item.category || ''} ${item.legalStatus || ''} ${item.fine || ''} prohibited contraband`.toLowerCase(),
                targetModal: 'modal-prohibited',
                targetTab: null,
                targetCode: null
            });
        });
    }

    // 5. Radio & 10-Codes (Quick Codes + Directory)
    document.querySelectorAll('#modal-radio .quick-codes-grid .quick-code-btn').forEach((btn, i) => {
        const code = btn.querySelector('span:first-child')?.textContent?.trim() || '';
        const sub = btn.querySelector('.code-sub')?.textContent?.trim() || '';
        const clickAttr = btn.getAttribute('onclick') || '';
        const match = clickAttr.match(/copySimple\(['"]([^'"]+)['"]\)/);
        const copyStr = match ? match[1] : `${code} ${sub}`;
        if (code) {
            omniSearchIndex.push({
                id: 'radio-qc-' + i,
                category: 'RADIO',
                badgeClass: 'omni-badge-radio',
                badgeIcon: 'podcasts',
                badgeText: '10-Code Quick',
                title: `${code} - ${sub}`,
                meta: `Radio Quick Transmission Code`,
                snippet: copyStr,
                copyText: copyStr,
                searchStr: `${code} ${sub} ${copyStr} 10-code radio comms`.toLowerCase(),
                targetModal: 'modal-radio',
                targetTab: 'tab-rc-10codes',
                targetCode: code
            });
        }
    });

    document.querySelectorAll('#tab-rc-10codes .rc-table-row').forEach((row, i) => {
        const code = row.querySelector('.rc-code-badge')?.textContent?.trim() || '';
        const desc = row.querySelector('.rc-code-desc')?.textContent?.trim() || '';
        const clickAttr = row.querySelector('button')?.getAttribute('onclick') || '';
        const match = clickAttr.match(/copySimple\(['"]([^'"]+)['"]\)/);
        const copyStr = match ? match[1] : `${code} ${desc}`;
        if (code) {
            omniSearchIndex.push({
                id: 'radio-dir-' + i,
                category: 'RADIO',
                badgeClass: 'omni-badge-radio',
                badgeIcon: 'podcasts',
                badgeText: 'Radio Directory',
                title: `${code}: ${desc}`,
                meta: `Official Radio Protocol • 10-Codes Directory`,
                snippet: copyStr,
                copyText: copyStr,
                searchStr: `${code} ${desc} ${copyStr} radio 10-code`.toLowerCase(),
                targetModal: 'modal-radio',
                targetTab: 'tab-rc-10codes',
                targetCode: code
            });
        }
    });

    // 6. Department Radio Broadcast Calls
    document.querySelectorAll('#modal-radio .dept-tab-content .copy-block').forEach((block, i) => {
        const header = block.querySelector('.copy-header span')?.textContent?.trim() || 'Radio Call';
        const content = block.querySelector('.copy-content')?.textContent?.trim() || '';
        if (content) {
            omniSearchIndex.push({
                id: 'radio-dept-' + i,
                category: 'RADIO',
                badgeClass: 'omni-badge-radio',
                badgeIcon: 'campaign',
                badgeText: 'Dept Radio Call',
                title: header,
                meta: `Inter-Agency & Tactical Radio Protocol`,
                snippet: content,
                copyText: content,
                searchStr: `${header} ${content} radio call broadcast`.toLowerCase(),
                targetModal: 'modal-radio',
                targetTab: 'tab-rc-dept',
                targetCode: null
            });
        }
    });

    // 7. Bodycam Protocols
    document.querySelectorAll('#modal-bodycam .tab-content').forEach(tab => {
        const tabId = tab.id;
        const tabBtn = document.querySelector(`button[onclick*="${tabId}"]`);
        const tabName = tabBtn?.textContent?.trim() || 'Protocol';
        tab.querySelectorAll('.copy-block').forEach((block, i) => {
            const title = block.querySelector('.copy-header span')?.textContent?.trim() || `Step ${i + 1}`;
            const content = block.querySelector('.copy-content')?.textContent?.trim() || '';
            if (content) {
                omniSearchIndex.push({
                    id: 'bodycam-' + tabId + '-' + i,
                    category: 'BODYCAM',
                    badgeClass: 'omni-badge-bodycam',
                    badgeIcon: 'videocam',
                    badgeText: 'Bodycam ' + tabName,
                    title: `${title} (${tabName})`,
                    meta: `Bodycam Sequence • ${tabName} Protocol`,
                    snippet: content,
                    copyText: content,
                    searchStr: `${title} ${tabName} ${content} bodycam protocol /me /do`.toLowerCase(),
                    targetModal: 'modal-bodycam',
                    targetTab: tabId,
                    targetCode: null
                });
            }
        });
    });

    // 8. Roleplay Commands (/me, /do, /try, /todo)
    document.querySelectorAll('#modal-roleplay .tab-content').forEach(tab => {
        const tabId = tab.id;
        const tabBtn = document.querySelector(`button[onclick*="${tabId}"]`);
        const tabName = tabBtn?.textContent?.trim() || 'Roleplay';
        tab.querySelectorAll('.rp-command-block, .copy-block').forEach((block, i) => {
            const header = block.querySelector('.rp-command-header, .copy-header')?.textContent?.trim() || '';
            const text = block.querySelector('.rp-command-text, .copy-content')?.textContent?.trim() || '';
            if (text) {
                omniSearchIndex.push({
                    id: 'rp-' + tabId + '-' + i,
                    category: 'ROLEPLAY',
                    badgeClass: 'omni-badge-rp',
                    badgeIcon: 'psychology',
                    badgeText: 'Roleplay ' + tabName,
                    title: `${header || 'RP Command'} (${tabName})`,
                    meta: `Roleplay Protocol • ${tabName}`,
                    snippet: text,
                    copyText: text,
                    searchStr: `${header} ${tabName} ${text} roleplay /me /do /try /todo sop`.toLowerCase(),
                    targetModal: 'modal-roleplay',
                    targetTab: tabId,
                    targetCode: null
                });
            }
        });
    });

    // 9. Uniforms & Dresscodes
    document.querySelectorAll('#modal-dresscodes .dresscode-card').forEach((card, i) => {
        const rank = card.querySelector('.dresscode-rank-title')?.textContent?.trim() || '';
        const tier = card.querySelector('.dresscode-tier-badge')?.textContent?.trim() || '';
        const items = Array.from(card.querySelectorAll('.dresscode-item-cell')).map(c => {
            const lbl = c.querySelector('.dresscode-item-lbl')?.textContent?.trim() || '';
            const val = c.querySelector('.dresscode-item-val')?.textContent?.trim() || '';
            return `${lbl}: ${val}`;
        }).join(' | ');
        if (rank) {
            omniSearchIndex.push({
                id: 'dress-' + i,
                category: 'DRESS',
                badgeClass: 'omni-badge-dress',
                badgeIcon: 'apparel',
                badgeText: 'Uniform Dresscode',
                title: rank,
                meta: `${tier} • Standard Issue Clothing Numbers`,
                snippet: items || rank,
                copyText: `${rank} Uniform - ${items}`,
                searchStr: `${rank} ${tier} ${items} dresscode uniform clothing`.toLowerCase(),
                targetModal: 'modal-dresscodes',
                targetTab: null,
                targetCode: null
            });
        }
    });
}

function executeOmniSearch(query) {
    if (!omniSearchIndex) buildOmniSearchIndex();

    const q = (query || '').toLowerCase().trim();
    const clearBtn = document.getElementById('omni-clear-btn');
    if (clearBtn) {
        clearBtn.style.display = q ? 'flex' : 'none';
    }

    const countEl = document.getElementById('omni-results-count');
    const container = document.getElementById('omni-search-results');
    if (!container) return;

    if (!q) {
        // Show recommended tactical quick shortcuts
        const shortcuts = omniSearchIndex.filter(item => 
            currentOmniFilter === 'ALL' || item.category === currentOmniFilter
        ).slice(0, 24);

        if (countEl) {
            countEl.textContent = `Tactical Quick Shortcuts (${omniSearchIndex.length} Total Records Indexed)`;
        }
        renderOmniSearchResults(shortcuts, '');
        return;
    }

    const terms = q.split(/\s+/).filter(t => t.length > 0);

    let matches = omniSearchIndex.filter(item => {
        if (currentOmniFilter !== 'ALL' && item.category !== currentOmniFilter) {
            return false;
        }
        return terms.every(term => item.searchStr.includes(term));
    });

    matches.sort((a, b) => {
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();
        const aStarts = aTitle.startsWith(q);
        const bStarts = bTitle.startsWith(q);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return aTitle.indexOf(q) - bTitle.indexOf(q);
    });

    const displayMatches = matches.slice(0, 50);

    if (countEl) {
        countEl.textContent = `Found ${matches.length} matching items`;
    }

    renderOmniSearchResults(displayMatches, query);
}

function renderOmniSearchResults(results, query) {
    const container = document.getElementById('omni-search-results');
    if (!container) return;

    if (results.length === 0) {
        container.innerHTML = `
            <div class="omni-empty-state">
                <span class="material-symbols-outlined">search_off</span>
                <div style="font-size:1.1rem; font-weight:700; color:var(--text-main); margin-bottom:0.3rem;">No Records Found</div>
                <div style="font-size:0.85rem;">Try a different keyword or code (e.g., <code>10-4</code>, <code>speeding</code>, <code>bodycam</code>, <code>/me</code>, <code>parking</code>, <code>cocaine</code>).</div>
            </div>
        `;
        currentOmniSelectedIndex = -1;
        return;
    }

    let html = '';
    results.forEach((item, index) => {
        const highlightedTitle = highlightMatch(item.title, query);
        const highlightedSnippet = highlightMatch(item.snippet, query);
        const selectedClass = index === currentOmniSelectedIndex ? 'selected' : '';

        html += `
            <div class="omni-result-item ${selectedClass}" data-index="${index}" onclick="jumpToOmniTarget('${item.targetModal}', '${item.targetTab || ''}', '${item.targetCode || ''}')">
                <div class="omni-result-top">
                    <span class="omni-result-badge ${item.badgeClass}">
                        <span class="material-symbols-outlined" style="font-size:0.9rem;">${item.badgeIcon}</span>
                        ${item.badgeText}
                    </span>
                    <span class="omni-result-title">${highlightedTitle}</span>
                </div>
                <div class="omni-result-meta">${escapeHtml(item.meta)}</div>
                <div class="omni-snippet">${highlightedSnippet}</div>
                <div class="omni-result-actions" onclick="event.stopPropagation()">
                    <button class="btn btn-secondary btn-sm omni-copy-btn" onclick="copySimple('${escapeQuote(item.copyText)}'); event.stopPropagation();">
                        <span class="material-symbols-outlined" style="font-size:0.95rem;">content_copy</span> Copy
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="jumpToOmniTarget('${item.targetModal}', '${item.targetTab || ''}', '${item.targetCode || ''}'); event.stopPropagation();">
                        <span class="material-symbols-outlined" style="font-size:0.95rem;">launch</span> Jump to Section
                    </button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function updateOmniSelection(results) {
    results.forEach((el, i) => {
        if (i === currentOmniSelectedIndex) {
            el.classList.add('selected');
            el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } else {
            el.classList.remove('selected');
        }
    });
}

function setOmniCategoryFilter(cat) {
    currentOmniFilter = cat;
    document.querySelectorAll('.omni-chip').forEach(btn => {
        if (btn.getAttribute('data-omni-cat') === cat) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    const input = document.getElementById('omni-search-input');
    executeOmniSearch(input ? input.value : '');
}

function clearOmniSearch() {
    const input = document.getElementById('omni-search-input');
    if (input) {
        input.value = '';
        input.focus();
    }
    executeOmniSearch('');
}

function openOmniSearch() {
    openModal('modal-search');
    if (!omniSearchIndex) {
        buildOmniSearchIndex();
    }
    const input = document.getElementById('omni-search-input');
    if (input) {
        setTimeout(() => {
            input.focus();
            input.select();
        }, 60);
    }
    executeOmniSearch(input ? input.value : '');
}

function jumpToOmniTarget(targetModal, targetTab, targetCode) {
    closeModals('modal-search');
    setTimeout(() => {
        openModal(targetModal);
        if (targetModal === 'modal-penal') {
            if (targetTab === 'traffic') {
                if (window.app && window.app.switchLegalEngineTab) {
                    window.app.switchLegalEngineTab('traffic');
                }
                if (targetCode) {
                    const input = document.getElementById('traffic-search-input');
                    if (input) {
                        input.value = targetCode;
                        input.dispatchEvent(new Event('input'));
                    }
                }
            } else {
                if (window.app && window.app.switchLegalEngineTab) {
                    window.app.switchLegalEngineTab('penal');
                }
                if (targetCode) {
                    const input = document.getElementById('penal-search-input');
                    if (input) {
                        input.value = targetCode;
                        input.dispatchEvent(new Event('input'));
                    }
                }
            }
        } else if (targetModal === 'modal-bodycam' && targetTab) {
            const btn = document.querySelector(`button[onclick*="${targetTab}"]`);
            if (btn) switchTab(btn, targetTab);
        } else if (targetModal === 'modal-roleplay' && targetTab) {
            const btn = document.querySelector(`button[onclick*="${targetTab}"]`);
            if (btn) switchTab(btn, targetTab);
        } else if (targetModal === 'modal-radio' && targetTab) {
            switchRadioTab(targetTab);
        }
    }, 150);
}

function initOmniSearch() {
    const input = document.getElementById('omni-search-input');
    if (!input) return;

    input.addEventListener('input', (e) => {
        if (omniDebounceTimer) clearTimeout(omniDebounceTimer);
        omniDebounceTimer = setTimeout(() => {
            currentOmniSelectedIndex = -1;
            executeOmniSearch(e.target.value);
        }, 50);
    });

    input.addEventListener('keydown', (e) => {
        const results = document.querySelectorAll('.omni-result-item');
        if (results.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            currentOmniSelectedIndex = (currentOmniSelectedIndex + 1) % results.length;
            updateOmniSelection(results);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            currentOmniSelectedIndex = (currentOmniSelectedIndex - 1 + results.length) % results.length;
            updateOmniSelection(results);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (currentOmniSelectedIndex >= 0 && currentOmniSelectedIndex < results.length) {
                const targetItem = results[currentOmniSelectedIndex];
                const copyBtn = targetItem.querySelector('.omni-copy-btn');
                if (copyBtn) copyBtn.click();
            } else if (results.length > 0) {
                const copyBtn = results[0].querySelector('.omni-copy-btn');
                if (copyBtn) copyBtn.click();
            }
        }
    });
}

// =====================================================
// 18. GLOBAL TACTICAL IN-GAME KEYBOARD SHORTCUTS
// =====================================================
document.addEventListener('keydown', (e) => {
    // 1. Ctrl+K or Cmd+K: Always open Omni Search (even if focused elsewhere)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openOmniSearch();
        return;
    }

    // 2. Ignore single-key game shortcuts when user is typing in form inputs, textareas, selects, or contenteditables
    const activeEl = document.activeElement;
    const isTyping = activeEl && (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName) ||
        activeEl.isContentEditable
    );
    if (isTyping) return;

    // 3. Ignore if user is pressing browser modifier combinations (Ctrl, Alt, Meta)
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const key = e.key;

    // [/] - Open Tactical Omni-Search Command Palette
    if (key === '/') {
        const searchModal = document.getElementById('modal-search');
        if (!searchModal || !searchModal.classList.contains('active')) {
            e.preventDefault();
            openOmniSearch();
            return;
        }
    }

    // [1] - Bodycam & Protocols
    if (key === '1') {
        e.preventDefault();
        openModal('modal-bodycam');
        return;
    }

    // [2] - Comms & 10-Codes
    if (key === '2') {
        e.preventDefault();
        openModal('modal-radio');
        return;
    }

    // [3] - Roleplay Commands (/me, /do, /try, /todo)
    if (key === '3') {
        e.preventDefault();
        openModal('modal-roleplay');
        return;
    }

    // [4] - Combined Penal Codes & Traffic Codes Engine
    if (key === '4') {
        e.preventDefault();
        openModal('modal-penal');
        return;
    }

    // [5] - Department Utilities ("More" Modal)
    if (key === '5') {
        e.preventDefault();
        openModal('modal-more');
        return;
    }

    // [N] or [n] - Quick Field Notepad
    if (key === 'n' || key === 'N') {
        e.preventDefault();
        openModal('modal-notes');
        return;
    }

    // [T] or [t] - 25-Minute Custody Processing Timer
    if (key === 't' || key === 'T') {
        e.preventDefault();
        openModal('modal-arrest');
        return;
    }

    // [U] or [u] - Toggle Duty Status (Copies 10-8 / 10-9)
    if (key === 'u' || key === 'U') {
        e.preventDefault();
        if (window.app && typeof window.app.toggleDutyStatus === 'function') {
            window.app.toggleDutyStatus();
        }
        return;
    }

    // [M] or [m] - Toggle MDT Audio FX
    if (key === 'm' || key === 'M') {
        e.preventDefault();
        if (window.app && typeof window.app.toggleAudio === 'function') {
            window.app.toggleAudio();
        }
        return;
    }
});

// Expose globals for onclick attributes
window.openOmniSearch = openOmniSearch;
window.clearOmniSearch = clearOmniSearch;
window.setOmniCategoryFilter = setOmniCategoryFilter;
window.jumpToOmniTarget = jumpToOmniTarget;

// Backdrop click listeners to close modal when clicking outside
document.addEventListener('DOMContentLoaded', () => {
    initOmniSearch();

    const overlay = document.getElementById('modalOverlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                handleBackdropClick();
            }
        });
    }

    // Dynamic width observer for .top-bar (< 820px)
    const topBarEl = document.querySelector('.top-bar');
    if (topBarEl && window.ResizeObserver) {
        const topBarObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const width = entry.contentRect.width;
                if (width < 820) {
                    topBarEl.classList.add('compact-topbar');
                } else {
                    topBarEl.classList.remove('compact-topbar');
                }
            }
        });
        topBarObserver.observe(topBarEl);
    }
});
