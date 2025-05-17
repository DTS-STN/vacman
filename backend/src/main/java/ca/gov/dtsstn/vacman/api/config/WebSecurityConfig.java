package ca.gov.dtsstn.vacman.api.config;

import static org.springframework.security.config.Customizer.withDefaults;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableMethodSecurity
public class WebSecurityConfig {

	private static final Logger log = LoggerFactory.getLogger(WebSecurityConfig.class);

	@Bean SecurityFilterChain apiSecurityFilterChain(HttpSecurity http) throws Exception {
		log.info("Configuring API security");

		http.securityMatcher("/api/**")
			.csrf(csrf -> csrf.disable())
			.oauth2ResourceServer(oauth2ResourceServer -> oauth2ResourceServer.jwt(withDefaults()))
			.sessionManagement(sessionManagement -> sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

		http.authorizeHttpRequests(authorizeHttpRequests -> authorizeHttpRequests
			// allow all XHR preflight checks
			.requestMatchers(HttpMethod.OPTIONS).permitAll()
			// TODO ::: GjB ::: figure out specific roles and permissions
			.requestMatchers("/api/**").hasAuthority("SCOPE_admin")
			.anyRequest().denyAll());

		return http.build();
	}

	@Bean SecurityFilterChain webSecurityFilterChain(HttpSecurity http) throws Exception {
		log.info("Configuring non-API web security");

		http.authorizeHttpRequests(authorizeHttpRequests -> authorizeHttpRequests
			.requestMatchers("/").permitAll()
			.requestMatchers("/swagger-ui/**").permitAll()
			.requestMatchers("/v3/api-docs/**").permitAll());

		return http.build();
	}

	@Bean WebSecurityCustomizer webSecurityCustomizer() {
		log.info("Adding /h2-console/** to Spring Security ignore list");
		return web -> web.ignoring().requestMatchers("/h2-console/**");
	}

}
