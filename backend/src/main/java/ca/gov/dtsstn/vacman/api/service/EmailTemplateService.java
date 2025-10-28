package ca.gov.dtsstn.vacman.api.service;

import freemarker.template.Configuration;
import freemarker.template.SimpleScalar;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.StringWriter;
import java.util.Locale;
import java.util.Map;

@Service
public class EmailTemplateService {

	private final Configuration freemarkerConfig;

	public EmailTemplateService(Configuration freemarkerConfig) {
		this.freemarkerConfig = freemarkerConfig;
	}

	public EmailContent processEmailTemplate(String templateName, String locale, Map<String, Object> model) {
		try {
			// automatically fetches correct template based on locale
			final var template = freemarkerConfig.getTemplate(templateName, Locale.of(locale));
			return merge(template, model);
		} catch (IOException e) {
			throw new RuntimeException("Failed to process email template: " + templateName, e);
		}
	}

	private EmailContent merge(Template template, Map<String, ?> model) {
		try {
			final var environment = template.createProcessingEnvironment(model, new StringWriter());
			environment.process();

			final var subjectTemplateModel = environment.getVariable("emailSubject");
			final var subject = ((SimpleScalar) subjectTemplateModel).getAsString();

			final var body = environment.getOut().toString();

			return new EmailContent(subject, body);
		}
		catch (IOException | TemplateException exception) {
			throw new RuntimeException("Failed to process email template: " + template.getName(), exception);
		}
	}

	/**
	 * Record to hold email content (subject and body).
	 */
	public record EmailContent(String subject, String body) {}
}