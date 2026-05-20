@echo off
REM Create folder structure for APMS Frontend

cd /d "c:\PEC College\PEC - APMS\apms-frontend\src"

if not exist "api" mkdir api
if not exist "services" mkdir services
if not exist "auth" mkdir auth
if not exist "components" mkdir components
if not exist "pages" mkdir pages
if not exist "layouts" mkdir layouts
if not exist "routes" mkdir routes
if not exist "context" mkdir context
if not exist "hooks" mkdir hooks
if not exist "utils" mkdir utils
if not exist "theme" mkdir theme

echo Directory structure created successfully!
