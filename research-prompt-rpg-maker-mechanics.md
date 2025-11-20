# Research Prompt: RPG Maker VX Ace & Black Souls II Game Mechanics Verification

## Objective
Verify the accuracy of game mechanics explanations for Black Souls II (built on RPG Maker VX Ace engine). Research and confirm or correct the following mechanics claims.

## Research Areas

### 1. Buff/Debuff Mechanics (Effect Codes 31 & 32)

**Claim to Verify:**
- Buff levels 1-10 provide: Level 1 = +10% (×1.10), Level 2 = +15% (×1.15), Level 3 = +20% (×1.20), up to Level 10 = +50% (×1.50)
- Formula: `buff_multiplier = 1.0 + (level × 0.05)`

**Questions:**
- What is the exact formula for buff multipliers in RPG Maker VX Ace?
- Do buff levels 1-10 correspond to these exact percentages?
- Is the formula linear (level × 0.05) or different?
- How do debuffs work? Same formula but negative?

**Sources to Check:**
- RPG Maker VX Ace official documentation
- RGSS3 engine source code (if available)
- Community wikis and guides
- Game data files from Black Souls II

### 2. Parameter Calculation Methods

**Claim to Verify:**
- Standard Parameters (0-7): Multiplicative stacking via Trait Code 21
- Extended Parameters (8-16): Additive stacking via Trait Code 22
- Special Parameters (18-27): Multiplicative stacking via Trait Code 23

**Questions:**
- Is Trait Code 21 truly multiplicative for Standard Parameters?
- Is Trait Code 22 truly additive for Extended Parameters?
- Is Trait Code 23 truly multiplicative for Special Parameters?
- What is the exact calculation order? (Base → Traits → Buffs?)

**Sources to Check:**
- RPG Maker VX Ace Trait Code documentation
- Game_BattlerBase class methods (param_rate, ex_param_plus, sp_param_rate)
- Community script analysis

### 3. Turn Order & Agility

**Claim to Verify:**
- Turn order: `turn_value = AGI + skill.speed`
- Characters sorted by turn_value (highest acts first)
- Action Times+ (Trait Code 61): `actions_per_turn = 1 + value`

**Questions:**
- Is turn order calculated exactly as AGI + skill.speed?
- How does skill.speed modify turn order? Is it added directly?
- What is the exact formula for Action Times+?
- Can multiple Action Times+ stack?

**Sources to Check:**
- Battle system documentation
- Turn order calculation code
- Community battle mechanics guides

### 4. Hit/Evasion Mechanics

**Claim to Verify:**
- Hit chance: `hit_chance = attacker.HIT - target.EVA` (percentage, capped 5%-95%)
- Certain Hit (hitType = 0) bypasses HIT/EVA entirely

**Questions:**
- Is the formula exactly HIT - EVA?
- What are the exact caps? (5%-95% or different?)
- How does hitType affect hit calculation?
- Does AGI factor into EVA calculation?

**Sources to Check:**
- Battle hit calculation code
- Hit type documentation
- Community mechanics guides

### 5. Critical Hit Mechanics

**Claim to Verify:**
- Critical chance: `critical_chance = attacker.CRI - target.CEV` (percentage, cannot go negative)
- Critical damage: Exactly 3x normal damage (`critical_damage = normal_damage × 3`)
- Critical hits always hit (ignore evasion)

**Questions:**
- Is critical damage exactly 3x, or is it configurable?
- Can critical chance go negative, or is it clamped at 0%?
- Do critical hits truly bypass evasion?
- How does LUK modify CRI/CEV?

**Sources to Check:**
- Critical hit calculation code
- Damage formula documentation
- LUK stat interaction documentation

### 6. Regeneration Mechanics

**Claim to Verify:**
- HRG (HP Regeneration Rate) is a FLAT value, not percentage: `HP_gained_per_turn = HRG_total`
- MRG (MP Regeneration Rate) is a FLAT value: `MP_gained_per_turn = MRG_total`
- Regeneration happens at turn end

**Questions:**
- Is HRG/MRG truly flat values, or are they percentage-based?
- When exactly does regeneration occur? (Turn start, turn end, action end?)
- Does REC (Recovery Effectiveness) multiply regeneration?

**Sources to Check:**
- Regeneration code
- Extended Parameter documentation
- Turn processing order

### 7. Damage Calculation Order

**Claim to Verify:**
Physical damage flow:
1) Calculate: `damage = (a.atk × mult) - (b.def × mult)`
2) Apply variance (±20%)
3) Apply PDR: `final_damage = damage × PDR`
4) Critical multiplier if applicable

**Questions:**
- Is this the exact order?
- What is the variance range? (±20% or different?)
- Is PDR applied before or after variance?
- Is critical multiplier applied before or after PDR?

**Sources to Check:**
- Damage calculation code
- Variance documentation
- Special Parameter application order

### 8. State Infliction & Luck

**Claim to Verify:**
- State infliction: `success_rate = base_rate × (100 + attacker_LUK - target_LUK) / 100`
- LUK modifies CRI/CEV calculations

**Questions:**
- Is this the exact formula for state infliction?
- How exactly does LUK modify CRI? (Additive? Multiplicative? Percentage?)
- How exactly does LUK modify CEV?
- Are there other LUK interactions?

**Sources to Check:**
- State application code
- LUK stat documentation
- Random effect calculations

### 9. Guard Effectiveness

**Claim to Verify:**
- Base guard reduces damage by 50%: `guarded_damage = damage × 0.50`
- GRD multiplies this: `final_reduction = 0.50 × GRD`

**Questions:**
- Is base guard exactly 50% reduction?
- Does GRD multiply the 50%, or does it work differently?
- What is the exact formula?

**Sources to Check:**
- Guard command code
- GRD (Special Parameter #19) documentation

### 10. Recovery & Pharmacology

**Claim to Verify:**
- REC multiplies ALL healing: `final_heal = base_heal × REC`
- PHA multiplies item effects: `item_effect = base_effect × PHA`
- PHA multiplies BEFORE REC

**Questions:**
- Does REC multiply regeneration?
- Does PHA only affect items, not skills?
- What is the exact order? (PHA then REC?)

**Sources to Check:**
- Recovery code
- Pharmacology code
- Effect application order

## Output Format

For each research area, provide:
1. **Verified/Corrected**: Whether the claim is accurate or needs correction
2. **Exact Formula**: The precise formula/mechanic as implemented
3. **Source Evidence**: Where this information comes from (code, documentation, testing)
4. **Uncertainties**: Any mechanics that cannot be definitively verified
5. **Black Souls II Specifics**: Any modifications Black Souls II makes to standard RPG Maker VX Ace mechanics

## Priority

Focus on mechanics that are:
- Most commonly referenced in gameplay
- Most likely to be misunderstood
- Most critical for accurate stat explanations

## Notes

- Black Souls II may have custom scripts that modify standard RPG Maker VX Ace behavior
- Some mechanics may be engine-dependent and vary between implementations
- Community knowledge may be based on testing rather than official documentation

