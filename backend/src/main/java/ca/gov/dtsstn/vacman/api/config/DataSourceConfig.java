package ca.gov.dtsstn.vacman.api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@EnableJpaAuditing
@EnableJpaRepositories(basePackages = { "ca.gov.dtsstn.vacman.api.data.repository" })
public class DataSourceConfig {}
