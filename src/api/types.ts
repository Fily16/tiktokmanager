export interface ConfigStatus {
  has_openai: boolean;
  has_tiktok: boolean;
  advertiser_id: string | null;
  is_ready: boolean;
}

export interface Campaign {
  id: number;
  name: string;
  status: "ACTIVE" | "PAUSED" | "DELETED" | "DRAFT";
  objective: string;
  daily_budget_soles: number;
  total_budget_soles: number | null;
  predicted_roas: number | null;
  actual_roas: number | null;
  auto_optimize: boolean;
  tiktok_campaign_id: string | null;
  created_at: string;
}

export interface CampaignMetric {
  id: number;
  campaign_id: number;
  impressions: number;
  clicks: number;
  conversions: number;
  spend_soles: number;
  revenue_soles: number;
  ctr: number;
  ctr_percent: number;
  cpm: number;
  cpm_soles: number;
  cpc: number;
  cpc_soles: number;
  cpa: number;
  cpa_soles: number;
  roas: number;
  recorded_at: string;
  date: string;
}

export interface AutoDecision {
  id: number;
  campaign_id: number;
  decision_type: string;
  reason: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

export interface AutoPublishRequest {
  product_description: string;
  budget_total_soles: number;
  landing_url: string;
  objective?: "TRAFFIC" | "CONVERSIONS" | "APP_INSTALL" | "VIDEO_VIEWS" | "REACH" | "LEAD_GENERATION";
  target_roas?: number;
  min_viability_roas?: number;
  auto_optimize?: boolean;
}

export interface AutoPublishResponse {
  status: "published" | "blocked" | "draft_carousel";
  reason?: string;
  campaign_id?: number;
  tiktok_campaign_id?: string;
  tiktok_adgroup_id?: string;
  campaign_name?: string;
  publish_log: string[];
  data_science_decisions?: {
    budget_distribution: {
      daily_soles: number;
      duration_days: number;
      strategy: string;
      rationale: string;
    };
    ml_prediction: {
      predicted_roas: number;
      confidence_range: { low: number; high: number };
      viability: string;
      passed_threshold: boolean;
    };
    bayesian_analysis: {
      roas_mean: number;
      roas_ci_95: [number, number];
      prob_profitable: number;
      sample_size_used: number;
    };
    probability_analysis: {
      prob_at_least_1_conversion: number;
      expected_conversions: number;
      conversion_std: number;
      distribution_model: string;
    };
    creative_selection: {
      algorithm: string;
      simulations_run: number;
      copies_evaluated: number;
      winner_probability: number;
      winner_score: number;
      winner_grade: string;
      winner_hook: string;
      winner_headline: string;
      all_probabilities: number[];
    };
    audience: Record<string, unknown>;
  };
  monitoring?: {
    auto_optimize: boolean;
    check_every: string;
    auto_pause_if: string;
    auto_scale_if: string;
  };
  kpis_to_watch?: Record<string, number>;
  // Campos cuando está bloqueada
  prediction?: Record<string, unknown>;
  ai_suggestions?: string[];
  bayesian_estimate?: Record<string, unknown>;
}

export interface CopyScore {
  copy: string;
  score: number;
  grade: string;
  breakdown: {
    hook: number;
    copy: number;
    cta: number;
    readability: number;
  };
}

export interface AnalyticsDetail {
  campaign: Campaign;
  metrics: CampaignMetric[];
  statistical_analysis: {
    trend: any;
    bayesian_roas: any;
    fatigue: any;
  };
  decisions: AutoDecision[];
}

export interface ImageAnalysisResponse {
  status: string;
  image_analysis: {
    image_analysis: {
      products_detected: string[];
      prices_detected: string[];
      brands_detected: string[];
      visual_quality_score: number;
      visual_quality_notes: string;
      is_suitable_for_tiktok: boolean;
      improvement_suggestions: string[];
    };
    audience_from_visual: {
      ideal_age_range: [number, number];
      ideal_gender: string;
      interests: string[];
      income_level: string;
      buyer_persona: string;
    };
    copy_suggestions: {
      hooks: string[];
      headlines: string[];
      descriptions: string[];
      cta_recommendation: string;
      emotion_to_trigger: string;
      hashtags: string[];
    };
    campaign_strategy: {
      recommended_objective: string;
      content_format: string;
      best_placement: string;
      urgency_angle: string;
      key_selling_point: string;
    };
    ad_score: {
      overall: number;
      attention_grabbing: number;
      message_clarity: number;
      call_to_action_strength: number;
      brand_consistency: number;
    };
  };
  generated_copies: any[];
  best_copy: any;
  images_analyzed: number;
}
