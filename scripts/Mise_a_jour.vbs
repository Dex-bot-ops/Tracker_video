Option Explicit

Dim objFSO, objShell, objFolder
Dim strSourceDir, strDestDir
Dim strSourceBackend, strDestBackend

Set objFSO = CreateObject("Scripting.FileSystemObject")
Set objShell = CreateObject("Shell.Application")

' Repertoire de la mise a jour
strSourceDir = objFSO.GetParentFolderName(WScript.ScriptFullName)
strSourceBackend = objFSO.BuildPath(strSourceDir, "backend")

MsgBox "Bienvenue dans l'assistant de mise a jour du Tracker Video." & vbCrLf & _
       "Veuillez selectionner le dossier de votre installation actuelle.", 64, "Mise a jour"

Set objFolder = objShell.BrowseForFolder(0, "Selectionnez le dossier d'installation du Tracker Video (le dossier contenant Lancer_app.vbs):", 0)

If objFolder Is Nothing Then
    WScript.Quit
End If

strDestDir = objFolder.Self.Path
strDestBackend = objFSO.BuildPath(strDestDir, "backend")

' Verification basique
If Not objFSO.FileExists(objFSO.BuildPath(strDestDir, "Lancer_app.vbs")) Then
    MsgBox "Le dossier selectionne ne semble pas contenir une installation valide du Tracker Video.", 16, "Erreur"
    WScript.Quit
End If

' Copie des fichiers
On Error Resume Next
objFSO.CopyFolder strSourceBackend, strDestBackend, True
If Err.Number <> 0 Then
    MsgBox "Erreur lors de la copie des fichiers. Assurez-vous que l'application est fermee." & vbCrLf & "Erreur: " & Err.Description, 16, "Erreur"
    WScript.Quit
End If
On Error GoTo 0

MsgBox "Mise a jour terminee avec succes !", 64, "Succes"

Set objFSO = Nothing
Set objShell = Nothing
