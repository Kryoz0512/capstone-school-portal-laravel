# Install PHP Zip Extension

## For Windows (XAMPP/WAMP):

1. Open `php.ini` file (usually in `C:\xampp\php\php.ini`)
2. Find this line: `;extension=zip`
3. Remove the semicolon to uncomment it: `extension=zip`
4. Save the file
5. Restart Apache

## For Windows (Laravel Herd):

The zip extension should already be enabled. If not:
1. Check your PHP version: `php -v`
2. The extension should be included by default

## For Linux/Mac:

```bash
# Ubuntu/Debian
sudo apt-get install php-zip

# Mac (Homebrew)
brew install php
```

## Verify Installation:

Run this command to check if zip is enabled:
```bash
php -m | grep zip
```

You should see "zip" in the output.

## Alternative: Use CSV Instead

If you can't install the extension, save your Excel file as CSV format instead, which doesn't require ZipArchive.
