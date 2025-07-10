package ca.gov.dtsstn.vacman.api.seeder;

import java.util.Arrays;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import ca.gov.dtsstn.vacman.api.config.DatabaseSeederConfig;
import ca.gov.dtsstn.vacman.api.data.entity.AssessmentResultEntity;
import ca.gov.dtsstn.vacman.api.data.entity.CityEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ClassificationEntity;
import ca.gov.dtsstn.vacman.api.data.entity.EducationLevelEntity;
import ca.gov.dtsstn.vacman.api.data.entity.EmploymentTenureEntity;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageEntity;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageReferralTypeEntity;
import ca.gov.dtsstn.vacman.api.data.entity.NotificationPurposeEntity;
import ca.gov.dtsstn.vacman.api.data.entity.PriorityLevelEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileStatusEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProvinceEntity;
import ca.gov.dtsstn.vacman.api.data.entity.RequestStatusEntity;
import ca.gov.dtsstn.vacman.api.data.entity.SecurityClearanceEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserTypeEntity;
import ca.gov.dtsstn.vacman.api.data.entity.WfaStatusEntity;
import ca.gov.dtsstn.vacman.api.data.entity.WorkUnitEntity;
import ca.gov.dtsstn.vacman.api.data.repository.AssessmentResultRepository;
import ca.gov.dtsstn.vacman.api.data.repository.CityRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ClassificationRepository;
import ca.gov.dtsstn.vacman.api.data.repository.EducationLevelRepository;
import ca.gov.dtsstn.vacman.api.data.repository.EmploymentTenureRepository;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageReferralTypeRepository;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageRepository;
import ca.gov.dtsstn.vacman.api.data.repository.NotificationPurposeRepository;
import ca.gov.dtsstn.vacman.api.data.repository.PriorityLevelRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProvinceRepository;
import ca.gov.dtsstn.vacman.api.data.repository.RequestStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.SecurityClearanceRepository;
import ca.gov.dtsstn.vacman.api.data.repository.UserTypeRepository;
import ca.gov.dtsstn.vacman.api.data.repository.WfaStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.WorkUnitRepository;

/**
 * Seeds lookup/reference tables with predefined data.
 * These tables contain relatively static data used throughout the application.
 */
@Component
@Profile({"dev", "local", "h2"})
public class LookupDataSeeder {

    private static final Logger logger = LoggerFactory.getLogger(LookupDataSeeder.class);

    private final DatabaseSeederConfig config;

    // Lookup table repositories
    private final AssessmentResultRepository assessmentResultRepository;
    private final CityRepository cityRepository;
    private final ClassificationRepository classificationRepository;
    private final EducationLevelRepository educationLevelRepository;
    private final EmploymentTenureRepository employmentTenureRepository;
    private final LanguageRepository languageRepository;
    private final LanguageReferralTypeRepository languageReferralTypeRepository;
    private final NotificationPurposeRepository notificationPurposeRepository;
    private final PriorityLevelRepository priorityLevelRepository;
    private final ProfileStatusRepository profileStatusRepository;
    private final ProvinceRepository provinceRepository;
    private final RequestStatusRepository requestStatusRepository;
    private final SecurityClearanceRepository securityClearanceRepository;
    private final UserTypeRepository userTypeRepository;
    private final WfaStatusRepository wfaStatusRepository;
    private final WorkUnitRepository workUnitRepository;

    public LookupDataSeeder(
        DatabaseSeederConfig config,
        AssessmentResultRepository assessmentResultRepository,
        CityRepository cityRepository,
        ClassificationRepository classificationRepository,
        EducationLevelRepository educationLevelRepository,
        EmploymentTenureRepository employmentTenureRepository,
        LanguageRepository languageRepository,
        LanguageReferralTypeRepository languageReferralTypeRepository,
        NotificationPurposeRepository notificationPurposeRepository,
        PriorityLevelRepository priorityLevelRepository,
        ProfileStatusRepository profileStatusRepository,
        ProvinceRepository provinceRepository,
        RequestStatusRepository requestStatusRepository,
        SecurityClearanceRepository securityClearanceRepository,
        UserTypeRepository userTypeRepository,
        WfaStatusRepository wfaStatusRepository,
        WorkUnitRepository workUnitRepository
    ) {
        this.config = config;
        this.assessmentResultRepository = assessmentResultRepository;
        this.cityRepository = cityRepository;
        this.classificationRepository = classificationRepository;
        this.educationLevelRepository = educationLevelRepository;
        this.employmentTenureRepository = employmentTenureRepository;
        this.languageRepository = languageRepository;
        this.languageReferralTypeRepository = languageReferralTypeRepository;
        this.notificationPurposeRepository = notificationPurposeRepository;
        this.priorityLevelRepository = priorityLevelRepository;
        this.profileStatusRepository = profileStatusRepository;
        this.provinceRepository = provinceRepository;
        this.requestStatusRepository = requestStatusRepository;
        this.securityClearanceRepository = securityClearanceRepository;
        this.userTypeRepository = userTypeRepository;
        this.wfaStatusRepository = wfaStatusRepository;
        this.workUnitRepository = workUnitRepository;
    }

    @Transactional
    public void seedLookupTables() {
        if (config.isLogSeedingProgress()) {
            logger.info("Seeding lookup tables...");
        }

        seedLanguages();
        seedUserTypes();
        seedProvinces();
        seedCities();
        seedClassifications();
        seedEducationLevels();
        seedEmploymentTenures();
        seedLanguageReferralTypes();
        seedPriorityLevels();
        seedProfileStatuses();
        seedRequestStatuses();
        seedSecurityClearances();
        seedWfaStatuses();
        seedWorkUnits();
        seedAssessmentResults();
        seedNotificationPurposes();

        if (config.isLogSeedingProgress()) {
            logger.info("Lookup tables seeded successfully");
        }
    }

    @Transactional
    public void clearLookupTables() {
        if (config.isLogSeedingProgress()) {
            logger.info("Clearing lookup tables...");
        }

        // Clear in reverse dependency order
        cityRepository.deleteAll();
        notificationPurposeRepository.deleteAll();
        assessmentResultRepository.deleteAll();
        workUnitRepository.deleteAll();
        wfaStatusRepository.deleteAll();
        securityClearanceRepository.deleteAll();
        requestStatusRepository.deleteAll();
        profileStatusRepository.deleteAll();
        priorityLevelRepository.deleteAll();
        languageReferralTypeRepository.deleteAll();
        employmentTenureRepository.deleteAll();
        educationLevelRepository.deleteAll();
        classificationRepository.deleteAll();
        provinceRepository.deleteAll();
        userTypeRepository.deleteAll();
        languageRepository.deleteAll();
    }

    private void seedLanguages() {
        if (languageRepository.count() > 0) return;

        List<LanguageEntity> languages = Arrays.asList(
            createLanguage("EN", "English", "Anglais"),
            createLanguage("FR", "French", "Français")
        );

        languageRepository.saveAll(languages);
        logSeeded("Languages", languages.size());
    }

    private void seedUserTypes() {
        if (userTypeRepository.count() > 0) return;

        List<UserTypeEntity> userTypes = Arrays.asList(
            createUserType("employee", "Employee", "Employé"),
            createUserType("admin", "Administrator", "Administrateur"),
            createUserType("hiring-manager", "Hiring Manager", "Gestionnaire de recrutement")
        );

        userTypeRepository.saveAll(userTypes);
        logSeeded("User Types", userTypes.size());
    }

    private void seedProvinces() {
        if (provinceRepository.count() > 0) return;

        List<ProvinceEntity> provinces = Arrays.asList(
            createProvince("ON", "Ontario", "Ontario"),
            createProvince("QC", "Quebec", "Québec"),
            createProvince("BC", "British Columbia", "Colombie-Britannique"),
            createProvince("AB", "Alberta", "Alberta"),
            createProvince("SK", "Saskatchewan", "Saskatchewan"),
            createProvince("MB", "Manitoba", "Manitoba"),
            createProvince("NB", "New Brunswick", "Nouveau-Brunswick"),
            createProvince("NS", "Nova Scotia", "Nouvelle-Écosse"),
            createProvince("PE", "Prince Edward Island", "Île-du-Prince-Édouard"),
            createProvince("NL", "Newfoundland and Labrador", "Terre-Neuve-et-Labrador"),
            createProvince("NT", "Northwest Territories", "Territoires du Nord-Ouest"),
            createProvince("YT", "Yukon", "Yukon"),
            createProvince("NU", "Nunavut", "Nunavut")
        );

        provinceRepository.saveAll(provinces);
        logSeeded("Provinces", provinces.size());
    }

    private void seedCities() {
        if (cityRepository.count() > 0) return;

        // Get provinces to link cities
        ProvinceEntity ontario = provinceRepository.findAll().stream()
            .filter(p -> "ON".equals(p.getCode()))
            .findFirst()
            .orElse(null);
        ProvinceEntity quebec = provinceRepository.findAll().stream()
            .filter(p -> "QC".equals(p.getCode()))
            .findFirst()
            .orElse(null);
        ProvinceEntity bc = provinceRepository.findAll().stream()
            .filter(p -> "BC".equals(p.getCode()))
            .findFirst()
            .orElse(null);
        ProvinceEntity alberta = provinceRepository.findAll().stream()
            .filter(p -> "AB".equals(p.getCode()))
            .findFirst()
            .orElse(null);

        List<CityEntity> cities = Arrays.asList(
            createCity("ON72", "Toronto", "Toronto", ontario),
            createCity("ON52", "Ottawa", "Ottawa", ontario),
            createCity("ON27", "Hamilton", "Hamilton", ontario),
            createCity("QC39", "Montreal", "Montréal", quebec),
            createCity("QC42", "Quebec City", "Québec", quebec),
            createCity("QC21", "Gatineau", "Gatineau", quebec),
            createCity("BC32", "Vancouver", "Vancouver", bc),
            createCity("BC35", "Victoria", "Victoria", bc),
            createCity("AB2", "Calgary", "Calgary", alberta),
            createCity("AB4", "Edmonton", "Edmonton", alberta)
        );

        cityRepository.saveAll(cities);
        logSeeded("Cities", cities.size());
    }

    private void seedClassifications() {
        if (classificationRepository.count() > 0) return;

        List<ClassificationEntity> classifications = Arrays.asList(
            createClassification("AS-01", "AS-01", "AS-01"),
            createClassification("AS-02", "AS-02", "AS-02"),
            createClassification("AS-03", "AS-03", "AS-03"),
            createClassification("AS-04", "AS-04", "AS-04"),
            createClassification("AS-05", "AS-05", "AS-05"),
            createClassification("AS-06", "AS-06", "AS-06"),
            createClassification("AS-07", "AS-07", "AS-07"),
            createClassification("CR-03", "CR-03", "CR-03"),
            createClassification("CR-04", "CR-04", "CR-04"),
            createClassification("CR-05", "CR-05", "CR-05"),
            createClassification("CT-FIN-01", "CT-FIN-01", "CT-FIN-01"),
            createClassification("CT-FIN-02", "CT-FIN-02", "CT-FIN-02"),
            createClassification("CT-FIN-03", "CT-FIN-03", "CT-FIN-03"),
            createClassification("CT-FIN-04", "CT-FIN-04", "CT-FIN-04"),
            createClassification("CT-IAU-01", "CT-IAU-01", "CT-IAU-01")
        );

        classificationRepository.saveAll(classifications);
        logSeeded("Classifications", classifications.size());
    }

    private void seedEducationLevels() {
        if (educationLevelRepository.count() > 0) return;

        List<EducationLevelEntity> educationLevels = Arrays.asList(
            createEducationLevel("SEC2", "Completed two years of secondary school", "Complété deux ans d'études secondaires"),
            createEducationLevel("SECDIP", "Secondary (high) school diploma or equivalent", "Diplôme d'études secondaires ou équivalent"),
            createEducationLevel("POST2", "Completed two years of a post-secondary program", "Complété deux ans d'un programme postsecondaire"),
            createEducationLevel("POSTDEG", "Graduated with a degree from a recognized post-secondary institution", "Graduation avec un grade d'un établissement d'enseignement postsecondaire reconnu")
        );

        educationLevelRepository.saveAll(educationLevels);
        logSeeded("Education Levels", educationLevels.size());
    }

    private void seedEmploymentTenures() {
        if (employmentTenureRepository.count() > 0) return;

        List<EmploymentTenureEntity> tenures = Arrays.asList(
            createEmploymentTenure("PERM", "Permanent", "Permanent"),
            createEmploymentTenure("TERM", "Term", "Durée déterminée"),
            createEmploymentTenure("CASUAL", "Casual", "Occasionnel"),
            createEmploymentTenure("STUDENT", "Student", "Étudiant"),
            createEmploymentTenure("CONTRACT", "Contract", "Contrat")
        );

        employmentTenureRepository.saveAll(tenures);
        logSeeded("Employment Tenures", tenures.size());
    }

    private void seedLanguageReferralTypes() {
        if (languageReferralTypeRepository.count() > 0) return;

        List<LanguageReferralTypeEntity> types = Arrays.asList(
            createLanguageReferralType("BILINGUAL", "Bilingual", "Bilingue"),
            createLanguageReferralType("ENGLISH", "English only", "Anglais seulement"),
            createLanguageReferralType("FRENCH", "French only", "Français seulement")
        );

        languageReferralTypeRepository.saveAll(types);
        logSeeded("Language Referral Types", types.size());
    }

    private void seedPriorityLevels() {
        if (priorityLevelRepository.count() > 0) return;

        List<PriorityLevelEntity> levels = Arrays.asList(
            createPriorityLevel("LOW", "Low", "Faible"),
            createPriorityLevel("NORMAL", "Normal", "Normal"),
            createPriorityLevel("HIGH", "High", "Élevé")
        );

        priorityLevelRepository.saveAll(levels);
        logSeeded("Priority Levels", levels.size());
    }

    private void seedProfileStatuses() {
        if (profileStatusRepository.count() > 0) return;

        List<ProfileStatusEntity> statuses = Arrays.asList(
            createProfileStatus("PENDING", "Pending", "En attente"),
            createProfileStatus("ACTIVE", "Active", "Actif"),
            createProfileStatus("INACTIVE", "Inactive", "Inactif")
        );

        profileStatusRepository.saveAll(statuses);
        logSeeded("Profile Statuses", statuses.size());
    }

    private void seedRequestStatuses() {
        if (requestStatusRepository.count() > 0) return;

        List<RequestStatusEntity> statuses = Arrays.asList(
            createRequestStatus("DRAFT", "Draft", "Brouillon"),
            createRequestStatus("SUBMITTED", "Submitted", "Soumis"),
            createRequestStatus("UNDER_REVIEW", "Under Review", "En cours d'examen"),
            createRequestStatus("APPROVED", "Approved", "Approuvé"),
            createRequestStatus("REJECTED", "Rejected", "Rejeté"),
            createRequestStatus("CANCELLED", "Cancelled", "Annulé")
        );

        requestStatusRepository.saveAll(statuses);
        logSeeded("Request Statuses", statuses.size());
    }

    private void seedSecurityClearances() {
        if (securityClearanceRepository.count() > 0) return;

        List<SecurityClearanceEntity> clearances = Arrays.asList(
            createSecurityClearance("NONE", "No Clearance Required", "Aucune autorisation requise"),
            createSecurityClearance("RELIABILITY", "Reliability", "Fiabilité"),
            createSecurityClearance("SECRET", "Secret", "Secret"),
            createSecurityClearance("TOP_SECRET", "Top Secret", "Très secret")
        );

        securityClearanceRepository.saveAll(clearances);
        logSeeded("Security Clearances", clearances.size());
    }

    private void seedWfaStatuses() {
        if (wfaStatusRepository.count() > 0) return;

        List<WfaStatusEntity> statuses = Arrays.asList(
            createWfaStatus("AFFECTED", "Affected", "Touché"),
            createWfaStatus("SURPLUS_GRJO", "Surplus with GRJO", "Excédentaire avec GOE"),
            createWfaStatus("SURPLUS_NO_GRJO", "Surplus without a GRJO", "Excédentaire sans GOE"),
            createWfaStatus("RELOCATION", "Relocation of work unit", "Réinstallation de l'unité de travail"),
            createWfaStatus("LAYOFF", "Lay-off", "Mise à pied")
        );

        wfaStatusRepository.saveAll(statuses);
        logSeeded("WFA Statuses", statuses.size());
    }

    private void seedWorkUnits() {
        if (workUnitRepository.count() > 0) return;

        // Create parent work units first
        List<WorkUnitEntity> parentUnits = Arrays.asList(
            createWorkUnit("LABOUR-COPD", "Labour - COPD", "Travail - CODP", null),
            createWorkUnit("LABOUR-SIG", "Labour - SIG", "Travail - ISG", null),
            createWorkUnit("LABOUR", "DMO Labour Program", "BSM Programme du travail", null),
            createWorkUnit("LABOUR-PDRIA", "Labour - PDRIA", "Travail - PRDAI", null),
            createWorkUnit("ICSD-QC", "Integrated Client Service Delivery (ICSD) - Quebec Region", "Prestation de services intégrés à la clientèle (PSIC) - PSIC, Région du Québec", null)
        );

        workUnitRepository.saveAll(parentUnits);

        // Get saved parent units for child references
        WorkUnitEntity labourCopd = parentUnits.get(0);
        WorkUnitEntity labourSig = parentUnits.get(1);
        WorkUnitEntity labour = parentUnits.get(2);
        WorkUnitEntity labourPdria = parentUnits.get(3);
        WorkUnitEntity icsdQc = parentUnits.get(4);

        // Create child work units
        List<WorkUnitEntity> childUnits = Arrays.asList(
            createWorkUnit("LABOUR-COPD-1", "Workplace Directorate", "Direction du milieu de travail", labourCopd),
            createWorkUnit("LABOUR-COPD-2", "ADM's Office, COPD", "Bureau du SMA, CODP", labourCopd),
            createWorkUnit("LABOUR-SIG-1", "Strat Integ & Info Solutions", "Integ Strat & Solution Info", labourSig),
            createWorkUnit("LABOUR-1", "DMO Labour Program - Unit 1", "BSM Programme du travail - Unité 1", labour),
            createWorkUnit("LABOUR-PDRIA-1", "DGO Fed Mediatn Conciliatn Svc", "DG Serv Fed Mediatn Conciliatn", labourPdria),
            createWorkUnit("ICSD-QC-1", "Integrity Services Branch, QC", "Direction serv d'intégrité, QC", icsdQc)
        );

        workUnitRepository.saveAll(childUnits);
        logSeeded("Work Units", parentUnits.size() + childUnits.size());
    }

    private void seedAssessmentResults() {
        if (assessmentResultRepository.count() > 0) return;

        List<AssessmentResultEntity> results = Arrays.asList(
            createAssessmentResult("QUALIFIED", "Qualified", "Qualifié"),
            createAssessmentResult("NOT_QUALIFIED", "Not Qualified", "Non qualifié"),
            createAssessmentResult("PARTIALLY_QUALIFIED", "Partially Qualified", "Partiellement qualifié"),
            createAssessmentResult("REFERRED", "Referred for Further Assessment", "Référé pour évaluation supplémentaire")
        );

        assessmentResultRepository.saveAll(results);
        logSeeded("Assessment Results", results.size());
    }

    private void seedNotificationPurposes() {
        if (notificationPurposeRepository.count() > 0) return;

        List<NotificationPurposeEntity> purposes = Arrays.asList(
            createNotificationPurpose("GENERAL", "General Notifications", "Notifications générales", "00000000-0000-0000-0000-000000000000")
        );

        notificationPurposeRepository.saveAll(purposes);
        logSeeded("Notification Purposes", purposes.size());
    }

    // Helper methods to create entities
    private LanguageEntity createLanguage(String code, String nameEn, String nameFr) {
        LanguageEntity entity = new LanguageEntity();
        entity.setCode(code);
        entity.setNameEn(nameEn);
        entity.setNameFr(nameFr);
        return entity;
    }

    private UserTypeEntity createUserType(String code, String nameEn, String nameFr) {
        UserTypeEntity entity = new UserTypeEntity();
        entity.setCode(code);
        entity.setNameEn(nameEn);
        entity.setNameFr(nameFr);
        return entity;
    }

    private ProvinceEntity createProvince(String code, String nameEn, String nameFr) {
        ProvinceEntity entity = new ProvinceEntity();
        entity.setCode(code);
        entity.setNameEn(nameEn);
        entity.setNameFr(nameFr);
        return entity;
    }

    private CityEntity createCity(String code, String nameEn, String nameFr, ProvinceEntity province) {
        CityEntity entity = new CityEntity();
        entity.setCode(code);
        entity.setNameEn(nameEn);
        entity.setNameFr(nameFr);
        entity.setProvinceTerritory(province);
        return entity;
    }

    private ClassificationEntity createClassification(String code, String nameEn, String nameFr) {
        ClassificationEntity entity = new ClassificationEntity();
        entity.setCode(code);
        entity.setNameEn(nameEn);
        entity.setNameFr(nameFr);
        return entity;
    }

    private EducationLevelEntity createEducationLevel(String code, String nameEn, String nameFr) {
        EducationLevelEntity entity = new EducationLevelEntity();
        entity.setCode(code);
        entity.setNameEn(nameEn);
        entity.setNameFr(nameFr);
        return entity;
    }

    private EmploymentTenureEntity createEmploymentTenure(String code, String nameEn, String nameFr) {
        EmploymentTenureEntity entity = new EmploymentTenureEntity();
        entity.setCode(code);
        entity.setNameEn(nameEn);
        entity.setNameFr(nameFr);
        return entity;
    }

    private LanguageReferralTypeEntity createLanguageReferralType(String code, String nameEn, String nameFr) {
        LanguageReferralTypeEntity entity = new LanguageReferralTypeEntity();
        entity.setCode(code);
        entity.setNameEn(nameEn);
        entity.setNameFr(nameFr);
        return entity;
    }

    private PriorityLevelEntity createPriorityLevel(String code, String nameEn, String nameFr) {
        PriorityLevelEntity entity = new PriorityLevelEntity();
        entity.setCode(code);
        entity.setNameEn(nameEn);
        entity.setNameFr(nameFr);
        return entity;
    }

    private ProfileStatusEntity createProfileStatus(String code, String nameEn, String nameFr) {
        ProfileStatusEntity entity = new ProfileStatusEntity();
        entity.setCode(code);
        entity.setNameEn(nameEn);
        entity.setNameFr(nameFr);
        return entity;
    }

    private RequestStatusEntity createRequestStatus(String code, String nameEn, String nameFr) {
        RequestStatusEntity entity = new RequestStatusEntity();
        entity.setCode(code);
        entity.setNameEn(nameEn);
        entity.setNameFr(nameFr);
        return entity;
    }

    private SecurityClearanceEntity createSecurityClearance(String code, String nameEn, String nameFr) {
        SecurityClearanceEntity entity = new SecurityClearanceEntity();
        entity.setCode(code);
        entity.setNameEn(nameEn);
        entity.setNameFr(nameFr);
        return entity;
    }

    private WfaStatusEntity createWfaStatus(String code, String nameEn, String nameFr) {
        WfaStatusEntity entity = new WfaStatusEntity();
        entity.setCode(code);
        entity.setNameEn(nameEn);
        entity.setNameFr(nameFr);
        return entity;
    }

    private WorkUnitEntity createWorkUnit(String code, String nameEn, String nameFr, WorkUnitEntity parent) {
        WorkUnitEntity entity = new WorkUnitEntity();
        entity.setCode(code);
        entity.setNameEn(nameEn);
        entity.setNameFr(nameFr);
        entity.setParent(parent);
        return entity;
    }

    private AssessmentResultEntity createAssessmentResult(String code, String nameEn, String nameFr) {
        AssessmentResultEntity entity = new AssessmentResultEntity();
        entity.setCode(code);
        entity.setNameEn(nameEn);
        entity.setNameFr(nameFr);
        return entity;
    }

    private NotificationPurposeEntity createNotificationPurpose(String code, String nameEn, String nameFr, String templateId) {
        NotificationPurposeEntity entity = new NotificationPurposeEntity();
        entity.setCode(code);
        entity.setNameEn(nameEn);
        entity.setNameFr(nameFr);
        entity.setGcNotifyTemplateId(templateId);
        return entity;
    }

    private void logSeeded(String entityType, int count) {
        if (config.isLogSeedingProgress()) {
            logger.info("Seeded {} {} records", count, entityType);
        }
    }
}
