# 🚔 San Andreas Highway Patrol (SAHP) MDT Companion

![Project Header](https://img.shields.io/badge/SAHP-MDT%20Companion-blue)
![Version](https://img.shields.io/badge/Version-2.5-gold)
![Platform](https://img.shields.io/badge/Platform-Desktop%20%7C%20Tablet%20%7C%20Mobile%20%7C%20Overlay-brightgreen)
![Hosting](https://img.shields.io/badge/Firebase-Hosting-orange)
![License](https://img.shields.io/badge/Roleplay-Grand%20RP%20(EN3)-red)

> **Official Mobile Data Terminal (MDT) & Tactical Field Companion for the San Andreas Highway Patrol (SAHP) on Grand RP.**  
> Built from the **Official EN3 Highway Patrol Guidebook & Penal Code Index**.

🌐 **Live Production App**: [https://sahp-companion-gtav-grp.web.app](https://sahp-companion-gtav-grp.web.app)

---

## 📑 Table of Contents
1. [Overview & Tactical UI](#-overview--tactical-ui)
2. [Top Bar & Duty Management](#-top-bar--duty-management)
3. [Main Dashboard Modules](#-main-dashboard-modules)
   - [Bodycam & Shift Protocols](#1-bodycam--shift-protocols)
   - [Comms & 10-Codes Directory](#2-comms--10-codes-directory)
   - [Roleplay (RP) Commands & SOPs](#3-roleplay-rp-commands--sops)
   - [Unified Penal & Traffic Code Engine](#4-unified-penal--traffic-code-engine)
   - [Department Utilities ("More" Modal)](#5-department-utilities-more-modal)
4. [Floating Action Bar (FAB) Tactical Dock](#-floating-action-bar-fab-tactical-dock)
5. [Universal Tactical Omni-Search (Ctrl+K)](#-universal-tactical-omni-search-ctrlk)
6. [Multi-Window 3D Modal Stacking Architecture](#-multi-window-3d-modal-stacking-architecture)
7. [Field Notepad & Suspect Logging](#-field-notepad--suspect-logging)
8. [Settings, Sound FX & Backup](#-settings-sound-fx--backup)
9. [Keyboard Shortcuts Cheatsheet](#-keyboard-shortcuts-cheatsheet)
10. [Local Development & Deployment](#-local-development--deployment)

---

## 🎯 Overview & Tactical UI

The **SAHP Companion** is a hardware-accelerated, high-performance MDT designed for troopers operating in high-stress, fast-paced patrols. Whether running high-speed pursuits on Senora Freeway, processing 10-15s at Paleto Bay, or issuing PDA citations, this companion provides instantaneous lookups, automated clipboard formatting, and audio-tactile feedback.

### Key Highlights
- **High-Contrast Dark Tactical Theme**: Built with `#090e1a` solid opaque surfaces, cyber blue (`#38bdf8`) accents, gold badge highlights, and zero eye-strain.
- **De-Jittered GPU Animation**: 60fps hardware-accelerated cubic-bezier transitions (`translate3d`).
- **No-Overlap Floating Action Dock**: Dedicated bottom clearance ensures floating controls never obscure cards or modal footers.
- **Zero Framework Bloat**: Pure Vanilla Web Stack (HTML5, Vanilla CSS, ES6+ JS) with zero latency.

---

## 🛡️ Top Bar & Duty Management

The Top Navigation Bar gives troopers real-time situational awareness:

### 1. Live Clocks
- **In-Character (IC) Time**: 1:1 synchronization with the in-game server clock for accurate citation logging and arrest timestamps.
- **Local Time**: Displays your real-world timezone for shift coordination.

### 2. Officer Identity & Profile
- Clickable Officer Pill displaying your **Callsign**, **Badge ID**, and **Rank**.
- Clicking the pill opens **Settings & Profile Config** for rapid updating.

### 3. One-Click Smart Duty Toggle
- Replaced cumbersome text buttons with an instantaneous **Tactical Duty Icon Button**:
  - **On-Duty Check**: Verifies that your **Badge ID** and **Job/Department Type** (e.g., Patrol, Speed Enforcement, High Command) are configured before going on duty.
  - **Clipboard Automation**: Automatically formats and copies the official SAHP Discord duty log format to your clipboard:
    - **On Duty**: `10-8 {Job Type} {Badge ID} {Current IC Time}`
    - **Off Duty**: `10-9 {Job Type} {Badge ID} {Current IC Time}`
  - Visual pulse indicator shifts between Glowing Green (`ON DUTY`) and Stealth Grey (`OFF DUTY`).

---

## 📋 Main Dashboard Modules

### 1. 📹 Bodycam & Shift Protocols
A step-by-step verification pipeline enforcing legal admissibility of patrol footage in court and administrative reviews:
- **8 Dedicated Protocol Tabs**:
  1. **Uniform (Chest Mount)**: Step-by-step attachment, recording start, red light verification, cell tower sync.
  2. **Undercover / Detective**: Concealed collar/button camera protocols.
  3. **Refresh Protocol**: Mid-shift memory flush and battery swap sequence.
  4. **Save & Cloud Upload**: Cloud server sync and permanent timestamp archival.
  5. **Finishing Shift**: Safe power down and dock charging sequence.
  6. **Drone Surveillance**: Aerial thermal/visual recording protocol.
  7. **Footage to Lawyer / DOJ**: Chain of custody transfer to state defense attorneys.
  8. **Traffic Stop & VIN Verification**: Physical bodycam angle check and license plate camera alignment.
- **Progressive Locking**: Steps unlock sequentially to guarantee troopers never skip essential roleplay checks.
- **1-Click Copy**: Copies `/me` and `/do` commands instantly with sound feedback.

### 2. 📻 Comms & 10-Codes Directory
High-speed communication hub conforming strictly to the official SAHP frequency guide:
- **Tactical Quick-Codes Grid**: 1-click transmission templates for urgent comms:
  - `10-4` (Affirmative) • `10-2` (Negative) • `10-8` (Available) • `10-7` (AFK) • `10-9` (Unavailable)
  - `10-10` (Shots Fired!) • `TANGO 10-10` (Training Shots) • `10-11` (Robbery in Progress)
  - `10-13` (OFFICER DOWN! All Units Respond!) • `10-15` (Suspect Secured in Custody)
  - `10-20` (Location Check) • `10-23` (Arrived on Scene) • `10-32` (Backup Requested)
  - `10-80` (Vehicle Pursuit) • `10-80F` (Foot Pursuit) • `10-99` (Concluded)
  - `Code 1 - 7` Alert Levels (Life-Threatening, Emergency, Terrorist Attack, Investigation).
- **Inter-Agency Department Calls**: Tabbed radio call generator for communicating with **DOJ**, **FIB**, **EMS**, **GOV**, **DOC Prison**, **Bank Robberies**, and **Carrier/Submarine** emergencies.

### 3. 🧠 Roleplay (RP) Commands & SOPs
Standard Operating Procedures (SOP) with pre-formatted `/me`, `/do`, `/try`, and `/todo` commands:
- **HR Contracts**: Employment contract signing, new hire onboarding, and promotion paperwork.
- **Arrest & Custody**: Suspect pat-down, handcuffing, reading Miranda Rights, vehicle placement, and processing at cells.
- **Traffic Stop & Search**: Driver interaction, license check, breathalyzer, trunk inspection, and impound requests.
- **Field Sobriety / DUI**: Horizontal gaze nystagmus, walk-and-turn test, and chemical drug testing.
- **Medical Triage**: Basic first aid, tourniquet application, and handing over injured suspects to EMS.

### 4. ⚖️ Unified Penal & Traffic Code Engine
Consolidated 2-in-1 legal calculator combining the full **San Andreas Penal Code** and **Traffic Enforcement Code**:
- **Tab Switcher**: Seamlessly toggle between **Penal Code** and **Traffic Violations** without losing your citation state.
- **135+ Penal Codes Indexed**: Complete database spanning Crimes Against Persons, Property, Society, State, and Weapons Violations.
- **Automated Calculations**:
  - Select multiple infractions with checkboxes.
  - Automatically calculates cumulative **Fines ($)** and **Prison Sentences (Months)**.
  - Identifies **Felony Classifications** (Class A, B, C, D) and **Star Levels** (⭐).
  - Displays **Bail Eligibility** / No-Bail conditions.
- **Traffic Code Engine**:
  - Live search across moving violations, reckless driving, illegal parking, and license suspensions.
  - Displays **Demerit Points**, **Fines**, and **Impound Fees**.
  - Includes **"Transfer to Penal Engine"** feature to combine traffic citations with criminal charges into a single grand total.
- **1-Click PDA Citation Formatter**: Generates ready-to-paste text formatted for the in-game Grand RP PDA citation entry field:
  ```text
  P.C. 1.2.1 Armed Robbery | P.C. 3.1.2 Evading Police | Fine: $85,000 | Time: 45m
  ```

### 5. 📁 Department Utilities ("More" Modal)
Secondary tactical utilities bundled into a clean drawer modal:
- **⏱️ 25-Min Custody Arrest Timer**: Legal custody countdown timer ensuring suspects are charged before the statutory 25-minute limit expires. Includes **Lawyer Request Pause (+10m)** and **Medical Treatment Pause**.
- **👔 Uniform & Dress Codes**: Comprehensive clothing numbers for ranks 3 through 22 (Trainees, Troopers, Senior Troopers, Sergeants, Lieutenants, and High Command).
- **🅿️ Article 7 Parking Regulations**: Official parking maps, red/yellow zone towing conditions, and impound fine charts.
- **🚫 Prohibited Items (§2.4)**: Complete catalog of Class-A illegal narcotics, modified armors, lockpicks, signal scanners, and unregistered weaponry.
- **📝 Field Notepad**: Dedicated officer scratchpad with live auto-saving.
- **⚙️ Settings & Profile**: Call-sign customization, Discord channel webhooks, sound FX toggles, and JSON database export/import.
- **🛡️ About SAHP**: Department doctrine, jurisdiction maps, and companion manual.

---

## 🕹️ Floating Action Bar (FAB) Tactical Dock

Floating at the bottom center of the viewport, the **Consolidated Tactical Dock** provides thumb and mouse access to vital MDT tools:

```
[ 🔍 Omni Search ]  [ 📝 Notepad ]  [ ⚖️ Penal Engine ]  [ ⏱️ Custody Timer ]  [ 🔊 Audio FX ]  [ 🛡️ About ]
```

- **Highest Layer Stacking (`z-index: 100050`)**: Always visible and accessible on top of any active modal.
- **Zero Content Overlap**: Both the dashboard main container and modal backdrop feature dedicated padding (up to `86px`), preventing the dock from ever covering buttons, text, or inputs.
- **Live Arrest Badge**: Displays the active countdown (e.g. `24:15`) in bright glowing red directly on the dock icon when a suspect is in custody.

---

## 🔍 Universal Tactical Omni-Search (`Ctrl+K`)

The **Tactical Omni-Search** is a global Command Palette that indexes **everything** in the application in real-time.

### Features
- **Global Index (320+ Records)**:
  - All 135+ Penal Codes
  - All 40+ Traffic Codes
  - All 48+ Radio & 10-Codes
  - All Bodycam steps and `/me` commands
  - All Roleplay SOP commands
  - All Article 7 Parking regulations & Prohibited items
  - All Uniform dress codes
- **Instant Search with Keyword Highlighting**: Sub-millisecond filtering with yellow `<mark>` highlighting matching search terms.
- **Category Filter Chips**: Filter results by `ALL`, `PENAL`, `TRAFFIC`, `10-CODES`, `BODYCAM`, `ROLEPLAY`, `REGULATIONS`, or `UNIFORMS`.
- **1-Click Copy**: Copies the command or citation directly to your clipboard.
- **Jump to Section**: Automatically closes search, opens the relevant modal, switches to that exact tab, and filters to that charge!
- **Keyboard Navigation**:
  - `Ctrl + K` or `Cmd + K` or `/` opens Omni Search from anywhere.
  - `↑` and `↓` arrow keys cycle through search results with visual highlight.
  - `Enter` triggers instant copy of the selected item.
  - `ESC` closes the search palette.

---

## 🪟 Multi-Window 3D Modal Stacking Architecture

The companion features an advanced window-stacking engine:
- **Non-Closing Submodals**: Opening tools from inside the "More" modal does **not** close the "More" modal. Troopers can open multiple submodals (e.g., Arrest Timer, Field Notepad, Settings) simultaneously.
- **Solid High-Contrast Backgrounds (`#090e1a`)**: Modals are 100% opaque, ensuring underlying cards or lower windows never bleed through.
- **3D Layering & Depth Offset**:
  - **Active Top Modal**: `scale(1)`, `translate3d(0, 0, 0)`, full focus, glowing cyan border.
  - **Background Stacked Modals**: Peeks out cleanly above with `translate3d(0, -22px * depth, 0)`, `scale(0.88)`, and dimmed brightness (`brightness(0.75)`).
- **Click to Focus**: Clicking on any background modal peeking from behind instantly glides it to the top.
- **Sequential Outside Dismissal**:
  - Clicking outside the modals dismisses the **top-most submodal first**.
  - Subsequent clicks outside dismiss lower submodals one-by-one.
  - When no submodals remain active, the next click outside closes the parent "More" modal.

---

## 📝 Field Notepad & Suspect Logging

- **Instant Auto-Save**: Preserves your notes in browser `localStorage` across page refreshes and reboots.
- **Insert IC Timestamp**: Inserts the exact In-Character timestamp `[HH:MM IC]` at your cursor with one click.
- **Notepad Toolbar**:
  - `Copy All`: Formats the entire notepad content to clipboard.
  - `Clear`: Empties the pad with a safety confirmation.
  - Character and word counter.
  - Auto-save pulse indicator.

---

## ⚙️ Settings, Sound FX & Backup

- **Trooper Profile**: Set your Officer Name, Callsign, Badge ID, and Assigned Department.
- **Sound FX Engine**: Authentic tactical police radio chirps, clipboard copy clicks, and custody alert alarms (can be toggled on/off).
- **Discord Integration**: Configure custom webhook URLs for departmental channels (`#sahp-duty-logs`, `#citation-records`, `#tow-logs`).
- **Database Backup & Migration**:
  - **Export DB**: Downloads all your notes, custom charges, and settings as a `.json` backup file.
  - **Import DB**: Restores your settings on any new device or browser with one click.
  - **Factory Reset**: Restores original factory guide defaults.

---

## ⌨️ In-Game Tactical Keyboard Shortcuts Cheatsheet

Interactive gaming-style HUD keycap badges are visible directly across the terminal layout:

| HUD Keycap | Hotkey | Context | Action |
| :---: | :--- | :--- | :--- |
| `[1]` | `1` | Global (Dashboard) | Open **Bodycam & Protocols** |
| `[2]` | `2` | Global (Dashboard) | Open **Comms & 10-Codes Directory** |
| `[3]` | `3` | Global (Dashboard) | Open **Roleplay Commands (/me, /do, /try, /todo)** |
| `[4]` | `4` | Global (Dashboard / Dock) | Open **Penal & Traffic Codes Engine** |
| `[5]` | `5` | Global (Dashboard) | Open **Department Utilities ("More" Modal)** |
| `[N]` | `N` | Tactical Dock | Open **Quick Field Notepad** |
| `[T]` | `T` | Tactical Dock | Open **25-Minute Custody Processing Timer** |
| `[U]` | `U` | Top Status Bar | Toggle **Duty Status** (Copies 10-8 / 10-9 to clipboard) |
| `[M]` | `M` | Tactical Dock | Toggle **MDT Audio FX** (Mute / Unmute radio chirps) |
| `[^K]` or `[/]` | `Ctrl + K` or `/` | Global | Open **Tactical Omni-Search Command Palette** |
| `[ESC]` | `Escape` | Active Modals | Sequentially dismiss top modal / exit search |
| `[↑]` `[↓]` | Arrow Keys | Omni-Search | Navigate search results list |
| `[ENTER]` | Enter Key | Omni-Search | Instant-copy selected command or jump to target |

---

## 🚀 Local Development & Deployment

### Running Locally
To test the application locally without building:

```bash
# Using Python
python -m http.server 8083 --directory "SAHP Companion"

# Using Node http-server
npx http-server "SAHP Companion" -p 8083
```
Open your browser at `http://localhost:8083`.

### Deploying to Firebase
Deploy updates to the dedicated Firebase Hosting target:

```bash
# Deploy only SAHP Companion
npx firebase-tools deploy --only hosting:sahp-companion
```

---

## 📄 Documentation & Credits
- Built for the **Grand RP (GRP) Community**.
- Conformed to the official **EN3 San Andreas Highway Patrol Guidelines**.
- Maintained by and for SAHP Troopers, Supervisors, and High Command.
