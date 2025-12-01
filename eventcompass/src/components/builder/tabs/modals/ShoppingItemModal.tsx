import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import LinkIcon from "@mui/icons-material/Link";
import NotesIcon from "@mui/icons-material/Notes";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import StorefrontIcon from "@mui/icons-material/Storefront";
import InventoryIcon from "@mui/icons-material/Inventory";

import { ShoppingItem, Activity } from "@/types/eventPlan";

interface BudgetItem {
  id: number;
  category: string;
  description: string;
  allocated: number;
  spent: number;
}

interface ShoppingItemModalProps {
  item: ShoppingItem;
  budgetItems: BudgetItem[];
  activities: Activity[];
  isReadOnly: boolean;
  isCreating: boolean;
  onClose: () => void;
  fetchShoppingItems: () => void;
}

const ShoppingItemModal: React.FC<ShoppingItemModalProps> = ({
  item,
  budgetItems,
  activities,
  isReadOnly,
  isCreating,
  onClose,
  fetchShoppingItems,
}) => {
  const [localItem, setLocalItem] = useState<ShoppingItem>(item);
  const [isSaving, setIsSaving] = useState(false);

  // Update item field locally
  const handleFieldChange = (field: keyof ShoppingItem, value: any) => {
    setLocalItem((prev) => ({ ...prev, [field]: value }));
  };

  // Calculate total cost
  const totalCost = localItem.unitCost * localItem.quantity;

  // Save changes to the backend
  const handleSave = async () => {
    try {
      setIsSaving(true);

      const url = isCreating
        ? `/api/event-plans/${localItem.event_id}/shopping`
        : `/api/event-plans/shopping/${localItem.id}`;

      const method = isCreating ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(localItem),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isCreating ? "create" : "update"} shopping item`);
      }

      console.log(`Shopping item ${isCreating ? "created" : "updated"} successfully`);
      fetchShoppingItems(); // Refresh items after saving
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error saving shopping item:", error);
      alert(`Failed to ${isCreating ? "create" : "update"} shopping item. Please try again.`);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete the item
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this shopping item?")) return;

    try {
      const response = await fetch(`/api/event-plans/shopping/${localItem.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete shopping item");
      }

      console.log("Shopping item deleted successfully");
      fetchShoppingItems(); // Refresh items after deletion
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error deleting shopping item:", error);
      alert("Failed to delete shopping item. Please try again.");
    }
  };

  const selectedBudget = budgetItems.find((b) => b.id === localItem.budget_id);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          padding: "32px",
          maxWidth: "700px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
            marginBottom: "24px",
          }}
        >
          <h3
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#333",
              margin: 0,
              flex: 1,
              marginRight: "16px",
            }}
          >
            {isCreating ? "Add Shopping Item" : isReadOnly ? "Item Details" : "Edit Shopping Item"}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#666",
              padding: "4px",
            }}
          >
            <CloseIcon />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Budget Category */}
          <div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "#333",
                marginBottom: "8px",
              }}
            >
              <InventoryIcon style={{ width: "18px", height: "18px" }} />
              Budget Category
            </label>
            <select
              value={localItem.budget_id}
              onChange={(e) => handleFieldChange("budget_id", parseInt(e.target.value))}
              disabled={isReadOnly}
              style={{
                width: "100%",
                padding: "10px",
                fontSize: "0.9rem",
                border: "1px solid #ddd",
                borderRadius: "6px",
                backgroundColor: isReadOnly ? "#f5f5f5" : "#fff",
                cursor: isReadOnly ? "not-allowed" : "pointer",
              }}
            >
              {budgetItems.map((budget) => (
                <option key={budget.id} value={budget.id}>
                  {budget.category}
                </option>
              ))}
            </select>
            {selectedBudget && (
              <div
                style={{
                  marginTop: "8px",
                  padding: "12px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  color: "#666",
                }}
              >
                <div style={{ marginBottom: "4px" }}>
                  <strong>Budget:</strong> ${selectedBudget.allocated.toLocaleString()} | 
                  <strong> Spent:</strong> ${selectedBudget.spent.toLocaleString()}
                </div>
                <div>{selectedBudget.description}</div>
              </div>
            )}
          </div>

          {/* Item Name and Vendor */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: "16px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "#333",
                  marginBottom: "8px",
                }}
              >
                Item Name *
              </label>
              <input
                type="text"
                value={localItem.item}
                onChange={(e) => handleFieldChange("item", e.target.value)}
                placeholder="e.g., Balloons (pack of 50)"
                disabled={isReadOnly}
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "0.9rem",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  backgroundColor: isReadOnly ? "#f5f5f5" : "#fff",
                  cursor: isReadOnly ? "not-allowed" : "text",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "#333",
                  marginBottom: "8px",
                }}
              >
                <StorefrontIcon style={{ width: "18px", height: "18px" }} />
                Vendor *
              </label>
              <input
                type="text"
                value={localItem.vendor}
                onChange={(e) => handleFieldChange("vendor", e.target.value)}
                placeholder="e.g., Amazon"
                disabled={isReadOnly}
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "0.9rem",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  backgroundColor: isReadOnly ? "#f5f5f5" : "#fff",
                  cursor: isReadOnly ? "not-allowed" : "text",
                }}
              />
            </div>
          </div>

          {/* Unit Cost and Quantity */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "#333",
                  marginBottom: "8px",
                }}
              >
                <AttachMoneyIcon style={{ width: "18px", height: "18px" }} />
                Unit Cost *
              </label>
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#666",
                  }}
                >
                  $
                </span>
                <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={localItem.unitCost || ""}
                    onChange={(e) => {
                        const value = e.target.value;
                        handleFieldChange("unitCost", value === "" ? "" : parseFloat(value));
                    }}
                    onBlur={(e) => {
                        // Convert empty input to 0 on blur
                        if (e.target.value === "") {
                        handleFieldChange("unitCost", 0);
                        }
                    }}
                    disabled={isReadOnly}
                    style={{
                        width: "100%",
                        padding: "10px 10px 10px 28px",
                        fontSize: "0.9rem",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        backgroundColor: isReadOnly ? "#f5f5f5" : "#fff",
                        cursor: isReadOnly ? "not-allowed" : "text",
                    }}
                />
              </div>
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "#333",
                  marginBottom: "8px",
                }}
              >
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                value={localItem.quantity}
                onChange={(e) => handleFieldChange("quantity", parseInt(e.target.value) || 1)}
                disabled={isReadOnly}
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "0.9rem",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  backgroundColor: isReadOnly ? "#f5f5f5" : "#fff",
                  cursor: isReadOnly ? "not-allowed" : "text",
                }}
              />
            </div>
          </div>

          {/* Total Cost Display */}
          <div
            style={{
              padding: "16px",
              backgroundColor: "#E8F5E9",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "0.95rem", fontWeight: 600 }}>Total Cost:</span>
            <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "#2e7d32" }}>
              ${totalCost.toFixed(2)}
            </span>
          </div>

          {/* Status */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "#333",
                marginBottom: "8px",
              }}
            >
              Status
            </label>
            <select
              value={localItem.status}
              onChange={(e) => handleFieldChange("status", e.target.value)}
              disabled={isReadOnly}
              style={{
                width: "100%",
                padding: "10px",
                fontSize: "0.9rem",
                border: "1px solid #ddd",
                borderRadius: "6px",
                backgroundColor: isReadOnly ? "#f5f5f5" : "#fff",
                cursor: isReadOnly ? "not-allowed" : "pointer",
              }}
            >
              <option value="pending">Pending</option>
              <option value="ordered">Ordered</option>
              <option value="received">Received</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Activity Link */}
          <div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "#333",
                marginBottom: "8px",
              }}
            >
              <LinkIcon style={{ width: "18px", height: "18px" }} />
              Link to Activity (Optional)
            </label>
            <select
              value={localItem.activity_id || ""}
              onChange={(e) =>
                handleFieldChange("activity_id", e.target.value ? parseInt(e.target.value) : null)
              }
              disabled={isReadOnly}
              style={{
                width: "100%",
                padding: "10px",
                fontSize: "0.9rem",
                border: "1px solid #ddd",
                borderRadius: "6px",
                backgroundColor: isReadOnly ? "#f5f5f5" : "#fff",
                cursor: isReadOnly ? "not-allowed" : "pointer",
              }}
            >
              <option value="">No activity linked</option>
              {activities.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.name}
                </option>
              ))}
            </select>
          </div>

          {/* Product URL */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "#333",
                marginBottom: "8px",
              }}
            >
              Product URL (Optional)
            </label>
            <input
              type="url"
              value={localItem.link}
              onChange={(e) => handleFieldChange("link", e.target.value)}
              placeholder="https://example.com/product"
              disabled={isReadOnly}
              style={{
                width: "100%",
                padding: "10px",
                fontSize: "0.9rem",
                border: "1px solid #ddd",
                borderRadius: "6px",
                backgroundColor: isReadOnly ? "#f5f5f5" : "#fff",
                cursor: isReadOnly ? "not-allowed" : "text",
              }}
            />
          </div>

          {/* Notes */}
          <div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "#333",
                marginBottom: "8px",
              }}
            >
              <NotesIcon style={{ width: "18px", height: "18px" }} />
              Notes (Optional)
            </label>
            <textarea
              value={localItem.notes}
              onChange={(e) => handleFieldChange("notes", e.target.value)}
              placeholder="Add any special instructions or notes..."
              disabled={isReadOnly}
              rows={3}
              style={{
                width: "100%",
                padding: "10px",
                fontSize: "0.9rem",
                border: "1px solid #ddd",
                borderRadius: "6px",
                backgroundColor: isReadOnly ? "#f5f5f5" : "#fff",
                cursor: isReadOnly ? "not-allowed" : "text",
                resize: "vertical",
                fontFamily: "inherit",
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "32px",
            justifyContent: "flex-end",
          }}
        >
          {!isReadOnly && !isCreating && (
            <button
              onClick={handleDelete}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                backgroundColor: "#f44336",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "0.9rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <DeleteIcon style={{ width: "16px", height: "16px" }} />
              Delete
            </button>
          )}
          {!isReadOnly && (
            <button
              onClick={handleSave}
              disabled={isSaving || !localItem.item || !localItem.vendor}
              style={{
                padding: "10px 20px",
                backgroundColor: isSaving || !localItem.item || !localItem.vendor ? "#ccc" : "#6B7FD7",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "0.9rem",
                fontWeight: 600,
                cursor: isSaving || !localItem.item || !localItem.vendor ? "not-allowed" : "pointer",
              }}
            >
              {isSaving ? "Saving..." : isCreating ? "Add Item" : "Save"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingItemModal;