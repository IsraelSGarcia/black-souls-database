# Data Certainty Analysis - Details Section

## Overview

This document analyzes what parts of the data displayed in the details section can be **certain** (directly from source files) versus what is **inferred** (processed, translated, or interpreted).

## Data Sources

The application uses data from:
1. **VX Ace JSON-converted files** (`original-data/vx-ace/json-converted/`) - Primary source (authoritative)
2. **MV-converted files** (`original-data/mv-converted/`) - Secondary source (processed/converted)
3. **Processed data** (`processed-data.json`) - Generated from MV data with translations and interpretations

---

## ✅ CERTAIN DATA (Directly from Source Files)

### 1. Basic Identifiers
- **ID numbers** (`id`) - Directly from data files
- **Names** (`name`) - As stored in original files (may be Japanese)
- **Icon indices** (`iconIndex`) - Direct pixel positions in icon sheets
- **Priority values** (`priority`) - Numeric values from files

### 2. Numeric Values
- **Duration values** (`duration`, `minTurns`, `maxTurns`) - Exact numbers from files
- **Price values** (`price`) - Exact numbers from files
- **Parameter bonuses** (`params[]` array values) - Exact numeric values
- **Trait codes** (`trait.code`) - Exact numeric codes from files
- **Trait data IDs** (`trait.dataId`) - Exact numeric IDs from files
- **Trait values** (`trait.value`) - Exact numeric values from files
- **Removal percentages** (`chanceByDamage`) - Exact percentages from files

### 3. Boolean and Enum Values
- **Auto removal timing** (`autoRemovalTiming`) - Enum values from files
- **Restriction types** (`restriction`) - Enum values from files
- **Removal conditions** (walking, damage, etc.) - Boolean/enum values from files
- **Consumable flags** - Boolean values from files
- **Scope types** - Numeric codes from files

### 4. Raw Text Data
- **Japanese notes** (`note.japanese`) - Original text from files
- **English notes** (`note.english`) - Translated text (certain if translation exists)
- **Descriptions** (`description`) - As stored in files (may be Japanese)
- **Battle messages** (`message1`, `message2`, `message3`, `message4`) - As stored in files

### 5. Raw Trait/Effect Data
- **Trait code numbers** - Exact codes (11, 12, 14, 21, 22, 23, etc.)
- **Data ID numbers** - Exact IDs for parameters, elements, states, etc.
- **Value numbers** - Exact numeric values
- **Effect codes** - Exact codes for skill/item effects

---

## ⚠️ INFERRED/UNCERTAIN DATA (Processed or Interpreted)

### 1. Parameter Names

#### Standard Parameters (0-7) - ✅ CERTAIN
- These are defined in `System.json` and match RPG Maker VX Ace standard:
  - 0: Max HP
  - 1: Max MP
  - 2: Attack
  - 3: Defense
  - 4: Magic Attack
  - 5: Magic Defense
  - 6: Agility
  - 7: Luck

#### Extended Parameters (8-17) - ❌ NOT FULLY MAPPED
- **Status**: Only partially mapped in code
- **Evidence**: Editor screenshots show these parameters exist:
  - 8: HIT (Hit Rate)
  - 9: EVA (Evasion Rate)
  - 10: CRI (Critical Hit Rate)
  - 11: CEV (Critical Evasion Rate)
  - 12: MEV (Magic Evasion Rate)
  - 13: MRF (Magic Reflection Rate)
  - 14: CNT (Counterattack Rate)
  - 15: HRG (HP Regeneration Rate)
  - 16: MRG (MP Regeneration Rate)
  - 17: TRG (TP Regeneration Rate - removed from database)
- **Issue**: Code does not map these parameters, so they would show as "Unknown Parameter"

#### Special Parameters (18-27) - ❌ NOT FULLY MAPPED
- **Status**: Only 4 out of 10+ are mapped
- **Evidence**: Editor screenshots confirm these exist:
  - 18: TGR (Target Rate) - **NOT MAPPED** ❌
  - 19: GRD (Guard Effectiveness) - **NOT MAPPED** ❌
  - 20: REC (Recovery Effectiveness) - **NOT MAPPED** ❌
  - 21: PHA (Pharmacology) - **NOT MAPPED** ❌
  - 22: MCR (MP Cost Rate) - **NOT MAPPED** ❌
  - 23: TCR (TP Charge Rate) - **NOT MAPPED** (TP removed) ❌
  - 24: PDR (Physical Damage Rate) - **NOT MAPPED** ❌
  - 25: MDR (Magical Damage Rate) - **NOT MAPPED** ❌
  - 26: FDR (Floor Damage Rate) - **NOT MAPPED** ❌
  - 27: EXR (Experience Rate) - **MAPPED** ✅
- **Currently Mapped**: Only parameters 16, 27, 35, 39 are defined in code
- **Issue**: Parameters 18-26 would show as "Unknown Parameter" even though they exist in the game

### 2. Trait Descriptions

#### Generated Descriptions - ⚠️ INFERRED
- **Source**: Generated from `code`, `dataId`, and `value` using logic in `process-data.js`
- **Certainty**: Descriptions are **interpretations** of what the trait does, not direct data
- **Examples**:
  - Code 11 + dataId 18 + value 1.5 → "Target Rate +50%" (if parameter 18 was mapped)
  - Code 21 + dataId 3 + value 0.5 → "Takes 50% Fire damage (reduced)"
  - Code 14 + dataId 0 + value 1.2 → "Max HP +20%"

#### Trait Code Names - ⚠️ PARTIALLY CERTAIN
- **Source**: Defined in `stateTraitCodes` object in `process-data.js`
- **Status**: Most common codes are mapped, but unknown codes show as "Unknown Trait"
- **Mapped codes**: 11, 12, 14, 21, 22, 23, 31, 32, 33, 34, 41, 42, 43, 44, 45, 46, 48, 49, 54, 55, 62, 63, 64, 65
- **Unmapped codes**: Would show as "Unknown Trait"

### 3. Element Names

#### Element Translations - ⚠️ INFERRED
- **Source**: Translated from Japanese in `process-data.js`
- **Certainty**: Translations are accurate but may not match in-game terminology
- **Mapped elements**: Physical, Absorption, Fire, Ice, Lightning, Sleep Bonus, Light, Dark, Bleed x2, Beast Bonus, Jabberwock Bonus, Stun x2, Vulnerable Bonus, Fall, Poison Bonus, Rapier Bonus
- **Issue**: If an element ID exists but isn't in the translation map, it would show as empty/unknown

### 4. State/Item/Skill Names in Cross-References

#### Cross-Reference Resolution - ⚠️ INFERRED
- **Source**: Resolved by looking up IDs in other data files
- **Certainty**: Names are certain if the ID exists, but the **relationship** (what the reference means) may be inferred
- **Example**: `[[STATE:2:Poison]]` - State ID 2 exists and name is "Poison", but the context (why it's referenced) is interpreted

### 5. Note Translations

#### English Translations - ⚠️ INFERRED
- **Source**: Pattern matching and translation dictionary in `process-data.js`
- **Certainty**: Translations are generated from patterns, may be incomplete or inaccurate
- **Issue**: Complex Japanese text may not translate correctly
- **Fallback**: If translation fails, shows "(No translation available)"

### 6. Parameter Bonuses Display

#### Parameter Names in Bonuses - ⚠️ PARTIALLY CERTAIN
- **Source**: Hardcoded array `["Max HP", "Max MP", "Attack", "Defense", "Magic Attack", "Magic Defense", "Agility", "Luck"]`
- **Status**: Only covers parameters 0-7
- **Issue**: If a weapon/armor modifies parameters 8+, they would show as "Unknown Parameter X"

### 7. Effect Descriptions

#### Skill/Item Effect Descriptions - ⚠️ INFERRED
- **Source**: Generated from effect codes and values
- **Certainty**: Descriptions are interpretations of what the effect does
- **Example**: Code 11 + value1 0.5 → "Recover 50% HP" (interpretation of code 11)

---

## 📊 Summary Table

| Data Type | Certainty | Source | Notes |
|-----------|-----------|--------|-------|
| **IDs** | ✅ Certain | Direct from files | All IDs are exact |
| **Names** | ✅ Certain | Direct from files | May be Japanese |
| **Numeric values** | ✅ Certain | Direct from files | All numbers are exact |
| **Trait codes** | ✅ Certain | Direct from files | Exact numeric codes |
| **Trait data IDs** | ✅ Certain | Direct from files | Exact numeric IDs |
| **Trait values** | ✅ Certain | Direct from files | Exact numeric values |
| **Standard parameters (0-7)** | ✅ Certain | System.json + RPG Maker standard | Confirmed |
| **Extended parameters (8-17)** | ❌ Not mapped | Editor screenshots | Would show as "Unknown" |
| **Special parameters (18-27)** | ⚠️ Partially mapped | Editor screenshots | Only 27 mapped, 18-26 missing |
| **Trait descriptions** | ⚠️ Inferred | Generated from code/dataId/value | Interpretations |
| **Element names** | ⚠️ Inferred | Translated from Japanese | May not match game |
| **Note translations** | ⚠️ Inferred | Pattern matching | May be incomplete |
| **Cross-references** | ⚠️ Inferred | ID lookup + context | Names certain, context inferred |
| **Effect descriptions** | ⚠️ Inferred | Generated from codes | Interpretations |

---

## 🎯 What Can We Be CERTAIN Of?

### Absolutely Certain:
1. **All numeric values** - IDs, codes, data IDs, values, prices, durations, etc.
2. **Raw trait data** - Code numbers, data ID numbers, value numbers
3. **Standard parameters (0-7)** - Names are confirmed from System.json
4. **Japanese text** - Original notes and descriptions from files
5. **Basic properties** - Icon indices, priorities, flags, enums

### Partially Certain:
1. **Extended parameters (8-17)** - Known to exist from screenshots, but not mapped in code
2. **Special parameters (18-27)** - Known to exist from screenshots, but only 27 is mapped
3. **Element names** - Translated, but translations may not match game terminology
4. **English notes** - Translated, but may be incomplete

### Uncertain (Inferred):
1. **Trait descriptions** - Generated interpretations of what traits do
2. **Effect descriptions** - Generated interpretations of what effects do
3. **Parameter names beyond standard 8** - Most show as "Unknown Parameter"
4. **Cross-reference context** - Why something references another thing
5. **Complex note translations** - May not translate accurately

---

## 🔍 Recommendations

### For Maximum Certainty:

1. **Always show raw data** - The "Show Original Data" button displays exact `code`, `dataId`, and `value`
2. **Use raw numeric values** - Rely on code/dataId/value rather than descriptions
3. **Verify parameter mappings** - Add mappings for parameters 8-26 based on editor screenshots
4. **Document inferences** - Clearly mark what is inferred vs. certain
5. **Cross-reference sources** - Verify trait descriptions against game behavior

### For Parameter Mapping:

Based on editor screenshots, the following parameters should be added:

```javascript
// Extended Parameters (8-17)
const extendedParamNames = {
    8: "Hit Rate",
    9: "Evasion Rate",
    10: "Critical Hit Rate",
    11: "Critical Evasion Rate",
    12: "Magic Evasion Rate",
    13: "Magic Reflection Rate",
    14: "Counterattack Rate",
    15: "HP Regeneration Rate",
    16: "MP Regeneration Rate",
    // 17: "TP Regeneration Rate" - Removed (TP not in database)
};

// Special Parameters (18-27)
const specialParamNames = {
    18: "Target Rate",           // TGR
    19: "Guard Effectiveness",   // GRD
    20: "Recovery Effectiveness", // REC
    21: "Pharmacology",          // PHA
    22: "MP Cost Rate",          // MCR
    // 23: "TP Charge Rate" - Removed (TP not in database)
    24: "Physical Damage Rate",  // PDR
    25: "Magical Damage Rate",   // MDR
    26: "Floor Damage Rate",     // FDR
    27: "Experience Rate",       // EXR (already mapped)
};
```

---

## 📝 Conclusion

**What we can be CERTAIN of:**
- All numeric values (IDs, codes, data IDs, values)
- Standard parameters 0-7 (names confirmed)
- Raw trait/effect data (code, dataId, value)
- Japanese text (original from files)
- Basic properties (icons, priorities, flags)

**What is INFERRED/UNCERTAIN:**
- Trait descriptions (generated interpretations)
- Parameter names beyond standard 8 (mostly unmapped)
- Element names (translations)
- Note translations (pattern matching)
- Effect descriptions (generated interpretations)

**Key Issue:**
Many parameters (8-26) exist in the game and are visible in editor screenshots, but are not mapped in the code. These would display as "Unknown Parameter" even though they are actual game parameters.

---

*Generated: Analysis of data processing and display logic*
*Sources: process-data.js, script.js, editor screenshots, VX Ace documentation*

