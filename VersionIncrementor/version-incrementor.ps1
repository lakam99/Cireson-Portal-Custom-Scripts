#Cireson Portal Version Incrementation Tool
#Written entirely by Arkam Mazrui
#arkam.mazrui@gmail.com

$portalDir = "//ottansm2/d$/InetPub/CiresonPortal";
$version_paths = @('./Versions.json', './bin/Versions.json', './bin/Templates/versions.json');
$run = $true;

function try-connect-to-portal {
    try {
        cd $portalDir;   
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
        $portalDir = read-host -Prompt "Enter the portal address: ";
    }
}

function get-customspace-version {
    $portal_version_json = Get-Content -Raw "./CustomSpace/CustomSettings/scriptPatcher/versions.json" | ConvertFrom-Json;
    return $portal_version_json.data.version;
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
    write-host "Current customspace version is (" (get-customspace-version) ").";
    write-host "Current portal customspace loader version is (" (get-customspace-loader-version) ").";
}

function show-options {
    write-host "1: Increment Customspace Loader version.";
    write-host "2: Decrement Customspace Loader version.";
    write-host "3: Refresh versions.";
    write-host "q: Quit.";
}

function get-option {
    $in = 0;
    while ($in -ne 1 -and $in -ne 2 -and $in -ne 3 -and $in -ne 'q' -or $in -ne 'Q') {
        show-options;
        $in = Read-Host "Please enter a correct option";
    }
    return $in;
}

function process-option($option) {
    switch ($option) {
        1 {increment-customspace-loader-version; break;}
        2 {decrement-customspace-loader-version; break;}
        3 {break;}
        'q' {exit;}
        'Q' {exit;}
        default: {Write-Host -ForegroundColor Red "Somehow obtained invalid option $option.";break;}
    }
}

function menu {
    while ($run) {
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
