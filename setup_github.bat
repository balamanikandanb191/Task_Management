@echo off
echo Initializing Git...
git init
git add .
git commit -m "Initial commit"
echo Adding remote...
git remote add origin https://github.com/Santhoshkumark-2005/Task-Management-.git
echo Pushing to main...
git branch -M main
git push -u origin main
echo Creating and pushing santhosh branch...
git checkout -b santhosh
git push -u origin santhosh
echo Done!
pause
