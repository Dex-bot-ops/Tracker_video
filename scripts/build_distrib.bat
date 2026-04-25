@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo    Build Tracker Video Distribution
echo ==========================================

cd /d "%~dp0\.."

echo.
echo [1/4] Build du frontend React avec Vite...
call npm install
call npm run build
if %ERRORLEVEL% neq 0 (
    echo [ERREUR] Le build npm a echoue.
    pause
    exit /b 1
)

set "DIST_COMPLETE=dist\tracker_video_install_complete"
set "DIST_LIGHT=dist\tracker_video_maj_legere"

echo.
echo [2/4] Nettoyage et preparation des dossiers dist...
if exist dist rmdir /s /q dist
mkdir "%DIST_COMPLETE%"
mkdir "%DIST_LIGHT%"
mkdir "%DIST_COMPLETE%\backend"
mkdir "%DIST_LIGHT%\backend"

echo.
echo [3/4] Copie des fichiers sources...
:: Copier le backend (sans pycache et venv)
xcopy backend "%DIST_COMPLETE%\backend" /E /I /H /Y /EXCLUDE:scripts\exclude.txt
xcopy backend "%DIST_LIGHT%\backend" /E /I /H /Y /EXCLUDE:scripts\exclude.txt

:: Copier les fichiers à la racine
copy backend\requirements.txt "%DIST_COMPLETE%\"
copy backend\requirements.txt "%DIST_LIGHT%\"
if exist get-pip.py (
    copy get-pip.py "%DIST_COMPLETE%\"
) else (
    echo [ATTENTION] get-pip.py introuvable a la racine. Vous devez le telecharger.
)

:: Copier les scripts de déploiement
copy scripts\install_silent.bat "%DIST_COMPLETE%\"
copy scripts\install_ui.ps1 "%DIST_COMPLETE%\"
copy scripts\Lancer_app.vbs "%DIST_COMPLETE%\"
copy scripts\Lancer_manuel.bat "%DIST_COMPLETE%\"
copy scripts\Mise_a_jour.vbs "%DIST_LIGHT%\"

echo.
echo [4/4] Copie du Python Embeddable...
if exist python (
    xcopy python "%DIST_COMPLETE%\python" /E /I /H /Y
    
    :: Patch du fichier ._pth pour activer import site
    for %%f in ("%DIST_COMPLETE%\python\python*._pth") do (
        echo Patching %%f...
        powershell -Command "(Get-Content '%%f') -replace '#import site', 'import site' | Set-Content '%%f'"
    )
) else (
    echo [ATTENTION] Dossier python/ introuvable a la racine. 
    echo L'installation complete ne marchera pas sans lui.
)

echo.
echo ==========================================
echo    Build termine avec succes !
echo ==========================================
pause
