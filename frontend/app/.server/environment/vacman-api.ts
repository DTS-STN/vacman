import * as v from 'valibot';

export type VacmanApi = Readonly<v.InferOutput<typeof vacmanApi>>;

export const defaults = {
  VACMAN_API_BASE_URI: 'http://localhost:8080/api/v1/',
} as const;

export const vacmanApi = v.object({
  VACMAN_API_BASE_URI: v.optional(v.string(), defaults.VACMAN_API_BASE_URI),
});
