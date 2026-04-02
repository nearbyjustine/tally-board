export type MemberRole = "Leader" | "Assistant Leader" | "Member";
export type GameRank = 1 | 2 | 3 | 4;

export type Team = {
  id: string;
  name: string;
  color: string;
  created_at: string;
};

export type Member = {
  id: string;
  team_id: string;
  name: string;
  role: MemberRole;
  created_at: string;
};

export type Game = {
  id: string;
  name: string;
  points_1st: number;
  points_2nd: number;
  points_3rd: number;
  points_4th: number;
  created_at: string;
};

export type GameScore = {
  id: string;
  game_id: string;
  team_id: string;
  rank: GameRank;
  created_at: string;
};

export type Mission = {
  id: string;
  name: string;
  points: number;
  created_at: string;
};

export type MissionCompletion = {
  id: string;
  mission_id: string;
  team_id: string;
  completed_at: string;
};

export type Deduction = {
  id: string;
  team_id: string;
  amount: number;
  reason: string;
  created_at: string;
};

export type TeamImage = {
  id: string;
  team_id: string;
  url: string;
  created_at: string;
};

// Enriched types for UI
export type TeamWithScore = Team & {
  total: number;
  gamePoints: number;
  missionPoints: number;
  deductionPoints: number;
  rank: number;
};

// Supabase Database type — enables typed client operations
export type Database = {
  public: {
    Tables: {
      teams: {
        Row: Team;
        Insert: { name: string; color: string };
        Update: { name?: string; color?: string };
        Relationships: [];
      };
      members: {
        Row: Member;
        Insert: { team_id: string; name: string; role: MemberRole };
        Update: { team_id?: string; name?: string; role?: MemberRole };
        Relationships: [];
      };
      games: {
        Row: Game;
        Insert: { name: string; points_1st: number; points_2nd: number; points_3rd: number; points_4th: number };
        Update: { name?: string; points_1st?: number; points_2nd?: number; points_3rd?: number; points_4th?: number };
        Relationships: [];
      };
      game_scores: {
        Row: GameScore;
        Insert: { game_id: string; team_id: string; rank: GameRank };
        Update: { game_id?: string; team_id?: string; rank?: GameRank };
        Relationships: [];
      };
      missions: {
        Row: Mission;
        Insert: { name: string; points: number };
        Update: { name?: string; points?: number };
        Relationships: [];
      };
      mission_completions: {
        Row: MissionCompletion;
        Insert: { mission_id: string; team_id: string };
        Update: { mission_id?: string; team_id?: string };
        Relationships: [];
      };
      deductions: {
        Row: Deduction;
        Insert: { team_id: string; amount: number; reason: string };
        Update: { team_id?: string; amount?: number; reason?: string };
        Relationships: [];
      };
      team_images: {
        Row: TeamImage;
        Insert: { team_id: string; url: string };
        Update: { team_id?: string; url?: string };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
