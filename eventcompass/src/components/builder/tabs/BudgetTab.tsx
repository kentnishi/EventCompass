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
} from "@mui/icons-material";

interface BudgetItem {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  shoppingListId?: string;
}

interface BudgetTabProps {
  budgetItems: BudgetItem[];
  isReadOnly: boolean;
  updateBudgetItem: (id: string, field: "allocated" | "spent", value: number) => void;
  updateCategory: (id: string, category: string) => void;
  deleteBudgetItem: (id: string) => void;
  totalBudget: number;
  shoppingCategories: string[];
}

const BudgetTab: React.FC<BudgetTabProps> = ({
  budgetItems,
  isReadOnly,
  updateBudgetItem,
  updateCategory,
  deleteBudgetItem,
  totalBudget,
  shoppingCategories,
}) => {
  const [editingAllocated, setEditingAllocated] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BudgetItem | null>(null);
  const [modalCategory, setModalCategory] = useState("");
  const [modalAllocated, setModalAllocated] = useState("");

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

  const handleStartEditAllocated = (itemId: string, currentValue: number) => {
    if (isReadOnly) return;
    setEditingAllocated(itemId);
    setEditValue(currentValue.toString());
  };

  const handleSaveAllocated = (itemId: string) => {
    const newValue = parseFloat(editValue);
    if (!isNaN(newValue) && newValue >= 0) {
      updateBudgetItem(itemId, "allocated", newValue);
    }
    setEditingAllocated(null);
    setEditValue("");
  };

  const handleCancelEdit = () => {
    setEditingAllocated(null);
    setEditValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent, itemId: string) => {
    if (e.key === "Enter") {
      handleSaveAllocated(itemId);
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const handleOpenEditModal = (item: BudgetItem) => {
    if (isReadOnly) return;
    setEditingCategory(item);
    setModalCategory(item.category);
    setModalAllocated(item.allocated.toString());
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingCategory(null);
    setModalCategory("");
    setModalAllocated("");
  };

  const handleSaveModal = () => {
    if (!editingCategory) return;
    
    const newAllocated = parseFloat(modalAllocated);
    if (!isNaN(newAllocated) && newAllocated >= 0) {
      updateBudgetItem(editingCategory.id, "allocated", newAllocated);
    }
    
    if (modalCategory !== editingCategory.category) {
      updateCategory(editingCategory.id, modalCategory);
    }
    
    handleCloseEditModal();
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header Overview */}
      <Paper sx={{ p: 4, mb: 3, borderRadius: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Budget Overview
          </Typography>
          <Button
            variant="text"
            color="primary"
            disabled={isReadOnly}
            sx={{ textTransform: "none" }}
          >
            Edit Total Budget
          </Button>
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
              variant="text"
              color="primary"
              disabled={isReadOnly}
              sx={{ textTransform: "none" }}
            >
              + Add Category
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
                    <TableCell align="right">
                      {editingAllocated === item.id ? (
                        <TextField
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => handleSaveAllocated(item.id)}
                          onKeyDown={(e) => handleKeyDown(e, item.id)}
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
                          onClick={() => handleStartEditAllocated(item.id, item.allocated)}
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
                            onClick={() => deleteBudgetItem(item.id)}
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
              <TableRow sx={{ bgcolor: "#F5F5F5" }}>
                <TableCell>
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
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Edit Category Modal */}
      <Dialog open={showEditModal} onClose={handleCloseEditModal} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Budget Category</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Shopping Category</InputLabel>
              <Select
                value={modalCategory}
                label="Shopping Category"
                onChange={(e) => setModalCategory(e.target.value)}
              >
                {shoppingCategories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                Select which shopping list this budget category tracks
              </Typography>
            </FormControl>

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

            {editingCategory && (
              <>
                <Paper sx={{ p: 2, bgcolor: "#F5F5F5" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Current Spent:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      ${editingCategory.spent.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">
                      Remaining:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      ${Math.max(0, editingCategory.allocated - editingCategory.spent).toLocaleString()}
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
          <Button onClick={handleCloseEditModal} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button onClick={handleSaveModal} variant="contained" sx={{ textTransform: "none" }}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BudgetTab;