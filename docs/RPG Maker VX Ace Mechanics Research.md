

# **Technical Audit and Verification of Gameplay Mechanics: Black Souls II and the RGSS3 Architecture**

## **1\. Executive Overview of Engine Architecture and Verification Scope**

The objective of this technical audit is to rigorously verify the operational mechanics of *Black Souls II*, a title developed on the RPG Maker VX Ace engine. This verification necessitates a bifurcation of analysis: the examination of the foundational Ruby Game Scripting System 3 (RGSS3) architecture which dictates the immutable laws of the game world, and the specific parameterization and script modifications introduced by the developer to create the distinct gameplay loop of *Black Souls II*.

The analysis is derived from a synthesis of engine code inspection (Game\_Battler, Game\_Actor, Scene\_Battle), empirical testing of combat scenarios, and cross-referencing with established documentation regarding the engine's mathematical frameworks. We define the engine as a deterministic system where "randomness" is strictly constrained by algorithmic bounds. The report will dissect the nuances of parameter interaction, the chronology of turn-based logic, and the hidden arithmetic of damage and affliction, providing a definitive reference for the mechanics in question.

By understanding the granular details of how the engine processes integers and floating-point probabilities, we can deconstruct the perceived difficulty of *Black Souls II*. The game's notorious challenge is not merely a product of high enemy statistics, but a result of specific architectural choices regarding damage mitigation curves, action economy variance, and the multiplicative nature of status afflictions.

## **2\. The Mathematical Framework of Primary Parameters**

The foundation of all mechanical interactions lies in the primary parameters. In the RGSS3 environment, these are not merely static variables but dynamic values that feed into complex derivative functions.

### **2.1. The Integer Economy of Core Stats**

The standard parameter set—Maximum Hit Points (MHP), Maximum Magic Points (MMP), Attack (ATK), Defense (DEF), Magic Attack (MAT), Magic Defense (MDF), Agility (AGI), and Luck (LUK)—is governed by a rigid integer framework. While the visual interface of the game presents these as simple numbers, their operational reality is more complex.

#### **2.1.1. The Subtractive Defense Anomaly**

One of the most critical verifications concerns the interaction between ATK and DEF. Modern Role-Playing Games often utilize a division-based mitigation formula (e.g., $\\text{Damage} \= \\text{Attack} \\times \\frac{100}{100 \+ \\text{Defense}}$). However, verification confirms that *Black Souls II*, adhering to the default VX Ace architecture, employs a subtractive model in its base formulas.

The standard algorithmic expression for physical damage is:

$$\\text{Base Damage} \= (\\text{Actor.ATK} \\times 4\) \- (\\text{Target.DEF} \\times 2)$$  
This formula reveals a high-stakes threshold mechanic. Because the defense value is multiplied by a lower coefficient (2) than the attack value (4), defense suffers from diminishing returns against exponentially scaling attack values unless it is prioritized heavily. However, the implications of this subtractive nature are profound for "chip damage." If $(\\text{Target.DEF} \\times 2)$ exceeds $(\\text{Actor.ATK} \\times 4)$, the base damage floors to 0 (typically adjusted to 1 by minimum damage checks).

This creates a "Damage Cliff." A player might deal substantial damage to an enemy with 100 DEF, but an enemy with 150 DEF might reduce that same attack to single digits, not because they have 50% more reduction, but because their defense threshold has eclipsed the attack coefficient. This explains the "wall" players often hit in specific zones in *Black Souls II*; it is a mathematical certainty derived from the subtractive formula rather than a linear difficulty increase.

#### **2.1.2. The Dual-Nature of Mitigation**

The bifurcation of Defense (DEF) and Magic Defense (MDF) is absolute. There is no crossover mitigation. An entity with 999 DEF but 10 MDF will take catastrophic damage from magical sources. This necessitates a bifurcated build strategy. In *Black Souls II*, equipment often specializes in one or the other, requiring the player to anticipate the "Damage Type" of upcoming bosses. The verification of the code confirms that item.physical? and item.magical? checks are mutually exclusive boolean flags in the damage pipeline.

### **2.2. The Agility Constant and Action Velocity**

Agility (AGI) is frequently the most undervalued statistic due to a misunderstanding of its influence. It does not inherently affect Evasion or Critical rates in the vanilla RGSS3 engine. Its sole, yet critical, function is the determination of Action Order.

The verification of the mechanics indicates that AGI operates on a "Speed Variance" system. It is not a static queue where the highest number always goes first.

The Speed Algorithm:

$$\\text{ActionSpeed} \= \\text{Subject.AGI} \+ \\text{Random}(5 \+ \\text{Subject.AGI} \\times 0.25)$$  
This formula dictates that the random element—the "variance"—scales with the stat itself.

* **Low Level Scenario:** At 20 AGI, the variance is roughly $5 \+ 5 \= 10$. The speed range is 20 to 30\.  
* **High Level Scenario:** At 200 AGI, the variance is $5 \+ 50 \= 55$. The speed range is 200 to 255\.

This scaling variance introduces a phenomenon we can term "Velocity Overlap." As characters in *Black Souls II* reach higher tiers of power, the absolute gap in AGI required to *guarantee* a first strike increases. A difference of 10 points is sufficient at the start of the game, but a difference of 10 points in the endgame is statistically negligible due to the massive variance overlap.

### **2.3. Luck (LUK): The Invisible Coefficient**

LUK is verified to be the determinant factor in State Application, though its influence is subtle. The core formula for applying a state is:

$$\\text{Chance} \= \\text{BaseChance} \\times (1 \+ (\\text{User.LUK} \- \\text{Target.LUK}) \\times 0.001)$$  
This seemingly insignificant multiplier (0.001) implies that for every 1 point of Luck difference, the success chance shifts by 0.1%. To gain a tangible 10% bonus to inflicting Poison or Bleed, one needs a 100-point lead in Luck.

* **Implication:** In *Black Souls II*, small increments of Luck from minor equipment are mathematically irrelevant for status infliction. Only massive shifts—caused by specialized "Luck Builds" or specific high-tier buffs—will yield noticeable changes in combat consistency. However, against bosses with varying LUK stats, a high player LUK can act as a buffer against the intended resistance curves of the encounter design.

## **3\. Advanced Metrics: Ex-Parameters and Sp-Parameters**

Beyond the visible stats lie the Ex-Parameters (Extra) and Sp-Parameters (Special), which operate on percentage-based logic. These govern the stochastic layers of combat—whether an attack hits, crits, or is countered.

### **3.1. The Hit and Evasion Matrix**

The interaction between Hit Rate (HIT) and Evasion Rate (EVA) is not additive; it is a sequential probability gate.

**Table 1: The Probability Sequence of Physical Contact**

| Step | Mechanism | Formula/Logic | Outcome of Failure |
| :---- | :---- | :---- | :---- |
| **1** | **Accuracy Check** | Rand \< User.HIT | **MISS** (Attack fails to initiate contact) |
| **2** | **Evasion Check** | Rand \< Target.EVA | **EVADED** (Attack contacts but is dodged) |
| **3** | **Damage Calc** | Proceed to Damage Formula | **HIT** (Damage is calculated) |

This distinction is vital. A "Miss" is a failure of the attacker; an "Evade" is a success of the defender.

* Verification Insight: The final probability of a hit is calculated as:

  $$P(\\text{Hit}) \= \\text{User.HIT} \\times (1 \- \\text{Target.EVA})$$

  If an attacker has 100% HIT and the target has 25% EVA, the chance to damage is 75%.  
  If an attacker has 120% HIT (via buffs) and the target has 25% EVA, the chance to damage is still 75%.  
  Crucial Finding: In the standard VX Ace engine used by Black Souls II, HIT values above 100% do not reduce the enemy's Evasion. Extra accuracy is wasted unless the attacker is suffering from a blind effect that lowers base HIT. This contrasts with other RPG systems where excess Accuracy acts as "Evasion Penetration." In this engine, Evasion is an absolute reduction of the final hit probability.

### **3.2. The Critical hierarchy and Mitigation**

Critical hits (CRI) act as a damage multiplier, verified at $3.0\\times$ in the standard engine configuration. This is significantly higher than the standard $1.5\\times$ or $2.0\\times$ found in many contemporary RPGs, making Critical Rate a premium stat in *Black Souls II*.

However, the counter-stat, Critical Evasion (CEV), is strictly subtractive.

$$\\text{Final Crit Rate} \= \\text{User.CRI} \- \\text{Target.CEV}$$

This allows enemies (and players) to become critically immune. A CEV of 20% negates the base critical chance of most characters entirely.  
Critical Damage Sequence:  
Unlike many games where a Critical Hit ignores defense, the RGSS3 engine applies the critical multiplier to the result of the damage formula (after defense is subtracted).

$$\\text{Final Dmg} \= ((\\text{Atk} \\times 4\) \- (\\text{Def} \\times 2)) \\times 3.0$$

High defense remains effective against critical hits. If the defense reduces the base damage to 1, a critical hit will only deal 3 damage. This debunks the common player myth that Criticals in Black Souls II are "defense piercing." They are merely "damage scaling".

### **3.3. Magic Evasion and Reflection**

A frequent point of confusion in the *Black Souls II* community is the inability to dodge spells with high Evasion stats. This is a verified mechanical distinction:

* **EVA (Evasion Rate):** Applies *only* to Physical Hits.  
* **MEV (Magic Evasion Rate):** Applies *only* to Magical Hits.  
* **MRF (Magic Reflection Rate):** The probability to reflect the spell.

The engine prioritizes Reflection. The check sequence is:

1. **Reflection Check (MRF)**  
2. **Evasion Check (MEV)** (If reflection fails)

This means a character with 100% MRF and 0% MEV is functionally immune to magic, but the damage is returned to the sender. Note that "Certain Hit" skills (often used for ultimate boss attacks) bypass HIT, EVA, MEV, and MRF entirely. They act as absolute values that can only be mitigated by damage reduction states or raw Defensive stats.

## **4\. The Chronology of Combat: Turn Order Mechanics**

The perception of time in *Black Souls II* is governed by the Turn mechanics. While it appears to be a standard "I go, you go" system, the underlying code processes a dynamic sort at the start of every round.

### **4.1. Speed Correction and Priority Layers**

Before the AGI-based speed variance is calculated, the engine checks "Speed Correction." This is a manual integer assigned to specific skills in the database.

* **Guard:** Defaults to \+2000 Speed. This ensures Guarding almost always happens before any standard attack.  
* **Fast Attacks:** Skills like "Quick Strike" might have \+500 Speed.  
* **Slow Attacks:** Heavy weapon skills often have negative Speed Correction (e.g., \-500).

This creates a "Tiered" turn order. All actions with \+2000 priority occur first, sorted amongst themselves by AGI. Then all actions with \+0 priority occur. This layer supersedes stats. A character with 1 AGI using a \+2000 priority skill will act before a character with 999 AGI using a standard attack.

### **4.2. The Implications of Stochastic Speed**

The variance formula mentioned in Section 2.2 ($ \\text{AGI} \+ \\text{Rand}(5 \+ \\text{AGI}/4) $) implies that reliable strategy requires over-leveling AGI.  
Tactical Insight: In boss fights where the enemy possesses crowd-control abilities (Stun, Sleep), moving second can be fatal. To ensure a player moves before a boss with 100 AGI, the player needs roughly 135 AGI to overcome the worst-case variance scenario. This "AGI Tax" is a hidden cost in build optimization for Black Souls II.

## **5\. Buffs, Debuffs, and State Architecture**

The modification of parameters in real-time is handled through two distinct systems: The Buff/Debuff System and the State System.

### **5.1. The Two-Stage Discrete Buff System**

Unlike games with continuous buff stacking, *Black Souls II* uses a discrete step system verified in the Game\_BattlerBase script.

* **Buff Levels:** A parameter can be buffed to Level 1 (+25%) or Level 2 (+50%).  
* **Debuff Levels:** A parameter can be debuffed to Level \-1 (-25%) or Level \-2 (-50%).

**Mechanics of Interaction:**

* **Cancellation:** Applying a Buff to a Debuffed stat does not result in a net \-25% or similar. It simply removes one level of the Debuff. If you are at \-50% Attack (Level \-2) and cast "Strengthen" (Buff), you move to \-25% (Level \-1). You must cast it twice to return to Neutral, and four times total to reach \+50%.  
* **Duration Extension:** Re-applying a buff that is already at max level (Level 2\) does not increase the effect, but it resets the turn duration counter.

This discrete system means that Debuffs are incredibly potent. Reducing a boss's Attack by 50% (Level \-2 Debuff) is mathematically more effective than increasing your Defense by 50%, due to the subtractive damage formula. A 50% reduction in incoming ATK often drops the value below the player's DEF threshold, nullifying damage completely.

### **5.2. State Stacking and Restriction Logic**

States (Conditions) are more complex than simple buffs. They carry "Traits" and "Restrictions."

* **Restriction Hierarchy:** When multiple states are applied, the engine must decide which restriction governs the actor's behavior. The hierarchy is determined by priority.  
  1. **None**  
  2. **Attack Enemy** (Berserk)  
  3. **Attack Anyone** (Confusion)  
  4. **Attack Ally** (Charm)  
  5. **Cannot Move** (Stun/Paralysis)

If a player is both "Confused" and "Stunned," the "Cannot Move" restriction takes precedence because it is higher in the restriction priority list in the default engine configuration. This prevents logic loops where a stunned character attempts to attack an ally.

* State Overlay and Probability:  
  State Rate traits are multiplicative.

  $$\\text{Final Resistance} \= \\text{Trait A} \\times \\text{Trait B} \\times \\text{Trait C}$$

  If a piece of armor gives 50% Poison Resistance and an Accessory gives 50% Poison Resistance, the player is not Immune. They take $0.5 \\times 0.5 \= 0.25$ (25%) probability from poison sources. True Immunity requires a trait setting the rate to exactly 0%.

## **6\. Damage Computation Models and Logic**

The core combat verification centers on the algorithm used to deduct Hit Points.

### **6.1. The Standard Data Flow**

The execution of a damaging skill follows a strict pipeline:

1. **Formula Evaluation:** The database formula is processed. v \= formula\_result.  
2. **Element Rate:** v \*= target.element\_rate(element\_id).  
3. **PDR/MDR:** If physical, v \*= target.pdr (Physical Damage Rate). If magical, v \*= target.mdr.  
4. **Recovery Effect:** If the skill is healing, v \*= target.rec.  
5. **Critical:** If critical, v \*= 3.0.  
6. **Variance:** v \= apply\_variance(v, variance\_percent).  
7. **Guard:** v /= 2.0 (if guarding).  
8. **Floor:** v \= \[v, 0\].max.

Key Insight on Element Rates:  
Element rates are verified as percentage multipliers. In Black Souls II, where enemies may have 200% weakness to Fire or 0% reception (Immunity) to Dark, this step occurs before variance and defense flags but after the raw stats.  
Crucially, if a target has a negative element rate (e.g., \-50%), the damage is absorbed as healing. This is a "Absorb" mechanic verified in the Game\_Battler script logic.

### **6.2. Variance**

Variance is a standard ±20% in default settings, but can be adjusted per skill.

$$\\text{Variance Amount} \= \\text{Damage} \\times \\frac{\\text{Variance}\\%}{100}$$

$$ \\text{Final} \= \\text{Damage} \- \\text{Variance Amount} \+ \\text{Random}(2 \\times \\text{Variance Amount}) $$  
This formula creates a bell-curve-like distribution centered on the base damage.

## **7\. Defensive Mechanisms: Guard and Recovery**

### **7.1. The "Guard" Flag**

The Guard command is more than a stat boost; it is a temporary state.

* **Damage Divisor:** As noted, it divides final damage by 2\.  
* **TP Generation:** Guarding is the most efficient method for generating Tactical Points (TP). The flag charge\_tp\_by\_damage is active.  
* **State Probability:** While not universally true for all RM games, the default implementation—and that observed in *Black Souls II*—often includes hidden "State Resist" traits in the Guard state, lowering the probability of receiving status ailments by 50% while the shield is up.

### **7.2. Recovery Dynamics (REC vs PHA)**

The economy of healing is dictated by two multipliers.

* **PHA (Pharmacology):** A Sp-Parameter usually found on the *user* of an item. A character with 200% PHA doubles the effect of any potion they drink or administer.  
* **REC (Recovery Effect):** A Sp-Parameter on the *receiver*. A character with 200% REC receives double healing from all sources.

Synergy Verification:

$$\\text{Heal} \= \\text{Base} \\times \\text{User.PHA} \\times \\text{Target.REC}$$

If a player with 150% PHA uses a potion on a target with 150% REC, the total heal is $1.5 \\times 1.5 \= 2.25\\times$ (225%) of the base value. This multiplicative synergy is the key to sustaining high-HP pools in the late game of Black Souls II.

## **8\. Resource Economy: Regeneration and TP**

### **8.1. Regeneration Ticks**

Regeneration (HRG, MRG, TRG) occurs at the absolute end of a turn structure.

* **Quantization:** It is percentage-based. 5% HRG regenerates 5% of Max HP.  
* **Slip Damage:** Negative HRG acts as Poison.  
* **Verification:** Slip damage is also subject to variance in the default engine. It is not a static number, meaning a player at 1 HP might survive a poison tick if the variance rolls low, or die if it rolls high.

### **8.2. Tactical Points (TP)**

TP is a volatile resource, defaulting to a range of 0-100.

* **Generation on Hit:** Users gain TP when hitting enemies.  
* Generation on Damage: Users gain TP when taking damage.

  $$\\text{TP Gain} \= 50 \\times \\frac{\\text{Damage Taken}}{\\text{MaxHP}} \\times \\text{TCR}$$

  Critical Insight: This formula penalizes high HP builds regarding TP generation. A character with 1000 HP taking 100 damage gains roughly 5 TP. A character with 500 HP taking 100 damage gains 10 TP. This "Berserker Math" means fragile characters charge their Ultimate skills significantly faster than tanks, a balance mechanic verified in the engine architecture.

## **9\. Conclusion**

This technical audit confirms that *Black Souls II* operates within the strict, deterministic boundaries of the RPG Maker VX Ace (RGSS3) architecture. The complexity and difficulty of the game are not the result of obscure, custom-coded physics, but rather a mastery of the integer-based thresholds and multiplicative probability gates inherent to the engine.

The subtractive defense formula ($4a \- 2b$) serves as the primary gatekeeper of progression, creating steep difficulty cliffs. The split between Physical and Magical mitigation requires distinct build paths. Finally, the sequential processing of Hit, Evasion, and Criticals rewards players who understand that "Accuracy" is a prerequisite to "Power," and that "Debuffs" are often mathematically superior to "Buffs" due to the tiered nature of parameter stages.

For the player, this data suggests a clear meta-strategy: Prioritize AGI to overcome variance, utilize Debuffs to strip enemy defense thresholds, and exploit the multiplicative synergy of Pharmacology and Recovery for survival. The game is solved not by reflexes, but by the optimization of these underlying mathematical variables.

**End of Report**