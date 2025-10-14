"use client";

import React, { useState } from 'react';
import PersonIcon from '@mui/icons-material/Person';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';

const FIELD_TYPES = [
  { value: 'text', label: 'Short Text' },
  { value: 'textarea', label: 'Long Text' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Dropdown' },
  { value: 'radio', label: 'Multiple Choice' },
  { value: 'checkbox', label: 'Checkboxes' },
];

function FormField({ field, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedLabel, setEditedLabel] = useState(field.label);
  const [editedPlaceholder, setEditedPlaceholder] = useState(field.placeholder || '');
  const [editedRequired, setEditedRequired] = useState(field.required || false);

  const handleSave = () => {
    onUpdate(field.id, {
      ...field,
      label: editedLabel,
      placeholder: editedPlaceholder,
      required: editedRequired,
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div style={{
        backgroundColor: '#FFF',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '12px',
        border: '2px solid #6B7FD7',
      }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{
            fontSize: '0.9rem',
            fontWeight: 600,
            color: '#4a5676',
            marginBottom: '6px',
            display: 'block',
          }}>
            Field Label
          </label>
          <input
            type="text"
            value={editedLabel}
            onChange={(e) => setEditedLabel(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '1rem',
              color: '#4a5676',
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{
            fontSize: '0.9rem',
            fontWeight: 600,
            color: '#4a5676',
            marginBottom: '6px',
            display: 'block',
          }}>
            Placeholder Text
          </label>
          <input
            type="text"
            value={editedPlaceholder}
            onChange={(e) => setEditedPlaceholder(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '1rem',
              color: '#4a5676',
            }}
          />
        </div>

        <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={editedRequired}
            onChange={(e) => setEditedRequired(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <label style={{
            fontSize: '0.9rem',
            fontWeight: 600,
            color: '#4a5676',
          }}>
            Required field
          </label>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleSave}
            style={{
              padding: '8px 20px',
              backgroundColor: '#6B7FD7',
              color: '#FFF',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem',
            }}
          >
            Save
          </button>
          <button
            onClick={() => setIsEditing(false)}
            style={{
              padding: '8px 20px',
              backgroundColor: '#eaecf1',
              color: '#666',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#FFF',
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      border: '1px solid #e0e0e0',
    }}>
      <DragIndicatorIcon style={{ color: '#999', cursor: 'grab' }} />
      
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontSize: '1rem', fontWeight: 600, color: '#4a5676' }}>
            {field.label}
          </span>
          {field.required && (
            <span style={{ color: '#f44336', fontSize: '0.9rem' }}>*</span>
          )}
        </div>
        <span style={{ fontSize: '0.85rem', color: '#888' }}>
          {FIELD_TYPES.find(t => t.value === field.type)?.label}
        </span>
      </div>

      <button
        onClick={() => setIsEditing(true)}
        style={{
          padding: '8px',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <EditIcon style={{ fontSize: '1.2rem', color: '#666' }} />
      </button>

      <button
        onClick={() => onDelete(field.id)}
        style={{
          padding: '8px',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <DeleteOutlineIcon style={{ fontSize: '1.2rem', color: '#f44336' }} />
      </button>
    </div>
  );
}

export default function EventFormBuilder() {
  const [formTitle, setFormTitle] = useState('Event Registration Form');
  const [formDescription, setFormDescription] = useState('Fill out this form to register for the event');
  const [fields, setFields] = useState([
    { id: 1, type: 'text', label: 'Full Name', placeholder: 'Enter your name', required: true },
    { id: 2, type: 'email', label: 'Email Address', placeholder: 'your@email.com', required: true },
  ]);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const addField = (type) => {
    const newField = {
      id: Date.now(),
      type,
      label: `New ${FIELD_TYPES.find(t => t.value === type)?.label} Field`,
      placeholder: '',
      required: false,
    };
    setFields([...fields, newField]);
    setShowAddMenu(false);
  };

  const updateField = (id, updatedField) => {
    setFields(fields.map(f => f.id === id ? updatedField : f));
  };

  const deleteField = (id) => {
    setFields(fields.filter(f => f.id !== id));
  };

  return (
    <div style={{
      padding: '30px',
      backgroundColor: '#d5dcf1',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      maxWidth: '900px',
      margin: '0 auto',
      minHeight: '100vh',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '25px',
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 700,
          color: '#333',
          margin: 0,
        }}>
          Form Builder
          <span style={{ fontSize: '1.5rem', color: '#888', marginLeft: '10px' }}>✏️</span>
        </h1>
      </div>

      {/* Form Settings */}
      <div style={{
        backgroundColor: '#FFF',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
      }}>
        <h3 style={{
          fontSize: '1.1rem',
          fontWeight: 600,
          color: '#333',
          marginBottom: '15px',
        }}>
          Form Settings
        </h3>

        <div style={{ marginBottom: '15px' }}>
          <label style={{
            fontSize: '0.9rem',
            fontWeight: 600,
            color: '#4a5676',
            marginBottom: '6px',
            display: 'block',
          }}>
            Form Title
          </label>
          <input
            type="text"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '1rem',
              color: '#4a5676',
              fontWeight: 600,
            }}
          />
        </div>

        <div>
          <label style={{
            fontSize: '0.9rem',
            fontWeight: 600,
            color: '#4a5676',
            marginBottom: '6px',
            display: 'block',
          }}>
            Form Description
          </label>
          <textarea
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            rows={2}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              resize: 'vertical',
              fontSize: '1rem',
              color: '#4a5676',
            }}
          />
        </div>
      </div>

      {/* Form Fields */}
      <div style={{
        backgroundColor: '#FFF',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px',
        }}>
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: 600,
            color: '#333',
            margin: 0,
          }}>
            Form Fields
          </h3>
          <span style={{
            fontSize: '0.9rem',
            color: '#888',
            backgroundColor: '#f5f5f5',
            padding: '4px 12px',
            borderRadius: '12px',
          }}>
            {fields.length} fields
          </span>
        </div>

        {fields.map((field) => (
          <FormField
            key={field.id}
            field={field}
            onUpdate={updateField}
            onDelete={deleteField}
          />
        ))}

        {/* Add Field Button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            style={{
              width: '100%',
              padding: '16px',
              border: '2px dashed #ccc',
              backgroundColor: '#f9f9f9',
              color: '#666',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>+</span>
            Add Field
          </button>

          {showAddMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '8px',
              backgroundColor: '#FFF',
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 10,
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
            }}>
              {FIELD_TYPES.map((fieldType) => (
                <button
                  key={fieldType.value}
                  onClick={() => addField(fieldType.value)}
                  style={{
                    padding: '12px',
                    backgroundColor: '#f5f5f5',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    color: '#4a5676',
                    textAlign: 'left',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e8eaf6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                >
                  {fieldType.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preview & Save */}
      <div style={{
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end',
      }}>
        <button
          style={{
            padding: '12px 30px',
            backgroundColor: '#eaecf1',
            color: '#4a5676',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '1rem',
          }}
        >
          Preview Form
        </button>
        <button
          style={{
            padding: '12px 30px',
            backgroundColor: '#6B7FD7',
            color: '#FFF',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '1rem',
          }}
        >
          Save Form
        </button>
      </div>
    </div>
  );
}