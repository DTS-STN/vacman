-- MSSQL Triggers to go here for automatic datetime
-- action triggers

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

-- request triggers
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

-- user triggers
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

-- profile triggers
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

-- join_profile_request triggers
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
