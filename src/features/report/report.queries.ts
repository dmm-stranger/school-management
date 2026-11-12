import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { reportApi } from "./report.api";
import type { ExportFormat } from "./report.types";

export const useReportTemplates = () =>
  useQuery({ queryKey: queryKeys.reports.templates(), queryFn: reportApi.listTemplates, staleTime: 5 * 60_000 });

export const useReportHistory = () => useQuery({ queryKey: queryKeys.reports.history(), queryFn: reportApi.history });

export const useGenerateReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ templateKey, filters }: { templateKey: string; filters: Record<string, string> }) => reportApi.generate(templateKey, filters),
    // A new snapshot now exists, so the "recent reports" list is stale.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.reports.history() }),
  });
};

export const useReportPage = (id: string, page: number, limit: number) =>
  useQuery({
    queryKey: queryKeys.reports.page(id, page, limit),
    queryFn: () => reportApi.getPage(id, page, limit),
    enabled: !!id,
    placeholderData: keepPreviousData,
    // An expired/forbidden report won't come back by asking again — don't retry those.
    retry: false,
  });

/** Fetches the whole report in one call — used by Print, which must include every row, not just the visible page. */
export const useFetchAllRows = () => useMutation({ mutationFn: (id: string) => reportApi.getPage(id, 1, 5000) });

export const useExportReport = () =>
  useMutation({
    mutationFn: async ({ id, format }: { id: string; format: ExportFormat }) => {
      const { blob, filename } = await reportApi.exportFile(id, format);
      // Hand the Blob to the browser as a normal file download.
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      return filename;
    },
  });
