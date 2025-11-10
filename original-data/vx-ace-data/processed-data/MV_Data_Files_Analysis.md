# MV Data Files Analysis - Parameter 18 Search

## Summary
Searched `_comments.txt`, `_log.txt`, and `_scripts.txt` from the MV data folder for information about parameter 18 or related game mechanics.

## Files Analyzed

### 1. `_comments.txt` (1,402 lines)
**Content:** Event comments from troops, common events, and map events
**Search Results:** 
- No references to parameter 18
- No references to feature codes or traits
- Contains Japanese character names and event descriptions
- One reference to "毒殺者" (poisoner) but this is a character name, not a parameter definition

### 2. `_scripts.txt` (2,563 lines)
**Content:** Skill damage formulas and script calls from events
**Search Results:**
- No references to parameter 18
- No references to feature codes or traits
- Contains damage formulas for skills (e.g., `a.atk * 4 - b.def * 2`)
- Contains script calls (e.g., `$game_actors[1].change_equip_by_id(3, 0)`)
- References to poison skills (Poison Mist, Poison Breath, etc.) but only damage formulas, no parameter definitions

**Poison-related skills found:**
- Skill 11 Poison Mist: Damage Formula: `a.mat * 4 - b.mdf * 2`
- Skill 211 Poison Breath: Damage Formula: `a.atk * 5 - b.def * 2`
- Skill 732 Poison Whirlpool: Damage Formula: `a.mat * 7`
- Skill 957 Poison Fog Lorde: Damage Formula: `a.mat * 8 - b.mdf * 0.5`

### 3. `_log.txt` (179,822 lines)
**Content:** Event command parameters and troop battle event data
**Search Results:**
- No references to parameter 18
- Contains event command parameters (e.g., `{"code":111,"indent":0,"parameters":[0,6,0]}`)
- These are **event command parameters**, not game parameter definitions
- Event command codes (111, 101, 401, etc.) are RPG Maker MV event commands, not feature codes

**Note:** The "parameters" in this file refer to event command parameters (conditional branches, variable operations, etc.), not game stat parameters like parameter 18.

## Key Findings

### What These Files Contain:
1. **Event Comments:** Developer notes and character name specifications
2. **Skill Formulas:** Damage calculation formulas for skills
3. **Event Commands:** RPG Maker MV event system commands and parameters
4. **Script Calls:** JavaScript/Ruby script calls used in events

### What These Files Do NOT Contain:
1. ❌ Game parameter definitions (like parameter 18)
2. ❌ Feature code definitions (like code 11)
3. ❌ Trait system definitions
4. ❌ Custom parameter mappings
5. ❌ Parameter name mappings beyond standard parameters

## Conclusion

**No information about parameter 18 was found in these MV data files.**

These files contain:
- Event system data (comments, commands, scripts)
- Skill damage formulas
- Game event flow information

They do NOT contain:
- Game parameter definitions
- Feature/trait system definitions
- Custom parameter mappings

## Note on Data Format Difference

The MV data files (`_comments.txt`, `_log.txt`, `_scripts.txt`) are from **RPG Maker MV**, while parameter 18 was found in **RPG Maker VX Ace** data files. These are different engine versions with different data structures:

- **VX Ace:** Uses `.rvdata2` files (Ruby Marshal format)
- **MV:** Uses `.json` files and text-based event logs

Even if parameter 18 exists in MV data, it would be stored in the JSON files (States.json, Enemies.json, etc.), not in these text files.

## Recommendation

To find parameter 18 definitions, search:
1. ✅ VX Ace data JSON files (already analyzed)
2. ✅ VX Ace scripts (already analyzed)
3. ❌ MV data text files (no parameter definitions found)
4. ❓ MV data JSON files (if parameter 18 exists in MV version)
5. ❓ Game executable/compiled code
6. ❓ Game documentation or community resources

---

*Analysis Date: Based on search of all three MV data text files*
*Files searched: _comments.txt, _scripts.txt, _log.txt*
*Total lines searched: 183,787 lines*

