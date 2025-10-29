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

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import freemarker.template.Configuration;

@ExtendWith(MockitoExtension.class)
@DisplayName("EmailTemplateService tests")
class EmailTemplateServiceTest {

	@Mock
	private Configuration freemarkerConfig;

	private EmailTemplateService emailTemplateService;

	@BeforeEach
	void setUp() {
		emailTemplateService = new EmailTemplateService(freemarkerConfig);
	}

	@Nested
	@DisplayName("processEmailTemplate()")
	class ProcessEmailTemplate {

		@Test
		@DisplayName("Should extract subject and body correctly from a basic template")
		void shouldExtractSubjectAndBodyCorrectly() throws Exception {
			String templateContent =
				"<#assign emailSubject>\n" +
				"Test Subject\n" +
				"</#assign>\n" +
				"This is the email body.";

			mockTemplate("testTemplate", "en", templateContent);

			EmailTemplateService.EmailContent emailContent =
				emailTemplateService.processEmailTemplate("testTemplate", "en", Map.of());

			assertThat(emailContent).extracting(EmailTemplateService.EmailContent::subject)
				.isEqualTo("Test Subject\n");
			assertThat(emailContent).extracting(EmailTemplateService.EmailContent::body)
				.isEqualTo("This is the email body.");
		}

		@Test
		@DisplayName("Should substitute variables in subject and body")
		void shouldSubstituteVariables() throws Exception {
			String templateContent =
				"<#assign emailSubject>\n" +
				"Hello ${name}.. This is the subject of the email.\n" +
				"</#assign>\n" +
				"Hello ${name}... this is the body of the email.";

			mockTemplate("testTemplate", "en", templateContent);

			EmailTemplateService.EmailContent emailContent =
				emailTemplateService.processEmailTemplate(
					"testTemplate", 
					"en", 
					Map.of("name", "John Doe")
				);

			assertThat(emailContent).extracting(EmailTemplateService.EmailContent::subject)
				.isEqualTo("Hello John Doe.. This is the subject of the email.\n");
			assertThat(emailContent).extracting(EmailTemplateService.EmailContent::body)
				.isEqualTo("Hello John Doe... this is the body of the email.");
		}

		@Test
		@DisplayName("Should handle complex variable substitution")
		void shouldHandleComplexVariableSubstitution() throws Exception {
			String templateContent =
				"<#assign emailSubject>\n" +
				"Request #${requestId} - ${status}\n" +
				"</#assign>\n" +
				"Hello ${name},\n\n" +
				"Your request #${requestId} has been ${status}.\n" +
				"Reference: ${reference}";

			mockTemplate("testTemplate", "en", templateContent);

			EmailTemplateService.EmailContent emailContent =
				emailTemplateService.processEmailTemplate(
					"testTemplate",
					"en",
					Map.of(
						"requestId", "12345",
						"status", "approved",
						"name", "John",
						"reference", "REF-67890"
					)
				);

			assertThat(emailContent).extracting(EmailTemplateService.EmailContent::subject)
				.isEqualTo("Request #12345 - approved\n");
			assertThat(emailContent).extracting(EmailTemplateService.EmailContent::body)
				.isEqualTo("Hello John,\n\nYour request #12345 has been approved.\nReference: REF-67890");
		}

		@Test
		@DisplayName("Should select correct template based on language")
		void shouldSelectCorrectTemplateBasedOnLanguage() throws Exception {
			String enTemplateContent =
				"<#assign emailSubject>\n" +
				"English Subject\n" +
				"</#assign>\n" +
				"English body.";

			String frTemplateContent = 
				"<#assign emailSubject>\n" +
				"French Subject\n" +
				"</#assign>\n" +
				"French body.";

			mockTemplate("testTemplate", "en", enTemplateContent);
			mockTemplate("testTemplate", "fr", frTemplateContent);

			EmailTemplateService.EmailContent enContent =
				emailTemplateService.processEmailTemplate("testTemplate", "en", Map.of());
			EmailTemplateService.EmailContent frContent = 
				emailTemplateService.processEmailTemplate("testTemplate", "fr", Map.of());

			assertThat(enContent).extracting(EmailTemplateService.EmailContent::subject)
				.isEqualTo("English Subject\n");
			assertThat(enContent).extracting(EmailTemplateService.EmailContent::body)
				.isEqualTo("English body.");

			assertThat(frContent).extracting(EmailTemplateService.EmailContent::subject)
				.isEqualTo("French Subject\n");
			assertThat(frContent).extracting(EmailTemplateService.EmailContent::body)
				.isEqualTo("French body.");
		}

		@Test
		@DisplayName("Should throw exception when emailSubject is missing")
		void shouldThrowExceptionWhenEmailSubjectIsMissing() throws Exception {
			String templateContent = "This is just a body without a subject.";

			mockTemplate("testTemplate", "en", templateContent);

			assertThatThrownBy(() ->
				emailTemplateService.processEmailTemplate("testTemplate", "en", Map.of())
			)
				.isInstanceOf(NullPointerException.class);
		}

		@Test
		@DisplayName("Should handle empty subject and body")
		void shouldHandleEmptySubjectAndBody() throws Exception {
			String templateContent =
				"<#assign emailSubject>\n" +
				"</#assign>\n";

			mockTemplate("testTemplate", "en", templateContent);

			EmailTemplateService.EmailContent emailContent =
				emailTemplateService.processEmailTemplate("testTemplate", "en", Map.of());

			assertThat(emailContent).extracting(EmailTemplateService.EmailContent::subject)
				.asString()
				.isEmpty();
			assertThat(emailContent).extracting(EmailTemplateService.EmailContent::body)
				.asString()
				.isEmpty();
		}

		// Helper method to mock FreeMarker template
		private void mockTemplate(String templateName, String language, String content) throws Exception {
			freemarker.template.Template mockTemplate = mock(freemarker.template.Template.class);
			when(freemarkerConfig.getTemplate(eq(templateName), eq(Locale.of(language))))
				.thenReturn(mockTemplate);

			// This is a bit complex because we need to mock the FreeMarker processing environment
			when(mockTemplate.createProcessingEnvironment(any(), any()))
				.thenAnswer(invocation -> {
					Map<String, Object> model = invocation.getArgument(0);

					// Process the template with the actual FreeMarker engine
					freemarker.template.Template actualTemplate = new freemarker.template.Template(
						templateName, new StringReader(content), new Configuration(Configuration.VERSION_2_3_32));

					return actualTemplate.createProcessingEnvironment(model, invocation.getArgument(1));
				});
		}
	}
}
