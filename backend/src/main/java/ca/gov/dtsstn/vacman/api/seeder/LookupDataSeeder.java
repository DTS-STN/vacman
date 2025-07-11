package ca.gov.dtsstn.vacman.api.seeder;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import ca.gov.dtsstn.vacman.api.config.DatabaseSeederConfig;
import ca.gov.dtsstn.vacman.api.data.entity.AppointmentNonAdvertisedEntity;
import ca.gov.dtsstn.vacman.api.data.entity.CityEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ClassificationEntity;
import ca.gov.dtsstn.vacman.api.data.entity.EmploymentEquityEntity;
import ca.gov.dtsstn.vacman.api.data.entity.EmploymentOpportunityEntity;
import ca.gov.dtsstn.vacman.api.data.entity.EmploymentTenureEntity;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageEntity;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageReferralTypeEntity;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageRequirementEntity;
import ca.gov.dtsstn.vacman.api.data.entity.PriorityLevelEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileStatusEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProvinceEntity;
import ca.gov.dtsstn.vacman.api.data.entity.RequestStatusEntity;
import ca.gov.dtsstn.vacman.api.data.entity.SecurityClearanceEntity;
import ca.gov.dtsstn.vacman.api.data.entity.SelectionProcessTypeEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserTypeEntity;
import ca.gov.dtsstn.vacman.api.data.entity.WfaStatusEntity;
import ca.gov.dtsstn.vacman.api.data.entity.WorkScheduleEntity;
import ca.gov.dtsstn.vacman.api.data.entity.WorkUnitEntity;
import ca.gov.dtsstn.vacman.api.data.repository.AppointmentNonAdvertisedRepository;
import ca.gov.dtsstn.vacman.api.data.repository.CityRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ClassificationRepository;
import ca.gov.dtsstn.vacman.api.data.repository.EmploymentEquityRepository;
import ca.gov.dtsstn.vacman.api.data.repository.EmploymentOpportunityRepository;
import ca.gov.dtsstn.vacman.api.data.repository.EmploymentTenureRepository;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageReferralTypeRepository;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageRepository;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageRequirementRepository;
import ca.gov.dtsstn.vacman.api.data.repository.PriorityLevelRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProvinceRepository;
import ca.gov.dtsstn.vacman.api.data.repository.RequestStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.SecurityClearanceRepository;
import ca.gov.dtsstn.vacman.api.data.repository.SelectionProcessTypeRepository;
import ca.gov.dtsstn.vacman.api.data.repository.UserTypeRepository;
import ca.gov.dtsstn.vacman.api.data.repository.WfaStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.WorkScheduleRepository;
import ca.gov.dtsstn.vacman.api.data.repository.WorkUnitRepository;

/**
 * Seeds lookup/reference tables with predefined data.
 * These tables contain relatively static data used throughout the application.
 * Aligned with DDL tables.
 */
@Component
@Profile({"dev", "local", "h2"})
public class LookupDataSeeder {

    private static final Logger logger = LoggerFactory.getLogger(LookupDataSeeder.class);

    private final DatabaseSeederConfig config;

    // All lookup table repositories based on DDL CD_ tables
    private final AppointmentNonAdvertisedRepository appointmentNonAdvertisedRepository;
    private final CityRepository cityRepository;
    private final ClassificationRepository classificationRepository;
    private final EmploymentEquityRepository employmentEquityRepository;
    private final EmploymentOpportunityRepository employmentOpportunityRepository;
    private final EmploymentTenureRepository employmentTenureRepository;
    private final LanguageRepository languageRepository;
    private final LanguageReferralTypeRepository languageReferralTypeRepository;
    private final LanguageRequirementRepository languageRequirementRepository;
    private final PriorityLevelRepository priorityLevelRepository;
    private final ProfileStatusRepository profileStatusRepository;
    private final ProvinceRepository provinceRepository;
    private final RequestStatusRepository requestStatusRepository;
    private final SecurityClearanceRepository securityClearanceRepository;
    private final SelectionProcessTypeRepository selectionProcessTypeRepository;
    private final UserTypeRepository userTypeRepository;
    private final WfaStatusRepository wfaStatusRepository;
    private final WorkScheduleRepository workScheduleRepository;
    private final WorkUnitRepository workUnitRepository;

    public LookupDataSeeder(
        DatabaseSeederConfig config,
        AppointmentNonAdvertisedRepository appointmentNonAdvertisedRepository,
        CityRepository cityRepository,
        ClassificationRepository classificationRepository,
        EmploymentEquityRepository employmentEquityRepository,
        EmploymentOpportunityRepository employmentOpportunityRepository,
        EmploymentTenureRepository employmentTenureRepository,
        LanguageRepository languageRepository,
        LanguageReferralTypeRepository languageReferralTypeRepository,
        LanguageRequirementRepository languageRequirementRepository,
        PriorityLevelRepository priorityLevelRepository,
        ProfileStatusRepository profileStatusRepository,
        ProvinceRepository provinceRepository,
        RequestStatusRepository requestStatusRepository,
        SecurityClearanceRepository securityClearanceRepository,
        SelectionProcessTypeRepository selectionProcessTypeRepository,
        UserTypeRepository userTypeRepository,
        WfaStatusRepository wfaStatusRepository,
        WorkScheduleRepository workScheduleRepository,
        WorkUnitRepository workUnitRepository
    ) {
        this.config = config;
        this.appointmentNonAdvertisedRepository = appointmentNonAdvertisedRepository;
        this.cityRepository = cityRepository;
        this.classificationRepository = classificationRepository;
        this.employmentEquityRepository = employmentEquityRepository;
        this.employmentOpportunityRepository = employmentOpportunityRepository;
        this.employmentTenureRepository = employmentTenureRepository;
        this.languageRepository = languageRepository;
        this.languageReferralTypeRepository = languageReferralTypeRepository;
        this.languageRequirementRepository = languageRequirementRepository;
        this.priorityLevelRepository = priorityLevelRepository;
        this.profileStatusRepository = profileStatusRepository;
        this.provinceRepository = provinceRepository;
        this.requestStatusRepository = requestStatusRepository;
        this.securityClearanceRepository = securityClearanceRepository;
        this.selectionProcessTypeRepository = selectionProcessTypeRepository;
        this.userTypeRepository = userTypeRepository;
        this.wfaStatusRepository = wfaStatusRepository;
        this.workScheduleRepository = workScheduleRepository;
        this.workUnitRepository = workUnitRepository;
    }

    @Transactional
    public void seedLookupData() {
        if (!config.isSeedLookupTables()) {
            logger.debug("Lookup data seeding is disabled.");
            return;
        }

        logger.info("Seeding lookup data...");

        // Seed all lookup tables in DDL order
        seedLanguages();
        seedProvinces();
        seedCities();
        seedClassifications();
        seedEmploymentEquity();
        seedEmploymentOpportunity();
        seedEmploymentTenure();
        seedLanguageReferralTypes();
        seedLanguageRequirements();
        seedPriorityLevels();
        seedProfileStatuses();
        seedRequestStatuses();
        seedSecurityClearances();
        seedSelectionProcessTypes();
        seedUserTypes();
        seedWfaStatuses();
        seedWorkSchedules();
        seedWorkUnits();
        seedAppointmentNonAdvertised();

        logger.info("Lookup data seeding completed.");
    }

    @Transactional
    public void clearLookupData() {
        logger.info("Clearing lookup data...");

        // Clear in reverse dependency order
        appointmentNonAdvertisedRepository.deleteAll();
        workUnitRepository.deleteAll();
        workScheduleRepository.deleteAll();
        wfaStatusRepository.deleteAll();
        userTypeRepository.deleteAll();
        selectionProcessTypeRepository.deleteAll();
        securityClearanceRepository.deleteAll();
        requestStatusRepository.deleteAll();
        profileStatusRepository.deleteAll();
        priorityLevelRepository.deleteAll();
        languageRequirementRepository.deleteAll();
        languageReferralTypeRepository.deleteAll();
        employmentTenureRepository.deleteAll();
        employmentOpportunityRepository.deleteAll();
        employmentEquityRepository.deleteAll();
        classificationRepository.deleteAll();
        cityRepository.deleteAll();
        provinceRepository.deleteAll();
        languageRepository.deleteAll();

        logger.info("Lookup data cleared.");
    }

    private void seedLanguages() {
        if (languageRepository.count() > 0) return;

        List<LanguageEntity> languages = Arrays.asList(
            createLanguage("EN", "English", "Anglais"),
            createLanguage("FR", "French", "Français"),
            createLanguage("BOTH", "Both Official Languages", "Les deux langues officielles")
        );

        languageRepository.saveAll(languages);
        logger.info("Seeded {} languages.", languages.size());
    }

    private void seedProvinces() {
        if (provinceRepository.count() > 0) return;

        List<ProvinceEntity> provinces = Arrays.asList(
            createProvince("AB", "Alberta", "Alberta"),
            createProvince("BC", "British Columbia", "Colombie-Britannique"),
            createProvince("MB", "Manitoba", "Manitoba"),
            createProvince("NB", "New Brunswick", "Nouveau-Brunswick"),
            createProvince("NL", "Newfoundland and Labrador", "Terre-Neuve-et-Labrador"),
            createProvince("NT", "Northwest Territories", "Territoires du Nord-Ouest"),
            createProvince("NS", "Nova Scotia", "Nouvelle-Écosse"),
            createProvince("NU", "Nunavut", "Nunavut"),
            createProvince("ON", "Ontario", "Ontario"),
            createProvince("PE", "Prince Edward Island", "Île-du-Prince-Édouard"),
            createProvince("QC", "Quebec", "Québec"),
            createProvince("SK", "Saskatchewan", "Saskatchewan"),
            createProvince("YT", "Yukon", "Yukon")
        );

        provinceRepository.saveAll(provinces);
        logger.info("Seeded {} provinces/territories.", provinces.size());
    }

    private void seedCities() {
        if (cityRepository.count() > 0) return;

        // Get provinces for foreign key relationships
        ProvinceEntity ontario = provinceRepository.findByCode("ON").orElseThrow();
        ProvinceEntity quebec = provinceRepository.findByCode("QC").orElseThrow();
        ProvinceEntity bc = provinceRepository.findByCode("BC").orElseThrow();
        ProvinceEntity alberta = provinceRepository.findByCode("AB").orElseThrow();

        List<CityEntity> cities = Arrays.asList(
            createCity("OTT", "Ottawa", "Ottawa", ontario),
            createCity("TOR", "Toronto", "Toronto", ontario),
            createCity("MTL", "Montreal", "Montréal", quebec),
            createCity("QC", "Quebec City", "Ville de Québec", quebec),
            createCity("VAN", "Vancouver", "Vancouver", bc),
            createCity("CAL", "Calgary", "Calgary", alberta),
            createCity("EDM", "Edmonton", "Edmonton", alberta)
        );

        cityRepository.saveAll(cities);
        logger.info("Seeded {} cities.", cities.size());
    }

    private void seedClassifications() {
        if (classificationRepository.count() > 0) return;

        List<ClassificationEntity> classifications = Arrays.asList(
            createClassification("AS-01", "Administrative Services AS-01", "Services administratifs AS-01"),
            createClassification("AS-02", "Administrative Services AS-02", "Services administratifs AS-02"),
            createClassification("AS-03", "Administrative Services AS-03", "Services administratifs AS-03"),
            createClassification("CS-01", "Computer Systems CS-01", "Systèmes informatiques CS-01"),
            createClassification("CS-02", "Computer Systems CS-02", "Systèmes informatiques CS-02"),
            createClassification("CS-03", "Computer Systems CS-03", "Systèmes informatiques CS-03"),
            createClassification("EC-02", "Economics and Social Science Services EC-02", "Services d'économique et de sciences sociales EC-02"),
            createClassification("EC-03", "Economics and Social Science Services EC-03", "Services d'économique et de sciences sociales EC-03"),
            createClassification("PM-01", "Program and Administrative Services PM-01", "Services des programmes et de l'administration PM-01"),
            createClassification("PM-02", "Program and Administrative Services PM-02", "Services des programmes et de l'administration PM-02")
        );

        classificationRepository.saveAll(classifications);
        logger.info("Seeded {} classifications.", classifications.size());
    }

    private void seedEmploymentEquity() {
        if (employmentEquityRepository.count() > 0) return;

        List<EmploymentEquityEntity> equities = Arrays.asList(
            createEmploymentEquity("WOMEN", "Women", "Femmes"),
            createEmploymentEquity("INDIGENOUS", "Indigenous Peoples", "Peuples autochtones"),
            createEmploymentEquity("PERSONS_DISABILITIES", "Persons with Disabilities", "Personnes handicapées"),
            createEmploymentEquity("VISIBLE_MINORITIES", "Visible Minorities", "Minorités visibles")
        );

        employmentEquityRepository.saveAll(equities);
        logger.info("Seeded {} employment equity categories.", equities.size());
    }

    private void seedEmploymentOpportunity() {
        if (employmentOpportunityRepository.count() > 0) return;

        List<EmploymentOpportunityEntity> opportunities = Arrays.asList(
            createEmploymentOpportunity("FULL_TIME", "Full-time", "Temps plein"),
            createEmploymentOpportunity("PART_TIME", "Part-time", "Temps partiel"),
            createEmploymentOpportunity("TERM", "Term", "Durée déterminée"),
            createEmploymentOpportunity("CASUAL", "Casual", "Occasionnel"),
            createEmploymentOpportunity("STUDENT", "Student", "Étudiant")
        );

        employmentOpportunityRepository.saveAll(opportunities);
        logger.info("Seeded {} employment opportunities.", opportunities.size());
    }

    private void seedEmploymentTenure() {
        if (employmentTenureRepository.count() > 0) return;

        List<EmploymentTenureEntity> tenures = Arrays.asList(
            createEmploymentTenure("INDETERMINATE", "Indeterminate", "Indéterminée"),
            createEmploymentTenure("TERM", "Term", "Durée déterminée"),
            createEmploymentTenure("CASUAL", "Casual", "Occasionnel"),
            createEmploymentTenure("STUDENT", "Student", "Étudiant")
        );

        employmentTenureRepository.saveAll(tenures);
        logger.info("Seeded {} employment tenures.", tenures.size());
    }

    private void seedLanguageReferralTypes() {
        if (languageReferralTypeRepository.count() > 0) return;

        List<LanguageReferralTypeEntity> types = Arrays.asList(
            createLanguageReferralType("ENGLISH_ESSENTIAL", "English Essential", "Anglais essentiel"),
            createLanguageReferralType("FRENCH_ESSENTIAL", "French Essential", "Français essentiel"),
            createLanguageReferralType("BILINGUAL_IMPERATIVE", "Bilingual Imperative", "Bilingue impératif"),
            createLanguageReferralType("BILINGUAL_NON_IMPERATIVE", "Bilingual Non-Imperative", "Bilingue non impératif")
        );

        languageReferralTypeRepository.saveAll(types);
        logger.info("Seeded {} language referral types.", types.size());
    }

    private void seedLanguageRequirements() {
        if (languageRequirementRepository.count() > 0) return;

        List<LanguageRequirementEntity> requirements = Arrays.asList(
            createLanguageRequirement("BBB", "BBB - Bilingual Imperative", "BBB - Bilingue impératif"),
            createLanguageRequirement("CBC", "CBC - Bilingual Imperative", "CBC - Bilingue impératif"),
            createLanguageRequirement("CCC", "CCC - Bilingual Imperative", "CCC - Bilingue impératif"),
            createLanguageRequirement("EEE", "English Essential", "Anglais essentiel"),
            createLanguageRequirement("000", "French Essential", "Français essentiel")
        );

        languageRequirementRepository.saveAll(requirements);
        logger.info("Seeded {} language requirements.", requirements.size());
    }

    private void seedPriorityLevels() {
        if (priorityLevelRepository.count() > 0) return;

        List<PriorityLevelEntity> levels = Arrays.asList(
            createPriorityLevel("HIGH", "High Priority", "Priorité élevée"),
            createPriorityLevel("MEDIUM", "Medium Priority", "Priorité moyenne"),
            createPriorityLevel("LOW", "Low Priority", "Priorité faible"),
            createPriorityLevel("URGENT", "Urgent", "Urgent")
        );

        priorityLevelRepository.saveAll(levels);
        logger.info("Seeded {} priority levels.", levels.size());
    }

    private void seedProfileStatuses() {
        if (profileStatusRepository.count() > 0) return;

        List<ProfileStatusEntity> statuses = Arrays.asList(
            createProfileStatus("ACTIVE", "Active", "Actif"),
            createProfileStatus("INACTIVE", "Inactive", "Inactif"),
            createProfileStatus("PENDING", "Pending", "En attente"),
            createProfileStatus("SUSPENDED", "Suspended", "Suspendu")
        );

        profileStatusRepository.saveAll(statuses);
        logger.info("Seeded {} profile statuses.", statuses.size());
    }

    private void seedRequestStatuses() {
        if (requestStatusRepository.count() > 0) return;

        List<RequestStatusEntity> statuses = Arrays.asList(
            createRequestStatus("DRAFT", "Draft", "Brouillon"),
            createRequestStatus("SUBMITTED", "Submitted", "Soumis"),
            createRequestStatus("IN_PROGRESS", "In Progress", "En cours"),
            createRequestStatus("COMPLETED", "Completed", "Terminé"),
            createRequestStatus("CANCELLED", "Cancelled", "Annulé")
        );

        requestStatusRepository.saveAll(statuses);
        logger.info("Seeded {} request statuses.", statuses.size());
    }

    private void seedSecurityClearances() {
        if (securityClearanceRepository.count() > 0) return;

        List<SecurityClearanceEntity> clearances = Arrays.asList(
            createSecurityClearance("RELIABILITY", "Reliability", "Fiabilité"),
            createSecurityClearance("SECRET", "Secret", "Secret"),
            createSecurityClearance("TOP_SECRET", "Top Secret", "Très secret"),
            createSecurityClearance("ENHANCED_RELIABILITY", "Enhanced Reliability", "Fiabilité renforcée")
        );

        securityClearanceRepository.saveAll(clearances);
        logger.info("Seeded {} security clearances.", clearances.size());
    }

    private void seedSelectionProcessTypes() {
        if (selectionProcessTypeRepository.count() > 0) return;

        List<SelectionProcessTypeEntity> types = Arrays.asList(
            createSelectionProcessType("ADVERTISED", "Advertised Process", "Processus annoncé"),
            createSelectionProcessType("NON_ADVERTISED", "Non-Advertised Process", "Processus non annoncé"),
            createSelectionProcessType("POOL", "Pool Process", "Processus de bassin"),
            createSelectionProcessType("DIRECT_APPOINTMENT", "Direct Appointment", "Nomination directe")
        );

        selectionProcessTypeRepository.saveAll(types);
        logger.info("Seeded {} selection process types.", types.size());
    }

    private void seedUserTypes() {
        if (userTypeRepository.count() > 0) return;

        List<UserTypeEntity> types = Arrays.asList(
            createUserType("EMPLOYEE", "Employee", "Employé"),
            createUserType("HR_ADVISOR", "HR Advisor", "Conseiller RH"),
            createUserType("HIRING_MANAGER", "Hiring Manager", "Gestionnaire d'embauche"),
            createUserType("ADMINISTRATOR", "Administrator", "Administrateur")
        );

        userTypeRepository.saveAll(types);
        logger.info("Seeded {} user types.", types.size());
    }

    private void seedWfaStatuses() {
        if (wfaStatusRepository.count() > 0) return;

        List<WfaStatusEntity> statuses = Arrays.asList(
            createWfaStatus("AVAILABLE", "Available", "Disponible"),
            createWfaStatus("DEPLOYED", "Deployed", "Déployé"),
            createWfaStatus("NOT_AVAILABLE", "Not Available", "Non disponible"),
            createWfaStatus("ON_ASSIGNMENT", "On Assignment", "En affectation")
        );

        wfaStatusRepository.saveAll(statuses);
        logger.info("Seeded {} WFA statuses.", statuses.size());
    }

    private void seedWorkSchedules() {
        if (workScheduleRepository.count() > 0) return;

        List<WorkScheduleEntity> schedules = Arrays.asList(
            createWorkSchedule("FULL_TIME", "Full-time (37.5 hours)", "Temps plein (37,5 heures)"),
            createWorkSchedule("PART_TIME_75", "Part-time (75%)", "Temps partiel (75 %)"),
            createWorkSchedule("PART_TIME_50", "Part-time (50%)", "Temps partiel (50 %)"),
            createWorkSchedule("FLEXIBLE", "Flexible Schedule", "Horaire flexible")
        );

        workScheduleRepository.saveAll(schedules);
        logger.info("Seeded {} work schedules.", schedules.size());
    }

    private void seedWorkUnits() {
        if (workUnitRepository.count() > 0) return;

        List<WorkUnitEntity> units = Arrays.asList(
            createWorkUnit("ESDC", "Employment and Social Development Canada", "Emploi et Développement social Canada", null),
            createWorkUnit("DTS", "Digital Technology Solutions", "Solutions technologiques numériques", null),
            createWorkUnit("HR", "Human Resources", "Ressources humaines", null),
            createWorkUnit("FINANCE", "Finance", "Finances", null),
            createWorkUnit("OPERATIONS", "Operations", "Opérations", null)
        );

        workUnitRepository.saveAll(units);
        logger.info("Seeded {} work units.", units.size());
    }

    private void seedAppointmentNonAdvertised() {
        if (appointmentNonAdvertisedRepository.count() > 0) return;

        List<AppointmentNonAdvertisedEntity> appointments = Arrays.asList(
            createAppointmentNonAdvertised("DEPLOYMENT", "Deployment", "Déploiement"),
            createAppointmentNonAdvertised("ASSIGNMENT", "Assignment", "Affectation"),
            createAppointmentNonAdvertised("SECONDMENT", "Secondment", "Détachement"),
            createAppointmentNonAdvertised("INTERCHANGE", "Interchange", "Échange")
        );

        appointmentNonAdvertisedRepository.saveAll(appointments);
        logger.info("Seeded {} appointment non-advertised types.", appointments.size());
    }

    // Helper methods to create entities
    private LanguageEntity createLanguage(String code, String nameEn, String nameFr) {
        LanguageEntity entity = new LanguageEntity();
        entity.setCode(code);
        entity.setNameEn(nameEn);
        entity.setNameFr(nameFr);
        entity.setEffectiveDate(LocalDateTime.now());
        entity.setCreatedBy("SYSTEM");
        return entity;
    }

    private ProvinceEntity createProvince(String code, String nameEn, String nameFr) {
        ProvinceEntity entity = new ProvinceEntity();
        entity.setCode(code);
        entity.setNameEn(nameEn);
        entity.setNameFr(nameFr);
        entity.setEffectiveDate(LocalDateTime.now());
        entity.setCreatedBy("SYSTEM");
        return entity;
    }

    private CityEntity createCity(String code, String nameEn, String nameFr, ProvinceEntity province) {
        CityEntity entity = new CityEntity();
        entity.setCode(code);
        entity.setNameEn(nameEn);
        entity.setNameFr(nameFr);            entity.setProvinceTerritory(province);
        entity.setEffectiveDate(LocalDateTime.now());
        entity.setCreatedBy("SYSTEM");
        return entity;
    }

    private ClassificationEntity createClassification(String code, String nameEn, String nameFr) {
        ClassificationEntity entity = new ClassificationEntity();
        entity.setCode(code);
        entity.setNameEn(nameEn);
        entity.setNameFr(nameFr);
        entity.setEffectiveDate(LocalDateTime.now());
        entity.setCreatedBy("SYSTEM");
        return entity;
    }

    private EmploymentEquityEntity createEmploymentEquity(String code, String nameEn, String nameFr) {
        EmploymentEquityEntity entity = new EmploymentEquityEntity();
        entity.setCode(code);
        entity.setNameEn(nameEn);
        entity.setNameFr(nameFr);
        entity.setEffectiveDate(LocalDateTime.now());
        entity.setCreatedBy("SYSTEM");
        return entity;
    }

    private EmploymentOpportunityEntity createEmploymentOpportunity(String code, String nameEn, String nameFr) {
        EmploymentOpportunityEntity entity = new EmploymentOpportunityEntity();
        entity.setCode(code);
        entity.setNameEn(nameEn);
        entity.setNameFr(nameFr);
        entity.setEffectiveDate(LocalDateTime.now());
        entity.setCreatedBy("SYSTEM");
        return entity;
    }

    private EmploymentTenureEntity createEmploymentTenure(String code, String nameEn, String nameFr) {
        EmploymentTenureEntity entity = new EmploymentTenureEntity();
        entity.setCode(code);
        entity.setNameEn(nameEn);
        entity.setNameFr(nameFr);
        entity.setEffectiveDate(LocalDateTime.now());
        entity.setCreatedBy("SYSTEM");
        return entity;
    }

    private LanguageReferralTypeEntity createLanguageReferralType(String code, String nameEn, String nameFr) {
        LanguageReferralTypeEntity entity = new LanguageReferralTypeEntity();
        entity.setCode(code);
        entity.setNameEn(nameEn);
        entity.setNameFr(nameFr);
        entity.setEffectiveDate(LocalDateTime.now());
        entity.setCreatedBy("SYSTEM");
        return entity;
    }

    private LanguageRequirementEntity createLanguageRequirement(String code, String nameEn, String nameFr) {
        LanguageRequirementEntity entity = new LanguageRequirementEntity();
        entity.setCode(code);
        entity.setNameEn(nameEn);
        entity.setNameFr(nameFr);
        entity.setEffectiveDate(LocalDateTime.now());
        entity.setCreatedBy("SYSTEM");
        return entity;
    }

    private PriorityLevelEntity createPriorityLevel(String code, String nameEn, String nameFr) {
        PriorityLevelEntity entity = new PriorityLevelEntity();
        entity.setCode(code);
        entity.setNameEn(nameEn);
        entity.setNameFr(nameFr);
        entity.setEffectiveDate(LocalDateTime.now());
        entity.setCreatedBy("SYSTEM");
        return entity;
    }

    private ProfileStatusEntity createProfileStatus(String code, String nameEn, String nameFr) {
        ProfileStatusEntity entity = new ProfileStatusEntity();
        entity.setCode(code);
        entity.setNameEn(nameEn);
        entity.setNameFr(nameFr);
        entity.setEffectiveDate(LocalDateTime.now());
        entity.setCreatedBy("SYSTEM");
        return entity;
    }

    private RequestStatusEntity createRequestStatus(String code, String nameEn, String nameFr) {
        RequestStatusEntity entity = new RequestStatusEntity();
        entity.setCode(code);
        entity.setNameEn(nameEn);
        entity.setNameFr(nameFr);
        entity.setEffectiveDate(LocalDateTime.now());
        entity.setCreatedBy("SYSTEM");
        return entity;
    }

    private SecurityClearanceEntity createSecurityClearance(String code, String nameEn, String nameFr) {
        SecurityClearanceEntity entity = new SecurityClearanceEntity();
        entity.setCode(code);
        entity.setNameEn(nameEn);
        entity.setNameFr(nameFr);
        entity.setEffectiveDate(LocalDateTime.now());
        entity.setCreatedBy("SYSTEM");
        return entity;
    }

    private SelectionProcessTypeEntity createSelectionProcessType(String code, String nameEn, String nameFr) {
        SelectionProcessTypeEntity entity = new SelectionProcessTypeEntity();
        entity.setCode(code);
        entity.setNameEn(nameEn);
        entity.setNameFr(nameFr);
        entity.setEffectiveDate(LocalDateTime.now());
        entity.setCreatedBy("SYSTEM");
        return entity;
    }

    private UserTypeEntity createUserType(String code, String nameEn, String nameFr) {
        UserTypeEntity entity = new UserTypeEntity();
        entity.setCode(code);
        entity.setNameEn(nameEn);
        entity.setNameFr(nameFr);
        entity.setEffectiveDate(LocalDateTime.now());
        entity.setCreatedBy("SYSTEM");
        return entity;
    }

    private WfaStatusEntity createWfaStatus(String code, String nameEn, String nameFr) {
        WfaStatusEntity entity = new WfaStatusEntity();
        entity.setCode(code);
        entity.setNameEn(nameEn);
        entity.setNameFr(nameFr);
        entity.setEffectiveDate(LocalDateTime.now());
        entity.setCreatedBy("SYSTEM");
        return entity;
    }

    private WorkScheduleEntity createWorkSchedule(String code, String nameEn, String nameFr) {
        WorkScheduleEntity entity = new WorkScheduleEntity();
        entity.setCode(code);
        entity.setNameEn(nameEn);
        entity.setNameFr(nameFr);
        entity.setEffectiveDate(LocalDateTime.now());
        entity.setCreatedBy("SYSTEM");
        return entity;
    }

    private WorkUnitEntity createWorkUnit(String code, String nameEn, String nameFr, WorkUnitEntity parent) {
        WorkUnitEntity entity = new WorkUnitEntity();
        entity.setCode(code);
        entity.setNameEn(nameEn);
        entity.setNameFr(nameFr);            entity.setParent(parent);
        entity.setEffectiveDate(LocalDateTime.now());
        entity.setCreatedBy("SYSTEM");
        return entity;
    }

    private AppointmentNonAdvertisedEntity createAppointmentNonAdvertised(String code, String nameEn, String nameFr) {
        AppointmentNonAdvertisedEntity entity = new AppointmentNonAdvertisedEntity();
        entity.setCode(code);
        entity.setNameEn(nameEn);
        entity.setNameFr(nameFr);
        entity.setEffectiveDate(LocalDateTime.now());
        entity.setCreatedBy("SYSTEM");
        return entity;
    }

    /**
     * Public method to seed all lookup tables - called by DatabaseSeeder
     */
    @Transactional
    public void seedLookupTables() {
        seedLookupData();
    }

    /**
     * Public method to clear all lookup tables - called by DatabaseSeeder
     */
    @Transactional
    public void clearLookupTables() {
        if (config.isLogSeedingProgress()) {
            logger.info("Clearing lookup tables...");
        }

        // Clear all lookup repositories in reverse dependency order
        cityRepository.deleteAll();
        provinceRepository.deleteAll();
        workUnitRepository.deleteAll();
        appointmentNonAdvertisedRepository.deleteAll();
        workScheduleRepository.deleteAll();
        wfaStatusRepository.deleteAll();
        userTypeRepository.deleteAll();
        selectionProcessTypeRepository.deleteAll();
        securityClearanceRepository.deleteAll();
        requestStatusRepository.deleteAll();
        profileStatusRepository.deleteAll();
        priorityLevelRepository.deleteAll();
        languageRequirementRepository.deleteAll();
        languageReferralTypeRepository.deleteAll();
        employmentTenureRepository.deleteAll();
        employmentOpportunityRepository.deleteAll();
        employmentEquityRepository.deleteAll();
        classificationRepository.deleteAll();
        languageRepository.deleteAll();

        if (config.isLogSeedingProgress()) {
            logger.info("Lookup tables cleared");
        }
    }
}
