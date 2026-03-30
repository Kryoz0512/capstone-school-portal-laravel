# Restart Apache to Enable Zip Extension

## The zip extension is enabled in your php.ini, but Apache needs to be restarted.

### Option 1: Using XAMPP Control Panel
1. Open XAMPP Control Panel
2. Click "Stop" next to Apache
3. Wait a few seconds
4. Click "Start" next to Apache

### Option 2: Using Command Line
```bash
# Stop Apache
net stop Apache2.4

# Start Apache
net start Apache2.4
```

### Option 3: Restart Computer
If the above doesn't work, restart your computer.

## After Restarting:
Try uploading the Excel file again. The ZipArchive error should be gone.

## Alternative: Use CSV Files
If you still have issues, save your Excel file as CSV format:
1. File → Save As
2. Choose "CSV (Comma delimited) (*.csv)"
3. CSV files don't require ZipArchive and work perfectly with the import system

The CSV files you already have (`student_import_test.csv`) work great!
