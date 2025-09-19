package ca.gov.dtsstn.vacman.api.config;

import java.sql.SQLException;

import javax.sql.DataSource;
import liquibase.integration.spring.SpringLiquibase;

import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.autoconfigure.liquibase.LiquibaseProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties({LiquibaseProperties.class})
public class LiquibaseConfig {
	private final DataSource dataSource;

	public LiquibaseConfig(DataSource dataSource) {
		this.dataSource = dataSource;
	}

	@Bean
	SpringLiquibase liquibase(LiquibaseProperties liquibaseProperties) throws SQLException {
		final SpringLiquibase liquibase = new SpringLiquibase();
		
		if (liquibaseProperties.getContexts() == null || liquibaseProperties.getContexts().isEmpty()) {
			throw new IllegalStateException("The 'spring.liquibase.contexts' property must be set to run Liquibase migrations.");
        }

		final String contextsAsString = String.join(",", liquibaseProperties.getContexts());

		liquibase.setDataSource(dataSource);
		liquibase.setChangeLog(liquibaseProperties.getChangeLog());
		liquibase.setShouldRun(liquibaseProperties.isEnabled());
		liquibase.setContexts(contextsAsString);

		return liquibase;
	}
}
