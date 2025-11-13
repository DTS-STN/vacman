import type { ComponentPropsWithoutRef, JSX } from 'react';
import { useEffect, useRef } from 'react';

import { useTranslation } from 'react-i18next';

import { AnchorLink } from '~/components/links';
import { cn } from '~/utils/tailwind-utils';

/**
 * Represents an error in a profile or request section.
 */
export interface SectionErrorItem {
  /** The error message to display. */
  errorMessage: string;
  /** The ID of the profile section associated with the error. */
  sectionId: string;
}

/**
 * Props for the SectionErrorSummary component.
 */
export interface SectionErrorSummaryProps extends OmitStrict<ComponentPropsWithoutRef<'section'>, 'role' | 'tabIndex'> {
  /** Section completeness check data containing section completion status. */
  sectionCompleteness: {
    personalInfoComplete?: boolean;
    employmentInfoComplete?: boolean;
    referralComplete?: boolean;
    processInformationComplete?: boolean;
    positionInformationComplete?: boolean;
    statementOfMeritCriteriaInformationComplete?: boolean;
    submissionInformationComplete?: boolean;
  };
  /** Whether this is for Profile approval (HR advisor view) or Profile submission (employee view)*/
  isForApproval?: boolean;
}

/**
 * SectionErrorSummary component displays profile or request completeness errors in a format similar to ErrorSummary.
 * It shows links to incomplete profile sections for users to navigate and complete them.
 *
 * - When there are errors, the component scrolls into view and focuses on it for accessibility.
 * - Provides an accessible, styled list of errors with links to the profile sections.
 *
 * @returns The rendered component or `null` if there are no errors.
 */
export function SectionErrorSummary({
  className,
  sectionCompleteness,
  isForApproval = true,
  ...rest
}: SectionErrorSummaryProps): JSX.Element | null {
  const { t } = useTranslation(['app', 'gcweb']);
  const sectionRef = useRef<HTMLElement>(null);

  // Build error list based on incomplete sections
  const errors: SectionErrorItem[] = [];

  if (sectionCompleteness.personalInfoComplete === false) {
    const messageKey = isForApproval
      ? 'app:profile.profile-personal-info-incomplete-for-approval'
      : 'app:profile.profile-personal-info-incomplete';
    errors.push({
      errorMessage: t(messageKey),
      sectionId: 'personal-information-section',
    });
  }

  if (sectionCompleteness.employmentInfoComplete === false) {
    const messageKey = isForApproval
      ? 'app:profile.profile-employment-info-incomplete-for-approval'
      : 'app:profile.profile-employment-info-incomplete';
    errors.push({
      errorMessage: t(messageKey),
      sectionId: 'employment-information-section',
    });
  }

  if (sectionCompleteness.referralComplete === false) {
    const messageKey = isForApproval
      ? 'app:profile.profile-referral-preferences-incomplete-for-approval'
      : 'app:profile.profile-referral-preferences-incomplete';
    errors.push({
      errorMessage: t(messageKey),
      sectionId: 'referral-preferences-section',
    });
  }

  if (sectionCompleteness.processInformationComplete === false) {
    errors.push({
      errorMessage: t('app:hiring-manager-referral-requests.request-incomplete-process-information'),
      sectionId: 'process-information-section',
    });
  }

  if (sectionCompleteness.positionInformationComplete === false) {
    errors.push({
      errorMessage: t('app:hiring-manager-referral-requests.request-incomplete-position-information'),
      sectionId: 'position-information-section',
    });
  }

  if (sectionCompleteness.statementOfMeritCriteriaInformationComplete === false) {
    errors.push({
      errorMessage: t('app:hiring-manager-referral-requests.request-incomplete-somc-information'),
      sectionId: 'somc-information-section',
    });
  }

  if (sectionCompleteness.submissionInformationComplete === false) {
    errors.push({
      errorMessage: t('app:hiring-manager-referral-requests.request-incomplete-submission-information'),
      sectionId: 'submission-information-section',
    });
  }
  // Scroll and focus on the error summary when errors are updated.
  useEffect(() => {
    if (errors.length > 0 && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth' });
      sectionRef.current.focus();
    }
  }, [errors.length]);

  if (errors.length === 0) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className={cn('my-5 border-4 border-red-600 p-4', className)}
      {...rest}
      tabIndex={-1}
      aria-live="assertive"
      aria-atomic={true}
    >
      <h2 className="font-lato text-lg font-semibold">{t('gcweb:error-summary.header', { count: errors.length })}</h2>
      <ol className="mt-1.5 list-decimal space-y-2 pl-7">
        {errors.map(({ sectionId, errorMessage }) => (
          <li key={`${sectionId}-${errorMessage}`}>
            <AnchorLink className="text-red-700 underline hover:decoration-2 focus:decoration-2" anchorElementId={sectionId}>
              {errorMessage}
            </AnchorLink>
          </li>
        ))}
      </ol>
    </section>
  );
}
