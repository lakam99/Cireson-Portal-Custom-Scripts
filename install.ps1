#CustomSpace Installer
#Written by Arkam Mazrui 
#arkam.mazrui@nserc-crsng.gc.ca

$path="../Scripts/kendo/2018.1.117/";
$new="kendo.all.min.new.js";
$def="kendo.all.min.js";
$old="kendo.all.min.old.js";

Write-Host "Starting installation...";
cd $PSScriptRoot;
Copy-Item "CustomSpace" -Destination "../CustomSpace" -Force;
Copy-Item "kendo.all.min.js" $path$new -Force;
Rename-Item -Path $path$def -NewName $old -Force;
Rename-Item -Path $path$new -NewName $def -Force;
Write-Host "CustomSpace install complete.";
pause;