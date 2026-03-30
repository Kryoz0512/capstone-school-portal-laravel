<?php
if (class_exists('ZipArchive')) {
    echo "✓ ZipArchive class is available<br>";
    $zip = new ZipArchive();
    echo "✓ ZipArchive can be instantiated<br>";
    echo "PHP Version: " . phpversion() . "<br>";
    echo "Zip extension version: " . phpversion('zip');
} else {
    echo "✗ ZipArchive class is NOT available";
}
