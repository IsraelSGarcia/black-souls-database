# Verified Mappings With Sources

This document lists all mappings that have **verified sources** (source is NOT "none"). Mappings without proper sources are excluded from this list.

## Parameter Names

### Standard Parameters (0-7) - Source: system.json

| Parameter ID | Name | Source | Evidence |
|--------------|------|--------|----------|
| 0 | Max HP | system.json | terms.params[0] in System.json |
| 1 | Max MP | system.json | terms.params[1] in System.json |
| 2 | Attack | system.json | terms.params[2] in System.json |
| 3 | Defense | system.json | terms.params[3] in System.json |
| 4 | Magic Attack | system.json | terms.params[4] in System.json |
| 5 | Magic Defense | system.json | terms.params[5] in System.json |
| 6 | Agility | system.json | terms.params[6] in System.json |
| 7 | Luck | system.json | terms.params[7] in System.json |

### Extended Parameters (8-16) - Source: editor-screenshot

| Parameter ID | Name | Source | Evidence | Screenshot |
|--------------|------|--------|----------|------------|
| 8 | Hit Rate | editor-screenshot | Ex-Parameter dropdown shows HIT | 200544.png |
| 9 | Evasion Rate | editor-screenshot | Ex-Parameter dropdown shows EVA | 200544.png |
| 10 | Critical Hit Rate | editor-screenshot | Ex-Parameter dropdown shows CRI | 200544.png |
| 11 | Critical Evasion Rate | editor-screenshot | Ex-Parameter dropdown shows CEV | 200544.png |
| 12 | Magic Evasion Rate | editor-screenshot | Ex-Parameter dropdown shows MEV | 200544.png |
| 13 | Magic Reflection Rate | editor-screenshot | Ex-Parameter dropdown shows MRF | 200544.png |
| 14 | Counterattack Rate | editor-screenshot | Ex-Parameter dropdown shows CNT | 200544.png |
| 15 | HP Regeneration Rate | editor-screenshot | Ex-Parameter dropdown shows HRG | 200544.png |
| 16 | MP Regeneration Rate | editor-screenshot | Ex-Parameter dropdown shows MRG | 200544.png |

### Special Parameters (18-27) - Source: editor-screenshot

| Parameter ID | Name | Source | Evidence | Screenshot |
|--------------|------|--------|----------|------------|
| 18 | Target Rate | editor-screenshot | Sp-Parameter dropdown shows TGR | 200552.png |
| 19 | Guard Effectiveness | editor-screenshot | Sp-Parameter dropdown shows GRD | 200552.png |
| 20 | Recovery Effectiveness | editor-screenshot | Sp-Parameter dropdown shows REC | 200552.png |
| 21 | Pharmacology | editor-screenshot | Sp-Parameter dropdown shows PHA | 200552.png |
| 22 | MP Cost Rate | editor-screenshot | Sp-Parameter dropdown shows MCR | 200552.png |
| 24 | Physical Damage Rate | editor-screenshot | Sp-Parameter dropdown shows PDR | 200552.png |
| 25 | Magical Damage Rate | editor-screenshot | Sp-Parameter dropdown shows MDR | 200552.png |
| 26 | Floor Damage Rate | editor-screenshot | Sp-Parameter dropdown shows FDR | 200552.png |
| 27 | Experience Rate | editor-screenshot | Sp-Parameter dropdown shows EXR | 200552.png |

**Note:** Parameter 17 (TP Regeneration Rate) and Parameter 23 (TP Charge Rate) are removed (TP not in database).

---

## Trait Codes

### Trait Codes with Verified Sources

| Code | Name | Source | Evidence | Screenshot |
|------|------|--------|----------|------------|
| 11 | HP Regeneration | editor-screenshot | Rate tab - HP Regeneration visible | states-features-screenshots |
| 12 | MP Regeneration | editor-screenshot | Rate tab - MP Regeneration visible | states-features-screenshots |
| 14 | Parameter Rate | editor-screenshot | Param tab - Parameter Rate visible | 200530.png |
| 21 | Element Rate | editor-screenshot | Rate tab - Element Rate visible | 200356.png |
| 22 | Debuff Rate | editor-screenshot | Rate tab - Debuff Rate visible | 200407.png |
| 23 | State Rate | editor-screenshot | Rate tab - State Rate visible | states-features-screenshots |
| 41 | Special Flag | editor-screenshot | Other tab - Special Flag visible | 200743.png |
| 42 | Collapse Type | editor-screenshot | Other tab - Collapse Effect visible | 200749.png |
| 43 | Party Ability | editor-screenshot | Other tab - Party Ability visible | 200757.png |
| 54 | Equip Weapon Lock | editor-screenshot | Equip tab - Equip Weapon Lock visible | 200718.png |
| 55 | Equip Armor Lock | editor-screenshot | Equip tab - Equip Armor Lock visible | 200726.png |

### Trait Codes WITHOUT Sources (Will be flagged)

The following trait codes are mapped but have `source: "none"` and will be flagged by the detection system:

- Code 31: Normal Attack Times
- Code 32: Skill Type Seal
- Code 33: Element Seal
- Code 34: Action Times+
- Code 44: Auto Battle
- Code 45: Guard Effect Rate
- Code 46: Substitute
- Code 48: Physical Damage Rate
- Code 49: Magical Damage Rate
- Code 62: Action Speed
- Code 63: Force Action Speed
- Code 64: Buff Turn Rate
- Code 65: Instant Death

---

## Effect Codes

### Effect Codes WITHOUT Sources (All flagged)

All effect codes currently have `source: "none"` and are flagged by the detection system:

- Code 11: Recover HP
- Code 12: Recover MP
- Code 21: Add State
- Code 22: Remove State
- Code 31: Add Buff
- Code 32: Add Debuff
- Code 33: Remove Buff
- Code 34: Remove Debuff
- Code 41: Special Effect
- Code 42: Grow
- Code 43: Learn Skill
- Code 44: Common Event

**Note:** These need source documentation (editor screenshots, RPG Maker documentation, or System.json).

---

## Type Mappings

### Scope Types - NO SOURCES (All flagged)

All scope types have `source: "none"`:

- 0: None
- 1: 1 Enemy
- 2: All Enemies
- 3: Random Enemy (1x)
- 4: Random Enemy (2x)
- 5: Random Enemy (3x)
- 6: Random Enemy (4x)
- 7: 1 Ally
- 8: All Allies
- 9: 1 Ally (Dead)
- 10: All Allies (Dead)
- 11: User
- 12: Everybody
- 13: 1 Ally (Alive)
- 14: All Allies (Alive)

### Hit Types - NO SOURCES (All flagged)

All hit types have `source: "none"`:

- 0: Certain Hit
- 1: Physical Attack
- 2: Magical Attack

### Damage Types - NO SOURCES (All flagged)

All damage types have `source: "none"`:

- 0: None
- 1: HP Damage
- 2: MP Damage
- 3: HP Recover
- 4: MP Recover
- 5: HP Drain
- 6: MP Drain

### Occasion Types - NO SOURCES (All flagged)

All occasion types have `source: "none"`:

- 0: Always
- 1: Battle Screen
- 2: Menu Screen
- 3: Never

### Restriction Types - NO SOURCES (All flagged)

All restriction types have `source: "none"`:

- 0: None
- 1: Cannot Attack
- 2: Cannot Guard
- 3: Cannot Wait
- 4: Cannot Move

### Auto Removal Timings - NO SOURCES (All flagged)

All auto removal timings have `source: "none"`:

- 0: None
- 1: Action End
- 2: Turn End

---

## Summary

### Verified (Have Sources)

- ✅ **8 Standard Parameters** (0-7) - From system.json
- ✅ **9 Extended Parameters** (8-16) - From editor screenshots
- ✅ **9 Special Parameters** (18-27, excluding TP) - From editor screenshots
- ✅ **11 Trait Codes** - From editor screenshots
- ✅ **0 Effect Codes** - None verified
- ✅ **0 Type Mappings** - None verified

### Not Verified (Need Sources)

- ❌ **13 Trait Codes** - Need sources
- ❌ **12 Effect Codes** - Need sources
- ❌ **15 Scope Types** - Need sources
- ❌ **3 Hit Types** - Need sources
- ❌ **7 Damage Types** - Need sources
- ❌ **4 Occasion Types** - Need sources
- ❌ **5 Restriction Types** - Need sources
- ❌ **3 Auto Removal Timings** - Need sources

### Total Verified: 37 mappings
### Total Need Sources: 62 mappings

---

## What "Goes Through" (Verified Information)

Only the following information is verified and can be trusted:

1. **Standard Parameters (0-7)** - Verified from System.json
2. **Extended Parameters (8-16)** - Verified from editor screenshots
3. **Special Parameters (18-27)** - Verified from editor screenshots
4. **11 Trait Codes** - Verified from editor screenshots

**Everything else** (effect codes, type mappings, remaining trait codes) is currently **unverified** and will be flagged by the detection system until proper sources are documented.

---

*This file is automatically generated based on source registries in process-mv-converted-data.js. Only mappings with `source !== "none"` are included.*

