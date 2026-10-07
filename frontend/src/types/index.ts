export interface Subject {
  id: string;
  name: string;
  slug: string;
  description: string;
  weight_percentage: number;
  icon?: string;
  display_order: number;
  questions_count?: number;
  accuracy?: number;
  questions_attempted?: number;
}

export interface Topic {
  id: string;
  name: string;
  slug: string;
  description?: string;
  display_order: number;
  questions_count?: number;
  accuracy?: number;
  questions_attempted?: number;
}

export interface QuestionOption {
  id: string;
  option_text: string;
  display_order: number;
  is_correct?: boolean | null;
}

export interface ActiveQuestionItem {
  session_question_id: string;
  question_order: number;
  id: string;
  question_text: string;
  question_type: string;
  difficulty: string;
  code_snippet?: string | null;
  subject_id: string;
  subject_name: string;
  topic_id: string;
  topic_name: string;
  options: QuestionOption[];
  selected_option_id?: string | null;
  is_marked_for_review: boolean;
  is_answered: boolean;
  time_spent_seconds: number;
  is_bookmarked: boolean;
}

export interface ActiveTestSession {
  id: string;
  title: string;
  mode: string;
  question_count: number;
  time_limit_seconds: number;
  started_at: string;
  status: string;
  remaining_seconds?: number | null;
  questions: ActiveQuestionItem[];
}

export interface SubjectBreakdown {
  subject_id: string;
  subject_name: string;
  total_questions: number;
  correct: number;
  wrong: number;
  unanswered: number;
  accuracy: number;
}

export interface TopicBreakdown {
  topic_id: string;
  topic_name: string;
  subject_name: string;
  total_questions: number;
  correct: number;
  wrong: number;
  accuracy: number;
}

export interface TestResult {
  id: string;
  title: string;
  mode: string;
  question_count: number;
  total_correct: number;
  total_wrong: number;
  total_unanswered: number;
  score: number;
  accuracy: number;
  time_spent_seconds: number;
  started_at: string;
  submitted_at?: string | null;
  subject_breakdown: SubjectBreakdown[];
  topic_breakdown: TopicBreakdown[];
  recommendation?: string;
}

export interface ReviewQuestionItem {
  session_question_id: string;
  question_order: number;
  question_id: string;
  question_text: string;
  code_snippet?: string | null;
  difficulty: string;
  subject_name: string;
  topic_name: string;
  explanation?: string | null;
  hint?: string | null;
  options: { id: string; option_text: string; is_correct: boolean; display_order: number }[];
  selected_option_id?: string | null;
  is_correct: boolean;
  is_answered: boolean;
  is_marked_for_review: boolean;
  time_spent_seconds: number;
  is_bookmarked: boolean;
}

export interface TestReviewData {
  result: TestResult;
  questions: ReviewQuestionItem[];
}

export interface WeakAreaItem {
  topic_id: string;
  topic_name: string;
  subject_id: string;
  subject_name: string;
  questions_attempted: number;
  questions_correct: number;
  accuracy: number;
  weakness_score: number;
  priority_level: string;
}

export interface OverviewAnalytics {
  total_tests_taken: number;
  total_questions_attempted: number;
  total_questions_correct: number;
  overall_accuracy: number;
  current_streak_days: number;
  best_streak_days: number;
  total_study_minutes: number;
  target_score: number;
  weak_areas_count: number;
  subjects: {
    subject_id: string;
    subject_name: string;
    slug: string;
    weight_percentage: number;
    icon?: string;
    questions_attempted: number;
    questions_correct: number;
    accuracy: number;
    average_time_seconds: number;
  }[];
  top_weak_areas: WeakAreaItem[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
  profile?: {
    university?: string;
    department?: string;
    semester?: number;
    graduation_year?: number;
    target_score: number;
    preparation_goal?: string;
    daily_study_target_minutes: number;
  };
}
