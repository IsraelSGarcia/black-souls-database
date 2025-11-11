# Source Verification System

## Overview

The enhanced detection system now **challenges ALL mappings** and requires documented sources for everything. No mapping is assumed to be correct without proper source documentation.

## What Gets Detected

### 1. Mappings Without Sources (CRITICAL)

The system checks **all mappings** used in the code and flags any that don't have proper source documentation:

- **Trait codes** - All trait code names must have sources
- **Effect codes** - All effect code descriptions must have sources
- **Parameter names** - All parameter names must have sources
- **Scope types** - All scope type descriptions must have sources
- **Hit types** - All hit type descriptions must have sources
- **Damage types** - All damage type descriptions must have sources
- **Occasion types** - All occasion type descriptions must have sources
- **Restriction types** - All restriction type descriptions must have sources
- **Auto removal timings** - All auto removal timing descriptions must have sources

**Note:** Translations (element translations, weapon type translations, armor type translations, etc.) are **excluded** from source verification. Translations are interpretive and don't require source documentation like factual mappings do.

### 2. Unmapped Known Parameters

Parameters that are known to exist (from editor screenshots) but aren't mapped in the code.

### 3. Unknown Trait/Effect Codes

Trait or effect codes that aren't in the known mappings.

### 4. Completely Unknown Parameters

Parameters beyond the known ranges that need investigation.

### 5. Items Displayed as "Unknown"

Items that are displayed as "Unknown Parameter" or "Unknown Trait" in the UI.

## Source Types

Accepted source types:

- **`system.json`** - Direct from System.json file
- **`editor-screenshot`** - From editor screenshots (must specify which screenshot)
- **`rpg-maker-docs`** - From RPG Maker VX Ace official documentation
- **`none`** - No source documented (will be flagged by detection system)

**Note:** Pattern analysis or data file analysis is NOT a valid source type. It's inference, not direct evidence. Mappings inferred from patterns should use `source: "none"` and will be flagged for proper source documentation.

## Source Registry

All mappings must have entries in source registries:

```javascript
// Example: Parameter names
const parameterNameSources = {
    0: { source: "system.json", evidence: "terms.params[0] in System.json" },
    1: { source: "system.json", evidence: "terms.params[1] in System.json" },
    // ...
};

// Example: Trait codes
const traitCodeSources = {
    11: { source: "editor-screenshot", evidence: "Rate tab - HP Regeneration visible", screenshot: "states-features-screenshots" },
    31: { source: "none", evidence: "No source documented - ASSUMED" }, // Will be flagged
    // ...
};
```

## Detection Output

The system reports:

```
🎯 Inferred Data Detection:
   ⚠️  [count] instances of inferred data without basis:

   🔴 CRITICAL: [count] mappings without documented sources:
      trait_code ([count] mappings without sources):
         - Normal Attack Times (code: 31) - stateTraitCodes[31]
           Source: none, Evidence: No source documented - ASSUMED
         - Skill Type Seal (code: 32) - stateTraitCodes[32]
           Source: none, Evidence: No source documented - ASSUMED
         ...
      
      effect_code ([count] mappings without sources):
         - Recover HP (code: 11) - effectCodes[11]
           Source: none, Evidence: No source documented - ASSUMED from usage patterns
         ...
      
      element_translation ([count] mappings without sources):
         - "物理" → "Physical" - elementTranslations["物理"]
           Source: none, Evidence: No source documented - ASSUMED translation
         ...
```

## How to Fix Issues

### For Mappings Without Sources:

1. **Find the source** - Check editor screenshots, System.json, documentation, or data files
2. **Update the source registry** - Add or update the source entry:

```javascript
const traitCodeSources = {
    31: { 
        source: "editor-screenshot", 
        evidence: "Attack tab - Normal Attack Times visible", 
        screenshot: "200600.png" 
    }
};
```

3. **Re-run the detection** - Verify the mapping is no longer flagged

### For Unmapped Known Parameters:

1. **Add the parameter mapping** - Add to `processTraits` function
2. **Add the source** - Document where the parameter name comes from
3. **Update the source registry** - Add to parameter sources

## Current Status

The system currently flags:

- **78 mappings without documented sources** (trait codes, effect codes, element translations, etc.)
- **529 unmapped known parameters** (parameters 8-26 that exist but aren't mapped)
- **42 unknown trait codes** (custom codes not in standard mappings)
- **796 completely unknown parameters** (beyond known ranges)

## Philosophy

**Everything is assumed to be wrong until proven right with a source.**

The system challenges:
- ✅ Parameter names (even standard ones need System.json verification)
- ✅ Trait code names (even "known" ones need screenshot/documentation)
- ✅ Effect code descriptions (even "standard" ones need verification)
- ✅ All type mappings (scope, hit, damage, occasion, restriction, auto removal)

**Note:** Translations are excluded from source verification as they are interpretive, not factual mappings.

## Benefits

1. **Transparency** - Know exactly where every mapping comes from
2. **Verifiability** - Others can verify sources independently
3. **Accuracy** - Catch incorrect assumptions early
4. **Documentation** - Build a knowledge base of verified mappings
5. **Confidence** - Know what's certain vs. what's assumed

---

*This system ensures that no mapping is taken for granted and everything has a documented source.*

