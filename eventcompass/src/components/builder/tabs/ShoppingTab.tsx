import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Checkbox,
  IconButton,
  LinearProgress,
  Collapse,
} from "@mui/material";
import {
  Add,
  ExpandMore,
  Edit,
  Delete,
  HelpOutline,
  Link as LinkIcon,
  OpenInNew,
} from "@mui/icons-material";

export interface ShoppingItem {
  id: string;
  vendor: string;
  item: string;
  unitCost: number;
  quantity: number;
  bought: boolean;
  activityId: string;
  notes: string;
  link: string;
}

export interface ShoppingCategory {
  id: string;
  name: string;
  description: string;
  allocated: number;
  items: ShoppingItem[];
}

export interface ProductRecommendation {
  id: string;
  name: string;
  price: number;
  vendor: string;
  image: string;
  link: string;
  rating: number;
  reviews: number;
  snippet: string;
  why: string;
}

export interface Activity {
  id: string;
  name: string;
}

interface ShoppingTabProps {
  categories: ShoppingCategory[];
  activities: Activity[];
  isReadOnly: boolean;
  onAddCategory: (name: string, description: string, allocated: number) => void;
  onUpdateCategory: (id: string, name: string, description: string, allocated: number) => void;
  onDeleteCategory: (id: string) => void;
  onAddItem: (categoryId: string, item: Omit<ShoppingItem, "id">) => void;
  onUpdateItem: (categoryId: string, itemId: string, item: Partial<ShoppingItem>) => void;
  onDeleteItem: (categoryId: string, itemId: string) => void;
  onToggleBought: (categoryId: string, itemId: string) => void;
  onGetRecommendations: (categoryId: string) => Promise<ProductRecommendation[]>;
}

const ShoppingTab: React.FC<ShoppingTabProps> = ({
  categories,
  activities,
  isReadOnly,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onToggleBought,
  onGetRecommendations,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    categories.map((cat) => cat.id)
  );
  const [showRecommendations, setShowRecommendations] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ShoppingCategory | null>(null);
  const [editingItem, setEditingItem] = useState<{ categoryId: string; itemId: string } | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductRecommendation | null>(null);

  const [itemFormData, setItemFormData] = useState({
    categoryId: "",
    vendor: "",
    item: "",
    unitCost: "",
    quantity: 1,
    activityId: "",
    notes: "",
    link: "",
  });

  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
    allocated: "",
  });

  const calculateItemTotal = (unitCost: number, quantity: number) => unitCost * quantity;

  const calculateCategorySpent = (items: ShoppingItem[]) => {
    return items
      .filter((item) => item.bought)
      .reduce((sum, item) => sum + calculateItemTotal(item.unitCost, item.quantity), 0);
  };

  const calculateCategoryTotal = (items: ShoppingItem[]) => {
    return items.reduce((sum, item) => sum + calculateItemTotal(item.unitCost, item.quantity), 0);
  };

  const handleToggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  const handleGetRecommendations = async (categoryId: string) => {
    setLoadingRecs(true);
    setShowRecommendations(categoryId);
    try {
      const recs = await onGetRecommendations(categoryId);
      setRecommendations(recs);
    } catch (error) {
      console.error("Failed to get recommendations:", error);
      setRecommendations([]);
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleAddFromRecommendation = (categoryId: string, product: ProductRecommendation) => {
    setSelectedProduct(product);
    setItemFormData({
      categoryId: categoryId,
      vendor: product.vendor,
      item: product.name,
      unitCost: product.price.toString(),
      quantity: 1,
      activityId: "",
      notes: "",
      link: product.link,
    });
    setShowRecommendations(null);
    setShowItemModal(true);
  };

  const handleManualAdd = (categoryId: string) => {
    setSelectedProduct(null);
    setEditingItem(null);
    setItemFormData({
      categoryId: categoryId,
      vendor: "",
      item: "",
      unitCost: "",
      quantity: 1,
      activityId: "",
      notes: "",
      link: "",
    });
    setShowItemModal(true);
  };

  const handleEditItem = (categoryId: string, item: ShoppingItem) => {
    setEditingItem({ categoryId, itemId: item.id });
    setSelectedProduct(null);
    setItemFormData({
      categoryId: categoryId,
      vendor: item.vendor,
      item: item.item,
      unitCost: item.unitCost.toString(),
      quantity: item.quantity,
      activityId: item.activityId || "",
      notes: item.notes || "",
      link: item.link || "",
    });
    setShowItemModal(true);
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryFormData({
      name: "",
      description: "",
      allocated: "",
    });
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: ShoppingCategory) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      description: category.description,
      allocated: category.allocated.toString(),
    });
    setShowCategoryModal(true);
  };

  const handleSaveCategory = () => {
    const allocated = parseFloat(categoryFormData.allocated);
    if (!categoryFormData.name || !categoryFormData.description || isNaN(allocated)) {
      return;
    }

    if (editingCategory) {
      onUpdateCategory(editingCategory.id, categoryFormData.name, categoryFormData.description, allocated);
    } else {
      onAddCategory(categoryFormData.name, categoryFormData.description, allocated);
    }

    setShowCategoryModal(false);
    setEditingCategory(null);
  };

  const handleSaveItem = () => {
    const unitCost = parseFloat(itemFormData.unitCost);
    if (!itemFormData.vendor || !itemFormData.item || isNaN(unitCost)) {
      return;
    }

    const itemData = {
      vendor: itemFormData.vendor,
      item: itemFormData.item,
      unitCost: unitCost,
      quantity: itemFormData.quantity,
      bought: false,
      activityId: itemFormData.activityId,
      notes: itemFormData.notes,
      link: itemFormData.link,
    };

    if (editingItem) {
      onUpdateItem(editingItem.categoryId, editingItem.itemId, itemData);
    } else {
      onAddItem(itemFormData.categoryId, itemData);
    }

    setShowItemModal(false);
    setEditingItem(null);
    setSelectedProduct(null);
  };

  const getStatusColor = (spent: number, allocated: number) => {
    if (allocated === 0) return "text.secondary";
    const percentage = (spent / allocated) * 100;
    if (percentage >= 100) return "error.main";
    if (percentage >= 80) return "warning.main";
    return "success.main";
  };

  const getProgressColor = (spent: number, allocated: number): "success" | "warning" | "error" => {
    if (allocated === 0) return "success";
    const percentage = (spent / allocated) * 100;
    if (percentage >= 100) return "error";
    if (percentage >= 80) return "warning";
    return "success";
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Shopping
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Get personalized product recommendations for each category • Track your purchases and budget
          </Typography>
        </Box>
        {!isReadOnly && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddCategory}
            sx={{ textTransform: "none" }}
          >
            Add Category
          </Button>
        )}
      </Box>

      {/* Categories */}
      {categories.map((category) => {
        const spent = calculateCategorySpent(category.items);
        const total = calculateCategoryTotal(category.items);
        const progress = category.allocated > 0 ? (spent / category.allocated) * 100 : 0;
        const isExpanded = expandedCategories.includes(category.id);
        const purchasedCount = category.items.filter((i) => i.bought).length;
        const showingRecs = showRecommendations === category.id;

        return (
          <Box
            key={category.id}
            sx={{
              mb: 3,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
              overflow: "hidden",
              bgcolor: "background.paper",
            }}
          >
            {/* Category Header */}
            <Box sx={{ p: 3, bgcolor: "#f8f9fa", borderBottom: "1px solid", borderColor: "divider" }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 2 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {category.name}
                    </Typography>
                    {!isReadOnly && (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCategory(category);
                        }}
                        sx={{ color: "text.secondary" }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    )}
                    {category.items.length > 0 && (
                      <Box
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          bgcolor: purchasedCount === category.items.length ? "#e8f5e9" : "#fff3e0",
                          color: purchasedCount === category.items.length ? "#2e7d32" : "#ed6c02",
                          borderRadius: 2,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {purchasedCount} / {category.items.length} purchased
                      </Box>
                    )}
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.5 }}>
                    {category.description}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 3, fontSize: 14, color: "text.secondary" }}>
                    <Typography variant="body2">
                      Budget: <strong>${category.allocated}</strong>
                    </Typography>
                    <Typography variant="body2">
                      Spent:{" "}
                      <Box component="strong" sx={{ color: getStatusColor(spent, category.allocated) }}>
                        ${spent.toFixed(2)}
                      </Box>
                    </Typography>
                    {total > 0 && (
                      <Typography variant="body2">
                        Total planned: <strong>${total.toFixed(2)}</strong>
                      </Typography>
                    )}
                  </Box>
                </Box>

                {!isReadOnly && (
                  <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
                    <Button
                      variant="contained"
                      startIcon={<HelpOutline />}
                      onClick={() => handleGetRecommendations(category.id)}
                      sx={{ textTransform: "none", whiteSpace: "nowrap" }}
                    >
                      Get Recommendations
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => handleManualAdd(category.id)}
                      sx={{ textTransform: "none", whiteSpace: "nowrap" }}
                    >
                      + Add Item
                    </Button>
                  </Box>
                )}
              </Box>

              {category.allocated > 0 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, progress)}
                      color={getProgressColor(spent, category.allocated)}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, minWidth: 70, textAlign: "right" }}>
                    {progress.toFixed(0)}% of budget
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Recommendations Section */}
            <Collapse in={showingRecs}>
              <Box sx={{ p: 3, bgcolor: "#f8f9fa", borderBottom: "1px solid", borderColor: "divider" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Recommended for {category.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Popular products that work well for this category
                    </Typography>
                  </Box>
                  <IconButton onClick={() => setShowRecommendations(null)} size="small">
                    <Delete />
                  </IconButton>
                </Box>

                {loadingRecs ? (
                  <Box sx={{ textAlign: "center", py: 5 }}>
                    <LinearProgress sx={{ mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      Finding the best products for you...
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 2 }}>
                    {recommendations.map((product) => (
                      <Box
                        key={product.id}
                        sx={{
                          bgcolor: "background.paper",
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 2,
                          p: 2,
                          transition: "all 0.2s",
                          "&:hover": {
                            boxShadow: 2,
                            transform: "translateY(-2px)",
                          },
                        }}
                      >
                        <Box sx={{ display: "flex", gap: 1.5, mb: 1.5 }}>
                          <Box
                            sx={{
                              width: 60,
                              height: 60,
                              bgcolor: "#f5f5f5",
                              borderRadius: 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 28,
                              flexShrink: 0,
                            }}
                          >
                            {product.image}
                          </Box>
                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, lineHeight: 1.3 }}>
                              {product.name}
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Box sx={{ px: 1, py: 0.25, bgcolor: "#e3f2fd", borderRadius: 2, fontSize: 10, fontWeight: 600, color: "primary.main" }}>
                                {product.vendor}
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                ⭐ {product.rating} ({product.reviews.toLocaleString()})
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1, lineHeight: 1.4 }}>
                          {product.snippet}
                        </Typography>

                        <Box sx={{ bgcolor: "#e8f5e9", p: 1, borderRadius: 1, mb: 1.5 }}>
                          <Typography variant="caption" sx={{ color: "#2e7d32", fontWeight: 600, display: "block", mb: 0.5 }}>
                            💡 Why we recommend this:
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#2e7d32" }}>
                            {product.why}
                          </Typography>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: "#2e7d32" }}>
                            ${product.price.toFixed(2)}
                          </Typography>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleAddFromRecommendation(category.id, product)}
                            sx={{ textTransform: "none" }}
                          >
                            Add to List
                          </Button>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Collapse>

            {/* Shopping List Items */}
            {category.items.length > 0 && (
              <Box>
                <Box
                  onClick={() => handleToggleCategory(category.id)}
                  sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    cursor: "pointer",
                    borderBottom: isExpanded ? "1px solid" : "none",
                    borderColor: "divider",
                    "&:hover": { bgcolor: "#fafafa" },
                  }}
                >
                  <ExpandMore
                    sx={{
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>
                    {isExpanded ? "Hide" : "Show"} Shopping List ({category.items.length} items)
                  </Typography>
                </Box>

                <Collapse in={isExpanded}>
                  <Box sx={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead style={{ background: "#fafafa" }}>
                        <tr>
                          <th style={{ width: 50, padding: "12px 16px", fontSize: 11, fontWeight: 600, textAlign: "left", textTransform: "uppercase", color: "#666" }}>Done</th>
                          <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 600, textAlign: "left", textTransform: "uppercase", color: "#666" }}>Vendor</th>
                          <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 600, textAlign: "left", textTransform: "uppercase", color: "#666" }}>Item</th>
                          <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 600, textAlign: "right", textTransform: "uppercase", color: "#666" }}>Unit Cost</th>
                          <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 600, textAlign: "center", textTransform: "uppercase", color: "#666", width: 80 }}>Qty</th>
                          <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 600, textAlign: "right", textTransform: "uppercase", color: "#666" }}>Total</th>
                          <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 600, textAlign: "left", textTransform: "uppercase", color: "#666" }}>Activity</th>
                          {!isReadOnly && <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 600, textAlign: "center", textTransform: "uppercase", color: "#666", width: 100 }}>Actions</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {category.items.map((item) => {
                          const itemTotal = calculateItemTotal(item.unitCost, item.quantity);
                          const linkedActivity = activities.find((a) => a.id === item.activityId);

                          return (
                            <tr key={item.id} style={{ borderBottom: "1px solid #e0e0e0" }}>
                              <td style={{ padding: "16px" }}>
                                <Checkbox
                                  checked={item.bought}
                                  onChange={() => onToggleBought(category.id, item.id)}
                                  disabled={isReadOnly}
                                  sx={{ p: 0 }}
                                />
                              </td>
                              <td style={{ padding: "16px", fontSize: 14 }}>{item.vendor}</td>
                              <td style={{ padding: "16px" }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {item.item}
                                  </Typography>
                                  {item.link && (
                                    <IconButton
                                      size="small"
                                      href={item.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      sx={{ p: 0 }}
                                    >
                                      <OpenInNew fontSize="small" />
                                    </IconButton>
                                  )}
                                </Box>
                              </td>
                              <td style={{ padding: "16px", fontSize: 14, textAlign: "right" }}>${item.unitCost.toFixed(2)}</td>
                              <td style={{ padding: "16px", fontSize: 14, textAlign: "center", fontWeight: 600 }}>{item.quantity}</td>
                              <td style={{
                                padding: "16px",
                                fontSize: 15,
                                fontWeight: 700,
                                textAlign: "right",
                                color: item.bought ? "#2e7d32" : "#000",
                              }}>
                                ${itemTotal.toFixed(2)}
                              </td>
                              <td style={{ padding: "16px", fontSize: 13 }}>
                                {linkedActivity ? (
                                  <Box
                                    sx={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 0.5,
                                      px: 1.25,
                                      py: 0.5,
                                      bgcolor: "background.paper",
                                      border: "1px solid",
                                      borderColor: "divider",
                                      borderRadius: 2,
                                      fontSize: 12,
                                    }}
                                  >
                                    <LinkIcon sx={{ fontSize: 12 }} />
                                    {linkedActivity.name}
                                  </Box>
                                ) : (
                                  <Typography color="text.disabled">—</Typography>
                                )}
                              </td>
                              {!isReadOnly && (
                                <td style={{ padding: "16px", textAlign: "center" }}>
                                  <IconButton size="small" onClick={() => handleEditItem(category.id, item)}>
                                    <Edit fontSize="small" />
                                  </IconButton>
                                  <IconButton size="small" onClick={() => onDeleteItem(category.id, item.id)}>
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </Box>
                </Collapse>
              </Box>
            )}

            {category.items.length === 0 && !showingRecs && (
              <Box sx={{ p: 6, textAlign: "center", color: "text.disabled" }}>
                <Typography variant="body2">
                  No items yet. Get recommendations or add items manually to get started.
                </Typography>
              </Box>
            )}
          </Box>
        );
      })}

      {/* Add/Edit Item Modal */}
      <Dialog open={showItemModal} onClose={() => setShowItemModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingItem ? "Edit Item" : "Add Item to Shopping List"}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2.5 }}>
            {selectedProduct && !editingItem && (
              <Box sx={{ bgcolor: "#f5f5f5", p: 2, borderRadius: 1, display: "flex", gap: 2, alignItems: "center" }}>
                <Box sx={{ width: 60, height: 60, bgcolor: "background.paper", borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                  {selectedProduct.image}
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {selectedProduct.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedProduct.vendor} • ${selectedProduct.price}
                  </Typography>
                </Box>
              </Box>
            )}

            {editingItem && itemFormData.link && (
              <Box sx={{ bgcolor: "#f5f5f5", p: 2, borderRadius: 1, display: "flex", gap: 2, alignItems: "center" }}>
                <Box sx={{ width: 60, height: 60, bgcolor: "background.paper", borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                  🔗
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Linked Product
                  </Typography>
                  <Box
                    component="a"
                    href={itemFormData.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      fontSize: 12,
                      color: "primary.main",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      wordBreak: "break-all",
                    }}
                  >
                    {itemFormData.link}
                    <OpenInNew sx={{ fontSize: 12 }} />
                  </Box>
                </Box>
              </Box>
            )}

            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={itemFormData.categoryId}
                label="Category"
                onChange={(e) => setItemFormData({ ...itemFormData, categoryId: e.target.value })}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 1.5 }}>
              <TextField
                label="Vendor"
                value={itemFormData.vendor}
                onChange={(e) => setItemFormData({ ...itemFormData, vendor: e.target.value })}
                placeholder="e.g., Amazon"
                required
                fullWidth
              />
              <TextField
                label="Item Name"
                value={itemFormData.item}
                onChange={(e) => setItemFormData({ ...itemFormData, item: e.target.value })}
                placeholder="e.g., Balloons (pack of 50)"
                required
                fullWidth
              />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
              <TextField
                label="Unit Cost"
                type="number"
                value={itemFormData.unitCost}
                onChange={(e) => setItemFormData({ ...itemFormData, unitCost: e.target.value })}
                placeholder="0.00"
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                fullWidth
              />
              <TextField
                label="Quantity"
                type="number"
                value={itemFormData.quantity}
                onChange={(e) => setItemFormData({ ...itemFormData, quantity: parseInt(e.target.value) || 1 })}
                required
                fullWidth
              />
            </Box>

            {itemFormData.unitCost && itemFormData.quantity && (
              <Box sx={{ bgcolor: "#e8f5e9", p: 1.5, borderRadius: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Total Cost:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#2e7d32" }}>
                  ${(parseFloat(itemFormData.unitCost) * itemFormData.quantity).toFixed(2)}
                </Typography>
              </Box>
            )}

            <FormControl fullWidth>
              <InputLabel>Link to Activity (Optional)</InputLabel>
              <Select
                value={itemFormData.activityId}
                label="Link to Activity (Optional)"
                onChange={(e) => setItemFormData({ ...itemFormData, activityId: e.target.value })}
              >
                <MenuItem value="">No activity linked</MenuItem>
                {activities.map((act) => (
                  <MenuItem key={act.id} value={act.id}>
                    {act.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Notes (Optional)"
              value={itemFormData.notes}
              onChange={(e) => setItemFormData({ ...itemFormData, notes: e.target.value })}
              placeholder="Add any special instructions or notes..."
              multiline
              rows={3}
              fullWidth
            />

            <TextField
              label="Product URL (Optional)"
              type="url"
              value={itemFormData.link}
              onChange={(e) => setItemFormData({ ...itemFormData, link: e.target.value })}
              placeholder="https://example.com/product"
              helperText="Save the link to easily find or purchase this item later"
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={() => setShowItemModal(false)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveItem}
            variant="contained"
            disabled={!itemFormData.vendor || !itemFormData.item || !itemFormData.unitCost}
            sx={{ textTransform: "none" }}
          >
            {editingItem ? "Save Changes" : "Add to Shopping List"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Category Modal */}
      <Dialog open={showCategoryModal} onClose={() => setShowCategoryModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2.5 }}>
            <TextField
              label="Category Name"
              value={categoryFormData.name}
              onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
              placeholder="e.g., Decorations, Catering, Supplies"
              required
              fullWidth
            />

            <TextField
              label="Description"
              value={categoryFormData.description}
              onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
              placeholder="Describe what this category is for and what types of items are needed..."
              helperText="A good description helps generate better product recommendations"
              multiline
              rows={3}
              required
              fullWidth
            />

            <TextField
              label="Budget Allocation"
              type="number"
              value={categoryFormData.allocated}
              onChange={(e) => setCategoryFormData({ ...categoryFormData, allocated: e.target.value })}
              placeholder="0.00"
              helperText="Set the budget limit for this category"
              required
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={() => setShowCategoryModal(false)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveCategory}
            variant="contained"
            disabled={!categoryFormData.name || !categoryFormData.description || !categoryFormData.allocated}
            sx={{ textTransform: "none" }}
          >
            {editingCategory ? "Save Changes" : "Create Category"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShoppingTab;