export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  company: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  stage: string;
  notes: Note[];
  activities: Activity[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  content: string;
  createdAt: Date;
  author: string;
}

export interface Activity {
  id: string;
  type: "message" | "email" | "comment" | "call" | "meeting";
  description: string;
  createdAt: Date;
  author: string;
}

export interface Pipeline {
  id: string;
  name: string;
  stages: Stage[];
}

export interface Stage {
  id: string;
  name: string;
  leads: Lead[];
  order: number;
  position?: number;
  color?: string;
  order_index?: number;
  pipeline_id?: string;
  created_at?: string;
  updated_at?: string;
}
