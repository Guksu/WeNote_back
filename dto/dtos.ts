/**Account API DTO */
export interface MemberDto {
  MEM_EMAIL: string;
  MEM_NICK: string;
  MEM_PW: string;
  MEM_IMG: string;
}

/**NOTE API DTO */
export interface NoteDto {
  NOTE_ID: number;
  NOTE_TITLE: string;
  NOTE_CONTENT: string;
  NOTE_REG_DT: string;
  NOTE_STATE: string;
  NOTE_IMG: string;
}
