export interface CreateUserDto {
  identificationNumber: string;
  email: string;
  userName: string;
  password: string;
  roles: string[];
}
