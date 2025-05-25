-- actions alterations to automate creation and last motified values

ALTER TABLE [actions] ALTER COLUMN [last_modified_date] DATETIME2 DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE [actions] ALTER COLUMN [created_date] DATETIME2 DEFAULT CURRENT_TIMESTAMP;

-- request alterations to automate creation and last motified values

ALTER TABLE [request] ALTER COLUMN [last_modified_date] DATETIME2 DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE [request] ALTER COLUMN [created_date] DATETIME2 DEFAULT CURRENT_TIMESTAMP;

-- user alterations to automate creation and last motified values

ALTER TABLE [user] ALTER COLUMN [last_modified_date] DATETIME2 DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE [user] ALTER COLUMN [created_date] DATETIME2 DEFAULT CURRENT_TIMESTAMP;

-- profile alterations to automate creation and last motified values

ALTER TABLE [profile] ALTER COLUMN [last_modified_date] DATETIME2 DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE [profile] ALTER COLUMN [created_date] DATETIME2 DEFAULT CURRENT_TIMESTAMP;

-- join_profile_request alterations to automate creation and last motified values

ALTER TABLE [join_profile_request] ALTER COLUMN [last_modified_date] DATETIME2 DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE [join_profile_request] ALTER COLUMN [created_date] DATETIME2 DEFAULT CURRENT_TIMESTAMP;
