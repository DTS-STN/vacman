-- view_users_simplified, for human legible data to query.
-- The simplified variants return id's only for other views

CREATE VIEW view_users_simplified AS
SELECT
  n.[value] AS name,
  e.[address] AS email,
  l.[name] AS lang_pref,
  p.[number] AS work_phone,
  u.[uuid],
  u.[network_id] 
FROM 
  [user] u 
JOIN [name] n ON u.fk_name_id = n.id 
JOIN [email] e ON u.fk_email_id = e.id 
JOIN [lang_pref] l ON u.fk_lang_pref_id = l.id 
JOIN [phone] p ON u.fk_phone_id = p.id;

-- view_profile_simplified, for human legible data to query.
-- The simplified variants return id's only for other views

CREATE VIEW view_profile_simplified AS
SELECT
  p.[id],
  l.[name] AS location,
  c.[name] AS city,
  pt.[name] AS province_territory,
  ti.[name] AS timezone,
  ti.[gm_diff] AS timezone_gm_diff,
  g.[name] AS [group],
  l2.[name] AS [level],
  sc.[name] AS security_clearance,
  ws.[name] AS wfa_status,
  el.[name] AS education_level,
  u.[id] AS user_id,
  e.[address] AS personal_email_address,
  p2.[number] AS personal_phone_number,
  le.[name] AS language_equivalent,
  [hr_advisor].id AS hr_advisor_id,
  created_by.[id] AS created_by,
  created_by.[uuid] AS created_by_uuid,
  created_by.[network_id] AS created_by_net_id,
  p.[created_date],
  last_modified_by.[id] AS last_modified_by,
  last_modified_by.[uuid] AS last_mod_by_uuid,
  last_modified_by.[network_id] AS last_mod_by_net_id,
  p.[last_modified_date] 
FROM [profile] p 
JOIN [location] l ON p.fk_work_location_id = l.id
JOIN [city] c ON l.fk_city_id = c.id 
JOIN [province_territory] pt ON l.fk_province_territory_id = pt.id 
JOIN [timezone] ti ON l.fk_timezone_id = ti.id
JOIN [group] g ON p.fk_substantive_group_id  = g.id 
JOIN [level] l2 ON p.fk_substantive_level_id = l2.id 
JOIN [security_clearance] sc ON p.fk_security_clearance_id = sc.id 
JOIN [wfa_status] ws ON p.fk_wfa_status_id = ws.id 
JOIN [education_level] el ON p.fk_education_level = el.id 
JOIN [user] AS u ON p.fk_user_id = u.id 
JOIN [email] e ON p.fk_personal_email_id = e.id 
JOIN [phone] p2 ON p.fk_personal_phone_id = p2.id 
JOIN [user] AS hr_advisor ON p.fk_hr_advisor_id = hr_advisor.id
JOIN [lang_equivalents] le ON p.fk_lang_equivalents_id = le.id 
JOIN [user] AS created_by ON p.created_by = created_by.id 
JOIN [user] AS last_modified_by ON p.last_modified_by = last_modified_by.id;

-- view_profile_expanded, for human legible data to query.
-- The the expanded variants allow for querying any data
-- in tables connected to the primary, in this case, profile

CREATE VIEW view_profile_expanded AS
SELECT
  p.[id],
  l.[name] AS location,
  c.[name] AS city,
  pt.[name] AS province_territory,
  ti.[name] AS timezone,
  ti.[gm_diff] AS timezone_gm_diff,
  g.[name] AS [group],
  l2.[name] AS [level],
  sc.[name] AS security_clearance,
  ws.[name] AS wfa_status,
  el.[name] AS education_level,
  u.[id]  AS user_id,
  e.[address] AS email_address,
  p2.[number] AS phone_number,
  le.[name] AS language_equivalent,
  hr_advisor.[id] AS hr_advisor_id,
  hrn.[value] AS hr_advisor_name,
  hre.[address] AS hr_advisor_email,
  hrl.[name] AS hr_advisor_lang_pref,
  hrp.[number] AS hr_advisor_work_phone,
  hr_advisor.[uuid] AS hr_advisor_uuid,
  hr_advisor.[network_id] AS hr_advisor_net_id,
  created_by.[id] AS created_by_id,
  cbn.[value] AS created_by_name,
  cbe.[address] AS created_by_email,
  cbl.[name] AS created_by_lang_pref,
  cbp.[number] AS created_by_work_phone,
  created_by.[uuid] AS created_by_uuid,
  created_by.[network_id] AS created_by_net_id,
  p.[created_date],
  last_modified_by.[id] AS last_modified_by,
  lmn.[value] AS last_mod_by_name,
  lme.[address] AS last_mod_by_email,
  lml.[name] AS last_mod_by_lang_pref,
  lmp.[number] AS last_mod_by_work_phone,
  last_modified_by.[uuid] AS last_mod_by_uuid,
  last_modified_by.[network_id] AS last_mod_by_net_id,
  p.[last_modified_date] 
FROM [profile] p 
JOIN [location] l ON p.fk_work_location_id = l.id
JOIN [city] c ON l.fk_city_id = c.id 
JOIN [province_territory] pt ON l.fk_province_territory_id = pt.id 
JOIN [timezone] ti ON l.fk_timezone_id = ti.id
JOIN [group] g ON p.fk_substantive_group_id  = g.id 
JOIN [level] l2 ON p.fk_substantive_level_id = l2.id 
JOIN [security_clearance] sc ON p.fk_security_clearance_id = sc.id 
JOIN [wfa_status] ws ON p.fk_wfa_status_id = ws.id 
JOIN [education_level] el ON p.fk_education_level = el.id 
JOIN [user] AS u ON p.fk_user_id = u.id 
JOIN [email] e ON p.fk_personal_email_id = e.id 
JOIN [phone] p2 ON p.fk_personal_phone_id = p2.id 
JOIN [user] AS hr_advisor ON p.fk_hr_advisor_id = hr_advisor.id
JOIN [name] hrn ON hr_advisor.fk_name_id = hrn.id 
JOIN [email] hre ON hr_advisor.fk_email_id = hre.id 
JOIN [lang_pref] hrl ON hr_advisor.fk_lang_pref_id = hrl.id 
JOIN [phone] hrp ON hr_advisor.fk_phone_id = hrp.id
JOIN [lang_equivalents] le ON p.fk_lang_equivalents_id = le.id 
JOIN [user] AS created_by ON p.created_by = created_by.id
JOIN [name] cbn ON created_by.fk_name_id = cbn.id 
JOIN [email] cbe ON created_by.fk_email_id = cbe.id 
JOIN [lang_pref] cbl ON created_by.fk_lang_pref_id = cbl.id 
JOIN [phone] cbp ON created_by.fk_phone_id = cbp.id
JOIN [user] AS last_modified_by ON p.last_modified_by = last_modified_by.id
JOIN [name] lmn ON last_modified_by.fk_name_id = lmn.id 
JOIN [email] lme ON last_modified_by.fk_email_id = lme.id 
JOIN [lang_pref] lml ON last_modified_by.fk_lang_pref_id = lml.id 
JOIN [phone] lmp ON last_modified_by.fk_phone_id = lmp.id;

-- view_request_simplified, for human legible data to query.
-- The simplified variants return id's only for other views

CREATE VIEW view_request_simplified AS
SELECT
  r.[id],
  t.[name] AS title,
  l.[name] AS location,
  c.[name]  AS city,
  pt.[name]  AS province_territory,
  ti.[name]  AS timezone,
  ti.[gm_diff] AS timezone_gm_diff,
  g.[name] AS [group],
  l2.[name] AS [level],
  sc.[name] AS security_clearance,
  el.[name] AS education_level,
  le.[name] AS language_equivalent,
  created_by.[id] AS created_by,
  created_by.[uuid] AS created_by_uuid,
  created_by.[network_id] AS created_by_net_id,
  r.[created_date],
  last_modified_by.[id] AS last_modified_by,
  last_modified_by.[uuid] AS last_mod_by_uuid,
  last_modified_by.[network_id] AS last_mod_by_net_id,
  r.[last_modified_date] 
FROM [request] r 
JOIN [title] t ON r.fk_title_id = t.id 
JOIN [location] l ON r.fk_location_id = l.id 
JOIN [city] c ON l.fk_city_id = c.id 
JOIN [province_territory] pt ON l.fk_province_territory_id = pt.id 
JOIN [timezone] ti ON l.fk_timezone_id = ti.id 
JOIN [group] g ON r.fk_group_id = g.id 
JOIN [level] l2 ON r.fk_level_id = l2.id 
JOIN [security_clearance] sc ON r.fk_security_clearance_id = sc.id
JOIN [education_level] el ON r.fk_education_req_id = el.id 
JOIN [lang_pref] lp ON r.fk_language_profile_id = lp.id 
JOIN [lang_equivalents] le ON r.fk_lang_equivalent_id = le.id 
JOIN [user] AS created_by ON r.created_by = created_by.id
JOIN [user] AS last_modified_by ON r.last_modified_by = last_modified_by.id;

-- view_request_expanded, for human legible data to query.
-- The the expanded variants allow for querying any data
-- in tables connected to the primary, in this case, request

CREATE VIEW view_request_expanded AS
SELECT
  r.[id],
  t.[name] AS title,
  l.[name] AS location,
  c.[name] AS city,
  pt.[name] AS province_territory,
  ti.[name] AS timezone,
  ti.[gm_diff] AS timezone_gm_diff,
  g.[name] AS [group],
  l2.[name] AS [level],
  sc.[name] AS security_clearance,
  el.[name] AS education_level,
  le.[name] AS language_equivalent,
  created_by.[id] AS created_by,
  cbn.[value] AS created_by_name,
  cbe.[address] AS created_by_email,
  cbl.[name] AS created_by_lang_pref,
  cbp.[number] AS created_by_work_phone,
  created_by.[uuid] AS created_by_uuid,
  created_by.[network_id] AS created_by_net_id,
  r.[created_date],
  last_modified_by.[id] AS last_modified_by,
  lmn.[value] AS last_mod_by_name,
  lme.[address] AS last_mod_by_email,
  lml.[name] AS last_mod_by_lang_pref,
  lmp.[number] AS last_mod_by_work_phone,
  last_modified_by.[uuid] AS last_mod_by_uuid,
  last_modified_by.[network_id] AS last_mod_by_net_id,
  r.[last_modified_date] 
FROM [request] r 
JOIN [title] t ON r.fk_title_id = t.id 
JOIN [location] l ON r.fk_location_id = l.id 
JOIN [city] c ON l.fk_city_id = c.id 
JOIN [province_territory] pt ON l.fk_province_territory_id = pt.id 
JOIN [timezone] ti ON l.fk_timezone_id = ti.id 
JOIN [group] g ON r.fk_group_id = g.id 
JOIN [level] l2 ON r.fk_level_id = l2.id 
JOIN [security_clearance] sc ON r.fk_security_clearance_id = sc.id
JOIN [education_level] el ON r.fk_education_req_id = el.id 
JOIN [lang_pref] lp ON r.fk_language_profile_id = lp.id 
JOIN [lang_equivalents] le ON r.fk_lang_equivalent_id = le.id
JOIN [user] AS created_by ON r.created_by = created_by.id
JOIN [name] cbn ON created_by.fk_name_id = cbn.id 
JOIN [email] cbe ON created_by.fk_email_id = cbe.id 
JOIN [lang_pref] cbl ON created_by.fk_lang_pref_id = cbl.id 
JOIN [phone] cbp ON created_by.fk_phone_id = cbp.id
JOIN [user] AS last_modified_by ON r.last_modified_by = last_modified_by.id
JOIN [name] lmn ON last_modified_by.fk_name_id = lmn.id 
JOIN [email] lme ON last_modified_by.fk_email_id = lme.id 
JOIN [lang_pref] lml ON last_modified_by.fk_lang_pref_id = lml.id 
JOIN [phone] lmp ON last_modified_by.fk_phone_id = lmp.id;

-- view_profile_request_simplified, for human legible data to query.
-- The simplified variants return id's only for other views

CREATE VIEW view_profile_request_simplified AS
SELECT 
  jpr.[id],
  r.[id] AS request_id,
  p.[id] AS profile_id,
  p.[fk_user_id] AS user_id,
  rs.[name] AS status,
  a.[free_text],
  a.[feedback],
  a.[assessment_result],
  created_by.[id] AS created_by_id,
  created_by.[uuid] AS created_by_uuid,
  created_by.[network_id] AS created_by_net_id,
  jpr.[created_date],
  last_modified_by.[id] AS last_modified_by_id,
  last_modified_by.[uuid] AS last_mod_by_uuid,
  last_modified_by.[network_id] AS last_mod_by_net_id,
  jpr.[last_modified_date] 
FROM
  [join_profile_request] jpr 
JOIN [request] r ON jpr.fk_request_id = r.id 
JOIN [profile] p ON jpr.fk_profile_id = p.id 
JOIN [request_status] rs ON jpr.fk_request_status_id = rs.id 
JOIN [actions] a ON jpr.fk_actions_id = a.id
JOIN [user] AS created_by ON jpr.created_by = created_by.id 
JOIN [user] AS last_modified_by ON jpr.last_modified_by = last_modified_by.id;

-- view_profile_request_expanded, for human legible data to query.
-- The the expanded variants allow for querying any data
-- in tables connected to the primary, in this case, the table
-- that connects profile, and request

CREATE VIEW view_profile_request_expanded AS
SELECT 
  jpr.[id],
  r.[id] AS request_id,
  rt.[name] AS req_title,
  rl.[name] AS req_location,
  rc.[name] AS req_city,
  rpt.[name] AS req_province_territory,
  rti.[name] AS req_timezone,
  rti.[gm_diff] AS req_timezone_gm_diff,
  rg.[name] AS [req_group],
  rl2.[name] AS [req_level],
  rsc.[name] AS req_security_clearance,
  rel.[name] AS req_education_level,
  rle.[name] AS req_language_equivalent,
  rcreated_by.[id] AS req_created_by,
  rcbn.[value] AS req_created_by_name,
  rcbe.[address] AS req_created_by_email,
  rcbl.[name] AS req_created_by_lang_pref,
  rcbp.[number] AS req_created_by_work_phone,
  rcreated_by.[uuid] AS req_created_by_uuid,
  rcreated_by.[network_id] AS req_created_by_net_id,
  r.[created_date] AS req_created_date,
  rlast_modified_by.[id] AS req_last_modified_by,
  rlmn.[value] AS req_last_mod_by_name,
  rlme.[address] AS req_last_mod_by_email,
  rlml.[name] AS req_last_mod_by_lang_pref,
  rlmp.[number] AS req_last_mod_by_work_phone,
  rlast_modified_by.[uuid] AS req_last_mod_by_uuid,
  rlast_modified_by.[network_id] AS req_last_mod_by_net_id,
  r.[last_modified_date] AS req_last_modified_date,
  p.[id] AS profile_id,
  pl.[name] AS prof_location,
  pc.[name]  AS prof_city,
  ppt.[name]  AS prof_province_territory,
  pti.[name]  AS prof_timezone,
  pti.[gm_diff] AS prof_timezone_gm_diff,
  pg.[name] AS prof_group,
  pl2.[name] AS prof_level,
  psc.[name] AS prof_security_clearance,
  pws.[name] AS prof_wfa_status,
  pel.[name] AS prof_education_level,
  puser.[id]  AS prof_user_id,
  pe.[address] AS prof_email_address,
  pp2.[number] AS prof_phone_number,
  ple.[name] AS prof_language_equivalent,
  phr_advisor.[id] AS hr_advisor_id,
  phrn.[value] AS hr_advisor_name,
  phre.[address] AS hr_advisor_email,
  phrl.[name] AS hr_advisor_lang_pref,
  phrp.[number] AS hr_advisor_work_phone,
  phr_advisor.[uuid] AS hr_advisor_uuid,
  phr_advisor.[network_id] AS hr_advisor_net_id,
  pcreated_by.[id] AS prof_created_by_id,
  pcbn.[value] AS prof_created_by_name,
  pcbe.[address] AS prof_created_by_email,
  pcbl.[name] AS prof_created_by_lang_pref,
  pcbp.[number] AS prof_created_by_work_phone,
  pcreated_by.[uuid] AS prof_created_by_uuid,
  pcreated_by.[network_id] AS prof_created_by_net_id,
  p.[created_date] AS prof_created_date,
  plast_modified_by.[id] AS prof_last_modified_by,
  plmn.[value] AS prof_last_mod_by_name,
  plme.[address] AS prof_last_mod_by_email,
  plml.[name] AS prof_last_mod_by_lang_pref,
  plmp.[number] AS prof_last_mod_by_work_phone,
  plast_modified_by.[uuid] AS prof_last_mod_by_uuid,
  plast_modified_by.[network_id] AS prof_last_mod_by_net_id,
  p.[last_modified_date] AS prof_last_modified_date,
  rs.[name] AS req_prof_status,
  a.[free_text],
  a.[feedback],
  a.[assessment_result] 
FROM
  [join_profile_request] jpr 
JOIN [request] r ON jpr.fk_request_id = r.id 
JOIN [title] rt ON r.fk_title_id = rt.id 
JOIN [location] rl ON r.fk_location_id = rl.id 
JOIN [city] rc ON rl.fk_city_id = rc.id 
JOIN [province_territory] rpt ON rl.fk_province_territory_id = rpt.id 
JOIN [timezone] rti ON rl.fk_timezone_id = rti.id 
JOIN [group] rg ON r.fk_group_id = rg.id 
JOIN [level] rl2 ON r.fk_level_id = rl2.id 
JOIN [security_clearance] rsc ON r.fk_security_clearance_id = rsc.id
JOIN [education_level] rel ON r.fk_education_req_id = rel.id 
JOIN [lang_pref] rlp ON r.fk_language_profile_id = rlp.id 
JOIN [lang_equivalents] rle ON r.fk_lang_equivalent_id = rle.id
JOIN [user] AS rcreated_by ON r.created_by = rcreated_by.id
JOIN [name] rcbn ON rcreated_by.fk_name_id = rcbn.id 
JOIN [email] rcbe ON rcreated_by.fk_email_id = rcbe.id 
JOIN [lang_pref] rcbl ON rcreated_by.fk_lang_pref_id = rcbl.id 
JOIN [phone] rcbp ON rcreated_by.fk_phone_id = rcbp.id
JOIN [user] AS rlast_modified_by ON r.last_modified_by = rlast_modified_by.id
JOIN [name] rlmn ON rlast_modified_by.fk_name_id = rlmn.id 
JOIN [email] rlme ON rlast_modified_by.fk_email_id = rlme.id 
JOIN [lang_pref] rlml ON rlast_modified_by.fk_lang_pref_id = rlml.id 
JOIN [phone] rlmp ON rlast_modified_by.fk_phone_id = rlmp.id
JOIN [profile] p ON jpr.fk_profile_id = p.id 
JOIN [location] pl ON p.fk_work_location_id = pl.id
JOIN [city] pc ON pl.fk_city_id = pc.id 
JOIN [province_territory] ppt ON pl.fk_province_territory_id = ppt.id 
JOIN [timezone] pti ON pl.fk_timezone_id = pti.id
JOIN [group] pg ON p.fk_substantive_group_id  = pg.id 
JOIN [level] pl2 ON p.fk_substantive_level_id = pl2.id 
JOIN [security_clearance] psc ON p.fk_security_clearance_id = psc.id 
JOIN [wfa_status] pws ON p.fk_wfa_status_id = pws.id 
JOIN [education_level] pel ON p.fk_education_level = pel.id 
JOIN [user] AS puser ON p.fk_user_id = puser.id 
JOIN [email] pe ON p.fk_personal_email_id = pe.id 
JOIN [phone] pp2 ON p.fk_personal_phone_id = pp2.id 
JOIN [user] AS phr_advisor ON p.fk_hr_advisor_id = phr_advisor.id
JOIN [name] phrn ON phr_advisor.fk_name_id = phrn.id 
JOIN [email] phre ON phr_advisor.fk_email_id = phre.id 
JOIN [lang_pref] phrl ON phr_advisor.fk_lang_pref_id = phrl.id 
JOIN [phone] phrp ON phr_advisor.fk_phone_id = phrp.id
JOIN [lang_equivalents] ple ON p.fk_lang_equivalents_id = ple.id 
JOIN [user] AS pcreated_by ON p.created_by = pcreated_by.id
JOIN [name] pcbn ON pcreated_by.fk_name_id = pcbn.id 
JOIN [email] pcbe ON pcreated_by.fk_email_id = pcbe.id 
JOIN [lang_pref] pcbl ON pcreated_by.fk_lang_pref_id = pcbl.id 
JOIN [phone] pcbp ON pcreated_by.fk_phone_id = pcbp.id
JOIN [user] AS plast_modified_by ON p.last_modified_by = plast_modified_by.id
JOIN [name] plmn ON plast_modified_by.fk_name_id = plmn.id 
JOIN [email] plme ON plast_modified_by.fk_email_id = plme.id 
JOIN [lang_pref] plml ON plast_modified_by.fk_lang_pref_id = plml.id 
JOIN [phone] plmp ON plast_modified_by.fk_phone_id = plmp.id
JOIN [request_status] rs ON jpr.fk_request_status_id = rs.id 
JOIN [actions] a ON jpr.fk_actions_id = a.id;