# AKTION TAP — PROJECT CONTEXT

---

## 🧠 PRODUCT OVERVIEW

Aktion Tap is a reflex-based mobile game focused on timing precision, fast feedback and high replayability.

The goal is to create a satisfying loop where the player reacts to timing windows and is rewarded based on accuracy.

---

## 🎯 CORE GAME PILLARS

1. Precision (timing accuracy)
2. Immediate Feedback (visual + haptic)
3. Fast Loop (instant retry, no friction)
4. Progressive Challenge (difficulty scaling)

---

## 🧩 CORE SYSTEMS (MANDATORY ARCHITECTURE)

All features must belong to one of these systems:

### 1. Timing System

* Evaluates player input based on time delta
* Outputs: PERFECT / GOOD / MISS

### 2. Score System

* Calculates points based on accuracy
* Supports scaling and multipliers

### 3. Combo System

* Tracks consecutive success
* Resets on MISS
* Feeds score multiplier (future)

### 4. Feedback System

* Visual feedback (color, animation)
* Haptic feedback (vibration)
* Psychological reinforcement

### 5. Difficulty System (Future)

* Adjusts timing windows
* Controls pacing and challenge

---

## 🏗️ TECHNICAL ARCHITECTURE

Project follows strict separation of concerns:

```bash
/src
  /game
    /engine   → pure logic (no React)
    /state    → global state (Zustand)
    /types    → shared types

  /components → reusable UI
  /screens    → screen-level UI
  /navigation → routing
```

---

## ⚙️ ENGINE RULES (CRITICAL)

* Engine must be pure (no UI, no React)
* No side effects inside engine
* All calculations must be deterministic

---

## 🧠 STATE MANAGEMENT

* Zustand is used as global store
* Store connects UI ↔ Engine
* No business logic inside components

---

## 🎨 UI RULES

* UI must be dumb (presentation only)
* No game logic inside components
* Components only trigger actions

---

## 🚫 FORBIDDEN PRACTICES

* Mixing UI with game logic
* Direct calculations inside components
* Hardcoded magic values outside engine
* Premature features (menus, multiplayer, etc.)

---

## 📊 ROADMAP REFERENCE

See:
roadmap-aktion-tap.md

Current focus:
Sprint 2 — Core Gameplay Expansion

---

## 🧭 DEVELOPMENT PRINCIPLES

* Build systems, not features
* Prioritize game feel over complexity
* Every change must improve the core loop
* Avoid technical debt from shortcuts

---

## 🤖 AI COLLABORATION RULES

When using AI tools:

* Always provide this file as context
* Never accept solutions that break architecture
* Require separation of concerns in every implementation

---

## 🏁 CURRENT STATE

* React Native CLI configured
* Android build stable
* Core loop functional
* Score + Timing system implemented

---

## 🚀 NEXT TARGET

* Improve gameplay feedback
* Refine timing clarity
* Increase engagement through combo system

---

