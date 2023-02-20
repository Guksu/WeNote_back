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

/**PROJECT API DTO */
export interface ProjectDto {
  PRO_ID: number;
  PRO_CATEGORY: string;
  PRO_TITLE: string;
  PRO_CONTENT: string;
  PRO_STATE: string;
  PRO_REG__DT: string;
}

/**PROJECT NOTE API DTO */
export interface ProjectNoteDto {
  PRO_NOTE_ID: number;
  PRO_NOTE_TITLE: string;
  PRO_NOTE_CONTENT: string;
  PRO_NOTE_REG_DT: string;
  PRO_NOTE_STATE: string;
  PRO_NOTE_IMG: string;
}
