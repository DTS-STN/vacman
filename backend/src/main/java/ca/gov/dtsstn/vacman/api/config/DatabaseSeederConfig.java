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
    private int userCount = 10;
    private int profileCount = 15;
    private int requestCount = 8;
    private int profileRequestCount = 20;
    private boolean seedLookupTables = true;
    private boolean seedJunctionTables = true;
    private boolean logSeedingProgress = true;
    private boolean skipIfDataExists = true;

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

    public int getProfileRequestCount() {
        return profileRequestCount;
    }

    public void setProfileRequestCount(int profileRequestCount) {
        this.profileRequestCount = profileRequestCount;
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
}
