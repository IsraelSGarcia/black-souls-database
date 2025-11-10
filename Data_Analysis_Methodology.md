# Data Analysis Methodology - How to KNOW Information Rather Than Guess

## Purpose

This document explains the methodology used to extract factual information from RPG Maker VX Ace data files, focusing on systematic approaches that yield **confirmed facts** rather than **inferences or guesses**.

## Core Principle

**Facts Over Inferences**: Always distinguish between:
- **Facts**: Information directly present in data files, editor interfaces, or documented engine specifications
- **Inferences**: Logical conclusions that may be correct but are not directly confirmed
- **Guesses**: Assumptions without evidence

## Methodology

### 1. Data Source Analysis

#### Step 1: Identify All Available Data Sources
- **Binary Data Files** (`.rvdata2`): Original game data in Ruby Marshal format
- **Processed JSON Files**: Converted data in readable format
- **Script Files**: Decompressed Ruby scripts from `Scripts.rvdata2`
- **Editor Screenshots**: Visual interface showing parameter definitions and structures
- **Documentation**: Official RPG Maker VX Ace documentation and specifications
- **Related Data Files**: MV data files, comments, logs, scripts

#### Step 2: Convert Data to Readable Format
- Use Ruby Marshal parser (`@savannstm/marshal`) to convert `.rvdata2` to JSON
- Decompress zlib-compressed scripts from `Scripts.rvdata2`
- Normalize data structures (convert `__symbol__@field` to `field`)

#### Step 3: Systematically Search All Sources
- **Direct grep/search**: Look for exact matches (e.g., `data_id: 18`)
- **Pattern matching**: Search for related patterns (e.g., `code: 11`)
- **Context analysis**: Examine surrounding data for patterns
- **Cross-referencing**: Compare usage across different files

### 2. Fact Extraction Process

#### A. Direct Evidence (Highest Confidence)

**Sources of Direct Evidence:**
1. **System.json `terms.params`**: Standard parameter names (0-7)
2. **Editor Screenshots**: Visual representation of parameter lists and names
3. **Documented Engine Specifications**: Official RPG Maker VX Ace parameter structure
4. **Data File Structure**: Explicit definitions in data files

**Example:**
- **Fact**: Parameter 0 = "MaxHP" (from `System.json`)
- **Fact**: Code 11 = Parameter Rate (from usage patterns with known parameters)
- **Fact**: TGR is first Sp-Parameter (from editor screenshot)

#### B. Pattern Analysis (Medium Confidence)

**When to Use:**
- When direct evidence is not available
- To identify relationships and correlations
- To understand usage patterns

**Process:**
1. Collect all occurrences of a feature/parameter
2. Analyze values and contexts
3. Compare with known patterns
4. Document patterns as "observed facts" (not interpretations)

**Example:**
- **Observed Fact**: `code: 11, data_id: 18, value: 1.5` appears in poison states
- **Observed Fact**: `code: 11, data_id: 1, value: 0.95` modifies Max MP (known parameter)
- **Pattern**: Code 11 uses multipliers to modify parameters

#### C. Cross-Referencing (Medium-High Confidence)

**Process:**
1. Compare data across multiple files
2. Verify consistency of usage
3. Identify relationships between parameters
4. Confirm patterns through multiple sources

**Example:**
- Standard parameters (0-7) used with code 11 in Weapons/Armors
- Extended parameters (8-17) visible in editor screenshots
- Special parameters (18+) visible in editor screenshots
- Cross-reference: If Ex-Parameters are 8-17, then Sp-Parameters start at 18

### 3. Verification Methods

#### A. Editor Screenshots
- **Purpose**: Visual confirmation of parameter names and structure
- **Strength**: Direct visual evidence from the game editor
- **Limitation**: May not show all parameters if lists are scrollable

**How to Use:**
1. Identify parameter lists in screenshots
2. Map visible parameters to known IDs
3. Verify parameter numbering structure
4. Cross-reference with data file usage

#### B. Documentation and Specifications
- **Purpose**: Official engine specifications and parameter definitions
- **Strength**: Authoritative source for standard parameters
- **Limitation**: May not cover custom parameters or modifications

**How to Use:**
1. Consult RPG Maker VX Ace documentation
2. Verify standard parameter structure (0-7, 8-17, 18-27)
3. Confirm parameter names and meanings
4. Use as baseline for custom parameters

#### C. Script Analysis
- **Purpose**: Find parameter definitions or usage in game scripts
- **Strength**: May reveal custom parameter handling
- **Limitation**: Scripts may not define all parameters explicitly

**How to Use:**
1. Decompress all scripts from `Scripts.rvdata2`
2. Search for parameter references
3. Look for parameter definitions or mappings
4. Document any parameter-related code

#### D. Data File Analysis
- **Purpose**: Find all occurrences and usage patterns
- **Strength**: Complete view of parameter usage in game data
- **Limitation**: Shows usage but not always definitions

**How to Use:**
1. Search all data files for parameter references
2. Collect all occurrences with context
3. Analyze usage patterns and values
4. Cross-reference with other data sources

### 4. Documenting Findings

#### Fact Documentation Format

**For Each Finding:**
1. **Source**: Where the fact was found (file, screenshot, documentation)
2. **Evidence**: Exact data or visual evidence
3. **Confidence Level**: High (direct evidence), Medium (pattern/context), Low (inference)
4. **Limitations**: What is not known or confirmed

#### Example Documentation

```markdown
### Parameter 18 = TGR (Target Rate)

**Source:**
- Editor Screenshot: Sp-Parameter list shows TGR as first item
- RPG Maker VX Ace Documentation: Parameters 18-27 are Sp-Parameters
- Data Files: Parameter 18 used with code 11 in poison states

**Evidence:**
- Screenshot shows TGR as first Sp-Parameter in dropdown
- Standard structure: Ex-Parameters are 8-17, Sp-Parameters start at 18
- Data shows `code: 11, data_id: 18, value: 1.5` in poison states

**Confidence Level:** High (direct evidence from multiple sources)

**Limitations:**
- Exact targeting calculation algorithm not known
- Game-specific implementation details not confirmed
```

### 5. Avoiding Guesses

#### Red Flags (When to Stop and Document Unknowns)

1. **No Direct Evidence**: If no direct evidence exists, document as "unknown"
2. **Conflicting Information**: If sources conflict, document both and note conflict
3. **Insufficient Data**: If data is incomplete, document what is known and what is missing
4. **Assumptions**: Never present assumptions as facts

#### What to Do Instead of Guessing

1. **Document Unknowns**: Clearly mark what is not known
2. **List Possible Sources**: Identify where information might be found
3. **Suggest Verification Methods**: Propose ways to find the information
4. **Separate Facts from Inferences**: Clearly distinguish between confirmed facts and logical inferences

### 6. Systematic Search Process

#### Step-by-Step Process

1. **Define the Question**: What information are we trying to find?
2. **List All Data Sources**: Identify all available files and resources
3. **Search Systematically**: Search each source methodically
4. **Collect Evidence**: Gather all relevant evidence
5. **Verify Findings**: Cross-reference with multiple sources
6. **Document Results**: Record facts, evidence, and limitations
7. **Identify Gaps**: Document what is still unknown

#### Example: Finding Parameter Information

1. **Question**: What is parameter 18?
2. **Sources**: System.json, States.json, Editor Screenshots, Documentation
3. **Search**:
   - Check System.json for parameter names (only 0-7 defined)
   - Search States.json for parameter 18 usage
   - Check editor screenshots for parameter lists
   - Consult RPG Maker VX Ace documentation
4. **Evidence**:
   - System.json: Only parameters 0-7 defined
   - Editor Screenshots: Sp-Parameters list shows TGR as first item
   - Documentation: Parameters 18-27 are Sp-Parameters
   - Data: Parameter 18 used with code 11
5. **Verification**: Cross-reference screenshot with documentation
6. **Documentation**: Parameter 18 = TGR (Target Rate) - confirmed from multiple sources
7. **Gaps**: Exact targeting algorithm not known

## Key Takeaways

### What This Methodology Achieves

1. **Systematic Approach**: Methodical search of all available sources
2. **Fact-Based**: Focus on confirmed facts rather than guesses
3. **Transparent**: Clear documentation of sources and evidence
4. **Verifiable**: Findings can be verified by others
5. **Complete**: Documents both known facts and unknown gaps

### What This Methodology Avoids

1. **Guessing**: No assumptions without evidence
2. **Inference as Fact**: Clear distinction between facts and inferences
3. **Incomplete Analysis**: Systematic search of all sources
4. **Unverified Claims**: All findings backed by evidence

## Application to Future Analysis

### When Analyzing New Data

1. **Start with Facts**: Identify all directly available facts
2. **Search Systematically**: Don't skip data sources
3. **Verify Findings**: Cross-reference with multiple sources
4. **Document Everything**: Record facts, evidence, and unknowns
5. **Avoid Guesses**: If information is not available, document it as unknown

### When Encountering Unknowns

1. **Document the Gap**: Clearly state what is not known
2. **List Possible Sources**: Identify where information might be found
3. **Suggest Methods**: Propose ways to find the information
4. **Don't Infer**: Avoid making up information to fill gaps

## Conclusion

This methodology emphasizes **systematic data analysis** and **fact-based findings** over guesses or assumptions. By following this process, we can extract reliable information from game data files while clearly documenting what is known, what is inferred, and what remains unknown.

---

*This methodology was developed through the analysis of RPG Maker VX Ace data files and editor interfaces.*

