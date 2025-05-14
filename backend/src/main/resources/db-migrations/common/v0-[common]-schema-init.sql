CREATE TABLE [user]
(
  [id] VARCHAR(64) NOT NULL,
  [name] NVARCHAR(256) NOT NULL,

  -- audit fields
  [created_by] NVARCHAR(64) NOT NULL,
  [created_date] DATETIME2 NOT NULL,
  [last_modified_by] NVARCHAR(64),
  [last_modified_date] DATETIME2,

  CONSTRAINT [pk_user] PRIMARY KEY ([id])
);

CREATE INDEX [ix_uname] ON [user]([name]);
