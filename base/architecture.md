# ARCHITECTURE.md — M.M.APPS BASE ARCHITECTURE (Tap Reflex Evolution)

## 🧠 OVERVIEW

This document defines the complete architecture for apps built under the **M.M.APPS (Massive Retention Casual Apps)** system.

The architecture is designed to ensure:

* High retention
* Fast interaction cycles
* Offline-first capability
* Scalable and reusable structure
* Store compliance (Google Play & Apple App Store)

---

## 🧱 ARCHITECTURE TYPE

Hybrid Architecture combining:

* Feature-Based Structure
* Layered Architecture
* State-Centric Design

---

## 📦 HIGH-LEVEL STRUCTURE

```
Presentation Layer (UI)
↓
Application Layer (State & Logic)
↓
Domain Layer (Game Mechanics)
↓
Infrastructure Layer (Storage, Ads, APIs)
```

---

## 🎯 CORE PRINCIPLES

### 1. RETENTION-FIRST DESIGN

All features must contribute to:

* Repeated usage
* Short session loops
* Psychological engagement

---

### 2. OFFLINE-FIRST

* Core gameplay must NOT depend on internet
* External services must degrade gracefully

---

### 3. LOW LATENCY INTERACTION

* Input response must be immediate (<100ms)
* No blocking operations in UI thread

---

### 4. MODULARITY

* Each feature must be isolated
* Easy to replace or extend

---

## 🧩 LAYER BREAKDOWN

---

### 🖥️ 1. PRESENTATION LAYER

**Responsibility:**

* UI rendering
* User interaction
* Visual feedback

**Includes:**

* Screens
* Components
* Animations

**Rules:**

* No business logic
* No direct data persistence
* Only consumes state

---

### ⚙️ 2. APPLICATION LAYER

**Responsibility:**

* State management
* App flow control
* Session lifecycle

**Technology:**

* Zustand (preferred)

**Includes:**

* Global state
* Actions
* Game session control

---

### 🧠 3. DOMAIN LAYER

**Responsibility:**

* Core game mechanics
* Pure logic (no side effects)

**Includes:**

* Timing engine
* Accuracy calculation
* Difficulty scaling

**Rules:**

* Pure functions only
* Fully testable
* No UI dependency

---

### 🔌 4. INFRASTRUCTURE LAYER

**Responsibility:**

* External integrations
* Persistence
* Ads

**Includes:**

* AsyncStorage
* AdMob integration
* Notification service

**Rules:**

* Replaceable adapters
* Error-safe execution

---

## 🔁 DATA FLOW

```
User Input → UI Component → Store Action → Domain Logic → State Update → UI Re-render
```

---

## 🎮 GAME ENGINE ARCHITECTURE

### CORE MODULES

#### 1. Timing Engine

* Generates target timing
* Controls unpredictability

#### 2. Precision System

* Evaluates user input
* Returns accuracy level

#### 3. Difficulty Engine

* Adjusts speed dynamically
* Based on player performance

---

## 🧠 STATE MANAGEMENT MODEL

### GLOBAL STATE (Zustand)

Must include:

```
- score
- bestScore
- currentLevel
- streak
- coins
- sessionState (idle | playing | finished)
```

---

### ACTIONS

```
- startGame()
- registerTap()
- endGame()
- resetGame()
- updateStreak()
- rewardUser()
```

---

## 🔁 RETENTION ENGINE (MANDATORY)

### COMPONENTS

#### 1. STREAK SYSTEM

* Daily login tracking
* Stored locally

#### 2. REWARD SYSTEM

* Coins / unlockables
* Earned per session

#### 3. VARIABLE REWARD

* Random bonus triggers

#### 4. SESSION HOOK

* Near-miss feedback
* Encourages replay

---

## 💰 MONETIZATION ARCHITECTURE

### ADS INTEGRATION LAYER

Handled via:

```
services/adsService.ts
```

---

### RULES

* Interstitial:

  * Triggered after X sessions
* Rewarded:

  * User-initiated only

---

### FAILSAFE

* App must work if ads fail
* No blocking UI

---

## 📂 FOLDER STRUCTURE STANDARD

```
src/
 ├── components/
 ├── screens/
 ├── store/
 ├── services/
 ├── utils/
 ├── hooks/
 ├── assets/
```

---

## 🎨 UI ARCHITECTURE

### DESIGN SYSTEM

Must include:

* Color tokens
* Typography scale
* Spacing system

---

### FEEDBACK SYSTEM

Each interaction must return:

* Visual response
* Optional haptic feedback

---

## 🔔 NOTIFICATION ARCHITECTURE

### TYPES

* Daily reminder
* Streak alert
* Reward available

---

### IMPLEMENTATION

* Firebase Cloud Messaging
* Local fallback if offline

---

## 🔒 COMPLIANCE LAYER

### REQUIRED FILES

* privacy-policy.md
* terms-of-use.md

---

### DATA HANDLING

* Minimal data collection
* Transparent usage

---

## ⚠️ ERROR HANDLING

### PRINCIPLES

* Never crash
* Silent fallback
* Log errors (if analytics enabled)

---

## 🚀 PERFORMANCE STRATEGY

* Lazy load components
* Minimize re-renders
* Avoid heavy animations in loop

---

## 🧪 TESTABILITY

### DOMAIN LAYER

* Fully unit testable

### APPLICATION LAYER

* State transition tests

---

## 🔄 SCALABILITY

Architecture must support:

* New game modes
* Theming system
* Feature toggles

---

## ✅ SUCCESS VALIDATION

App is valid only if:

* Loads in <2 seconds
* First interaction <3 seconds
* No crashes
* Retention loop active
* Ads integrated correctly

---

## 📌 FINAL NOTE

This architecture is designed for **mass production of casual apps**, not for complex systems.

Priority order:

1. Retention
2. Performance
3. Simplicity
4. Scalability

---

END OF DOCUMENT
