// Static metadata to enrich OpenCompass API data.
// Benchmark scores come from OpenCompass at build time; only region/type/modality/context/arenaName are static.

export interface ModelMeta {
  region: "global" | "china";
  type: "open" | "closed";
  modality: "language" | "multimodal";
  context?: number;        // context window in K tokens (static fallback)
  dtype?: string;          // native precision e.g. "BF16" | "FP16" (static for closed models)
  arenaName?: string;      // key in chatbot arena for ELO lookup
  openRouterSlug?: string; // e.g. "openai/gpt-4o" — for context_length fetch
  hfRepo?: string;         // e.g. "deepseek-ai/DeepSeek-R1" — HuggingFace repo for config.json
}

// Chinese AI organizations for region auto-detection
export const CHINA_ORGS = new Set([
  "Zhipu", "DeepSeek", "Alibaba", "Qwen", "Tencent", "Baidu", "ByteDance",
  "Moonshot", "MiniMax", "Baichuan", "StepFun", "01.AI", "OpenBMB",
  "Shanghai AI Lab", "InternLM", "IDEA", "Sensetime", "iFLYTEK",
  "Kimi", "Manus", "ModelBest",
]);

// Organizations whose models are open-source by default
// Used as fallback when model name doesn't match MODEL_META exactly
export const OPEN_SOURCE_ORGS = new Set([
  "Meta", "Alibaba", "Qwen", "DeepSeek", "OpenBMB",
  "Shanghai AI Lab", "InternLM", "Mistral", "EleutherAI",
  "BigScience", "TII", "01.AI",
]);

// Map from OpenCompass model name → metadata
// Keys should match the "model" field in OpenCompass OverallTable exactly
export const MODEL_META: Record<string, ModelMeta> = {
  // ── Global ─────────────────────────────────────────────────────────────────
  // context = official spec (K tokens); openRouterSlug for ELO / secondary lookup only
  "o3":                        { region: "global", type: "closed", modality: "multimodal", context: 200,  arenaName: "o3",                                 openRouterSlug: "openai/o3" },
  "o1":                        { region: "global", type: "closed", modality: "language",   context: 200,  arenaName: "o1",                                 openRouterSlug: "openai/o1" },
  "o1-mini":                   { region: "global", type: "closed", modality: "language",   context: 128,  arenaName: "o1-mini" },
  "GPT-4o":                    { region: "global", type: "closed", modality: "multimodal", context: 128,  arenaName: "gpt-4o",                             openRouterSlug: "openai/gpt-4o" },
  "GPT-4o-mini":               { region: "global", type: "closed", modality: "multimodal", context: 128,  arenaName: "gpt-4o-mini",                        openRouterSlug: "openai/gpt-4o-mini" },
  "Claude 3.7 Sonnet":         { region: "global", type: "closed", modality: "multimodal", context: 200,  arenaName: "claude-3-7-sonnet-20250219",          openRouterSlug: "anthropic/claude-3.7-sonnet" },
  "Claude 3.5 Sonnet":         { region: "global", type: "closed", modality: "multimodal", context: 200,  arenaName: "claude-3-5-sonnet-20241022",          openRouterSlug: "anthropic/claude-3.5-sonnet" },
  "Gemini 2.5 Pro":            { region: "global", type: "closed", modality: "multimodal", context: 1000, arenaName: "gemini-2.5-pro-exp-03-25",            openRouterSlug: "google/gemini-2.5-pro-preview" },
  "Gemini 2.0 Flash":          { region: "global", type: "closed", modality: "multimodal", context: 1000, arenaName: "gemini-2.0-flash-001",                openRouterSlug: "google/gemini-2.0-flash-001" },
  "Llama-3.1-405B-Instruct":   { region: "global", type: "open",   modality: "language",   context: 128,  arenaName: "meta-llama/llama-3.1-405b-instruct",  openRouterSlug: "meta-llama/llama-3.1-405b",            hfRepo: "meta-llama/Llama-3.1-405B-Instruct" },
  "Llama-3.3-70B-Instruct":    { region: "global", type: "open",   modality: "language",   context: 128,  arenaName: "llama-3.3-70b-instruct",              openRouterSlug: "meta-llama/llama-3.3-70b-instruct",    hfRepo: "meta-llama/Llama-3.3-70B-Instruct" },
  "Mistral Large 2":           { region: "global", type: "closed", modality: "language",   context: 128,                                                    openRouterSlug: "mistralai/mistral-large-2407" },
  // ── China ──────────────────────────────────────────────────────────────────
  "GLM-5":                     { region: "china", type: "closed", modality: "multimodal", context: 128,  openRouterSlug: "z-ai/glm-5" },
  "GLM-4-Plus":                { region: "china", type: "closed", modality: "language",   context: 128 },
  "GLM-4-Air":                 { region: "china", type: "closed", modality: "language",   context: 128 },
  "DeepSeek-R1":               { region: "china", type: "open",   modality: "language",   context: 128,  arenaName: "deepseek-r1",          openRouterSlug: "deepseek/deepseek-r1",              hfRepo: "deepseek-ai/DeepSeek-R1" },
  "DeepSeek-V3":               { region: "china", type: "open",   modality: "language",   context: 128,  arenaName: "deepseek-v3",          openRouterSlug: "deepseek/deepseek-chat-v3-0324",    hfRepo: "deepseek-ai/DeepSeek-V3-0324" },
  "DeepSeek-R1-0528":          { region: "china", type: "open",   modality: "language",   context: 164,                                     openRouterSlug: "deepseek/deepseek-r1-0528",         hfRepo: "deepseek-ai/DeepSeek-R1-0528" },
  "Qwen3.5-397B-A17B":         { region: "china", type: "open",   modality: "language",   context: 256,                                     openRouterSlug: "qwen/qwen3.5-397b-a17b",            hfRepo: "Qwen/Qwen3.5-397B-A17B" },
  "Qwen3-235B-A22B":           { region: "china", type: "open",   modality: "language",   context: 128,  arenaName: "qwen3-235b-a22b",      openRouterSlug: "qwen/qwen3-235b-a22b",              hfRepo: "Qwen/Qwen3-235B-A22B" },
  "Qwen3-32B":                 { region: "china", type: "open",   modality: "language",   context: 128,                                     openRouterSlug: "qwen/qwen3-32b",                    hfRepo: "Qwen/Qwen3-32B" },
  "Qwen2.5-72B-Instruct":      { region: "china", type: "open",   modality: "language",   context: 128,  arenaName: "qwen2.5-72b-instruct", openRouterSlug: "qwen/qwen-2.5-72b-instruct",        hfRepo: "Qwen/Qwen2.5-72B-Instruct" },
  "Qwen2.5-VL-72B-Instruct":   { region: "china", type: "open",   modality: "multimodal", context: 128,                                     openRouterSlug: "qwen/qwen2.5-vl-72b-instruct",      hfRepo: "Qwen/Qwen2.5-VL-72B-Instruct" },
  "Kimi-K2":                   { region: "china", type: "open",   modality: "language",   context: 128,  arenaName: "kimi-k2",              openRouterSlug: "moonshotai/kimi-k2",                hfRepo: "moonshotai/Kimi-K2-Instruct" },
  "MiniMax-Text-01":           { region: "china", type: "closed", modality: "language",   context: 1000 },
  "Hunyuan-Large":             { region: "china", type: "open",   modality: "language",   context: 256,                                                                                                     hfRepo: "Tencent-Hunyuan/Hunyuan-Large" },
  "Hunyuan-Turbo":             { region: "china", type: "closed", modality: "language",   context: 256 },
  "InternLM3-8B-Instruct":    { region: "china", type: "open",   modality: "language",   context: 32,                                                                                                      hfRepo: "internlm/internlm3-8b-instruct" },
  "InternLM2.5-20B-Chat":     { region: "china", type: "open",   modality: "language",   context: 32,                                                                                                      hfRepo: "internlm/internlm2_5-20b-chat" },
  "InternVL2-76B":             { region: "china", type: "open",   modality: "multimodal", context: 32,                                                                                                      hfRepo: "OpenGVLab/InternVL2-76B" },
  "Yi-Lightning":              { region: "china", type: "closed", modality: "language",   context: 16,   arenaName: "yi-lightning" },
  "Step-2":                    { region: "china", type: "closed", modality: "language",   context: 256 },
  "Baichuan4":                 { region: "china", type: "closed", modality: "language",   context: 128 },
  "MiniCPM-SALA":              { region: "china", type: "open",   modality: "language",   context: 32 },
};

// Benchmark column definitions
export const BENCH_COLS = [
  { key: "average",       label: "综合",  title: "OpenCompass 综合得分" },
  { key: "mmluPro",       label: "知识",  title: "MMLU-Pro" },
  { key: "aime2025",      label: "数学",  title: "AIME 2025" },
  { key: "liveCodeBench", label: "代码",  title: "LiveCodeBench v6" },
  { key: "gpqaDiamond",   label: "推理",  title: "GPQA Diamond" },
  { key: "ifeval",        label: "指令",  title: "IFEval" },
] as const;

export type BenchKey = typeof BENCH_COLS[number]["key"];
