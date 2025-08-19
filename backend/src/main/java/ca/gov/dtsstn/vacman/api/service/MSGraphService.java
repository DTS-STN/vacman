package ca.gov.dtsstn.vacman.api.service;

import java.util.Optional;
import java.util.StringJoiner;

import ca.gov.dtsstn.vacman.api.service.dto.MSGraphUserCollection;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.security.oauth2.client.OAuth2AuthorizeRequest;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientManager;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import ca.gov.dtsstn.vacman.api.config.properties.ApplicationProperties;
import ca.gov.dtsstn.vacman.api.service.dto.MSGraphUser;

@Service
public class MSGraphService {

	private static final Logger log = LoggerFactory.getLogger(MSGraphService.class);

	private static final String SELECTED_USER_PROPERTIES = new StringJoiner(",")
		.add("id")
		.add("businessPhones")
		.add("city")
		.add("department")
		.add("givenName")
		.add("jobTitle")
		.add("mail")
		.add("mobilePhone")
		.add("officeLocation")
		.add("onPremisesSamAccountName")
		.add("preferredLanguage")
		.add("state")
		.add("surname")
		.toString();

	private final RestTemplate restTemplate;

	public MSGraphService(ApplicationProperties applicationProperties, OAuth2AuthorizedClientManager oauth2AuthorizedClientManager, RestTemplateBuilder restTemplateBuilder) {
		this.restTemplate = restTemplateBuilder
			.rootUri(applicationProperties.msGraph().baseUrl())
			.connectTimeout(applicationProperties.msGraph().connectTimeout())
			.readTimeout(applicationProperties.msGraph().readTimeout())
			.interceptors(oauthInterceptor(oauth2AuthorizedClientManager))
			.build();
	}

	/**
	 * Search for a Microsoft Entra user account by email. Assumes emails are unique.
	 * @param email The email to search by.
	 * @return The Entra user, if any.
	 */
	public Optional<MSGraphUser> getUserByEmail(String email) {
		// Search is considered an "advanced" capability and requires this header value to be set.
		// See: https://learn.microsoft.com/en-us/graph/aad-advanced-queries
		HttpHeaders headers = new HttpHeaders();
		headers.set("ConsistencyLevel", "eventual");

		final var request = new HttpEntity<>(headers);
		final var response = restTemplate.exchange("/users?$search=\"mail:{email}\"&$select={properties}",
				HttpMethod.GET,
				request,
				MSGraphUserCollection.class,
				email,
				SELECTED_USER_PROPERTIES);

		if (response.getStatusCode().isSameCodeAs(HttpStatus.NOT_FOUND)) {
			log.warn("Could not find user with email=[{}] in MSGraph", email);
			return Optional.empty();
		}

		if (response.getStatusCode().isError()) {
			log.error("Unexpected response from MSGraph: status={}, body={}", response.getStatusCode(), response.getBody());
			throw new RestClientException("Unexpected response from MSGraph: " + response.getStatusCode());
		}

		var foundUsers = response.getBody();
		log.debug("Successfully retrieved users with email=[{}] from MSGraph: [{}]", email, foundUsers);

		if (foundUsers == null) {
			return Optional.empty();
		}

		// The G-Man assures me emails are unique.
		return (foundUsers.value() == null)
				? Optional.empty()
				: foundUsers.value().stream().findFirst();
	}

	public Optional<MSGraphUser> getUser(String microsoftEntraId) {
		log.debug("Fetching user with id=[{}] from MSGraph", microsoftEntraId);
		final var response = restTemplate.getForEntity("/users/{id}?$select={properties}", MSGraphUser.class, microsoftEntraId, SELECTED_USER_PROPERTIES);

		if (response.getStatusCode().isSameCodeAs(HttpStatus.NOT_FOUND)) {
			log.warn("Could not find user with id=[{}] in MSGraph", microsoftEntraId);
			return Optional.empty();
		}

		if (response.getStatusCode().isError()) {
			log.error("Unexpected response from MSGraph: status={}, body={}", response.getStatusCode(), response.getBody());
			throw new RestClientException("Unexpected response from MSGraph: " + response.getStatusCode());
		}

		log.debug("Successfully retrieved user with id=[{}] from MSGraph: [{}]", microsoftEntraId, response.getBody());
		return Optional.ofNullable(response.getBody());
	}

	private ClientHttpRequestInterceptor oauthInterceptor(OAuth2AuthorizedClientManager oauth2AuthorizedClientManager) {
		final var oauth2AuthorizeRequest = OAuth2AuthorizeRequest.withClientRegistrationId("ms-graph").principal("vacman-api").build();

		return (request, body, execution) -> {
			final var accessToken = oauth2AuthorizedClientManager.authorize(oauth2AuthorizeRequest).getAccessToken();
			request.getHeaders().setBearerAuth(accessToken.getTokenValue());
			return execution.execute(request, body);
		};
	}

}
