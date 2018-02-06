/*
* This scripts deletes user and database which we want to create. 
* Then it creates a database and a user.
* Grants all privileges for the database to the user.
*
* Production password should be different
*/
DROP DATABASE IF EXISTS homit;
DROP USER IF EXISTS 'homit_web_user'@'localhost';

CREATE USER 'homit_web_user'@'localhost' IDENTIFIED BY 'gg:(@SH%H3K5^4#P';

CREATE DATABASE homit;

GRANT SELECT, INSERT, UPDATE, DELETE ON `homit`.* TO 'homit_web_user'@'localhost';