# process-data.js Usage Guide

This guide explains how to use the `process-data.js` script to process RPG Maker VX Ace data and generate detection reports.

## Basic Usage

### Standard Command

Run the script without any flags to get a summary report:

```bash
node app/process-data.js
```

This will display:
- Translation status
- ID reference resolution
- Cross-reference detection
- Inferred data detection (summary)
- Ignored Data ID/Value detection (summary)

### Output Format

The standard output uses simple one-line summaries for each detection type:

```
📊 Translation Status:
   ✅ 0 items with untranslated content

🔎 ID Reference Resolution:
   ✅ 0 unresolved ID references

🔍 Automatic Cross-Reference Detection:
   ✅ 0 missing cross-references found

🎯 Inferred Data Detection:
   ⚠️  2994 instances of inferred data without basis
   🔍 Unmapped known parameters: ⚠️  617 instances
   🔍 Displayed as unknown: ⚠️  233 instances
   🔍 Completely unknown parameters: ⚠️  796 instances

🔍 Ignored Data ID/Value:
   ⚠️  1348 instances
```

## Command-Line Flags

### `--report-ignored` or `--detailed-ignored`

Generates a **concise summary report** for ignored data ID/Value detection (default mode).

**Usage:**
```bash
node app/process-data.js --report-ignored
```

**What it shows:**
- Summary by source type (states, weapons, armors, items, skills, enemies)
- Summary by trait code (top 10)
- Statistics including:
  - Count by reason type
  - Unique data IDs and values
  - Most common data IDs (top 10)
- Sample items (top 5 sources, 3 items each) - gives you a quick overview

**Example Output:**
```
🔍 Ignored Data ID/Value:
   ⚠️  1348 instances

================================================================================
IGNORED DATA ID/VALUE - SUMMARY REPORT
================================================================================

📊 Summary by Source Type:
   states: 725 instances
   weapons: 423 instances
   armors: 200 instances

📊 Summary by Trait Code (Top 10):
   11 (Element Rate): 450 instances
   12 (Debuff Rate): 320 instances
   ...
   ... and 5 more trait codes

📈 Statistics:
────────────────────────────────────────────────────────────────────────────────

By Reason Type:
   Ex-Parameter: 450 instances
   Sp-Parameter: 320 instances
   ...

Unique Data IDs: 45
Unique Values: 120

Most Common Data IDs (Top 10):
   Data ID 8: 234 instances
   Data ID 9: 189 instances
   ...

📋 Sample Items (Top 5 Sources, 3 items each):
────────────────────────────────────────────────────────────────────────────────

STATES (725 total instances):

  states #1 (Incapacitated) - 4 traits:
    - Trait #0: Ex-Parameter (dataId:6, value:-1)
    - Trait #1: Ex-Parameter (dataId:6, value:-1)
    - Trait #2: Ex-Parameter (dataId:5, value:-1)
    ... and 1 more traits
  ...

💡 Tip: Use --report-ignored-full for complete detailed output
```

### `--report-ignored-full` or `--full`

Generates a **complete detailed report** with all instances listed (use when you need the full list).

**Usage:**
```bash
node app/process-data.js --report-ignored-full
```

**What it shows:**
- Everything from the summary report, plus:
- Complete detailed list of ALL instances grouped by source type and source ID
- Full information for each trait (code, dataId, value, description, reason, location)

**When to use:**
- When you need to see every single instance
- For debugging specific issues
- When exporting to files for analysis
- **Note:** This can be very long (1000+ lines) for large datasets

## Understanding the Reports

### Translation Status

Shows how many items contain untranslated Japanese content. Ideally should be `✅ 0`.

### ID Reference Resolution

Detects unresolved ID references in text (e.g., "Skill #123" that doesn't link to an actual skill). Ideally should be `✅ 0`.

### Automatic Cross-Reference Detection

Finds places where entity IDs (states, skills, weapons, etc.) are referenced but not properly marked as cross-references. Ideally should be `✅ 0`.

### Inferred Data Detection

Detects various types of inferred or unmapped data:

- **Mappings without sources**: Mappings that don't have documented sources
- **Unmapped known parameters**: Parameters that are known but not mapped in code
- **Displayed as unknown**: Items shown as "Unknown Parameter" or "Unknown Trait"
- **Unknown trait codes**: Trait codes that aren't recognized
- **Completely unknown parameters**: Parameters that are completely unmapped

### Ignored Data ID/Value

Detects when trait data (code, dataId, value) exists but is not meaningfully used in the description. This includes:

1. **Fallback to codeName**: When a trait has dataId/value but the description just shows the code name (e.g., "Ex-Parameter" instead of "Hit Rate +50%")
2. **Generic placeholders**: When dataId is shown as a generic placeholder (e.g., "Ex-Parameter 10" for unmapped dataId)
3. **Unmapped data**: When dataId exists but is out of known range or unmapped

**Common cases:**
- Trait codes without handlers (codes 11, 12, 31-34, 41, 43, 44, 51-55, 61-64)
- DataId out of known range (e.g., Ex-Parameter dataId 10+)
- Generic placeholders like "Unknown Parameter" or "Parameter 10"

## Interpreting Results

### ✅ Success Indicators

- `✅ 0 items with untranslated content` - All content is translated
- `✅ 0 unresolved ID references` - All ID references are resolved
- `✅ 0 missing cross-references found` - All cross-references are properly marked
- `✅ 0 instances` - No issues detected

### ⚠️ Warning Indicators

- `⚠️  N instances` - Issues detected that need attention
- Higher numbers indicate more work needed to map/unmap data
- Use `--report-ignored` flag to see detailed breakdown

## Workflow Recommendations

1. **Run standard command first**: Get an overview of all issues
   ```bash
   node app/process-data.js
   ```

2. **Check high-priority issues**: Focus on items with `⚠️` warnings

3. **Get summary report**: Use `--report-ignored` to see a concise overview
   ```bash
   node app/process-data.js --report-ignored
   ```

4. **Get full detailed report** (if needed): Use `--report-ignored-full` for complete listing
   ```bash
   node app/process-data.js --report-ignored-full
   ```

5. **Fix issues**: Address unmapped parameters, add handlers for trait codes, etc.

6. **Re-run**: Verify that issues are resolved

## Output Files

The script generates the following files:

- `app/data.js` - Processed data for client-side use
- `app/processed-data.json` - Full processed data in JSON format

## Tips

- **Use `--report-ignored` first**: The summary report is concise and shows the most important information
- **Use `--report-ignored-full` only when needed**: The full report can be very long (1000+ instances)
- Focus on the "Most Common Data IDs" section to see which parameters need mapping first
- Check "Summary by Trait Code" to see which trait codes need handlers
- Use "Summary by Source Type" to see which data types (states, weapons, etc.) have the most issues
- The sample items section gives you a quick preview without overwhelming detail

## Examples

### Basic Run
```bash
node app/process-data.js
```

### Summary Report for Ignored Data (Recommended)
```bash
node app/process-data.js --report-ignored
```

### Full Detailed Report for Ignored Data
```bash
node app/process-data.js --report-ignored-full
```

### Save Output to File
```bash
# Save summary report
node app/process-data.js --report-ignored > report-summary.txt

# Save full detailed report
node app/process-data.js --report-ignored-full > report-full.txt
```

### Combine with grep to filter
```bash
# Filter summary report
node app/process-data.js --report-ignored | grep "states"

# Filter full report
node app/process-data.js --report-ignored-full | grep "states #"
```

## Troubleshooting

### Script fails to run
- Make sure you're in the project root directory
- Ensure Node.js is installed (`node --version`)
- Check that all data files exist in `original-data/mv-converted/`

### No output
- Check that data files are present
- Verify file permissions
- Check console for error messages

### Too many issues reported
- This is normal for initial runs
- Focus on high-priority issues first (unmapped known parameters)
- Use the detailed report to identify patterns
- Address issues incrementally

## Related Documentation

- See `docs/Data_Certainty_Analysis.md` for information about data sources
- See `docs/Source_Verification_System.md` for source verification requirements
- See `docs/Verified_Mappings_With_Sources.md` for documented mappings
