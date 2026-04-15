# MMAPPS — ROADMAP BASE SYSTEM (V1.0)

## 🎯 PURPOSE

This is the global execution system for ALL apps inside MMAPPS.

It defines:

* Sprint execution rules
* Task validation system
* Quality control
* Git workflow
* Agent behavior

This file MUST be reused across all apps.

---

## 🧠 GLOBAL RULES

The agent MUST:

* NEVER change architecture
* NEVER introduce unnecessary complexity
* ALWAYS prioritize retention and experience
* ALWAYS follow skill.md and architecture.md
* ALWAYS validate before completing tasks

---

## 🚨 SPRINT EXECUTION FLOW

For EACH sprint:

1. Read sprint objective
2. Execute tasks sequentially
3. Validate each task
4. Fix issues before continuing
5. Only proceed when task is 100% compliant
6. Run full sprint validation
7. Execute git process
8. Mark sprint as completed
9. Move to next sprint

---

## 🔍 TASK VALIDATION SYSTEM

### ✅ Functional Validation

* Feature works correctly
* No runtime errors
* No broken navigation
* No UI blocking

### 🎮 Experience Validation

* Feedback is immediate
* Interaction is responsive
* No friction introduced
* Session remains fast (<20s)

### 🧠 Retention Validation

* Improves replayability
* Increases satisfaction
* Creates anticipation or reward

If ANY fails → MUST iterate.

---

## 🧪 SPRINT FINAL VALIDATION

* App builds successfully
* No warnings/errors
* No performance drop
* Loop remains instant
* UX remains frictionless

---

## 🚀 GIT PROCESS

```bash
git add .
git commit -m "feat: sprint X - [description]"
git push
```

---

## 🔁 ROADMAP UPDATE RULE

After sprint completion:

* Mark as ✅ COMPLETED
* Unlock next sprint
* Update progress status

---

## ⚠️ AUTOMATION READY (FUTURE)

This structure is prepared for:

* CLI execution (run-sprint.js)
* Agent-based execution
* Automated validation

BUT must remain manual until process is stable.

---
