#CustomSpace Installer
#Written by Arkam Mazrui 
#arkam.mazrui@nserc-crsng.gc.ca

function writeReplace([String]$path, [String]$def, [String]$new, [String]$old) {
    Copy-Item $def $path$new -Force;
    Rename-Item -Path $path$def -NewName $old -Force;
    Rename-Item -Path $path$new -NewName $def -Force;
}

$scripts="../Scripts/";

$kendoPath=$scripts + "kendo/2018.1.117/";
$newK="kendo.all.min.new.js";
$defK="kendo.all.min.js";
$oldK="kendo.all.min.old.js";

$wiMainPath=$scripts + "forms/";
$newW="wiMain.new.js";
$defW="wiMain.js";
$oldW="wiMain.old.js";

Write-Host "Starting installation...";
cd $PSScriptRoot;
Copy-Item "CustomSpace" -Destination "../CustomSpace" -Recurse -Force;
writeReplace $kendoPath $defK $newK $oldK;
writeReplace $wiMainPath $defW $newW $oldW;
Write-Host "CustomSpace install complete.";
pause;