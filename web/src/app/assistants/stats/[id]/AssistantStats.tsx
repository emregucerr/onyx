import { AssistantIcon } from "@/components/assistants/AssistantIcon";

import { useAssistants } from "@/components/context/AssistantsContext";
import { useEffect, useState } from "react";

type AssistantDailyUsageResponse = {
  date: string;
  total_messages: number;
  total_unique_users: number;
};

export function AssistantStats({ assistantId }: { assistantId: number }) {
  const [stats, setStats] = useState<AssistantDailyUsageResponse[] | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true);
        setHasError(false);
        const res = await fetch(
          `/api/analytics/assistant/${assistantId}/stats`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) {
          throw new Error("Failed to fetch assistant stats");
        }
        const data = await res.json();
        setStats(data);
      } catch {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, [assistantId]);

  if (isLoading) {
    return <div>Loading stats...</div>;
  }
  if (hasError) {
    return <div className="text-red-600">Error fetching assistant stats</div>;
  }
  if (!stats || !stats.length) {
    return <div>No usage data found for this assistant.</div>;
  }

  // Example: just listing them or using a chart
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Assistant Usage Stats</h2>
      <table className="min-w-full border">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Messages</th>
            <th className="px-4 py-2">Unique Users</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((day) => (
            <tr key={day.date} className="border-b">
              <td className="px-4 py-2">{day.date}</td>
              <td className="px-4 py-2">{day.total_messages}</td>
              <td className="px-4 py-2">{day.total_unique_users}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
