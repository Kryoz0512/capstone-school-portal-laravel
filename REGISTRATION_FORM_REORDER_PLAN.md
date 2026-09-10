# Registration Form Reordering Plan

## Objective
Move the "Student Documents" section to the top of the registration form in all three tabs (New Student, Old Student, Transferee).

## Current Structure

### All Tabs Currently Have:
1. Tab Banner (info about the tab)
2. **Student LRN** field
3. School Year fields
4. Birth Date
5. Gender
6. Name fields (Last, First, Middle, Suffix)
7. Section Assignment
8. **Documents Section** (currently at bottom)
9. Submit buttons

## Desired Structure

### All Tabs Should Have:
1. Tab Banner (info about the tab)
2. **Documents Section** (MOVED TO TOP)
3. Student LRN field
4. School Year fields
5. Birth Date
6. Gender
7. Name fields (Last, First, Middle, Suffix)
8. Section Assignment
9. Submit buttons

## Rationale
- Documents are important and should be collected/checked first
- Logical flow: Check documents → Enter student information → Assign section
- Matches typical registration desk workflow

## Technical Details

### Current Line Numbers:
- Form Start: Line 982
- Student LRN: Line 988
- Documents Section Start: Line 1271

### Documents Section Includes:
- PSA Birth Certificate checkbox
- SF9 (Form 138) checkbox  
- Report Card checkbox
- Good Moral Certificate checkbox
- Conditional display based on tab (new/old/transferee)
- Required vs optional indicators
- Validation error messages

## Implementation Approach
Due to the file's complexity (1616 lines) and the documents section being shared across all tabs, I'll need to:

1. Extract the entire documents section (lines ~1271-1420)
2. Place it after each tab's banner section
3. Adjust any tab-specific logic for document requirements
4. Ensure validation still works correctly

## Changes Per Tab

### New Student Tab:
- Banner  → Documents → LRN → School Year → etc.

### Old Student Tab:
- Banner → Grade Level Selection → **Documents** → Student Search → LRN → etc.

### Transferee Tab:
- Banner → Grade Level Selection → **Documents** → LRN → School Year → etc.

