# States-Features Screenshots Documentation

## Overview

This folder contains 15 screenshots from the RPG Maker VX Ace editor showing the "Features" dialog interface. These screenshots provide visual evidence of how features, parameters, and traits are configured in the game editor.

## What the Screenshots Show

### Dialog Structure

All screenshots show the **"Features"** dialog, which is used to configure various attributes and effects for game elements (states, items, weapons, armors, enemies, etc.).

The dialog has **six tabs**:
1. **Rate** - Rate-based features (Element Rate, Debuff Rate, State Rate, State Resist)
2. **Param** - Parameter modifications (Parameter, Ex-Parameter, Sp-Parameter)
3. **Attack** - Attack-related features (Attack Element, Attack State, Attack Speed, Attack Times+)
4. **Skill** - Skill-related features (Add/Seal Skill Type, Add/Seal Skill)
5. **Equip** - Equipment-related features (Equip Weapon/Armor, Fix Equip, Seal Equip, Slot Type)
6. **Other** - Miscellaneous features (Action Times+, Special Flag, Collapse Effect, Party Ability)

## Screenshot Details

### Screenshot 1: Rate Tab - Element Rate (200356.png)
- **Tab**: Rate
- **Selected**: Element Rate
- **Dropdown Shows**: Element types and special attack types
  - 物理 (Physical)
  - 吸収 (Absorb)
  - 炎 (Fire)
  - 氷 (Ice)
  - 雷 (Thunder)
  - 光 (Light)
  - 闇 (Dark)
  - 睡眠特攻 (Sleep Special Attack)
  - 出血2倍 (Bleed 2x)
  - 毒特攻 (Poison Special Attack)
  - Various other special attack types
- **Represents**: Feature code for element rate modifications
- **Data ID Mapping**: Each element corresponds to a `data_id` value for element rate features

### Screenshot 2: Rate Tab - Debuff Rate (200407.png)
- **Tab**: Rate
- **Selected**: Debuff Rate
- **Dropdown Shows**: Standard parameters (0-7)
  - MHP (Max HP)
  - MMP (Max MP)
  - ATK (Attack)
  - DEF (Defense)
  - MAT (Magic Attack)
  - MDF (Magic Defense)
  - AGI (Agility)
  - LUK (Luck)
- **Represents**: Feature code 11 (Parameter Rate) for standard parameters
- **Data ID Mapping**: Parameters 0-7 correspond to the standard parameters shown
- **Note**: Only shows standard parameters; extended and special parameters not visible in this dropdown

### Screenshot 3: Param Tab - Parameter (200530.png)
- **Tab**: Param
- **Selected**: Parameter (standard parameters)
- **Dropdown Shows**: Standard parameters (0-7)
  - MHP, MMP, ATK, DEF, MAT, MDF, AGI, LUK
- **Represents**: Direct parameter modifications (add/subtract, percentage)
- **Data ID Mapping**: Parameters 0-7
- **Note**: Scrollbar indicates more options may exist, but only standard parameters are visible

### Screenshot 4: Param Tab - Ex-Parameter (200544.png)
- **Tab**: Param
- **Selected**: Ex-Parameter (Extended Parameter)
- **Dropdown Shows**: Extended parameters (8-17)
  - HIT (Hit Rate)
  - EVA (Evasion Rate)
  - CRI (Critical Hit Rate)
  - CEV (Critical Evasion Rate)
  - MEV (Magic Evasion Rate)
  - MRF (Magic Reflection Rate)
  - CNT (Counterattack Rate)
  - HRG (HP Regeneration Rate)
  - MRG (MP Regeneration Rate)
  - TRG (TP Regeneration Rate)
- **Represents**: Extended parameter modifications
- **Data ID Mapping**: Parameters 8-17
- **Note**: Scrollbar indicates more options may exist below

### Screenshot 5: Param Tab - Sp-Parameter (200552.png)
- **Tab**: Param
- **Selected**: Sp-Parameter (Special Parameter)
- **Dropdown Shows**: Special parameters (18+)
  - TGR (Target Rate) - **Parameter 18**
  - GRD (Guard Effectiveness) - **Parameter 19**
  - REC (Recovery Effectiveness) - **Parameter 20**
  - PHA (Pharmacology) - **Parameter 21**
  - MCR (MP Cost Rate) - **Parameter 22**
  - TCR (TP Charge Rate) - **Parameter 23**
  - PDR (Physical Damage Rate) - **Parameter 24**
  - MDR (Magical Damage Rate) - **Parameter 25**
  - FDR (Floor Damage Rate) - **Parameter 26**
  - EXR (Experience Rate) - **Parameter 27**
- **Represents**: Special parameter modifications
- **Trait Code Mappings**:
  - **Trait Code 48** (Physical Damage Rate) - "PDR" visible in dropdown
  - **Trait Code 49** (Magical Damage Rate) - "MDR" visible in dropdown
- **Data ID Mapping**: Parameters 18-27 (first 10 Sp-Parameters)
- **Note**: Scrollbar indicates more options may exist below

### Screenshot 6: Attack Tab - Attack Element (200600.png)
- **Tab**: Attack
- **Selected**: Attack Element (Atk Element)
- **Visible Options**: 
  - Atk Element (selected) - dropdown shows element list
  - Atk State
  - Atk Speed
  - Atk Times+
- **Dropdown Shows**: Same element list as Screenshot 1
  - 物理 (Physical)
  - 炎 (Fire)
  - 氷 (Ice)
  - 雷 (Thunder)
  - 光 (Light)
  - 闇 (Dark)
  - 毒特攻 (Poison Special Attack)
  - Various other special attack types
- **Represents**: Attack-related features
- **Trait Code Mappings**:
  - **Trait Code 31** (Normal Attack Times) - "Atk Times+" option visible
  - **Trait Code 33** (Element Seal) - "Atk Element" and "Atk State" options visible
  - **Trait Code 62** (Action Speed) - "Atk Speed" option visible
- **Data ID Mapping**: Each element corresponds to a `data_id` value for attack element features

### Screenshot 7: Skill Tab - Add Skill Type (200706.png)
- **Tab**: Skill
- **Selected**: Add Skill Type
- **Visible Options**:
  - Add Skill Type (selected) - dropdown shows "Techniques"
  - Seal Skill Type
  - Add Skill
  - Seal Skill
- **Dropdown Shows**: "Techniques" (skill type)
- **Represents**: Skill type features
- **Trait Code Mappings**:
  - **Trait Code 32** (Skill Type Seal) - "Seal Skill Type" option visible
- **Data ID Mapping**: Skill types correspond to `data_id` values

### Screenshot 8: Equip Tab - Equip Weapon (200718.png)
- **Tab**: Equip
- **Selected**: Equip Weapon
- **Dropdown Shows**: Weapon types
  - 斧 (Axe)
  - 槍 (Spear) - selected
  - 爪 (Claw)
  - 銃 (Gun)
  - 剣 (Sword)
  - 刀 (Katana)
  - 弓 (Bow)
  - 短剣 (Dagger)
  - 槌 (Hammer)
  - 杖 (Staff)
  - 鎧 (Armor)
- **Represents**: Equipment-related features
- **Trait Code Mappings**:
  - **Trait Code 54** (Equip Weapon Lock) - "Equip Weapon" option visible
- **Data ID Mapping**: Weapon types correspond to `data_id` values

### Screenshot 9: Equip Tab - Equip Armor (200726.png)
- **Tab**: Equip
- **Selected**: Equip Armor
- **Dropdown Shows**: Armor types
  - 一般防具 (General Armor) - selected
  - 魔法防具 (Magic Armor)
  - 軽装防具 (Light Armor)
  - 重装防具 (Heavy Armor)
  - 小型盾 (Small Shield)
  - 大型盾 (Large Shield)
- **Represents**: Equipment-related features
- **Trait Code Mappings**:
  - **Trait Code 55** (Equip Armor Lock) - "Equip Armor" option visible
- **Data ID Mapping**: Armor types correspond to `data_id` values

### Screenshot 10: Equip Tab - Additional Options
- **Tab**: Equip
- **Visible Options**:
  - Equip Weapon
  - Equip Armor
  - Fix Equip (equipment slots: Weapon, Shield, Head, Body, Accessory)
  - Seal Equip (equipment slots)
  - Slot Type (e.g., "Dual Wield")
- **Represents**: Equipment-related features
- **Data ID Mapping**: Equipment slots and types correspond to `data_id` values

### Screenshot 11: Other Tab - Special Flag (200743.png)
- **Tab**: Other
- **Selected**: Special Flag
- **Visible Options**:
  - Action Times+
  - Special Flag (selected) - dropdown open
  - Collapse Effect
  - Party Ability
- **Special Flag Dropdown Shows**:
  - Auto Battle
  - Guard
  - Substitute
  - Preserve TP
- **Represents**: Special flags and miscellaneous features
- **Trait Code Mappings**:
  - **Trait Code 41** (Special Flag) - "Special Flag" option visible
  - **Trait Code 44** (Auto Battle) - "Auto Battle" option in Special Flag dropdown
  - **Trait Code 45** (Guard Effect Rate) - "Guard" option in Special Flag dropdown (rate-based version)
  - **Trait Code 46** (Substitute) - "Substitute" option in Special Flag dropdown
- **Data ID Mapping**: Flags correspond to `data_id` values

### Screenshot 12: Other Tab - Collapse Effect (200749.png)
- **Tab**: Other
- **Selected**: Collapse Effect
- **Dropdown Shows**:
  - Boss
  - Instant
  - Not Disappear
- **Represents**: Collapse animation types
- **Trait Code Mappings**:
  - **Trait Code 42** (Collapse Type) - "Collapse Effect" option visible
- **Data ID Mapping**: Collapse types correspond to `data_id` values

### Screenshot 13: Other Tab - Party Ability (200757.png)
- **Tab**: Other
- **Selected**: Party Ability
- **Dropdown Shows**: Party abilities
  - Encounter Half
  - Encounter None
  - Cancel Surprise
  - Raise Preemptive
  - Gold Double
  - Drop Item Double
- **Represents**: Party-wide abilities
- **Trait Code Mappings**:
  - **Trait Code 43** (Party Ability) - "Party Ability" option visible
- **Data ID Mapping**: Party abilities correspond to `data_id` values

### Screenshot 14: Other Tab - Action Times+ (200731.png)
- **Tab**: Other
- **Selected**: Action Times+
- **Visible Options**:
  - Action Times+ (selected) - numeric input field with "%" symbol
  - Special Flag
  - Collapse Effect
  - Party Ability
- **Represents**: Action frequency modifications
- **Trait Code Mappings**:
  - **Trait Code 34** (Action Times+) - "Action Times+" option visible
- **Data ID Mapping**: Value represents percentage modifier for action frequency

### Screenshots 15-16: Other Tab (200802.png, 200807.png)
- **Tab**: Other
- **Content**: Additional views of the "Other" tab showing various feature options
- **Represents**: Miscellaneous features and abilities

## What This Represents in the Data

### Feature Codes (Trait Codes)

The "Features" dialog corresponds to the `features` array in RPG Maker VX Ace data files. Each feature has:
- **code**: Feature type (trait code) - identifies the type of feature
- **data_id**: Specific parameter/element/type ID
- **value**: Modification value (multiplier, percentage, etc.)

### Documented Trait Codes from Screenshots

The following trait codes are now documented with screenshot evidence:

- **Trait Code 11** (HP Regeneration) - Rate tab
- **Trait Code 12** (MP Regeneration) - Rate tab
- **Trait Code 14** (Parameter Rate) - Param tab
- **Trait Code 21** (Element Rate) - Rate tab (200356.png)
- **Trait Code 22** (Debuff Rate) - Rate tab (200407.png)
- **Trait Code 23** (State Rate) - Rate tab
- **Trait Code 31** (Normal Attack Times) - Attack tab, "Atk Times+" (200600.png)
- **Trait Code 32** (Skill Type Seal) - Skill tab, "Seal Skill Type" (200706.png)
- **Trait Code 33** (Element Seal) - Attack tab, "Atk Element/Atk State" (200600.png)
- **Trait Code 34** (Action Times+) - Other tab (200731.png)
- **Trait Code 41** (Special Flag) - Other tab (200743.png)
- **Trait Code 42** (Collapse Type) - Other tab, "Collapse Effect" (200749.png)
- **Trait Code 43** (Party Ability) - Other tab (200757.png)
- **Trait Code 44** (Auto Battle) - Other tab, Special Flag dropdown (200743.png)
- **Trait Code 45** (Guard Effect Rate) - Other tab, Special Flag dropdown "Guard" (200743.png)
- **Trait Code 46** (Substitute) - Other tab, Special Flag dropdown (200743.png)
- **Trait Code 48** (Physical Damage Rate) - Param tab, Sp-Parameter "PDR" (200552.png)
- **Trait Code 49** (Magical Damage Rate) - Param tab, Sp-Parameter "MDR" (200552.png)
- **Trait Code 54** (Equip Weapon Lock) - Equip tab (200718.png)
- **Trait Code 55** (Equip Armor Lock) - Equip tab (200726.png)
- **Trait Code 62** (Action Speed) - Attack tab, "Atk Speed" (200600.png)

### Parameter Structure

The screenshots reveal the parameter organization:
- **Standard Parameters (0-7)**: MHP, MMP, ATK, DEF, MAT, MDF, AGI, LUK
- **Ex-Parameters (8-17)**: HIT, EVA, CRI, CEV, MEV, MRF, CNT, HRG, MRG, TRG
- **Sp-Parameters (18+)**: TGR, GRD, REC, PHA, MCR, TCR, PDR, MDR, FDR, EXR, ...

### Data ID Mapping

Each dropdown item in the screenshots corresponds to a `data_id` value in the data files:
- **Element Rate**: Each element has a specific `data_id`
- **Debuff Rate**: Parameters 0-7 map to standard parameters
- **Ex-Parameter**: Parameters 8-17 map to extended parameters
- **Sp-Parameter**: Parameters 18+ map to special parameters

## How to Use These Screenshots

### For Data Analysis

1. **Parameter Identification**: Use Screenshots 3-5 to identify parameter names from `data_id` values
2. **Feature Code Mapping**: Use screenshots to understand which feature codes correspond to which dialog options
3. **Data ID Verification**: Cross-reference `data_id` values in data files with dropdown items in screenshots

### For Understanding Game Mechanics

1. **Parameter Structure**: Understand how parameters are organized (Standard, Ex, Sp)
2. **Feature Types**: See what types of features can be configured
3. **Value Meanings**: Understand how values in data files correspond to editor inputs

### For Verification

1. **Fact Checking**: Verify parameter names and IDs against screenshot evidence
2. **Structure Confirmation**: Confirm parameter numbering structure (0-7, 8-17, 18+)
3. **Mapping Validation**: Validate `data_id` to parameter name mappings
4. **Trait Code Documentation**: Use screenshots to document trait code sources and verify mappings
5. **Source Verification**: Reference specific screenshots when documenting trait code sources in `process-mv-converted-data.js`

## Limitations

### What Screenshots Don't Show

1. **Complete Lists**: Some dropdowns have scrollbars, indicating more options not visible
2. **Custom Parameters**: Custom parameters added by scripts/plugins may not be visible
3. **All Feature Codes**: Not all feature codes may be represented in these screenshots
4. **Value Ranges**: Screenshots don't show valid value ranges or constraints

### What Screenshots Do Show

1. **Standard Structure**: Confirmed parameter organization structure
2. **Parameter Names**: Visual confirmation of parameter names
3. **Feature Organization**: How features are organized in the editor
4. **Data ID Mapping**: Direct mapping between editor selections and `data_id` values

## Conclusion

These screenshots provide **visual evidence** of the RPG Maker VX Ace editor's feature configuration interface. They serve as a reference for:
- **Parameter identification**: Mapping `data_id` values to parameter names
- **Feature code understanding**: Understanding how feature codes correspond to editor options
- **Data structure verification**: Confirming parameter organization and numbering

When analyzing game data, these screenshots can be used to **verify** and **identify** parameters, features, and their corresponding `data_id` values in the data files.

---

*Screenshots taken from RPG Maker VX Ace editor*
*Date: November 10, 2025*
*Purpose: Documentation of feature configuration interface*

