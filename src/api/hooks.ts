import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";
import type {
  ConfigStatus,
  Campaign,
  AutoPublishResponse,
  AnalyticsDetail,
  ImageAnalysisResponse,
} from "./types";

// ── Config ──────────────────────────────────────────────────────────
export const useConfigStatus = () =>
  useQuery<ConfigStatus>({
    queryKey: ["config-status"],
    queryFn: () => api.get("/config/status").then((r) => r.data),
    refetchInterval: 30000,
  });

export const useSaveConfig = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, string>) =>
      api.post("/config/save", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["config-status"] }),
  });
};

// ── Campaigns ────────────────────────────────────────────────────────
export const useCampaigns = () =>
  useQuery<Campaign[]>({
    queryKey: ["campaigns"],
    queryFn: () => api.get("/campaigns").then((r) => r.data),
    refetchInterval: 60000,
  });

export const useCampaign = (id: number) =>
  useQuery<Campaign>({
    queryKey: ["campaign", id],
    queryFn: () => api.get(`/campaigns/${id}`).then((r) => r.data),
    enabled: !!id,
  });

export const useAutoPublish = () => {
  const qc = useQueryClient();
  return useMutation<AutoPublishResponse, Error, FormData>({
    mutationFn: (formData) =>
      api.post("/campaigns/auto-publish", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000, // 2 minutos (sube imágenes + crea todo)
      }).then((r) => r.data),
    onSuccess: (data) => {
      if (data.status === "published") {
        qc.invalidateQueries({ queryKey: ["campaigns"] });
      }
    },
  });
};

export const useToggleCampaign = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: number; action: "pause" | "activate" }) =>
      api.post(`/campaigns/${id}/${action}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns"] }),
  });
};

// ── Analytics ────────────────────────────────────────────────────────
export const useCampaignAnalytics = (id: number) =>
  useQuery<AnalyticsDetail>({
    queryKey: ["analytics", id],
    queryFn: () => api.get(`/analytics/campaign/${id}/metrics`).then((r) => r.data),
    enabled: !!id,
    refetchInterval: 120000,
  });

// ── AI Advisor ────────────────────────────────────────────────────────
export const useScoreCopy = () =>
  useMutation({
    mutationFn: (data: { copy: string; product_name: string }) =>
      api.post("/ai/score-copy", data).then((r) => r.data),
  });

export const useDiagnose = (campaignId: number) =>
  useQuery({
    queryKey: ["diagnose", campaignId],
    queryFn: () => api.get(`/ai/diagnose/${campaignId}`).then((r) => r.data),
    enabled: false,
  });

// ── Image Analysis ──────────────────────────────────────────────────
export const useAnalyzeImages = () =>
  useMutation<ImageAnalysisResponse, Error, FormData>({
    mutationFn: (formData) =>
      api.post("/ai/analyze-images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }).then((r) => r.data),
  });
