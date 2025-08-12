package ca.gov.dtsstn.vacman.api.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.sql.DataSource;
import liquibase.integration.spring.SpringLiquibase;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.liquibase.LiquibaseProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class LiquibaseConfig {
    private static final Logger log = LoggerFactory.getLogger(LiquibaseConfig.class);

    @Autowired
    private DataSource dataSource;

    @Bean
    @ConfigurationProperties(prefix = "spring.liquibase")
    public LiquibaseProperties liquibaseProperties() {
        return new LiquibaseProperties();
    }

    @Bean
    public SpringLiquibase liquibase(LiquibaseProperties liquibaseProperties) {
        SpringLiquibase liquibase = new SpringLiquibase();
        liquibase.setDataSource(dataSource);
        
        // Use the custom LiquibaseProperties bean
        liquibase.setChangeLog(liquibaseProperties.getChangeLog());

        try {
            String url = dataSource.getConnection().getMetaData().getURL();
            if (url.contains("jdbc:sqlserver")) {
                liquibase.setContexts("mssql");
            } else if (url.contains("jdbc:h2")) {
                liquibase.setContexts("h2");
            }
        } catch (Exception e) {
            // Handle exceptions
            log.error("LiquibaseConfiguration Error: ", e);

        }
        return liquibase;
    }
}