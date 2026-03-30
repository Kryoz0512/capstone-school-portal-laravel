# Fix LRN Formatting in Excel

## Problem:
Excel displays LRN `123456789001` as `1.23457E+11` (scientific notation)

## Solutions:

### Option 1: Format as Text (Recommended)
1. Select the entire LRN column (Column A)
2. Right-click → Format Cells
3. Select "Text" from the Category list
4. Click OK
5. Re-enter the LRN values or paste them again

### Option 2: Add Single Quote Prefix
When entering LRN values, add a single quote before the number:
- Type: `'123456789001`
- Excel will display: `123456789001`
- The quote won't be visible but forces text format

### Option 3: Use CSV Format
Save your file as CSV instead of XLSX:
1. File → Save As
2. Choose "CSV (Comma delimited) (*.csv)"
3. This preserves the exact text format

### Option 4: Pre-format Before Entering Data
1. Select Column A (LRN column) BEFORE entering any data
2. Format Cells → Text
3. Then enter your LRN values

## For Import Template:
When creating the template for users, format the LRN column as Text to prevent this issue.

## Verification:
After formatting, the cell should show the full number: `123456789001`
Not scientific notation: `1.23457E+11`
