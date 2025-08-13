package ca.gov.dtsstn.vacman.api.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

import javax.sql.DataSource;
import liquibase.integration.spring.SpringLiquibase;

import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.autoconfigure.liquibase.LiquibaseProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties({LiquibaseProperties.class, DataSourceProperties.class})
public class LiquibaseConfig {
	private static final Logger log = LoggerFactory.getLogger(LiquibaseConfig.class);

	private final DataSource dataSource;

	public LiquibaseConfig(DataSource dataSource) {
		this.dataSource = dataSource;
	}

	private List<String> sortOutContexts(List<String> liquibaseContexts, String contextCheck)  {
		if (liquibaseContexts == null) {
			List<String> tempList = List.of(contextCheck);
			return tempList;
		} else {
			List<String> javaTempList = new ArrayList<>(liquibaseContexts);
			//if we find the context, return the array
			if (!liquibaseContexts
				.stream()
				.filter(context -> context.equals(contextCheck))
				.findFirst()
				.isPresent()) {

				javaTempList.add(contextCheck);

				return javaTempList.stream().distinct().toList();
			}

			return javaTempList.stream().distinct().toList();
		}
	}

	@Bean
	public SpringLiquibase liquibase(LiquibaseProperties liquibaseProperties, DataSourceProperties dataSourceProperties) {
		SpringLiquibase liquibase = new SpringLiquibase();

		liquibase.setDataSource(dataSource);
		
		liquibase.setChangeLog(liquibaseProperties.getChangeLog());
		
		// Set the default to an unused context
		liquibase.setContexts("nil");

		try {
			String databaseUrl = dataSourceProperties.getUrl();

			liquibase.setShouldRun(liquibaseProperties.isEnabled());

			if (databaseUrl == null ) {
				// The context is currently nil, so return the liquibase object
				return liquibase;
			}

			List<String> contexts = liquibaseProperties.getContexts();

			// Ensure that the contexts are added if h2 or mssql is the database
			// based on the jdbc connection
			if (databaseUrl.contains("jdbc:h2")) {
				contexts = sortOutContexts(contexts, "h2");
			} else if (databaseUrl.contains("jdbc:sqlserver")) {
				contexts = sortOutContexts(contexts, "mssql");
			}

			// Add structure and data contexts if they are missing
			contexts = sortOutContexts(contexts, "structure");
			contexts = sortOutContexts(contexts, "data");

			// liqubase.setContexts() uses a string, so make a string, and
			// then set it
			liquibase.setContexts(String.join(",", contexts));

			return liquibase;
		} catch (Exception e) {
			// Handle exceptions
			log.error("LiquibaseConfiguration Error: ", e);
		}

		return liquibase;
	}
}