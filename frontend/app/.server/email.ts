export type VerificationCodeEmailRequestEntity = {
  email_address: string;
  template_id: string;
  personalisation: {
    EmailVerificationCode: string;
  };
};

export type VerificationCodeEmailResponseEntity = {
  id: string;
  reference?: string;
  uri: string;
  template: {
    id: string;
    version: number;
    uri: string;
  };
  scheduled_for?: string;
  content: {
    from_email: string;
    body: string;
    subject: string;
  };
};

// original code from Canadian-dental-care-plan
// import type { ReadonlyDeep } from 'type-fest';

// export type VerificationCodeEmailRequestEntity = ReadonlyDeep<{
//   email_address: string;
//   template_id: string;
//   personalisation: {
//     EmailVerificationCode: string;
//   };
// }>;

// export type VerificationCodeEmailResponseEntity = ReadonlyDeep<{
//   id: string;
//   reference?: string;
//   content: {
//     subject: string;
//     body: string;
//     from_email: string;
//   };
//   uri: string;
//   template: {
//     id: string;
//     version: number;
//     uri: string;
//   };
// }>;
