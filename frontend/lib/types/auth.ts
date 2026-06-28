export interface User {
  id: number;
  email: string;
  display_name: string;
}

export interface TokenResponse {
  token: string;
  user: User;
}
