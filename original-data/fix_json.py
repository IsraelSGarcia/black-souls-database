import json
import re

def escape_control_characters(s):
    """Escape control characters in a string for JSON compatibility."""
    if not isinstance(s, str):
        return s
    
    # Replace control characters with their escaped equivalents
    result = []
    for char in s:
        code = ord(char)
        # Control characters are in range 0x00-0x1F (except tab, newline, carriage return which JSON allows)
        # and 0x7F-0x9F
        if (0x00 <= code <= 0x1F and char not in '\t\n\r') or (0x7F <= code <= 0x9F):
            # Escape as unicode
            result.append(f'\\u{code:04x}')
        else:
            result.append(char)
    return ''.join(result)

def fix_json_obj(obj):
    """Recursively fix all strings in a JSON object."""
    if isinstance(obj, dict):
        return {key: fix_json_obj(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [fix_json_obj(item) for item in obj]
    elif isinstance(obj, str):
        return escape_control_characters(obj)
    else:
        return obj

# Read the original file with error handling
input_file = r'c:\Users\Israel\Desktop\Projects\black-souls-database\original-data\Troops.json'
output_file = r'c:\Users\Israel\Desktop\Projects\black-souls-database\original-data\Troops_fixed.json'

print(f"Reading {input_file}...")

try:
    # Try to read as much as possible, replacing invalid characters
    with open(input_file, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()
    
    # Parse JSON
    print("Parsing JSON...")
    data = json.loads(content)
    
    # Fix all control characters
    print("Fixing control characters...")
    fixed_data = fix_json_obj(data)
    
    # Write the fixed JSON
    print(f"Writing fixed JSON to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(fixed_data, f, ensure_ascii=False, indent=None, separators=(',', ':'))
    
    print("Done! Fixed JSON saved.")
    print(f"\nYou can now replace the original file with the fixed one:")
    print(f"  Move: {output_file}")
    print(f"  To:   {input_file}")
    
except json.JSONDecodeError as e:
    print(f"JSON parsing error: {e}")
    print("\nAttempting line-by-line fix...")
    
    # Alternative approach: fix the raw text
    fixed_content = escape_control_characters(content)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(fixed_content)
    
    print(f"Fixed content written to {output_file}")
    
except Exception as e:
    print(f"Error: {e}")
