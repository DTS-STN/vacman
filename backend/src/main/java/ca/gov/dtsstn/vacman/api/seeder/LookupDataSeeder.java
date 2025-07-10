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
            createLanguage("FR", "French", "Français"),
            createLanguage("ES", "Spanish", "Espagnol"),
            createLanguage("DE", "German", "Allemand")
        );

        languageRepository.saveAll(languages);
        logSeeded("Languages", languages.size());
    }

    private void seedUserTypes() {
        if (userTypeRepository.count() > 0) return;

        List<UserTypeEntity> userTypes = Arrays.asList(
            createUserType("ADMIN", "Administrator", "Administrateur"),
            createUserType("MANAGER", "Manager", "Gestionnaire"),
            createUserType("EMPLOYEE", "Employee", "Employé"),
            createUserType("CONTRACTOR", "Contractor", "Contractuel")
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

        List<CityEntity> cities = Arrays.asList(
            createCity("OTT", "Ottawa", "Ottawa", ontario),
            createCity("TOR", "Toronto", "Toronto", ontario),
            createCity("HAM", "Hamilton", "Hamilton", ontario),
            createCity("MTL", "Montreal", "Montréal", quebec),
            createCity("QBC", "Quebec City", "Ville de Québec", quebec),
            createCity("VAN", "Vancouver", "Vancouver", bc),
            createCity("VIC", "Victoria", "Victoria", bc)
        );

        cityRepository.saveAll(cities);
        logSeeded("Cities", cities.size());
    }

    private void seedClassifications() {
        if (classificationRepository.count() > 0) return;

        List<ClassificationEntity> classifications = Arrays.asList(
            createClassification("AS", "Administrative Services", "Services administratifs"),
            createClassification("CS", "Computer Systems", "Systèmes d'ordinateur"),
            createClassification("EC", "Economics and Social Science Services", "Services économiques et sciences sociales"),
            createClassification("ENG", "Engineering and Land Survey", "Ingénierie et arpentage"),
            createClassification("FI", "Financial Management", "Gestion financière"),
            createClassification("PM", "Programme Management", "Gestion de programmes")
        );

        classificationRepository.saveAll(classifications);
        logSeeded("Classifications", classifications.size());
    }

    private void seedEducationLevels() {
        if (educationLevelRepository.count() > 0) return;

        List<EducationLevelEntity> educationLevels = Arrays.asList(
            createEducationLevel("HS", "High School", "Études secondaires"),
            createEducationLevel("CERT", "Certificate", "Certificat"),
            createEducationLevel("DIP", "Diploma", "Diplôme"),
            createEducationLevel("BACH", "Bachelor's Degree", "Baccalauréat"),
            createEducationLevel("MAST", "Master's Degree", "Maîtrise"),
            createEducationLevel("PHD", "Doctorate", "Doctorat")
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
            createLanguageReferralType("ORAL", "Oral Proficiency", "Compétence orale"),
            createLanguageReferralType("WRITTEN", "Written Proficiency", "Compétence écrite"),
            createLanguageReferralType("COMPREHENSION", "Reading Comprehension", "Compréhension de lecture"),
            createLanguageReferralType("INTERACTION", "Interaction", "Interaction")
        );

        languageReferralTypeRepository.saveAll(types);
        logSeeded("Language Referral Types", types.size());
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
        logSeeded("Priority Levels", levels.size());
    }

    private void seedProfileStatuses() {
        if (profileStatusRepository.count() > 0) return;

        List<ProfileStatusEntity> statuses = Arrays.asList(
            createProfileStatus("ACTIVE", "Active", "Actif"),
            createProfileStatus("INACTIVE", "Inactive", "Inactif"),
            createProfileStatus("PENDING", "Pending Review", "En attente d'examen"),
            createProfileStatus("APPROVED", "Approved", "Approuvé"),
            createProfileStatus("REJECTED", "Rejected", "Rejeté")
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
            createWfaStatus("ELIGIBLE", "Eligible", "Admissible"),
            createWfaStatus("NOT_ELIGIBLE", "Not Eligible", "Non admissible"),
            createWfaStatus("PENDING", "Pending Assessment", "Évaluation en attente"),
            createWfaStatus("EXPIRED", "Expired", "Expiré")
        );

        wfaStatusRepository.saveAll(statuses);
        logSeeded("WFA Statuses", statuses.size());
    }

    private void seedWorkUnits() {
        if (workUnitRepository.count() > 0) return;

        List<WorkUnitEntity> workUnits = Arrays.asList(
            createWorkUnit("IT", "Information Technology", "Technologie de l'information", null),
            createWorkUnit("HR", "Human Resources", "Ressources humaines", null),
            createWorkUnit("FIN", "Finance", "Finances", null),
            createWorkUnit("OPS", "Operations", "Opérations", null)
        );

        workUnitRepository.saveAll(workUnits);

        // Create sub-units
        WorkUnitEntity itParent = workUnits.get(0);
        List<WorkUnitEntity> subUnits = Arrays.asList(
            createWorkUnit("IT-DEV", "Development", "Développement", itParent),
            createWorkUnit("IT-SEC", "Security", "Sécurité", itParent),
            createWorkUnit("IT-NET", "Networking", "Réseautage", itParent)
        );

        workUnitRepository.saveAll(subUnits);
        logSeeded("Work Units", workUnits.size() + subUnits.size());
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
            createNotificationPurpose("PROFILE_CREATED", "Profile Created", "Profil créé", "template-123"),
            createNotificationPurpose("PROFILE_UPDATED", "Profile Updated", "Profil mis à jour", "template-124"),
            createNotificationPurpose("REQUEST_SUBMITTED", "Request Submitted", "Demande soumise", "template-125"),
            createNotificationPurpose("ASSESSMENT_COMPLETE", "Assessment Complete", "Évaluation terminée", "template-126")
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
