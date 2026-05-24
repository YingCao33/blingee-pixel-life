@echo off
cd /d "%~dp0"
echo Keep the multiplayer server running first: http://localhost:8991
echo.
echo Opening a temporary public tunnel...
echo Send the https://...lhr.life URL to friends.
echo Keep this window open while friends are playing.
echo.
ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -R 80:127.0.0.1:8991 nokey@localhost.run
pause
