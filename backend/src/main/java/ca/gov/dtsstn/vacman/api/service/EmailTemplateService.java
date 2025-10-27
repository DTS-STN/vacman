package ca.gov.dtsstn.vacman.api.service;

import freemarker.template.Configuration;
import freemarker.template.Template;
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
    
    /**
     * Process a FreeMarker template with the given model data.
     * 
     * @param templateName the name of the template to process
     * @param model the data model to use for template processing
     * @return the processed template content
     */
    public String processTemplate(String templateName, Map<String, Object> model) {
        try {
            // Get the template
            Template template = freemarkerConfig.getTemplate(templateName);
            
            // Process the template
            StringWriter writer = new StringWriter();
            template.process(model, writer);
            
            return writer.toString();
        } catch (IOException | TemplateException e) {
            throw new RuntimeException("Failed to process email template: " + templateName, e);
        }
    }
    
    /**
     * Process an email template and extract the subject and body.
     * The template should use the assign directive to define emailSubject and emailBody.
     * 
     * @param templateName the name of the template to process
     * @param model the data model to use for template processing
     * @return an EmailContent object containing the subject and body
     */
    public EmailContent processEmailTemplate(String templateName, Map<String, Object> model) {
        // Process the template
        String content = processTemplate(templateName, model);
        
        // Extract subject and body using the assign directive markers
        String subject = extractBetween(content, "<!-- SUBJECT_START -->", "<!-- SUBJECT_END -->");
        String body = extractBetween(content, "<!-- BODY_START -->", "<!-- BODY_END -->");
        
        return new EmailContent(subject, body);
    }
    
    /**
     * Extract text between two markers in a string.
     */
    private String extractBetween(String content, String startMarker, String endMarker) {
        int startIdx = content.indexOf(startMarker) + startMarker.length();
        int endIdx = content.indexOf(endMarker);
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