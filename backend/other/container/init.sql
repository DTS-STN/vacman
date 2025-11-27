IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'vacman')
BEGIN
  CREATE DATABASE vacman;
END
GO

USE vacman;
GO

IF NOT EXISTS (SELECT name FROM sys.sql_logins WHERE name = 'vacman')
BEGIN
  CREATE LOGIN vacman WITH PASSWORD = 'password', CHECK_POLICY = OFF;
END
GO

IF NOT EXISTS (SELECT name FROM sys.sql_logins WHERE name = 'admin')
BEGIN
  CREATE LOGIN admin WITH PASSWORD = 'password', CHECK_POLICY = OFF;
END
GO

IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = 'vacman')
BEGIN
  CREATE USER vacman FOR LOGIN vacman;
END
GO

IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = 'admin')
BEGIN
  CREATE USER admin FOR LOGIN admin;
END
GO

ALTER ROLE db_datareader ADD MEMBER vacman;
ALTER ROLE db_datawriter ADD MEMBER vacman;
ALTER ROLE db_owner      ADD MEMBER admin;
GO
