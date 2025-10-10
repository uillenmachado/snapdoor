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
  
  // Campos de enriquecimento (snake_case conforme database)
  first_name?: string;
  last_name?: string;
  job_title?: string;
  linkedin_url?: string;
  full_name?: string;
  headline?: string;
  about?: string;
  location?: string;
  education?: string;
  connections?: string;
  avatar_url?: string;
  seniority?: string;
  department?: string;
  twitter_url?: string;
  company_size?: string;
  company_industry?: string;
  company_location?: string;
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
