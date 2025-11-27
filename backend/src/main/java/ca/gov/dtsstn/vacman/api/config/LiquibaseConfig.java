package ca.gov.dtsstn.vacman.api.config;

import org.springframework.util.StringUtils;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import liquibase.integration.spring.SpringLiquibase;

@Configuration
public class LiquibaseConfig {
    
    /**
     * Defines a BeanPostProcessor to validate that the 'contexts' property
     * is explicitly set on the SpringLiquibase bean before it is initialized.
     * This prevents accidental execution of migrations without specifying
     * which environments/contexts they apply to.
     * * @return A BeanPostProcessor instance for Liquibase context validation.
     */
    @Bean
    BeanPostProcessor liquibaseContextValidationPostProcessor() {
        return new BeanPostProcessor() {

            /**
             * Intercepts the initialization of beans before any initialization callbacks (like InitializingBean's afterPropertiesSet) are applied.
             * @param bean The new bean instance.
             * @param beanName The name of the bean.
             * @return The bean instance, potentially wrapped or validated.
             * @throws BeansException If an error occurs during processing.
             */
            @Override
            public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
                // Check if the current bean is the SpringLiquibase integration bean
                if (bean instanceof SpringLiquibase) {
                    final var springLiquibase = (SpringLiquibase) bean;

                    // Validate that the 'contexts' property has been explicitly configured (not null or empty string)
                    if (!StringUtils.hasText(springLiquibase.getContexts())) {
                        // Throw an exception to halt startup if contexts are not set, enforcing proper configuration.
                        throw new IllegalStateException(
                            "Liquibase validation failed: The 'contexts' property on SpringLiquibase " +
                            "must be explicitly set with one or more contexts (e.g., 'dev', 'prod') " +
                            "to ensure proper migration execution."
                            );
                    }
                }

                return bean;
            }

        };
    }
}