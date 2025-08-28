package ca.gov.dtsstn.vacman.api.json;

import org.springframework.http.MediaType;

/**
 * Defines custom media type constants for JSON Patch and JSON Merge Patch operations.
 * <p>
 * These media types are used to specify the content type of HTTP requests
 * that apply partial updates to resources.
 *
 * @see <a href="https://tools.ietf.org/html/rfc7396">RFC 7396: JSON Merge Patch</a>
 * @see <a href="https://tools.ietf.org/html/rfc6902">RFC 6902: JavaScript Object Notation (JSON) Patch</a>
 */
public class JsonPatchMediaTypes {

	public static final String JSON_MERGE_PATCH_VALUE = "application/merge-patch+json";

	public static final MediaType JSON_MERGE_PATCH = MediaType.valueOf(JSON_MERGE_PATCH_VALUE);

	public static final String JSON_PATCH_VALUE = "application/json-patch+json";

	public static final MediaType JSON_PATCH = MediaType.valueOf(JSON_PATCH_VALUE);

}
