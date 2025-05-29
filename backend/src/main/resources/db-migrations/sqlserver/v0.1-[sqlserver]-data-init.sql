SET IDENTITY_INSERT [user] ON;

INSERT INTO [user]
  ([id], [name], [created_by], [created_date], [last_modified_by], [last_modified_date])
VALUES
  ('1', 'John Doe', 'flyway-community-edition', CURRENT_TIMESTAMP, 'flyway-community-edition', CURRENT_TIMESTAMP),
  ('2', 'Jane Doe', 'flyway-community-edition', CURRENT_TIMESTAMP, 'flyway-community-edition', CURRENT_TIMESTAMP),
  ('3', 'Mike Smith', 'flyway-community-edition', CURRENT_TIMESTAMP, 'flyway-community-edition', CURRENT_TIMESTAMP),
  ('4', 'Shawn Burg', 'flyway-community-edition', CURRENT_TIMESTAMP, 'flyway-community-edition', CURRENT_TIMESTAMP);

SET IDENTITY_INSERT [user] OFF;