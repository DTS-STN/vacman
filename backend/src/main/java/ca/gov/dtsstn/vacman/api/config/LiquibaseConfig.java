package ca.gov.dtsstn.vacman.api.config;

import static java.lang.String.join;
import static org.springframework.util.CollectionUtils.isEmpty;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.liquibase.LiquibaseProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import liquibase.integration.spring.SpringLiquibase;

@Configuration
@EnableConfigurationProperties({ LiquibaseProperties.class })
public class LiquibaseConfig {

	@Autowired DataSource dataSource;

	@Autowired LiquibaseProperties liquibaseProperties;

	@Bean SpringLiquibase liquibase() throws Exception {
		if (isEmpty(liquibaseProperties.getContexts())) {
			throw new IllegalStateException("The 'spring.liquibase.contexts' property must be set to run Liquibase migrations.");
		}

		final var liquibase = new SpringLiquibase();
		liquibase.setChangeLog(liquibaseProperties.getChangeLog());
		liquibase.setContexts(join(",", liquibaseProperties.getContexts()));
		liquibase.setDataSource(dataSource);
		liquibase.setDropFirst(liquibaseProperties.isDropFirst());
		liquibase.setShouldRun(liquibaseProperties.isEnabled());

		return liquibase;
	}

}
