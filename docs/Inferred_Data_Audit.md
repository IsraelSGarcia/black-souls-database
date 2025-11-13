# Inferred Data Audit

## Summary

This document identifies all mappings that are **inferred** (not directly confirmed) vs those with **direct evidence**.

## Code 21: Parameter - NOT INFERRED ✅

**Status**: ✅ **CONFIRMED** - Has direct code evidence

**Evidence**: 
- `features_with_id(21, param_id)` in `Game_BattlerBase.param_rate()` method
- This is **direct code evidence**, not inference

**Previous Error**: Was incorrectly mapped as "Element Rate" - this was a bug, not inference

## Code 23: Sp-Parameter - PARTIALLY INFERRED ⚠️

**Status**: ⚠️ **PARTIALLY INFERRED** - Has official doc example but pattern-based

**Evidence**:
- Official docs show `Feature.new(23, 0, 1)` example (proves code 23 exists)
- Pattern matches `sp_param_rate()` method structure (multiplicative like code 21)
- **Issue**: The name "Sp-Parameter" comes from pattern matching (21=Param, 22=Ex-Param, 23=Sp-Param), not direct code evidence

**Recommendation**: Keep as `rgss-script-analysis` source but note it's pattern-based

## Truly Inferred Data (Source: "none")

### Custom Parameters
- **Parameter 35**: "HP Drain Rate" - `source: "none"` - ASSUMED custom parameter
- **Parameter 39**: "MP Drain Rate" - `source: "none"` - ASSUMED custom parameter

These are custom parameters not in standard RPG Maker VX Ace, so they're marked as "none" and will be flagged.

## All Other Mappings - NOT INFERRED ✅

All other trait codes (11-14, 21-22, 31-34, 41-44, 51-55, 61-64) are sourced from:
- `rgss-script-analysis` - Community analysis of RGSS3 core scripts
- `rpg-maker-docs` - Official RPG Maker VX Ace documentation
- `editor-screenshot` - Screenshots from the editor
- `system.json` - Direct from game data files

**None of these are "inferred"** - they all have documented sources.

## Conclusion

**Only Code 23 is partially inferred** (pattern-based naming), and **custom parameters 35 and 39 are assumed** (not in standard VX Ace).

**Code 21 is NOT inferred** - it has direct code evidence and was previously incorrectly mapped.

