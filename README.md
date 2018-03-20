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

### 3. Installing SASS
	SASS requires ruby.

	Installing Ruby
		MAC OS:  	ruby is pre-installed
		WINDOWS:	rubyinstaller.org
		Linux:		apt-get install ruby (or ruby-dev, check online)

	Installing SASS
		1. Use following command to install sass 'gem install sass'
		2. After it is installed run 'sass -v' to confirm
	

### 4. Create ENV variables 
	n_mode
		Valid options - dev | test | production
	
	NODE_ENV (only in production)
		Valid options - production

### 5. Create .env file for your mode (dev.env | test.env | production.env)
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
		ORDER_EMAIL_USER=
		ORDER_EMAIL_PASS=
		NOREPLY_EMAIL_USER=
		NOREPLY_EMAIL_PASS=

		# Stripe
		STRIPE_TOKEN_SECRET=
		STRIPE_TOKEN_PUB=
		
		# Order Slips
		ORDER_SLIPS_DIR=
		
		# Logger
		LOG_FILE_NAME=
		DEBUG_LEVEL=  #error | warn | info | verbose | debug | silly 
		LOG_FILE_PATH=

		# Keys
		SESSION_KEY=

		# Redis
		REDIS_USER=

## Running project
### Using gulp
	We use gulp to automate preprocessing, and pre-run tasks

	1. Run command 'gulp run'
	2. Wait for gulp tasks to finish, connect to localhost:9090 for Front-end development

### Using nodemon
	1. Run command 'gulp run --env production'
	2. 'nodemon server.js'

### Using pm2 - this is used to monitor CPU/RAM usage mostly on development
#### Development mode
	1. Run command 'gulp run --env production'
	2. 'pm2 start dev-startup.json'
#### Production mode
	1. Run command 'gulp run --env production'
	2. 'pm2 start production-startup.json'


## Running tests 
### Back-end (In Progress)
	gulp test-backend

### Front-end (In Progress)
	gulp test-frontend

### Database structure
	gulp test-db

### Running End to End tests (e2e)
#### Setting up 
If running for the first time, you'll need to install selenium web-driver. This can be done by following commands:

	1. npm install -g protractor
	2. run 'webdriver-manager update'

This will update webdriver. This only needs to be done once (or for later updates of webdriver).

#### Run test
	1. open new terminal/cmd window and run 'webdriver-manager start'
	2. run server (localhost:8080)
	3. gulp test-e2e

### Run views (200/404 for front pages)
	gulp test-views