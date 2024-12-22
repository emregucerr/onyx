"use client";
import React, { useState, useEffect, useRef } from "react";
import FixedLogo from "../chat/shared_chat_search/FixedLogo";
import { ChatInputBar } from "../chat/input/ChatInputBar";
import { Switch } from "@/components/ui/switch";
import { useUser } from "@/components/user/UserProvider";
import { ApiKeyModal } from "@/components/llm/ApiKeyModal";
import { usePopup } from "@/components/admin/connectors/Popup";
import { useAssistants } from "@/components/context/AssistantsContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SimplifiedChatInputBar } from "../chat/input/SimplifiedChatInputBar";
import { Hamburger } from "@phosphor-icons/react";
import { Menu } from "lucide-react";
import Link from "next/link";
import {
  darkImages,
  lightImages,
  Shortcut,
  StoredBackgroundColors,
} from "./interfaces";
import {
  DEFAULT_DARK_BACKGROUND_IMAGE,
  DEFAULT_LIGHT_BACKGROUND_IMAGE,
  NEW_TAB_PAGE_VIEW_KEY,
  SHORTCUTS_KEY,
  USE_ONYX_AS_NEW_TAB_KEY,
} from "./interfaces";
import {
  AddShortCut,
  MaxShortcutsReachedModal,
  NewShortCutModal,
  ShortCut,
} from "./ShortCuts";
import { Modal } from "@/components/Modal";
import Title from "@/components/ui/title";
import { userAgent } from "next/server";
import { useNightTime } from "./dateUtils";

const SidebarSwitch = ({
  checked,
  onCheckedChange,
  label,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
}) => (
  <div className="flex justify-between items-center py-2">
    <span className="text-sm text-gray-300">{label}</span>
    <Switch
      checked={checked}
      onCheckedChange={onCheckedChange}
      className="data-[state=checked]:bg-white data-[state=unchecked]:bg-gray-600"
      circleClassName="data-[state=checked]:bg-neutral-200"
    />
  </div>
);

const RadioOption = ({
  value,
  label,
  description,
  groupValue,
  onChange,
}: {
  value: string;
  label: string;
  description: string;
  groupValue: string;
  onChange: (value: string) => void;
}) => (
  <div className="flex items-start space-x-2 mb-2">
    <RadioGroupItem
      value={value}
      id={value}
      className="mt-1 border border-gray-600 data-[state=checked]:border-white data-[state=checked]:bg-white"
    />
    <Label htmlFor={value} className="flex flex-col">
      <span className="text-sm text-gray-300">{label}</span>
      {description && (
        <span className="text-xs text-gray-500">{description}</span>
      )}
    </Label>
  </div>
);

export default function NRFPageNewDesign() {
  const { popup, setPopup } = usePopup();
  const { assistants } = useAssistants();

  const [message, setMessage] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  // Whether or not Onyx is used as the default new tab
  const [useOnyxAsNewTab, setUseOnyxAsNewTab] = useState<boolean>(() => {
    return localStorage.getItem("useOnyxAsNewTab") === "true";
  });

  // Show modal to confirm turning off Onyx as new tab
  const [showTurnOffModal, setShowTurnOffModal] = useState<boolean>(false);

  // Settings sidebar open/close go
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);

  const [showBookmarksBar, setShowBookmarksBar] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [newTabPageView, setNewTabPageView] = useState(
    localStorage.getItem("newTabPageView") || "simple"
  );
  const [shortCuts, setShortCuts] = useState<Shortcut[]>(
    JSON.parse(localStorage.getItem("shortCuts") || "[]")
  );

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("onyxTheme") || "dark";
  });

  const toggleTheme = (theme: string) => {
    setTheme(theme);
    localStorage.setItem("onyxTheme", theme);
    if (theme === "light") {
      setBackgroundUrl(lightImages[0]);
    } else {
      setBackgroundUrl(darkImages[0]);
    }
  };

  const { isNight } = useNightTime();
  const { user } = useUser();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the input bar on component mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  const [editingShortcut, setEditingShortcut] = useState<Shortcut | null>(null);
  const [inputValue, setInputValue] = useState("");

  // Saved background in localStorage
  const [backgroundUrl, setBackgroundUrl] = useState<string>(() => {
    return (
      localStorage.getItem(
        theme === "light"
          ? DEFAULT_LIGHT_BACKGROUND_IMAGE
          : DEFAULT_DARK_BACKGROUND_IMAGE
      ) ||
      "https://images.unsplash.com/photo-1548613112-7455315eef5f?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    );
  });

  const updateBackgroundUrl = (url: string) => {
    setBackgroundUrl(url);
    localStorage.setItem("backgroundUrl", url);
  };

  const updateShortcuts = (shortcuts: Shortcut[]) => {
    setShortCuts(shortcuts);
    localStorage.setItem(SHORTCUTS_KEY, JSON.stringify(shortcuts));
  };

  useEffect(() => {
    localStorage.setItem(NEW_TAB_PAGE_VIEW_KEY, newTabPageView);
  }, [newTabPageView]);

  useEffect(() => {
    localStorage.setItem(USE_ONYX_AS_NEW_TAB_KEY, String(useOnyxAsNewTab));
  }, [useOnyxAsNewTab]);

  const onSubmit = async ({
    messageOverride,
  }: {
    messageOverride?: string;
  } = {}) => {
    const userMessage = messageOverride || message;
    console.log("User message:", userMessage);
    setMessage("");
    if (window.top) {
      window.top.location.href =
        "/chat?send-on-load=true&user-prompt=" + userMessage;
    } else {
      window.location.href =
        "/chat?send-on-load=true&user-prompt=" + userMessage;
    }

    setPopup({
      message: `Message submitted: ${userMessage}`,
      type: "success",
    });
  };

  // Toggle sidebar
  const toggleSettings = () => {
    setSettingsOpen((prev) => !prev);
  };

  // If user toggles the "Use Onyx" switch to off, prompt a modal
  const handleUseOnyxToggle = (checked: boolean) => {
    if (!checked) {
      setShowTurnOffModal(true);
    } else {
      setUseOnyxAsNewTab(true);
    }
  };

  // Confirm turning off Onyx
  const confirmTurnOff = () => {
    setUseOnyxAsNewTab(false);
    setShowTurnOffModal(false);
  };

  const [showShortCutModal, setShowShortCutModal] = useState(false);

  const [showMaxShortcutsModal, setShowMaxShortcutsModal] = useState(false);
  return (
    <div
      className="relative w-full h-full flex flex-col"
      style={{
        minHeight: "100vh",
        background: `url(${backgroundUrl}) no-repeat center center / cover`,
        overflow: "hidden",
      }}
    >
      {!user && (
        <Modal className="max-w-md mx-auto">
          <>
            <Title className="text-xl font-bold mb-2 text-left text-center text-neutral-800 dark:text-white">
              Welcome to Onyx
            </Title>
            <p className="text-neutral-600 dark:text-neutral-300  text-sm text-left">
              Log in to access all features and personalize your experience.
            </p>
            <Button
              onClick={() => {
                if (window.top) {
                  window.top.location.href =
                    "/auth/login?next=/chat?newTab=true";
                } else {
                  window.location.href = "/auth/login?next=/chat?newTab=true";
                }
              }}
              className="mt-2 block w-full bg-accent hover:bg-accent/90 text-white font-semibold rounded-lg text-center transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl focus:outline-none"
            >
              Log In
            </Button>
          </>
        </Modal>
      )}
      {/* Top bar with settings icon */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          padding: "16px",
          zIndex: 10,
        }}
      >
        <button
          aria-label="Open settings"
          onClick={toggleSettings}
          style={{
            background: "rgba(255, 255, 255, 0.7)",
            border: "none",
            borderRadius: "50%",
            padding: "10px",
            cursor: "pointer",
          }}
        >
          <Menu size={12} className="text-neutral-900" />
        </button>
      </div>

      {showMaxShortcutsModal && (
        <MaxShortcutsReachedModal
          onClose={() => setShowMaxShortcutsModal(false)}
        />
      )}
      {/* Simplified center section */}
      <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-[90%]  lg:max-w-3xl">
        <h1
          className={`pl-2 text-xl text-left w-full mb-4 ${
            theme === "light" ? "text-neutral-800" : "text-white"
          }`}
        >
          {isNight ? "End your day with Onyx" : "Start your day with Onyx"}
        </h1>

        <SimplifiedChatInputBar
          removeFilters={() => {}}
          removeDocs={() => {}}
          openModelSettings={() => {}}
          showConfigureAPIKey={() => {}}
          chatState="input"
          stopGenerating={() => {}}
          onSubmit={onSubmit}
          selectedAssistant={assistants[0]}
          setSelectedAssistant={() => {}}
          setAlternativeAssistant={() => {}}
          alternativeAssistant={null}
          selectedDocuments={[]}
          showDocs={() => {}}
          handleFileUpload={() => {}}
          message={message}
          setMessage={setMessage}
          llmOverrideManager={null as any}
          files={[]}
          setFiles={() => {}}
          textAreaRef={textAreaRef}
          chatSessionId="onyx-new-design"
        />

        {showShortcuts && (
          <div className=" mx-auto flex -mx-20 flex gap-x-6 mt-20 gap-y-4">
            {shortCuts.map((shortCut, index) => (
              <ShortCut
                key={index}
                theme={theme}
                onEdit={() => {
                  setEditingShortcut(shortCut);
                  setShowShortCutModal(true);
                }}
                shortCut={shortCut}
              />
            ))}
            <AddShortCut openShortCutModal={() => setShowShortCutModal(true)} />
          </div>
        )}
      </div>

      {showShortCutModal && (
        <NewShortCutModal
          theme={theme}
          onDelete={(shortcut) => {
            updateShortcuts(shortCuts.filter((s) => s.name !== shortcut.name));
          }}
          isOpen={showShortCutModal}
          onClose={() => setShowShortCutModal(false)}
          onAdd={(shortCut) => {
            if (shortCuts.length >= 8) {
              setShowMaxShortcutsModal(true);
            } else {
              updateShortcuts([...shortCuts, shortCut]);
              setShowShortCutModal(false);
            }
          }}
          editingShortcut={editingShortcut}
        />
      )}

      {/* Bottom-right container for the "Use Onyx as new tab" toggle */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center bg-white/80 backdrop-blur-sm p-2 rounded-lg">
        <label
          htmlFor="useOnyx"
          className="cursor-pointer mr-2 text-black text-xs font-medium"
        >
          Use Onyx as default new tab
        </label>
        <Switch
          id="useOnyx"
          checked={useOnyxAsNewTab}
          onCheckedChange={(val) => handleUseOnyxToggle(val)}
        />
      </div>

      {/* Improved slide-in settings sidebar */}
      <div
        className="fixed top-0 right-0 w-[360px] h-full bg-[#202124] text-gray-300 overflow-y-auto z-20 transition-transform duration-300 ease-in-out transform"
        style={{
          transform: settingsOpen ? "translateX(0)" : "translateX(100%)",
          boxShadow: "-2px 0 10px rgba(0,0,0,0.3)",
        }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">
              Home page settings
            </h2>
            <button
              aria-label="Close"
              onClick={toggleSettings}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <h3 className="text-sm font-semibold mb-2">General</h3>
          <SidebarSwitch
            checked={useOnyxAsNewTab}
            onCheckedChange={handleUseOnyxToggle}
            label="Use Onyx as new tab page"
          />
          <SidebarSwitch
            checked={showBookmarksBar}
            onCheckedChange={setShowBookmarksBar}
            label="Show bookmarks bar"
          />
          <SidebarSwitch
            checked={showShortcuts}
            onCheckedChange={setShowShortcuts}
            label="Show shortcuts"
          />

          <h3 className="text-sm font-semibold mt-6 mb-2">New Tab Page View</h3>
          <RadioGroup
            value={newTabPageView}
            onValueChange={setNewTabPageView}
            className="space-y-2"
          >
            <RadioOption
              value="simple"
              label="Simple"
              description="Minimal and focused."
              groupValue={newTabPageView}
              onChange={setNewTabPageView}
            />
            <RadioOption
              value="informational"
              label="Informational"
              description="Show widgets like calendar, mentions, and more."
              groupValue={newTabPageView}
              onChange={setNewTabPageView}
            />
          </RadioGroup>
          <h3 className="text-sm font-semibold mt-6 mb-2">Theme</h3>
          <RadioGroup
            value={theme}
            onValueChange={toggleTheme}
            className="space-y-2"
          >
            <RadioOption
              value="light"
              label="Light theme"
              description="Light theme"
              groupValue={theme}
              onChange={toggleTheme}
            />
            <RadioOption
              value="dark"
              label="Dark theme"
              description="Dark theme"
              groupValue={theme}
              onChange={toggleTheme}
            />
            <RadioOption
              value="sync"
              label="Sync with device"
              description="Sync with device"
              groupValue={theme}
              onChange={toggleTheme}
            />
          </RadioGroup>

          <h3 className="text-sm font-semibold mt-6 mb-2">Background</h3>
          <div className="grid grid-cols-4 gap-2">
            {(theme === "dark" ? darkImages : lightImages).map((bg, index) => (
              <div
                key={bg}
                onClick={() => setBackgroundUrl(bg)}
                className={`relative ${
                  index === 0 ? "col-span-2 row-span-2" : ""
                } cursor-pointer rounded-sm overflow-hidden`}
                style={{
                  paddingBottom: index === 0 ? "100%" : "50%",
                }}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${bg})` }}
                />
                {backgroundUrl === bg && (
                  <div className="absolute inset-0 border-2 border-blue-400 rounded" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal for confirming turn off */}
      <Dialog open={showTurnOffModal} onOpenChange={setShowTurnOffModal}>
        <DialogContent className="w-fit max-w-[95%]">
          <DialogHeader>
            <DialogTitle>Turn off Onyx new tab page?</DialogTitle>
            <DialogDescription>
              You’ll see your browser’s default new tab page instead.
              <br />
              You can turn it back on anytime in your Onyx settings.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-center">
            <Button
              variant="outline"
              onClick={() => setShowTurnOffModal(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmTurnOff}>
              Turn off
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* If you have or need an API Key modal */}
      {false && (
        <ApiKeyModal
          hide={() => {
            /* handle close */
          }}
          setPopup={setPopup}
        />
      )}

      {popup}
    </div>
  );
}
