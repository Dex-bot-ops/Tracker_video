Option Explicit

Dim objFSO, objShell, strScriptPath, strPythonDir, strFastApiDir, strUvicornCmd
Dim strHost, strPort, strUrl

Set objFSO = CreateObject("Scripting.FileSystemObject")
Set objShell = CreateObject("WScript.Shell")

' Recuperer le dossier courant
strScriptPath = objFSO.GetParentFolderName(WScript.ScriptFullName)

' Chemins cles
strPythonDir = objFSO.BuildPath(strScriptPath, "python")
strFastApiDir = objFSO.BuildPath(strScriptPath, "python\Lib\site-packages\fastapi")

' Serveur infos
strHost = "127.0.0.1"
strPort = "8000"
strUrl = "http://" & strHost & ":" & strPort

' Commande pour lancer le backend
strUvicornCmd = """" & objFSO.BuildPath(strPythonDir, "python.exe") & """ -m uvicorn backend.main:app --host " & strHost & " --port " & strPort

' 1. Verifier que le dossier python existe
If Not objFSO.FolderExists(strPythonDir) Then
    MsgBox "Erreur critique : Le dossier 'python' est introuvable." & vbCrLf & vbCrLf & _
           "Assurez-vous d'avoir telecharge la version complete du logiciel et non juste une mise a jour.", 16, "Erreur"
    WScript.Quit
End If

' 2. Verifier que les dependances sont installees
If Not objFSO.FolderExists(strFastApiDir) Then
    ' Lancer l'interface d'installation
    Dim strPsCmd
    strPsCmd = "powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & objFSO.BuildPath(strScriptPath, "install_ui.ps1") & """"
    objShell.Run strPsCmd, 0, False
    WScript.Quit
End If

' 3. Lancer le backend en arriere-plan
objShell.CurrentDirectory = strScriptPath
objShell.Run strUvicornCmd, 0, False

' 4. Attendre quelques secondes que le serveur demarre
WScript.Sleep 3000

' 5. Ouvrir le navigateur
objShell.Run strUrl, 1, False

Set objFSO = Nothing
Set objShell = Nothing
