import React, { useState, useEffect } from "react";
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
  Chip,
  IconButton,
  Collapse,
  Grid,
  Card,
  CardContent,
  LinearProgress,
} from "@mui/material";
import {
  Add,
  Edit,
  KeyboardArrowDown,
  KeyboardArrowRight,
  ShoppingCart,
  CheckCircle,
  LocalShipping,
  Cancel as CancelIcon,
  Pending,
  Error as ErrorIcon,
} from "@mui/icons-material";

import ShoppingItemModal from "./modals/ShoppingItemModal";
import { ShoppingItem, Activity, BudgetItem } from "@/types/eventPlan";

interface ShoppingTabProps {
  event_id: string;
  shoppingItems: ShoppingItem[];
  budgetItems: BudgetItem[];
  activities: Activity[];
  isReadOnly: boolean;
  onBudgetChange: () => void;
  fetchShoppingItems: () => void;
}

const ShoppingTab: React.FC<ShoppingTabProps> = ({
  event_id,
  shoppingItems,
  budgetItems,
  activities,
  isReadOnly,
  onBudgetChange,
  fetchShoppingItems
}) => {
  // const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [selectedItem, setSelectedItem] = useState<ShoppingItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchShoppingItems();
  }, [event_id]);


  const toggleCategory = (budgetId: number) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(budgetId)) {
        newSet.delete(budgetId);
      } else {
        newSet.add(budgetId);
      }
      return newSet;
    });
  };

  const handleOpenModal = (item: ShoppingItem | null = null, budgetId?: number) => {
    if (isReadOnly) return;
    setIsCreating(!item);
    setSelectedItem(item || {
      event_id,
      item: "",
      vendor: "",
      unit_cost: 0,
      quantity: 1,
      notes: "",
      activity_id: null,
      link: "",
      budget_id: budgetId || budgetItems[0]?.id || 0,
      status: "pending",
    } as ShoppingItem);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setIsCreating(false);
  };

  const getStatusConfig = (status: ShoppingItem["status"]) => {
    switch (status) {
      case "pending":
        return { label: "Pending", color: "default" as const, icon: <Pending /> };
      case "ordered":
        return { label: "Ordered", color: "info" as const, icon: <LocalShipping /> };
      case "received":
        return { label: "Received", color: "success" as const, icon: <CheckCircle /> };
      case "cancelled":
        return { label: "Cancelled", color: "error" as const, icon: <CancelIcon /> };
    }
  };

  // Group items by budget category
  const itemsByCategory = budgetItems.map((budget) => {
    const items = shoppingItems.filter((item) => item.budget_id === budget.id);
    const total = items.reduce((sum, item) => sum + item.unit_cost * item.quantity, 0);
    const spent = items
      .filter((item) => item.status === "ordered" || item.status === "received")
      .reduce((sum, item) => sum + item.unit_cost * item.quantity, 0);
    const pendingCount = items.filter((item) => item.status === "pending").length;
    const orderedCount = items.filter((item) => item.status === "ordered").length;
    const receivedCount = items.filter((item) => item.status === "received").length;

    return { budget, items, total, spent, pendingCount, orderedCount, receivedCount };
  });

  // Calculate totals
  const grandTotal = itemsByCategory.reduce((sum, cat) => sum + cat.total, 0);
  const grandSpent = itemsByCategory.reduce((sum, cat) => sum + cat.spent, 0);
  const totalItems = shoppingItems.length;
  const totalReceived = shoppingItems.filter((item) => item.status === "received").length;

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header Overview */}
      <Paper sx={{ p: 4, mb: 3, borderRadius: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Shopping List
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#E3F2FD", boxShadow: 0 }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Total Items
                  </Typography>
                  <ShoppingCart sx={{ fontSize: 20, color: "primary.main" }} />
                </Box>
                <Typography variant="h4" fontWeight={700}>
                  {totalItems}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {totalReceived} received
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#F5F5F5", boxShadow: 0 }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Total Planned
                  </Typography>
                  <ShoppingCart sx={{ fontSize: 20, color: "text.secondary" }} />
                </Box>
                <Typography variant="h4" fontWeight={700}>
                  ${grandTotal.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#E8F5E9", boxShadow: 0 }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Committed
                  </Typography>
                  <CheckCircle sx={{ fontSize: 20, color: "success.main" }} />
                </Box>
                <Typography variant="h4" fontWeight={700}>
                  ${grandSpent.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Ordered + Received
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#FFF3E0", boxShadow: 0 }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Remaining
                  </Typography>
                  <Pending sx={{ fontSize: 20, color: "warning.main" }} />
                </Box>
                <Typography variant="h4" fontWeight={700}>
                  ${(grandTotal - grandSpent).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Shopping Categories */}
      {itemsByCategory.map(({ budget, items, total, spent, pendingCount, orderedCount, receivedCount }) => {
        const isExpanded = budget.id !== undefined && expandedCategories.has(budget.id);
        const progress = budget.allocated > 0 ? (spent / budget.allocated) * 100 : 0;

        return (
          <Paper key={budget.id} sx={{ mb: 3, borderRadius: 3, overflow: "hidden" }}>
            {/* Category Header */}
            <Box
              sx={{
                p: 3,
                bgcolor: "#F8F9FA",
                borderBottom: "1px solid #E0E0E0",
                cursor: "pointer",
              }}
              onClick={() => budget.id !== undefined && toggleCategory(budget.id)}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                    <IconButton size="small" sx={{ color: "text.secondary" }}>
                      {isExpanded ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
                    </IconButton>
                    <Typography variant="h6" fontWeight={600}>
                      {budget.category}
                    </Typography>
                    {items.length > 0 && (
                      <Box sx={{ display: "flex", gap: 1 }}>
                        {pendingCount > 0 && (
                          <Chip label={`${pendingCount} pending`} size="small" color="default" />
                        )}
                        {orderedCount > 0 && (
                          <Chip label={`${orderedCount} ordered`} size="small" color="info" />
                        )}
                        {receivedCount > 0 && (
                          <Chip label={`${receivedCount} received`} size="small" color="success" />
                        )}
                      </Box>
                    )}
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ ml: 6, mb: 2 }}>
                    {budget.description}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 3, ml: 6, fontSize: 14, color: "text.secondary" }}>
                    <span>
                      Budget: <strong style={{ color: "#000" }}>${budget.allocated.toLocaleString()}</strong>
                    </span>
                    <span>
                      Planned: <strong style={{ color: "#000" }}>${total.toLocaleString()}</strong>
                    </span>
                    <span>
                      Committed: <strong style={{ color: spent > budget.allocated ? "#d32f2f" : "#2e7d32" }}>
                        ${spent.toLocaleString()}
                      </strong>
                    </span>
                  </Box>

                  {budget.allocated > 0 && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, ml: 6, mt: 2 }}>
                      <Box sx={{ flexGrow: 1, maxWidth: 400 }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, progress)}
                          color={progress >= 100 ? "error" : progress >= 80 ? "warning" : "success"}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                      <Typography variant="body2" fontWeight={600} sx={{ minWidth: 60 }}>
                        {progress.toFixed(0)}% of budget
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenModal(null, budget.id);
                  }}
                  disabled={isReadOnly}
                  sx={{ textTransform: "none" }}
                >
                  Add Item
                </Button>
              </Box>
            </Box>

            {/* Items Table */}
            <Collapse in={isExpanded}>
              {items.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: "#FAFAFA" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "text.secondary" }}>
                          Status
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "text.secondary" }}>
                          Item
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "text.secondary" }}>
                          Vendor
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "text.secondary" }}>
                          Unit Cost
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "text.secondary" }}>
                          Qty
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "text.secondary" }}>
                          Total
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "text.secondary" }}>
                          Activity
                        </TableCell>
                        {!isReadOnly && (
                          <TableCell align="center" sx={{ fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "text.secondary" }}>
                            Actions
                          </TableCell>
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((item) => {
                        const statusConfig = getStatusConfig(item.status) || {
                          label: "Pending",
                          color: "default" as const,
                          icon: <Pending />
                        };
                        const linkedActivity = activities.find((a) => a.id === item.activity_id);
                        const itemTotal = item.unit_cost * item.quantity;

                        return (
                          <TableRow key={item.id} hover>
                            <TableCell>
                              <Chip
                                label={statusConfig.label}
                                color={statusConfig.color}
                                size="small"
                                icon={statusConfig.icon}
                              />
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {item.item}
                                </Typography>
                                {item.link && (
                                  <Typography
                                    variant="caption"
                                    component="a"
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{ color: "primary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                                  >
                                    View product →
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{item.vendor}</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2">
                                {new Intl.NumberFormat("en-US", {
                                  style: "currency",
                                  currency: "USD",
                                }).format(item.unit_cost || 0)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body2" fontWeight={600}>
                                {item.quantity}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                variant="body2"
                                fontWeight={700}
                                sx={{
                                  color: item.status === "ordered" || item.status === "received" ? "success.main" : "text.primary",
                                }}
                              >
                                ${itemTotal.toFixed(2)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {linkedActivity ? (
                                <Chip label={linkedActivity.name} size="small" variant="outlined" />
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  —
                                </Typography>
                              )}
                            </TableCell>
                            {!isReadOnly && (
                              <TableCell align="center">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenModal(item)}
                                  sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ p: 6, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    No items yet. Click "Add Item" to get started.
                  </Typography>
                </Box>
              )}
            </Collapse>
          </Paper>
        );
      })}

      {budgetItems.length === 0 && (
        <Paper sx={{ p: 6, textAlign: "center", borderRadius: 3 }}>
          <Typography variant="body2" color="text.secondary">
            No budget categories found. Add categories in the Budget tab first.
          </Typography>
        </Paper>
      )}

      {/* Shopping Item Modal */}
      {showModal && selectedItem && (
        <ShoppingItemModal
          item={selectedItem}
          budgetItems={budgetItems}
          activities={activities}
          isReadOnly={isReadOnly}
          isCreating={isCreating}
          onClose={handleCloseModal}
          fetchShoppingItems={fetchShoppingItems}
          onBudgetChange={onBudgetChange}
        />
      )}
    </Box>
  );
};

export default ShoppingTab;