@echo off
echo Starting MongoDB...
if not exist "mongodb-data" (
    mkdir mongodb-data
)
"C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath "mongodb-data"
pause
