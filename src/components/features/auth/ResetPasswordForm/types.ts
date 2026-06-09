export type ResetSessionState = 'checking' | 'ready' | 'invalid';

export interface ResetPasswordFormState {
  password: string;
  confirm: string;
  loading: boolean;
  error: string;
}
