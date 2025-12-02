import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from "@mui/material";
import {
  Close,
  Print,
  CalendarToday,
  LocationOn,
  People,
  AttachMoney,
} from "@mui/icons-material";
import { EventPlan } from "@/types/eventPlan";

interface EventReportModalProps {
  open: boolean;
  onClose: () => void;
  eventPlan: EventPlan;
}

const EventReportModal: React.FC<EventReportModalProps> = ({ open, onClose, eventPlan }) => {
  const { event_basics, activities, schedule_items, shopping_items, tasks, budget_items } = eventPlan;
  const contentRef = useRef<HTMLDivElement>(null);

  // Report customization options
  const [sections, setSections] = useState({
    overview: true,
    schedule: true,
    activities: true,
    budget: true,
    shopping: true,
    tasks: true,
  });

  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = contentRef.current?.innerHTML || '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${event_basics.name} - Event Report</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              padding: 40px;
              font-size: 12pt;
              line-height: 1.6;
              color: #1F2937;
            }
            h1 {
              font-size: 28pt;
              font-weight: 700;
              margin-bottom: 12px;
              color: #1F2937;
            }
            h2 {
              font-size: 18pt;
              font-weight: 600;
              margin-top: 24px;
              margin-bottom: 12px;
              color: #8B5CF6;
              page-break-after: avoid;
            }
            h3 {
              font-size: 14pt;
              font-weight: 600;
              margin-bottom: 8px;
            }
            p {
              margin-bottom: 8px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 16px 0;
              page-break-inside: avoid;
            }
            th, td {
              border: 1px solid #E5E7EB;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #F9FAFB;
              font-weight: 600;
            }
            .chip {
              display: inline-block;
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 10pt;
              background-color: #E9D5FF;
            }
            .section {
              page-break-inside: avoid;
              margin-bottom: 32px;
            }
            .activity-box {
              background-color: #F9FAFB;
              padding: 16px;
              margin-bottom: 16px;
              border-radius: 4px;
              page-break-inside: avoid;
            }
            hr {
              border: none;
              border-top: 1px solid #E5E7EB;
              margin: 16px 0;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 16px;
              margin-bottom: 16px;
            }
            .grid-item {
              margin-bottom: 12px;
            }
            .label {
              font-weight: 600;
              color: #6B7280;
              font-size: 10pt;
              margin-bottom: 4px;
            }
            .icon {
              display: none;
            }
            .print-hide {
              display: none;
            }
            .footer {
              margin-top: 32px;
              padding-top: 16px;
              border-top: 1px solid #E5E7EB;
              text-align: center;
              color: #6B7280;
              font-size: 10pt;
            }
            @media print {
              body { padding: 20px; }
              .section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  // Helper functions
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getActivityName = (activityId: number | null) => {
    if (!activityId) return "—";
    const activity = activities.find((a) => a.id === activityId);
    return activity?.name || "Unknown";
  };

  const totalBudgetAllocated = budget_items.reduce((sum, item) => sum + item.allocated, 0);
  const totalBudgetSpent = budget_items.reduce((sum, item) => sum + item.spent, 0);
  const totalShoppingCost = shopping_items.reduce((sum, item) => sum + item.unit_cost * item.quantity, 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { maxHeight: "90vh" }
      }}
    >
      <Box sx={{ p: 3, bgcolor: "#F5F3FF", borderBottom: "1px solid #E9D5FF" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h5" fontWeight={700}>
            Generate Event Report
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>

        {/* Section Toggles */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Select sections to include:
          </Typography>
          <FormGroup row>
            <FormControlLabel
              control={<Checkbox checked={sections.overview} onChange={(e) => setSections({ ...sections, overview: e.target.checked })} />}
              label="Overview"
            />
            <FormControlLabel
              control={<Checkbox checked={sections.schedule} onChange={(e) => setSections({ ...sections, schedule: e.target.checked })} />}
              label="Schedule"
            />
            <FormControlLabel
              control={<Checkbox checked={sections.activities} onChange={(e) => setSections({ ...sections, activities: e.target.checked })} />}
              label="Activities"
            />
            <FormControlLabel
              control={<Checkbox checked={sections.budget} onChange={(e) => setSections({ ...sections, budget: e.target.checked })} />}
              label="Budget"
            />
            <FormControlLabel
              control={<Checkbox checked={sections.shopping} onChange={(e) => setSections({ ...sections, shopping: e.target.checked })} />}
              label="Shopping"
            />
            <FormControlLabel
              control={<Checkbox checked={sections.tasks} onChange={(e) => setSections({ ...sections, tasks: e.target.checked })} />}
              label="Tasks"
            />
          </FormGroup>
        </Box>

        {/* Action Button */}
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" startIcon={<Print />} onClick={handlePrint} fullWidth>
            Print Report
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center", mt: 1 }}>
            Use your browser's print dialog to save as PDF
          </Typography>
        </Box>
      </Box>

      <DialogContent sx={{ p: 4 }}>
        {/* Report Content */}
        <Box ref={contentRef}>
          {/* Header */}
          <Box className="section" sx={{ mb: 4, pb: 3, borderBottom: "2px solid #8B5CF6" }}>
            <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
              {event_basics.name}
            </Typography>
            {event_basics.description && (
              <Typography variant="body1" color="text.secondary" paragraph>
                {event_basics.description}
              </Typography>
            )}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {event_basics.keywords?.map((keyword, idx) => (
                <span key={idx} className="chip">{keyword}</span>
              ))}
            </Box>
          </Box>

          {/* Overview Section */}
          {sections.overview && (
            <Box className="section" sx={{ mb: 4 }}>
              <Typography variant="h5" component="h2" fontWeight={600} gutterBottom sx={{ color: "#8B5CF6" }}>
                Event Overview
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box className="grid" sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
                <Box className="grid-item">
                  <Box className="label" sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                    <CalendarToday className="print-hide" sx={{ fontSize: 14, color: "#8B5CF6" }} />
                    <Typography variant="body2" fontWeight={600} color="text.secondary">
                      Date & Time
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    {formatDate(event_basics.start_date)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {event_basics.start_time} - {event_basics.end_time}
                  </Typography>
                </Box>

                <Box className="grid-item">
                  <Box className="label" sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                    <LocationOn className="print-hide" sx={{ fontSize: 14, color: "#8B5CF6" }} />
                    <Typography variant="body2" fontWeight={600} color="text.secondary">
                      Location
                    </Typography>
                  </Box>
                  <Typography variant="body2">{event_basics.location || "TBD"}</Typography>
                </Box>

                <Box className="grid-item">
                  <Box className="label" sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                    <People className="print-hide" sx={{ fontSize: 14, color: "#8B5CF6" }} />
                    <Typography variant="body2" fontWeight={600} color="text.secondary">
                      Expected Attendees
                    </Typography>
                  </Box>
                  <Typography variant="body2">{event_basics.attendees} people</Typography>
                  {event_basics.registration_required && (
                    <Typography variant="caption" color="info.main">Registration required</Typography>
                  )}
                </Box>

                <Box className="grid-item">
                  <Box className="label" sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                    <AttachMoney className="print-hide" sx={{ fontSize: 14, color: "#8B5CF6" }} />
                    <Typography variant="body2" fontWeight={600} color="text.secondary">
                      Budget
                    </Typography>
                  </Box>
                  <Typography variant="body2">${event_basics.budget.toLocaleString()}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    ${totalBudgetSpent.toLocaleString()} spent
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* Schedule Section */}
          {sections.schedule && schedule_items.length > 0 && (
            <Box className="section" sx={{ mb: 4 }}>
              <Typography variant="h5" component="h2" fontWeight={600} gutterBottom sx={{ color: "#8B5CF6" }}>
                Event Schedule
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#F9FAFB" }}>
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Activity</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {schedule_items
                      .sort((a, b) => new Date(a.start_date + " " + a.start_time).getTime() - new Date(b.start_date + " " + b.start_time).getTime())
                      .map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            {formatDateShort(item.start_date)}
                            {item.end_date && item.end_date !== item.start_date && (
                              <span> - {formatDateShort(item.end_date)}</span>
                            )}
                          </TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            {item.start_time} - {item.end_time}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {getActivityName(item.activity_id)}
                            </Typography>
                            {item.notes && (
                              <Typography variant="caption" color="text.secondary">
                                {item.notes}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>{item.location || "—"}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Activities Section */}
          {sections.activities && activities.length > 0 && (
            <Box className="section" sx={{ mb: 4 }}>
              <Typography variant="h5" component="h2" fontWeight={600} gutterBottom sx={{ color: "#8B5CF6" }}>
                Activity Details
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {activities.map((activity) => (
                <Box key={activity.id} className="activity-box" sx={{ mb: 3, p: 2, bgcolor: "#F9FAFB", borderRadius: 1 }}>
                  <Typography variant="h6" component="h3" fontWeight={600} gutterBottom>
                    {activity.name}
                  </Typography>
                  {activity.description && (
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {activity.description}
                    </Typography>
                  )}
                  {activity.staffing_needs && activity.staffing_needs.length > 0 && (
                    <Box>
                      <Typography variant="body2" fontWeight={600} gutterBottom>
                        Staff Required:
                      </Typography>
                      {activity.staffing_needs.map((need) => (
                        <Typography key={need.id} variant="body2" color="text.secondary">
                          • {need.count} × {need.responsibility}
                        </Typography>
                      ))}
                    </Box>
                  )}
                  {activity.notes && (
                    <Box sx={{ mt: 2, p: 1.5, bgcolor: "#fff", borderRadius: 1, borderLeft: "3px solid #8B5CF6" }}>
                      <Typography variant="body2" fontWeight={600} gutterBottom>
                        Notes:
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-wrap" }}>
                        {activity.notes}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          )}

          {/* Budget Section */}
          {sections.budget && budget_items.length > 0 && (
            <Box className="section" sx={{ mb: 4 }}>
              <Typography variant="h5" component="h2" fontWeight={600} gutterBottom sx={{ color: "#8B5CF6" }}>
                Budget Breakdown
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#F9FAFB" }}>
                      <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Allocated</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Spent</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Remaining</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {budget_items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell align="right">${item.allocated.toLocaleString()}</TableCell>
                        <TableCell align="right">${item.spent.toLocaleString()}</TableCell>
                        <TableCell align="right">${Math.max(0, item.allocated - item.spent).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: "#F9FAFB" }}>
                      <TableCell colSpan={2} sx={{ fontWeight: 700 }}>Total</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>${totalBudgetAllocated.toLocaleString()}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>${totalBudgetSpent.toLocaleString()}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        ${Math.max(0, totalBudgetAllocated - totalBudgetSpent).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Shopping Section */}
          {sections.shopping && shopping_items.length > 0 && (
            <Box className="section" sx={{ mb: 4 }}>
              <Typography variant="h5" component="h2" fontWeight={600} gutterBottom sx={{ color: "#8B5CF6" }}>
                Shopping List
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#F9FAFB" }}>
                      <TableCell sx={{ fontWeight: 600 }}>Item</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Vendor</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Activity</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Qty</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Unit Cost</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Total</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {shopping_items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.item}</TableCell>
                        <TableCell>{item.vendor}</TableCell>
                        <TableCell>{getActivityName(item.activity_id)}</TableCell>
                        <TableCell align="center">{item.quantity}</TableCell>
                        <TableCell align="right">${item.unit_cost.toFixed(2)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          ${(item.unit_cost * item.quantity).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <span className="chip">{item.status}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: "#F9FAFB" }}>
                      <TableCell colSpan={5} sx={{ fontWeight: 700 }}>Total Shopping Cost</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        ${totalShoppingCost.toFixed(2)}
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Tasks Section */}
          {sections.tasks && tasks.length > 0 && (
            <Box className="section" sx={{ mb: 4 }}>
              <Typography variant="h5" component="h2" fontWeight={600} gutterBottom sx={{ color: "#8B5CF6" }}>
                Task List
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#F9FAFB" }}>
                      <TableCell sx={{ fontWeight: 600 }}>Task</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Activity</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Assignee</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tasks
                      .sort((a, b) => {
                        if (a.status === "done" && b.status !== "done") return 1;
                        if (a.status !== "done" && b.status === "done") return -1;
                        return 0;
                      })
                      .map((task) => (
                        <TableRow key={task.id} sx={{ opacity: task.status === "done" ? 0.6 : 1 }}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {task.title}
                            </Typography>
                            {task.description && (
                              <Typography variant="caption" color="text.secondary">
                                {task.description}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>{getActivityName(task.activity_id)}</TableCell>
                          <TableCell>{task.assignee_name || "—"}</TableCell>
                          <TableCell>{task.due_date ? formatDateShort(task.due_date) : "—"}</TableCell>
                          <TableCell>
                            <span className="chip">{task.priority}</span>
                          </TableCell>
                          <TableCell>
                            <span className="chip">{task.status.replace("_", " ")}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Footer */}
          <Box className="footer" sx={{ mt: 4, pt: 3, borderTop: "1px solid #E5E7EB", textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              Report generated on {new Date().toLocaleString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true // Use 12-hour format
              })}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default EventReportModal;