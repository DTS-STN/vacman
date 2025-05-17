package ca.gov.dtsstn.vacman.api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jdbc.repository.config.EnableJdbcAuditing;
import org.springframework.data.jdbc.repository.config.EnableJdbcRepositories;

@Configuration
@EnableJdbcAuditing
@EnableJdbcRepositories(basePackages = { "ca.gov.dtsstn.vacman.api.data.repository" })
public class DataSourceConfig {}
