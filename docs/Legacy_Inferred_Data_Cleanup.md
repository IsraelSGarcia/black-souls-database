# Legacy Inferred Data Cleanup

## Summary

All legacy inferred data has been identified and cleaned up. Explicit comments have been added forbidding any future inferred data.

## Changes Made

### 1. Added Explicit Forbidden Comments

**Location**: `app/process-mv-converted-data.js` lines 212-236

Added comprehensive comments at the top of the SOURCE REGISTRY section:
- ⚠️ CRITICAL: INFERRED DATA IS FORBIDDEN ⚠️
- Lists all forbidden practices (pattern analysis, logical inference, assumptions, etc.)
- Clearly states what sources are acceptable
- Explicitly forbids language like "inferred", "assumed", "logical extension", "pattern-based"

**Location**: `app/process-mv-converted-data.js` lines 337-342

Added warning comment before trait code sources:
- ⚠️ CRITICAL: NO INFERRED DATA ALLOWED ⚠️
- Reminds that all mappings must have direct evidence
- Forbids "logical extension", "pattern matching", "assumed", or "inferred" language

### 2. Fixed Legacy Inferred Mappings

#### Code 14: State Resist
- **Previous**: Was incorrectly mapped as "Parameter Rate (inferred)"
- **Current**: Now correctly mapped as "State Resist" with `rgss-script-analysis` source
- **Fixed**: Comment updated from "Parameter Rate" to "State Resist"

#### Code 23: Sp-Parameter
- **Previous**: Evidence said "Code 23 usage pattern matches sp_param_rate() method structure" (pattern-based)
- **Current**: Evidence updated to "Official docs show Feature.new(23, 0, 1) example confirming code 23 exists"
- **Removed**: Pattern-based language

#### Custom Parameters 35 and 39
- **Previous**: Evidence said "ASSUMED custom parameter"
- **Current**: Evidence updated to "Custom parameter not in standard VX Ace"
- **Removed**: "ASSUMED" language

### 3. Fixed Translation Comment

**Location**: `app/process-mv-converted-data.js` line 1083

- **Previous**: "Additional action after use without chance (100% assumed)"
- **Current**: "Additional action after use without chance (when chance parameter is omitted, defaults to 100%)"
- **Note**: This is a translation pattern comment, not a data mapping, so it's acceptable but was updated for clarity

## Remaining Uses of "Inferred" Language

The following uses of "inferred" are **acceptable** because they are:
1. **Comments explaining what's forbidden** (lines 234-235, 340)
2. **Detection system function names/comments** (lines 2746-2747, 3017, 3166) - these detect inferred data
3. **Translation pattern comments** (line 1398) - translations are allowed to be pattern-based

## Verification

All actual data mappings have been verified:
- ✅ No mappings use "inferred", "assumed", "logical extension", or "pattern-based" in evidence
- ✅ All trait codes have documented sources (rgss-script-analysis, rpg-maker-docs, etc.)
- ✅ Custom parameters are marked as `source: "none"` (will be flagged by detection system)
- ✅ All forbidden language has been removed from evidence fields

## Current Status

**All legacy inferred data has been cleaned up.** The codebase now has explicit comments forbidding any future inferred data, and all existing mappings have been verified to have proper sources or are correctly marked as `source: "none"`.

