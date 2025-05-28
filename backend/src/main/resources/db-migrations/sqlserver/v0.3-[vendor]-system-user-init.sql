-- email definition

SET IDENTITY_INSERT [email] ON

INSERT INTO [email]
(
  [id],
  [address]
)
VALUES
  (1, 'system@example.org');

SET IDENTITY_INSERT [email] OFF

-- name definition

SET IDENTITY_INSERT [name] ON

INSERT INTO [name]
(
  [id],
  [value]
)
VALUES
  (1, 'system');

SET IDENTITY_INSERT [name] OFF

-- phone definition

SET IDENTITY_INSERT [phone] ON

INSERT INTO [phone]
(
  [id],
  [number]
)
VALUES
  (1, '000000000000');

SET IDENTITY_INSERT [phone] OFF

-- lang definition

SET IDENTITY_INSERT [lang_pref] ON

INSERT INTO [lang_pref]
(
  [id],
  [name]
)
VALUES
  (1, 'EN'),
  (2, 'FR') ,
  (3, 'Bilingual');

SET IDENTITY_INSERT [lang_pref] OFF

-- user definition

SET IDENTITY_INSERT [user] ON

INSERT INTO [user]
(
  [id],
  [fk_name_id],
  [fk_email_id],
  [fk_lang_pref_id],
  [fk_phone_id],
  [uuid],
  [network_id],
  [created_by],
  [last_modified_by]
)
VALUES
  (1, 1, 1, 3, 1, '0', 'system', 1, 1);

SET IDENTITY_INSERT [user] OFF
