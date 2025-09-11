package ca.gov.dtsstn.vacman.api.service;

import java.util.Optional;
import java.util.StringJoiner;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.client.RestTemplateBuilder;
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

	public Optional<MSGraphUser> getUserById(String microsoftEntraId) {
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
