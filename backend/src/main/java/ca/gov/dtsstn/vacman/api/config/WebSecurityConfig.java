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
import org.springframework.security.config.annotation.web.configurers.CsrfConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

import ca.gov.dtsstn.vacman.api.web.AuthErrorHandler;

@Configuration
@EnableMethodSecurity
public class WebSecurityConfig {

	private static final Logger log = LoggerFactory.getLogger(WebSecurityConfig.class);

	/**
	 * Customizes web security to ignore requests to the H2 database console.
	 * This bean ensures that Spring Security does not apply its security filters
	 * to requests targeting "/h2-console/**", allowing unrestricted access
	 * to the H2 console, typically used during development.
	 */
	@Bean WebSecurityCustomizer h2ConsoleWebSecurityCustomizer() {
		log.info("Adding /h2-console/** to Spring Security ignore list");
		return web -> web.ignoring().requestMatchers("/h2-console/**");
	}

	/**
	 * Security configuration for non-API endpoints (ex: swagger).
	 * This configuration is shared between both dev and default environments.
	 */
	@Bean SecurityFilterChain webSecurityFilterChain(HttpSecurity http) throws Exception {
		log.info("Configuring non-API web security");

		http.authorizeHttpRequests(authorizeHttpRequests -> authorizeHttpRequests
			.requestMatchers("/").permitAll()
			.requestMatchers("/swagger-ui/**").permitAll()
			.requestMatchers("/v3/api-docs/**").permitAll());

		return http.build();
	}

	@Configuration
	@ConditionalOnProperty(name = "application.security.disabled", havingValue = "false", matchIfMissing = true)
	static class DefaultWebSecurityConfig {

		@Autowired AuthErrorHandler authErrorHandler;

		/**
		 * Security configuration for API endpoints.
		 */
		@Bean SecurityFilterChain apiSecurityFilterChain(HttpSecurity http) throws Exception {
			log.info("Configuring API security");

			http.securityMatcher("/api/**")
				.csrf(CsrfConfigurer::disable)
				.exceptionHandling(exceptionHandling -> exceptionHandling.accessDeniedHandler(authErrorHandler))
				.oauth2ResourceServer(oauth2ResourceServer -> oauth2ResourceServer
					.authenticationEntryPoint(authErrorHandler)
					.jwt(withDefaults()))
				.sessionManagement(sessionManagement -> sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

			http.authorizeHttpRequests(authorizeHttpRequests -> authorizeHttpRequests
				// allow all XHR preflight checks
				.requestMatchers(HttpMethod.OPTIONS).permitAll()
				// codes have no protected data, so they require no auth to fetch
				.requestMatchers("/api/*/codes/**").permitAll()
				// TODO ::: GjB ::: figure out specific roles and permissions
				.requestMatchers("/api/**").hasAuthority("SCOPE_employee")
				.anyRequest().denyAll());

			return http.build();
		}
	}

	/**
	 * Customizes web security to disable all security measures when the
	 * "application.security.disabled" property is set to "true".
	 * This bean is conditionally created and will cause Spring Security to ignore
	 * all requests ("/**") if the specified property is active. This is typically
	 * used for development or testing purposes.
	 */
	@Configuration
	@ConditionalOnProperty(name = "application.security.disabled", havingValue = "true", matchIfMissing = false)
	static class DevWebSecurityConfig {

		@Bean WebSecurityCustomizer devWebSecurityCustomizer() {
			log.warn("Disabling security for all requests (application.security.disabled=true)");
			return web -> web.ignoring().requestMatchers("/**");
		}

	}

}