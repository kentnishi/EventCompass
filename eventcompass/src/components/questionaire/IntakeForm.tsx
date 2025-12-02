import React from 'react';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


interface IntakeFormProps {
  selectedPath: 'no-idea' | 'rough-idea' | 'solid-idea';
  onBack: () => void;
  onSubmit: () => void;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}
const IntakeForm: React.FC<IntakeFormProps> = ({ 
  selectedPath, 
  onBack, 
  onSubmit, 
  formData, 
  setFormData 
}) => {

  
  const handleCheckboxChange = (field: string, value) => {
    const current = formData[field] || [];
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    setFormData({ ...formData, [field]: updated });
  };

  const renderNoIdeaFields = () => (
    <>
      {/* Organization Mission */}
      <div>
        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4a5676', marginBottom: '8px' }}>
          Organization Mission & Goals
        </label>
        <textarea
          value={formData.organizationMission || ''}
          onChange={(e) => setFormData({ ...formData, organizationMission: e.target.value })}
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: '1rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            color: '#4a5676',
            fontWeight: 500,
            resize: 'vertical',
            minHeight: '80px',
            fontFamily: 'inherit'
          }}
          placeholder="What does your organization do? What are your core values and objectives?"
        />
      </div>

      {/* Event Goals */}
      <div>
        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4a5676', marginBottom: '12px' }}>
          What are your primary event goals?*
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {['Fundraising', 'Awareness/Education', 'Community Building', 'Recruitment/Membership Growth', 'Celebration/Recognition'].map(goal => (
            <label key={goal} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={(formData.eventGoals || []).includes(goal)}
                onChange={() => handleCheckboxChange('eventGoals', goal)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.95rem', color: '#4a5676' }}>{goal}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Event Vibe */}
      <div>
        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4a5676', marginBottom: '12px' }}>
          What vibe are you going for?
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {['Cozy & Reflective', 'High-energy & Social', 'Hands-on & Interactive', 'Professional & Formal', 'Casual & Fun'].map(vibe => (
            <label key={vibe} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={(formData.eventVibe || []).includes(vibe)}
                onChange={() => handleCheckboxChange('eventVibe', vibe)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.95rem', color: '#4a5676' }}>{vibe}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Date & Location */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4a5676', marginBottom: '8px' }}>
            Preferred Start Date
          </label>
          <input
            type="date"
            value={formData.startDate || ''}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '1rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              color: '#4a5676',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4a5676', marginBottom: '8px' }}>
            End Date
          </label>
          <input
            type="date"
            value={formData.endDate || ''}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '1rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              color: '#4a5676',
              fontWeight: 500,
              cursor: 'pointer',
            }}
            placeholder="Leave blank for single day"
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4a5676', marginBottom: '8px' }}>
            Location Preference
          </label>
          <select
            value={formData.locationType || 'on-campus'}
            onChange={(e) => setFormData({ ...formData, locationType: e.target.value })}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '1rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              color: '#4a5676',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <option value="on-campus">On-campus</option>
            <option value="off-campus">Off-campus</option>
            <option value="flexible">Either works</option>
          </select>
        </div>
      </div>

      {/* Venue */}
      <div>
        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4a5676', marginBottom: '8px' }}>
          Specific venue (optional)
        </label>
        <input
          type="text"
          value={formData.venue || ''}
          onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: '1rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            color: '#4a5676',
            fontWeight: 500,
          }}
          placeholder="e.g., Student Union, Main Quad"
        />
      </div>

      {/* Additional Constraints */}
      <div>
        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4a5676', marginBottom: '8px' }}>
          Any specific requirements or constraints?
        </label>
        <textarea
          value={formData.constraints || ''}
          onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: '1rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            color: '#4a5676',
            fontWeight: 500,
            resize: 'vertical',
            minHeight: '70px',
            fontFamily: 'inherit'
          }}
          placeholder="e.g., Must be accessible, need to accommodate dietary restrictions, avoid weekends, etc."
        />
      </div>
    </>
  );

  const renderRoughIdeaFields = () => (
    <>
      {/* Event Type */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4a5676', marginBottom: '8px' }}>
            Event Type/Theme
          </label>
          <input
            type="text"
            value={formData.eventType || ''}
            onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '1rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              color: '#4a5676',
              fontWeight: 500,
            }}
            placeholder="e.g., Food tasting, Workshop, Social"
          />
        </div>
      </div>

      {/* Organization Mission */}
      <div>
        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4a5676', marginBottom: '8px' }}>
          Organization Mission
        </label>
        <textarea
          value={formData.organizationMission || ''}
          onChange={(e) => setFormData({ ...formData, organizationMission: e.target.value })}
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: '1rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            color: '#4a5676',
            fontWeight: 500,
            resize: 'vertical',
            minHeight: '70px',
            fontFamily: 'inherit'
          }}
          placeholder="Brief description of what your organization does"
        />
      </div>

      {/* Rough Idea */}
      <div>
        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4a5676', marginBottom: '8px' }}>
          What's your rough idea?*
        </label>
        <textarea
          value={formData.roughIdea || ''}
          onChange={(e) => setFormData({ ...formData, roughIdea: e.target.value })}
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: '1rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            color: '#4a5676',
            fontWeight: 500,
            resize: 'vertical',
            minHeight: '100px',
            fontFamily: 'inherit'
          }}
          placeholder="e.g., Food event showcasing Korean snacks with an interactive component where people can guess ingredients or vote on favorites. Maybe include some cultural context about each snack."
        />
      </div>

      {/* Event Goals */}
      <div>
        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4a5676', marginBottom: '12px' }}>
          Primary Goals for This Event
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {['Fundraising', 'Awareness/Education', 'Community Building', 'Cultural Celebration', 'Member Engagement', 'Outreach'].map(goal => (
            <label key={goal} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={(formData.eventGoals || []).includes(goal)}
                onChange={() => handleCheckboxChange('eventGoals', goal)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.95rem', color: '#4a5676' }}>{goal}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Date & Time */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4a5676', marginBottom: '8px' }}>
            Start Date*
          </label>
          <input
            type="date"
            value={formData.startDate || ''}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '1rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              color: '#4a5676',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4a5676', marginBottom: '8px' }}>
            End Date
          </label>
          <input
            type="date"
            value={formData.endDate || ''}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '1rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              color: '#4a5676',
              fontWeight: 500,
              cursor: 'pointer',
            }}
            placeholder="Leave blank for single day"
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4a5676', marginBottom: '8px' }}>
            Estimated Duration
          </label>
          <select
            value={formData.duration || '2-3 hours'}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '1rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              color: '#4a5676',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <option>1-2 hours</option>
            <option>2-3 hours</option>
            <option>3-4 hours</option>
            <option>Half day</option>
            <option>Full day</option>
            <option>Multiple days</option>
          </select>
        </div>
      </div>

      {/* Location */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4a5676', marginBottom: '8px' }}>
            Location Type*
          </label>
          <select
            value={formData.locationType || 'on-campus'}
            onChange={(e) => setFormData({ ...formData, locationType: e.target.value })}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '1rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              color: '#4a5676',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <option value="on-campus">On-campus</option>
            <option value="off-campus">Off-campus</option>
            <option value="flexible">Flexible</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4a5676', marginBottom: '8px' }}>
            Venue (if known)
          </label>
          <input
            type="text"
            value={formData.venue || ''}
            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '1rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              color: '#4a5676',
              fontWeight: 500,
            }}
            placeholder="e.g., Student Union, Main Quad"
          />
        </div>
      </div>

      {/* Additional Context */}
      <div>
        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4a5676', marginBottom: '8px' }}>
          Additional Context or Requirements
        </label>
        <textarea
          value={formData.additionalContext || ''}
          onChange={(e) => setFormData({ ...formData, additionalContext: e.target.value })}
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: '1rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            color: '#4a5676',
            fontWeight: 500,
            resize: 'vertical',
            minHeight: '70px',
            fontFamily: 'inherit'
          }}
          placeholder="Any other important details, constraints, or things we should know?"
        />
      </div>
    </>
  );

  const renderSolidIdeaFields = () => (
    <>
      {/* Event Name */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4a5676', marginBottom: '8px' }}>
            Event Name/Title*
          </label>
          <input
            type="text"
            value={formData.eventName || ''}
            onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '1rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              color: '#4a5676',
              fontWeight: 500,
            }}
            placeholder="e.g., Campus Sustainability Fair"
          />
        </div>
      </div>

      {/* Event Description */}
      <div>
        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4a5676', marginBottom: '8px' }}>
          Event Description*
        </label>
        <textarea
          value={formData.eventDescription || ''}
          onChange={(e) => setFormData({ ...formData, eventDescription: e.target.value })}
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: '1rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            color: '#4a5676',
            fontWeight: 500,
            resize: 'vertical',
            minHeight: '100px',
            fontFamily: 'inherit'
          }}
          placeholder="Provide a detailed description of your event - what will happen, who it's for, what makes it special..."
        />
      </div>

      {/* Key Activities/Components */}
      <div>
        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4a5676', marginBottom: '8px' }}>
          Key Activities or Components
        </label>
        <textarea
          value={formData.keyActivities || ''}
          onChange={(e) => setFormData({ ...formData, keyActivities: e.target.value })}
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: '1rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            color: '#4a5676',
            fontWeight: 500,
            resize: 'vertical',
            minHeight: '90px',
            fontFamily: 'inherit'
          }}
          placeholder="e.g., Vendor booths, panel discussion, hands-on workshops, recycling drive, sustainable product demos"
        />
      </div>

      {/* Date & Time */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4a5676', marginBottom: '8px' }}>
            Start Date*
          </label>
          <input
            type="date"
            value={formData.startDate || ''}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '1rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              color: '#4a5676',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4a5676', marginBottom: '8px' }}>
            End Date
          </label>
          <input
            type="date"
            value={formData.endDate || ''}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '1rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              color: '#4a5676',
              fontWeight: 500,
              cursor: 'pointer',
            }}
            placeholder="Leave blank for single day"
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4a5676', marginBottom: '8px' }}>
            Start Time*
          </label>
          <input
            type="time"
            value={formData.startTime || ''}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '1rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              color: '#4a5676',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4a5676', marginBottom: '8px' }}>
            End Time*
          </label>
          <input
            type="time"
            value={formData.endTime || ''}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '1rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              color: '#4a5676',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          />
        </div>
      </div>

      {/* Venue Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4a5676', marginBottom: '8px' }}>
            Location Type*
          </label>
          <select
            value={formData.locationType || 'on-campus'}
            onChange={(e) => setFormData({ ...formData, locationType: e.target.value })}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '1rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              color: '#4a5676',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <option value="on-campus">On-campus</option>
            <option value="off-campus">Off-campus</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4a5676', marginBottom: '8px' }}>
            Venue/Location*
          </label>
          <input
            type="text"
            value={formData.venue || ''}
            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '1rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              color: '#4a5676',
              fontWeight: 500,
            }}
            placeholder="e.g., Main Quad (rain location: Student Center Ballroom)"
          />
        </div>
      </div>

      {/* Special Requirements */}
      <div>
        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4a5676', marginBottom: '8px' }}>
          Special Requirements or Considerations
        </label>
        <textarea
          value={formData.specialRequirements || ''}
          onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: '1rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            color: '#4a5676',
            fontWeight: 500,
            resize: 'vertical',
            minHeight: '70px',
            fontFamily: 'inherit'
          }}
          placeholder="e.g., Need electricity for vendors, accessibility requirements, parking needs, rain plan, etc."
        />
      </div>
    </>
  );

  const getButtonText = () => {
    if (selectedPath === 'solid-idea') {
      return 'Create Event Plan';
    }
    return 'Generate Event Concepts';
  };

  const getHeaderText = () => {
    if (selectedPath === 'no-idea') {
      return {
        title: "Let's brainstorm together",
        subtitle: "Tell us about your organization and what you're hoping to achieve. We'll help generate creative event ideas tailored to your needs."
      };
    }
    if (selectedPath === 'rough-idea') {
      return {
        title: "Let's refine your idea",
        subtitle: "Share your initial concept and we'll help you develop it into a complete event plan with activities, logistics, and more."
      };
    }
    return {
      title: "Let's build your event plan",
      subtitle: "You know what you want to do! Let's create a detailed plan with activities, schedules, shopping lists, and tasks."
    };
  };

  const header = getHeaderText();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#d5dcf1', padding: '30px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <button 
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: '#6B7FD7',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: '24px'
          }}
        >
          <ArrowBackIcon style={{ width: '16px', height: '16px' }} />
          Back
        </button>
        
        <div style={{ backgroundColor: '#FFF', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#333', marginBottom: '8px' }}>
              {header.title}
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#6b7280', lineHeight: '1.6' }}>
              {header.subtitle}
            </p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Organization Name - Common to all paths */}
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4a5676', marginBottom: '8px' }}>
                Organization Name*
              </label>
              <input
                type="text"
                value={formData.organizationName || ''}
                onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  color: '#4a5676',
                  fontWeight: 500,
                }}
                placeholder={
                  selectedPath === 'no-idea' 
                    ? "e.g., Alzheimer's Awareness Group" 
                    : selectedPath === 'rough-idea'
                    ? "e.g., Korean Cultural Association"
                    : "e.g., Environmental Action Club"
                }
                required
              />
            </div>

            {/* Path-specific fields */}
            {selectedPath === 'no-idea' && renderNoIdeaFields()}
            {selectedPath === 'rough-idea' && renderRoughIdeaFields()}
            {selectedPath === 'solid-idea' && renderSolidIdeaFields()}

            {/* Budget & Attendance - Common to all paths */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4a5676', marginBottom: '8px' }}>
                  {selectedPath === 'solid-idea' ? 'Total Budget*' : 'Budget Range*'}
                </label>
                {selectedPath === 'solid-idea' ? (
                  <input
                    type="number"
                    value={formData.totalBudget || ''}
                    onChange={(e) => setFormData({ ...formData, totalBudget: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '1rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      color: '#4a5676',
                      fontWeight: 500,
                    }}
                    placeholder="e.g., 2500"
                  />
                ) : (
                  <select
                    value={formData.budgetRange || '$500 - $1000'}
                    onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '1rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      color: '#4a5676',
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    <option>Under $250</option>
                    <option>$250 - $500</option>
                    <option>$500 - $1000</option>
                    <option>$1000 - $2000</option>
                    <option>$2000 - $5000</option>
                    <option>$5000+</option>
                  </select>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4a5676', marginBottom: '8px' }}>
                  Expected Attendance*
                </label>
                <input
                  type="number"
                  value={formData.expectedAttendance || ''}
                  onChange={(e) => setFormData({ ...formData, expectedAttendance: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    color: '#4a5676',
                    fontWeight: 500,
                  }}
                  placeholder="e.g., 60"
                />
              </div>
            </div>

            <button
              onClick={onSubmit}
              style={{
                marginTop: '8px',
                padding: '14px 32px',
                backgroundColor: '#6B7FD7',
                color: '#FFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {selectedPath === 'solid-idea' ? '→' : <AutoAwesomeIcon style={{ width: '18px', height: '18px' }} />}
              {getButtonText()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntakeForm;