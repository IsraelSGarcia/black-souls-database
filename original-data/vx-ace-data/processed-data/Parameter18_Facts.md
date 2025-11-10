# Parameter 18 - Facts Only (No Inferences)

## Fact: Code 11 = Parameter Rate
**Evidence:**
- Code 11 modifies standard parameters (0-7) which are defined in System.json as: MaxHP, MaxMP, ATK, DEF, MAG, MDF, SPD, LCK
- Code 11 is used with multipliers (0.5, 1.5, 2.0, etc.) to modify parameter values
- Example: Weapons use `code: 11, data_id: 1, value: 0.95` to reduce Max MP by 5%

## Fact: Standard Parameters (0-7)
From System.json `terms.params`:
- 0: "MaxHP"
- 1: "MaxMP"
- 2: "ATK"
- 3: "DEF"
- 4: "MAG"
- 5: "MDF"
- 6: "SPD"
- 7: "LCK"

## Fact: Parameter 18 Usage Statistics
- **Total occurrences with code 11:** 3
- **Files where it appears:** States.json, Enemies.json
- **Values used:** 1.5 (in States), 0 (in Enemies)

## Fact: Parameter 18 in States
1. **State 2 ("Poison")**
   - Feature: `code: 11, data_id: 18, value: 1.5`
   - State also has: `code: 22, data_id: 7, value: -0.02` (modifies Luck)
   - State properties: Auto-removal timing: 1, Min/Max turns: 10, Remove by walking: true

2. **State 3 ("Deadly Poison")**
   - Feature: `code: 11, data_id: 18, value: 1.5`
   - State also has: `code: 22, data_id: 7, value: -0.03` (modifies Luck)
   - State properties: Auto-removal timing: 1, Min/Max turns: 10, Remove by walking: true

## Fact: Parameter 18 in Enemies
1. **Enemy 569 ("Gear")**
   - Feature: `code: 11, data_id: 18, value: 0`
   - This enemy also sets the following parameters to 0 (via code 11):
     - data_id 1 (Max MP): 0
     - data_id 3 (DEF): 0
     - data_id 4 (MAG): 0
     - data_id 5 (MDF): 0
     - data_id 9: 0
     - data_id 11: 0
     - data_id 12: 0
     - data_id 13: 0
     - data_id 14: 0
     - data_id 15: 0
     - data_id 16: 0
     - data_id 18: 0
     - data_id 19: 0

## Fact: Other Extended Parameters Used with Code 11
- **data_id 8:** Used in States 6 ("Sleep") and 149 ("Deep Sleep") with value 9
- **data_id 9:** Used 207 times (appears to be Light element resistance)
- **data_id 10:** Used 130 times (appears to be Dark element resistance)
- **data_id 11:** Used in State 26 ("Bleeding") with value 2, and Enemy 569 with value 0
- **data_id 12:** Used only in Enemy 569 with value 0
- **data_id 13:** Used 134 times in Enemies only, values: 1.2, 1.5, 2
- **data_id 14:** Used 6 times in Enemies only, value: 5
- **data_id 15:** Used in State 13 ("Stun") with value 2, and Enemy 569 with value 0
- **data_id 16:** Used in States 7 ("Hard Break Vulnerable") and 8 ("Break Vulnerable") with value 5, and Enemy 569 with value 0
- **data_id 17:** Used 1 time in Armor 101 ("Cheshire Cat's Ring") with undefined value
- **data_id 18:** Used 3 times (2 in States, 1 in Enemies)
- **data_id 19:** Used 5 times in States 204-207 (all with value 1.5), and Enemy 569 with value 0

## Fact: Code 22 (used alongside parameter 18 in poison states)
- Code 22 is used with data_id 7 (Luck) in poison states
- State 2 ("Poison"): `code: 22, data_id: 7, value: -0.02`
- State 3 ("Deadly Poison"): `code: 22, data_id: 7, value: -0.03`
- Code 22 appears 2260 times total in the data
- Code 22 is used with parameters 1-8 (standard parameters)
- Values for code 22 range from -1 to 1 (typically modifiers, not multipliers)

## Fact: Scripts Analysis
- **224 scripts decompressed and searched**
- **No references to parameter 18 found in any script**
- **No references to feature code 11 definitions found**
- **No custom parameter definitions found**

## Fact: Parameter 18 is NOT a Standard Parameter
- Parameter 18 is not in the System.json `terms.params` array (which only contains 8 standard parameters: 0-7)
- Parameter 18 is beyond the standard parameter range

## What We DO NOT Know
- The name of parameter 18
- What parameter 18 represents
- How parameter 18 is used by the game engine
- Why parameter 18 is set to 1.5 in poison states
- Why parameter 18 is set to 0 in Enemy 569
- What States 204-207 are (they use parameter 19, not 18)

## Data Sources
- System.json
- States.json
- Weapons.json
- Armors.json
- Items.json
- Enemies.json
- Scripts.json (all 224 scripts)

