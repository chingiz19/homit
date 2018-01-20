# Getting started
## Get Repo (TODO)
### 1. Create Bitbucket account
### 2. Get SSH key
### 3. Pull repo

## Setting up project
### 1 .Install all dependencies
	Run command  'npm install' (might require root/administrative premissions)

### 2. Installing nodemon | pm2 | gulp
#### Install pm2 process manager
	Run command 'npm install -g pm2'
	For more informatino on pm2 visit: http://pm2.keymetrics.io/

#### Install nodemon
	Run command 'npm install -g nodemon'

#### Install gulp
	Run command 'npm install -g gulp'

### 3. Create ENV variable **n_mode** 
	Valid options - dev | test | production

### 4. Create .env file for your mode (dev.env | test.env | production.env)
	This file will be used to load environment variables used inside the server
#### Valid file names
	dev.env | test.env | production.env

#### Available commands
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
		
		# Order Slips
		ORDER_SLIPS_DIR=
		
		# Logger
		DEBUG=

		# Keys
		SESSION_KEY=

## Running project
### Using gulp
	We use gulp to automate preprocessing, and pre-run tasks

	1. Run command 'gulp'
	2. Wait for gulp tasks to finish, connect to localhost:9090 for Front-end development

### Using nodemon
	1. Run command 'gulp --env production'
	2. 'nodemon server.js'

### Using pm2 - this is used to monitor CPU/RAM usage mostly on development
#### Development mode
	1. Run command 'gulp --env production'
	2. 'pm2 start dev-startup.json'
#### Production mode
	1. Run command 'gulp --env production'
	2. 'pm2 start production-startup.json'