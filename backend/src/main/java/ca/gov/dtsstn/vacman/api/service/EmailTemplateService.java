package ca.gov.dtsstn.vacman.api.service;

import freemarker.template.Configuration;
import freemarker.template.TemplateException;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.StringWriter;
import java.util.Map;

@Service
public class EmailTemplateService {
    
    private final Configuration freemarkerConfig;
    
    public EmailTemplateService(Configuration freemarkerConfig) {
        this.freemarkerConfig = freemarkerConfig;
    }

    public String processTemplate(String templateName, Map<String, Object> model) {
        try {
            final var template = freemarkerConfig.getTemplate(templateName);
            
            final var writer = new StringWriter();
            template.process(model, writer);
            
            return writer.toString();
        } catch (IOException | TemplateException e) {
            throw new RuntimeException("Failed to process email template: " + templateName, e);
        }
    }
    
    public EmailContent processEmailTemplate(String templateName, Map<String, Object> model) {
        // Process the template
        final var content = processTemplate(templateName, model);
        
        // Extract subject and body using the assign directive markers
        final var subject = extractBetween(content, "<!-- SUBJECT_START -->", "<!-- SUBJECT_END -->");
        final var body = extractBetween(content, "<!-- BODY_START -->", "<!-- BODY_END -->");
        
        return new EmailContent(subject, body);
    }

    private String extractBetween(String content, String startMarker, String endMarker) {
        final var startIdx = content.indexOf(startMarker) + startMarker.length();
        final var endIdx = content.indexOf(endMarker);
        if (startIdx == -1 || endIdx == -1 || startIdx >= endIdx) {
            throw new RuntimeException("Failed to extract content between markers: " + startMarker + " and " + endMarker);
        }
        return content.substring(startIdx, endIdx).trim();
    }
    
    /**
     * Record to hold email content (subject and body).
     */
    public record EmailContent(String subject, String body) {}
}