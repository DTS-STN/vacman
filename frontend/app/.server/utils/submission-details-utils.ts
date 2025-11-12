import type { UserService } from '~/.server/domain/services/user-service';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import type { Errors } from '~/routes/page-components/requests/validation.server';

type SubmissionDetailUserIdsArgs = {
  userService: UserService;
  accessToken: string;
  hiringManagerEmailAddress?: string | null;
  subDelegatedManagerEmailAddress?: string | null;
  userNotFoundMessage: string;
};

type SubmissionDetailUserIdsResult = {
  errors: Errors;
  hiringManagerId?: number;
  subDelegatedManagerId?: number;
};

type SubmissionDetailEmailField = 'hiringManagerEmailAddress' | 'subDelegatedManagerEmailAddress';

export async function resolveSubmissionDetailUserIds({
  userService,
  accessToken,
  hiringManagerEmailAddress,
  subDelegatedManagerEmailAddress,
  userNotFoundMessage,
}: SubmissionDetailUserIdsArgs): Promise<SubmissionDetailUserIdsResult> {
  const errors: Errors = {};

  const registerFieldError = (field: SubmissionDetailEmailField) => {
    Object.assign(errors, {
      [field]: [userNotFoundMessage],
    });
  };

  const resolveUserId = async (email: string | undefined | null, field: SubmissionDetailEmailField) => {
    if (!email) {
      return undefined;
    }

    const result = await userService.getOrCreateUserByEmail(email, accessToken);

    if (result.isErr()) {
      const error = result.unwrapErr();

      if (error.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
        registerFieldError(field);
        return undefined;
      }

      throw error;
    }

    return result.unwrap().id;
  };

  const hiringManagerId = await resolveUserId(hiringManagerEmailAddress, 'hiringManagerEmailAddress');
  const subDelegatedManagerId = await resolveUserId(subDelegatedManagerEmailAddress, 'subDelegatedManagerEmailAddress');

  return {
    errors,
    hiringManagerId,
    subDelegatedManagerId,
  };
}
