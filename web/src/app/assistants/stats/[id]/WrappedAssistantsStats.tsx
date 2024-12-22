"use client";
import SidebarWrapper from "../../SidebarWrapper";
import { AssistantStats } from "./AssistantStats";

export default function WrappedAssistantsStats({
  initiallyToggled,
}: {
  initiallyToggled: boolean;
}) {
  return (
    <SidebarWrapper page="chat" initiallyToggled={initiallyToggled}>
      <AssistantStats />
    </SidebarWrapper>
  );
}
