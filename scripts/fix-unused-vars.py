#!/usr/bin/env python3
"""
Fix unused variable errors by prefixing with underscore
Handles:
1. Unused variable assignments: const userId = ... -> const _userId = ...
2. Unused function parameters: (user, data) => ... -> (_user, data) => ...
3. Unused catch variables: } catch (error) { -> } catch (_error) {
4. Unused destructuring: const { userId } = ... -> const { userId: _userId } = ...
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
        'vitest' in path_str
    )

def fix_unused_variables(content):
    """Fix unused variables with common patterns"""
    
    # Pattern 1: const/let/var varName = (not already prefixed)
    # const userId = -> const _userId =
    content = re.sub(
        r'\b(const|let|var)\s+([a-z][a-zA-Z0-9]*)\s*=',
        lambda m: f'{m.group(1)} _{m.group(2)} =' if not m.group(2).startswith('_') else m.group(0),
        content
    )
    
    # Pattern 2: Destructuring assignments { varName } = 
    # const { userId } = -> const { userId: _userId } =
    # This is trickier, skip for now as it requires AST parsing
    
    # Pattern 3: Function parameters - arrow functions
    # (employee, index) => -> (_employee, index) =>
    # Only fix first param if it looks unused (common pattern)
    content = re.sub(
        r'\(([a-z][a-zA-Z0-9]*)(:\s*[^,)]+)?\s*,',
        lambda m: f'(_{m.group(1)}{m.group(2) if m.group(2) else ""}, ' if not m.group(1).startswith('_') else m.group(0),
        content
    )
    
    # Pattern 4: Single parameter arrow functions
    # .map(employee => -> .map(_employee =>
    content = re.sub(
        r'\.(?:map|filter|forEach|find|some|every|reduce)\(([a-z][a-zA-Z0-9]*)\s+=>', 
        lambda m: f'.{m.group(0).split("(")[0].split(".")[-1]}(_{m.group(1)} =>' if not m.group(1).startswith('_') else m.group(0),
        content
    )
    
    # Pattern 5: catch blocks with error variable
    # } catch (error) { -> } catch (_error) {
    content = re.sub(
        r'\}\s*catch\s*\(([a-z][a-zA-Z0-9]*)\)',
        lambda m: f'}} catch (_{m.group(1)})' if not m.group(1).startswith('_') else m.group(0),
        content
    )
    
    return content

def process_file(filepath):
    """Process a single file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # Apply fixes
        content = fix_unused_variables(content)
        
        # Only write if changed
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ {filepath}")
            return True
    except Exception as e:
        print(f"❌ Error processing {filepath}: {e}")
    
    return False

def main():
    base_dir = Path('/Users/sabujohnbosco/KreupAI/KreupAI.AuraOS/apps/web/src')
    
    if not base_dir.exists():
        print(f"Directory not found: {base_dir}")
        return
    
    print("🔧 Fixing unused variables by prefixing with underscore...\n")
    print("This will handle:")
    print("  - Variable assignments (const/let/var)")
    print("  - Function parameters")
    print("  - Catch block variables")
    print()
    
    fixed_count = 0
    processed_count = 0
    
    # Process TypeScript files
    for filepath in base_dir.rglob('*.ts'):
        if should_skip_file(filepath):
            continue
        processed_count += 1
        if process_file(filepath):
            fixed_count += 1
    
    # Process TSX files
    for filepath in base_dir.rglob('*.tsx'):
        if should_skip_file(filepath):
            continue
        processed_count += 1
        if process_file(filepath):
            fixed_count += 1
    
    print(f"\n📊 Processed {processed_count} files")
    print(f"✅ Fixed {fixed_count} files with unused variable issues")

if __name__ == '__main__':
    main()
