-- city data

SET IDENTITY_INSERT [city] ON

INSERT INTO [city]
(
  [id],
  [name],
  [created_by],
  [last_modified_by]
)
VALUES
  (1, 'City1', 1, 1),
  (2, 'City2', 1, 1),
  (3, 'City3', 1, 1),
  (4, 'City4', 1, 1),
  (5, 'City5', 1, 1);

SET IDENTITY_INSERT [city] OFF

-- education_level definition

SET IDENTITY_INSERT [education_level] ON

INSERT INTO [education_level]
(
  [id],
  [name],
  [created_by],
  [last_modified_by]
)
VALUES
  (1, 'level1', 1, 1),
  (2, 'level2', 1, 1);

SET IDENTITY_INSERT [education_level] OFF

-- group definition

SET IDENTITY_INSERT [group] ON

INSERT INTO [group]
(
  [id],
  [name],
  [created_by],
  [last_modified_by]
)
VALUES
  (1, 'group1', 1, 1),
  (2, 'group2', 1, 1),
  (3, 'group3', 1, 1),
  (4, 'group4', 1, 1),
  (5, 'group5', 1, 1);

SET IDENTITY_INSERT [group] OFF

-- lang_equivalents definition

SET IDENTITY_INSERT [lang_equivalents] ON


INSERT INTO [lang_equivalents]
(
  [id],
  [name],
  [created_by],
  [last_modified_by]
)
VALUES
  (1, 'xx-xx, xx-xx, xx-xx', 1, 1),
  (2, 'yy-yy, yy-yy, yy-yy', 1, 1),
  (3, 'zz-zz, zz-zz, zz-zz', 1, 1),
  (4, 'aa-aa, aa-aa, aa-aa', 1, 1),
  (5, 'bb-bb, bb-bb, bb-bb', 1, 1);

SET IDENTITY_INSERT [lang_equivalents] OFF

-- level definition

SET IDENTITY_INSERT [level] ON

INSERT INTO [level]
(
  [id],
  [name],
  [created_by],
  [last_modified_by]
)
VALUES
  (1, '01', 1, 1),
  (2, '02', 1, 1),
  (3, '03', 1, 1),
  (4, '04', 1, 1),
  (5, '05', 1, 1);

SET IDENTITY_INSERT [level] OFF

-- province_territory definition

SET IDENTITY_INSERT [province_territory] ON

INSERT INTO [province_territory]
(
  [id],
  [name],
  [created_by],
  [last_modified_by]
)
VALUES
  (1, 'AB', 1, 1),
  (2, 'BC', 1, 1),
  (3, 'MB', 1, 1),
  (4, 'NB', 1, 1),
  (5, 'NL', 1, 1),
  (6, 'NT', 1, 1),
  (7, 'NS', 1, 1),
  (8, 'NU', 1, 1),
  (9, 'ON', 1, 1),
  (10, 'PE', 1, 1),
  (11, 'QC', 1, 1),
  (12, 'SK', 1, 1),
  (13, 'YT', 1, 1);

SET IDENTITY_INSERT [province_territory] OFF

-- region definition

SET IDENTITY_INSERT [region] ON

INSERT INTO [region]
(
  [id],
  [created_by],
  [last_modified_by]
)
VALUES
  (1, 1, 1),
  (2, 1, 1),
  (3, 1, 1),
  (4, 1, 1),
  (5, 1, 1);

SET IDENTITY_INSERT [region] OFF

-- request_status definition

SET IDENTITY_INSERT [request_status] ON

INSERT INTO [request_status]
(
  [id],
  [name],
  [created_by],
  [last_modified_by]
)
VALUES
  (1, 'status1', 1, 1),
  (2, 'status2', 1, 1),
  (3, 'status3', 1, 1),
  (4, 'status4', 1, 1),
  (5, 'status5', 1, 1);

SET IDENTITY_INSERT [request_status] OFF

-- security_clearance definition

SET IDENTITY_INSERT [security_clearance] ON

INSERT INTO [security_clearance]
(
  [id],
  [name],
  [created_by],
  [last_modified_by]
)
VALUES
  (1, 'clearance1', 1, 1),
  (2, 'clearance2', 1, 1),
  (3, 'clearance3', 1, 1),
  (4, 'clearance4', 1, 1),
  (5, 'clearance5', 1, 1);

SET IDENTITY_INSERT [security_clearance] OFF

-- timezone definition

SET IDENTITY_INSERT [timezone] ON

INSERT INTO [timezone]
(
  [id],
  [name],
  [gm_diff],
  [created_by],
  [last_modified_by]
)
VALUES
  (1, 'PDT', -7, 1, 1),
  (2, 'MDT', -6, 1, 1),
  (3, 'CDT', -5, 1, 1),
  (4, 'EDT', -4, 1, 1),
  (5, 'ADT', -3, 1, 1),
  (6, 'NDT', -2.5, 1, 1);

SET IDENTITY_INSERT [timezone] OFF

-- wfa_status definition

SET IDENTITY_INSERT [wfa_status] ON

INSERT INTO [wfa_status]
(
  [id],
  [name],
  [created_by],
  [last_modified_by]
)
VALUES
  (1, 'wfa status 1', 1, 1),
  (2, 'wfa status 2', 1, 1),
  (3, 'wfa status 3', 1, 1),
  (4, 'wfa status 4', 1, 1),
  (5, 'wfa status 5', 1, 1);

SET IDENTITY_INSERT [wfa_status] OFF

-- location definition

SET IDENTITY_INSERT [location] ON

INSERT INTO [location]
(
  [id],
  [name],
  [fk_province_territory_id],
  [fk_city_id],
  [fk_timezone_id],
  [created_by],
  [last_modified_by]
)
VALUES
  (1, 'location 1', 1, 1, 2, 1, 1),
  (2, 'location 2', 2, 2, 1, 1, 1),
  (3, 'location 3', 1, 4, 6, 1, 1),
  (4, 'location 4', 4, 3, 2, 1, 1),
  (5, 'location 5', 5, 1, 3, 1, 1);

SET IDENTITY_INSERT [location] OFF
