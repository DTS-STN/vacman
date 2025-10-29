package ca.gov.dtsstn.vacman.api.service;

import java.io.IOException;
import java.io.StringWriter;
import java.util.Locale;
import java.util.Map;

import org.springframework.stereotype.Service;

import freemarker.template.Configuration;
import freemarker.template.SimpleScalar;
import freemarker.template.Template;
import freemarker.template.TemplateException;


/**
 * Service for processing email templates using FreeMarker.
 * This service handles the rendering of email templates with dynamic data,
 * supporting internationalization through locale-based template selection.
 */
@Service
public class EmailTemplateService {

	/**
	 * A record representing the content of an email, consisting of subject and body.
	 *
	 * @param subject the subject line of the email
	 * @param body the body content of the email
	 */
	public record EmailContent(String subject, String body) {}

	/**
	 * The FreeMarker configuration used for template processing.
	 */
	private final Configuration freemarkerConfig;

	/**
	 * Constructs an EmailTemplateService with the given FreeMarker configuration.
	 *
	 * @param freemarkerConfig the FreeMarker configuration to use for template processing
	 */
	public EmailTemplateService(Configuration freemarkerConfig) {
		this.freemarkerConfig = freemarkerConfig;
	}

	/**
	 * Processes an email template with the provided model data and language.
	 *
	 * @param templateName the name of the template to process
	 * @param locale the locale for locale-specific template selection
	 * @param model the data model to merge into the template
	 * @return the processed email content containing subject and body
	 * @throws RuntimeException if template processing fails
	 */
	public EmailContent processEmailTemplate(String templateName, Locale locale, Map<String, ?> model) {
		try {
			// Automatically fetches correct template based on locale by recognizing the suffix in the template file name
			final var template = freemarkerConfig.getTemplate("email/" + templateName, locale);
			return merge(template, model);
		}
		catch (final IOException exception) {
			throw new RuntimeException("Failed to process email template: " + templateName, exception);
		}
	}

	/**
	 * Merges the template with the model data to produce email content.
	 *
	 * @param template the FreeMarker template to process
	 * @param model the data model
	 * @return the email content
	 * @throws RuntimeException if merging fails
	 */
	private EmailContent merge(Template template, Map<String, ?> model) {
		try {
			final var environment = template.createProcessingEnvironment(model, new StringWriter());
			environment.process();

			final var subjectTemplateModel = environment.getVariable("emailSubject");
			final var subject = ((SimpleScalar) subjectTemplateModel).getAsString();

			final var body = environment.getOut().toString();

			return new EmailContent(subject, body);
		}
		catch (final IOException | TemplateException exception) {
			throw new RuntimeException("Failed to process email template: " + template.getName(), exception);
		}
	}

}