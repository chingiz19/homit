/*
* This scripts creates a database and a user.
* Grants all privileges for the database to the user.
*/
CREATE USER 'delivery_user'@'localhost' IDENTIFIED BY 'ahmadtea';
GRANT USAGE ON *.* TO 'delivery_user'@'localhost' REQUIRE NONE WITH MAX_QUERIES_PER_HOUR 0 MAX_CONNECTIONS_PER_HOUR 0 MAX_UPDATES_PER_HOUR 0 MAX_USER_CONNECTIONS 0;

CREATE DATABASE delivery_db;

GRANT ALL PRIVILEGES ON `delivery\_db`.* TO 'delivery_user'@'localhost' WITH GRANT OPTION;