#!/usr/bin/env python3
"""
Remove console.log, console.error, console.warn statements from TypeScript files
Except in test files and __tests__ directories
"""

import os
import re
from pathlib import Path

def should_skip_file(filepath):
    """Check if file should be skipped"""
    path_str = str(filepath)
    return (
        '__tests__' in path_str or
        '.test.' in path_str or
        'setup.ts' in path_str or
        'test-' in path_str or
        'spec.' in path_str
    )

def remove_console_statements(content):
    """Remove console statements while preserving code structure"""
    # Pattern to match console.xxx(...) statements
    patterns = [
        r'^\s*console\.(log|error|warn|info|debug)\([^)]*\);\s*$',  # Standalone statements
        r'\s*console\.(log|error|warn|info|debug)\([^)]*\);\s*\n',  # With newline
    ]
    
    lines = content.split('\n')
    cleaned_lines = []
    
    for line in lines:
        # Check if line is a console statement
        is_console = False
        for pattern in patterns:
            if re.match(pattern, line):
                is_console = True
                break
        
        if not is_console:
            cleaned_lines.append(line)
    
    return '\n'.join(cleaned_lines)

def fix_unused_catch_variables(content):
    """Remove unused catch variables"""
    # Replace } catch (error) { with } catch {
    content = re.sub(r'\}\s*catch\s*\(\s*\w+\s*\)\s*\{', '} catch {', content)
    return content

def process_file(filepath):
    """Process a single file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # Remove console statements
        content = remove_console_statements(content)
        
        # Fix catch variables
        content = fix_unused_catch_variables(content)
        
        # Only write if changed
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
    
    return False

def main():
    base_dir = Path('/Users/sabujohnbosco/KreupAI/KreupAI.AuraOS/apps/web/src')
    
    if not base_dir.exists():
        print(f"Directory not found: {base_dir}")
        return
    
    print("🧹 Cleaning up console statements...\n")
    
    fixed_count = 0
    processed = 0
    
    for filepath in base_dir.rglob('*.ts'):
        if should_skip_file(filepath):
            continue
        
        processed += 1
        if process_file(filepath):
            fixed_count += 1
            print(f"✓ Fixed: {filepath.relative_to(base_dir.parent)}")
    
    for filepath in base_dir.rglob('*.tsx'):
        if should_skip_file(filepath):
            continue
        
        processed += 1
        if process_file(filepath):
            fixed_count += 1
            print(f"✓ Fixed: {filepath.relative_to(base_dir.parent)}")
    
    print(f"\n✅ Processed {processed} files")
    print(f"✅ Fixed {fixed_count} files with console statements")

if __name__ == '__main__':
    main()
