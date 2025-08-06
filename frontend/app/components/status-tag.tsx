import { JSX } from 'react';

import { PROFILE_STATUS_CODE } from '~/domain/constants';

interface StatusTagProps {
  status: {
    code: string;
    name: string;
  };
}

export function StatusTag({ status }: StatusTagProps): JSX.Element {
  switch (status.code) {
    case PROFILE_STATUS_CODE.approved:
      return (
        <span className="w-fit rounded-2xl border border-green-400 bg-green-100 px-3 py-0.5 text-sm font-semibold text-green-800">
          {status.name}
        </span>
      );
    case PROFILE_STATUS_CODE.archived:
      return (
        <span className="w-fit rounded-2xl border border-orange-400 bg-orange-100 px-3 py-0.5 text-sm font-semibold text-orange-800">
          {status.name}
        </span>
      );
    case PROFILE_STATUS_CODE.incomplete:
      return (
        <span className="w-fit rounded-2xl border border-blue-400 bg-blue-100 px-3 py-0.5 text-sm font-semibold text-blue-800">
          {status.name}
        </span>
      );
    case PROFILE_STATUS_CODE.pending:
      return (
        <span className="w-fit rounded-2xl border border-yellow-400 bg-yellow-100 px-3 py-0.5 text-sm font-semibold text-yellow-800">
          {status.name}
        </span>
      );

    default:
      return <></>;
  }
}
