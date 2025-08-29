import * as v from 'valibot';

import { getCityService } from '~/.server/domain/services/city-service';
import { getProvinceService } from '~/.server/domain/services/province-service';
import { stringToIntegerSchema } from '~/.server/validation/string-to-integer-schema';

// Services that don't require authentication can be called at module level
const allProvinces = await getProvinceService().listAll();
const allCities = await getCityService().listAll();

export type Errors = Readonly<Record<string, [string, ...string[]] | undefined>>;

export const positionInformationSchema = v.pipe(
  v.object({
    positionNumber: v.pipe(
      v.string('app:position-information.errors.position-number-required'),
      v.trim(),
      v.nonEmpty('app:position-information.errors.position-number-required'),
      v.custom((input) => {
        const value = input as string;
        const numbers = value.split(',').map((n) => n.trim());
        return numbers.every((n) => n.length === 6); // TODO: Need to confirm validation
      }, 'app:position-information.errors.position-number-max-length'),
    ),
    groupAndLevel: v.pipe(
      v.string('app:position-information.errors.group-and-level-required'),
      v.trim(),
      v.nonEmpty('app:position-information.errors.group-and-level-required'),
    ),
    titleEn: v.pipe(
      v.string('app:position-information.errors.title-en-required'),
      v.trim(),
      v.nonEmpty('app:position-information.errors.title-en-required'),
    ),
    titleFr: v.pipe(
      v.string('app:position-information.errors.title-fr-required'),
      v.trim(),
      v.nonEmpty('app:position-information.errors.title-fr-required'),
    ),
    province: v.lazy(() =>
      v.pipe(
        stringToIntegerSchema('app:position-information.errors.provinces-required'),
        v.picklist(
          allProvinces.map(({ id }) => id),
          'app:position-information.errors.provinces-required',
        ),
      ),
    ),
    city: v.lazy(() =>
      v.pipe(
        stringToIntegerSchema('app:position-information.errors.city-required'),
        v.picklist(
          allCities.map(({ id }) => id),
          'app:position-information.errors.city-required',
        ),
      ),
    ),
    languageRequirement: v.pipe(
      v.string('app:position-information.errors.language-requirement-required'),
      v.trim(),
      v.nonEmpty('app:position-information.errors.language-requirement-required'),
    ),
    readingEn: v.pipe(
      v.pipe(v.string('app:position-information.errors.language-profile.reading-comprehension-required'), v.trim()),
    ),
    readingFr: v.pipe(
      v.pipe(v.string('app:position-information.errors.language-profile.reading-comprehension-required'), v.trim()),
    ),
    writingEn: v.pipe(
      v.pipe(v.string('app:position-information.errors.language-profile.written-expression-required'), v.trim()),
    ),
    writingFr: v.pipe(
      v.pipe(v.string('app:position-information.errors.language-profile.written-expression-required'), v.trim()),
    ),
    oralEn: v.pipe(v.pipe(v.string('app:position-information.errors.language-profile.oral-proficiency-required'), v.trim())),
    oralFr: v.pipe(v.pipe(v.string('app:position-information.errors.language-profile.oral-proficiency-required'), v.trim())),
    securityRequirement: v.pipe(
      v.string('app:position-information.errors.security-requirement-required'),
      v.trim(),
      v.nonEmpty('app:position-information.errors.security-requirement-required'),
    ),
  }),
);

export const somcConditionsSchema = v.pipe(
  v.object({
    englishStatementOfMerit: v.pipe(
      v.string('app:somc-conditions.errors.english-somc-required'),
      v.trim(),
      v.nonEmpty('app:somc-conditions.errors.english-somc-required'),
    ),
    frenchStatementOfMerit: v.pipe(
      v.string('app:somc-conditions.errors.french-somc-required'),
      v.trim(),
      v.nonEmpty('app:somc-conditions.errors.french-somc-required'),
    ),
  }),
);
