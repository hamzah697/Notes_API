CREATE DATABASE IF NOT EXISTS notesapp;
USE notesapp;

  CREATE TABLE IF NOT EXISTS `users` (
   `ID` int NOT NULL AUTO_INCREMENT,
   `USERNAME` varchar(255) DEFAULT NULL,
     `PASSWORD` varchar(255) DEFAULT NULL,
       PRIMARY KEY (`ID`),
         UNIQUE KEY `unique_username` (`USERNAME`)
         ) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


 CREATE TABLE IF NOT EXISTS `notes_table` (
   `ID` int NOT NULL AUTO_INCREMENT,
     `NAME` varchar(255) DEFAULT NULL,
       `DESCRIPTION` text, 
        `USER_ID` int DEFAULT NULL,
         PRIMARY KEY (`ID`),
           KEY `USER_ID` (`USER_ID`),
           CONSTRAINT `notes_table_ibfk_1` FOREIGN KEY (`USER_ID`) REFERENCES `users` (`ID`)
           ) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

 