/**
 *  Dev database
 */
DROP DATABASE IF EXISTS homit_dev;
DROP USER IF EXISTS 'db_web_user'@'localhost';

CREATE USER 'db_web_user'@'localhost' IDENTIFIED BY 'gg:(@SH%H3K5^4#P';

CREATE DATABASE homit_dev;

GRANT SELECT, INSERT, UPDATE, DELETE ON `homit_dev`.* TO 'db_web_user'@'localhost' WITH GRANT OPTION;