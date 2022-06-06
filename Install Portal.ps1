#Parameters
param(
$ManagementServer = "",
$SQLServer = "",
$SiteRootPath = "C:\InetPub\",
$SiteName = "CiresonPortal",
$SitePort = 80,
$PortalUser = "",
$PortalPassword = "",
$ApplicationTitle = "IT Service Portal",
$LanguageCode = "ENU",
$LanguageCodeDateTime = "ENU",
$ServiceCatalogLanguageCode = "*",
$CreateManagementDB = $false,
$ManagementDBName = "ServiceManagement",
$ExecuteDac = $false,
$InstallManagementPacks = $true,
$InstallWebsite = $true,
$ManagementServerBinaryPath = ("\\" + $ManagementServer + "\c$\Program Files\Microsoft System Center 2012 R2\Service Manager\SDK Binaries\"),
#The 120 version of the DacFxSDK supportsSQL 2014, but does not seem to run on Windows 8 in all cases (It cannot connect to a named instance)...
$DacFxSDKPath = (${env:ProgramFiles} + "\Microsoft SQL Server\130\DAC\bin\Microsoft.SqlServer.Dac.dll"),
#$DacFxSDKPath = (${env:ProgramFiles} + "\Microsoft SQL Server\110\DAC\bin\Microsoft.SqlServer.Dac.dll"),
$LogFilePath = (${env:Temp} + "\CiresonInstall" + (Get-Date -format "yyyy-MM-dd-hh-mm-ss") + ".log"),
$CacheLanguageCodes = "*",
$RunCacheBuilderAsService = $false,
$CacheServiceUserName = "",
$CacheServicePassword = "",
$AcceptEULA = $true,
$AnalystsADGroup = "",
$AssetManagementADGroup = "",
$KnowledgeManagerADGroup = "",
$ConfigItemClasses = "",
$SMDBName = "ServiceManager",
$SMSQLServer = "",
$SQLDBPath = "",
$SQLDBLogPath = $SQLDBPath, 
$ConflictingWebsiteToStop = "",
$NotificationTemplatePrefix = "Email",
$SMTPServerName = "",
$SMTPServerPort = 25,
$SMTPEmailReturnAddress = "",
$UseSSOAuth = $false,
$InstallCacheBuilderDisabled = $false,
$AnalyticServiceUserName = "",
$AnalyticServicePassword = "",
$AnalyticDBName="CiresonAnalytics",
$InstallAnalytic=$false,
$AnalyticFrequency=1440,
$AnalyticFrequencyType=4,
$WI_Incident=3650,
$WI_Problem=3650,
$WI_ServiceRequest=3650,
$WI_Change=3650,
$WI_Release=3650,
$WI_ReviewActivity=3650,
$WI_ManualActivity=3650,
$WI_Relationship=3650,
$AnalyticFrequencyStartDate="",
$HttpsListenerPort = 443,
$SSLCertificateName = "",
$CheckDBExists=$false,
$DisableProductMetrics=$false
)

set-location $PSScriptroot
$global:existsManagement = $false
$existsAnalytic = $false
$programDataPath = $env:ProgramData + "\Cireson.Platform.Host"

$global:originalServiceConfig = @{}

function writeToLog([string] $message)
{
	try{
		$message + "`n"
		#Add-Content $LogFilePath ((Get-Date -format "yyyy-MM-dd-hh-mm-ss") + ": " + $message + "`n")
	}catch{
	}
}

function writeProgress([int] $progress)
{
    ("%progress%=" + $progress+ "`n")
}

function writeWarning([string] $warning)
{
	writeToLog $warning;
    ("%warning%=" + $warning + "`n")
}

function writeError([string] $error)
{
	writeToLog $error;
    ("%error%=" + $error + "`n")
}


function retainMachineKey() {
	try
	{
		 mkdir -Force "InstallationFiles\Config\temp"
        Copy-Item "InstallationFiles\Config\Web.config" "InstallationFiles\Config\temp" -Force
		$hasMachineKey = $false
		$pathToFile = "InstallationFiles\Config\Web.config";
		$newFile = Get-Content $pathToFile -encoding "UTF8" | foreach-object {
			if ($_.contains("<machineKey")) {
				$sitePath = ($SiteRootPath + $SiteName) + "\Web.config"
				$xmldoc = [xml](Get-Content $sitePath)
				$node = $xmldoc.SelectSingleNode("/configuration/system.web/machineKey");
				
				$verStart = $_.IndexOf("<")
				$verEnd = $_.IndexOf(">", $verStart)
				$machineContent = $_.SubString($verStart, $verEnd-$verStart+1)
				
				if ($node.OuterXml -ne ""){				
					$_.Replace($machineContent, $node.OuterXml)
					$hasMachineKey = $true
				}
			}  else {
				$_
			} 
		}
    
		if ($hasMachineKey){
			$newfile | set-Content $pathToFile -encoding "UTF8"
		}
	}
	catch{
		$ErrorMessage = $_.Exception.Message
		$FailedItem = $_.Exception.ItemName
		writeError $_.Exception.Message
	}
}


function revertInstallationWebConfig(){
	Copy-Item "InstallationFiles\Config\temp\Web.config" "InstallationFiles\Config" -Force
	Remove-Item "InstallationFiles\Config\temp\Web.config" -Force 
}

function setRecoveryToSimple(){
	#if ($global:existsManagement -eq $false)  {
	if($CreateManagementDB -eq $true){
		writeToLog ("Set recovery to simple. ManagementDBName:" + $ManagementDBName + " SQLServer:" + $SQLServer)
		Copy-Item -Path "InstallationFiles\DBScripts\AlterServiceManagementRecovery.sql" -Destination ("InstallationFiles\DBScripts\AlterServiceManagementRecovery-Temp.sql") -force
		replaceTokensInFile ("InstallationFiles\DBScripts\AlterServiceManagementRecovery-Temp.sql") "%ManagementDBName%" $ManagementDBName
		Invoke-Sqlcmd -InputFile "InstallationFiles\DBScripts\AlterServiceManagementRecovery-Temp.sql" -ServerInstance $SQLServer -ErrorAction 'Stop' -Verbose -QueryTimeout 60 
	}
}

function IsDBInstalled($showWarnings)
{
	try{
		$strReturn = ""
		
	
		[System.Reflection.Assembly]::LoadWithPartialName('Microsoft.SqlServer.SMO') | out-null
		$s = New-Object ('Microsoft.SqlServer.Management.Smo.Server') $SQLServer
		if($s.Databases[$ManagementDBName]) 
		{
			$global:existsManagement = $true
			$strReturn = $ManagementDBName;
		}

		if($InstallAnalytic -and $s.Databases[$AnalyticDBName]) 
		{
			$existsAnalytic = $true

			if ($strReturn)
			{
				$strReturn = $strReturn + " and " + $AnalyticDBName
			}
			else
			{
				$strReturn = $AnalyticDBName;
			}
		
		}

		if ($showWarnings -and ($global:existsManagement -or $existsAnalytic)){
			$strReturn = $strReturn + " database already exists, would you like to overwrite this database?"
			writeWarning $strReturn
		}
	}catch [Exception]{
        $ex = $_.Exception.Message
        writeError("Failed to check database existence" + " : " + $ex)
    }
}

if ($CheckDBExists -eq $true) 
{
	IsDBInstalled($true)
	return
}
else
{
	IsDBInstalled($false)
}

retainMachineKey

function replaceTokensInFile([string]$filePath, [string]$token, [string]$replaceWith)
{
    $filePath
    $token
    $replaceWith

    $fileContent = (gc -path $filePath -Raw).replace($token, $replaceWith)
    $fileContent | Out-File -FilePath $filePath -Encoding utf8
    writeToLog ("Replacing content in: " + $filePath)
}

function deployManagementDatabase(){
    if($CreateManagementDB -eq $true){
        try{
			writeToLog "Creating ServiceManagement database."
			Copy-Item -Path "InstallationFiles\DBScripts\ServiceManagement.sql" -Destination ("InstallationFiles\DBScripts\ServiceManagement-Temp.sql") -force
			$SQLCustomCreationOptions = "" 
			if($SQLDBPath -ne ""){
				$SQLCustomCreationOptions = " ON  PRIMARY ( NAME = N'%ManagementDBName%', FILENAME = N'%SQLDBPath%\%ManagementDBName%.mdf') LOG ON ( NAME = N'%ManagementDBName%_log', FILENAME = N'%SQLDBLogPath%\%ManagementDBName%.ldf')"
			}

			#place holder value so the sql script doesn't choke...
			$tmpPortalUser = "~na"
			$tmpCacheServiceUserName = "~na"

			if($PortalUser -ne ""){
				$tmpPortalUser =$PortalUser
			}
			if($CacheServiceUserName -ne ""){
				$tmpCacheServiceUserName  = $CacheServiceUserName 
			}

			replaceTokensInFile ("InstallationFiles\DBScripts\ServiceManagement-Temp.sql") "%SQLCustomCreationOptions%" $SQLCustomCreationOptions
			replaceTokensInFile ("InstallationFiles\DBScripts\ServiceManagement-Temp.sql") "%SQLDBPath%" $SQLDBPath
			replaceTokensInFile ("InstallationFiles\DBScripts\ServiceManagement-Temp.sql") "%SQLDBLogPath%" $SQLDBLogPath
			replaceTokensInFile ("InstallationFiles\DBScripts\ServiceManagement-Temp.sql") "%PortalUser%" $tmpPortalUser
			replaceTokensInFile ("InstallationFiles\DBScripts\ServiceManagement-Temp.sql") "%CacheServiceUserName%" $tmpCacheServiceUserName
			replaceTokensInFile ("InstallationFiles\DBScripts\ServiceManagement-Temp.sql") "%ManagementDBName%" $ManagementDBName


			writeToLog "Attempting to create ServiceManagement Database " + $ManagementDBName
			Invoke-Sqlcmd -InputFile "InstallationFiles\DBScripts\ServiceManagement-Temp.sql" -ServerInstance $SQLServer -ErrorAction 'Stop' -Verbose -QueryTimeout 60 

			

			writeToLog "Done Creating ServiceManagement Database " + $ManagementDBName + " on " + $SQLServer
        }catch [Exception]{
            $ex = $_.Exception.Message
            writeError("Failed to create management database  " + $ManagementDBName + " on " + $SQLServer + " : " + $ex)
        }
    }
}


function deployAnalyticsDatabase(){
    try{
		writeToLog "Creating Cireson Analytics database."
		Copy-Item -Path "InstallationFiles\DBScripts\Analytics.sql" -Destination ("InstallationFiles\DBScripts\Analytics-Temp.sql") -force
		$SQLAnalyticsCustomCreationOptions = "" 
		if($SQLDBPath -ne ""){
			$SQLAnalyticsCustomCreationOptions = " ON  PRIMARY ( NAME = N'%AnalyticDBName%', FILENAME = N'%SQLDBPath%\%AnalyticDBName%.mdf') LOG ON ( NAME = N'%AnalyticDBName%_log', FILENAME = N'%SQLDBLogPath%\%AnalyticDBName%.ldf')"
		}

		#place holder value so the sql script doesn't choke...
		$tmpAnalyticsUserName = "~na"

		if($AnalyticServiceUserName -ne ""){
			$tmpAnalyticsUserName  = $AnalyticServiceUserName 
		}


		replaceTokensInFile ("InstallationFiles\DBScripts\Analytics-Temp.sql") "%SQLAnalyticsCustomCreationOptions%" $SQLAnalyticsCustomCreationOptions
		replaceTokensInFile ("InstallationFiles\DBScripts\Analytics-Temp.sql") "%SQLDBPath%" $SQLDBPath
		replaceTokensInFile ("InstallationFiles\DBScripts\Analytics-Temp.sql") "%SQLDBLogPath%" $SQLDBLogPath
		replaceTokensInFile ("InstallationFiles\DBScripts\Analytics-Temp.sql") "%AnalyticServiceUserName%" $tmpAnalyticsUserName
		replaceTokensInFile ("InstallationFiles\DBScripts\Analytics-Temp.sql") "%AnalyticDBName%" $AnalyticDBName


		writeToLog "Attempting to create CiresonAnalytics Database " + $AnalyticDBName
		Invoke-Sqlcmd -InputFile "InstallationFiles\DBScripts\Analytics-Temp.sql" -ServerInstance $SQLServer -ErrorAction 'Stop' -Verbose -QueryTimeout 60 
		writeToLog "Done Creating CiresonAnalytics Database " + $AnalyticDBName + " on " + $SQLServer
    }catch [Exception]{
        $ex = $_.Exception.Message
        writeError("Failed to create analytics database  " + $AnalyticDBName + " on " + $SQLServer + " : " + $ex)
    }
}

function createSQLLogins(){
    if($InstallWebsite -eq $true -Or $RunCacheBuilderAsService -eq $true){
        try{
			writeToLog "Creating ServiceManagement database Logins."
			Copy-Item -Path "InstallationFiles\DBScripts\SetupLogins.sql" -Destination ("InstallationFiles\DBScripts\SetupLogins-Temp.sql") -force

			#place holder value so the sql script doesn't choke...
			$tmpPortalUser = "~na"
			$tmpCacheServiceUserName = "~na"

			if($PortalUser -ne ""){
				$tmpPortalUser =$PortalUser
			}
			if($CacheServiceUserName -ne ""){
				$tmpCacheServiceUserName  = $CacheServiceUserName 
			}

			replaceTokensInFile ("InstallationFiles\DBScripts\SetupLogins-Temp.sql") "%PortalUser%" $tmpPortalUser
			replaceTokensInFile ("InstallationFiles\DBScripts\SetupLogins-Temp.sql") "%CacheServiceUserName%" $tmpCacheServiceUserName
			replaceTokensInFile ("InstallationFiles\DBScripts\SetupLogins-Temp.sql") "%ManagementDBName%" $ManagementDBName
			writeToLog "Attempting to create ServiceManagement Database Logins " + $ManagementDBName
			Invoke-Sqlcmd -InputFile "InstallationFiles\DBScripts\SetupLogins-Temp.sql" -ServerInstance $SQLServer -ErrorAction 'Stop' -Verbose -QueryTimeout 60 
			writeToLog "Done Creating ServiceManagement Database Logins " + $ManagementDBName + " on " + $SQLServer
        }catch [Exception]{
            $ex = $_.Exception.Message
            writeWarning("Failed to create management database logins " + $ManagementDBName + " on " + $SQLServer + " : " + $ex)
        }
    }
}

function createAnalyticsSQLLogins(){
    try{
		writeToLog "Creating CiresonAnalytics database Logins."
		Copy-Item -Path "InstallationFiles\DBScripts\AnalyticsSetupLogins.sql" -Destination ("InstallationFiles\DBScripts\AnalyticsSetupLogins-Temp.sql") -force

		#place holder value so the sql script doesn't choke...
		$tmpAnalyticsUserName = "~na"

		if($AnalyticServiceUserName -ne ""){
			$tmpAnalyticsUserName  = $AnalyticServiceUserName 
		}

		replaceTokensInFile ("InstallationFiles\DBScripts\AnalyticsSetupLogins-Temp.sql") "%AnalyticServiceUserName%" $tmpAnalyticsUserName
		replaceTokensInFile ("InstallationFiles\DBScripts\AnalyticsSetupLogins-Temp.sql") "%AnalyticDBName%" $AnalyticDBName
		writeToLog "Attempting to create CireslonAnalytics Database Logins " + $AnalyticDBName
		Invoke-Sqlcmd -InputFile "InstallationFiles\DBScripts\AnalyticsSetupLogins-Temp.sql" -ServerInstance $SQLServer -ErrorAction 'Stop' -Verbose -QueryTimeout 60 
		writeToLog "Done Creating CireslonAnalytics Database Logins " + $AnalyticDBName + " on " + $SQLServer
    }catch [Exception]{
        $ex = $_.Exception.Message
        writeWarning("Failed to create analytics database logins " + $AnalyticDBName + " on " + $SQLServer + " : " + $ex)
    }
    
}

function updateDefaultSettings(){
    if($InstallWebsite -eq $true -Or $RunCacheBuilderAsService -eq $true){
        try{
			writeToLog "Populate Default Settings items."
			Copy-Item -Path "InstallationFiles\DBScripts\PopulateDefaultSettingsItem.sql" -Destination ("InstallationFiles\DBScripts\PopulateDefaultSettingsItem-Temp.sql") -force

			
			replaceTokensInFile ("InstallationFiles\DBScripts\PopulateDefaultSettingsItem-Temp.sql") "%ManagementServer%" $ManagementServer
			replaceTokensInFile ("InstallationFiles\DBScripts\PopulateDefaultSettingsItem-Temp.sql") "%SQLServer%" $SQLServer
			replaceTokensInFile ("InstallationFiles\DBScripts\PopulateDefaultSettingsItem-Temp.sql") "%ApplicationTitle%" $ApplicationTitle.replace('''','''''')
			replaceTokensInFile ("InstallationFiles\DBScripts\PopulateDefaultSettingsItem-Temp.sql") "%LanguageCode%" $LanguageCode
			replaceTokensInFile ("InstallationFiles\DBScripts\PopulateDefaultSettingsItem-Temp.sql") "%LanguageCodeDateTime%" $LanguageCodeDateTime
			replaceTokensInFile ("InstallationFiles\DBScripts\PopulateDefaultSettingsItem-Temp.sql") "%ServiceCatalogLanguageCode%" $ServiceCatalogLanguageCode
			replaceTokensInFile ("InstallationFiles\DBScripts\PopulateDefaultSettingsItem-Temp.sql") "%ManagementDBName%" $ManagementDBName
			replaceTokensInFile ("InstallationFiles\DBScripts\PopulateDefaultSettingsItem-Temp.sql") "%NotificationTemplatePrefix%" $NotificationTemplatePrefix.replace('''','''''')
			replaceTokensInFile ("InstallationFiles\DBScripts\PopulateDefaultSettingsItem-Temp.sql") "%SMTPServerName%" $SMTPServerName
			replaceTokensInFile ("InstallationFiles\DBScripts\PopulateDefaultSettingsItem-Temp.sql") "%SMTPServerPort%" $SMTPServerPort
			replaceTokensInFile ("InstallationFiles\DBScripts\PopulateDefaultSettingsItem-Temp.sql") "%SMTPEmailReturnAddress%" $SMTPEmailReturnAddress
			replaceTokensInFile ("InstallationFiles\DBScripts\PopulateDefaultSettingsItem-Temp.sql") "%SMSQLServer%" $SMSQLServer
			replaceTokensInFile ("InstallationFiles\DBScripts\PopulateDefaultSettingsItem-Temp.sql") "%CacheLanguageCodes%" $CacheLanguageCodes
			replaceTokensInFile ("InstallationFiles\DBScripts\PopulateDefaultSettingsItem-Temp.sql") "%SMDBName%" $SMDBName
			replaceTokensInFile ("InstallationFiles\DBScripts\PopulateDefaultSettingsItem-Temp.sql") "%AnalystsADGroup%" $AnalystsADGroup
			replaceTokensInFile ("InstallationFiles\DBScripts\PopulateDefaultSettingsItem-Temp.sql") "%AssetManagementADGroup%" $AssetManagementADGroup
			replaceTokensInFile ("InstallationFiles\DBScripts\PopulateDefaultSettingsItem-Temp.sql") "%KnowledgeManagerADGroup%" $KnowledgeManagerADGroup
			replaceTokensInFile ("InstallationFiles\DBScripts\PopulateDefaultSettingsItem-Temp.sql") "%ConfigItemClasses%" $ConfigItemClasses
			replaceTokensInFile ("InstallationFiles\DBScripts\PopulateDefaultSettingsItem-Temp.sql") "%EnableCiresonAnalytics%" $InstallAnalytic
			replaceTokensInFile ("InstallationFiles\DBScripts\PopulateDefaultSettingsItem-Temp.sql") "%DisableProductMetrics%" $DisableProductMetrics

			
			writeToLog "Attempting to Populate Default Settings items " + $ManagementDBName
			Invoke-Sqlcmd -InputFile "InstallationFiles\DBScripts\PopulateDefaultSettingsItem-Temp.sql" -ServerInstance $SQLServer -ErrorAction 'Stop' -Verbose -QueryTimeout 60 
			writeToLog "Done Populating Default Settings items " + $ManagementDBName + " on " + $SQLServer
        }catch [Exception]{
            $ex = $_.Exception.Message
            writeWarning("Failed to Populating Default Settings items " + $ManagementDBName + " on " + $SQLServer + " : " + $ex)
        }
    }
}


function updateDataRetentionDefaultSettings(){

    if($InstallWebsite -eq $true -And $InstallAnalytic -eq $true){
        try{
			writeToLog "Populating Data Retention Default Settings items."
			Copy-Item -Path "InstallationFiles\DBScripts\PopulateDefaultDataRetentionSettingsItem.sql" -Destination ("InstallationFiles\DBScripts\PopulateDefaultDataRetentionSettingsItem-Temp.sql") -force

			replaceTokensInFile ("InstallationFiles\DBScripts\PopulateDefaultDataRetentionSettingsItem-Temp.sql") "%AnalyticDBName%" $AnalyticDBName
			replaceTokensInFile ("InstallationFiles\DBScripts\PopulateDefaultDataRetentionSettingsItem-Temp.sql") "%WI_Incident%" $WI_Incident
			replaceTokensInFile ("InstallationFiles\DBScripts\PopulateDefaultDataRetentionSettingsItem-Temp.sql") "%WI_Problem%" $WI_Problem
			replaceTokensInFile ("InstallationFiles\DBScripts\PopulateDefaultDataRetentionSettingsItem-Temp.sql") "%WI_ServiceRequest%" $WI_ServiceRequest
			replaceTokensInFile ("InstallationFiles\DBScripts\PopulateDefaultDataRetentionSettingsItem-Temp.sql") "%WI_Change%" $WI_Change
			replaceTokensInFile ("InstallationFiles\DBScripts\PopulateDefaultDataRetentionSettingsItem-Temp.sql") "%WI_Release%" $WI_Release
			replaceTokensInFile ("InstallationFiles\DBScripts\PopulateDefaultDataRetentionSettingsItem-Temp.sql") "%WI_ReviewActivity%" $WI_ReviewActivity
			replaceTokensInFile ("InstallationFiles\DBScripts\PopulateDefaultDataRetentionSettingsItem-Temp.sql") "%WI_ManualActivity%" $WI_ManualActivity
			replaceTokensInFile ("InstallationFiles\DBScripts\PopulateDefaultDataRetentionSettingsItem-Temp.sql") "%WI_Relationship%" $WI_Relationship

			
			writeToLog "Attempting to Populating Data Retention Default Settings items " + $ManagementDBName
			Invoke-Sqlcmd -InputFile "InstallationFiles\DBScripts\PopulateDefaultDataRetentionSettingsItem-Temp.sql" -ServerInstance $SQLServer -ErrorAction 'Stop' -Verbose -QueryTimeout 60 
			writeToLog "Done Populating Data Retention Default Settings items " + $ManagementDBName + " on " + $SQLServer
        }catch [Exception]{
            $ex = $_.Exception.Message
            writeWarning("Failed to Populating Data Retention Default Settings items " + $ManagementDBName + " on " + $SQLServer + " : " + $ex)
        }
    }
}

function updateJobs(){
    try{
		writeToLog "Creating CiresonAnalytics Jobs"
		Copy-Item -Path "InstallationFiles\DBScripts\Delete_Old_SM_Entries.sql" -Destination ("InstallationFiles\DBScripts\Create_Delete_Old_SM_Entries-Temp.sql") -force

		$selectedDate = $AnalyticFrequencyStartDate;
		$AnalyticFrequencyStartDate = ([datetime]$selectedDate).ToString("yyyy-MM-dd").replace("-","")
		$AnalyticFrequencyStartTime = ([datetime]$selectedDate).ToString("hh:mm:ss").replace(":","")

		#the sql job analytic frequency numeric control has a max value of 100. Convert frequency value to hours so as not to exceed the limit
		if($AnalyticFrequency -gt 100){
			$AnalyticFrequency= [math]::Ceiling($AnalyticFrequency/60);
			$AnalyticFrequencyType = 8;
		}

		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Delete_Old_SM_Entries-Temp.sql") "%AnalyticDBName%" $AnalyticDBName
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Delete_Old_SM_Entries-Temp.sql") "%AnalyticFrequency%" $AnalyticFrequency
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Delete_Old_SM_Entries-Temp.sql") "%AnalyticFrequencyStartDate%" $AnalyticFrequencyStartDate
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Delete_Old_SM_Entries-Temp.sql") "%AnalyticFrequencyStartTime%" $AnalyticFrequencyStartTime
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Delete_Old_SM_Entries-Temp.sql") "%AnalyticFrequencyType%" $AnalyticFrequencyType
		
		
		Copy-Item -Path "InstallationFiles\DBScripts\Insert_New_Changes_Jobs.sql" -Destination ("InstallationFiles\DBScripts\Create_Insert_New_Changes_Jobs-Temp.sql") -force
		Copy-Item -Path "InstallationFiles\DBScripts\Insert_New_Incidents_Jobs.sql" -Destination ("InstallationFiles\DBScripts\Create_Insert_New_Incidents_Jobs-Temp.sql") -force
		Copy-Item -Path "InstallationFiles\DBScripts\Insert_New_Manual_Activities_Jobs.sql" -Destination ("InstallationFiles\DBScripts\Create_Insert_New_Manual_Activities_Jobs-Temp.sql") -force
		Copy-Item -Path "InstallationFiles\DBScripts\Insert_New_Problems_Jobs.sql" -Destination ("InstallationFiles\DBScripts\Create_Insert_New_Problems_Jobs-Temp.sql") -force
		Copy-Item -Path "InstallationFiles\DBScripts\Insert_New_Relationships_Jobs.sql" -Destination ("InstallationFiles\DBScripts\Create_Insert_New_Relationships_Jobs-Temp.sql") -force
		Copy-Item -Path "InstallationFiles\DBScripts\Insert_New_Releases_Jobs.sql" -Destination ("InstallationFiles\DBScripts\Create_Insert_New_Releases_Jobs-Temp.sql") -force
		Copy-Item -Path "InstallationFiles\DBScripts\Insert_New_Review_Activities_Jobs.sql" -Destination ("InstallationFiles\DBScripts\Create_Insert_New_Review_Activities_Jobs-Temp.sql") -force
		Copy-Item -Path "InstallationFiles\DBScripts\Insert_New_Service_Requests_Jobs.sql" -Destination ("InstallationFiles\DBScripts\Create_Insert_New_Service_Requests_Jobs-Temp.sql") -force
		Copy-Item -Path "InstallationFiles\DBScripts\Insert_New_DisplayString_Jobs.sql" -Destination ("InstallationFiles\DBScripts\Insert_New_DisplayString_Jobs-Temp.sql") -force

		
		Copy-Item -Path "InstallationFiles\DBScripts\Update_Existing_Changes_Jobs.sql" -Destination ("InstallationFiles\DBScripts\Update_Existing_Changes_Jobs-Temp.sql") -force
		Copy-Item -Path "InstallationFiles\DBScripts\Update_Existing_Incidents_Jobs.sql" -Destination ("InstallationFiles\DBScripts\Update_Existing_Incidents_Jobs-Temp.sql") -force
		Copy-Item -Path "InstallationFiles\DBScripts\Update_Existing_Manual_Activities_Jobs.sql" -Destination ("InstallationFiles\DBScripts\Update_Existing_Manual_Activities_Jobs-Temp.sql") -force
		Copy-Item -Path "InstallationFiles\DBScripts\Update_Existing_Problems_Jobs.sql" -Destination ("InstallationFiles\DBScripts\Update_Existing_Problems_Jobs-Temp.sql") -force
		Copy-Item -Path "InstallationFiles\DBScripts\Update_Existing_Relationships_Jobs.sql" -Destination ("InstallationFiles\DBScripts\Update_Existing_Relationships_Jobs-Temp.sql") -force
		Copy-Item -Path "InstallationFiles\DBScripts\Update_Existing_Releases_Jobs.sql" -Destination ("InstallationFiles\DBScripts\Update_Existing_Releases_Jobs-Temp.sql") -force
		Copy-Item -Path "InstallationFiles\DBScripts\Update_Existing_Review_Activities_Jobs.sql" -Destination ("InstallationFiles\DBScripts\Update_Existing_Review_Activities_Jobs-Temp.sql") -force
		Copy-Item -Path "InstallationFiles\DBScripts\Update_Existing_Service_Requests_Jobs.sql" -Destination ("InstallationFiles\DBScripts\Update_Existing_Service_Requests_Jobs-Temp.sql") -force
		Copy-Item -Path "InstallationFiles\DBScripts\Update_Existing_DisplayString_Jobs.sql" -Destination ("InstallationFiles\DBScripts\Update_Existing_DisplayString_Jobs-Temp.sql") -force


		#Insert jobs
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Changes_Jobs-Temp.sql") "%AnalyticDBName%" $AnalyticDBName
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Incidents_Jobs-Temp.sql") "%AnalyticDBName%" $AnalyticDBName
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Manual_Activities_Jobs-Temp.sql") "%AnalyticDBName%" $AnalyticDBName
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Problems_Jobs-Temp.sql") "%AnalyticDBName%" $AnalyticDBName
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Relationships_Jobs-Temp.sql") "%AnalyticDBName%" $AnalyticDBName
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Releases_Jobs-Temp.sql") "%AnalyticDBName%" $AnalyticDBName
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Review_Activities_Jobs-Temp.sql") "%AnalyticDBName%" $AnalyticDBName
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Service_Requests_Jobs-Temp.sql") "%AnalyticDBName%" $AnalyticDBName
		replaceTokensInFile ("InstallationFiles\DBScripts\Insert_New_DisplayString_Jobs-Temp.sql") "%AnalyticDBName%" $AnalyticDBName

		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Changes_Jobs-Temp.sql") "%ManagementDBName%" $ManagementDBName
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Incidents_Jobs-Temp.sql") "%ManagementDBName%" $ManagementDBName
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Manual_Activities_Jobs-Temp.sql") "%ManagementDBName%" $ManagementDBName
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Problems_Jobs-Temp.sql") "%ManagementDBName%" $ManagementDBName
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Relationships_Jobs-Temp.sql") "%ManagementDBName%" $ManagementDBName
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Releases_Jobs-Temp.sql") "%ManagementDBName%" $ManagementDBName
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Review_Activities_Jobs-Temp.sql") "%ManagementDBName%" $ManagementDBName
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Service_Requests_Jobs-Temp.sql") "%ManagementDBName%" $ManagementDBName
		replaceTokensInFile ("InstallationFiles\DBScripts\Insert_New_DisplayString_Jobs-Temp.sql") "%ManagementDBName%" $ManagementDBName

		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Changes_Jobs-Temp.sql") "%AnalyticFrequency%" $AnalyticFrequency
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Incidents_Jobs-Temp.sql") "%AnalyticFrequency%" $AnalyticFrequency
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Manual_Activities_Jobs-Temp.sql") "%AnalyticFrequency%" $AnalyticFrequency
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Problems_Jobs-Temp.sql") "%AnalyticFrequency%" $AnalyticFrequency
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Relationships_Jobs-Temp.sql") "%AnalyticFrequency%" $AnalyticFrequency
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Releases_Jobs-Temp.sql") "%AnalyticFrequency%" $AnalyticFrequency
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Review_Activities_Jobs-Temp.sql") "%AnalyticFrequency%" $AnalyticFrequency
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Service_Requests_Jobs-Temp.sql") "%AnalyticFrequency%" $AnalyticFrequency
		replaceTokensInFile ("InstallationFiles\DBScripts\Insert_New_DisplayString_Jobs-Temp.sql") "%AnalyticFrequency%" $AnalyticFrequency

		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Changes_Jobs-Temp.sql") "%AnalyticFrequencyStartDate%" $AnalyticFrequencyStartDate
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Incidents_Jobs-Temp.sql") "%AnalyticFrequencyStartDate%" $AnalyticFrequencyStartDate
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Manual_Activities_Jobs-Temp.sql") "%AnalyticFrequencyStartDate%" $AnalyticFrequencyStartDate
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Problems_Jobs-Temp.sql") "%AnalyticFrequencyStartDate%" $AnalyticFrequencyStartDate
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Relationships_Jobs-Temp.sql") "%AnalyticFrequencyStartDate%" $AnalyticFrequencyStartDate
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Releases_Jobs-Temp.sql") "%AnalyticFrequencyStartDate%" $AnalyticFrequencyStartDate
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Review_Activities_Jobs-Temp.sql") "%AnalyticFrequencyStartDate%" $AnalyticFrequencyStartDate
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Service_Requests_Jobs-Temp.sql") "%AnalyticFrequencyStartDate%" $AnalyticFrequencyStartDate
		replaceTokensInFile ("InstallationFiles\DBScripts\Insert_New_DisplayString_Jobs-Temp.sql") "%AnalyticFrequencyStartDate%" $AnalyticFrequencyStartDate

		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Changes_Jobs-Temp.sql") "%AnalyticFrequencyStartTime%" $AnalyticFrequencyStartTime
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Incidents_Jobs-Temp.sql") "%AnalyticFrequencyStartTime%" $AnalyticFrequencyStartTime
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Manual_Activities_Jobs-Temp.sql") "%AnalyticFrequencyStartTime%" $AnalyticFrequencyStartTime
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Problems_Jobs-Temp.sql") "%AnalyticFrequencyStartTime%" $AnalyticFrequencyStartTime
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Relationships_Jobs-Temp.sql") "%AnalyticFrequencyStartTime%" $AnalyticFrequencyStartTime
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Releases_Jobs-Temp.sql") "%AnalyticFrequencyStartTime%" $AnalyticFrequencyStartTime
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Review_Activities_Jobs-Temp.sql") "%AnalyticFrequencyStartTime%" $AnalyticFrequencyStartTime
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Service_Requests_Jobs-Temp.sql") "%AnalyticFrequencyStartTime%" $AnalyticFrequencyStartTime
		replaceTokensInFile ("InstallationFiles\DBScripts\Insert_New_DisplayString_Jobs-Temp.sql") "%AnalyticFrequencyStartTime%" $AnalyticFrequencyStartTime

		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Changes_Jobs-Temp.sql") "%AnalyticFrequencyType%" $AnalyticFrequencyType
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Incidents_Jobs-Temp.sql") "%AnalyticFrequencyType%" $AnalyticFrequencyType
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Manual_Activities_Jobs-Temp.sql") "%AnalyticFrequencyType%" $AnalyticFrequencyType
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Problems_Jobs-Temp.sql") "%AnalyticFrequencyType%" $AnalyticFrequencyType
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Relationships_Jobs-Temp.sql") "%AnalyticFrequencyType%" $AnalyticFrequencyType
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Releases_Jobs-Temp.sql") "%AnalyticFrequencyType%" $AnalyticFrequencyType
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Review_Activities_Jobs-Temp.sql") "%AnalyticFrequencyType%" $AnalyticFrequencyType
		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Service_Requests_Jobs-Temp.sql") "%AnalyticFrequencyType%" $AnalyticFrequencyType
		replaceTokensInFile ("InstallationFiles\DBScripts\Insert_New_DisplayString_Jobs-Temp.sql") "%AnalyticFrequencyType%" $AnalyticFrequencyType

		replaceTokensInFile ("InstallationFiles\DBScripts\Create_Insert_New_Relationships_Jobs-Temp.sql") "%SMDBName%" $SMDBName

		#Update jobs
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Changes_Jobs-Temp.sql") "%AnalyticDBName%" $AnalyticDBName
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Incidents_Jobs-Temp.sql") "%AnalyticDBName%" $AnalyticDBName
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Manual_Activities_Jobs-Temp.sql") "%AnalyticDBName%" $AnalyticDBName
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Problems_Jobs-Temp.sql") "%AnalyticDBName%" $AnalyticDBName
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Relationships_Jobs-Temp.sql") "%AnalyticDBName%" $AnalyticDBName
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Releases_Jobs-Temp.sql") "%AnalyticDBName%" $AnalyticDBName
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Review_Activities_Jobs-Temp.sql") "%AnalyticDBName%" $AnalyticDBName
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Service_Requests_Jobs-Temp.sql") "%AnalyticDBName%" $AnalyticDBName
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_DisplayString_Jobs-Temp.sql") "%AnalyticDBName%" $AnalyticDBName

		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Changes_Jobs-Temp.sql") "%ManagementDBName%" $ManagementDBName
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Incidents_Jobs-Temp.sql") "%ManagementDBName%" $ManagementDBName
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Manual_Activities_Jobs-Temp.sql") "%ManagementDBName%" $ManagementDBName
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Problems_Jobs-Temp.sql") "%ManagementDBName%" $ManagementDBName
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Relationships_Jobs-Temp.sql") "%ManagementDBName%" $ManagementDBName
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Releases_Jobs-Temp.sql") "%ManagementDBName%" $ManagementDBName
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Review_Activities_Jobs-Temp.sql") "%ManagementDBName%" $ManagementDBName
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Service_Requests_Jobs-Temp.sql") "%ManagementDBName%" $ManagementDBName
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_DisplayString_Jobs-Temp.sql") "%ManagementDBName%" $ManagementDBName

		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Changes_Jobs-Temp.sql") "%AnalyticFrequency%" $AnalyticFrequency
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Incidents_Jobs-Temp.sql") "%AnalyticFrequency%" $AnalyticFrequency
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Manual_Activities_Jobs-Temp.sql") "%AnalyticFrequency%" $AnalyticFrequency
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Problems_Jobs-Temp.sql") "%AnalyticFrequency%" $AnalyticFrequency
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Relationships_Jobs-Temp.sql") "%AnalyticFrequency%" $AnalyticFrequency
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Releases_Jobs-Temp.sql") "%AnalyticFrequency%" $AnalyticFrequency
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Review_Activities_Jobs-Temp.sql") "%AnalyticFrequency%" $AnalyticFrequency
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Service_Requests_Jobs-Temp.sql") "%AnalyticFrequency%" $AnalyticFrequency
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_DisplayString_Jobs-Temp.sql") "%AnalyticFrequency%" $AnalyticFrequency

		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Changes_Jobs-Temp.sql") "%AnalyticFrequencyStartDate%" $AnalyticFrequencyStartDate
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Incidents_Jobs-Temp.sql") "%AnalyticFrequencyStartDate%" $AnalyticFrequencyStartDate
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Manual_Activities_Jobs-Temp.sql") "%AnalyticFrequencyStartDate%" $AnalyticFrequencyStartDate
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Problems_Jobs-Temp.sql") "%AnalyticFrequencyStartDate%" $AnalyticFrequencyStartDate
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Relationships_Jobs-Temp.sql") "%AnalyticFrequencyStartDate%" $AnalyticFrequencyStartDate
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Releases_Jobs-Temp.sql") "%AnalyticFrequencyStartDate%" $AnalyticFrequencyStartDate
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Review_Activities_Jobs-Temp.sql") "%AnalyticFrequencyStartDate%" $AnalyticFrequencyStartDate
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Service_Requests_Jobs-Temp.sql") "%AnalyticFrequencyStartDate%" $AnalyticFrequencyStartDate
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_DisplayString_Jobs-Temp.sql") "%AnalyticFrequencyStartDate%" $AnalyticFrequencyStartDate

		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Changes_Jobs-Temp.sql") "%AnalyticFrequencyStartTime%" $AnalyticFrequencyStartTime
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Incidents_Jobs-Temp.sql") "%AnalyticFrequencyStartTime%" $AnalyticFrequencyStartTime
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Manual_Activities_Jobs-Temp.sql") "%AnalyticFrequencyStartTime%" $AnalyticFrequencyStartTime
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Problems_Jobs-Temp.sql") "%AnalyticFrequencyStartTime%" $AnalyticFrequencyStartTime
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Relationships_Jobs-Temp.sql") "%AnalyticFrequencyStartTime%" $AnalyticFrequencyStartTime
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Releases_Jobs-Temp.sql") "%AnalyticFrequencyStartTime%" $AnalyticFrequencyStartTime
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Review_Activities_Jobs-Temp.sql") "%AnalyticFrequencyStartTime%" $AnalyticFrequencyStartTime
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Service_Requests_Jobs-Temp.sql") "%AnalyticFrequencyStartTime%" $AnalyticFrequencyStartTime
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_DisplayString_Jobs-Temp.sql") "%AnalyticFrequencyStartTime%" $AnalyticFrequencyStartTime

		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Changes_Jobs-Temp.sql") "%AnalyticFrequencyType%" $AnalyticFrequencyType
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Incidents_Jobs-Temp.sql") "%AnalyticFrequencyType%" $AnalyticFrequencyType
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Manual_Activities_Jobs-Temp.sql") "%AnalyticFrequencyType%" $AnalyticFrequencyType
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Problems_Jobs-Temp.sql") "%AnalyticFrequencyType%" $AnalyticFrequencyType
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Relationships_Jobs-Temp.sql") "%AnalyticFrequencyType%" $AnalyticFrequencyType
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Releases_Jobs-Temp.sql") "%AnalyticFrequencyType%" $AnalyticFrequencyType
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Review_Activities_Jobs-Temp.sql") "%AnalyticFrequencyType%" $AnalyticFrequencyType
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Service_Requests_Jobs-Temp.sql") "%AnalyticFrequencyType%" $AnalyticFrequencyType
		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_DisplayString_Jobs-Temp.sql") "%AnalyticFrequencyType%" $AnalyticFrequencyType

		replaceTokensInFile ("InstallationFiles\DBScripts\Update_Existing_Relationships_Jobs-Temp.sql") "%SMDBName%" $SMDBName

			
		writeToLog "Attempting to Create CiresonAnalytics Jobs " + $AnalyticDBName
		Invoke-Sqlcmd -InputFile "InstallationFiles\DBScripts\Create_Delete_Old_SM_Entries-Temp.sql" -ServerInstance $SQLServer -ErrorAction 'Stop' -Verbose -QueryTimeout 60 
		#Invoke-Sqlcmd -InputFile "InstallationFiles\DBScripts\Create_SM_Insert_Jobs-Temp.sql" -ServerInstance $SQLServer -ErrorAction 'Stop' -Verbose -QueryTimeout 60 
		#Invoke-Sqlcmd -InputFile "InstallationFiles\DBScripts\Create_SM_Update_Jobs-Temp.sql" -ServerInstance $SQLServer -ErrorAction 'Stop' -Verbose -QueryTimeout 60 


		#insert jobs
		Invoke-Sqlcmd -InputFile "InstallationFiles\DBScripts\Create_Insert_New_Changes_Jobs-Temp.sql" -ServerInstance $SQLServer -ErrorAction 'Stop' -Verbose -QueryTimeout 60 
		Invoke-Sqlcmd -InputFile "InstallationFiles\DBScripts\Create_Insert_New_Incidents_Jobs-Temp.sql" -ServerInstance $SQLServer -ErrorAction 'Stop' -Verbose -QueryTimeout 60 
		Invoke-Sqlcmd -InputFile "InstallationFiles\DBScripts\Create_Insert_New_Problems_Jobs-Temp.sql" -ServerInstance $SQLServer -ErrorAction 'Stop' -Verbose -QueryTimeout 60 
		Invoke-Sqlcmd -InputFile "InstallationFiles\DBScripts\Create_Insert_New_Releases_Jobs-Temp.sql" -ServerInstance $SQLServer -ErrorAction 'Stop' -Verbose -QueryTimeout 60 
		Invoke-Sqlcmd -InputFile "InstallationFiles\DBScripts\Create_Insert_New_Service_Requests_Jobs-Temp.sql" -ServerInstance $SQLServer -ErrorAction 'Stop' -Verbose -QueryTimeout 60 
		Invoke-Sqlcmd -InputFile "InstallationFiles\DBScripts\Create_Insert_New_Manual_Activities_Jobs-Temp.sql" -ServerInstance $SQLServer -ErrorAction 'Stop' -Verbose -QueryTimeout 60 
		Invoke-Sqlcmd -InputFile "InstallationFiles\DBScripts\Create_Insert_New_Review_Activities_Jobs-Temp.sql" -ServerInstance $SQLServer -ErrorAction 'Stop' -Verbose -QueryTimeout 60 
		Invoke-Sqlcmd -InputFile "InstallationFiles\DBScripts\Create_Insert_New_Relationships_Jobs-Temp.sql" -ServerInstance $SQLServer -ErrorAction 'Stop' -Verbose -QueryTimeout 60 
		Invoke-Sqlcmd -InputFile "InstallationFiles\DBScripts\Insert_New_DisplayString_Jobs-Temp.sql" -ServerInstance $SQLServer -ErrorAction 'Stop' -Verbose -QueryTimeout 60 

		#update jobs
		Invoke-Sqlcmd -InputFile "InstallationFiles\DBScripts\Update_Existing_Changes_Jobs-Temp.sql" -ServerInstance $SQLServer -ErrorAction 'Stop' -Verbose -QueryTimeout 60 
		Invoke-Sqlcmd -InputFile "InstallationFiles\DBScripts\Update_Existing_Incidents_Jobs-Temp.sql" -ServerInstance $SQLServer -ErrorAction 'Stop' -Verbose -QueryTimeout 60 
		Invoke-Sqlcmd -InputFile "InstallationFiles\DBScripts\Update_Existing_Problems_Jobs-Temp.sql" -ServerInstance $SQLServer -ErrorAction 'Stop' -Verbose -QueryTimeout 60 
		Invoke-Sqlcmd -InputFile "InstallationFiles\DBScripts\Update_Existing_Service_Requests_Jobs-Temp.sql" -ServerInstance $SQLServer -ErrorAction 'Stop' -Verbose -QueryTimeout 60 
		Invoke-Sqlcmd -InputFile "InstallationFiles\DBScripts\Update_Existing_Releases_Jobs-Temp.sql" -ServerInstance $SQLServer -ErrorAction 'Stop' -Verbose -QueryTimeout 60 
		Invoke-Sqlcmd -InputFile "InstallationFiles\DBScripts\Update_Existing_Manual_Activities_Jobs-Temp.sql" -ServerInstance $SQLServer -ErrorAction 'Stop' -Verbose -QueryTimeout 60 
		Invoke-Sqlcmd -InputFile "InstallationFiles\DBScripts\Update_Existing_Review_Activities_Jobs-Temp.sql" -ServerInstance $SQLServer -ErrorAction 'Stop' -Verbose -QueryTimeout 60 
		Invoke-Sqlcmd -InputFile "InstallationFiles\DBScripts\Update_Existing_Relationships_Jobs-Temp.sql" -ServerInstance $SQLServer -ErrorAction 'Stop' -Verbose -QueryTimeout 60 
		Invoke-Sqlcmd -InputFile "InstallationFiles\DBScripts\Update_Existing_DisplayString_Jobs-Temp.sql" -ServerInstance $SQLServer -ErrorAction 'Stop' -Verbose -QueryTimeout 60 

		writeToLog "Done Creating CiresonAnalytics Jobs " + $AnalyticDBName + " on " + $SQLServer
    }catch [Exception]{
        $ex = $_.Exception.Message
        writeError("Failed to Create CiresonAnalytics Jobs " + $AnalyticDBName + " on " + $SQLServer + " : " + $ex)
    }
}

function updateDefaultDataSourceConfiguration(){
	try{
		writeToLog "Populate Default Datasource Configuration items."

		Copy-Item -Path "InstallationFiles\DBScripts\PopulateDefaultDataSourceConfiguration.sql" -Destination ("InstallationFiles\DBScripts\PopulateDefaultDataSourceConfiguration-Temp.sql") -force

		$AnalyticsConnectionString =[String]::Format("Server={0};Database={1};Trusted_Connection=True;", $SQLServer, $AnalyticDBName) #"Server="+$SQLServer+";Database="+$AnalyticDBName+";Trusted_Connection=True;"
		$ServiceManagementConnectionString =[String]::Format("Server={0};Database={1};Trusted_Connection=True;", $SQLServer, $ManagementDBName)
		$ServiceManagerConnectionString =[String]::Format("Server={0};Database={1};Trusted_Connection=True;", $SMSQLServer, $SMDBName)

		$EncryptedAnalyticsConnectionString = encryptString $AnalyticsConnectionString "CiresonAnalytics"
		$EncryptedServiceManagementConnectionString = encryptString $ServiceManagementConnectionString "ServiceManagement"
		$EncryptedServiceManagerConnectionString = encryptString $ServiceManagerConnectionString "ServiceManager"

		replaceTokensInFile ("InstallationFiles\DBScripts\PopulateDefaultDataSourceConfiguration-Temp.sql") "%ManagementDBName%" $ManagementDBName
		replaceTokensInFile ("InstallationFiles\DBScripts\PopulateDefaultDataSourceConfiguration-Temp.sql") "%EncryptedServiceManagerConnectionString%" $EncryptedServiceManagerConnectionString
		replaceTokensInFile ("InstallationFiles\DBScripts\PopulateDefaultDataSourceConfiguration-Temp.sql") "%EncryptedServiceManagementConnectionString%" $EncryptedServiceManagementConnectionString
		replaceTokensInFile ("InstallationFiles\DBScripts\PopulateDefaultDataSourceConfiguration-Temp.sql") "%EncrpyptedAnalyticsDBConnection%" $EncryptedAnalyticsConnectionString
		replaceTokensInFile ("InstallationFiles\DBScripts\PopulateDefaultDataSourceConfiguration-Temp.sql") "%EnableCiresonAnalytics%" $InstallAnalytic

			
		writeToLog "Attempting to Populate Default Datasource Configuration items " + $ManagementDBName
		Invoke-Sqlcmd -InputFile "InstallationFiles\DBScripts\PopulateDefaultDataSourceConfiguration-Temp.sql" -ServerInstance $SQLServer -ErrorAction 'Stop' -Verbose -QueryTimeout 60 
		writeToLog "Done Populating Default Datasource Configuration items " + $ManagementDBName + " on " + $SQLServer
    }catch [Exception]{
        $ex = $_.Exception.Message
        writeWarning("Failed to Populating Default Datasource Configuration items " + $ManagementDBName + " on " + $SQLServer + " : " + $ex)
    }
}

function encryptString($stringToEncrypt, $passPhrase)
{
	$plainTextBytes = [Text.Encoding]::UTF8.GetBytes($stringToEncrypt)
		
	$rm = getEncryptionKey $passPhrase
	
	$c = $rm.CreateEncryptor();

	$ms = new-Object IO.MemoryStream
	
	$cs = new-Object Security.Cryptography.CryptoStream $ms,$c,"Write"	
    $cs.Write($plainTextBytes, 0, $plainTextBytes.Length);
    $cs.FlushFinalBlock();
    
    [byte[]]$cipherTextBytes = $ms.ToArray();  
	
	$cs.Close()
	
	$ms.Close()
	
	$rm.Clear()
	
	[byte[]]$rmesult = $ms.ToArray()
	
	# Converts the array from Base 64 to a string and returns
	return [Convert]::ToBase64String($rmesult)
}

function getEncryptionKey($passPhrase)
{
	$keyIterations = 10000;
	[byte[]]$saltBytes =  13, 12, 11, 99, 98, 97, 1, 2, 3, 51, 52, 53 

    #Key generation
    $pwdGen = new-Object Security.Cryptography.Rfc2898DeriveBytes $passPhrase, $saltBytes, $keyIterations

    $rm = new-Object System.Security.Cryptography.RijndaelManaged;
    $rm.BlockSize = 256; #Increased it to 256 bits- max and more secure

    $key = $pwdGen.GetBytes($rm.KeySize / 8);   #This will generate a 256 bits key
    $iv = $pwdGen.GetBytes($rm.BlockSize / 8);  #This will generate a 256 bits IV

    $rm.Key = $key;
    $rm.IV = $iv;

    return $rm;
}

function installWindowsService(){
    if($RunCacheBuilderAsService -eq $true)
    {
		try
		{
			writeToLog "Installing CacheBuilder Service"
			$cmd=""
			if($InstallCacheBuilderDisabled -eq $true){
				$cmd = ('& "{0}" -installDisabled "{1}" "{2}"' -f ($SiteRootPath + $SiteName + "\bin\Cireson.CacheBuilder.WindowsService.exe"), $CacheServiceUserName, $CacheServicePassword)
			}
			else
			{
				$cmd = ('& "{0}" -install "{1}" "{2}"' -f ($SiteRootPath + $SiteName + "\bin\Cireson.CacheBuilder.WindowsService.exe"), $CacheServiceUserName, $CacheServicePassword)
			}
			Invoke-Expression $cmd | Write-Output
			writeToLog "CacheBuilder Service Installed successfully."
			
		}catch [Exception]{
			$ex = $_.Exception.Message
			writeWarning ("Failed to install windows service: " + $ex)
		}
		#Create Event Sources.
		$evtSources = @("CacheBuilder", "WebAPI", "WebPortal")
		foreach($evtSource in $evtSources)
        {
			try{
				[System.Diagnostics.EventLog]::CreateEventSource($evtSource, "Application")
			}catch [Exception]{
				$ex = $_.Exception.Message
				if ($ex -notlike '*already exists*') {
					writeToLog ("Failed to add windows service event sources: " + $ex)
				}
			}
		}
		
    }
}

function uninstallWindowsService(){
    try{
        "Uninstalling windows service"
        $cmd = ('& "{0}" -uninstall' -f($SiteRootPath + $SiteName + "\bin\Cireson.CacheBuilder.WindowsService.exe"))
        $cmd
        Invoke-Expression $cmd | Write-Output
    }catch [Exception]{
        $ex = $_.Exception.Message
        #writeWarning ("Failed to uninstall windows service: " + $ex)
    }
}

function installPlatform() {
	$platformInstallPath = $SiteRootPath + $SiteName + "\Platform"
	installPlatformHostBinaries -sourceFolder "InstallationFiles\Platform" -destinationFolder $platformInstallPath

	importExtensions

	#Install service
	installPlatformWindowsService
}

function installPlatformHostBinaries($sourceFolder, $destinationFolder){
    writeToLog "Extracting platform binaries"
	[System.Reflection.Assembly]::LoadWithPartialName("System.IO.Compression.FileSystem")
	#Grab the highest version platform host
	$sourcePkgs = @(Get-ChildItem $sourceFolder -Filter *.nupkg | Sort -Descending | Select-Object -First 1) 
	If((Test-Path $destinationFolder) -eq $true) { Remove-Item -Path "$destinationFolder\*" -Recurse -Force }
	New-Item -ItemType Directory -Force -Path $destinationFolder
    foreach($nupkg in $sourcePkgs){
		$path = $nupkg.FullName 
		$tempPath = "$env:Temp\cireson.platform.host.binaries"
		if((Test-Path $tempPath) -eq $true) { Remove-Item -Path "$tempPath\*" -Recurse -Force }
		[System.IO.Compression.ZipFile]::ExtractToDirectory("$path", "$tempPath") 
		[System.IO.Compression.ZipFile]::ExtractToDirectory("$tempPath\content\PlatformRuntime\Cireson.Platform.Host.zip", "$destinationFolder") 		
    }
    writeToLog "Done Extracting platform binaries"
}

function importExtensions(){
	#This should copy all cpex items from the InstallableCpex folder into $programDataPath\InstallableCpex folder so they can be processed by the service when it initially starts.
	writeToLog ("Copying Cpex files to $programDataPath\InstallableCpex")
	new-item -ItemType Directory -Force -Path "$programDataPath\InstallableCpex" | Write-Output
	copy-item "InstallableCpex\*.nupkg" "$programDataPath\InstallableCpex" | Write-Output
}

function installPlatformWindowsService(){
    try {
		writeToLog "Installing Platform Cache Service"
		$serviceConfigPath = $SiteRootPath + $SiteName + "\Platform\Platform_Cache.config"
		
		#Setup https if a cert is specified
		if($SSLCertificateName -ne "") {
			$SslThumbprint = (Get-ChildItem -Path Cert:\LocalMachine\My | Where-Object {$_.FriendlyName -match "$SSLCertificateName"} | Select Thumbprint -First 1).Thumbprint
			$cmd = ('& "{0}" -u="http://*:{5}/Platform" -me="PlatformCache" -u="https://*:{6}/Platform" -ssl="{7}" -worker -install -sn="Platform_Cache" -sdn="Platform Cache" -sd="Cireson service that syncs data into the cache database." -usr="{1}" -pwd="{2}" -c="Data Source={3};Initial Catalog={4};Integrated Security=True;Connect Timeout=15;Encrypt=False;TrustServerCertificate=False;Trusted_Connection=True"' -f ($SiteRootPath + $SiteName + "\Platform\Cireson.Platform.Host.exe"), $PortalUser, $PortalPassword, $SQLServer, $ManagementDBName, $SitePort, $HttpsListenerPort, $SslThumbprint)
			Invoke-Expression $cmd
		} else {
			$cmd = ('& "{0}" -u="http://*:{5}/Platform" -me="PlatformCache" -worker -install -sn="Platform_Cache" -sdn="Platform Cache" -sd="Cireson service that syncs data into the cache database." -usr="{1}" -pwd="{2}" -c="Data Source={3};Initial Catalog={4};Integrated Security=True;Connect Timeout=15;Encrypt=False;TrustServerCertificate=False;Trusted_Connection=True"' -f ($SiteRootPath + $SiteName + "\Platform\Cireson.Platform.Host.exe"), $PortalUser, $PortalPassword, $SQLServer, $ManagementDBName, $SitePort)
			Invoke-Expression $cmd
		}

		if($restoreUrls -eq $true){
			$currentServiceConfig = (Get-Content $serviceConfigPath | ConvertFrom-Json)
			$currentServiceConfig.Urls = $global:originalServiceConfig.Urls
			Set-Content $serviceConfigPath -Value (ConvertTo-Json $currentServiceConfig)
		}
		
		writeToLog "Platform Cache Service Installed successfully."
	} catch [Exception] {
		$ex = $_.Exception.Message
		writeError ("Failed to install windows service: " + $ex)
	}

	#Wait for Platform to become ready
	$success = $FALSE
	$counter = 0;

	#Retry for 5 minutes
	while ($counter -lt 30)
	{
		$counter++

		try {
			$req = [System.Net.WebRequest]::Create("http://localhost:$SitePort/Platform/api")
			$req.Method ="GET"
			$req.ContentLength = 0
			$resp = $req.GetResponse()
			$reader = new-object System.IO.StreamReader($resp.GetResponseStream())
			$reader.ReadToEnd()
			$success = $TRUE
			writeToLog "Platform initialized successfully."
			break
		} catch [Exception] {
			$success = $FALSE
			writeToLog "Platform not ready yet, please wait..."
		}

		#Sleep for 10 seconds before retrying
		Start-Sleep -s 10
	}

	if ($success -eq $FALSE)
	{
		writeWarning ("Unable to initialize Platform")
	}

	#Create Event Sources.
	try {
		[System.Diagnostics.EventLog]::CreateEventSource("Platform_Cache", "Application")
	} catch [Exception] {
		$ex = $_.Exception.Message
		if ($ex -notlike '*already exists*') {
			writeToLog ("Failed to add windows service event sources: " + $ex)
		}
	}
}

function uninstallPlatformWindowsService(){
    try {
		#if there is already a config in there, grab the json so we can use it later on to restore the urls.
		$restoreUrls = $false
		$serviceConfigPath = $SiteRootPath + $SiteName + "\Platform\Platform_Cache.config"
		if(Test-Path $serviceConfigPath){
			$restoreUrls = $true
			$global:originalServiceConfig = (Get-Content $serviceConfigPath | ConvertFrom-Json)
		}
		
        writeToLog "Uninstalling Platform Cache windows service"
        $cmd = ('& "{0}" -uninstall -sn="Platform_Cache"' -f($SiteRootPath + $SiteName + "\Platform\Cireson.Platform.Host.exe"))
        $cmd
        Invoke-Expression $cmd | Write-Output
    } catch [Exception] {
        $ex = $_.Exception.Message
        writeToLog ("Failed to uninstall windows service: " + $ex)
    }
}

function deployLatestDacPac(){
    if($ExecuteDac -eq $true){
        $dacPacFiles = @(Get-ChildItem "InstallationFiles\DacPac" -Filter *.dacPac)

        foreach($dacPac in $dacPacFiles)
        {
            WriteToLog ("Installing " + $dacPac.FullName)
            deployDacPac $dacPac.FullName
        }
    }
}



function deployDacPac($dacPacPath){
    try{

		$tempDBName = ""
		if ($dacPacPath -like '*ServiceManagement.dacpac*')
		{
			$tempDBName = $ManagementDBName
		}
		else
		{
			if ($InstallAnalytic -eq $true)
			{
				$tempDBName = $AnalyticDBName
			}
			else
			{
				return
			}
		}

        writeToLog "Deploying DacPac"
        # Create a DacServices object, which needs a connection string 
		$connectionString = "server=" + $SQLServer + ";Trusted_Connection=True;"
        $dacsvcs = new-object Microsoft.SqlServer.Dac.DacServices $connectionString
		$dacoptions = new-object Microsoft.SqlServer.Dac.DacDeployOptions
		$dacoptions.TreatVerificationErrorsAsWarnings=$true
		$dacoptions.BlockOnPossibleDataLoss=$false
		$dacoptions.BlockWhenDriftDetected=$false
		$dacoptions.DeployDatabaseInSingleUserMode=$false
		$dacoptions.DropPermissionsNotInSource=$false
		$dacoptions.DropRoleMembersNotInSource=$false
 
        # register event. For info on this cmdlet, see http://technet.microsoft.com/en-us/library/hh849929.aspx 
        register-objectevent -in $dacsvcs -eventname Message -source "msg" -action { writeToLog ("DacPac" + $Event.SourceArgs[1].Message.Message) } | Out-Null
 
		
    
        # Load dacpac from file & deploy database
        $dp = [Microsoft.SqlServer.Dac.DacPackage]::Load($dacPacPath) 
        $dacsvcs.Deploy($dp, $tempDBName, $true, $dacoptions) 
 
        # clean up event 
        unregister-event -source "msg" 
        writeToLog "Done Deploying DacPac"
    }catch [Exception]{
        $ex = $_.Exception.Message
		$exInner = ""
		$exInner2 = ""
        if($_.Exception.InnerException.Message -ne $null){
            $exInner = $_.Exception.InnerException.Message
        };
		if($_.Exception.InnerException.InnerException.Message -ne $null){
            $exInner2 = $_.Exception.InnerException.Message
        };
        writeError ("Failed to Deploy DacPac via DacServices API: " + $connectionString + " " + $ex + " " + $exInner + " " + $exInner2)
    }
}

function deployMPB(){
    if($InstallManagementPacks -eq $true){
        try{
        #if InstallManagementPacks is set to true, then import the smlet module, if the module does not exist, then disable $InstallManagementPacks
            Add-Type  -path ($SiteRootPath + $SiteName + "\bin\Microsoft.EnterpriseManagement.Core.dll")
            Add-Type  -path ($SiteRootPath + $SiteName + "\bin\Microsoft.EnterpriseManagement.Packaging.dll")
            Import-Module SMLets
            writeToLog "SMLets Module successfully imported"
            $mpbFiles = @(Get-ChildItem "InstallationFiles\ManagementPacks" -Filter *.mpb)

            foreach($mpb in $mpbFiles)
            {
                WriteToLog ("Installing " + $mpb.Name)
                try{
                Import-SCManagementPack -FullName $mpb.FullName -ComputerName $ManagementServer
				}catch [Exception]{
					$ex = $_.Exception.Message
					$exInner = ""
					if($_.Exception.InnerException.Message -ne $null){
					   $exInner = $_.Exception.InnerException.Message
					};
					if($exInner -like "*already imported*")
					{
						writeToLog ("Management Pack " + $mpb.Name + " already installed.")
					}
					else
					{
						#If the mpb install failed, check that the user is an administrator on SCSM 
						try{
							if((Get-SCSMSession).Security.IsUserAdministrator()){
								writeWarning ("Failed to Install Management Pack " + $mpb.Name + ": " + $ex + " " + $exInner)
							}
							else
							{
								writeWarning ("Failed to Install Management Pack " + $mpb.Name)
								writeWarning ("Please verify the current user is an SCSM Administrator and rerun setup, or install the management packs manually")
							}
						}catch{
							writeWarning ("Failed to Install Management Pack " + $mpb.Name)
							writeWarning ("Please verify the current user is an SCSM Administrator and rerun setup, or install the management packs manually")
						}
					}
				}
            }
        }catch [Exception]{
            $ex = $_.Exception.Message
            $exInner = ""
            if($_.Exception.InnerException.Message -ne $null){
               $exInner = $_.Exception.InnerException.Message
            };
            writeError ("Failed to Install Management Packs: " + $ex + " " + $exInner)
        }        

    }
}

function copySCSMBinaries(){
    writeToLog "Attempting to Copying SCSM SDK Binary files"

    if($ManagementServer -eq "localhost"){
        return #Don't need this if the portal is installed to the localhost.
    }
    try
    {
        #Check if the system center setup key exists, if not add it and point it to the site bin\sdk Binaries directory
        if((Test-Path "HKLM:\software\Microsoft\System Center\2010\Service Manager\Setup") -eq $false)
        {
            writeToLog ("Creating System Center Reg Keys")
            CreateRegistryKeys "HKLM" "software" "microsoft" "System Center" "2010" "Service Manager" "Setup"
            New-ItemProperty -Path "HKLM:\software\Microsoft\System Center\2010\Service Manager\Setup" -Name "InstallDirectory" -Value ($SiteRootPath + $SiteName + "\bin") 
            $from = ($ManagementServerBinaryPath + "*")
			$to = ($SiteRootPath + $SiteName + "\bin\")
			"Remote Path exists: "
			Test-Path -Path $from

			writeToLog ("Copying SDK files from: " + $from + " To: " + $to)
			md ($to + "SDK Binaries")
			Copy-Item -Path $from -Destination ($to + "SDK Binaries")
			Copy-Item -Path $from -Destination $to
        
			writeToLog "Done copying SCSM SDK Binaries."
        }else{
			writeToLog "SCSM SDK Binaries found locally, skipping copy."
		}
    }
     catch [Exception]
     {
        $ex = $_.Exception.Message
        writeWarning ("Failed to copy SCSM SDK Binaries: " + $ex)
        
     }
}

function CreateRegistryKey([string] $keyPath)
{   
    if ( -not (Test-Path $keyPath) )
    {
        New-Item -Path "$keyPath";
        writeToLog "The Key [$keyPath] is created.";
    }
    else
    {
        writeToLog "The Key [$keyPath] already exists.";
    }
}

function CreateRegistryKeys([string] $rootKey)
{
    [string] $keyPath = [String]::Format("{0}:", $rootKey);
    
    foreach($keyName in $args)
    {
        [string] $keyPath = [String]::Format("{0}\{1}", $keyPath, $keyName);
        CreateRegistryKey $keyPath;
    }
}

function backupParametersXmlFile(){
    #we need to replace a token in the web deploy parameter file before deploying it, but we don't
    #want to overwrite the original in case the user executes it again with a different site name.
    #So we'll save the original on the first run, and copy it in subsequent runs.
    if((Test-Path -Path "website\CiresonPortal.SetParameters.xml.config") -ne $true)
    {
        writeToLog ("Creating base config")
        Copy-Item -Path "website\CiresonPortal.SetParameters.xml" -Destination "website\CiresonPortal.SetParameters.xml.config"
    }

    Copy-Item -Path "website\CiresonPortal.SetParameters.xml.config" -Destination "website\CiresonPortal.SetParameters.xml"

}
function restoreParametersXmlFile(){
    #we need to replace a token in the web deploy parameter file before deploying it, but we don't
    #want to overwrite the original in case the user executes it again with a different site name.
    #So we'll save the original on the first run, and copy it in subsequent runs.
    if((Test-Path -Path "website\CiresonPortal.SetParameters.xml.config") -eq $true)
    {
        writeToLog ("Restoring base config")
        Copy-Item -Path "website\CiresonPortal.SetParameters.xml.config" -Destination "website\CiresonPortal.SetParameters.xml"
    }
}

function writeInstallDate(){
	$installDate = Get-Date -format d
	$installDateEncrypted = encryptString $installDate "PortalInstalLDate"
	writeToLog($installDate)
	writeToLog($installDateEncrypted)
	$filePath = ($SiteRootPath + $SiteName + "\install.dat")
	Add-Content $filePath $installDateEncrypted
}

function createCustomSpaceSubFolder(){
	mkdir -Force "$SiteRootPath\CiresonPortal\CustomSpace\Administrator"
	mkdir -Force "$SiteRootPath\CiresonPortal\CustomSpace\AssetManagement"
	mkdir -Force "$SiteRootPath\CiresonPortal\CustomSpace\ConfigItem"
	mkdir -Force "$SiteRootPath\CiresonPortal\CustomSpace\WorkItem"
}





#Check EULA
if($AcceptEULA -eq $false){
    #$eulaText = Get-Content -Path "eula/eula.rtf"
    writeWarning "You must accept the End User License Agreement to install this product."
    #writeWarning $eulaText
	Invoke-Expression "start InstallationFiles\eula\eula.rtf" 
    return
}

#Begin Installation Procecedures
writeProgress(1);
"Preparing to install, please wait..."

#Uninstall the windows service first so it does not interfere with the install. if it's installed.
uninstallWindowsService
uninstallPlatformWindowsService

#Enable required windows features.
#installRequiredWindowsFeatures
writeProgress(15)
#installRequiredPrereqs
writeProgress(25)


#if CreateManagementDB is set to true, then import the sqlps module, if the module does not exist, then disable $CreateManagementDB
#if($CreateManagementDB -eq $true)
#{
try{
    Push-Location
	writeToLog "Preparing SQL Connection."
    Import-Module "sqlps" -DisableNameChecking
    Pop-Location #Need this to get out of the SQLProvider drive.
    writeToLog "sqlps - enabled."
}catch{
    $CreateManagementDB = $false
    writeToLog "Could not load sqlps powerscript tools. Please install PowerShellTools.MSI" 
}
#}
writeProgress(35);

#if ExecuteDac is set to true, then import the DacFx types, if the module does not exist, then disable $ExecuteDac
if($ExecuteDac -eq $true){
    try{
		#check if the version is 2017 to use the latest version
        $sqlVersion = Invoke-Sqlcmd -Query "SELECT @@VERSION;" -ServerInstance $SQLServer -QueryTimeout 3
        if ($sqlVersion[0].ToString() -like '*SQL Server 2017*'){
            #The 130 version for 2017 support
            $DacFxSDKPath130 = (${env:ProgramFiles(x86)} + "\Microsoft SQL Server\140\DAC\bin\Microsoft.SqlServer.Dac.dll")
        }
        else
        {
            #The 130 version for 2016 support
		    $DacFxSDKPath130 = (${env:ProgramFiles} + "\Microsoft SQL Server\130\DAC\bin\Microsoft.SqlServer.Dac.dll")
        }

		writeToLog "Loading DACfx : $DacFxSDKPath130"
        Add-Type -Path $DacFxSDKPath130
        writeToLog "DacFx types successfully added."
    }catch [Exception]{
        $ExecuteDac = $false
		$ex = $_.Exception.Message
            $exInner = ""
            if($_.Exception.InnerException.Message -ne $null){
               $exInner = $_.Exception.InnerException.Message
            };
        writeWarning "Could not load DacFx powerscript tools. Please install DacFramework.MSI: $ex $exInner"  
    }
}
writeProgress(40);

if($InstallWebsite -eq $true){
	
	writeToLog ("Setting up IIS Site and Application pool")
	#Setup initial website app pool, and site.
	#if the site already exists, then do not create it.
	Import-Module "WebAdministration"

	writeToLog ("Checking for Existing Site")

	if($ConflictingWebsiteToStop -ne "")
	{
		try
		{
			writeToLog ("Stopping website " + $ConflictingWebsiteToStop)
			Stop-WebSite -Name $ConflictingWebsiteToStop
			writeToLog ("Website stopped " + $ConflictingWebsiteToStop)
		}catch [Exception]
		{
			$ex = $_.Exception.Message
			$exInner = ""
			if($_.Exception.InnerException.Message -ne $null){
				$exInner = $_.Exception.InnerException.Message
			};
					
			writeWarning ("Failed to stop website " + $ConflictingWebsiteToStop + ": " + $ex + " " + $exInner)
		}
	}

	#Remove existing site and app pool
	if((Test-Path IIS:\Sites\$SiteName) -eq $true){
		writeToLog ("Removing Existing Site")
		Remove-Item IIS:\Sites\$SiteName -recurse
	}

	if((Test-Path IIS:\AppPools\$SiteName) -eq $true){
		writeToLog ("Removing Existing AppPool")
		Remove-Item IIS:\AppPools\$SiteName -recurse
	}

	if((Test-Path IIS:\AppPools\$SiteName) -eq $false)
	{
		$appPool = New-Item IIS:\AppPools\$SiteName
		# some user account:
		$appPool.processModel.username = $PortalUser
		$appPool.processModel.password = $PortalPassword
		$appPool.processModel.identityType = 3

		$appPool | set-item 
	}else{
		#Replace existing apppool identity.
		$appPool = Get-Item IIS:\AppPools\$SiteName
		# some user account:
		$appPool.processModel.username = $PortalUser
		$appPool.processModel.password = $PortalPassword
		$appPool.processModel.identityType = 3

		$appPool | set-item 
	}
	writeProgress(70)

	
	if((Test-Path IIS:\Sites\$SiteName) -eq $false)
	{
		New-Item IIS:\Sites\$SiteName -physicalPath ($SiteRootPath + $SiteName) -bindings @{protocol="http";bindingInformation=":" + $SitePort + ":"}
		Set-ItemProperty IIS:\Sites\$SiteName -name applicationPool -value $SiteName
	}else{
		
		Get-Item IIS:\Sites\$SiteName -physicalPath ($SiteRootPath + $SiteName) -bindings @{protocol="http";bindingInformation=":" + $SitePort + ":"}
	
		Set-ItemProperty IIS:\Sites\$SiteName -name physicalPath -value ($SiteRootPath + $SiteName)
		Set-ItemProperty IIS:\Sites\$SiteName -name bindings -value @{protocol="http";bindingInformation=":" + $SitePort + ":"}
		Set-ItemProperty IIS:\Sites\$SiteName -name applicationPool -value $SiteName
	}

	#Setup https if a cert is specified
	if($SSLCertificateName -ne "") { 
		try {
			#Add https binding
			New-WebBinding -Name $SiteName -IPAddress "*" -Protocol "https" -Port 443

			#Add certificate
			$SslThumbprint = (Get-ChildItem -Path Cert:\LocalMachine\My | Where-Object {$_.FriendlyName -match "$SSLCertificateName"} | Select Thumbprint -First 1).Thumbprint
			New-Item IIS:\SslBindings\0.0.0.0!443 -Value $SslThumbprint
		} catch [Exception] {
			$ex = $_.Exception.Message
			$exInner = ""
			if($_.Exception.InnerException.Message -ne $null){
				$exInner = $_.Exception.InnerException.Message
			};
			
			if ($ex -notlike '*already exists*') {
				writeWarning ("Failed to configure SSL " + $SiteName + ": " + $ex + " " + $exInner)
			}
		}
	}

	#Delete all website files except those in the custom space:
	if( (test-path -path ($SiteRootPath + $SiteName)) -eq $true){
		try{
			writeToLog "Backing up custom files"
			if((test-path -path $SiteRootPath$SiteName\CustomSpace) -eq $true){
				$robocopy = ("& robocopy '" + $SiteRootPath + $SiteName + "\CustomSpace' InstallationFiles\tmp\CustomSpace  /s")
				$robocopy
				Invoke-Expression $robocopy | Write-Output
			}
			remove-item ($SiteRootPath + $SiteName) -recurse
		}
		catch [Exception]
		{
			$ex = $_.Exception.Message
			$exInner = ""
			if($_.Exception.InnerException.Message -ne $null){
				$exInner = $_.Exception.InnerException.Message
			};
					
			writeWarning ("Failed to clean site " + $SiteName + ": " + $ex + " " + $exInner)
		}

	}

	backupParametersXmlFile
	#Setup ParameterFile to deploy to the proper location
	replaceTokensInFile ("website\CiresonPortal.SetParameters.xml") "%SiteName%"  $SiteName
    
    writeToLog("Deploying website starting")
	#Deploy the website to the specified directory using .
    Invoke-Expression  "website\CiresonPortal.deploy.cmd /Y" | Write-Output
    writeToLog("Deploying website complete")
	writeProgress(75)
	restoreParametersXmlFile

	try
		{
        writeToLog ("Starting website " + $SiteName)
		Start-WebSite -Name $SiteName

		writeToLog ("Started website " + $SiteName)
				
        }catch [Exception]
		{
			$ex = $_.Exception.Message
			$exInner = ""
			if($_.Exception.InnerException.Message -ne $null){
				$exInner = $_.Exception.InnerException.Message
			};
					
			writeWarning ("Failed to start website " + $SiteName + ": " + $ex + " " + $exInner)
		}
}


#restore custom files
try{
	writeToLog "Restoring custom files"
	if((test-path -path InstallationFiles\tmp\CustomSpace) -eq $true){
		$robocopy = ("& robocopy InstallationFiles\tmp\CustomSpace '" + $SiteRootPath + $SiteName + "\CustomSpace' /s")
		$robocopy
		Invoke-Expression $robocopy | Write-Output
		remove-item -path "InstallationFiles\tmp\CustomSpace" -recurse
	}
	
}
catch [Exception]
{
	$ex = $_.Exception.Message
	$exInner = ""
	if($_.Exception.InnerException.Message -ne $null){
		$exInner = $_.Exception.InnerException.Message
	};
					
	writeWarning ("Error restoring custom files " + $SiteName + ": " + $ex + " " + $exInner)
}




"Setting Up Config Files"

"Copying config files from installation folder to : " + ($SiteRootPath + $SiteName)
$robocopy = ("& robocopy InstallationFiles\config '" + $SiteRootPath + $SiteName + "' /s")
$robocopy
Invoke-Expression $robocopy | Write-Output


replaceTokensInFile ($SiteRootPath + $SiteName + "\Web.Config") "%ManagementServer%" $ManagementServer
replaceTokensInFile ($SiteRootPath + $SiteName + "\Web.Config") "%SQLServer%" $SQLServer
replaceTokensInFile ($SiteRootPath + $SiteName + "\Web.Config") "%ApplicationTitle%" $ApplicationTitle
replaceTokensInFile ($SiteRootPath + $SiteName + "\Web.Config") "%LanguageCode%" $LanguageCode
replaceTokensInFile ($SiteRootPath + $SiteName + "\Web.Config") "%LanguageCodeDateTime%" $LanguageCodeDateTime
replaceTokensInFile ($SiteRootPath + $SiteName + "\Web.Config") "%ServiceCatalogLanguageCode%" $ServiceCatalogLanguageCode
replaceTokensInFile ($SiteRootPath + $SiteName + "\Web.Config") "%ManagementDBName%" $ManagementDBName
replaceTokensInFile ($SiteRootPath + $SiteName + "\Web.Config") "%NotificationTemplatePrefix%" $NotificationTemplatePrefix
replaceTokensInFile ($SiteRootPath + $SiteName + "\Web.Config") "%SMTPServerName%" $SMTPServerName
replaceTokensInFile ($SiteRootPath + $SiteName + "\Web.Config") "%SMTPServerPort%" $SMTPServerPort
replaceTokensInFile ($SiteRootPath + $SiteName + "\Web.Config") "%SMTPEmailReturnAddress%" $SMTPEmailReturnAddress
replaceTokensInFile ($SiteRootPath + $SiteName + "\Web.Config") "%AnalyticDBName%" $AnalyticDBName
revertInstallationWebConfig

replaceTokensInFile ($SiteRootPath + $SiteName + "\bin\Cireson.CacheBuilder.Service.exe.config") "%ManagementServer%" $ManagementServer
replaceTokensInFile ($SiteRootPath + $SiteName + "\bin\Cireson.CacheBuilder.Service.exe.config") "%SQLServer%" $SQLServer
replaceTokensInFile ($SiteRootPath + $SiteName + "\bin\Cireson.CacheBuilder.Service.exe.config") "%SMSQLServer%" $SMSQLServer
replaceTokensInFile ($SiteRootPath + $SiteName + "\bin\Cireson.CacheBuilder.Service.exe.config") "%CacheLanguageCodes%" $CacheLanguageCodes
replaceTokensInFile ($SiteRootPath + $SiteName + "\bin\Cireson.CacheBuilder.Service.exe.config") "%LanguageCode%" $LanguageCode
replaceTokensInFile ($SiteRootPath + $SiteName + "\bin\Cireson.CacheBuilder.Service.exe.config") "%ManagementDBName%" $ManagementDBName
replaceTokensInFile ($SiteRootPath + $SiteName + "\bin\Cireson.CacheBuilder.Service.exe.config") "%SMDBName%" $SMDBName
replaceTokensInFile ($SiteRootPath + $SiteName + "\bin\Cireson.CacheBuilder.Service.exe.config") "%AnalystsADGroup%" $AnalystsADGroup
replaceTokensInFile ($SiteRootPath + $SiteName + "\bin\Cireson.CacheBuilder.Service.exe.config") "%AssetManagementADGroup%" $AssetManagementADGroup
replaceTokensInFile ($SiteRootPath + $SiteName + "\bin\Cireson.CacheBuilder.Service.exe.config") "%KnowledgeManagerADGroup%" $KnowledgeManagerADGroup
replaceTokensInFile ($SiteRootPath + $SiteName + "\bin\Cireson.CacheBuilder.Service.exe.config") "%ConfigItemClasses%" $ConfigItemClasses

replaceTokensInFile ($SiteRootPath + $SiteName + "\bin\Cireson.CacheBuilder.WindowsService.exe.config") "%ManagementServer%" $ManagementServer
replaceTokensInFile ($SiteRootPath + $SiteName + "\bin\Cireson.CacheBuilder.WindowsService.exe.config") "%SQLServer%" $SQLServer
replaceTokensInFile ($SiteRootPath + $SiteName + "\bin\Cireson.CacheBuilder.WindowsService.exe.config") "%SMSQLServer%" $SMSQLServer
replaceTokensInFile ($SiteRootPath + $SiteName + "\bin\Cireson.CacheBuilder.WindowsService.exe.config") "%CacheLanguageCodes%" $CacheLanguageCodes
replaceTokensInFile ($SiteRootPath + $SiteName + "\bin\Cireson.CacheBuilder.WindowsService.exe.config") "%LanguageCode%" $LanguageCode
replaceTokensInFile ($SiteRootPath + $SiteName + "\bin\Cireson.CacheBuilder.WindowsService.exe.config") "%ManagementDBName%" $ManagementDBName
replaceTokensInFile ($SiteRootPath + $SiteName + "\bin\Cireson.CacheBuilder.WindowsService.exe.config") "%SMDBName%" $SMDBName
replaceTokensInFile ($SiteRootPath + $SiteName + "\bin\Cireson.CacheBuilder.WindowsService.exe.config") "%AnalystsADGroup%" $AnalystsADGroup
replaceTokensInFile ($SiteRootPath + $SiteName + "\bin\Cireson.CacheBuilder.WindowsService.exe.config") "%AssetManagementADGroup%" $AssetManagementADGroup
replaceTokensInFile ($SiteRootPath + $SiteName + "\bin\Cireson.CacheBuilder.WindowsService.exe.config") "%KnowledgeManagerADGroup%" $KnowledgeManagerADGroup
replaceTokensInFile ($SiteRootPath + $SiteName + "\bin\Cireson.CacheBuilder.WindowsService.exe.config") "%ConfigItemClasses%" $ConfigItemClasses


writeToLog("Configuring selected authentication method")
#Setup either SSO, or Forms Authentication.
if($UseSSOAuth -eq $false){
	writeToLog("Configuring Forms authentication")
	Set-WebConfiguration system.web/authentication "IIS:\sites\$SiteName" -value @{mode="Forms"}
	Set-WebConfigurationProperty -Location $SiteName -filter /system.webServer/security/authentication/windowsAuthentication -name enabled -value false -PSPath IIS:\
}else{
	writeToLog("Configuring Windows authentication")
	Set-WebConfiguration system.web/authentication "IIS:\sites\$SiteName" -value @{mode="Windows"}
	Set-WebConfigurationProperty -Location $SiteName -filter /system.webServer/security/authentication/windowsAuthentication -name enabled -value true -PSPath IIS:\
}
writeToLog("Done Configuring selected authentication method")
		
copySCSMBinaries

writeProgress(80)
#build DB and management packages

deployManagementDatabase
writeProgress(85)
createSQLLogins

if ($InstallAnalytic -eq $true)
{
	deployAnalyticsDatabase
	writeProgress(86)
	createAnalyticsSQLLogins
	updateJobs
}

writeProgress(87)
deployLatestDacPac
setRecoveryToSimple
writeProgress(90)

installPlatform
writeProgress(93)

updateDefaultSettings
updateDataRetentionDefaultSettings
updateDefaultDataSourceConfiguration



createCustomSpaceSubFolder

writeProgress(98)

deployMPB

installWindowsService



writeProgress(100)
sleep 10
sc.exe config "Platform_Cache" depend= W3SVC start= delayed-auto

writeToLog "Installation completed"

#Save encrypted install date to a file after installation
writeInstallDate
# SIG # Begin signature block
# MIITXQYJKoZIhvcNAQcCoIITTjCCE0oCAQExCzAJBgUrDgMCGgUAMGkGCisGAQQB
# gjcCAQSgWzBZMDQGCisGAQQBgjcCAR4wJgIDAQAABBAfzDtgWUsITrck0sYpfvNR
# AgEAAgEAAgEAAgEAAgEAMCEwCQYFKw4DAhoFAAQU8pa61OygI7B0W7n/EeBHglXu
# TT2gghCUMIIFKjCCBBKgAwIBAgIQXnGN4pQDrsYspIbDDM2B/TANBgkqhkiG9w0B
# AQsFADB9MQswCQYDVQQGEwJHQjEbMBkGA1UECBMSR3JlYXRlciBNYW5jaGVzdGVy
# MRAwDgYDVQQHEwdTYWxmb3JkMRowGAYDVQQKExFDT01PRE8gQ0EgTGltaXRlZDEj
# MCEGA1UEAxMaQ09NT0RPIFJTQSBDb2RlIFNpZ25pbmcgQ0EwHhcNMTgwODA2MDAw
# MDAwWhcNMjAwODA1MjM1OTU5WjCBkzELMAkGA1UEBhMCVVMxDjAMBgNVBBEMBTky
# MTAxMRMwEQYDVQQIDApDYWxpZm9ybmlhMRIwEAYDVQQHDAlTYW4gRGllZ28xJzAl
# BgNVBAkMHjE0MzEgUGFjaWZpYyBIaWdod2F5LCBTdWl0ZSBIMzEQMA4GA1UECgwH
# Q2lyZXNvbjEQMA4GA1UEAwwHQ2lyZXNvbjCCASIwDQYJKoZIhvcNAQEBBQADggEP
# ADCCAQoCggEBAMtzz1IOvn3HPJDebSDYrlvS311jVX2nirctagamEzvxpP3vbtr2
# BIuAqlad+5Z7dAZk3x/xkM5tzzyh25HJOHVGMiIkTJWxcMF2JJ6iui+NQzHQ155G
# +0v9lIJE8t7QdkWsLjRS3DrM/QvigIl50qOs9JY+5OJ5KUavHytcRWmeLrZzWgat
# dkt08+rPlyc87Xz/6B9/35tWJ3wm1bISjk593OXzVkbCJv+hxdy6+okc0bYAvLVE
# ospkKUyaqqIPCDc2cHTCx+0PGdjeJfA4x6j4xOhq3DeafGFjLPrXns7DGi9FjXmU
# wsWmgOVGyARZUEYdNAtQ5Jf4MfkTV9zPb3cCAwEAAaOCAY0wggGJMB8GA1UdIwQY
# MBaAFCmRYP+KTfrr+aZquM/55ku9Sc4SMB0GA1UdDgQWBBT63xBr/OqoqXnrYqlZ
# GN2UJVCSRDAOBgNVHQ8BAf8EBAMCB4AwDAYDVR0TAQH/BAIwADATBgNVHSUEDDAK
# BggrBgEFBQcDAzARBglghkgBhvhCAQEEBAMCBBAwRgYDVR0gBD8wPTA7BgwrBgEE
# AbIxAQIBAwIwKzApBggrBgEFBQcCARYdaHR0cHM6Ly9zZWN1cmUuY29tb2RvLm5l
# dC9DUFMwQwYDVR0fBDwwOjA4oDagNIYyaHR0cDovL2NybC5jb21vZG9jYS5jb20v
# Q09NT0RPUlNBQ29kZVNpZ25pbmdDQS5jcmwwdAYIKwYBBQUHAQEEaDBmMD4GCCsG
# AQUFBzAChjJodHRwOi8vY3J0LmNvbW9kb2NhLmNvbS9DT01PRE9SU0FDb2RlU2ln
# bmluZ0NBLmNydDAkBggrBgEFBQcwAYYYaHR0cDovL29jc3AuY29tb2RvY2EuY29t
# MA0GCSqGSIb3DQEBCwUAA4IBAQB3eyxONeXYAyjSMz48tMrAPxz8padvDlnexawZ
# MpoadwdowqWRlDQEjRouruKYgyxV/mOl3f89fL9oqvcfYm5hndJmeS/SsnBFx/+Y
# TWaZJtB9BSfanP6RZHows99tC5eTCOrhYFDdGe7Nqi2aoOmnmF0C+VV+1ODV+pNj
# tBHFc9skksmNthkwxD5CLs2YZJ78+QAmXI5bd0U/0kHt4f5VWV+f+eEzcXZxGmK0
# PAZylLuXbuNzkx6aFJfIn1DxyHUhRgRAvPdF6BZKIr/Mz7DSYM594fv3r3pmOhlU
# RRCv4tgiXhkyZsysCXb36LrKvEGFm83zYRdNkUraCHkspJTcMIIFfjCCBGagAwIB
# AgIQZ970PvF72uJP9ZQGBtLAhDANBgkqhkiG9w0BAQwFADB7MQswCQYDVQQGEwJH
# QjEbMBkGA1UECAwSR3JlYXRlciBNYW5jaGVzdGVyMRAwDgYDVQQHDAdTYWxmb3Jk
# MRowGAYDVQQKDBFDb21vZG8gQ0EgTGltaXRlZDEhMB8GA1UEAwwYQUFBIENlcnRp
# ZmljYXRlIFNlcnZpY2VzMB4XDTA0MDEwMTAwMDAwMFoXDTI4MTIzMTIzNTk1OVow
# gYUxCzAJBgNVBAYTAkdCMRswGQYDVQQIExJHcmVhdGVyIE1hbmNoZXN0ZXIxEDAO
# BgNVBAcTB1NhbGZvcmQxGjAYBgNVBAoTEUNPTU9ETyBDQSBMaW1pdGVkMSswKQYD
# VQQDEyJDT01PRE8gUlNBIENlcnRpZmljYXRpb24gQXV0aG9yaXR5MIICIjANBgkq
# hkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAkehUktIKVrGsDSTdxc9EZ3SZKzejfSNw
# AHG8U9/E+ioSj0t/EFa9n3Byt2F/yUsPF6c947AEYe7/EZfH9IY+Cvo+XPmT5jR6
# 2RRr55yzhaCCenavcZDX7P0N+pxs+t+wgvQUfvm+xKYvT3+Zf7X8Z0NyvQwA1onr
# ayzT7Y+YHBSrfuXjbvzYqOSSJNpDa2K4Vf3qwbxstovzDo2a5JtsaZn4eEgwRdWt
# 4Q08RWD8MpZRJ7xnw8outmvqRsfHIKCxH2XeSAi6pE6p8oNGN4Tr6MyBSENnTnIq
# m1y9TBsoilwie7SrmNnu4FGDwwlGTm0+mfqVF9p8M1dBPI1R7Qu2XK8sYxrfV8g/
# vOldxJuvRZnio1oktLqpVj3Pb6r/SVi+8Kj/9Lit6Tf7urj0Czr56ENCHonYhMsT
# 8dm74YlguIwoVqwUHZwK53Hrzw7dPamWoUi9PPevtQ0iTMARgexWO/bTouJbt7IE
# IlKVgJNp6I5MZfGRAy1wdALqi2cVKWlSArvX31BqVUa/oKMoYX9w0MOiqiwhqkfO
# KJwGRXa/ghgntNWutMtQ5mv0TIZxMOmm3xaG4Nj/QN370EKIf6MzOi5cHkERgWPO
# GHFrK+ymircxXDpqR+DDeVnWIBqv8mqYqnK8V0rSS527EPywTEHl7R09XiidnMy/
# s1Hap0flhFMCAwEAAaOB8jCB7zAfBgNVHSMEGDAWgBSgEQojPpbxB+zirynvgqV/
# 0DCktDAdBgNVHQ4EFgQUu69+Aj36pvE8hI6t7jiY7NkyMtQwDgYDVR0PAQH/BAQD
# AgGGMA8GA1UdEwEB/wQFMAMBAf8wEQYDVR0gBAowCDAGBgRVHSAAMEMGA1UdHwQ8
# MDowOKA2oDSGMmh0dHA6Ly9jcmwuY29tb2RvY2EuY29tL0FBQUNlcnRpZmljYXRl
# U2VydmljZXMuY3JsMDQGCCsGAQUFBwEBBCgwJjAkBggrBgEFBQcwAYYYaHR0cDov
# L29jc3AuY29tb2RvY2EuY29tMA0GCSqGSIb3DQEBDAUAA4IBAQB/8lY1sG2VSk50
# rzribwGLh9Myl+34QNJ3UxHXxxYuxp3mSFa+gKn4vHjSyGMXroztFjH6HxjJDsfu
# SHmfx8m5vMyIFeNoYdGfHUthgddWBGPCCGkm8PDlL9/ACiupBfQCWmqJ17SEQpXj
# 6/d2IF412cDNJQgTTHE4joewM4SRmR6R8ayeP6cdYIEsNkFUoOJGBgusG8eZNoxe
# oQukntlCRiTFxVuBrq2goNyfNriNwh0V+oitgRA5H0TwK5/dEFQMBzSxNtEU/QcC
# Pf9yVasn1iyBQXEpjUH0UFcafmVgr8vFKHaYrrOoU3aL5iFSa+oh0IQOSU6IU9qS
# LucdCGbXMIIF4DCCA8igAwIBAgIQLnyHzA6TSlL+lP0ct800rzANBgkqhkiG9w0B
# AQwFADCBhTELMAkGA1UEBhMCR0IxGzAZBgNVBAgTEkdyZWF0ZXIgTWFuY2hlc3Rl
# cjEQMA4GA1UEBxMHU2FsZm9yZDEaMBgGA1UEChMRQ09NT0RPIENBIExpbWl0ZWQx
# KzApBgNVBAMTIkNPTU9ETyBSU0EgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkwHhcN
# MTMwNTA5MDAwMDAwWhcNMjgwNTA4MjM1OTU5WjB9MQswCQYDVQQGEwJHQjEbMBkG
# A1UECBMSR3JlYXRlciBNYW5jaGVzdGVyMRAwDgYDVQQHEwdTYWxmb3JkMRowGAYD
# VQQKExFDT01PRE8gQ0EgTGltaXRlZDEjMCEGA1UEAxMaQ09NT0RPIFJTQSBDb2Rl
# IFNpZ25pbmcgQ0EwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCmmJBj
# d5E0f4rR3elnMRHrzB79MR2zuWJXP5O8W+OfHiQyESdrvFGRp8+eniWzX4GoGA8d
# HiAwDvthe4YJs+P9omidHCydv3Lj5HWg5TUjjsmK7hoMZMfYQqF7tVIDSzqwjiNL
# S2PgIpQ3e9V5kAoUGFEs5v7BEvAcP2FhCoyi3PbDMKrNKBh1SMF5WgjNu4xVjPfU
# dpA6M0ZQc5hc9IVKaw+A3V7Wvf2pL8Al9fl4141fEMJEVTyQPDFGy3CuB6kK46/B
# AW+QGiPiXzjbxghdR7ODQfAuADcUuRKqeZJSzYcPe9hiKaR+ML0btYxytEjy4+gh
# +V5MYnmLAgaff9ULAgMBAAGjggFRMIIBTTAfBgNVHSMEGDAWgBS7r34CPfqm8TyE
# jq3uOJjs2TIy1DAdBgNVHQ4EFgQUKZFg/4pN+uv5pmq4z/nmS71JzhIwDgYDVR0P
# AQH/BAQDAgGGMBIGA1UdEwEB/wQIMAYBAf8CAQAwEwYDVR0lBAwwCgYIKwYBBQUH
# AwMwEQYDVR0gBAowCDAGBgRVHSAAMEwGA1UdHwRFMEMwQaA/oD2GO2h0dHA6Ly9j
# cmwuY29tb2RvY2EuY29tL0NPTU9ET1JTQUNlcnRpZmljYXRpb25BdXRob3JpdHku
# Y3JsMHEGCCsGAQUFBwEBBGUwYzA7BggrBgEFBQcwAoYvaHR0cDovL2NydC5jb21v
# ZG9jYS5jb20vQ09NT0RPUlNBQWRkVHJ1c3RDQS5jcnQwJAYIKwYBBQUHMAGGGGh0
# dHA6Ly9vY3NwLmNvbW9kb2NhLmNvbTANBgkqhkiG9w0BAQwFAAOCAgEAAj8COcPu
# +Mo7id4MbU2x8U6ST6/COCwEzMVjEasJY6+rotcCP8xvGcM91hoIlP8l2KmIpysQ
# GuCbsQciGlEcOtTh6Qm/5iR0rx57FjFuI+9UUS1SAuJ1CAVM8bdR4VEAxof2bO4Q
# RHZXavHfWGshqknUfDdOvf+2dVRAGDZXZxHNTwLk/vPa/HUX2+y392UJI0kfQ1eD
# 6n4gd2HITfK7ZU2o94VFB696aSdlkClAi997OlE5jKgfcHmtbUIgos8MbAOMTM1z
# B5TnWo46BLqioXwfy2M6FafUFRunUkcyqfS/ZEfRqh9TTjIwc8Jvt3iCnVz/Rrtr
# Ih2IC/gbqjSm/Iz13X9ljIwxVzHQNuxHoc/Li6jvHBhYxQZ3ykubUa9MCEp6j+Kj
# UuKOjswm5LLY5TjCqO3GgZw1a6lYYUoKl7RLQrZVnb6Z53BtWfhtKgx/GWBfDJqI
# bDCsUgmQFhv/K53b0CDKieoofjKOGd97SDMe12X4rsn4gxSTdn1k0I7OvjV9/3Ix
# TZ+evR5sL6iPDAZQ+4wns3bJ9ObXwzTijIchhmH+v1V04SF3AwpobLvkyanmz1kl
# 63zsRQ55ZmjoIs2475iFTZYRPAmK0H+8KCgT+2rKVI2SXM3CZZgGns5IW9S1N5NG
# QXwH3c/6Q++6Z2H/fUnguzB9XIDj5hY5S6cxggIzMIICLwIBATCBkTB9MQswCQYD
# VQQGEwJHQjEbMBkGA1UECBMSR3JlYXRlciBNYW5jaGVzdGVyMRAwDgYDVQQHEwdT
# YWxmb3JkMRowGAYDVQQKExFDT01PRE8gQ0EgTGltaXRlZDEjMCEGA1UEAxMaQ09N
# T0RPIFJTQSBDb2RlIFNpZ25pbmcgQ0ECEF5xjeKUA67GLKSGwwzNgf0wCQYFKw4D
# AhoFAKB4MBgGCisGAQQBgjcCAQwxCjAIoAKAAKECgAAwGQYJKoZIhvcNAQkDMQwG
# CisGAQQBgjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcCARUwIwYJKoZI
# hvcNAQkEMRYEFAr0GooF2msFTEYAwz1di5iiXNeRMA0GCSqGSIb3DQEBAQUABIIB
# AHjc3bbPdL7DdEM9MKZbQ9BJvQn2JyHvGPx7sEM/1Q9XtJZXK0IGNhnfWqk4MhiH
# TsWCYAiu9uO0aLvHuWWPiB7zOiVolxcIqpgDUOKjRHAJyg5hwrVH1k6k94DExDT7
# kOZNV8NeJOO39Co2/6JRTpY+rMMwXTCaxPxZmrsO2S8/Onp/tQBzoWyHmGwmHG41
# CJN/dpuLvCfd98Mw3OsGmikkJXtIdUhOr09rKkT3CmQREaPoGo3FnmShLyrScTQF
# 0gOuoxw0htqgO2C8qv8dSSxVLDYcHlX9c5ibMbcf0vbbC3gG8U6RVe8SQJlv+7YX
# 14Lrs+kdPOv2JYCi2lEc1iw=
# SIG # End signature block
