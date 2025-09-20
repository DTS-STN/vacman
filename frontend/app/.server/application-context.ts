/**
 * React Router context for providing application-level data to loaders and actions.
 * This is used by the server-side request handler to pass objects and data to the React application.
 *
 * @see https://reactrouter.com/how-to/middleware
 */
import { createContext } from 'react-router';

export interface ApplicationContext {
  readonly nonce: string;
  readonly session: AppSession;
}

export const applicationContext = createContext<ApplicationContext>();
