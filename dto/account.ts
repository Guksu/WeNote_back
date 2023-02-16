/**Account API DTO */

export interface JoinDto {
  MEM_EMAIL: string;
  MEM_NICK: string;
  MEM_PW: string;
  MEM_IMG: FileList | null;
}

export interface LoginDto {
  MEM_EMAIL: string;
  MEM_PW: string;
}
