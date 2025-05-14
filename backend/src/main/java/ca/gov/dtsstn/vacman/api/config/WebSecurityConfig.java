package ca.gov.dtsstn.vacman.api.config;

import static org.springframework.security.web.util.matcher.AntPathRequestMatcher.antMatcher;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableMethodSecurity
public class WebSecurityConfig {

	private static final Logger log = LoggerFactory.getLogger(WebSecurityConfig.class);

	@Bean SecurityFilterChain apiSecurityFilterChain(HttpSecurity http) throws Exception {
		log.info("Configuring API security");

		http.securityMatcher("/api/**")
			.csrf(csrf -> csrf.disable())
			.authorizeHttpRequests(authorizeHttpRequests -> authorizeHttpRequests
			.anyRequest().permitAll()); // TODO ::: GjB ::: tighten up security

		return http.build();
	}

	@Bean SecurityFilterChain webSecurityFilterChain(HttpSecurity http) throws Exception {
		log.info("Configuring non-API web security");

		http.authorizeHttpRequests(authorizeHttpRequests -> authorizeHttpRequests
			.requestMatchers(antMatcher("/")).permitAll()
			.requestMatchers(antMatcher("/swagger-ui/**")).permitAll()
			.requestMatchers(antMatcher("/v3/api-docs/**")).permitAll());

		return http.build();
	}

	@Bean WebSecurityCustomizer webSecurityCustomizer() {
		log.info("Adding /h2-console/** to Spring Security ignore list");
		return web -> web.ignoring().requestMatchers(antMatcher("/h2-console/**"));
	}

}
