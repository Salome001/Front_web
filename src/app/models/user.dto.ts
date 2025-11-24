export interface UserDto {
  id: string;
  identificationNumber: string;
  userName: string;
  email: string;
  emailConfirmed: boolean;

  password?: string; // nunca lo muestres literal
  phoneNumber?: string;
  phoneNumberConfirmed: boolean;

  twoFactorEnabled: boolean;
  roles: string[];
  isLocked: boolean;
}
