package ca.gov.dtsstn.vacman.api.config;

import java.util.Collection;
import java.util.Collections;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.access.expression.method.DefaultMethodSecurityExpressionHandler;
import org.springframework.security.access.expression.method.MethodSecurityExpressionHandler;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.annotation.web.configurers.CsrfConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

import ca.gov.dtsstn.vacman.api.security.OwnershipPermissionEvaluator;
import ca.gov.dtsstn.vacman.api.web.AuthErrorHandler;

@Configuration
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
			.requestMatchers("/actuator/health/**").permitAll()
			.requestMatchers("/swagger-ui/**").permitAll()
			.requestMatchers("/v3/api-docs/**").permitAll());

		return http.build();
	}

	@Configuration
	@EnableMethodSecurity
	@ConditionalOnProperty(name = "application.security.disabled", havingValue = "false", matchIfMissing = true)
	static class DefaultWebSecurityConfig {

		@Autowired AuthErrorHandler authErrorHandler;

		@Autowired OwnershipPermissionEvaluator ownershipPermissionEvaluator;

		/**
		 * Converts an Entra ID access token to a Spring Security {@link Authentication} object.
		 */
		@Bean JwtAuthenticationConverter jwtAuthenticationConverter() {
			log.info("Creating 'jwtAuthenticationConverter' bean");

			final var jwtAuthenticationConverter = new JwtAuthenticationConverter();
			jwtAuthenticationConverter.setPrincipalClaimName("oid"); // TODO ::: GjB ::: extract to config string
			jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter());

			return jwtAuthenticationConverter;
		}

		/**
		 * Converts an Entra ID access token to a collection of Spring Security {@link GrantedAuthority} objects.
		 */
		@Bean Converter<Jwt, Collection<GrantedAuthority>> jwtGrantedAuthoritiesConverter() {
			log.info("Creating 'jwtGrantedAuthoritiesConverter' bean");

			return jwt -> Optional.ofNullable(jwt.getClaimAsStringList("roles")) // TODO ::: GjB ::: extract to config string
				.orElse(Collections.emptyList()).stream()
				.map(SimpleGrantedAuthority::new)
				.collect(Collectors.toUnmodifiableList());
		}

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
					.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())))
				.sessionManagement(sessionManagement -> sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

			//
			// Note: additional security checks for this filter chain
			//       will be handled by controller @PreAuthorize annotations
			//

			return http.build();
		}

		@Bean MethodSecurityExpressionHandler methodSecurityExpressionHandler() {
			final var methodSecurityExpressionHandler = new DefaultMethodSecurityExpressionHandler();
			methodSecurityExpressionHandler.setPermissionEvaluator(ownershipPermissionEvaluator);
			return methodSecurityExpressionHandler;
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