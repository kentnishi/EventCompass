import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import LinkIcon from "@mui/icons-material/Link";
import NotesIcon from "@mui/icons-material/Notes";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import StorefrontIcon from "@mui/icons-material/Storefront";
import InventoryIcon from "@mui/icons-material/Inventory";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { EventBasics, ShoppingItem, Activity, BudgetItem } from "@/types/eventPlan";


interface ProductRecommendation {
  name: string;
  vendor: string;
  price: number;
  rating: number;
  reviews: number;
  link: string;
  image: string;
}

interface ShoppingItemModalProps {
  item: ShoppingItem;
  budgetItems: BudgetItem[];
  activities: Activity[];
  isReadOnly: boolean;
  isCreating: boolean;
  onClose: () => void;
  fetchShoppingItems: () => void;
  onBudgetChange: () => void;
  eventBasics?: EventBasics;
  shoppingItems?: ShoppingItem[];
}

const ShoppingItemModal: React.FC<ShoppingItemModalProps> = ({
  item,
  budgetItems,
  activities,
  isReadOnly,
  isCreating,
  onClose,
  fetchShoppingItems,
  onBudgetChange,
  eventBasics,
  shoppingItems
}) => {
  const [localItem, setLocalItem] = useState<ShoppingItem>(item);
  const [isSaving, setIsSaving] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);
  const [selectedProductIndex, setSelectedProductIndex] = useState<number | null>(null);

  // Search controls
  const [searchMinPrice, setSearchMinPrice] = useState<number>(0);
  const [searchMaxPrice, setSearchMaxPrice] = useState<number>(0);
  const [searchQuantity, setSearchQuantity] = useState<number>(localItem.quantity || 1);


  // Update item field locally
  const handleFieldChange = (field: keyof ShoppingItem, value: any) => {
    setLocalItem((prev) => ({ ...prev, [field]: value }));
  };

  // Calculate total cost
  const totalCost = localItem.unit_cost * localItem.quantity;
  


  // Find products (placeholder implementation)
  const handleFindProducts = async () => {
    if (!localItem.item) {
      alert("Please enter an item name first");
      return;
    }
  
    setIsSearching(true);
  
    try {
      const selectedBudget = budgetItems.find((b) => b.id === localItem.budget_id);
      const remainingBudget = selectedBudget 
        ? selectedBudget.allocated - selectedBudget.spent 
        : undefined;
  
      const maxPrice = searchMaxPrice > 1 ? searchMaxPrice : remainingBudget; // Use remaining budget if no max set
      const minPrice = searchMinPrice > 1 ? searchMinPrice : 1;
  
      const response = await fetch("/api/event-plans/shopping/product-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: localItem.item,
          minPrice: minPrice,
          maxPrice: maxPrice,
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to search products");
      }
  
      const data = await response.json();
      
  
      if (data.products && data.products.length > 0) {
        setRecommendations(data.products);
        setShowRecommendations(true);
        
        // Optional: Show what was searched
        console.log("Searched for:", data.searchedQuery);
      } else {
        alert(
          `No products found for "${localItem.item}". ` +
          `Searched: "${data.searchedQuery}". ` +
          `Try adjusting the item name or increasing budget.`
        );
      }
      console.log("Product Search: ", data);
    } catch (error) {
      console.error("Error searching products:", error);
      alert("Failed to search for products. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  // Select a product and auto-fill fields
  const handleSelectProduct = (index: number) => {
    const product = recommendations[index];
    setSelectedProductIndex(index);
    handleFieldChange("vendor", product.vendor);
    handleFieldChange("unit_cost", product.price);
    handleFieldChange("link", product.link);
  };

  // Save changes to the backend
  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Ensure unit_cost is a number
      if (typeof localItem.unit_cost !== "number") {
        localItem.unit_cost = parseFloat(localItem.unit_cost as any) || 0;
      }

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
      fetchShoppingItems();
      onBudgetChange();
      onClose();
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
      fetchShoppingItems();
      onBudgetChange();
      onClose();
    } catch (error) {
      console.error("Error deleting shopping item:", error);
      alert("Failed to delete shopping item. Please try again.");
    }
  };

  const selectedBudget = budgetItems.find((b) => b.id === localItem.budget_id);
  const remainingBudget = selectedBudget ? selectedBudget.allocated - selectedBudget.spent : 0;

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
              value={localItem.budget_id ?? ""}
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
                  backgroundColor: isReadOnly ? "#f5f5f5" : selectedProductIndex !== null ? "#f0f4ff" : "#fff",
                  borderColor: selectedProductIndex !== null ? "#6B7FD7" : "#ddd",
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
                  value={localItem.unit_cost === 0 ? "" : localItem.unit_cost}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleFieldChange("unit_cost", value === "" ? 0 : parseFloat(value));
                  }}
                  onBlur={(e) => {
                    if (e.target.value === "") {
                      handleFieldChange("unit_cost", 0);
                    }
                  }}
                  disabled={isReadOnly}
                  style={{
                    width: "100%",
                    padding: "10px 10px 10px 28px",
                    fontSize: "0.9rem",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    backgroundColor: isReadOnly ? "#f5f5f5" : selectedProductIndex !== null ? "#f0f4ff" : "#fff",
                    borderColor: selectedProductIndex !== null ? "#6B7FD7" : "#ddd",
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
                value={localItem.quantity === 0 ? "" : localItem.quantity}
                onChange={(e) => {
                  const value = e.target.value;
                  handleFieldChange("quantity", value === "" ? "" : parseInt(value));
                }}
                onBlur={(e) => {
                  if (e.target.value === "") {
                    handleFieldChange("quantity", 1);
                  }
                }}
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
                backgroundColor: isReadOnly ? "#f5f5f5" : selectedProductIndex !== null ? "#f0f4ff" : "#fff",
                borderColor: selectedProductIndex !== null ? "#6B7FD7" : "#ddd",
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

        {/* Product Recommendations Section */}
        {!isReadOnly && (
          <div
            style={{
              marginTop: "24px",
              paddingTop: "24px",
              borderTop: "2px solid #f0f0f0",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "#333",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <SearchIcon style={{ width: "20px", height: "20px" }} />
                <span>Product Recommendations</span>
              </div>
              
              <button
                onClick={handleFindProducts}
                disabled={isSearching}
                style={{
                  padding: "10px 20px",
                  background: isSearching ? "#f5f5f5" : "#E8F5E9",
                  color: isSearching ? "#999" : "#2e7d32",
                  border: isSearching ? "1px solid #ddd" : "1px solid #A5D6A7",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  cursor: isSearching ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s",
                }}
              >
                {isSearching ? (
                  <>
                    <RefreshIcon style={{ width: "18px", height: "18px", animation: "spin 1s linear infinite" }} />
                    <span>Searching...</span>
                  </>
                ) : showRecommendations ? (
                  <>
                    <RefreshIcon style={{ width: "18px", height: "18px" }} />
                    <span>Find More Options</span>
                  </>
                ) : (
                  <>
                    <SearchIcon style={{ width: "18px", height: "18px" }} />
                    <span>Find Products</span>
                  </>
                )}
              </button>
            </div>

            {!showRecommendations && !isSearching && (
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "#666",
                  marginTop: "8px",
                  padding: "8px 12px",
                  background: "#f8f9fa",
                  borderRadius: "6px",
                  borderLeft: "3px solid #6B7FD7",
                }}
              >
                💡 Click "Find Products" to search for actual products with prices and links
              </div>
            )}

            
            <div
              style={{
                background: "#f8f9fa",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "16px",
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {/* Min Price */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: "#333",
                      marginBottom: "6px",
                    }}
                  >
                    Min Price (Optional)
                  </label>
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#666",
                        fontSize: "0.85rem",
                      }}
                    >
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={searchMinPrice || ""}
                      onChange={(e) => setSearchMinPrice(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      style={{
                        width: "100%",
                        padding: "8px 8px 8px 24px",
                        fontSize: "0.85rem",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                      }}
                    />
                  </div>              
                </div>
                
                {/* Max Price */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: "#333",
                      marginBottom: "6px",
                    }}
                  >
                    Max Price (Optional)
                  </label>
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#666",
                        fontSize: "0.85rem",
                      }}
                    >
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={searchMaxPrice || ""}
                      onChange={(e) => setSearchMaxPrice(parseFloat(e.target.value) || 0)}
                      placeholder={remainingBudget > 0 ? remainingBudget.toFixed(0) : ""}
                      style={{
                        width: "100%",
                        padding: "8px 8px 8px 24px",
                        fontSize: "0.85rem",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                      }}
                    />
                  </div>
                </div>

              </div>              
            </div>

            

            {showRecommendations && recommendations.length > 0 && (
              <>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#666",
                    marginBottom: "16px",
                    padding: "8px 12px",
                    background: "#f8f9fa",
                    borderRadius: "6px",
                    borderLeft: "3px solid #6B7FD7",
                  }}
                >
                  💡 Click on any product to automatically fill in the vendor, price, and link fields above
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "12px",
                  }}
                >
                  {recommendations.map((product, index) => (
                    <div
                      key={index}
                      onClick={() => handleSelectProduct(index)}
                      style={{
                        background: "#f8f9fa",
                        border: selectedProductIndex === index ? "2px solid #6B7FD7" : "1px solid #e0e0e0",
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        position: "relative",
                        overflow: "hidden",
                        boxShadow: selectedProductIndex === index ? "0 0 0 2px #6B7FD7" : "none",
                      }}
                    >
                      {selectedProductIndex === index && (
                        <div
                          style={{
                            position: "absolute",
                            top: "12px",
                            right: "12px",
                            background: "#6B7FD7",
                            color: "white",
                            borderRadius: "12px",
                            padding: "4px 10px",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            zIndex: 10,
                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <CheckCircleIcon style={{ width: "12px", height: "12px" }} />
                          Selected
                        </div>
                      )}
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          width: "100%",
                          height: "160px",
                          objectFit: "cover",
                          background: "white",
                          borderBottom: "1px solid #e0e0e0",
                        }}
                      />
                      <div style={{ padding: "16px" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "start",
                            marginBottom: "8px",
                            gap: "8px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "0.85rem",
                              fontWeight: 600,
                              color: "#333",
                              lineHeight: 1.3,
                              flex: 1,
                            }}
                          >
                            {product.name}
                          </div>
                          <div
                            style={{
                              fontSize: "1rem",
                              fontWeight: 700,
                              color: "#2e7d32",
                              whiteSpace: "nowrap",
                            }}
                          >
                            ${product.price.toFixed(2)}
                          </div>
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#666", marginBottom: "6px" }}>
                          {product.vendor}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "#666", marginBottom: "10px" }}>
                          ⭐ {product.rating} ({product.reviews.toLocaleString()} reviews)
                        </div>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectProduct(index);
                            }}
                            style={{
                              flex: 1,
                              background: selectedProductIndex === index ? "#5968c4" : "#6B7FD7",
                              color: "white",
                              padding: "6px 10px",
                              border: "none",
                              borderRadius: "6px",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              cursor: "pointer",
                              transition: "background 0.2s",
                            }}
                          >
                            {selectedProductIndex === index ? "Selected" : "Use This"}
                          </button>
                          <a
                            href={product.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              background: "white",
                              color: "#6B7FD7",
                              border: "1px solid #6B7FD7",
                              padding: "6px 10px",
                              borderRadius: "6px",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              cursor: "pointer",
                              textDecoration: "none",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.2s",
                            }}
                          >
                            View
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

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

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

// Demo wrapper with mock data
// const DemoWrapper = () => {
  // const mockBudgetItems: BudgetItem[] = [
  //   {
  //     id: 1,
  //     category: "Decorations",
  //     allocated: 200,
  //     spent: 145,
  //     description: "Party decorations and supplies for the main event space"
  //   },
  //   {
  //     id: 2,
  //     category: "Food & Beverages",
  //     allocated: 300,
  //     spent: 0,
  //     description: "Food, drinks, and catering supplies"
  //   }
  // ];

  // const mockActivities: Activity[] = [
  //   { id: 1, name: "Welcome Reception" },
  //   { id: 2, name: "Main Event" },
  //   { id: 3, name: "Photo Booth" }
  // ];

//   const mockItem: ShoppingItem = {
//     id: 1,
//     event_id: "123",
//     item: "Balloons (pack of 50)",
//     vendor: "",
//     unit_cost: 0,
//     quantity: 2,
//     notes: "",
//     activity_id: null,
//     link: "",
//     budget_id: 1,
//     status: "pending"
//   };

//   return (
//     <ShoppingItemModal
//       item={mockItem}
//       budgetItems={mockBudgetItems}
//       activities={mockActivities}
//       isReadOnly={false}
//       isCreating={false}
//       onClose={() => console.log("Close")}
//       fetchShoppingItems={() => console.log("Fetch")}
//       onBudgetChange={() => console.log("Budget change")}
//     />
//   );
// };

export default ShoppingItemModal;