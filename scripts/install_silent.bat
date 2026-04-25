@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo Installation of python packages > install.log 2>&1

:: Etape 1: Bootstrap pip
echo Bootstrapping pip... >> install.log 2>&1
python\python.exe get-pip.py >> install.log 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] get-pip.py a echoue avec le code %ERRORLEVEL% >> install.log
    exit /b 1
)

:: Etape 2: Installation des dépendances depuis requirements.txt
echo Installation requirements... >> install.log 2>&1
python\python.exe -m pip install -r requirements.txt --no-warn-script-location >> install.log 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] pip install a echoue avec le code %ERRORLEVEL% >> install.log
    exit /b 1
)

:: Etape 3: Création du dossier uploads s'il n'existe pas
if not exist backend\uploads (
    mkdir backend\uploads
)

echo Installation terminee avec succes. >> install.log 2>&1
exit /b 0
