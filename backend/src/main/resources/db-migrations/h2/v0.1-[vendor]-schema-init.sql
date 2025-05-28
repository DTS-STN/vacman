-- city alterations to automate creation and last motified values

ALTER TABLE [city] ALTER COLUMN [last_modified_date] DATETIME2 DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE [city] ALTER COLUMN [created_date] DATETIME2 DEFAULT CURRENT_TIMESTAMP;

-- education_level alterations to automate creation and last motified values

ALTER TABLE [education_level] ALTER COLUMN [last_modified_date] DATETIME2 DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE [education_level] ALTER COLUMN [created_date] DATETIME2 DEFAULT CURRENT_TIMESTAMP;

-- group alterations to automate creation and last motified values

ALTER TABLE [group] ALTER COLUMN [last_modified_date] DATETIME2 DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE [group] ALTER COLUMN [created_date] DATETIME2 DEFAULT CURRENT_TIMESTAMP;

-- lang_equivalents alterations to automate creation and last motified values

ALTER TABLE [lang_equivalents] ALTER COLUMN [last_modified_date] DATETIME2 DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE [lang_equivalents] ALTER COLUMN [created_date] DATETIME2 DEFAULT CURRENT_TIMESTAMP;

-- level alterations to automate creation and last motified values

ALTER TABLE [level] ALTER COLUMN [last_modified_date] DATETIME2 DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE [level] ALTER COLUMN [created_date] DATETIME2 DEFAULT CURRENT_TIMESTAMP;

-- province_territory alterations to automate creation and last motified values

ALTER TABLE [province_territory] ALTER COLUMN [last_modified_date] DATETIME2 DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE [province_territory] ALTER COLUMN [created_date] DATETIME2 DEFAULT CURRENT_TIMESTAMP;

-- request_status alterations to automate creation and last motified values

ALTER TABLE [request_status] ALTER COLUMN [last_modified_date] DATETIME2 DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE [request_status] ALTER COLUMN [created_date] DATETIME2 DEFAULT CURRENT_TIMESTAMP;

-- security_clearance alterations to automate creation and last motified values

ALTER TABLE [security_clearance] ALTER COLUMN [last_modified_date] DATETIME2 DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE [security_clearance] ALTER COLUMN [created_date] DATETIME2 DEFAULT CURRENT_TIMESTAMP;

-- timezone alterations to automate creation and last motified values

ALTER TABLE [timezone] ALTER COLUMN [last_modified_date] DATETIME2 DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE [timezone] ALTER COLUMN [created_date] DATETIME2 DEFAULT CURRENT_TIMESTAMP;

-- title alterations to automate creation and last motified values

ALTER TABLE [title] ALTER COLUMN [last_modified_date] DATETIME2 DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE [title] ALTER COLUMN [created_date] DATETIME2 DEFAULT CURRENT_TIMESTAMP;

-- wfa_status alterations to automate creation and last motified values

ALTER TABLE [wfa_status] ALTER COLUMN [last_modified_date] DATETIME2 DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE [wfa_status] ALTER COLUMN [created_date] DATETIME2 DEFAULT CURRENT_TIMESTAMP;

-- location alterations to automate creation and last motified values

ALTER TABLE [location] ALTER COLUMN [last_modified_date] DATETIME2 DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE [location] ALTER COLUMN [created_date] DATETIME2 DEFAULT CURRENT_TIMESTAMP;

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
