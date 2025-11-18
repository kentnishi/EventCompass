"use client";

import React, { useState } from 'react';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import EditIcon from '@mui/icons-material/Edit';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RefreshIcon from '@mui/icons-material/Refresh';
import StarIcon from '@mui/icons-material/Star';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Editor Screen Component
const EditorScreen = ({ eventPlan, activeTab, setActiveTab, updatePlan, updateActivity, addActivity, deleteActivity, updateSchedule, addScheduleItem, deleteScheduleItem, updateShoppingItem, addShoppingItem, deleteShoppingItem, updateTask, addTask, deleteTask, updateBudgetItem, totalBudget, status, onStatusChange, isReadOnly }) => {
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'activities', label: 'Activities' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'shopping', label: 'Shopping' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'budget', label: 'Budget' }
  ];

  const statusOptions = [
    { value: 'draft', label: 'Draft', color: '#9e9e9e' },
    { value: 'in-progress', label: 'In Progress', color: '#2196f3' },
    { value: 'ready', label: 'Ready', color: '#ff9800' },
    { value: 'completed', label: 'Completed', color: '#4caf50' }
  ];

  const currentStatus = statusOptions.find(s => s.value === status) || statusOptions[0];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#d5dcf1' }}>
      <div style={{ backgroundColor: '#FFF', borderBottom: '1px solid #e0e0e0', padding: '20px 30px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#333', margin: 0 }}>
            {eventPlan.name}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#666' }}>Status:</label>
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              style={{
                padding: '8px 32px 8px 12px',
                fontSize: '0.9rem',
                fontWeight: 600,
                border: `2px solid ${currentStatus.color}`,
                borderRadius: '8px',
                backgroundColor: '#fff',
                color: currentStatus.color,
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#FFF', borderBottom: '1px solid #e0e0e0' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 30px' }}>
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '16px 24px',
                  backgroundColor: 'transparent',
                  color: activeTab === tab.id ? '#6B7FD7' : '#666',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '3px solid #6B7FD7' : '3px solid transparent',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isReadOnly && (
        <div style={{ maxWidth: '1400px', margin: '20px auto 0', padding: '0 30px' }}>
          <div style={{ 
            backgroundColor: '#fff3cd', 
            border: '1px solid #ffc107',
            borderRadius: '8px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#856404'
          }}>
            <CheckCircleIcon style={{ width: '20px', height: '20px' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
              This event is marked as <strong>{currentStatus.label}</strong> and is in read-only mode. Change status to Draft to edit.
            </span>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '30px' }}>
        {activeTab === 'overview' && (
          <div style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4a5676', marginBottom: '8px' }}>
                  Event Name
                </label>
                <input
                  type="text"
                  value={eventPlan.name}
                  onChange={(e) => updatePlan('name', e.target.value)}
                  disabled={isReadOnly}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    color: '#4a5676',
                    fontWeight: 500,
                    backgroundColor: isReadOnly ? '#f5f5f5' : '#fff',
                    cursor: isReadOnly ? 'not-allowed' : 'text'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4a5676', marginBottom: '8px' }}>
                  Description
                </label>
                <textarea
                  value={eventPlan.description}
                  onChange={(e) => updatePlan('description', e.target.value)}
                  disabled={isReadOnly}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    color: '#4a5676',
                    fontWeight: 500,
                    resize: 'vertical',
                    minHeight: '120px',
                    backgroundColor: isReadOnly ? '#f5f5f5' : '#fff',
                    cursor: isReadOnly ? 'not-allowed' : 'text'
                  }}
                />
              </div>
              {!isReadOnly && (
                <button style={{
                  alignSelf: 'flex-start',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  backgroundColor: '#f8f9ff',
                  color: '#6B7FD7',
                  border: '1px solid #6B7FD7',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}>
                  <AutoAwesomeIcon style={{ width: '16px', height: '16px' }} />
                  AI: Improve Description
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'activities' && (
          <div style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#333', margin: 0 }}>Activities</h3>
              {!isReadOnly && (
                <button 
                  onClick={addActivity}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    backgroundColor: '#6B7FD7',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <AddIcon style={{ width: '16px', height: '16px' }} />
                  Add Activity
                </button>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {eventPlan.activities.map((activity, i) => (
                <div key={i} style={{ padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: isReadOnly ? '#f9f9f9' : '#fff' }}>
                  <input
                    type="text"
                    value={activity.name}
                    onChange={(e) => updateActivity(i, 'name', e.target.value)}
                    placeholder="Activity name"
                    disabled={isReadOnly}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      marginBottom: '8px',
                      backgroundColor: isReadOnly ? '#f5f5f5' : '#fff',
                      cursor: isReadOnly ? 'not-allowed' : 'text'
                    }}
                  />
                  <textarea
                    value={activity.description}
                    onChange={(e) => updateActivity(i, 'description', e.target.value)}
                    placeholder="Description"
                    disabled={isReadOnly}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: '0.95rem',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      minHeight: '60px',
                      resize: 'vertical',
                      backgroundColor: isReadOnly ? '#f5f5f5' : '#fff',
                      cursor: isReadOnly ? 'not-allowed' : 'text'
                    }}
                  />
                  {!isReadOnly && (
                    <button 
                      onClick={() => deleteActivity(i)}
                      style={{
                        marginTop: '8px',
                        padding: '6px 12px',
                        backgroundColor: 'transparent',
                        color: '#f44336',
                        border: '1px solid #f44336',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#333', margin: 0 }}>Schedule</h3>
              {!isReadOnly && (
                <button 
                  onClick={addScheduleItem}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    backgroundColor: '#6B7FD7',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <AddIcon style={{ width: '16px', height: '16px' }} />
                  Add Time Slot
                </button>
              )}
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#666' }}>Time</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#666' }}>Duration</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#666' }}>Activity</th>
                    {!isReadOnly && <th style={{ padding: '12px' }}></th>}
                  </tr>
                </thead>
                <tbody>
                  {eventPlan.schedule.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={{ padding: '12px' }}>
                        <input
                          type="text"
                          value={item.time}
                          onChange={(e) => updateSchedule(i, 'time', e.target.value)}
                          placeholder="7:00 PM"
                          disabled={isReadOnly}
                          style={{ 
                            padding: '8px', 
                            fontSize: '0.9rem', 
                            border: '1px solid #ddd', 
                            borderRadius: '6px', 
                            width: '100px',
                            backgroundColor: isReadOnly ? '#f5f5f5' : '#fff',
                            cursor: isReadOnly ? 'not-allowed' : 'text'
                          }}
                        />
                      </td>
                      <td style={{ padding: '12px' }}>
                        <input
                          type="text"
                          value={item.duration}
                          onChange={(e) => updateSchedule(i, 'duration', e.target.value)}
                          placeholder="30 min"
                          disabled={isReadOnly}
                          style={{ 
                            padding: '8px', 
                            fontSize: '0.9rem', 
                            border: '1px solid #ddd', 
                            borderRadius: '6px', 
                            width: '100px',
                            backgroundColor: isReadOnly ? '#f5f5f5' : '#fff',
                            cursor: isReadOnly ? 'not-allowed' : 'text'
                          }}
                        />
                      </td>
                      <td style={{ padding: '12px' }}>
                        <select
                          value={item.activityId || ''}
                          onChange={(e) => updateSchedule(i, 'activityId', e.target.value ? parseInt(e.target.value) : null)}
                          disabled={isReadOnly}
                          style={{ 
                            padding: '8px', 
                            fontSize: '0.9rem', 
                            border: '1px solid #ddd', 
                            borderRadius: '6px', 
                            width: '100%',
                            backgroundColor: isReadOnly ? '#f5f5f5' : '#fff',
                            cursor: isReadOnly ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <option value="">Select...</option>
                          {eventPlan.activities.map(a => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                          ))}
                        </select>
                      </td>
                      {!isReadOnly && (
                        <td style={{ padding: '12px' }}>
                          <button onClick={() => deleteScheduleItem(i)} style={{ background: 'none', border: 'none', color: '#f44336', cursor: 'pointer' }}>
                            <DeleteIcon style={{ width: '18px', height: '18px' }} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'shopping' && (
          <div style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#333', margin: 0 }}>Shopping List</h3>
              {!isReadOnly && (
                <button 
                  onClick={addShoppingItem}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    backgroundColor: '#6B7FD7',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <AddIcon style={{ width: '16px', height: '16px' }} />
                  Add Item
                </button>
              )}
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#666' }}>Item</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#666' }}>Qty</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#666' }}>Category</th>
                    {!isReadOnly && <th style={{ padding: '12px' }}></th>}
                  </tr>
                </thead>
                <tbody>
                  {eventPlan.shopping.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={{ padding: '12px' }}>
                        <input
                          type="text"
                          value={item.item}
                          onChange={(e) => updateShoppingItem(i, 'item', e.target.value)}
                          placeholder="Item name"
                          disabled={isReadOnly}
                          style={{ 
                            padding: '8px', 
                            fontSize: '0.9rem', 
                            border: '1px solid #ddd', 
                            borderRadius: '6px', 
                            width: '100%',
                            backgroundColor: isReadOnly ? '#f5f5f5' : '#fff',
                            cursor: isReadOnly ? 'not-allowed' : 'text'
                          }}
                        />
                      </td>
                      <td style={{ padding: '12px' }}>
                        <input
                          type="text"
                          value={item.quantity}
                          onChange={(e) => updateShoppingItem(i, 'quantity', e.target.value)}
                          placeholder="Qty"
                          disabled={isReadOnly}
                          style={{ 
                            padding: '8px', 
                            fontSize: '0.9rem', 
                            border: '1px solid #ddd', 
                            borderRadius: '6px', 
                            width: '80px',
                            backgroundColor: isReadOnly ? '#f5f5f5' : '#fff',
                            cursor: isReadOnly ? 'not-allowed' : 'text'
                          }}
                        />
                      </td>
                      <td style={{ padding: '12px' }}>
                        <select
                          value={item.category}
                          onChange={(e) => updateShoppingItem(i, 'category', e.target.value)}
                          disabled={isReadOnly}
                          style={{ 
                            padding: '8px', 
                            fontSize: '0.9rem', 
                            border: '1px solid #ddd', 
                            borderRadius: '6px', 
                            width: '150px',
                            backgroundColor: isReadOnly ? '#f5f5f5' : '#fff',
                            cursor: isReadOnly ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <option value="">Select...</option>
                          <option value="Food">Food</option>
                          <option value="Materials">Materials</option>
                          <option value="Equipment">Equipment</option>
                        </select>
                      </td>
                      {!isReadOnly && (
                        <td style={{ padding: '12px' }}>
                          <button onClick={() => deleteShoppingItem(i)} style={{ background: 'none', border: 'none', color: '#f44336', cursor: 'pointer' }}>
                            <DeleteIcon style={{ width: '18px', height: '18px' }} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#333', margin: 0 }}>Tasks</h3>
              {!isReadOnly && (
                <button 
                  onClick={addTask}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    backgroundColor: '#6B7FD7',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <AddIcon style={{ width: '16px', height: '16px' }} />
                  Add Task
                </button>
              )}
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#666' }}>Task</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#666' }}>Assigned</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#666' }}>Deadline</th>
                    {!isReadOnly && <th style={{ padding: '12px' }}></th>}
                  </tr>
                </thead>
                <tbody>
                  {eventPlan.tasks.map((task, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={{ padding: '12px' }}>
                        <input
                          type="text"
                          value={task.task}
                          onChange={(e) => updateTask(i, 'task', e.target.value)}
                          placeholder="Task description"
                          disabled={isReadOnly}
                          style={{ 
                            padding: '8px', 
                            fontSize: '0.9rem', 
                            border: '1px solid #ddd', 
                            borderRadius: '6px', 
                            width: '100%',
                            backgroundColor: isReadOnly ? '#f5f5f5' : '#fff',
                            cursor: isReadOnly ? 'not-allowed' : 'text'
                          }}
                        />
                      </td>
                      <td style={{ padding: '12px' }}>
                        <input
                          type="text"
                          value={task.assignedTo}
                          onChange={(e) => updateTask(i, 'assignedTo', e.target.value)}
                          placeholder="Name"
                          disabled={isReadOnly}
                          style={{ 
                            padding: '8px', 
                            fontSize: '0.9rem', 
                            border: '1px solid #ddd', 
                            borderRadius: '6px', 
                            width: '120px',
                            backgroundColor: isReadOnly ? '#f5f5f5' : '#fff',
                            cursor: isReadOnly ? 'not-allowed' : 'text'
                          }}
                        />
                      </td>
                      <td style={{ padding: '12px' }}>
                        <input
                          type="text"
                          value={task.deadline}
                          onChange={(e) => updateTask(i, 'deadline', e.target.value)}
                          placeholder="Date"
                          disabled={isReadOnly}
                          style={{ 
                            padding: '8px', 
                            fontSize: '0.9rem', 
                            border: '1px solid #ddd', 
                            borderRadius: '6px', 
                            width: '120px',
                            backgroundColor: isReadOnly ? '#f5f5f5' : '#fff',
                            cursor: isReadOnly ? 'not-allowed' : 'text'
                          }}
                        />
                      </td>
                      {!isReadOnly && (
                        <td style={{ padding: '12px' }}>
                          <button onClick={() => deleteTask(i)} style={{ background: 'none', border: 'none', color: '#f44336', cursor: 'pointer' }}>
                            <DeleteIcon style={{ width: '18px', height: '18px' }} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'budget' && (
          <div style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#333', marginBottom: '24px' }}>Budget</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#666' }}>Category</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#666' }}>Estimated</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#666' }}>Actual</th>
                  </tr>
                </thead>
                <tbody>
                  {eventPlan.budget.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={{ padding: '12px', fontWeight: 600, color: '#333' }}>{item.category}</td>
                      <td style={{ padding: '12px' }}>
                        <input
                          type="number"
                          value={item.estimated}
                          onChange={(e) => updateBudgetItem(i, 'estimated', parseInt(e.target.value) || 0)}
                          disabled={isReadOnly}
                          style={{ 
                            padding: '8px', 
                            fontSize: '0.9rem', 
                            border: '1px solid #ddd', 
                            borderRadius: '6px', 
                            width: '100px',
                            backgroundColor: isReadOnly ? '#f5f5f5' : '#fff',
                            cursor: isReadOnly ? 'not-allowed' : 'text'
                          }}
                        />
                      </td>
                      <td style={{ padding: '12px' }}>
                        <input
                          type="number"
                          value={item.actual}
                          onChange={(e) => updateBudgetItem(i, 'actual', parseInt(e.target.value) || 0)}
                          disabled={isReadOnly}
                          style={{ 
                            padding: '8px', 
                            fontSize: '0.9rem', 
                            border: '1px solid #ddd', 
                            borderRadius: '6px', 
                            width: '100px',
                            backgroundColor: isReadOnly ? '#f5f5f5' : '#fff',
                            cursor: isReadOnly ? 'not-allowed' : 'text'
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                  <tr style={{ backgroundColor: '#f5f5f5', fontWeight: 700 }}>
                    <td style={{ padding: '12px' }}>Total</td>
                    <td style={{ padding: '12px' }}>${totalBudget}</td>
                    <td style={{ padding: '12px' }}>${eventPlan.budget.reduce((s, i) => s + i.actual, 0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorScreen;