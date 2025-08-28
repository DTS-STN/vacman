package ca.gov.dtsstn.vacman.api.json;

import javax.json.Json;
import javax.json.JsonMergePatch;

import org.springframework.http.HttpInputMessage;
import org.springframework.http.HttpOutputMessage;
import org.springframework.http.converter.AbstractHttpMessageConverter;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.http.converter.HttpMessageNotWritableException;
import org.springframework.stereotype.Component;

/**
 * An {@link AbstractHttpMessageConverter} that can read and write {@link JsonMergePatch} objects.
 *
 * @see <a href="https://tools.ietf.org/html/rfc7396">RFC 7396: JSON Merge Patch</a>
 */
@Component
public class JsonMergePatchHttpMessageConverter extends AbstractHttpMessageConverter<JsonMergePatch> {

	public JsonMergePatchHttpMessageConverter() {
		super(JsonPatchMediaTypes.JSON_MERGE_PATCH);
	}

	@Override
	protected boolean supports(Class<?> clazz) {
		return JsonMergePatch.class.isAssignableFrom(clazz);
	}

	@Override
	protected JsonMergePatch readInternal(Class<? extends JsonMergePatch> clazz, HttpInputMessage httpInputMessage) {
		try (final var jsonReader = Json.createReader(httpInputMessage.getBody())) {
			return Json.createMergePatch(jsonReader.readValue());
		}
		catch (final Exception exception) {
			throw new HttpMessageNotReadableException("Could not read JSON merge-patch: " + exception.getMessage(), exception, httpInputMessage);
		}
	}

	@Override
	protected void writeInternal(JsonMergePatch jsonMergePatch, HttpOutputMessage httpOutputMessage) {
		try (final var jsonWriter = Json.createWriter(httpOutputMessage.getBody())) {
			jsonWriter.write(jsonMergePatch.toJsonValue());
		}
		catch (final Exception exception) {
			throw new HttpMessageNotWritableException("Could not write JSON merge-patch: " + exception.getMessage(), exception);
		}
	}

}
