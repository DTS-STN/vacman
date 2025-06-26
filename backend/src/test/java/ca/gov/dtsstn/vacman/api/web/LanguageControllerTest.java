package ca.gov.dtsstn.vacman.api.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;

import ca.gov.dtsstn.vacman.api.config.WebSecurityConfig;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageEntity;
import ca.gov.dtsstn.vacman.api.service.LanguageService;
import ca.gov.dtsstn.vacman.api.web.model.mapper.LanguageModelMapper;

@ActiveProfiles("test")
@Import({ WebSecurityConfig.class })
@DisplayName("LanguageController tests")
@WebMvcTest({ LanguageController.class })
class LanguageControllerTest {

    @Autowired MockMvc mockMvc;

    @Autowired ObjectMapper objectMapper;

    @MockitoBean LanguageService languageService;

    LanguageModelMapper languageModelMapper = Mappers.getMapper(LanguageModelMapper.class);

    @BeforeEach
    void beforeEach() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    @WithMockUser(authorities = { "SCOPE_employee" })
    @DisplayName("GET /api/v1/languages - Should return paginated language collection")
    void getLanguages_shouldReturnPaginatedLanguageCollection() throws Exception {
        // Create mock languages
        final var mockLanguages = List.of(
            createLanguageEntity(1L, "EN", "English", "Anglais"),
            createLanguageEntity(2L, "FR", "French", "Français")
        );

        // Create pageable and page
        final var pageable = PageRequest.of(0, 2);
        final var mockPage = new PageImpl<>(mockLanguages, pageable, 4);

        // Mock service response
        when(languageService.getLanguages(any(Pageable.class))).thenReturn(mockPage);

        // Map to expected response
        final var expectedResponse = mockPage.map(languageModelMapper::toModel);

        // Perform request and verify
        mockMvc.perform(get("/api/v1/languages"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(content().json(objectMapper.writeValueAsString(expectedResponse)));

        // Verify service was called
        verify(languageService).getLanguages(any(Pageable.class));
    }

    @Test
    @WithMockUser(authorities = { "SCOPE_employee" })
    @DisplayName("GET /api/v1/languages?code=EN - Should return filtered language")
    void getLanguages_withCode_shouldReturnFilteredLanguage() throws Exception {
        // Create mock language
        final var mockLanguage = createLanguageEntity(1L, "EN", "English", "Anglais");

        // Mock service response
        when(languageService.getLanguageByCode("EN")).thenReturn(Optional.of(mockLanguage));

        // Perform request and verify
        mockMvc.perform(get("/api/v1/languages?code=EN"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON));

        // Verify service was called
        verify(languageService).getLanguageByCode("EN");
    }

    // Helper method to create a LanguageEntity
    private LanguageEntity createLanguageEntity(Long id, String code, String nameEn, String nameFr) {
        LanguageEntity entity = new LanguageEntity();
        entity.setId(id);
        entity.setCode(code);
        entity.setNameEn(nameEn);
        entity.setNameFr(nameFr);
        entity.setCreatedBy("test-user");
        entity.setCreatedDate(Instant.now());
        entity.setLastModifiedBy("test-user");
        entity.setLastModifiedDate(Instant.now());
        return entity;
    }
}