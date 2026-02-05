import os

file_path = r'd:\School Management\prisma\schema.prisma'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False
expense_count = 0

for i, line in enumerate(lines):
    # Check if we are entering an Expense model
    if line.strip().startswith('model Expense {'):
        expense_count += 1
        # Check if this is the "Old" one (look ahead or check comments/content)
        # The key differentiator: The new one has `// Updated Expense` comment above it or `vendorId` inside.
        # But we implement a simpler logic: The "Old" one is the SECOND one or the one with specific comment line above?
        # Let's check context.
        # The old one had "// Expense Tracking" above it (line 654).
        
        # Check previous line for "// Expense Tracking"
        prev_line = lines[i-1].strip() if i > 0 else ""
        if prev_line == "// Expense Tracking":
            skip = True
            # Remove the comment line which was already added to new_lines
            if new_lines and new_lines[-1].strip() == "// Expense Tracking":
                new_lines.pop()
    
    if skip:
        if line.strip() == '}':
            skip = False
        continue
    
    new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Fixed schema.")
