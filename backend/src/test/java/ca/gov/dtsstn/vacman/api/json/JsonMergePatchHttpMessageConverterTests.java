/**
 * Copyright (c) 2021 Her Majesty the Queen in Right of Canada, as represented by the Employment and Social Development Canada
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

package ca.gov.dtsstn.vacman.api.json;

import static java.util.Collections.singletonMap;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpInputMessage;
import org.springframework.http.HttpOutputMessage;

import jakarta.json.Json;
import jakarta.json.JsonMergePatch;

/**
 * Tests for {@link JsonMergePatchHttpMessageConverter}.
 */
class JsonMergePatchHttpMessageConverterTests {

	JsonMergePatchHttpMessageConverter jsonMergePatchHttpMessageConverter;

	@BeforeEach
	void setUp() throws Exception {
		this.jsonMergePatchHttpMessageConverter = new JsonMergePatchHttpMessageConverter();
	}

	@Test
	void testSupportsClass() {
		assertThat(jsonMergePatchHttpMessageConverter.supports(JsonMergePatch.class)).isTrue();
		assertThat(jsonMergePatchHttpMessageConverter.supports(Object.class)).isFalse();
	}

	@Test
	void testReadInternal() throws Exception {
		final InputStream body = new ByteArrayInputStream("{ \"key\":\"value\" }".getBytes());

		final var httpInputMessage = mock(HttpInputMessage.class);
		when(httpInputMessage.getBody()).thenReturn(body);

		final var jsonValue = jsonMergePatchHttpMessageConverter.readInternal(JsonMergePatch.class, httpInputMessage).toJsonValue();

		assertThat(jsonValue.asJsonObject().getString("key")).isEqualTo("value");
	}

	@Test
	void testWriteInternal() throws Exception {
		final var jsonPatchObject = Json.createObjectBuilder(singletonMap("key", "value")).build();
		final var byteArrayOutputStream = new ByteArrayOutputStream();

		final var httpOutputMessage = mock(HttpOutputMessage.class);
		when(httpOutputMessage.getBody()).thenReturn(byteArrayOutputStream);

		jsonMergePatchHttpMessageConverter.writeInternal(Json.createMergePatch(jsonPatchObject), httpOutputMessage);

		assertThat(byteArrayOutputStream).hasToString("{\"key\":\"value\"}");
	}

}
