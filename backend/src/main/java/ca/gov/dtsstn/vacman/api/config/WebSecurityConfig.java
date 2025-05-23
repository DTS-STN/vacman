package ca.gov.dtsstn.vacman.api.config;

import static org.springframework.security.config.Customizer.withDefaults;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

import ca.gov.dtsstn.vacman.api.web.AuthErrorHandler;

/**
 * Security configuration for the application.
 * Contains two configurations:
 * - DefaultWebSecurityConfig: Standard security with authentication (default)
 * - DevWebSecurityConfig: Development mode with authentication disabled
 */
@Configuration
@EnableMethodSecurity
public class WebSecurityConfig {

	private static final Logger log = LoggerFactory.getLogger(DefaultWebSecurityConfig.class);

	/**
	 * Customizer to ignore security for H2 console.
	 * This configuration is shared between both dev and default environments.
	 */
	@Bean
	WebSecurityCustomizer devWebSecurityCustomizer() {
		log.info("Adding /h2-console/** to DEV Spring Security ignore list");
		return web -> web.ignoring().requestMatchers("/h2-console/**");
	}

	/**
	 * Security configuration for non-API endpoints (ex: swagger).
	 * This configuration is shared between both dev and default environments.
	 */
	@Bean
	SecurityFilterChain webSecurityFilterChain(HttpSecurity http) throws Exception {
		log.info("Configuring non-API web security");

		http.authorizeHttpRequests(authorizeHttpRequests -> authorizeHttpRequests
				.requestMatchers("/").permitAll()
				.requestMatchers("/swagger-ui/**").permitAll()
				.requestMatchers("/v3/api-docs/**").permitAll());

		return http.build();
	}

	@Configuration
	@ConditionalOnProperty(name = "application.security.disabled", havingValue = "false", matchIfMissing = true)
	public static class DefaultWebSecurityConfig {

		private static final Logger log = LoggerFactory.getLogger(DevWebSecurityConfig.class);

		@Autowired
		AuthErrorHandler authErrorHandler;

		/**
		 * Security configuration for API endpoints.
		 */
		@Bean
		SecurityFilterChain apiSecurityFilterChain(HttpSecurity http) throws Exception {
			log.info("Configuring API security");

			http.securityMatcher("/api/**")
					.csrf(csrf -> csrf.disable())
					.exceptionHandling(exceptionHandling -> exceptionHandling.accessDeniedHandler(authErrorHandler))
					.oauth2ResourceServer(oauth2ResourceServer -> oauth2ResourceServer
							.authenticationEntryPoint(authErrorHandler)
							.jwt(withDefaults()))
					.sessionManagement(sessionManagement -> sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

			http.authorizeHttpRequests(authorizeHttpRequests -> authorizeHttpRequests
					// allow all XHR preflight checks
					.requestMatchers(HttpMethod.OPTIONS).permitAll()
					// TODO ::: GjB ::: figure out specific roles and permissions
					.requestMatchers("/api/**").hasAuthority("SCOPE_employee")
					.anyRequest().denyAll());

			return http.build();
		}
	}

	/**
	 * Development security configuration that disables authentication.
	 * Active when application.security.disabled=true.
	 */
	@Configuration
	@ConditionalOnProperty(name = "application.security.disabled", havingValue = "true")
	public static class DevWebSecurityConfig {

		private static final Logger log = LoggerFactory.getLogger(DevWebSecurityConfig.class);

		/**
		 * Security configuration that permits all requests for development purposes.
		 */
		@Bean
		SecurityFilterChain devApiSecurityFilterChain(HttpSecurity http) throws Exception {
			log.info("Configuring DEV API security (authentication disabled)");

			http.securityMatcher("/api/**")
					.csrf(csrf -> csrf.disable())
					.authorizeHttpRequests(authorizeHttpRequests -> authorizeHttpRequests
							.anyRequest().permitAll());

			return http.build();
		}
	}
}