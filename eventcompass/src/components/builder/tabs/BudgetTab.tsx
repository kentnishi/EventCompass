import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  LinearProgress,
  IconButton,
  InputAdornment,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import {
  AttachMoney,
  TrendingUp,
  TrendingDown,
  Warning,
  ShoppingCart,
  Edit,
  Delete,
  Add,
} from "@mui/icons-material";

interface BudgetItem {
  id?: number;
  event_id: string;
  category: string; // Budget category (e.g., "Food & Beverages") -> linked to shopping
  allocated: number; // Allocated budget
  description: string; // Description of the budget category
  spent: number; // Amount spent per category
}

interface BudgetTabProps {
  event_id: string;
  budgetItems: BudgetItem[];
  isReadOnly: boolean;
  totalBudget: number;
//   shoppingCategories: string[];
  onBudgetChange: () => void; // Callback to refresh budget data
}

const BudgetTab: React.FC<BudgetTabProps> = ({
  event_id,
  budgetItems,
  isReadOnly,
  totalBudget,
  
  onBudgetChange,
}) => {
  const [editingAllocated, setEditingAllocated] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [modalCategory, setModalCategory] = useState("");
  const [modalDescription, setModalDescription] = useState("");
  const [modalAllocated, setModalAllocated] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const shoppingCategories = Array.from(new Set(budgetItems.map((item) => item.category)));


  const totalAllocated = budgetItems.reduce((sum, item) => sum + item.allocated, 0);
  const totalSpent = budgetItems.reduce((sum, item) => sum + item.spent, 0);
  const remaining = totalBudget - totalSpent;
  const unallocated = totalBudget - totalAllocated;

  const getStatusColor = (spent: number, allocated: number): string => {
    if (allocated === 0) return "text.secondary";
    const percentage = (spent / allocated) * 100;
    if (percentage >= 100) return "error.main";
    if (percentage >= 80) return "warning.main";
    return "success.main";
  };

  const getProgressColor = (spent: number, allocated: number): "success" | "warning" | "error" | "primary" => {
    if (allocated === 0) return "primary";
    const percentage = (spent / allocated) * 100;
    if (percentage >= 100) return "error";
    if (percentage >= 80) return "warning";
    return "success";
  };

  // Quick inline edit for allocated amount
  const handleStartEditAllocated = (itemId: number, currentValue: number) => {
    if (isReadOnly) return;
    setEditingAllocated(itemId);
    setEditValue(currentValue.toString());
  };

  const handleSaveAllocated = async (itemId: number) => {
    const newValue = parseFloat(editValue);
    if (!isNaN(newValue) && newValue >= 0) {
      try {
        const response = await fetch(`/api/event-plans/budget/${itemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ allocated: newValue }),
        });

        if (!response.ok) throw new Error("Failed to update budget item");
        
        onBudgetChange(); // Refresh data
      } catch (error) {
        console.error("Error updating allocated amount:", error);
      }
    }
    setEditingAllocated(null);
    setEditValue("");
  };

  const handleCancelEdit = () => {
    setEditingAllocated(null);
    setEditValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent, itemId: number) => {
    if (e.key === "Enter") {
      handleSaveAllocated(itemId);
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  // Modal for editing/creating full budget item
  const handleOpenEditModal = (item: BudgetItem) => {
    if (isReadOnly) return;
    setIsCreating(false);
    setEditingItem(item);
    setModalCategory(item.category);
    setModalDescription(item.description);
    setModalAllocated(item.allocated.toString());
    setShowEditModal(true);
  };

  const handleOpenCreateModal = () => {
    if (isReadOnly) return;
    setIsCreating(true);
    setEditingItem(null);
    setModalCategory(shoppingCategories[0] || "");
    setModalDescription("");
    setModalAllocated("0");
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingItem(null);
    setModalCategory("");
    setModalDescription("");
    setModalAllocated("");
    setIsCreating(false);
  };

  const handleSaveModal = async () => {
    setIsSaving(true);
    
    try {
      const newAllocated = parseFloat(modalAllocated);
      if (isNaN(newAllocated) || newAllocated < 0) {
        alert("Please enter a valid allocated amount");
        setIsSaving(false);
        return;
      }

      if (!modalCategory.trim()) {
        alert("Please select a category");
        setIsSaving(false);
        return;
      }

      if (isCreating) {
        // Create new budget item
        const response = await fetch(`/api/event-plans/${event_id}/budget`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category: modalCategory,
            description: modalDescription,
            allocated: newAllocated,
            spent: 0, // New items start with 0 spent
          }),
        });

        if (!response.ok) throw new Error("Failed to create budget item");
      } else if (editingItem?.id) {
        // Update existing budget item
        const response = await fetch(`/api/event-plans/budget/${editingItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category: modalCategory,
            description: modalDescription,
            allocated: newAllocated,
          }),
        });

        if (!response.ok) throw new Error("Failed to update budget item");
      }

      onBudgetChange(); // Refresh data
      handleCloseEditModal();
    } catch (error) {
      console.error("Error saving budget item:", error);
      alert("Failed to save budget item. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (itemId: number) => {
    if (isReadOnly) return;
    
    if (!confirm("Are you sure you want to delete this budget item?")) return;

    try {
      const response = await fetch(`/api/event-plans/budget/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete budget item");
      
      onBudgetChange(); // Refresh data
    } catch (error) {
      console.error("Error deleting budget item:", error);
      alert("Failed to delete budget item. Please try again.");
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header Overview */}
      <Paper sx={{ p: 4, mb: 3, borderRadius: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Budget Overview
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#E3F2FD", boxShadow: 0 }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Total Budget
                  </Typography>
                  <AttachMoney sx={{ fontSize: 20, color: "primary.main" }} />
                </Box>
                <Typography variant="h4" fontWeight={700}>
                  ${totalBudget.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#F5F5F5", boxShadow: 0 }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Allocated
                  </Typography>
                  <TrendingUp sx={{ fontSize: 20, color: "text.secondary" }} />
                </Box>
                <Typography variant="h4" fontWeight={700}>
                  ${totalAllocated.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {totalBudget > 0 ? ((totalAllocated / totalBudget) * 100).toFixed(0) : 0}% of budget
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#E8F5E9", boxShadow: 0 }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Spent
                  </Typography>
                  <ShoppingCart sx={{ fontSize: 20, color: "success.main" }} />
                </Box>
                <Typography variant="h4" fontWeight={700}>
                  ${totalSpent.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(0) : 0}% of budget
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: remaining >= 0 ? "#E8F5E9" : "#FFEBEE", boxShadow: 0 }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Remaining
                  </Typography>
                  {remaining >= 0 ? (
                    <TrendingUp sx={{ fontSize: 20, color: "success.main" }} />
                  ) : (
                    <TrendingDown sx={{ fontSize: 20, color: "error.main" }} />
                  )}
                </Box>
                <Typography variant="h4" fontWeight={700} color={remaining >= 0 ? "text.primary" : "error.main"}>
                  ${Math.abs(remaining).toLocaleString()}
                </Typography>
                {remaining < 0 && (
                  <Typography variant="caption" color="error.main" fontWeight={600}>
                    Over budget
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {unallocated !== 0 && (
          <Alert 
            severity={unallocated > 0 ? "warning" : "error"} 
            icon={<Warning />}
            sx={{ mt: 2 }}
          >
            {unallocated > 0 
              ? `$${unallocated.toLocaleString()} unallocated` 
              : `Over-allocated by $${Math.abs(unallocated).toLocaleString()}`}
          </Alert>
        )}
      </Paper>

      {/* Budget Categories Table */}
      <Paper sx={{ borderRadius: 3 }}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Budget Categories
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Linked to shopping lists • Spent amounts update automatically
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenCreateModal}
              disabled={isReadOnly}
              sx={{ textTransform: "none" }}
            >
              Add Category
            </Button>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "#F5F5F5" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "text.secondary" }}>
                  Category
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "text.secondary" }}>
                  Description
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "text.secondary" }}>
                  Allocated
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "text.secondary" }}>
                  Spent
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "text.secondary" }}>
                  Remaining
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "text.secondary" }}>
                  Progress
                </TableCell>
                {!isReadOnly && (
                  <TableCell align="center" sx={{ fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "text.secondary" }}>
                    Actions
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {budgetItems.map((item) => {
                const percentage = item.allocated > 0 ? (item.spent / item.allocated) * 100 : 0;
                const remainingAmount = item.allocated - item.spent;
                const statusColor = getStatusColor(item.spent, item.allocated);
                const progressColor = getProgressColor(item.spent, item.allocated);

                return (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {item.category}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {item.description || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {editingAllocated === item.id ? (
                        <TextField
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => handleSaveAllocated(item.id!)}
                          onKeyDown={(e) => handleKeyDown(e, item.id!)}
                          size="small"
                          autoFocus
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                          sx={{ width: 120 }}
                        />
                      ) : (
                        <Typography
                          variant="body2"
                          onClick={() => handleStartEditAllocated(item.id!, item.allocated)}
                          sx={{ 
                            cursor: isReadOnly ? "default" : "pointer",
                            "&:hover": !isReadOnly ? { color: "primary.main" } : {},
                          }}
                        >
                          ${item.allocated.toLocaleString()}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600} sx={{ color: statusColor }}>
                        ${item.spent.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        ${Math.max(0, remainingAmount).toLocaleString()}
                        {remainingAmount < 0 && (
                          <Typography component="span" variant="body2" color="error.main" sx={{ ml: 0.5 }}>
                            (${Math.abs(remainingAmount).toLocaleString()} over)
                          </Typography>
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box sx={{ flexGrow: 1, maxWidth: 100 }}>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(100, percentage)}
                            color={progressColor}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                        <Typography variant="body2" fontWeight={600} sx={{ color: statusColor, minWidth: 45, textAlign: "right" }}>
                          {percentage.toFixed(0)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    {!isReadOnly && (
                      <TableCell align="center">
                        <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEditModal(item)}
                            sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(item.id!)}
                            sx={{ color: "text.secondary", "&:hover": { color: "error.main" } }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}

              {/* Totals Row */}
              {budgetItems.length > 0 && (
                <TableRow sx={{ bgcolor: "#F5F5F5" }}>
                  <TableCell colSpan={2}>
                    <Typography variant="body2" fontWeight={700}>
                      Total
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={700}>
                      ${totalAllocated.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={700}>
                      ${totalSpent.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={700}>
                      ${Math.max(0, totalAllocated - totalSpent).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box sx={{ flexGrow: 1, maxWidth: 100 }}>
                        <LinearProgress
                          variant="determinate"
                          value={totalAllocated > 0 ? Math.min(100, (totalSpent / totalAllocated) * 100) : 0}
                          color="primary"
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                      <Typography variant="body2" fontWeight={700} sx={{ minWidth: 45, textAlign: "right" }}>
                        {totalAllocated > 0 ? ((totalSpent / totalAllocated) * 100).toFixed(0) : 0}%
                      </Typography>
                    </Box>
                  </TableCell>
                  {!isReadOnly && <TableCell />}
                </TableRow>
              )}

              {/* Empty State */}
              {budgetItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={!isReadOnly ? 7 : 6} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      No budget categories yet. Click "Add Category" to get started.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Edit/Create Category Modal */}
      <Dialog open={showEditModal} onClose={handleCloseEditModal} maxWidth="sm" fullWidth>
        <DialogTitle>{isCreating ? "Add Budget Category" : "Edit Budget Category"}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
          <FormControl fullWidth>
                <TextField
                    label="Shopping Category"
                    value={modalCategory}
                    onChange={(e) => setModalCategory(e.target.value)}
                    placeholder="Enter a category"
                    fullWidth
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    Enter the shopping category this budget item tracks
                </Typography>
            </FormControl>

            <TextField
              label="Description"
              value={modalDescription}
              onChange={(e) => setModalDescription(e.target.value)}
              fullWidth
              multiline
              rows={2}
              placeholder="e.g., Catering, decorations, venue rental..."
            />

            <TextField
              label="Allocated Amount"
              type="number"
              value={modalAllocated}
              onChange={(e) => setModalAllocated(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />

            {editingItem && (
              <>
                <Paper sx={{ p: 2, bgcolor: "#F5F5F5" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Current Spent:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      ${editingItem.spent.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">
                      Remaining:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      ${Math.max(0, parseFloat(modalAllocated || "0") - editingItem.spent).toLocaleString()}
                    </Typography>
                  </Box>
                </Paper>

                <Alert severity="info" icon={<ShoppingCart />}>
                  <Typography variant="caption">
                    <strong>Note:</strong> The "Spent" amount is automatically calculated from items in the selected shopping category and cannot be edited manually.
                  </Typography>
                </Alert>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={handleCloseEditModal} sx={{ textTransform: "none" }} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSaveModal} variant="contained" sx={{ textTransform: "none" }} disabled={isSaving}>
            {isSaving ? "Saving..." : isCreating ? "Create Category" : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BudgetTab;