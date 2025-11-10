# Parameter 18 - Complete Analysis Summary

## Executive Summary

**Parameter 18 is used exactly 3 times in the entire VX Ace data:**
- 2 times in poison-related states (value: 1.5)
- 1 time in an enemy that sets it to 0 (value: 0)

**Parameter 18 is NOT a standard parameter** and is NOT defined in any scripts or data files we analyzed.

---

## What We Know (Facts Only)

### 1. Code 11 = Parameter Rate
- **Confirmed:** Code 11 is a multiplier that modifies parameter values
- **Evidence:** Used extensively with standard parameters (0-7) like MaxHP, MaxMP, ATK, DEF, etc.
- **Examples:**
  - Weapons reduce Max MP: `code: 11, data_id: 1, value: 0.95` = -5% Max MP
  - Armors modify Defense: `code: 11, data_id: 3, value: 0.5` = -50% Defense

### 2. Standard Parameters (0-7)
Defined in `System.json`:
- **0:** MaxHP
- **1:** MaxMP
- **2:** ATK (Attack)
- **3:** DEF (Defense)
- **4:** MAG (Magic Attack)
- **5:** MDF (Magic Defense)
- **6:** SPD (Speed/Agility)
- **7:** LCK (Luck)

### 3. Parameter 18 Usage

#### In States:
1. **State 2 ("Poison")**
   - `code: 11, data_id: 18, value: 1.5`
   - Also modifies Luck: `code: 22, data_id: 7, value: -0.02`
   - Properties: Auto-removal after 10 steps, removed by walking

2. **State 3 ("Deadly Poison")**
   - `code: 11, data_id: 18, value: 1.5`
   - Also modifies Luck: `code: 22, data_id: 7, value: -0.03`
   - Properties: Auto-removal after 10 steps, removed by walking

#### In Enemies:
1. **Enemy 569 ("Gear")**
   - `code: 11, data_id: 18, value: 0`
   - This enemy sets **many parameters to 0**, including:
     - Standard parameters: Max MP (1), DEF (3), MAG (4), MDF (5)
     - Extended parameters: 9, 11, 12, 13, 14, 15, 16, 18, 19
   - **Note:** This enemy sets multiple parameters to 0 (pattern consistent with other parameters)

### 4. Parameter 18 Statistics
- **Total occurrences:** 3
- **Files:** States.json (2), Enemies.json (1)
- **Values:** 1.5 (States), 0 (Enemies)
- **Not found in:** Weapons, Armors, Items, Actors, Classes, Skills

### 5. Extended Parameters Context
Other extended parameters used with code 11:
- **data_id 8:** Sleep states (value: 9)
- **data_id 9:** Light resistance (207 occurrences)
- **data_id 10:** Dark resistance (130 occurrences)
- **data_id 11:** Bleeding state (value: 2)
- **data_id 13:** Used in 134 enemies (values: 1.2, 1.5, 2)
- **data_id 14:** Used in 6 enemies (value: 5)
- **data_id 15:** Stun state (value: 2)
- **data_id 16:** Break vulnerable states (value: 5)
- **data_id 19:** Used in States 204-207 (value: 1.5)

### 6. Scripts Analysis
- **224 scripts decompressed and searched**
- **Result:** No references to parameter 18 found
- **Result:** No feature code 11 definitions found
- **Result:** No custom parameter definitions found

### 7. Parameter 18 is NOT Standard
- Not in `System.json` `terms.params` array
- Beyond standard parameter range (0-7)
- Not defined in any scripts

---

## What We Do NOT Know

1. **The name of parameter 18**
   - No name found in any data file
   - No definition in scripts
   - No reference in System.json

2. **What parameter 18 represents**
   - Unknown what it modifies or controls
   - Unknown game mechanics it affects

3. **Why value 1.5 is used in poison states**
   - Unknown what value 1.5 represents
   - Unknown what it's modifying

4. **Why value 0 is used in Enemy 569**
   - Unknown purpose of value 0
   - Pattern matches other parameters set to 0 in the same enemy

5. **How the game engine uses parameter 18**
   - Not defined in scripts
   - Unknown how it's handled by the game engine

6. **Relationship to other parameters**
   - Unknown if related to parameter 19 (used in States 204-207)
   - Unknown if part of a parameter group

---

## Data Sources Analyzed

### VX Ace Files Processed:
- ✅ System.json
- ✅ States.json
- ✅ Weapons.json
- ✅ Armors.json
- ✅ Items.json
- ✅ Enemies.json
- ✅ Actors.json
- ✅ Classes.json
- ✅ Skills.json
- ✅ Scripts.json (224 scripts decompressed and searched)

### MV Data Files Processed:
- ✅ _comments.txt (1,402 lines) - No parameter definitions found
- ✅ _scripts.txt (2,563 lines) - No parameter definitions found
- ✅ _log.txt (179,822 lines) - No parameter definitions found

**Note:** MV data files contain event comments, skill formulas, and event commands, but do not contain game parameter definitions.

### Search Methods:
- Direct grep for `data_id: 18`
- Pattern matching for parameter references
- Script decompression and text search
- Context analysis of usage patterns
- Cross-referencing with other parameters
- Search of MV data text files for parameter references

---

## Conclusion

**Parameter 18 exists in the data but is not defined anywhere we can access.**

### Confirmed Facts:
- ✅ Used in 2 poison states with value 1.5
- ✅ Used in 1 enemy with value 0 (immunity pattern)
- ✅ Code 11 is Parameter Rate (multiplier)
- ✅ Not a standard parameter (0-7)
- ✅ Not defined in scripts

### Unknown:
- ❌ Name/purpose of parameter 18
- ❌ What it modifies
- ❌ Game mechanics it affects
- ❌ Why specific values are used

### To Determine Parameter 18's Purpose:
1. **In-game testing:** Apply poison states and observe behavior
2. **Game documentation:** Check for custom parameter definitions
3. **Reverse engineering:** Analyze game executable
4. **Community resources:** Check RPG Maker VX Ace forums/communities
5. **Plugin analysis:** Check if it's from a specific plugin/extension

---

## Raw Data References

### State 2 ("Poison")
```json
{
  "__symbol__@code": 11,
  "__symbol__@data_id": 18,
  "__symbol__@value": 1.5
}
```

### State 3 ("Deadly Poison")
```json
{
  "__symbol__@code": 11,
  "__symbol__@data_id": 18,
  "__symbol__@value": 1.5
}
```

### Enemy 569 ("Gear")
```json
{
  "__symbol__@code": 11,
  "__symbol__@data_id": 18,
  "__symbol__@value": 0
}
```

---

*Last updated: Based on analysis of all VX Ace data files and 224 decompressed scripts*
*Analysis method: Facts only, no inferences or speculation*

