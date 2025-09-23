import React from "react";
import styles from "./CompassChat.module.css";
import MenuIcon from "@mui/icons-material/Menu";
import DeleteIcon from "@mui/icons-material/Delete";

export default function LeftRail({
  savedChats = [],
  activeId,
  onSelect,
  onRename,
  onDelete,
  isRailVisible,
  onToggleVisibility,
}: {
  savedChats?: { id: string; name: string }[];
  activeId?: string;
  onSelect?: (id: string) => void;
  onRename?: (id: string, newName: string) => void;
  onDelete?: (id: string) => void;
  isRailVisible?: boolean;
  onToggleVisibility?: () => void;
}) {
  const [renamingId, setRenamingId] = React.useState<string | null>(null);
  const [tempName, setTempName] = React.useState("");

  const handleStartRename = (chat: { id: string; name: string }) => {
    setRenamingId(chat.id);
    setTempName(chat.name);
  };

  const handleCommitRename = () => {
    if (renamingId && tempName.trim() && onRename) {
      onRename(renamingId, tempName.trim());
    }
    setRenamingId(null);
    setTempName("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCommitRename();
    }
    if (e.key === "Escape") {
      setRenamingId(null);
      setTempName("");
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation(); // Prevent the parent onClick from firing
    if (onDelete) {
      onDelete(chatId);
    }
  };

  return (
    <aside className={styles.rail}>
      <div className={styles.hamburger} aria-label="menu" onClick={onToggleVisibility} style={{ cursor: "pointer" }}>
        <MenuIcon />
      </div>
      {isRailVisible && (
        <>
          <h4>Saved Chats</h4>
          <div className={styles.list}>
            {savedChats.map((c) => (
              <div
                key={c.id}
                className={styles.chip}
                style={{ opacity: c.id === activeId ? 1 : 0.9, cursor: "pointer" }}
                onClick={() => (renamingId !== c.id && onSelect ? onSelect(c.id) : null)}
              >
                {renamingId === c.id ? (
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onBlur={handleCommitRename}
                    onKeyDown={handleKeyDown}
                    className={styles.chipInput}
                    autoFocus
                  />
                ) : (
                  <>
                    <span 
                      style={{ overflow: "hidden", textOverflow: "ellipsis" }}
                      onDoubleClick={() => handleStartRename(c)} // Double-click to rename
                    >
                      {c.name}
                    </span>
                    <span className={styles.chipIcon} onClick={(e) => handleDeleteClick(e, c.id)}>
                      <DeleteIcon fontSize="small" />
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </aside>
  );
}