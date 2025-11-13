# Fixing Ignored Data ID/Value Issues

This guide explains how to fix the 1348+ instances where trait data (code, dataId, value) exists but is not meaningfully used in descriptions.

## Current Status

Based on the detection report, the top issues are:

1. **Code 43 (Add Skill)**: 522 instances - dataId = skill ID, value = not used
2. **Code 32 (Attack State)**: 332 instances - dataId = state ID, value = rate (0-1)
3. **Code 14 (State Resist)**: 233 instances - **HAS HANDLER BUT BUGGY** - treating dataId as parameter when it should be state ID
4. **Code 11 (Element Rate)**: 63 instances - dataId = element ID, value = rate (0-1)
5. **Code 31 (Attack Element)**: 47 instances - dataId = element ID, value = not used
6. **Code 61 (Action Times+)**: 42 instances - dataId = not used, value = flat add (integer)
7. **Code 44 (Seal Skill)**: 37 instances - dataId = skill ID, value = not used
8. **Code 12 (Debuff Rate)**: 36 instances - dataId = parameter ID (0-7), value = rate (0-1)

## How to Fix

### Step 1: Update `processTraits` Function Signature

Currently, `processTraits` only receives `statesData`. We need to pass additional data:

**Current:**
```javascript
function processTraits(traits, statesData) {
```

**Should be:**
```javascript
function processTraits(traits, statesData, skillsData, elements) {
```

**Update all calls to `processTraits`:**
- In `processedStates`: `processTraits(state.traits, statesData)` → `processTraits(state.traits, statesData, skillsData, elements)`
- In `processedWeapons`: `processTraits(filteredWeaponTraits, statesData)` → `processTraits(filteredWeaponTraits, statesData, skillsData, elements)`
- In `processedArmors`: `processTraits(armor.traits || [], statesData)` → `processTraits(armor.traits || [], statesData, skillsData, elements)`
- In `processedEnemies`: `processTraits(enemy.traits || [], statesData)` → `processTraits(enemy.traits || [], statesData, skillsData, elements)`

### Step 2: Fix Code 14 (State Resist) - BUG FIX

**Current bug:** Code 14 is treating `dataId` as a parameter ID, but it should be a state ID.

**Current code (WRONG):**
```javascript
} else if (trait.code === 14) { // State Resist
    const paramName = parameterNames[trait.dataId] || extendedParamNames[trait.dataId] || `Unknown Parameter`;
    // ... uses parameter names
}
```

**Should be:**
```javascript
} else if (trait.code === 14) { // State Resist
    const state = statesData.find(s => s && s.id === trait.dataId);
    const stateName = state?.name || "Unknown State";
    const stateRef = `[[STATE:${trait.dataId}:${stateName}]]`;
    const percent = Math.round((trait.value - 1) * 100);
    
    if (trait.value === 0) {
        traitInfo.description = `Immune to ${stateRef}`;
    } else if (trait.value === 1) {
        traitInfo.description = `Normal ${stateRef} susceptibility`;
    } else if (trait.value > 1) {
        traitInfo.description = `${stateRef} +${percent}% susceptibility`;
    } else {
        traitInfo.description = `${Math.abs(percent)}% resistance to ${stateRef}`;
    }
}
```

### Step 3: Add Handler for Code 43 (Add Skill) - HIGHEST PRIORITY

**Priority:** Highest (522 instances)

**dataId usage:** Skill ID
**value usage:** Not used (always 0)

**Implementation:**
```javascript
} else if (trait.code === 43) { // Add Skill
    const skill = skillsData.find(s => s && s.id === trait.dataId);
    const skillName = skill?.name || "Unknown Skill";
    const skillRef = `[[SKILL:${trait.dataId}:${skillName}]]`;
    traitInfo.description = `Add ${skillRef}`;
}
```

### Step 4: Add Handler for Code 32 (Attack State) - HIGH PRIORITY

**Priority:** High (332 instances)

**dataId usage:** State ID
**value usage:** Rate (0.0-1.0, where 1.0 = 100%)

**Implementation:**
```javascript
} else if (trait.code === 32) { // Attack State
    const state = statesData.find(s => s && s.id === trait.dataId);
    const stateName = state?.name || "Unknown State";
    const stateRef = `[[STATE:${trait.dataId}:${stateName}]]`;
    const chance = Math.round(trait.value * 100);
    
    if (trait.value === 0) {
        traitInfo.description = `Never inflicts ${stateRef}`;
    } else if (trait.value === 1) {
        traitInfo.description = `Always inflicts ${stateRef}`;
    } else {
        traitInfo.description = `${chance}% chance to inflict ${stateRef}`;
    }
}
```

### Step 5: Add Handler for Code 11 (Element Rate) - MEDIUM PRIORITY

**Priority:** Medium (63 instances)

**dataId usage:** Element ID
**value usage:** Rate (0.0-1.0+, where 1.0 = 100%)

**Implementation:**
```javascript
} else if (trait.code === 11) { // Element Rate
    const elementName = elements[trait.dataId] || "";
    if (!elementName || elementName.trim() === "") {
        const damagePercent = Math.round(trait.value * 100);
        if (trait.value === 0) {
            traitInfo.description = `Immune to unknown element damage`;
        } else if (trait.value < 1) {
            traitInfo.description = `Takes ${damagePercent}% unknown element damage (reduced)`;
        } else if (trait.value > 1) {
            traitInfo.description = `Takes ${damagePercent}% unknown element damage (increased)`;
        } else {
            traitInfo.description = `Takes normal unknown element damage`;
        }
        return traitInfo;
    }
    
    const damagePercent = Math.round(trait.value * 100);
    if (trait.value === 0) {
        traitInfo.description = `Immune to ${elementName} damage`;
    } else if (trait.value < 1) {
        traitInfo.description = `Takes ${damagePercent}% ${elementName} damage (reduced)`;
    } else if (trait.value > 1) {
        traitInfo.description = `Takes ${damagePercent}% ${elementName} damage (increased)`;
    } else {
        traitInfo.description = `Takes normal ${elementName} damage`;
    }
}
```

### Step 6: Add Handler for Code 31 (Attack Element) - MEDIUM PRIORITY

**Priority:** Medium (47 instances)

**dataId usage:** Element ID
**value usage:** Not used

**Implementation:**
```javascript
} else if (trait.code === 31) { // Attack Element
    const elementName = elements[trait.dataId] || "";
    if (!elementName || elementName.trim() === "") {
        traitInfo.description = `Attack has unknown element`;
        return traitInfo;
    }
    traitInfo.description = `Attack has ${elementName} element`;
}
```

### Step 7: Add Handler for Code 61 (Action Times+) - MEDIUM PRIORITY

**Priority:** Medium (42 instances)

**dataId usage:** Not used
**value usage:** Flat add (integer, e.g., 1 = +1 action)

**Implementation:**
```javascript
} else if (trait.code === 61) { // Action Times+
    const times = Math.round(trait.value);
    if (times === 0) {
        traitInfo.description = `Action times unchanged`;
    } else if (times > 0) {
        traitInfo.description = `+${times} action${times === 1 ? '' : 's'} per turn`;
    } else {
        traitInfo.description = `${times} actions per turn`;
    }
}
```

### Step 8: Add Handler for Code 44 (Seal Skill) - MEDIUM PRIORITY

**Priority:** Medium (37 instances)

**dataId usage:** Skill ID
**value usage:** Not used

**Implementation:**
```javascript
} else if (trait.code === 44) { // Seal Skill
    const skill = skillsData.find(s => s && s.id === trait.dataId);
    const skillName = skill?.name || "Unknown Skill";
    const skillRef = `[[SKILL:${trait.dataId}:${skillName}]]`;
    traitInfo.description = `Seal ${skillRef}`;
}
```

### Step 9: Add Handler for Code 12 (Debuff Rate) - MEDIUM PRIORITY

**Priority:** Medium (36 instances)

**dataId usage:** Parameter ID (0-7: standard parameters)
**value usage:** Rate (0.0-1.0, where 1.0 = 100%)

**Implementation:**
```javascript
} else if (trait.code === 12) { // Debuff Rate
    const paramName = parameterNames[trait.dataId] || `Parameter ${trait.dataId}`;
    const rate = Math.round(trait.value * 100);
    
    if (trait.value === 0) {
        traitInfo.description = `Immune to ${paramName} debuffs`;
    } else if (trait.value === 1) {
        traitInfo.description = `Normal ${paramName} debuff susceptibility`;
    } else if (trait.value < 1) {
        traitInfo.description = `${rate}% ${paramName} debuff rate (reduced)`;
    } else {
        traitInfo.description = `${rate}% ${paramName} debuff rate (increased)`;
    }
}
```

## Implementation Order (Recommended)

1. **Fix Code 14 bug first** (233 instances) - This is a bug fix, not a new feature
2. **Add Code 43 handler** (522 instances) - Highest impact
3. **Add Code 32 handler** (332 instances) - Second highest impact
4. **Add Code 11 handler** (63 instances)
5. **Add Code 31 handler** (47 instances)
6. **Add Code 61 handler** (42 instances)
7. **Add Code 44 handler** (37 instances)
8. **Add Code 12 handler** (36 instances)

## Additional Codes to Consider

After fixing the above, consider adding handlers for:

- **Code 33 (Attack Speed)**: dataId not used, value = flat add (integer)
- **Code 34 (Attack Times+)**: dataId not used, value = flat add (integer)
- **Code 41 (Add Skill Type)**: dataId = skill type ID, value not used
- **Code 42 (Seal Skill Type)**: dataId = skill type ID, value not used
- **Code 51-55 (Equip traits)**: Various equipment-related traits
- **Code 62-64 (Other traits)**: Special flags and abilities

## Testing

After adding each handler:

1. Run `node app/process-data.js --report-ignored` to see if instances decreased
2. Check that descriptions are meaningful (not just codeName)
3. Verify cross-references are properly marked (e.g., `[[SKILL:123:Skill Name]]`)
4. Ensure no new errors are introduced

## Example: Complete Handler Addition

Here's how to add Code 43 (Add Skill) handler:

1. **Update function signature:**
```javascript
function processTraits(traits, statesData, skillsData, elements) {
```

2. **Add handler before the fallback:**
```javascript
} else if (trait.code === 43) { // Add Skill
    const skill = skillsData.find(s => s && s.id === trait.dataId);
    const skillName = skill?.name || "Unknown Skill";
    const skillRef = `[[SKILL:${trait.dataId}:${skillName}]]`;
    traitInfo.description = `Add ${skillRef}`;
} else if (trait.code === 42) { // Collapse Type
    // ... existing code
}
```

3. **Update all function calls:**
```javascript
// In processedStates
const traits = processTraits(state.traits, statesData, skillsData, elements);

// In processedWeapons
const traits = processTraits(filteredWeaponTraits, statesData, skillsData, elements);

// In processedArmors
const traits = processTraits(armor.traits || [], statesData, skillsData, elements);

// In processedEnemies
const traits = processTraits(enemy.traits || [], statesData, skillsData, elements);
```

## Expected Results

After implementing all handlers:

- **Code 43**: 522 instances → 0 instances
- **Code 32**: 332 instances → 0 instances
- **Code 14**: 233 instances → 0 instances (bug fix)
- **Code 11**: 63 instances → 0 instances
- **Code 31**: 47 instances → 0 instances
- **Code 61**: 42 instances → 0 instances
- **Code 44**: 37 instances → 0 instances
- **Code 12**: 36 instances → 0 instances

**Total reduction:** ~1312 instances fixed (out of 1348)

## Notes

- Always use cross-reference markers (`[[TYPE:ID:NAME]]`) for entity references
- Handle missing/unknown entities gracefully (show "Unknown Skill" etc.)
- Format percentages and values clearly
- Test with `--report-ignored` after each change to verify reduction

