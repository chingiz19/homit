/*
* This scripts deletes user and database which we want to create. 
* Then it creates a database and a user.
* Grants all privileges for the database to the user.
*/
DROP DATABASE IF EXISTS homit;
DROP USER IF EXISTS 'db_admin'@'localhost';

CREATE USER 'db_admin'@'localhost' IDENTIFIED BY 'gg:(@SH%H3K5^4#P';
GRANT USAGE ON *.* TO 'db_admin'@'localhost' REQUIRE NONE WITH MAX_QUERIES_PER_HOUR 0 MAX_CONNECTIONS_PER_HOUR 0 MAX_UPDATES_PER_HOUR 0 MAX_USER_CONNECTIONS 0;

CREATE DATABASE homit;

GRANT ALL PRIVILEGES ON `homit`.* TO 'db_admin'@'localhost' WITH GRANT OPTION;