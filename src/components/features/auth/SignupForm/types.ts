export interface SignupFormState {
  name: string;
  email: string;
  password: string;
  loading: boolean;
  error: string;
  awaitingConfirmation: boolean;
}
