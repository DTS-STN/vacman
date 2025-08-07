--liquibase formatted sql

--changeset system:cd_province_territory_on context:mssql
SET IDENTITY_INSERT CD_PROVINCE_TERRITORY ON;

--changeset system:cd_province_territory
INSERT INTO [CD_PROVINCE_TERRITORY] ([ID], [CODE], [NAME_EN], [NAME_FR], [EFFECTIVE_DATE], [USER_CREATED], [DATE_CREATED], [USER_UPDATED], [DATE_UPDATED])
VALUES (0, 'ON', 'Ontario', 'Ontario', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(1, 'QC', 'Quebec', 'Québec', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(2, 'BC', 'British Columbia', 'Colombie-Britannique', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(3, 'AB', 'Alberta', 'Alberta', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(4, 'MB', 'Manitoba', 'Manitoba', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(5, 'NB', 'New Brunswick', 'Nouveau-Brunswick', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(6, 'NL', 'Newfoundland and Labrador', 'Terre-Neuve et Labrador', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(7, 'NT', 'Northwest Territories', 'Territoires du Nord-Ouest', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(8, 'NS', 'Nova Scotia', 'Nouvelle-Écosse', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(9, 'NU', 'Nunavut', 'Nunavut', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(10, 'PE', 'Prince Edward Island', 'Île-du-Prince-Édouard', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(11, 'SK', 'Saskatchewan', 'Saskatchewan', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(12, 'YT', 'Yukon', 'Yukon', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP);

--changeset system:cd_province_territory_off context:mssql
SET IDENTITY_INSERT CD_PROVINCE_TERRITORY OFF;

--changeset system:cd_city_on context:mssql
SET IDENTITY_INSERT CD_CITY ON;

--changeset system:cd_city
INSERT INTO [CD_CITY] ([ID], [CODE], [NAME_EN], [NAME_FR], [EFFECTIVE_DATE], [PROVINCE_TERRITORY_ID], [USER_CREATED], [DATE_CREATED], [USER_UPDATED], [DATE_UPDATED])
VALUES (0, 'AB1', 'Brooks', 'Brooks', '1970-01-01 00:00:00', 3, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(1, 'AB2', 'Calgary', 'Calgary', '1970-01-01 00:00:00', 3, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(2, 'AB3', 'Camrose', 'Camrose', '1970-01-01 00:00:00', 3, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(3, 'AB4', 'Edmonton', 'Edmonton', '1970-01-01 00:00:00', 3, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(4, 'AB5', 'Edson', 'Edson', '1970-01-01 00:00:00', 3, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(5, 'AB6', 'Fort McMurray', 'Fort McMurray', '1970-01-01 00:00:00', 3, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(6, 'AB7', 'Grande Prairie', 'Grande Prairie', '1970-01-01 00:00:00', 3, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(7, 'AB8', 'Lethbridge', 'Lethbridge', '1970-01-01 00:00:00', 3, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(8, 'AB9', 'Lloydminster', 'Lloydminster', '1970-01-01 00:00:00', 3, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(9, 'AB10', 'Medicine Hat', 'Medicine Hat', '1970-01-01 00:00:00', 3, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(10, 'AB11', 'Red Deer', 'Red Deer', '1970-01-01 00:00:00', 3, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(11, 'AB12', 'Slave Lake', 'Slave Lake', '1970-01-01 00:00:00', 3, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(12, 'AB13', 'St. Paul', 'St. Paul', '1970-01-01 00:00:00', 3, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(13, 'BC1', 'Abbotsford', 'Abbotsford', '1970-01-01 00:00:00', 2, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(14, 'BC2', 'Burnaby', 'Burnaby', '1970-01-01 00:00:00', 2, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(15, 'BC3', 'Campbell River', 'Campbell River', '1970-01-01 00:00:00', 2, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(16, 'BC4', 'Chilliwack', 'Chilliwack', '1970-01-01 00:00:00', 2, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(17, 'BC5', 'Coquitlam', 'Coquitlam', '1970-01-01 00:00:00', 2, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(18, 'BC6', 'Courtenay', 'Courtenay', '1970-01-01 00:00:00', 2, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(19, 'BC7', 'Cranbrook', 'Cranbrook', '1970-01-01 00:00:00', 2, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(20, 'BC8', 'Dawson Creek', 'Dawson Creek', '1970-01-01 00:00:00', 2, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(21, 'BC9', 'Duncan', 'Duncan', '1970-01-01 00:00:00', 2, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(22, 'BC10', 'Kamloops', 'Kamloops', '1970-01-01 00:00:00', 2, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(23, 'BC11', 'Kelowna', 'Kelowna', '1970-01-01 00:00:00', 2, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(24, 'BC12', 'Langley', 'Langley', '1970-01-01 00:00:00', 2, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(25, 'BC13', 'Maple Ridge', 'Maple Ridge', '1970-01-01 00:00:00', 2, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(26, 'BC14', 'Nanaimo', 'Nanaimo', '1970-01-01 00:00:00', 2, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(27, 'BC15', 'Nelson', 'Nelson', '1970-01-01 00:00:00', 2, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(28, 'BC16', 'New Westminster', 'New Westminster', '1970-01-01 00:00:00', 2, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(29, 'BC17', 'North Vancouver', 'North Vancouver', '1970-01-01 00:00:00', 2, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(30, 'BC18', 'Penticton', 'Penticton', '1970-01-01 00:00:00', 2, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(31, 'BC19', 'Port Alberni', 'Port Alberni', '1970-01-01 00:00:00', 2, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(32, 'BC20', 'Powell River', 'Powell River', '1970-01-01 00:00:00', 2, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(33, 'BC21', 'Prince George', 'Prince George', '1970-01-01 00:00:00', 2, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(34, 'BC22', 'Prince Rupert', 'Prince Rupert', '1970-01-01 00:00:00', 2, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(35, 'BC23', 'Quesnel', 'Quesnel', '1970-01-01 00:00:00', 2, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(36, 'BC24', 'Richmond', 'Richmond', '1970-01-01 00:00:00', 2, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(37, 'BC25', 'Salmon Arm', 'Salmon Arm', '1970-01-01 00:00:00', 2, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(38, 'BC26', 'Smithers', 'Smithers', '1970-01-01 00:00:00', 2, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(39, 'BC27', 'Squamish', 'Squamish', '1970-01-01 00:00:00', 2, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(40, 'BC28', 'Surrey', 'Surrey', '1970-01-01 00:00:00', 2, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(41, 'BC29', 'Surrey South', 'Surrey South', '1970-01-01 00:00:00', 2, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(42, 'BC30', 'Terrace', 'Terrace', '1970-01-01 00:00:00', 2, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(43, 'BC31', 'Trail', 'Trail', '1970-01-01 00:00:00', 2, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(44, 'BC32', 'Vancouver', 'Vancouver', '1970-01-01 00:00:00', 2, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(45, 'BC33', 'Vanderhoof', 'Vanderhoof', '1970-01-01 00:00:00', 2, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(46, 'BC34', 'Vernon', 'Vernon', '1970-01-01 00:00:00', 2, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(47, 'BC35', 'Victoria', 'Victoria', '1970-01-01 00:00:00', 2, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(48, 'BC36', 'Williams Lake', 'Williams Lake', '1970-01-01 00:00:00', 2, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(49, 'MB1', 'Brandon', 'Brandon', '1970-01-01 00:00:00', 4, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(50, 'MB2', 'Dauphin', 'Dauphin', '1970-01-01 00:00:00', 4, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(51, 'MB3', 'Flin Flon', 'Flin Flon', '1970-01-01 00:00:00', 4, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(52, 'MB4', 'Morden', 'Morden', '1970-01-01 00:00:00', 4, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(53, 'MB5', 'Notre-Dame-de-Lourdes', 'Notre-Dame-de-Lourdes', '1970-01-01 00:00:00', 4, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(54, 'MB6', 'Portage La Prairie', 'Portage La Prairie', '1970-01-01 00:00:00', 4, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(55, 'MB7', 'Selkirk', 'Selkirk', '1970-01-01 00:00:00', 4, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(56, 'MB8', 'St-Pierre-Jolys', 'St-Pierre-Jolys', '1970-01-01 00:00:00', 4, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(57, 'MB9', 'Steinbach', 'Steinbach', '1970-01-01 00:00:00', 4, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(58, 'MB10', 'Swan River', 'Swan River', '1970-01-01 00:00:00', 4, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(59, 'MB11', 'The Pas', 'The Pas', '1970-01-01 00:00:00', 4, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(60, 'MB12', 'Thompson', 'Thompson', '1970-01-01 00:00:00', 4, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(61, 'MB13', 'Winnipeg', 'Winnipeg', '1970-01-01 00:00:00', 4, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(62, 'NB1', 'Bathurst', 'Bathurst', '1970-01-01 00:00:00', 5, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(63, 'NB2', 'Campbellton', 'Campbellton', '1970-01-01 00:00:00', 5, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(64, 'NB3', 'Caraquet', 'Caraquet', '1970-01-01 00:00:00', 5, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(65, 'NB4', 'Edmundston', 'Edmundston', '1970-01-01 00:00:00', 5, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(66, 'NB5', 'Fredericton', 'Fredericton', '1970-01-01 00:00:00', 5, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(67, 'NB6', 'Grand Falls', 'Grand Falls', '1970-01-01 00:00:00', 5, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(68, 'NB7', 'Miramichi', 'Miramichi', '1970-01-01 00:00:00', 5, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(69, 'NB8', 'Moncton', 'Moncton', '1970-01-01 00:00:00', 5, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(70, 'NB9', 'Richibucto', 'Richibucto', '1970-01-01 00:00:00', 5, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(71, 'NB10', 'Saint John', 'Saint John', '1970-01-01 00:00:00', 5, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(72, 'NB11', 'Saint-Quentin', 'Saint-Quentin', '1970-01-01 00:00:00', 5, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(73, 'NB12', 'Shediac', 'Shediac', '1970-01-01 00:00:00', 5, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(74, 'NB13', 'Shippagan', 'Shippagan', '1970-01-01 00:00:00', 5, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(75, 'NB14', 'St. Stephen', 'St. Stephen', '1970-01-01 00:00:00', 5, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(76, 'NB15', 'Sussex', 'Sussex', '1970-01-01 00:00:00', 5, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(77, 'NB16', 'Tracadie-Sheila', 'Tracadie-Sheila', '1970-01-01 00:00:00', 5, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(78, 'NB17', 'Woodstock', 'Woodstock', '1970-01-01 00:00:00', 5, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(79, 'NL1', 'Clarenville', 'Clarenville', '1970-01-01 00:00:00', 6, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(80, 'NL2', 'Corner Brook', 'Corner Brook', '1970-01-01 00:00:00', 6, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(81, 'NL3', 'Gander', 'Gander', '1970-01-01 00:00:00', 6, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(82, 'NL4', 'Grand Falls-Windsor', 'Grand Falls-Windsor', '1970-01-01 00:00:00', 6, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(83, 'NL5', 'Happy Valley', 'Happy Valley', '1970-01-01 00:00:00', 6, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(84, 'NL6', 'Harbour Grace', 'Harbour Grace', '1970-01-01 00:00:00', 6, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(85, 'NL7', 'Labrador City', 'Labrador City', '1970-01-01 00:00:00', 6, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(86, 'NL8', 'Marystown', 'Marystown', '1970-01-01 00:00:00', 6, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(87, 'NL9', 'Placentia', 'Placentia', '1970-01-01 00:00:00', 6, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(88, 'NL10', 'Port aux Basques', 'Port aux Basques', '1970-01-01 00:00:00', 6, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(89, 'NL11', 'Rocky Harbour', 'Rocky Harbour', '1970-01-01 00:00:00', 6, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(90, 'NL12', 'Springdale', 'Springdale', '1970-01-01 00:00:00', 6, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(91, 'NL13', 'St Anthony', 'St Anthony', '1970-01-01 00:00:00', 6, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(92, 'NL14', 'St. John''s', 'St. John''s', '1970-01-01 00:00:00', 6, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(93, 'NL15', 'Stephenville', 'Stephenville', '1970-01-01 00:00:00', 6, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(94, 'NS1', 'Amherst', 'Amherst', '1970-01-01 00:00:00', 8, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(95, 'NS2', 'Antigonish', 'Antigonish', '1970-01-01 00:00:00', 8, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(96, 'NS3', 'Bedford', 'Bedford', '1970-01-01 00:00:00', 8, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(97, 'NS4', 'Bridgewater', 'Bridgewater', '1970-01-01 00:00:00', 8, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(98, 'NS5', 'Dartmouth', 'Dartmouth', '1970-01-01 00:00:00', 8, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(99, 'NS6', 'Digby', 'Digby', '1970-01-01 00:00:00', 8, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(100, 'NS7', 'Glace Bay', 'Glace Bay', '1970-01-01 00:00:00', 8, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(101, 'NS8', 'Guysborough', 'Guysborough', '1970-01-01 00:00:00', 8, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(102, 'NS9', 'Halifax', 'Halifax', '1970-01-01 00:00:00', 8, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(103, 'NS10', 'Inverness', 'Inverness', '1970-01-01 00:00:00', 8, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(104, 'NS11', 'Kentville', 'Kentville', '1970-01-01 00:00:00', 8, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(105, 'NS12', 'New Glasgow', 'New Glasgow', '1970-01-01 00:00:00', 8, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(106, 'NS13', 'North Sydney', 'North Sydney', '1970-01-01 00:00:00', 8, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(107, 'NS14', 'Port Hawkesbury', 'Port Hawkesbury', '1970-01-01 00:00:00', 8, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(108, 'NS15', 'Shelburne', 'Shelburne', '1970-01-01 00:00:00', 8, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(109, 'NS16', 'Sydney', 'Sydney', '1970-01-01 00:00:00', 8, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(110, 'NS17', 'Truro', 'Truro', '1970-01-01 00:00:00', 8, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(111, 'NS18', 'Windsor', 'Windsor', '1970-01-01 00:00:00', 8, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(112, 'NS19', 'Yarmouth', 'Yarmouth', '1970-01-01 00:00:00', 8, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(113, 'NT1', 'Fort Simpson', 'Fort Simpson', '1970-01-01 00:00:00', 7, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(114, 'NT2', 'Fort Smith', 'Fort Smith', '1970-01-01 00:00:00', 7, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(115, 'NT3', 'Hay River', 'Hay River', '1970-01-01 00:00:00', 7, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(116, 'NT4', 'Inuvik', 'Inuvik', '1970-01-01 00:00:00', 7, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(117, 'NT5', 'Yellowknife', 'Yellowknife', '1970-01-01 00:00:00', 7, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(118, 'NU1', 'Cambridge Bay', 'Cambridge Bay', '1970-01-01 00:00:00', 9, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(119, 'NU2', 'Iqaluit', 'Iqaluit', '1970-01-01 00:00:00', 9, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(120, 'NU3', 'Rankin Inlet', 'Rankin Inlet', '1970-01-01 00:00:00', 9, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(121, 'ON1', 'Ajax', 'Ajax', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(122, 'ON2', 'Arnprior', 'Arnprior', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(123, 'ON3', 'Bancroft', 'Bancroft', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(124, 'ON4', 'Barrie', 'Barrie', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(125, 'ON5', 'Belleville', 'Belleville', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(126, 'ON6', 'Bracebridge', 'Bracebridge', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(127, 'ON7', 'Brampton', 'Brampton', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(128, 'ON8', 'Brantford', 'Brantford', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(129, 'ON9', 'Brockville', 'Brockville', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(130, 'ON10', 'Burlington', 'Burlington', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(131, 'ON11', 'Cambridge', 'Cambridge', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(132, 'ON12', 'Carleton Place', 'Carleton Place', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(133, 'ON13', 'Chatham-Kent', 'Chatham-Kent', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(134, 'ON14', 'Cobourg', 'Cobourg', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(135, 'ON15', 'Collingwood', 'Collingwood', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(136, 'ON16', 'Cornwall', 'Cornwall', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(137, 'ON17', 'Dryden', 'Dryden', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(138, 'ON18', 'East Gwillimbury', 'East Gwillimbury', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(139, 'ON19', 'Elliot Lake', 'Elliot Lake', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(140, 'ON20', 'Espanola', 'Espanola', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(141, 'ON21', 'Fort Frances', 'Fort Frances', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(142, 'ON22', 'Gananoque', 'Gananoque', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(143, 'ON23', 'Georgetown', 'Georgetown', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(144, 'ON24', 'Geraldton', 'Geraldton', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(145, 'ON25', 'Goderich', 'Goderich', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(146, 'ON26', 'Guelph', 'Guelph', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(147, 'ON27', 'Hamilton', 'Hamilton', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(148, 'ON28', 'Hawkesbury', 'Hawkesbury', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(149, 'ON29', 'Kapuskasing', 'Kapuskasing', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(150, 'ON30', 'Kenora', 'Kenora', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(151, 'ON31', 'Kingston', 'Kingston', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(152, 'ON32', 'Kirkland Lake', 'Kirkland Lake', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(153, 'ON33', 'Kitchener', 'Kitchener', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(154, 'ON34', 'Leamington', 'Leamington', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(155, 'ON35', 'Lindsay', 'Lindsay', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(156, 'ON36', 'Listowel', 'Listowel', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(157, 'ON37', 'London', 'London', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(158, 'ON38', 'Malton', 'Malton', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(159, 'ON39', 'Marathon', 'Marathon', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(160, 'ON40', 'Markham', 'Markham', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(161, 'ON41', 'Midland', 'Midland', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(162, 'ON42', 'Milton', 'Milton', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(163, 'ON43', 'Mississauga', 'Mississauga', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(164, 'ON44', 'Napanee', 'Napanee', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(165, 'ON45', 'New Liskeard', 'New Liskeard', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(166, 'ON46', 'Niagara Falls', 'Niagara Falls', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(167, 'ON47', 'North Bay', 'North Bay', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(168, 'ON48', 'Oakville', 'Oakville', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(169, 'ON49', 'Orangeville', 'Orangeville', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(170, 'ON50', 'Orillia', 'Orillia', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(171, 'ON51', 'Oshawa', 'Oshawa', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(172, 'ON52', 'Ottawa', 'Ottawa', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(173, 'ON53', 'Owen Sound', 'Owen Sound', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(174, 'ON54', 'Parry Sound', 'Parry Sound', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(175, 'ON55', 'Pembroke', 'Pembroke', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(176, 'ON56', 'Perth', 'Perth', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(177, 'ON57', 'Peterborough', 'Peterborough', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(178, 'ON58', 'Picton', 'Picton', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(179, 'ON59', 'Renfrew', 'Renfrew', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(180, 'ON60', 'Richmond Hill', 'Richmond Hill', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(181, 'ON61', 'Sarnia', 'Sarnia', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(182, 'ON62', 'Sault Ste Marie', 'Sault Ste Marie', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(183, 'ON63', 'Simcoe', 'Simcoe', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(184, 'ON64', 'Smiths Falls', 'Smiths Falls', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(185, 'ON65', 'St. Catharines', 'St. Catharines', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(186, 'ON66', 'St. Thomas', 'St. Thomas', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(187, 'ON67', 'Stratford', 'Stratford', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(188, 'ON68', 'Sudbury', 'Sudbury', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(189, 'ON69', 'Thunder Bay', 'Thunder Bay', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(190, 'ON70', 'Tillsonburg', 'Tillsonburg', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(191, 'ON71', 'Timmins', 'Timmins', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(192, 'ON72', 'Toronto', 'Toronto', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(193, 'ON73', 'Trenton', 'Trenton', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(194, 'ON74', 'Vaughan', 'Vaughan', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(195, 'ON75', 'Walkerton', 'Walkerton', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(196, 'ON76', 'Wallaceburg', 'Wallaceburg', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(197, 'ON77', 'Windsor', 'Windsor', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(198, 'ON78', 'Wlland', 'Wlland', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(199, 'ON79', 'Woodstock', 'Woodstock', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(200, 'PE1', 'Charlottetown', 'Charlottetown', '1970-01-01 00:00:00', 10, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(201, 'PE2', 'Montague', 'Montague', '1970-01-01 00:00:00', 10, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(202, 'PE3', 'O''Leary', 'O''Leary', '1970-01-01 00:00:00', 10, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(203, 'PE4', 'Souris', 'Souris', '1970-01-01 00:00:00', 10, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(204, 'PE5', 'Summerside', 'Summerside', '1970-01-01 00:00:00', 10, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(205, 'QC1', 'Alma', 'Alma', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(206, 'QC2', 'Amos', 'Amos', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(207, 'QC3', 'Baie Comeau', 'Baie Comeau', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(208, 'QC4', 'Boucherville', 'Boucherville', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(209, 'QC5', 'Brossard', 'Brossard', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(210, 'QC6', 'Campbell''s Bay', 'Campbell''s Bay', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(211, 'QC7', 'Cap-aux-Meules', 'Cap-aux-Meules', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(212, 'QC8', 'Causapscal', 'Causapscal', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(213, 'QC9', 'Chandler', 'Chandler', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(214, 'QC10', 'Châteauguay', 'Châteauguay', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(215, 'QC11', 'Chibougamau', 'Chibougamau', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(216, 'QC12', 'Chicoutimi', 'Chicoutimi', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(217, 'QC13', 'Chisasibi', 'Chisasibi', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(218, 'QC14', 'Coaticook', 'Coaticook', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(219, 'QC15', 'Cowansville', 'Cowansville', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(220, 'QC16', 'Dolbeau-Mistassini', 'Dolbeau-Mistassini', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(221, 'QC17', 'Donnacona', 'Donnacona', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(222, 'QC18', 'Drummondville', 'Drummondville', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(223, 'QC19', 'Forestville', 'Forestville', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(224, 'QC20', 'Gaspé', 'Gaspé', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(225, 'QC21', 'Gatineau', 'Gatineau', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(226, 'QC22', 'Granby', 'Granby', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(227, 'QC23', 'Joliette', 'Joliette', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(228, 'QC24', 'Jonquière', 'Jonquière', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(229, 'QC25', 'La Malbaie', 'La Malbaie', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(230, 'QC26', 'La Pocatière', 'La Pocatière', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(231, 'QC27', 'La Sarre', 'La Sarre', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(232, 'QC28', 'La Tuque', 'La Tuque', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(233, 'QC29', 'Lac Mégantic', 'Lac Mégantic', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(234, 'QC30', 'Laval', 'Laval', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(235, 'QC31', 'Lévis', 'Lévis', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(236, 'QC32', 'Longueuil', 'Longueuil', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(237, 'QC33', 'Louiseville', 'Louiseville', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(238, 'QC34', 'Magog', 'Magog', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(239, 'QC35', 'Maniwaki', 'Maniwaki', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(240, 'QC36', 'Matane', 'Matane', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(241, 'QC37', 'Mistissini', 'Mistissini', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(242, 'QC38', 'Mont-Laurier', 'Mont-Laurier', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(243, 'QC39', 'Montmagny', 'Montmagny', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(244, 'QC40', 'Montréal', 'Montréal', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(245, 'QC41', 'New Richmond', 'New Richmond', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(246, 'QC42', 'Pointe-Claire', 'Pointe-Claire', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(247, 'QC43', 'Québec', 'Québec', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(248, 'QC44', 'Repentigny', 'Repentigny', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(249, 'QC45', 'Rimouski', 'Rimouski', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(250, 'QC46', 'Rivière-du-Loup', 'Rivière-du-Loup', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(251, 'QC47', 'Roberval', 'Roberval', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(252, 'QC48', 'Rouyn-Noranda', 'Rouyn-Noranda', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(253, 'QC49', 'Saint-Eustache', 'Saint-Eustache', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(254, 'QC50', 'Saint-Georges', 'Saint-Georges', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(255, 'QC51', 'Saint-Hyacinthe', 'Saint-Hyacinthe', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(256, 'QC52', 'Saint-Jean-sur-Richelieu', 'Saint-Jean-sur-Richelieu', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(257, 'QC53', 'Saint-Jérôme', 'Saint-Jérôme', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(258, 'QC54', 'Saint-Léonard', 'Saint-Léonard', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(259, 'QC55', 'Sainte-Agathe-des-Monts', 'Sainte-Agathe-des-Monts', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(260, 'QC56', 'Sainte-Anne', 'Sainte-Anne', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(261, 'QC57', 'Sainte-Foy', 'Sainte-Foy', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(262, 'QC58', 'Sainte-Thérèse', 'Sainte-Thérèse', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(263, 'QC59', 'Senneterre', 'Senneterre', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(264, 'QC60', 'Sept-Îles', 'Sept-Îles', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(265, 'QC61', 'Shawinigan', 'Shawinigan', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(266, 'QC62', 'Sherbrooke', 'Sherbrooke', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(267, 'QC63', 'Sorel-Tracy', 'Sorel-Tracy', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(268, 'QC64', 'Terrebonne', 'Terrebonne', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(269, 'QC65', 'Thetford-Mines', 'Thetford-Mines', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(270, 'QC66', 'Trois-Rivières', 'Trois-Rivières', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(271, 'QC67', 'Val-d''Or', 'Val-d''Or', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(272, 'QC68', 'Val-des-Sources', 'Val-des-Sources', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(273, 'QC69', 'Valleyfield', 'Valleyfield', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(274, 'QC70', 'Vaudreuil-Dorion', 'Vaudreuil-Dorion', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(275, 'QC71', 'Verdun', 'Verdun', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(276, 'QC72', 'Victoriaville', 'Victoriaville', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(277, 'QC73', 'Ville-Marie', 'Ville-Marie', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(278, 'SK1', 'Buffalo Narrows', 'Buffalo Narrows', '1970-01-01 00:00:00', 11, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(279, 'SK2', 'Estevan', 'Estevan', '1970-01-01 00:00:00', 11, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(280, 'SK3', 'La Ronge', 'La Ronge', '1970-01-01 00:00:00', 11, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(281, 'SK4', 'Melfort', 'Melfort', '1970-01-01 00:00:00', 11, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(282, 'SK5', 'Moose Jaw', 'Moose Jaw', '1970-01-01 00:00:00', 11, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(283, 'SK6', 'North Battleford', 'North Battleford', '1970-01-01 00:00:00', 11, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(284, 'SK7', 'Prince Albert', 'Prince Albert', '1970-01-01 00:00:00', 11, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(285, 'SK8', 'Regina', 'Regina', '1970-01-01 00:00:00', 11, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(286, 'SK9', 'Saskatoon', 'Saskatoon', '1970-01-01 00:00:00', 11, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(287, 'SK10', 'Swift Current', 'Swift Current', '1970-01-01 00:00:00', 11, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(288, 'SK11', 'Weyburn', 'Weyburn', '1970-01-01 00:00:00', 11, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(289, 'SK12', 'Yorkton', 'Yorkton', '1970-01-01 00:00:00', 11, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(290, 'YT1', 'Yorkton', 'Yorkton', '1970-01-01 00:00:00', 12, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP);

--changeset system:cd_city_off context:mssql
SET IDENTITY_INSERT CD_CITY OFF;

--changeset system:cd_wfa_status_on context:mssql
SET IDENTITY_INSERT CD_WFA_STATUS ON;

--changeset system:cd_wfa_status
INSERT INTO [CD_WFA_STATUS] ([ID], [CODE], [NAME_EN], [NAME_FR], [SORT_ORDER], [EFFECTIVE_DATE], [USER_CREATED], [DATE_CREATED], [USER_UPDATED], [DATE_UPDATED])
VALUES (0, 'AFFECTED', 'Affected', 'Touché', 0, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(1, 'SURPLUS_GRJO', 'Surplus with GRJO', 'Excédentaire avec GOE', 0, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(2, 'SURPLUS_NO_GRJO', 'Surplus without a GRJO', 'Excédentaire sans GOE', 0, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(3, 'RELOCATION', 'Relocation of work unit', 'Réinstallation de l''unité de travail', 0, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(4, 'LAYOFF', 'Lay-off', 'Mise à pied', 0, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(5, 'EXAFFECTED', 'Affected - EX', 'Touché - EX', 0, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(6, 'EXSURPLUSCPA', 'Surplus - EX (Stay CPA)', 'Excédentaire - EX (Reste APC)', 0, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP);

--changeset system:cd_wfa_status_off context:mssql
SET IDENTITY_INSERT CD_WFA_STATUS OFF;

--changeset system:cd_classification_on context:mssql
SET IDENTITY_INSERT CD_CLASSIFICATION ON;

--changeset system:cd_classification
INSERT INTO [CD_CLASSIFICATION] ([ID], [CODE], [NAME_EN], [NAME_FR], [EFFECTIVE_DATE], [USER_CREATED], [DATE_CREATED], [USER_UPDATED], [DATE_UPDATED])
VALUES (0, 'AS-01', 'AS-01', 'AS-01', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(1, 'AS-02', 'AS-02', 'AS-02', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(2, 'AS-03', 'AS-03', 'AS-03', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(3, 'AS-04', 'AS-04', 'AS-04', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(4, 'AS-05', 'AS-05', 'AS-05', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(5, 'AS-06', 'AS-06', 'AS-06', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(6, 'AS-07', 'AS-07', 'AS-07', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(7, 'CR-03', 'CR-03', 'CR-03', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(8, 'CR-04', 'CR-04', 'CR-04', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(9, 'CR-05', 'CR-05', 'CR-05', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(10, 'CT-FIN-01', 'CT-FIN-01', 'CT-FIN-01', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(11, 'CT-FIN-02', 'CT-FIN-02', 'CT-FIN-02', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(12, 'CT-FIN-03', 'CT-FIN-03', 'CT-FIN-03', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(13, 'CT-FIN-04', 'CT-FIN-04', 'CT-FIN-04', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(14, 'CT-IAU-01', 'CT-IAU-01', 'CT-IAU-01', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(15, 'CT-IAU-02', 'CT-IAU-02', 'CT-IAU-02', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(16, 'CT-IAU-03', 'CT-IAU-03', 'CT-IAU-03', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(17, 'CT-IAU-04', 'CT-IAU-04', 'CT-IAU-04', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(18, 'EC-02', 'EC-02', 'EC-02', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(19, 'EC-03', 'EC-03', 'EC-03', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(20, 'EC-04', 'EC-04', 'EC-04', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(21, 'EC-05', 'EC-05', 'EC-05', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(22, 'EC-06', 'EC-06', 'EC-06', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(23, 'EC-07', 'EC-07', 'EC-07', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(24, 'EC-08', 'EC-08', 'EC-08', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(25, 'ED-01', 'ED-01', 'ED-01', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(26, 'ED-02', 'ED-02', 'ED-02', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(27, 'ED-03', 'ED-03', 'ED-03', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(28, 'EG-05', 'EG-05', 'EG-05', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(29, 'EG-06', 'EG-06', 'EG-06', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(30, 'EN-02', 'EN-02', 'EN-02', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(31, 'EN-03', 'EN-03', 'EN-03', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(32, 'EN-04', 'EN-04', 'EN-04', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(33, 'EN-05', 'EN-05', 'EN-05', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(34, 'EN-06', 'EN-06', 'EN-06', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(35, 'EX-01', 'EX-01', 'EX-01', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(36, 'EX-02', 'EX-02', 'EX-02', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(37, 'EX-03', 'EX-03', 'EX-03', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(38, 'GS-04', 'GS-04', 'GS-04', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(39, 'GT-02', 'GT-02', 'GT-02', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(40, 'GT-03', 'GT-03', 'GT-03', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(41, 'GT-04', 'GT-04', 'GT-04', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(42, 'GT-05', 'GT-05', 'GT-05', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(43, 'IT-01', 'IT-01', 'IT-01', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(44, 'IT-02', 'IT-02', 'IT-02', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(45, 'IT-03', 'IT-03', 'IT-03', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(46, 'IT-04', 'IT-04', 'IT-04', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(47, 'IT-05', 'IT-05', 'IT-05', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(48, 'LC-01', 'LC-01', 'LC-01', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(49, 'LC-02', 'LC-02', 'LC-02', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(50, 'LC-03', 'LC-03', 'LC-03', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(51, 'LP-01', 'LP-01', 'LP-01', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(52, 'LP-02', 'LP-02', 'LP-02', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(53, 'LP-03', 'LP-03', 'LP-03', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(54, 'MD-02', 'MD-02', 'MD-02', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(55, 'MD-03', 'MD-03', 'MD-03', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(56, 'NU-01', 'NU-01', 'NU-01', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(57, 'NU-02', 'NU-02', 'NU-02', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(58, 'NU-03', 'NU-03', 'NU-03', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(59, 'NU-04', 'NU-04', 'NU-04', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(60, 'OM-01', 'OM-01', 'OM-01', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(61, 'OM-02', 'OM-02', 'OM-02', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(62, 'OM-03', 'OM-03', 'OM-03', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(63, 'OM-04', 'OM-04', 'OM-04', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(64, 'PE-01', 'PE-01', 'PE-01', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(65, 'PE-02', 'PE-02', 'PE-02', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(66, 'PE-03', 'PE-03', 'PE-03', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(67, 'PE-04', 'PE-04', 'PE-04', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(68, 'PE-05', 'PE-05', 'PE-05', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(69, 'PE-06', 'PE-06', 'PE-06', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(70, 'PG-01', 'PG-01', 'PG-01', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(71, 'PG-02', 'PG-02', 'PG-02', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(72, 'PG-03', 'PG-03', 'PG-03', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(73, 'PG-04', 'PG-04', 'PG-04', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(74, 'PG-05', 'PG-05', 'PG-05', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(75, 'PG-06', 'PG-06', 'PG-06', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(76, 'PM-01', 'PM-01', 'PM-01', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(77, 'PM-02', 'PM-02', 'PM-02', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(78, 'PM-03', 'PM-03', 'PM-03', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(79, 'PM-04', 'PM-04', 'PM-04', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(80, 'PM-05', 'PM-05', 'PM-05', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(81, 'PM-06', 'PM-06', 'PM-06', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(82, 'TI-05', 'TI-05', 'TI-05', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(83, 'TI-06', 'TI-06', 'TI-06', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP);

--changeset system:cd_classification_off context:mssql
SET IDENTITY_INSERT CD_CLASSIFICATION OFF;

--changeset system:cd_language_referral_type_on context:mssql
SET IDENTITY_INSERT CD_LANGUAGE_REFERRAL_TYPE ON;

--changeset system:cd_language_referral_type
INSERT INTO [CD_LANGUAGE_REFERRAL_TYPE] ([ID], [CODE], [NAME_EN], [NAME_FR], [EFFECTIVE_DATE], [USER_CREATED], [DATE_CREATED], [USER_UPDATED], [DATE_UPDATED])
VALUES (0, 'BILINGUAL', 'Bilingual', 'Bilingue', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(1, 'ENGLISH', 'English only', 'Anglais seulement', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(2, 'FRENCH', 'French only', 'Français seulement', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP);

--changeset system:cd_language_referral_type_off context:mssql
SET IDENTITY_INSERT CD_LANGUAGE_REFERRAL_TYPE OFF;

--changeset system:cd_work_unit_on context:mssql
SET IDENTITY_INSERT CD_WORK_UNIT ON;

--changeset system:cd_work_unit
INSERT INTO [CD_WORK_UNIT] ([ID], [CODE], [NAME_EN], [NAME_FR], [PARENT_WORK_UNIT_ID], [EFFECTIVE_DATE], [USER_CREATED], [DATE_CREATED], [USER_UPDATED], [DATE_UPDATED])
VALUES (0, '100713', 'Labour - COPD', 'Travail - CODP', NULL, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(1, '100732', 'Labour - SIG', 'Travail - ISG', NULL, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(2, '101560', 'DMO Labour Program', 'BSM Programme du travail', NULL, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(3, '103634', 'Labour - PDRIA', 'Travail - PRDAI', NULL, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(4, '100093', 'ICSD, Quebec Region', 'PSIC, Région du Québec', NULL, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(5, '100749', 'ISSO', 'SSIO', NULL, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(6, '100789', 'ISB', 'DGSI', NULL, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(7, '101273', 'ICSD, Ontario Region', 'PSIC, Région de l''Ontario', NULL, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(8, '101400', 'COOO, Service Canada', 'BCE, Service Canada', NULL, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(9, '103631', 'ICSD, Atlantic Region', 'PSIC, Région de l''Atlantique', NULL, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(10, '103632', 'ICSD, W-T Region', 'PSIC, Région de l''O-T', NULL, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(11, '103633', 'POB', 'DGOP', NULL, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(12, '106832', 'TFWPB', 'DGPTET', NULL, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(13, '107460', 'Chief Client Exp Office', 'Bureau chef expérience client', NULL, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(14, '107514', 'CDSB', 'DGSNC', NULL, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(15, '107587', 'SDN-Business Chg Oversight Ld', 'RPS-Resp gstn intégré chgt ops', NULL, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(16, '107588', 'SDN-Client Service Delivery', 'RPS-Prest serv aux clients', NULL, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(17, '107603', 'IWWMB', 'DGGICTE', NULL, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(18, '107605', 'ICSD', 'PSIC', NULL, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(19, '107607', 'SDRB', 'DGCSR', NULL, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(20, '107816', 'ICSB', 'DGMSSI', NULL, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(21, '107817', 'IENB', 'DGREI', NULL, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(22, '100669', 'Corporate Secretariat', 'Secrétariat ministériel', NULL, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(23, '122588', 'Ombuds Office', 'Bureau de l''Ombuds', NULL, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(24, '100538', 'Learning Branch', 'DG de l''apprentissage', NULL, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(25, '100577', 'SEB', 'DGCE', NULL, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(26, '100651', 'ISSDB', 'DGSRD', NULL, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(27, '100816', 'IAERMB', 'DGAIGRE', NULL, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(28, '100832', 'IITB', 'DGIIT', NULL, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(29, '100841', 'HRSB', 'DGSRH', NULL, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(30, '101019', 'SSPB', 'DGPSS', NULL, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(31, '101055', 'PASRB', 'DGAPR', NULL, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(32, '101064', 'CFOB', 'DGDPF', NULL, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(33, '101728', 'DMO ESDC', 'BSM EDSC', NULL, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(34, '103655', 'Legal Services Unit', 'Unité des services juridiques', NULL, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(35, '105429', 'Policy Horizons Canada', 'Horizons Politiques Canada', NULL, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(36, '105888', 'Chief Data Officer Branch', 'DGDPD', NULL, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(37, '106152', 'Implementation Branch', 'DG de la mise en œuvre', NULL, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(38, '107064', 'BLO BDM', 'BDPA MVP', NULL, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(39, '107202', 'Business Lead Implementation', 'Resp mise en oeuvre activtés', NULL, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(40, '107769', 'Prog Strat & Design Branch', 'DG de la strat & conc des prog', NULL, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(41, '106882', 'Office of the CAO', 'Bureau du DPA', NULL, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(42, '100712', 'Workplace Directorate', 'Direction du milieu de travail', 0, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(43, '100730', 'ADM''s Office, COPD', 'Bureau du SMA, CODP', 0, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(44, '100905', 'Reg Opertins & Compliance DGO', 'BDG Opération Rég & Conformité', 0, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(45, '101872', 'Federal Programs', 'Programmes Federaux', 0, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(46, '101378', 'Strat Integ & Info Solutions', 'Integ Strat & Solution Info', 1, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(47, '104312', 'Gov, Engmt & Man Ser', 'Gov Mobilisation & Serv Ges', 1, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(48, '100698', 'DGO Fed Mediatn Conciliatn Svc', 'DG Serv Fed Mediatn Conciliatn', 3, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(49, '100704', 'Intl&Intgov Labour Affairs', 'Affrs interntl&intergouv trav', 3, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(50, '100715', 'Strat Pol Anls Research Inn', 'Politique stratégique', 3, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(51, '101422', 'ADM''s Office, PDRIA', 'Bureau du SMA, PRDAI', 3, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(52, '100089', 'Integrity Services Branch, QC', 'Direction serv d''intégrité, QC', 4, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(53, '100096', 'Benefit Delivery Service, QC', 'Services de versemnt prestn QC', 4, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(54, '101197', 'Director General (DG)', 'Directeur Général (DG)', 4, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(55, '101231', 'DSC - Director General', 'DSC - Directeur Général', 4, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(56, '101259', 'ADM''s Office, Chief of Staff', 'CSMA-Chef de cabinet', 4, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(57, '104660', 'Programs Branch, Quebec Region', 'Direction des programmes, QC', 4, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(58, '107458', 'QC Passport Operations', 'QC Opérations de passeport', 4, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(59, '100570', 'Digital Service Directorate', 'Direction du service numérique', 5, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(60, '100589', 'Strategic Directions', 'Orientations stratégiques', 5, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(61, '100738', 'Citizen Serv Strat & PPT Ops', 'Strat serv citoyens et ops PPT', 5, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(62, '100952', 'Call Centres', 'Centre d''appels', 5, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(63, '100975', 'Strategic Directions', 'Direction stratégiques', 5, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(64, '101081', 'Partnership Development & Mgmt', 'Dév et gestion partenariats', 5, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(65, '104788', 'Major Projects Execution', 'Éxécution des grands project', 5, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(66, '105940', 'Ind Paym & On-Demand Srv', 'Paiement ind & serv demande', 5, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(67, '106459', 'Bus Readiness & Mobilization', 'Prép mobilisation entreprise', 5, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(68, '107056', 'ADM office passport liaison', 'Bureau SMA passeport liaison', 5, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(69, '107081', 'Passport Modernization & Strat', 'Modernisation passeports strat', 5, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(70, '107098', 'In Person Operations', 'Opérations du mode en personne', 5, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(71, '107655', 'Service Delivery Transition', 'Transition prestation services', 5, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(72, '100631', 'Identity Policy and Program', 'Dir. des pol. prog. d’identité', 6, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(73, '100844', 'Internal Integrity & Security', 'Intégrité interne et Sécurité', 6, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(74, '100935', 'NHQ Integrity Operations', 'Opérations d''intégrité -RCN', 6, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(75, '101001', 'Integrity Strategic Directions', 'Orientation stratg d''intégrité', 6, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(76, '105920', 'Governance', 'Gouvernance', 6, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(77, '107009', 'ADMO analystes', 'ADMO analysts', 6, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(78, '100206', 'Integrity Service Branch, ON', 'DG services d''intégrité ON', 7, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(79, '100222', 'Strategic Services Branch, ON', 'Dir Services Stratégiques ON', 7, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(80, '100272', 'Citizen Services Branch, ON', 'DG des service aux citoyens ON', 7, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(81, '100278', 'MSB/Director', 'DGSG/Directeur', 7, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(82, '100318', 'Benefit Delv Service Branch ON', 'DG ser versemnt des prestns ON', 7, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(83, '102360', 'ADM Office, Ontario', 'Bureau du SMA, Ontario', 7, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(84, '104687', 'Program Delivery Branch, ON', 'DG-livraison des programmes ON', 7, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(85, '105565', 'ADM Office', 'Bureau de la SMA', 7, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(86, '106482', 'Management Services Branch-ED', 'Dirctn generale serv gestn-DE', 7, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(87, '100031', 'BDS-DirectorGeneralOffice', 'SVP-BureauDirecteurGenerale', 9, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(88, '100033', 'Strategic Services , Atlantic', 'Services stratégiques, ATL', 9, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(89, '100077', 'Integrity Services Branch  ATL', 'Dir gén serv d''intégrité ATL', 9, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(90, '101150', 'PROGRAM DELIVERY ATL', 'EXÉCUTION PROGRAMMES ATL', 9, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(91, '106192', 'Citizen Services Branch', 'Dir gén de service citoyens', 9, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(92, '107078', 'ADMO-Atlantic Region', 'SMA-REGION DE L''ATLANTIQUE', 9, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(93, '100374', 'Benefits Delivery Services Br', 'Direction générale des service', 10, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(94, '100418', 'CSB, Western &Territories', 'DGSC Ouest et territoires', 10, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(95, '100460', 'Strategic Services Branch', 'Services stratégiques, O et T', 10, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(96, '100474', 'Integrity Services Branch, W-T', 'Dir gén service d''intég O et T', 10, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(97, '101341', 'ADMO, Western & Territories', 'CSMA,  Ouest et territoires', 10, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(98, '104662', 'Program Delivery Branch, West', 'DGEP,région de l''Ouest du Can', 10, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(99, '106469', 'CofE Diversity & Inclusions', 'Cd''E diversité et inclusion', 10, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(100, '107189', 'W-T Passport Operations', 'O-T Opérations de passport', 10, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(101, '100748', 'Disability, Seniors and Labour', 'Pers handicap, aîné et travail', 11, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(102, '100922', 'Branch Management Services', 'Services de gestion', 11, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(103, '100944', 'Workforce Dev & Youth Programs', 'Dév main-d''oeuvre & prog jeune', 11, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(104, '100951', 'Strategic Directions', 'Orientations stratégiques', 11, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(105, '101823', 'ADM Office, Program Operations', 'Bureau SMA, Opér de programmes', 11, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(106, '104572', 'Natnl Grants & Cs Del Centre', 'Ctr ntnl prest subv contribut', 11, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(107, '104573', 'Indigenous Fam Child & Soc Dev', 'Autoch, fam, enfant et dev soc', 11, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(108, '105420', 'ADM''s Office', 'Bureau du SMA', 11, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(109, '100937', 'Prog Pol, Work Prot & Stak Rel', 'Pol prog pro tra & rel par pre', 12, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(110, '105998', 'Compliance Operations', 'Opérations de la conformité', 12, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(111, '106147', 'Program Operations', 'Opérations de programme', 12, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(112, '106956', 'Branch Management Services', 'Serv gestn de la Dir générale', 12, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(113, '107019', 'ADM Office', 'Bureau SMA', 12, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(114, '107708', 'Special Project - Litigation', 'Projet spécial - Litiges', 12, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(115, '101030', 'Client Feedback', 'Rétroaction Clients', 13, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(116, '106833', 'Client Experience CoE', 'CdE Experience Client', 13, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(117, '107461', 'ADMO - CXO', 'BSMA - BEC', 13, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(118, '107559', 'Client Experience Ops & Del', 'Ops et prest expérience client', 13, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(119, '107560', 'Client Experience Strategies', 'Stratégies expérience client', 13, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(120, '107561', 'CX Usability Testing', 'Test de convivialité de l''EC', 13, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(121, '107537', 'CDS, Operations', 'SNC, Opérations', 14, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(122, '107538', 'CDS, Platforms', 'SNC, Plates-formes', 14, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(123, '107539', 'CDS, Partnerships', 'SNC, Partenariats', 14, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(124, '107543', 'CDS, Digital Transf Office', 'SNC, Bureau transf numérique', 14, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(125, '107544', 'CDS, ADMO', 'SNC, BSMA', 14, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(126, '107634', 'Enterprise Digital Credentials', 'Justification num d''entreprise', 14, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(127, '107610', 'Ops Centre Data Insight & Rptg', 'Ctr ops contrôle anls données', 17, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(128, '107625', 'ADM Office IWWMB', 'Bureau du SMA DGGITE', 17, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(129, '107662', 'Workforce Strategy', 'Stratégie de l''effectif', 17, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(130, '107814', 'Planning and Forecasting', 'Planification et prévision', 17, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(131, '103474', 'Sr ADM Office, CSB', 'Bureau SMA princ, DGSC', 18, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(132, '107632', 'ADMO SCTLB', 'BSMA DGRTSC', 18, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(133, '107656', 'Planning Exec & Governance', 'Exéc planif & gouvernance', 18, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(134, '107657', 'Org Readiness & Engagement', 'Préparation & engamnt org', 18, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(135, '107658', 'Enterprise Culture Change', 'Changement culture entreprise', 18, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(136, '107659', 'Portfolio Analytics', 'Analyse du portefeuille', 18, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(137, '107756', 'SCTO - Transformation Delivery', 'BTSC - Livraison de la transfo', 18, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(138, '107759', 'Project Management Services', 'Service gestion projets', 18, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(139, '100659', 'Workers and Employers', 'Travailleurs et employeurs', 19, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(140, '100733', 'Seniors and Pensionners', 'Aînés et pensionnés', 19, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(141, '100926', 'ePayroll', 'Paie électronique', 19, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(142, '107088', 'Strat Planning & Integration', 'Planif strat et intégration', 21, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(143, '107609', 'Bus Readiness Strat & Impl', 'Strat prép ops mise en œuvre', 21, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(144, '107709', 'Training Delivery', 'Prestation services formation', 21, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(145, '107710', 'Procedures & Training Develop', 'Élaboration procéd formation', 21, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(146, '107724', 'Knowledge Management', 'Gestion des connaissances', 21, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(147, '107725', 'Advice & Guidance, Feedback', 'Conseils & orientations, rétro', 21, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(148, '100671', 'Bus Mngt & Exec Committees', 'Gstn des affai et comité exéc', 22, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(149, '100804', 'ATIP', 'AIPRP', 22, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(150, '100822', 'Privacy Management', 'Gestion des renseign personnel', 22, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(151, '100940', 'Ministerial Services', 'Services ministériel', 22, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(152, '104930', 'Corporate Secretariat Office', 'Services Administratifs', 22, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(153, '106639', 'Parliamentary Affairs Division', 'Div Affaires parlementaires', 22, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(154, '107447', 'EI Board of Appeal', 'Conseil d''appel en AE', 22, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(155, '106754', 'Business Change Management', 'Gestion du changement d''entre', 23, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(156, '107211', 'Associate Ombuds', 'Ombuds déléguée', 23, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(157, '100552', 'Canada Education Savings Progr', 'Programme can épargne-études', 24, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(158, '100559', 'Learning Policy & Services Dir', 'Politques apprent & Services', 24, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(159, '100626', 'Canada Student Financial Assis', 'Can Aide Financiere Etudiants', 24, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(160, '105106', 'ADM Office, Learning', 'Bureau du SMA, apprentissage', 24, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(161, '106047', 'Youth Service and Learning', 'Serv.apprentissage jeunesse', 24, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(162, '100539', 'Labour Market Information', 'Info sur marché du travail', 25, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(163, '100573', 'Indigenous Affairs', 'Affaires autochtones', 25, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(164, '100590', 'Employment Insurance Policy', 'Politiques d''assurance-emploi', 25, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(165, '100591', 'Emplnt Program Policy & Design', 'Politique concep prog d''emploi', 25, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(166, '101053', 'Apprenticeship/Sect Init Dir', 'Dir apprentissages/init sect', 25, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(167, '104539', 'Strat Int & Corp Affairs', 'Integ Strat & affaires corp', 25, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(168, '104708', 'ADM''s Office', 'Bureau du SMA', 25, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(169, '104779', 'Pol Community Partnership Offc', 'Bur partenariats comm. pol', 25, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(170, '105404', 'Youth&Skills Innovation Direct', 'Jeunesse innovation en matière', 25, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(171, '107689', 'Corporate Affairs', 'Affaires corporatives', 25, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(172, '100550', 'Social Innovation & Com Dev', 'Innovation sociale et dév com', 26, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(173, '100617', 'Office for Disability Issues', 'Bureau enjeux person handicapé', 26, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(174, '100654', 'Canada Pension Plan Disability', 'Régime de pensions du Canada', 26, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(175, '100657', 'Strgc Intgtn Planning & Acct', 'Planifi strtg l''intgr responsb', 26, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(176, '100678', 'Seniors & Pensions Policy Secr', 'Secr Pol Ainés et les pensions', 26, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(177, '105172', 'IELCC Transformation Sec', 'Secrétariat transform l''AGJEA', 26, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(178, '106061', 'Accessible Canada Directorate', 'Direction du Canada accessible', 26, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(179, '107184', 'Supp Black Can Cmties Initiatv', 'Initiatv app cmtés noires Can', 26, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(180, '107477', 'Federal Anti-Racism Sec', 'Sec fédéral contre le racisme', 26, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(181, '107527', 'FPT Partners-Central & East-107527', 'Partenariats FPT-Central & Est-107527', 26, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(182, '107528', 'FPT Partners-Central & East-107528', 'Partenariats FPT-Central & Est-107528', 26, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(183, '107706', 'Executive Management Support', 'Soutien direction exécutive', 26, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(184, '107787', 'Early Learning and Child Care', 'Apprent garde jeunes enfants', 26, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(185, '107800', 'Domestic & Intrnl Policy Dev', 'Élabor pol natl & interntl', 26, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(186, '107801', 'Ntl Advisory Council & Ext Rel', 'Conseil consult natl & rel ext', 26, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(187, '107802', 'Strategic Pol & Issues Mgmt', 'Pol strat & gestion enjeux', 26, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(188, '100815', 'Audit Operations', 'Opérations de l''audit', 27, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(189, '103715', 'Prof Pract Special Examination', 'Exam spéc pratique prof', 27, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(190, '103716', 'Liaison and DAC', 'Liaison et CMV', 27, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(191, '105566', 'Enterprise Risk Management', 'Gestion des Risques Entreprise', 27, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(192, '105997', 'Chief of Staff - CAE Office', 'Chef cabinet - Bureau du DPA', 27, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(193, '106156', 'Agile Auditing', 'Audit Agile', 27, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(194, '106704', 'Manager BMS', 'Gestionnaire SGA', 27, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(195, '107747', 'Chief of Staff', 'Chef de cabinet', 27, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(196, '100640', 'Business Solutions and IM', 'Sol affa et gest de l''info', 28, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(197, '100860', 'Strat Arch and Business Rel', 'Strat arch et rel d’affaires', 28, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(198, '100949', 'Enterprise Operations', 'Opérations D''Entreprise', 28, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(199, '100961', 'Business Sol & Innovation', 'Innovation Sol d''affaires', 28, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(200, '100981', 'Enterprise Digital Solutions', 'Sol numériques d’entreprise', 28, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(201, '103778', 'Branch Operations and Planning', 'Ope et Planif de la DG', 28, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(202, '104033', 'Chief Info Officer''s Office', 'Bur du Dirigeant principl info', 28, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(203, '106248', 'Enterprise Cloud Services', 'ServICES Nuagique dentreprise', 28, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(204, '106514', 'Business Ops Sustainability', 'Durabilité  ops d’entreprise', 28, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(205, '106899', 'Office Indigenous Initiatives', 'Bureau initiatives autochtones', 28, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(206, '107300', 'Office Chief Inform Officer', 'Bureau Dirigeant Princ. Info.', 28, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(207, '107598', 'Cyber and IT Security', 'Cyber et Sécurité TI', 28, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(208, '107681', 'OAS on BDM Service Operations', 'SV Opérations services MVP', 28, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(209, '100649', 'Workforce Management', 'Gestion de l''effectif', 29, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(210, '100686', 'Strategic Dir & Mngt Services', 'Dir Stratg et Serv de Gestion', 29, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(211, '100842', 'Acc Office & College at ESDC', 'Bur Acc & Collège à EDSC', 29, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(212, '100843', 'Workplace Management', 'Direction de la gestion du mil', 29, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(213, '100970', 'Human Resources Council', 'Conseil de ressources humaines', 29, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(214, '105801', 'ADMO HRSB', 'BSMA DGSRH', 29, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(215, '106575', 'Compensation Services', 'Services de rémunération', 29, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(216, '100779', 'Economic Policy Directorate', 'Dir Politique économique', 30, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(217, '100813', 'Social Policy Directorate', 'Dir. de la politique sociale', 30, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(218, '100821', 'Evaluation Directorate', 'Evaluation des partenariats', 30, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(219, '101065', 'Strategic and Horizontal Polic', 'Politiques stratégiques et hor', 30, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(220, '101079', 'Chief of Staff', 'Chef de cabinet', 30, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(221, '101082', 'Service Policy and Strategy', 'Politique et stratégie de serv', 30, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(222, '104235', 'Corp Planning & Management', 'Planifi. et la gestion coropor', 30, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(223, '104702', 'Innovation Lab Director', 'Dir. laboratoires d''innovation', 30, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(224, '104975', 'Transformation Management Dire', 'DG gestion transformation', 30, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(225, '106771', 'Office of IGA', 'Bureau de l''AIG', 30, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(226, '101056', 'Strat Comms & Stkdr Rel Dir', 'Dir comms strat & rel interv', 31, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(227, '101057', 'Strategic Directions', 'Orientations stratégiques', 31, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(228, '104044', 'Seniors & Social Dev Comms Dir', 'Dir Comms ainés & dév social', 31, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(229, '104334', 'Employment Communications', 'Communications sur l''emploi', 31, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(230, '100837', 'Integr Corp Actg & Accountblty', 'Intgrte Resp. Cmpta. Min.', 32, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(231, '100867', 'Invest Plan & Proc Mgmt', 'Gestn Inv Projet & Approv', 32, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(232, '100979', 'Business Management Services', 'Gestn serv direction générale', 32, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(233, '101063', 'Financial Management Advisory', 'Services consultatifs en gesti', 32, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(234, '104426', 'Change Mgtm & Reg Services', 'Gestn chgmt et services réginx', 32, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(235, '104463', 'myEMS(SAP) Centre of Expertise', 'maSGE (SAP) Centre d''expertise', 32, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(236, '106969', 'Corporate Financial Planning', 'Planification fin minist', 32, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(237, '107077', 'Chief Finan. Officer''s Office', 'Bur. Dir. Princ. Finances', 32, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(238, '100773', 'Legal Services - B', 'Services juridiques - B', 34, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(239, '101106', 'Legal Services Summary', 'Sommaies services juridiques', 34, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(240, '103836', 'Legal Counsel', 'Conseillère juridique', 34, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(241, '104524', 'Senior Counsel & Group Head', 'Avocat-conseil et chef groupe', 34, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(242, '104526', 'General Counsel & Deputy Head', 'Avocat général et chef adjoint', 34, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(243, '105995', 'Legal research', 'Recherche legale', 34, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(244, '101790', 'Director General Office -C', 'Bureau du Directeur général -C', 35, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(245, '101792', 'Corpor Operatn & Admin-B', 'Srvc admin integrés-B', 35, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(246, '106816', 'Foresight Projects', 'Projets prospective', 35, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(247, '100783', 'Enterprise Data Strategy', 'Strat des donn organisa', 36, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(248, '101041', 'Data Science', 'Science des données', 36, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(249, '104480', 'Data Strategies & Development', 'Stratégies de données & dévelo', 36, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(250, '105614', 'Strategic Oversight', 'Surveillance stratégique', 36, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(251, '106493', 'Pension Solutions', 'Solution Pension', 36, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(252, '106919', 'Programme & Project Management', 'Gestion programmes et projets', 36, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(253, '107307', 'Data Intelligence', 'Intelligence des donnees', 36, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(254, '107169', 'DM Issues Management', 'SM Resolution de probleme', 38, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(255, '107687', 'Issues Management - 2', 'Résolution de problème - 2', 38, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(256, '104721', 'Identity Serv & Acc Mgmt Sol', 'Serv ident et syst gestn accès', 39, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(257, '106285', 'Contact Centre Solutions', 'Solution centre de contact', 39, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(258, '106718', 'Chief of Staff to ADM', 'Chef de Cabinet pour la SMA', 39, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(259, '106775', 'Service Delivery Network', 'Réseau prestation des services', 39, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(260, '106999', 'Intg Plan & Perfo Report A', 'Plan Integr & Performance A', 39, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(261, '107001', 'Old Age Security', 'Sécurité de la vieillesse', 39, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(262, '107002', 'Employment Insurance', 'Assurance-emploi', 39, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(263, '107453', 'ADMO, Program Strat & Design', 'BSMA, Strat & Concep programme', 39, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(264, '106277', 'Technology Enablement', 'Habilitation technique', 40, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(265, '106297', 'Office Chief Prod Offcr & Arch', 'Bureau resp prod et arch chef', 40, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(266, '106997', 'Program Strategic Engagement', 'Engagement stratégique du prog', 40, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(267, '107259', 'Programme Management', 'Gestion du programme', 40, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP);

--changeset system:cd_work_unit_off context:mssql
SET IDENTITY_INSERT CD_WORK_UNIT OFF;

--changeset system:cd_language_on context:mssql
SET IDENTITY_INSERT CD_LANGUAGE ON;

--changeset system:cd_language
INSERT INTO [CD_LANGUAGE] ([ID], [CODE], [NAME_EN], [NAME_FR], [EFFECTIVE_DATE], [USER_CREATED], [DATE_CREATED], [USER_UPDATED], [DATE_UPDATED])
VALUES (0, 'EN', 'English', 'Anglais', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(1, 'FR', 'French', 'Français', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP);

--changeset system:cd_language_off context:mssql
SET IDENTITY_INSERT CD_LANGUAGE OFF;

--changeset system:cd_appointment_non_advertised_on context:mssql
SET IDENTITY_INSERT CD_APPOINTMENT_NON_ADVERTISED ON;

--changeset system:cd_appointment_non_advertised
INSERT INTO [CD_APPOINTMENT_NON_ADVERTISED] ([ID], [CODE], [NAME_EN], [NAME_FR], [INTERNAL_IND], [EFFECTIVE_DATE], [USER_CREATED], [DATE_CREATED], [USER_UPDATED], [DATE_UPDATED])
VALUES (0, 'INT_DIL', 'Objectives related to diversity, inclusion or land claims', 'Objectifs liés à la diversité, l''inclusion ou les revendications territoriales', '1', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(1, 'INT_QCSAP', 'Qualified candidate from a similar appointment process / an existing pool ', 'Candidat(e) qualifié(e) issu(e) d''un bassin d''un processus de nomination similaire ou d''un bassin existant ', '1', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(2, 'INT_PTM', 'Promotion in the context of talent management / succession planning', 'Promotion dans le cadre d''un plan de gestion de talents / de la relève', '1', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(3, 'INT_OPN', 'Immediate needs (pressing operational needs or urgent situations) ', 'Besoins immédiats (besoins opérationnels pressants ou situations d''urgence) ', '1', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(4, 'INT_LCP', 'Limited candidate pool (Remote location, Shortage group,  Specialized skills)', 'Bassin de candidats limité (Poste situé en région éloignée, Groupe en pénurie, Compétences spécialisées)', '1', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(5, 'INT_ALA', 'At level appointment from a non PSEA organization (deployment not possible) ', 'Nomination à un poste de même niveau à partir d''une organisation non assujettie à la LEFP (aucune mutation possible) ', '1', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(6, 'INT_CTRQ', 'Change in tenure to retain a qualified employee in whom the organization has invested', 'Changement de durée d''emploi pour retenir un employé qualifié pour lequel l''organisation a investi', '1', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(7, 'EXT_DIL', 'Objectives related to diversity, inclusion or land claims', 'Objectifs liés à la diversité, l''inclusion ou les revendications territoriales', '0', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(8, 'EXT_QCSAP', 'Qualified candidate from a similar appointment process / an existing pool ', 'Candidat(e) qualifié(e) issu(e) d''un bassin d''un processus de nomination similaire ou d''un bassin existant ', '0', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(9, 'EXT_SB', 'Student bridging ', 'Intégration des étudiants ', '0', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(10, 'EXT_OPN', 'Immediate needs (pressing operational needs or urgent situations) ', 'Besoins immédiats (besoins opérationnels pressants ou situations d''urgence)', '0', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(11, 'EXT_RFPS', 'Re-hire of a former public servant ', 'Réembauche d''un ancien fonctionnaire ', '0', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(12, 'EXT_LCP', 'Limited candidate pool (Remote location, Shortage group,  Specialized skills)', 'Bassin de candidats limité (Poste situé en région éloignée, Groupe en pénurie, Compétences spécialisées)', '0', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(13, 'EXT_ALA', 'At level appointment from a non PSEA organization (deployment not possible) ', 'Nomination à un poste de même niveau à partir d''une organisation non assujettie à la LEFP (aucune mutation possible) ', '0', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(14, 'EXT_CTRQ', 'Change in tenure to retain a qualified employee in whom the organization has invested', 'Changement de durée d''emploi pour retenir un employé qualifié pour lequel l''organisation a investi', '0', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP);

--changeset system:cd_appointment_non_advertised_off context:mssql
SET IDENTITY_INSERT CD_APPOINTMENT_NON_ADVERTISED OFF;

--changeset system:cd_employment_equity_on context:mssql
SET IDENTITY_INSERT CD_EMPLOYMENT_EQUITY ON;

--changeset system:cd_employment_equity
INSERT INTO [CD_EMPLOYMENT_EQUITY] ([ID], [CODE], [NAME_EN], [NAME_FR], [EFFECTIVE_DATE], [USER_CREATED], [DATE_CREATED], [USER_UPDATED], [DATE_UPDATED])
VALUES (0, 'VM-MV', 'Visible Minorities', 'Minorités visibles', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(1, 'PD-PSH', 'Persons with Disabilities', 'Personnes en situation de handicap', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(2, 'AP-A', 'Aboriginal Peoples', 'Autochtones', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(3, 'W-F', 'Women', 'Femmes', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP);

--changeset system:cd_employment_equity_off context:mssql
SET IDENTITY_INSERT CD_EMPLOYMENT_EQUITY OFF;

--changeset system:cd_employment_opportunity_on context:mssql
SET IDENTITY_INSERT CD_EMPLOYMENT_OPPORTUNITY ON;

--changeset system:cd_employment_opportunity
INSERT INTO [CD_EMPLOYMENT_OPPORTUNITY] ([ID], [CODE], [NAME_EN], [NAME_FR], [EFFECTIVE_DATE], [USER_CREATED], [DATE_CREATED], [USER_UPDATED], [DATE_UPDATED])
VALUES (0, 'INTERNAL', 'Internal Opportunities', 'Opportunités internes', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(1, 'EXTERNAL', 'External Opportunities', 'Opportunités externes', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(2, 'ADVERTISED', 'Advertised Processes', 'Processus annoncés', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(3, 'NON_ADVERTISED', 'Non-Advertised Processes', 'Processus non annoncés', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(4, 'DEPLOYMENT', 'Deployment', 'Mutation', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(5, 'PROMOTION', 'Promotion', 'Promotion', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(6, 'APPOINTMENT', 'Appointment', 'Nomination', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(7, 'ACTING', 'Acting Assignment', 'Intérim', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(8, 'SECONDMENT', 'Secondment', 'Détachement', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP);

--changeset system:cd_employment_opportunity_off context:mssql
SET IDENTITY_INSERT CD_EMPLOYMENT_OPPORTUNITY OFF;

--changeset system:cd_employment_tenure_on context:mssql
SET IDENTITY_INSERT CD_EMPLOYMENT_TENURE ON;

--changeset system:cd_employment_tenure
INSERT INTO [CD_EMPLOYMENT_TENURE] ([ID], [CODE], [NAME_EN], [NAME_FR], [EFFECTIVE_DATE], [USER_CREATED], [DATE_CREATED], [USER_UPDATED], [DATE_UPDATED])
VALUES (0, 'INDETERMINATE', 'Indeterminate', 'Indéterminée', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
    (1, 'TERM', 'Term', 'Durée déterminée', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
    (2, 'CASUAL', 'Casual', 'Occasionnel', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
    (3, 'STUDENT', 'Student', 'Étudiant', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP);

--changeset system:cd_employment_tenure_off context:mssql
SET IDENTITY_INSERT CD_EMPLOYMENT_TENURE OFF;

--changeset system:cd_language_requirement_on context:mssql
SET IDENTITY_INSERT CD_LANGUAGE_REQUIREMENT ON;

--changeset system:cd_language_requirement
INSERT INTO [CD_LANGUAGE_REQUIREMENT] ([ID], [CODE], [NAME_EN], [NAME_FR], [EFFECTIVE_DATE], [USER_CREATED], [DATE_CREATED], [USER_UPDATED], [DATE_UPDATED])
VALUES (0, 'BI', 'Bilingual Imperative', 'Bilingue impératif', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(1, 'BNI', 'Bilingual Non-imperative', 'Bilingue non-impérative', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(2, 'EE-AE', 'English Essential', 'Anglais essentiel', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(3, 'FE', 'French Essential', 'Français essentiel', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(4, 'EF-AF', 'Either/or: English or French', 'Réversible: Anglais ou français', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(5, 'VAR', 'Various', 'Variés', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP);

--changeset system:cd_language_requirement_off context:mssql
SET IDENTITY_INSERT CD_LANGUAGE_REQUIREMENT OFF;

--changeset system:cd_profile_status_on context:mssql
SET IDENTITY_INSERT CD_PROFILE_STATUS ON;

--changeset system:cd_profile_status
INSERT INTO [CD_PROFILE_STATUS] ([ID], [CODE], [NAME_EN], [NAME_FR], [EFFECTIVE_DATE], [USER_CREATED], [DATE_CREATED], [USER_UPDATED], [DATE_UPDATED])
VALUES (0, 'PENDING', 'Pending approval', 'En attente d''approbation', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(1, 'APPROVED', 'Approved', 'Approuvé', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(2, 'INCOMPLETE', 'In progress', 'En cours', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(3, 'ARCHIVED', 'Archived', 'Archivé', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP);

--changeset system:cd_profile_status_off context:mssql
SET IDENTITY_INSERT CD_PROFILE_STATUS OFF;

--changeset system:cd_request_status_on context:mssql
SET IDENTITY_INSERT CD_REQUEST_STATUS ON;

--changeset system:cd_request_status
INSERT INTO [CD_REQUEST_STATUS] ([ID], [CODE], [NAME_EN], [NAME_FR], [EFFECTIVE_DATE], [USER_CREATED], [DATE_CREATED], [USER_UPDATED], [DATE_UPDATED])
VALUES (0, 'DR-EB', 'Draft', 'Ébauche', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(1, 'RS-DS', 'Request Submitted', 'Demande soumise', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(2, 'AHR-ARH', 'Assigned - HR review', 'Assignée - Revue RH', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(3, 'APP', 'Approved -  Assessment Feedback Pending', 'Approuvée - En attente de retroaction d''évaluation', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(4, 'P-EA', 'Pending - Feedback Pending Approval', 'En attente - retroaction d''évaluation en attente d''approbation', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(5, 'CG-AA', 'Clearance Granted', 'Autorisation accordée', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(6, 'C-A', 'Cancelled', 'Annulée', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP);

--changeset system:cd_request_status_off context:mssql
SET IDENTITY_INSERT CD_REQUEST_STATUS OFF;

--changeset system:cd_security_clearance_on context:mssql
SET IDENTITY_INSERT CD_SECURITY_CLEARANCE ON;

--changeset system:cd_security_clearance
INSERT INTO [CD_SECURITY_CLEARANCE] ([ID], [CODE], [NAME_EN], [NAME_FR], [EFFECTIVE_DATE], [USER_CREATED], [DATE_CREATED], [USER_UPDATED], [DATE_UPDATED])
VALUES (0, 'R-F', 'Reliability', 'Fiabilité', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(1, 'ER-FA', 'Enhanced Reliability', 'Fiabilité approfondie', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(2, 'SEC', 'Secret', 'Secret', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(3, 'ES-SA', 'Enhanced Secret', 'Secret approfondie', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(4, 'TS', 'Top Secret', 'Très secret', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(5, 'ETS-TSA', 'Enhanced Top Secret', 'Très secret approfondie', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(6, 'VAR', 'Various', 'Variés', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP);

--changeset system:cd_security_clearance_off context:mssql
SET IDENTITY_INSERT CD_SECURITY_CLEARANCE OFF;

--changeset system:cd_selection_process_type_on context:mssql
SET IDENTITY_INSERT CD_SELECTION_PROCESS_TYPE ON;

--changeset system:cd_selection_process_type
INSERT INTO [CD_SELECTION_PROCESS_TYPE] ([ID], [CODE], [NAME_EN], [NAME_FR], [EFFECTIVE_DATE], [USER_CREATED], [DATE_CREATED], [USER_UPDATED], [DATE_UPDATED])
VALUES (0, 'AEP', 'Appointment - ESDC Priority', 'Nomination - Priorité d''EDSC', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(1, 'AODP', 'Appointment - Other Department Priority', 'Nomination - Priorité autre ministère', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(2, 'AEA', 'Appointment - External Advertised (from outside the public service)', 'Nomination - Externe annoncé (de l''extérieur de la fonction publique)', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(3, 'AENA', 'Appointment - External Non-Advertised (from outside the public service)', 'Nomination - Externe non-annoncé (de l''extérieur de la fonction publique)', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(4, 'AIA', 'Appointment - Internal Advertised (from inside the public service)', 'Nomination - Interne annoncé (au sein de la fonction publique)', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(5, 'AINA', 'Appointment - Internal Non-Advertised (from inside the public service)', 'Nomination - Interne non-annoncé (au sein de la fonction publique)', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(6, 'IAP', 'Initiate an Avertised Process (Internal or External)', 'Initiation d''un processus annoncé (Interne ou externe)', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(7, 'DEP', 'Deployment - ESDC Priority', 'Mutation - Priorité d''EDSC', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(8, 'DWE', 'Deployment - From within ESDC', 'Mutation - Au sein de EDSC', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(9, 'DAD', 'Deployment - From another department/agency', 'Mutation - D''un autre ministère', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP);

--changeset system:cd_selection_process_type_off context:mssql
SET IDENTITY_INSERT CD_SELECTION_PROCESS_TYPE OFF;

--changeset system:cd_user_type_on context:mssql
SET IDENTITY_INSERT CD_USER_TYPE ON;

--changeset system:cd_user_type
INSERT INTO [CD_USER_TYPE] ([ID], [CODE], [NAME_EN], [NAME_FR], [EFFECTIVE_DATE], [USER_CREATED], [DATE_CREATED], [USER_UPDATED], [DATE_UPDATED])
VALUES (0, 'employee', 'Employee', 'Employé', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(1, 'admin', 'Administrator', 'Administrateur', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(2, 'hiring-manager', 'Hiring Manager', 'Gestionnaire de recrutement', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(3, 'HRA', 'HR Advisor', 'Conseiller en R.H.', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP);

--changeset system:cd_user_type_off context:mssql
SET IDENTITY_INSERT CD_USER_TYPE OFF;

--changeset system:cd_work_schedule_on context:mssql
SET IDENTITY_INSERT CD_WORK_SCHEDULE ON;

--changeset system:cd_work_schedule
INSERT INTO [CD_WORK_SCHEDULE] ([ID], [CODE], [NAME_EN], [NAME_FR], [EFFECTIVE_DATE], [USER_CREATED], [DATE_CREATED], [USER_UPDATED], [DATE_UPDATED])
VALUES (0, 'FULL_TIME', 'Full-time', 'Temps plein', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(1, 'PART_TIME', 'Part-time', 'Temps partiel', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(2, 'CASUAL', 'Casual', 'Occasionnel', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(3, 'TERM', 'Term', 'Durée déterminée', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP);

--changeset system:cd_work_schedule_off context:mssql
SET IDENTITY_INSERT CD_WORK_SCHEDULE OFF;

--changeset system:cd_match_status_on context:mssql
SET IDENTITY_INSERT CD_MATCH_STATUS ON;

--changeset system:cd_match_status
INSERT INTO [CD_MATCH_STATUS] ([ID], [CODE], [NAME_EN], [NAME_FR], [EFFECTIVE_DATE], [USER_CREATED], [DATE_CREATED], [USER_UPDATED], [DATE_UPDATED])
VALUES (0, 'IP-EC', 'In Progress', 'En cours', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(1, 'PA-EAA', 'Pending Approval', 'En attente d''approbation', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(2, 'A-A', 'Approved', 'Approuvé', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP);

--changeset system:cd_match_status_off context:mssql
SET IDENTITY_INSERT CD_MATCH_STATUS OFF;
