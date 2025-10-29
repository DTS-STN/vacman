package ca.gov.dtsstn.vacman.api.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.io.StringReader;
import java.util.Locale;
import java.util.Map;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import ca.gov.dtsstn.vacman.api.service.EmailTemplateService.EmailContent;
import freemarker.template.Configuration;
import freemarker.template.Template;

@ExtendWith({ MockitoExtension.class })
@DisplayName("EmailTemplateService tests")
class EmailTemplateServiceTest {

	@Mock
	Configuration freemarkerConfig;

	@InjectMocks
	EmailTemplateService emailTemplateService;

	@Nested
	@DisplayName("processEmailTemplate()")
	class ProcessEmailTemplate {

		@Test
		@DisplayName("Should extract subject and body correctly from a basic template")
		void shouldExtractSubjectAndBodyCorrectly() throws Exception {
			final var templateContent = """
				<#assign emailSubject>Test Subject</#assign>
				This is the email body.""";

			mockTemplate("testTemplate", "en", templateContent);

			final var emailContent = emailTemplateService.processEmailTemplate("testTemplate", Locale.ENGLISH, Map.of());

			assertThat(emailContent).extracting(EmailContent::subject)
				.isEqualTo("Test Subject");
			assertThat(emailContent).extracting(EmailContent::body)
				.isEqualTo("This is the email body.");
		}

		@Test
		@DisplayName("Should substitute variables in subject and body")
		void shouldSubstituteVariables() throws Exception {
			final var templateContent = """
				<#assign emailSubject>Hello ${name}.. This is the subject of the email.</#assign>
				Hello ${name}... this is the body of the email.""";

			mockTemplate("testTemplate", "en", templateContent);

			final var emailContent = emailTemplateService.processEmailTemplate(
				"testTemplate",
				Locale.ENGLISH,
				Map.of("name", "John Doe")
			);

			assertThat(emailContent).extracting(EmailContent::subject)
				.isEqualTo("Hello John Doe.. This is the subject of the email.");
			assertThat(emailContent).extracting(EmailContent::body)
				.isEqualTo("Hello John Doe... this is the body of the email.");
		}

		@Test
		@DisplayName("Should handle complex variable substitution")
		void shouldHandleComplexVariableSubstitution() throws Exception {
			final var templateContent = """
				<#assign emailSubject>Request #${requestId} - ${status}</#assign>
				Hello ${name},

				Your request #${requestId} has been ${status}.
				Reference: ${reference}""";

			mockTemplate("testTemplate", "en", templateContent);

			final var emailContent = emailTemplateService.processEmailTemplate(
				"testTemplate",
				Locale.ENGLISH,
				Map.of(
					"requestId", "12345",
					"status", "approved",
					"name", "John",
					"reference", "REF-67890"
				)
			);

			assertThat(emailContent).extracting(EmailContent::subject)
				.isEqualTo("Request #12345 - approved");
			assertThat(emailContent).extracting(EmailContent::body)
				.isEqualTo("Hello John,\n\nYour request #12345 has been approved.\nReference: REF-67890");
		}

		@Test
		@DisplayName("Should select correct template based on language")
		void shouldSelectCorrectTemplateBasedOnLanguage() throws Exception {
			final var enTemplateContent = """
				<#assign emailSubject>English Subject</#assign>
				English body.""";

			final var frTemplateContent = """
				<#assign emailSubject>French Subject</#assign>
				French body.""";

			mockTemplate("testTemplate", "en", enTemplateContent);
			mockTemplate("testTemplate", "fr", frTemplateContent);

			final var enContent = emailTemplateService.processEmailTemplate("testTemplate", Locale.ENGLISH, Map.of());
			final var frContent = emailTemplateService.processEmailTemplate("testTemplate", Locale.FRENCH, Map.of());

			assertThat(enContent).extracting(EmailContent::subject)
				.isEqualTo("English Subject");
			assertThat(enContent).extracting(EmailContent::body)
				.isEqualTo("English body.");

			assertThat(frContent).extracting(EmailContent::subject)
				.isEqualTo("French Subject");
			assertThat(frContent).extracting(EmailContent::body)
				.isEqualTo("French body.");
		}

		@Test
		@DisplayName("Should throw exception when emailSubject is missing")
		void shouldThrowExceptionWhenEmailSubjectIsMissing() throws Exception {
			final var templateContent = "This is just a body without a subject.";

			mockTemplate("testTemplate", "en", templateContent);

			assertThatThrownBy(() -> emailTemplateService.processEmailTemplate("testTemplate", Locale.ENGLISH, Map.of()))
				.isInstanceOf(NullPointerException.class);
		}

		@Test
		@DisplayName("Should handle empty subject and body")
		void shouldHandleEmptySubjectAndBody() throws Exception {
			final var templateContent = "<#assign emailSubject></#assign>";

			mockTemplate("testTemplate", "en", templateContent);

			final var emailContent = emailTemplateService.processEmailTemplate("testTemplate", Locale.ENGLISH, Map.of());

			assertThat(emailContent).extracting(EmailContent::subject).asString().isEmpty();
			assertThat(emailContent).extracting(EmailContent::body).asString().isEmpty();
		}

		// Helper method to mock FreeMarker template
		void mockTemplate(String templateName, String language, String content) throws Exception {
			final var mockTemplate = mock(Template.class);

			when(freemarkerConfig.getTemplate(eq("email/" + templateName), eq(Locale.of(language))))
				.thenReturn(mockTemplate);

			// This is a bit complex because we need to mock the FreeMarker processing environment
			when(mockTemplate.createProcessingEnvironment(any(), any()))
				.thenAnswer(invocation -> {
					final var model = invocation.getArgument(0);

					// Process the template with the actual FreeMarker engine
					final var actualTemplate = new Template(templateName, new StringReader(content), new Configuration(Configuration.VERSION_2_3_32));

					return actualTemplate.createProcessingEnvironment(model, invocation.getArgument(1));
				});
		}

	}

}
