# Setting up project
## 1 .Install all dependencies
	'npm install'

## 2. Install nodemon as global function so we can access it just by typing 'nodemon server.js'
	'npm install -g nodemon'

## 3. Create ENV variable **n_mode** - dev | test | production


## 4. Create .env file for your mode (dev.env | test.env | production.env). This file will be used to load environment variables

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