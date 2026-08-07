// NSIS installer customization
!macro customInstall
  ; Create registry entry for Windows uninstall info
  WriteRegStr HKCU "Software\DevFactory" "InstallPath" "$INSTDIR"
  WriteRegStr HKCU "Software\DevFactory" "Version" "${VERSION}"
!macroend

!macro customUnInstall
  ; Clean up registry
  DeleteRegKey HKCU "Software\DevFactory"
!macroend
