@echo off
echo =============================================
echo    PATRIOT QUIZ PROJECT GENERATOR (EMPTY)
echo =============================================
echo.


echo [INFO] Creating Backend Structure...

:: Backend directory structure
mkdir src
mkdir tests
mkdir tests\unit
mkdir tests\integration
mkdir tests\fixtures

cd src
mkdir config
mkdir controllers
mkdir middleware
mkdir models
mkdir routes
mkdir services
mkdir utils
mkdir migrations

echo [INFO] Creating Backend Empty Files...

:: Config files
echo. > config\database.js
echo. > config\openai.js
echo. > config\mail.js
echo. > config\env.js

:: Controllers
echo. > controllers\quizController.js
echo. > controllers\userController.js
echo. > controllers\resultController.js

:: Middleware
echo. > middleware\auth.js
echo. > middleware\validation.js
echo. > middleware\errorHandler.js

:: Models
echo. > models\User.js
echo. > models\Quiz.js
echo. > models\Question.js
echo. > models\UserAnswer.js

:: Routes
echo. > routes\index.js
echo. > routes\quiz.js
echo. > routes\user.js
echo. > routes\result.js

:: Services
echo. > services\openaiService.js
echo. > services\mailService.js
echo. > services\quizService.js
echo. > services\scoreService.js
echo. > services\userService.js
echo. > services\resultService.js

:: Utils
echo. > utils\logger.js
echo. > utils\validator.js
echo. > utils\helpers.js

:: Migrations
echo. > migrations\001_create_users.sql
echo. > migrations\002_create_quizzes.sql
echo. > migrations\003_create_questions.sql
echo. > migrations\004_create_user_answers.sql
echo. > migrations\migrate.js

:: Main app files
echo. > app.js

:: Go back to backend root
cd ..

:: Package.json template
(
echo {
echo   "name": "patriot-backend",
echo   "version": "1.0.0",
echo   "description": "Backend for Patriot Quiz Application",
echo   "main": "server.js",
echo   "scripts": {
echo     "start": "node server.js",
echo     "dev": "nodemon server.js",
echo     "test": "jest",
echo     "migrate": "node src/migrations/migrate.js"
echo   },
echo   "dependencies": {
echo     "express": "^4.18.2",
echo     "pg": "^8.11.3",
echo     "openai": "^4.20.1",
echo     "nodemailer": "^6.9.7",
echo     "cors": "^2.8.5",
echo     "helmet": "^7.1.0",
echo     "bcryptjs": "^2.4.3",
echo     "jsonwebtoken": "^9.0.2",
echo     "joi": "^17.11.0",
echo     "winston": "^3.11.0",
echo     "express-rate-limit": "^7.1.5",
echo     "express-validator": "^7.0.1",
echo     "dotenv": "^16.3.1"
echo   },
echo   "devDependencies": {
echo     "nodemon": "^3.0.2",
echo     "jest": "^29.7.0",
echo     "supertest": "^6.3.3"
echo   }
echo }
) > package.json


:: Environment template
(
echo # Database
echo DB_HOST=localhost
echo DB_PORT=5432
echo DB_NAME=patriot_quiz
echo DB_USER=your_db_user
echo DB_PASSWORD=your_db_password
echo.
echo # OpenAI
echo OPENAI_API_KEY=your_openai_api_key
echo OPENAI_MODEL=gpt-3.5-turbo
echo.
echo # Mail
echo SMTP_HOST=smtp.gmail.com
echo SMTP_PORT=587
echo SMTP_USER=your_email@gmail.com
echo SMTP_PASS=your_app_password
echo.
echo # JWT
echo JWT_SECRET=your_jwt_secret
echo JWT_EXPIRES_IN=24h
echo.
echo # Server
echo PORT=3000
echo NODE_ENV=development
echo.
echo # CORS
echo FRONTEND_URL=http://localhost:5173 
) > .env.example

:: Server.js
echo. > server.js

:: Test files
echo. > tests\unit\quiz.test.js
echo. > tests\unit\user.test.js
echo. > tests\integration\api.test.js
echo. > tests\fixtures\sampleData.js

:: Install semua dependencies sesuai package.json
npm install


echo [INFO] Backend structure created successfully!