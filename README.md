# Setting up project
## 1 .Install all dependencies
	'npm install'

## 2. Installing nodemon | pm2
### Install pm2 process manager
	'npm install -g pm2'
	For more informatino on pm2 visit: http://pm2.keymetrics.io/

### Install nodemon
	'npm install -g nodemon'	

## 3. Create ENV variable **n_mode** - dev | test | production

## 4. Create .env file for your mode (dev.env | test.env | production.env). This file will be used to load environment variables
	We use this file for declaring env variables used inside the app

### Available commands
Note: no spaces around '='

		# Database
		DB_HOST=
		DB_USER=
		DB_PASS=
		DB_NAME=

		# Twilio
		TWILIO_SID=
		TWILIO_TOKEN=
		TWILIO_NUMBER=

		# Email
		EMAIL_HOST=
		EMAIL_PORT=
		EMAIL_USER=
		EMAIL_PASS=

		# Helcim
		HELCIM_ACCOUNT_ID=
		HELCIM_API_TOKEN=

## 5. Starting App
### Using nodemon
	nodemon server.js

### Using pm2 - this is used to monitor CPU/RAM usage mostly on development
#### Development mode
	pm2 start dev-startup.json
#### Production mode
	pm2 start production-startup.json