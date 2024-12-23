import { ThreeDotsLoader } from "@/components/Loading";
import { getDatesList } from "@/app/ee/admin/performance/lib";
import Text from "@/components/ui/text";
import Title from "@/components/ui/title";
import CardSection from "@/components/admin/CardSection";
import { AreaChartDisplay } from "@/components/ui/areaChart";
import { useEffect, useState, useMemo } from "react";
import {
  DateRangeSelector,
  DateRange,
} from "@/app/ee/admin/performance/DateRangeSelector";

type AssistantDailyUsageResponse = {
  date: string;
  total_messages: number;
  total_unique_users: number;
  unique_users: string[];
};

export function AssistantStats({ assistantId }: { assistantId: number }) {
  const [stats, setStats] = useState<AssistantDailyUsageResponse[] | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch(
          `/api/analytics/assistant/${assistantId}/stats?start=${
            dateRange?.from?.toISOString() || ""
          }&end=${dateRange?.to?.toISOString() || ""}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) {
          if (res.status === 403) {
            throw new Error("You don't have permission to view these stats.");
          }
          throw new Error("Failed to fetch assistant stats");
        }
        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, [assistantId, dateRange]);

  const chartData = useMemo(() => {
    if (!stats?.length || !dateRange) {
      return null;
    }

    const initialDate =
      dateRange.from ||
      new Date(
        Math.min(...stats.map((entry) => new Date(entry.date).getTime()))
      );
    const endDate = dateRange.to || new Date();
    const dateRangeList = getDatesList(initialDate);

    const statsMap = new Map(stats.map((entry) => [entry.date, entry]));

    return dateRangeList
      .filter((date) => new Date(date) <= endDate)
      .map((dateStr) => {
        const data = statsMap.get(dateStr);
        return {
          Day: dateStr,
          Messages: data?.total_messages || 0,
          "Unique Users": data?.total_unique_users || 0,
        };
      });
  }, [stats, dateRange]);

  const totalMessages = useMemo(
    () => stats?.reduce((sum, day) => sum + day.total_messages, 0) || 0,
    [stats]
  );
  const totalUniqueUsers = useMemo(() => {
    if (!stats) return 0;
    const uniqueUsersSet = new Set<string>();
    stats.forEach((day) => {
      day.unique_users.forEach((userId) => uniqueUsersSet.add(userId));
    });
    return uniqueUsersSet.size;
  }, [stats]);

  let content;
  if (isLoading) {
    content = (
      <div className="h-80 flex flex-col">
        <ThreeDotsLoader />
      </div>
    );
  } else if (error) {
    content = (
      <div className="h-80 text-red-600 text-bold flex flex-col">
        <p className="m-auto">{error}</p>
      </div>
    );
  } else if (!stats?.length) {
    content = (
      <div className="h-80 text-gray-500 flex flex-col">
        <p className="m-auto">
          No data found for this assistant in the selected date range
        </p>
      </div>
    );
  } else if (chartData) {
    content = (
      <AreaChartDisplay
        className="mt-4"
        data={chartData}
        categories={["Messages", "Unique Users"]}
        index="Day"
        colors={["indigo", "fuchsia"]}
        yAxisWidth={60}
      />
    );
  }

  return (
    <CardSection className="mt-8">
      <Title>Assistant Analytics</Title>
      <div className="flex flex-col gap-4">
        <Text>Messages and unique users per day for this assistant</Text>
        <DateRangeSelector value={dateRange} onValueChange={setDateRange} />
        <div className="flex justify-between">
          <div>
            <Text className="font-semibold">Total Messages</Text>
            <Text>{totalMessages}</Text>
          </div>
          <div>
            <Text className="font-semibold">Total Unique Users</Text>
            <Text>{totalUniqueUsers}</Text>
          </div>
        </div>
      </div>
      {content}
    </CardSection>
  );
}
