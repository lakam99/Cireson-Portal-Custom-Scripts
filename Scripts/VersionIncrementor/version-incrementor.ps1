#Cireson Portal Version Incrementation Tool
#Written entirely by Arkam Mazrui
#arkam.mazrui@gmail.com

$portalDir2 = "//ottansm2/d$/InetPub/CiresonPortal";
$portalDir3 = "//ottansm3/d$/Admin/InetPub/CiresonPortal";
$global:portalDir = $portalDir2;
$global:server = "ottansm2";

$version_paths = @('./Versions.json', './bin/Versions.json', './bin/Templates/versions.json');
$customspace_version_path = "./CustomSpace/CustomSettings/scriptPatcher/versions.json";
$valid_options = @(1,2,3,4,5,6,'q','Q');

function try-connect-to-portal {
    try {
        cd $global:portalDir;   
        write-host -ForegroundColor Green "Successfully connected to the portal.";
        return 0;
    } catch {
        write-host -ForegroundColor Red "Failed to connect to the portal.";
        return -1;
    } 
}

function connect-to-portal {
    while (try-connect-to-portal -eq -1) {
        write-host -ForegroundColor Gray "Please provide the url where the cireson portal is installed.";
        write-host -ForegroundColor Gray "It's imperative to include the '//' server precursor, unless running on the local portal server.";
        $global:portalDir = read-host -Prompt "Enter the portal address: ";
    }
}

function get-customspace-version-raw {
    return (Get-Content -Raw $customspace_version_path | ConvertFrom-Json);
}

function get-customspace-version {
    return (get-customspace-version-raw).data.version;
}

function update-customspace-version($raw_json) {
    $raw_json | ConvertTo-Json | Out-File $customspace_version_path;
}

function increment-customspace-version {
    $current = get-customspace-version-raw;
    $current.data.version += 1;
    update-customspace-version($current);
}

function decrement-customspace-version {
    $current = get-customspace-version-raw;
    $current.data.version -= 1;
    update-customspace-version($current);
}

function get-customspace-loader-version-raw {
   [System.Collections.ArrayList]$versions = @();
   $temp = $null;
   foreach ($path in $version_paths) {
       $temp = Get-Content -Raw $path | ConvertFrom-Json;
       $versions.Add($temp) | Out-Null;
   }
   
   $unique = $versions | Select-Object -Unique;
   if ($unique.'static-content'.Length -ne 1) {
       throw "Fatal error: customspace loader versions out of sync...";
   } else {
       return $unique;
   }
}

function get-customspace-loader-version {
   return (get-customspace-loader-version-raw).'static-content';
}

function update-customspace-loader-version($current_json) {
    foreach ($path in $version_paths) {
        $current_json | ConvertTo-Json | Out-File $path;
    }
}

function increment-customspace-loader-version {
    $current = get-customspace-loader-version-raw;
    $current.'static-content' += 1;
    update-customspace-loader-version($current);
}

function decrement-customspace-loader-version {
    $current = get-customspace-loader-version-raw;
    $current.'static-content' -= 1;
    update-customspace-loader-version($current);
}

function switch-server {
    if ($server -eq "ottansm2") {
        $global:server = "ottansm3";
        $global:portalDir = $portalDir3;
    } else {
        $global:server = "ottansm2";
        $global:portalDir = $portalDir2;
    }
    connect-to-portal;
}

function title {
    write-host "####################################";
    write-host "#                                  #";
    write-host "#          Welcome to the          #";
    write-host "#     Portal Version Incrementor   #";
    write-host "#               By                 #";
    write-host "#          Arkam Mazrui            #";
    write-host "#  arkam.mazrui@nserc-crsng.gc.ca  #";
    write-host "#     arkam.mazrui@gmail.com       #";
    write-host "#                                  #";
    write-host "####################################";
}

function versions-display {
    write-host "Current server is $global:server.";
    write-host "Current customspace version is (" (get-customspace-version) ").";
    write-host "Current portal customspace loader version is (" (get-customspace-loader-version) ").";
}

function show-options {
    write-host "1: Increment Customspace Loader version.";
    write-host "2: Decrement Customspace Loader version.";
    write-host "3: Increment Customspace version.";
    write-host "4: Decrement Customspace version.";
    write-host "5: Refresh versions.";
    write-host "6: Switch server.";
    write-host "q: Quit.";
}

function get-option {
    $in = 0;
    while (!($valid_options -contains $in)) {
        show-options;
        $in = Read-Host "Please enter a correct option";
    }
    return $in;
}

function process-option($option) {
    switch ($option) {
        1 {increment-customspace-loader-version; break;}
        2 {decrement-customspace-loader-version; break;}
        3 {increment-customspace-version; break;}
        4 {decrement-customspace-version; break;}
        5 {break;}
        6 {switch-server; break;}
        'q' {exit;}
        'Q' {exit;}
        default: {Write-Host -ForegroundColor Red "Somehow obtained invalid option $option.";break;}
    }
}

function menu {
    while ($true) {
        cls;
        title;
        versions-display;
        write-host "";
        $option = get-option;
        process-option($option);
    }
    Write-Host "Goodbye.";
    pause;
}

connect-to-portal;
menu;
