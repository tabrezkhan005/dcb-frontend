import type { ReactElement, ReactNode } from "react";
import { View } from "react-native";
import type { UseQueryResult } from "@tanstack/react-query";
import { ErrorScreen } from "./ErrorScreen";
import { SkeletonList } from "./SkeletonLoader";
import { EmptyState } from "./EmptyState";
import { Spacing } from "../../constants/spacing";

interface QueryListShellProps<T> {
  query: Pick<
    UseQueryResult<T>,
    "isLoading" | "isError" | "error" | "data" | "refetch" | "isFetching"
  >;
  header?: ReactNode;
  emptyTitle: string;
  emptySubtitle: string;
  skeletonRows?: number;
  children: (data: T) => ReactNode;
  /** When true, show list even if refetch failed (stale data). */
  allowStaleOnError?: boolean;
}

export function QueryListShell<T>({
  query,
  header,
  emptyTitle,
  emptySubtitle,
  skeletonRows = 2,
  children,
  allowStaleOnError = true,
}: QueryListShellProps<T>): ReactElement {
  const hasData = query.data !== undefined;
  const fatal = query.isError && !(allowStaleOnError && hasData);

  if (fatal) {
    return (
      <View style={{ flex: 1 }}>
        {header}
        <ErrorScreen
          message={query.error instanceof Error ? query.error.message : "Error"}
          error={query.error}
          onRetry={() => void query.refetch()}
        />
      </View>
    );
  }

  if (query.isLoading && !hasData) {
    return (
      <View style={{ flex: 1 }}>
        {header}
        <View style={{ padding: Spacing.lg }}>
          <SkeletonList rows={skeletonRows} />
        </View>
      </View>
    );
  }

  const data = query.data as T;
  const isEmpty = Array.isArray(data) && data.length === 0;

  if (isEmpty) {
    return (
      <View style={{ flex: 1 }}>
        {header}
        <EmptyState title={emptyTitle} subtitle={emptySubtitle} />
      </View>
    );
  }

  return <>{children(data)}</>;
}
