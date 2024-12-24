"use client";
import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@/components/user/UserProvider";
import { usePopup } from "@/components/admin/connectors/Popup";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { SimplifiedChatInputBar } from "../chat/input/SimplifiedChatInputBar";
import { Menu } from "lucide-react";
import { Shortcut } from "./interfaces";
import { MaxShortcutsReachedModal, NewShortCutModal } from "./ShortCuts";
import { Modal } from "@/components/Modal";
import Title from "@/components/ui/title";
import { useNightTime } from "./dateUtils";
import { useFilters } from "@/lib/hooks";
import { uploadFilesForChat } from "../chat/lib";
import { ChatFileType, FileDescriptor } from "../chat/interfaces";
import { useChatContext } from "@/components/context/ChatContext";
import Dropzone from "react-dropzone";
import { useSendMessageToParent } from "./utils";
import {
  useNRFPreferences,
  NRFPreferencesProvider,
} from "../context/nrf/NRFPreferencesContext";
import { SettingsPanel } from "../components/nrf/SettingsPanel";
import { Switch } from "@/components/ui/switch";
import { ShortcutsDisplay } from "../components/nrf/ShortcutsDisplay";

// Chrome Extension Utility
function sendSetDefaultNewTabMessage(value: boolean) {
  if (typeof window !== "undefined" && window.parent) {
    window.parent.postMessage({ type: "SET_DEFAULT_NEW_TAB", value }, "*");
  }
}

export default function NRFPageNewDesign() {
  const {
    theme,
    defaultLightBackgroundUrl,
    defaultDarkBackgroundUrl,
    shortcuts: shortCuts,
    setShortcuts: setShortCuts,
    useOnyxAsNewTab,
    setUseOnyxAsNewTab,
    showShortcuts,
  } = useNRFPreferences();

  const { popup, setPopup } = usePopup();

  const [message, setMessage] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  // Show modal to confirm turning off Onyx as new tab
  const [showTurnOffModal, setShowTurnOffModal] = useState<boolean>(false);

  // Settings sidebar open/close go
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);

  const [editingShortcut, setEditingShortcut] = useState<Shortcut | null>(null);

  // Saved background in localStorage
  const [backgroundUrl, setBackgroundUrl] = useState<string>(
    theme === "light" ? defaultLightBackgroundUrl : defaultDarkBackgroundUrl
  );

  useEffect(() => {
    setBackgroundUrl(
      theme === "light" ? defaultLightBackgroundUrl : defaultDarkBackgroundUrl
    );
  }, [theme, defaultLightBackgroundUrl, defaultDarkBackgroundUrl]);

  const filterManager = useFilters();

  const { isNight } = useNightTime();
  const { user } = useUser();
  const { ccPairs, documentSets, tags, llmProviders } = useChatContext();

  const inputRef = useRef<HTMLInputElement>(null);

  useSendMessageToParent();
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const toggleSettings = () => {
    setSettingsOpen((prev) => !prev);
  };

  // If user toggles the "Use Onyx" switch to off, prompt a modal
  const handleUseOnyxToggle = (checked: boolean) => {
    if (!checked) {
      setShowTurnOffModal(true);
    } else {
      setUseOnyxAsNewTab(true);
      sendSetDefaultNewTabMessage(true);
    }
  };

  const availableSources = ccPairs.map((ccPair) => ccPair.source);

  const [currentMessageFiles, setCurrentMessageFiles] = useState<
    FileDescriptor[]
  >([]);

  const handleImageUpload = async (acceptedFiles: File[]) => {
    console.log("acceptedFiles", acceptedFiles);

    const tempFileDescriptors = acceptedFiles.map((file) => ({
      id: uuidv4(),
      type: file.type.startsWith("image/")
        ? ChatFileType.IMAGE
        : ChatFileType.DOCUMENT,
      isUploading: true,
    }));

    // only show loading spinner for reasonably large files
    const totalSize = acceptedFiles.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > 50 * 1024) {
      setCurrentMessageFiles((prev) => [...prev, ...tempFileDescriptors]);
    }

    const removeTempFiles = (prev: FileDescriptor[]) => {
      return prev.filter(
        (file) => !tempFileDescriptors.some((newFile) => newFile.id === file.id)
      );
    };

    await uploadFilesForChat(acceptedFiles).then(([files, error]) => {
      if (error) {
        setCurrentMessageFiles((prev) => removeTempFiles(prev));
        setPopup({
          type: "error",
          message: error,
        });
      } else {
        setCurrentMessageFiles((prev) => [...removeTempFiles(prev), ...files]);
      }
    });
  };

  // Confirm turning off Onyx
  const confirmTurnOff = () => {
    setUseOnyxAsNewTab(false);
    setShowTurnOffModal(false);
    sendSetDefaultNewTabMessage(false);
  };

  const [showShortCutModal, setShowShortCutModal] = useState(false);

  const [showMaxShortcutsModal, setShowMaxShortcutsModal] = useState(false);

  const onSubmit = async ({
    messageOverride,
  }: {
    messageOverride?: string;
  } = {}) => {
    const userMessage = messageOverride || message;

    setMessage("");
    let filterString = filterManager?.getFilterString();

    if (currentMessageFiles.length > 0) {
      filterString +=
        "&files=" + encodeURIComponent(JSON.stringify(currentMessageFiles));
    }

    if (window.top) {
      window.top.location.href =
        "/chat?send-on-load=true&user-prompt=" +
        encodeURIComponent(userMessage) +
        filterString;
    } else {
      window.location.href =
        "/chat?send-on-load=true&user-prompt=" +
        encodeURIComponent(userMessage) +
        filterString;
    }

    setPopup({
      message: `Message submitted: ${userMessage}`,
      type: "success",
    });
  };

  return (
    <div
      className="relative w-full h-full flex flex-col"
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${backgroundUrl})`,
        backgroundPosition: "center center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        overflow: "hidden",
        transition: "background-image 0.3s ease",
      }}
    >
      {/* Initial Blocking Modals */}
      {!user ? (
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
      ) : llmProviders.length === 0 ? (
        <Modal className="max-w-md mx-auto">
          <>
            <Title className="text-xl font-bold mb-2 text-center text-neutral-800 dark:text-white">
              No LLM Providers Found
            </Title>
            <p className="text-neutral-600 dark:text-neutral-300 text-sm text-center">
              We couldn&apos;t locate any LLM providers. Please add or configure
              at least one provider in the admin page to enable chat features.
            </p>
            <Button
              onClick={() => {
                if (window.top) {
                  window.top.location.href = "/admin?next=/chat?newTab=true";
                } else {
                  window.location.href = "/admin?next=/chat?newTab=true";
                }
              }}
              className="mt-4 w-full bg-accent hover:bg-accent/90 text-white font-semibold rounded-lg text-center transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl focus:outline-none"
            >
              Go to Admin Panel
            </Button>
          </>
        </Modal>
      ) : null}
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
      <Dropzone onDrop={handleImageUpload} noClick>
        {({ getRootProps }) => (
          <div
            {...getRootProps()}
            className="absolute top-20 left-0 w-full h-full flex flex-col"
          >
            <div className="pointer-events-auto absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-[90%] lg:max-w-3xl">
              <h1
                className={`pl-2 text-xl text-left w-full mb-4 ${
                  theme === "light" ? "text-neutral-800" : "text-white"
                }`}
              >
                {isNight
                  ? "End your day with Onyx"
                  : "Start your day with Onyx"}
              </h1>

              <SimplifiedChatInputBar
                onSubmit={onSubmit}
                handleFileUpload={handleImageUpload}
                message={message}
                setMessage={setMessage}
                files={currentMessageFiles}
                setFiles={setCurrentMessageFiles}
                filterManager={filterManager}
                textAreaRef={textAreaRef}
                existingSources={availableSources}
                availableDocumentSets={documentSets}
                availableTags={tags}
              />

              <ShortcutsDisplay
                shortCuts={shortCuts}
                theme={theme}
                showShortcuts={showShortcuts}
                setEditingShortcut={setEditingShortcut}
                setShowShortCutModal={setShowShortCutModal}
              />
            </div>
          </div>
        )}
      </Dropzone>
      {showShortCutModal && (
        <NewShortCutModal
          theme={theme}
          onDelete={(shortcut: Shortcut) => {
            setShortCuts(
              shortCuts.filter((s: Shortcut) => s.name !== shortcut.name)
            );
            setShowShortCutModal(false);
          }}
          isOpen={showShortCutModal}
          onClose={() => setShowShortCutModal(false)}
          onAdd={(shortCut: Shortcut) => {
            if (shortCuts.length >= 8) {
              setShowMaxShortcutsModal(true);
            } else {
              if (editingShortcut) {
                setShortCuts(
                  shortCuts
                    .filter((s) => s.name !== editingShortcut.name)
                    .concat(shortCut)
                );
              } else {
                setShortCuts([...shortCuts, shortCut]);
              }
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
          onCheckedChange={handleUseOnyxToggle}
        />
      </div>
      <SettingsPanel
        settingsOpen={settingsOpen}
        toggleSettings={toggleSettings}
        handleUseOnyxToggle={handleUseOnyxToggle}
      />
      {/* Modal for confirming turn off */}
      <Dialog open={showTurnOffModal} onOpenChange={setShowTurnOffModal}>
        <DialogContent className="w-fit max-w-[95%]">
          <DialogHeader>
            <DialogTitle>Turn off Onyx new tab page?</DialogTitle>
            <DialogDescription>
              You&apos;ll see your browser&apos;s default new tab page instead.
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
      {popup}
    </div>
  );
}

export function NRFPageWithProvider() {
  return (
    <NRFPreferencesProvider>
      <NRFPageNewDesign />
    </NRFPreferencesProvider>
  );
}
