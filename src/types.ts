export interface Child {
  name: string;
  /** Date of birth as YYYY-MM-DD (local date, no time zone). */
  dob: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
