# Data Validation Rules

## Unique Constraints

To ensure data integrity across the entire CRM system, the following fields MUST be unique:

### 1. Email Address
- **Field**: `email`
- **Scope**: System-wide (across Leads, Students, and Agents)
- **Validation**: 
  - Email must be unique across all entities
  - Cannot create a new lead/student/agent with an existing email
  - Case-insensitive uniqueness check
  - Valid email format required

**Backend Implementation:**
```sql
-- Database constraint
CREATE UNIQUE INDEX unique_email_idx ON leads(LOWER(email));
CREATE UNIQUE INDEX unique_email_students_idx ON students(LOWER(email));
CREATE UNIQUE INDEX unique_email_agents_idx ON agents(LOWER(email));
```

**Frontend Validation:**
- Real-time email availability check during form input
- Clear error message if email already exists
- Suggestion to search for existing record

### 2. Phone Number
- **Field**: `phone`
- **Scope**: System-wide (across Leads, Students, and Agents)
- **Validation**:
  - Phone number must be unique across all entities
  - Normalized format (remove spaces, dashes, parentheses)
  - International format recommended (E.164)
  - Cannot have duplicate phone numbers in the system

**Backend Implementation:**
```sql
-- Database constraint with normalized phone
CREATE UNIQUE INDEX unique_phone_idx ON leads(
  REGEXP_REPLACE(phone, '[^0-9+]', '', 'g')
);
```

**Frontend Validation:**
- Phone number formatting and normalization
- Real-time availability check
- Duplicate detection with clear messaging

---

## Integration Settings (Future Implementation)

### Calling Integration
Location: **Settings > Integrations > Calling**

**Supported Services:**
1. **Twilio**
   - Voice calls through browser
   - Call recording
   - Call tracking and analytics
   
2. **VoIP Systems**
   - Custom VoIP integration
   - Click-to-call functionality
   
3. **Native Phone App**
   - Fallback option
   - Opens device's default phone app

**Configuration Required:**
- API credentials (Account SID, Auth Token)
- Phone number pool
- Call recording preferences
- Default caller ID

### Email Integration
Location: **Settings > Integrations > Email**

**Supported Services:**
1. **SendGrid**
2. **Amazon SES**
3. **Mailgun**
4. **Custom SMTP**

**Configuration Required:**
- API keys
- Sender email addresses
- Email templates sync
- Tracking pixels for open/click tracking

---

## Implementation Notes

### Current Status
- ✅ Call button added to Lead detail page
- ✅ Fallback to native phone app (`tel:` protocol)
- ⏳ Unique constraints documented (requires backend)
- ⏳ Integration settings UI (future feature)

### Next Steps
1. **Backend**: Implement unique constraints in database schema
2. **Backend**: Add validation API endpoints for email/phone checking
3. **Frontend**: Add real-time validation on forms
4. **Settings**: Create Integrations page in Settings
5. **Integration**: Implement Twilio/VoIP calling service
6. **Integration**: Implement email service (SendGrid/SES)

---

## Error Messages

### Duplicate Email
```
This email address is already registered in the system.
Would you like to view the existing record?
[View Record] [Use Different Email]
```

### Duplicate Phone
```
This phone number is already associated with another contact.
Existing contact: [Name] (Student/Agent/Lead)
[View Contact] [Use Different Number]
```

### No Phone Number
```
No phone number available for this lead.
[Add Phone Number] [Cancel]
```
