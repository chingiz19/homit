/**
 *  Dev database
 */
DROP DATABASE IF EXISTS homit_dev;
DROP USER IF EXISTS 'homit_dev_web_user'@'localhost';

CREATE USER 'homit_dev_web_user'@'localhost' IDENTIFIED BY 'gg:(@SH%H3K5^4#P';

CREATE DATABASE homit_dev;

GRANT SELECT, INSERT, UPDATE, DELETE ON `homit_dev_web_user`.* TO 'db_web_user'@'localhost';