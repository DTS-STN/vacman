package ca.gov.dtsstn.vacman.api.config;

import static org.springframework.util.CollectionUtils.isEmpty;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.boot.autoconfigure.liquibase.LiquibaseProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import liquibase.integration.spring.SpringLiquibase;

@Configuration
public class LiquibaseConfig {

    /**
     * Defines a BeanPostProcessor to intercept and validate the SpringLiquibase bean
     * to ensure the 'spring.liquibase.contexts' property is set.
     */
    @Bean
    public LiquibaseContextValidationPostProcessor liquibaseContextValidationPostProcessor(
            LiquibaseProperties properties) {
        // We pass the properties into the dedicated post-processor class
        return new LiquibaseContextValidationPostProcessor(properties);
    }

    /**
     * A dedicated BeanPostProcessor to validate the SpringLiquibase bean.
     */
    private static class LiquibaseContextValidationPostProcessor implements BeanPostProcessor {

        private final LiquibaseProperties properties;

        LiquibaseContextValidationPostProcessor(LiquibaseProperties properties) {
            this.properties = properties;
        }

        @Override
        public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
            // Check if the bean is the SpringLiquibase bean created by auto-config
            if (bean instanceof SpringLiquibase) {

                // Apply the custom validation check
                if (isEmpty(properties.getContexts())) {
                    throw new IllegalStateException(
                        "Liquibase validation failed: The 'spring.liquibase.contexts' property " +
                        "must be explicitly set with one or more contexts (e.g., 'dev', 'prod') " +
                        "to ensure proper migration execution."
                    );
                }
            }
            // Always return the bean
            return bean;
        }
    }
}