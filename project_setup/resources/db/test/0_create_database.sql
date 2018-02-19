/**
 *  Testing database
 */
DROP DATABASE IF EXISTS test_homit;
DROP USER IF EXISTS 'db_web_user_test'@'localhost';

CREATE USER 'db_web_user_test'@'localhost' IDENTIFIED BY 'test';

CREATE DATABASE test_homit;

GRANT SELECT, INSERT, UPDATE, DELETE ON `test_homit`.* TO 'db_web_user_test'@'localhost' WITH GRANT OPTION;