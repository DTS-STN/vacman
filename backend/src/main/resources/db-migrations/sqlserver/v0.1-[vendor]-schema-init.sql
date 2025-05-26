-- MSSQL Triggers to go here for automatic datetime

-- action alterations and triggers to automate creation and last motified values

ALTER TABLE [actions]
  ADD CONSTRAINT [actionCD] DEFAULT (GETUTCDATE()) FOR created_date;
GO

ALTER TABLE [actions]
  ADD CONSTRAINT [actionLMDefault] DEFAULT (GETUTCDATE()) FOR last_modified_date;
GO

CREATE TRIGGER trgActionsLM ON actions
AFTER UPDATE AS
BEGIN
UPDATE actions
SET [last_modified_date] = GETUTCDATE()
FROM [actions] a
JOIN Inserted i ON a.id = i.id
END;
GO

-- request alterations and triggers to automate creation and last motified values

ALTER TABLE [request]
  ADD CONSTRAINT [requestCD] DEFAULT (GETUTCDATE()) FOR created_date;
GO

ALTER TABLE [request]
  ADD CONSTRAINT [requestLMDefault] DEFAULT (GETUTCDATE()) FOR last_modified_date;
GO

CREATE TRIGGER trgRequestLM ON [request]
AFTER UPDATE AS
BEGIN
UPDATE [request]
SET [last_modified_date] = GETUTCDATE()
FROM [request] r
JOIN Inserted i ON r.id = i.id
END;
GO

-- user alterations and triggers to automate creation and last motified values

ALTER TABLE [user]
  ADD CONSTRAINT [userCD] DEFAULT (GETUTCDATE()) FOR created_date;
GO

ALTER TABLE [user]
  ADD CONSTRAINT [userLMDefault] DEFAULT (GETUTCDATE()) FOR last_modified_date;
GO

CREATE TRIGGER trgUserLM ON [user]
AFTER UPDATE AS
BEGIN
UPDATE [user]
SET [last_modified_date] = GETUTCDATE()
FROM [user] u
JOIN Inserted i ON u.id = i.id
END;
GO

-- profile alterations and triggers to automate creation and last motified values

ALTER TABLE [profile]
  ADD CONSTRAINT [profileCD] DEFAULT (GETUTCDATE()) FOR created_date;
GO

ALTER TABLE [profile]
  ADD CONSTRAINT [profileLMDefault] DEFAULT (GETUTCDATE()) FOR last_modified_date;
GO

CREATE TRIGGER trgProfileLM ON [profile]
AFTER UPDATE AS
BEGIN
UPDATE [profile]
SET [last_modified_date] = GETUTCDATE()
FROM [profile] p
JOIN Inserted i ON p.id = i.id
END;
GO

-- join_profile_request alterations and triggers to automate creation and last motified values

ALTER TABLE [join_profile_request]
  ADD CONSTRAINT [joinProfReqCD] DEFAULT (GETUTCDATE()) FOR created_date;
GO

ALTER TABLE [join_profile_request]
  ADD CONSTRAINT [joinProfReqLMDefault] DEFAULT (GETUTCDATE()) FOR last_modified_date;
GO

CREATE TRIGGER trgJoinProfReqLM ON [join_profile_request]
AFTER UPDATE AS
BEGIN
UPDATE [join_profile_request]
SET [last_modified_date] = GETUTCDATE()
FROM [join_profile_request] jpr
JOIN Inserted i ON jpr.id = i.id
END;
GO

-- city alterations and triggers to automate creation and last motified values

ALTER TABLE [city]
  ADD CONSTRAINT [cityCD] DEFAULT (GETUTCDATE()) FOR created_date;
GO

ALTER TABLE [city]
  ADD CONSTRAINT [cityLMDefault] DEFAULT (GETUTCDATE()) FOR last_modified_date;
GO

CREATE TRIGGER trgCityLM ON [city]
AFTER UPDATE AS
BEGIN
UPDATE [city]
SET [last_modified_date] = GETUTCDATE()
FROM [city] c
JOIN Inserted i ON c.id = i.id
END;
GO

-- education_level alterations and triggers to automate creation and last motified values

ALTER TABLE [education_level]
  ADD CONSTRAINT [eduLvlCD] DEFAULT (GETUTCDATE()) FOR created_date;
GO

ALTER TABLE [education_level]
  ADD CONSTRAINT [eduLvlLMDefault] DEFAULT (GETUTCDATE()) FOR last_modified_date;
GO

CREATE TRIGGER trgEduLvlLM ON [education_level]
AFTER UPDATE AS
BEGIN
UPDATE [education_level]
SET [last_modified_date] = GETUTCDATE()
FROM [education_level] el
JOIN Inserted i ON el.id = i.id
END;
GO

-- group alterations and triggers to automate creation and last motified values

ALTER TABLE [group]
  ADD CONSTRAINT [groupCD] DEFAULT (GETUTCDATE()) FOR created_date;
GO

ALTER TABLE [group]
  ADD CONSTRAINT [groupLMDefault] DEFAULT (GETUTCDATE()) FOR last_modified_date;
GO

CREATE TRIGGER trgGroupLM ON [group]
AFTER UPDATE AS
BEGIN
UPDATE [group]
SET [last_modified_date] = GETUTCDATE()
FROM [group] g
JOIN Inserted i ON g.id = i.id
END;
GO

-- lang_equivalents alterations and triggers to automate creation and last motified values

ALTER TABLE [lang_equivalents]
  ADD CONSTRAINT [langEqivCD] DEFAULT (GETUTCDATE()) FOR created_date;
GO

ALTER TABLE [lang_equivalents]
  ADD CONSTRAINT [langEquivLMDefault] DEFAULT (GETUTCDATE()) FOR last_modified_date;
GO

CREATE TRIGGER trgLangEquivLM ON [lang_equivalents]
AFTER UPDATE AS
BEGIN
UPDATE [lang_equivalents]
SET [last_modified_date] = GETUTCDATE()
FROM [lang_equivalents] le
JOIN Inserted i ON le.id = i.id
END;
GO

-- level alterations and triggers to automate creation and last motified values

ALTER TABLE [level]
  ADD CONSTRAINT [levelReqCD] DEFAULT (GETUTCDATE()) FOR created_date;
GO

ALTER TABLE [level]
  ADD CONSTRAINT [levelLMDefault] DEFAULT (GETUTCDATE()) FOR last_modified_date;
GO

CREATE TRIGGER trgLevelLM ON [level]
AFTER UPDATE AS
BEGIN
UPDATE [level]
SET [last_modified_date] = GETUTCDATE()
FROM [level] l
JOIN Inserted i ON l.id = i.id
END;
GO

-- province_territory alterations and triggers to automate creation and last motified values

ALTER TABLE [province_territory]
  ADD CONSTRAINT [ptCD] DEFAULT (GETUTCDATE()) FOR created_date;
GO

ALTER TABLE [province_territory]
  ADD CONSTRAINT [ptLMDefault] DEFAULT (GETUTCDATE()) FOR last_modified_date;
GO

CREATE TRIGGER trgProvTerLM ON [province_territory]
AFTER UPDATE AS
BEGIN
UPDATE [province_territory]
SET [last_modified_date] = GETUTCDATE()
FROM [province_territory] pt
JOIN Inserted i ON pt.id = i.id
END;
GO

-- request_status alterations and triggers to automate creation and last motified values

ALTER TABLE [request_status]
  ADD CONSTRAINT [reqStatCD] DEFAULT (GETUTCDATE()) FOR created_date;
GO

ALTER TABLE [request_status]
  ADD CONSTRAINT [reqStatLMDefault] DEFAULT (GETUTCDATE()) FOR last_modified_date;
GO

CREATE TRIGGER trgReqStatLM ON [request_status]
AFTER UPDATE AS
BEGIN
UPDATE [request_status]
SET [last_modified_date] = GETUTCDATE()
FROM [request_status] rs
JOIN Inserted i ON rs.id = i.id
END;
GO

-- security_clearance alterations and triggers to automate creation and last motified values

ALTER TABLE [security_clearance]
  ADD CONSTRAINT [secClearCD] DEFAULT (GETUTCDATE()) FOR created_date;
GO

ALTER TABLE [security_clearance]
  ADD CONSTRAINT [secClearLMDefault] DEFAULT (GETUTCDATE()) FOR last_modified_date;
GO

CREATE TRIGGER trgSecCLearLM ON [security_clearance]
AFTER UPDATE AS
BEGIN
UPDATE [security_clearance]
SET [last_modified_date] = GETUTCDATE()
FROM [security_clearance] sc
JOIN Inserted i ON sc.id = i.id
END;
GO

-- timezone alterations and triggers to automate creation and last motified values

ALTER TABLE [timezone]
  ADD CONSTRAINT [tzReqCD] DEFAULT (GETUTCDATE()) FOR created_date;
GO

ALTER TABLE [timezone]
  ADD CONSTRAINT [tzLMDefault] DEFAULT (GETUTCDATE()) FOR last_modified_date;
GO

CREATE TRIGGER trgTZLM ON [timezone]
AFTER UPDATE AS
BEGIN
UPDATE [timezone]
SET [last_modified_date] = GETUTCDATE()
FROM [timezone] tz
JOIN Inserted i ON tz.id = i.id
END;
GO

-- title alterations and triggers to automate creation and last motified values

ALTER TABLE [title]
  ADD CONSTRAINT [titleCD] DEFAULT (GETUTCDATE()) FOR created_date;
GO

ALTER TABLE [title]
  ADD CONSTRAINT [titleLMDefault] DEFAULT (GETUTCDATE()) FOR last_modified_date;
GO

CREATE TRIGGER trgTitleLM ON [title]
AFTER UPDATE AS
BEGIN
UPDATE [title]
SET [last_modified_date] = GETUTCDATE()
FROM [title] t
JOIN Inserted i ON t.id = i.id
END;
GO

-- wfa_status alterations and triggers to automate creation and last motified values

ALTER TABLE [wfa_status]
  ADD CONSTRAINT [wfaStatCD] DEFAULT (GETUTCDATE()) FOR created_date;
GO

ALTER TABLE [wfa_status]
  ADD CONSTRAINT [wfaStatLMDefault] DEFAULT (GETUTCDATE()) FOR last_modified_date;
GO

CREATE TRIGGER trgWFAStatLM ON [wfa_status]
AFTER UPDATE AS
BEGIN
UPDATE [wfa_status]
SET [last_modified_date] = GETUTCDATE()
FROM [wfa_status] ws
JOIN Inserted i ON ws.id = i.id
END;
GO

-- location alterations to automate creation and last motified values

ALTER TABLE [location]
  ADD CONSTRAINT [locCD] DEFAULT (GETUTCDATE()) FOR created_date;
GO

ALTER TABLE [location]
  ADD CONSTRAINT [locLMDefault] DEFAULT (GETUTCDATE()) FOR last_modified_date;
GO

CREATE TRIGGER trgLocLM ON [location]
AFTER UPDATE AS
BEGIN
UPDATE [location]
SET [last_modified_date] = GETUTCDATE()
FROM [location] l
JOIN Inserted i ON l.id = i.id
END;
GO
