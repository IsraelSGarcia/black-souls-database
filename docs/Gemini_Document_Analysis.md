# Analysis of Gemini's RPG Maker VX Ace Code Documentation

## Source Assessment

**Document**: `Gemini's RPG Maker VX Ace Code Documentation Search.md`
**Claimed Source**: Extracted from RGSS3 core scripts (Scripts.rgss3a archive)
**Methodology**: Claims to analyze Game_BattlerBase and Game_Action classes to extract code constants
**Reliability**: Community-sourced reference, not official documentation

## Key Discrepancies with Official Documentation

### Trait Code Mappings - Major Conflicts

| Code | Gemini Document | Our Current Mapping | Official Docs Evidence |
|------|----------------|-------------------|----------------------|
| **11** | Element Rate | `none` (Unknown) | Not found in official docs |
| **12** | Debuff Rate | `none` (Unknown) | Not found in official docs |
| **13** | State Rate | Not in our code | Not found in official docs |
| **14** | State Resist | Parameter Rate (WRONG - was incorrectly mapped as inferred) | Official docs show "State Resist" exists. Now sourced from community RGSS3 script analysis |
| **21** | Parameter | Element Rate (WRONG - was incorrectly mapped) | Official docs: Code 21 confirmed by `param_rate()` method: `features_with_id(21, param_id)` - NOT inferred, has code evidence |
| **22** | Ex-Parameter | Debuff Rate | Official docs: Code 22 used for `ex_param_plus()` in Game_BattlerBase |
| **23** | Sp-Parameter | State Rate | Official docs: Code 23 confirmed in RGSS examples |
| **31** | Attack Element | Normal Attack Times | Official docs: Code 31 confirmed in RGSS examples as attack-related |
| **32** | Attack State | `none` (Unknown) | Not found in official docs |
| **33** | Attack Speed | `none` (Unknown) | Not found in official docs |
| **34** | Attack Times+ | `none` (Unknown) | Not found in official docs |
| **41** | Add Skill Type | Special Flag | Official docs: Code 41 confirmed in RGSS examples |
| **42** | Seal Skill Type | `none` (Unknown) | Not found in official docs |
| **43** | Add Skill | `none` (Unknown) | Not found in official docs |
| **44** | Seal Skill | `none` (Unknown) | Not found in official docs |
| **51** | Equip Weapon Type | Equip Weapon | Official docs: Code 51 confirmed in RGSS examples |
| **52** | Equip Armor Type | Equip Armor | Official docs: Code 52 confirmed in RGSS examples |
| **53** | Fix Equip | Not in our code | Not found in official docs |
| **54** | Seal Equip | `none` (Unknown) | Not found in official docs |
| **55** | Slot Type | `none` (Unknown) | Not found in official docs |
| **61** | Action Times+ | Not in our code | Not found in official docs |
| **62** | Special Flag | `none` (Unknown) | Official docs: Code 41 was Special Flag in examples |
| **63** | Collapse Effect | `none` (Unknown) | Not found in official docs |
| **64** | Party Ability | `none` (Unknown) | Not found in official docs |

### Critical Evidence from Gemini Document

The document provides **code analysis evidence** that supports its mappings:

1. **Code 21 = Parameter**: 
   - Evidence: `features_with_id(21, param_id).inject(1.0) { |r, ft| r * ft.value }`
   - This matches the `param_rate()` method in Game_BattlerBase

2. **Code 22 = Ex-Parameter**:
   - Evidence: `features_with_id(22, ex_param_id).inject(0.0) { |r, ft| r + ft.value }`
   - This matches the `ex_param_plus()` method in Game_BattlerBase

3. **Code 23 = Sp-Parameter**:
   - Official docs show `Feature.new(23, 0, 1)` example
   - Pattern matches `sp_param_rate()` method structure (multiplicative like code 21)
   - Note: This is partially inferred from pattern, but has official doc example

### Effect Code - Additional Finding

| Code | Gemini Document | Our Current Mapping | Official Docs |
|------|----------------|-------------------|---------------|
| **13** | Gain TP | Not in our code | Not in official docs (only 12 effect codes listed) |

## Validation Against Official Documentation

### What Official Docs Confirm:
- ✅ Code 22, 23, 31, 41, 51, 52 exist (from RGSS examples)
- ✅ Code 21 is used for `param_rate()` method (logical inference)
- ✅ Code 22 is used for `ex_param_plus()` method (logical inference)
- ✅ All 12 effect codes (11, 12, 21, 22, 31, 32, 33, 34, 41, 42, 43, 44) confirmed

### What Official Docs Don't Confirm:
- ❌ Trait codes 11, 12, 13, 14, 32, 33, 34, 42, 43, 44, 53, 54, 55, 61, 62, 63, 64
- ❌ Effect code 13 (Gain TP)

### What Gemini Document Claims (with code analysis):
- ✅ Code 21 = Parameter (with code evidence)
- ✅ Code 22 = Ex-Parameter (with code evidence)
- ✅ Code 23 = Sp-Parameter (logical extension)
- ✅ Complete trait code mapping table (11-64)

## Recommendation

The Gemini document appears to be a **reverse-engineered reference** from analyzing the RGSS3 core scripts. While it's not "official documentation," the code analysis evidence (especially for codes 21 and 22) is compelling and aligns with how the engine would logically work.

**Action Items:**
1. **High Confidence Updates** (based on code analysis evidence):
   - Code 21: Parameter (confirmed by `param_rate()` method)
   - Code 22: Ex-Parameter (confirmed by `ex_param_plus()` method)
   - Code 23: Sp-Parameter (logical extension)

2. **Medium Confidence Updates** (logical grouping):
   - Codes 11-14: Rate tab features (Element Rate, Debuff Rate, State Rate, State Resist)
   - Codes 31-34: Attack tab features (Attack Element, Attack State, Attack Speed, Attack Times+)
   - Codes 41-44: Skill tab features (Add Skill Type, Seal Skill Type, Add Skill, Seal Skill)
   - Codes 51-55: Equip tab features (Equip Weapon Type, Equip Armor Type, Fix Equip, Seal Equip, Slot Type)
   - Codes 61-64: Other tab features (Action Times+, Special Flag, Collapse Effect, Party Ability)

3. **Source Attribution**:
   - Use source type: `"community-docs"` or `"rgss-script-analysis"`
   - Evidence: "From community-sourced RGSS3 script analysis (Game_BattlerBase/Game_Action code inspection)"

4. **Effect Code 13**:
   - Investigate if "Gain TP" is a valid effect code (not in official docs)
   - May be a custom/extension or may have been missed in official docs

## Next Steps

1. Update `process-mv-converted-data.js` with Gemini document mappings
2. Add new source type for community documentation
3. Update source registries with appropriate evidence
4. Note discrepancies with official documentation
5. Consider adding a "confidence level" indicator for mappings

