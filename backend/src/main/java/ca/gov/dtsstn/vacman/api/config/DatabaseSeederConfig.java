package ca.gov.dtsstn.vacman.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration properties for database seeding in development mode.
 * These properties can be configured in application-dev.yaml or application-local.yaml
 */
@Configuration
@ConfigurationProperties(prefix = "app.database.seeder")
public class DatabaseSeederConfig {

    private boolean enabled = true;
    private boolean clearDataFirst = false;

    // Main entity counts
    private int userCount = 10;
    private int profileCount = 10;
    private int requestCount = 8;

    // Relationship configuration
    private int minCitiesPerProfile = 1;
    private int maxCitiesPerProfile = 3;
    private int minClassificationsPerProfile = 1;
    private int maxClassificationsPerProfile = 2;
    private int minEmploymentOpportunitiesPerProfile = 1;
    private int maxEmploymentOpportunitiesPerProfile = 3;
    private int minLanguageReferralTypesPerProfile = 1;
    private int maxLanguageReferralTypesPerProfile = 2;
    private int minCitiesPerRequest = 1;
    private int maxCitiesPerRequest = 3;
    private int minEmploymentEquitiesPerRequest = 1;
    private int maxEmploymentEquitiesPerRequest = 2;

    // User distribution configuration
    private double adminUserPercentage = 0.1; // 10% admins
    private double hiringManagerPercentage = 0.3; // 30% hiring managers
    private double employeeUserPercentage = 0.6; // 60% employees

    // Request status distribution
    private double draftRequestPercentage = 0.2;
    private double submittedRequestPercentage = 0.3;
    private double underReviewRequestPercentage = 0.2;
    private double approvedRequestPercentage = 0.2;
    private double rejectedRequestPercentage = 0.1;

    // Profile status distribution
    private double activeProfilePercentage = 0.7;
    private double inactiveProfilePercentage = 0.2;
    private double pendingProfilePercentage = 0.1;

    // Feature toggles
    private boolean seedLookupTables = false; // Let data.sql handle lookup data
    private boolean seedJunctionTables = true;
    private boolean ensureDataConsistency = true;
    private boolean validateRelationships = true;

    // Operational settings
    private boolean logSeedingProgress = true;
    private boolean skipIfDataExists = true;
    private boolean useFixedSeed = true; // For reproducible data
    private long randomSeed = 12345L;

    // Data quality settings
    private boolean ensureRealisticDistribution = true;
    private boolean validateForeignKeys = true;
    private int batchSize = 50; // For bulk operations

    // Getters and setters
    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public boolean isClearDataFirst() {
        return clearDataFirst;
    }

    public void setClearDataFirst(boolean clearDataFirst) {
        this.clearDataFirst = clearDataFirst;
    }

    public int getUserCount() {
        return userCount;
    }

    public void setUserCount(int userCount) {
        this.userCount = userCount;
    }

    public int getProfileCount() {
        return profileCount;
    }

    public void setProfileCount(int profileCount) {
        this.profileCount = profileCount;
    }

    public int getRequestCount() {
        return requestCount;
    }

    public void setRequestCount(int requestCount) {
        this.requestCount = requestCount;
    }

    public int getMinCitiesPerProfile() {
        return minCitiesPerProfile;
    }

    public void setMinCitiesPerProfile(int minCitiesPerProfile) {
        this.minCitiesPerProfile = minCitiesPerProfile;
    }

    public int getMaxCitiesPerProfile() {
        return maxCitiesPerProfile;
    }

    public void setMaxCitiesPerProfile(int maxCitiesPerProfile) {
        this.maxCitiesPerProfile = maxCitiesPerProfile;
    }

    public int getMinClassificationsPerProfile() {
        return minClassificationsPerProfile;
    }

    public void setMinClassificationsPerProfile(int minClassificationsPerProfile) {
        this.minClassificationsPerProfile = minClassificationsPerProfile;
    }

    public int getMaxClassificationsPerProfile() {
        return maxClassificationsPerProfile;
    }

    public void setMaxClassificationsPerProfile(int maxClassificationsPerProfile) {
        this.maxClassificationsPerProfile = maxClassificationsPerProfile;
    }

    public int getMinEmploymentOpportunitiesPerProfile() {
        return minEmploymentOpportunitiesPerProfile;
    }

    public void setMinEmploymentOpportunitiesPerProfile(int minEmploymentOpportunitiesPerProfile) {
        this.minEmploymentOpportunitiesPerProfile = minEmploymentOpportunitiesPerProfile;
    }

    public int getMaxEmploymentOpportunitiesPerProfile() {
        return maxEmploymentOpportunitiesPerProfile;
    }

    public void setMaxEmploymentOpportunitiesPerProfile(int maxEmploymentOpportunitiesPerProfile) {
        this.maxEmploymentOpportunitiesPerProfile = maxEmploymentOpportunitiesPerProfile;
    }

    public int getMinLanguageReferralTypesPerProfile() {
        return minLanguageReferralTypesPerProfile;
    }

    public void setMinLanguageReferralTypesPerProfile(int minLanguageReferralTypesPerProfile) {
        this.minLanguageReferralTypesPerProfile = minLanguageReferralTypesPerProfile;
    }

    public int getMaxLanguageReferralTypesPerProfile() {
        return maxLanguageReferralTypesPerProfile;
    }

    public void setMaxLanguageReferralTypesPerProfile(int maxLanguageReferralTypesPerProfile) {
        this.maxLanguageReferralTypesPerProfile = maxLanguageReferralTypesPerProfile;
    }

    public int getMinCitiesPerRequest() {
        return minCitiesPerRequest;
    }

    public void setMinCitiesPerRequest(int minCitiesPerRequest) {
        this.minCitiesPerRequest = minCitiesPerRequest;
    }

    public int getMaxCitiesPerRequest() {
        return maxCitiesPerRequest;
    }

    public void setMaxCitiesPerRequest(int maxCitiesPerRequest) {
        this.maxCitiesPerRequest = maxCitiesPerRequest;
    }

    public int getMinEmploymentEquitiesPerRequest() {
        return minEmploymentEquitiesPerRequest;
    }

    public void setMinEmploymentEquitiesPerRequest(int minEmploymentEquitiesPerRequest) {
        this.minEmploymentEquitiesPerRequest = minEmploymentEquitiesPerRequest;
    }

    public int getMaxEmploymentEquitiesPerRequest() {
        return maxEmploymentEquitiesPerRequest;
    }

    public void setMaxEmploymentEquitiesPerRequest(int maxEmploymentEquitiesPerRequest) {
        this.maxEmploymentEquitiesPerRequest = maxEmploymentEquitiesPerRequest;
    }

    public double getAdminUserPercentage() {
        return adminUserPercentage;
    }

    public void setAdminUserPercentage(double adminUserPercentage) {
        this.adminUserPercentage = adminUserPercentage;
    }

    public double getHiringManagerPercentage() {
        return hiringManagerPercentage;
    }

    public void setHiringManagerPercentage(double hiringManagerPercentage) {
        this.hiringManagerPercentage = hiringManagerPercentage;
    }

    public double getEmployeeUserPercentage() {
        return employeeUserPercentage;
    }

    public void setEmployeeUserPercentage(double employeeUserPercentage) {
        this.employeeUserPercentage = employeeUserPercentage;
    }

    public double getDraftRequestPercentage() {
        return draftRequestPercentage;
    }

    public void setDraftRequestPercentage(double draftRequestPercentage) {
        this.draftRequestPercentage = draftRequestPercentage;
    }

    public double getSubmittedRequestPercentage() {
        return submittedRequestPercentage;
    }

    public void setSubmittedRequestPercentage(double submittedRequestPercentage) {
        this.submittedRequestPercentage = submittedRequestPercentage;
    }

    public double getUnderReviewRequestPercentage() {
        return underReviewRequestPercentage;
    }

    public void setUnderReviewRequestPercentage(double underReviewRequestPercentage) {
        this.underReviewRequestPercentage = underReviewRequestPercentage;
    }

    public double getApprovedRequestPercentage() {
        return approvedRequestPercentage;
    }

    public void setApprovedRequestPercentage(double approvedRequestPercentage) {
        this.approvedRequestPercentage = approvedRequestPercentage;
    }

    public double getRejectedRequestPercentage() {
        return rejectedRequestPercentage;
    }

    public void setRejectedRequestPercentage(double rejectedRequestPercentage) {
        this.rejectedRequestPercentage = rejectedRequestPercentage;
    }

    public double getActiveProfilePercentage() {
        return activeProfilePercentage;
    }

    public void setActiveProfilePercentage(double activeProfilePercentage) {
        this.activeProfilePercentage = activeProfilePercentage;
    }

    public double getInactiveProfilePercentage() {
        return inactiveProfilePercentage;
    }

    public void setInactiveProfilePercentage(double inactiveProfilePercentage) {
        this.inactiveProfilePercentage = inactiveProfilePercentage;
    }

    public double getPendingProfilePercentage() {
        return pendingProfilePercentage;
    }

    public void setPendingProfilePercentage(double pendingProfilePercentage) {
        this.pendingProfilePercentage = pendingProfilePercentage;
    }

    public boolean isSeedLookupTables() {
        return seedLookupTables;
    }

    public void setSeedLookupTables(boolean seedLookupTables) {
        this.seedLookupTables = seedLookupTables;
    }

    public boolean isSeedJunctionTables() {
        return seedJunctionTables;
    }

    public void setSeedJunctionTables(boolean seedJunctionTables) {
        this.seedJunctionTables = seedJunctionTables;
    }

    public boolean isEnsureDataConsistency() {
        return ensureDataConsistency;
    }

    public void setEnsureDataConsistency(boolean ensureDataConsistency) {
        this.ensureDataConsistency = ensureDataConsistency;
    }

    public boolean isValidateRelationships() {
        return validateRelationships;
    }

    public void setValidateRelationships(boolean validateRelationships) {
        this.validateRelationships = validateRelationships;
    }

    public boolean isLogSeedingProgress() {
        return logSeedingProgress;
    }

    public void setLogSeedingProgress(boolean logSeedingProgress) {
        this.logSeedingProgress = logSeedingProgress;
    }

    public boolean isSkipIfDataExists() {
        return skipIfDataExists;
    }

    public void setSkipIfDataExists(boolean skipIfDataExists) {
        this.skipIfDataExists = skipIfDataExists;
    }

    public boolean isUseFixedSeed() {
        return useFixedSeed;
    }

    public void setUseFixedSeed(boolean useFixedSeed) {
        this.useFixedSeed = useFixedSeed;
    }

    public long getRandomSeed() {
        return randomSeed;
    }

    public void setRandomSeed(long randomSeed) {
        this.randomSeed = randomSeed;
    }

    public boolean isEnsureRealisticDistribution() {
        return ensureRealisticDistribution;
    }

    public void setEnsureRealisticDistribution(boolean ensureRealisticDistribution) {
        this.ensureRealisticDistribution = ensureRealisticDistribution;
    }

    public boolean isValidateForeignKeys() {
        return validateForeignKeys;
    }

    public void setValidateForeignKeys(boolean validateForeignKeys) {
        this.validateForeignKeys = validateForeignKeys;
    }

    public int getBatchSize() {
        return batchSize;
    }

    public void setBatchSize(int batchSize) {
        this.batchSize = batchSize;
    }

    /**
     * Validates configuration constraints
     */
    public void validate() {
        if (userCount <= 0 || profileCount <= 0 || requestCount <= 0) {
            throw new IllegalArgumentException("Counts must be positive");
        }

        if (adminUserPercentage + hiringManagerPercentage + employeeUserPercentage != 1.0) {
            throw new IllegalArgumentException("User type percentages must sum to 1.0");
        }

        if (minCitiesPerProfile < 0 || maxCitiesPerProfile < minCitiesPerProfile) {
            throw new IllegalArgumentException("Invalid cities per profile range");
        }

        // Additional validation rules can be added here
    }
}
