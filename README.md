# Team Management Portal - Grofast Digital

A modern, futuristic team management web application with a beautiful UI/UX design featuring deep royal blue + neon cyan theme with glassmorphism effects.

## 🌟 Features

### 🏠 Hero Section
- Beautiful landing page with role selection
- Two portal options: **Admin** and **Employee**
- Futuristic animated background with floating orbs

### 👨‍💼 Admin Portal
| Feature | Description |
|---------|-------------|
| **Dashboard** | Overview with stats (total employees, active today, departments, recent updates) |
| **Employee Management** | View, add, edit, and delete employees |
| **Activity Tracking** | See all employee login and profile update activities |
| **Search & Filter** | Easily find employees by name, email, department |

### 👤 Employee Portal
| Feature | Description |
|---------|-------------|
| **Dashboard** | Personal overview with quick stats and actions |
| **Profile** | View and edit personal information, change password |
| **Attendance** | Mark daily attendance, view history and stats |
| **Work Updates** | Log daily work, track tasks by status |
| **Learning** | View courses, track learning progress |
| **Calendar** | Schedule events, view upcoming tasks |
| **Team Chat** | Real-time chat with @mentions (like MS Teams) |

## 🎨 Design Features

- ✨ **Futuristic AI SaaS Design** with neon accents
- 💎 **Glassmorphism** cards and components
- 🌊 **Animated backgrounds** with floating gradient orbs
- ✅ **Smooth animations** and micro-interactions
- 📱 **Fully responsive** - works on all devices
- 🔤 **Modern typography** using Inter font

## 🚀 Quick Start

1. Open `index.html` in your browser
2. Select your role (Admin or Employee)

### Demo Credentials

**Admin Login:**
- Username: `admin`
- Password: `admin123`

**Employee Login:**
| Name | Email | Password |
|------|-------|----------|
| Rajesh Kumar | `rajesh.kumar@grofast.com` | `rajesh123` |
| Priya Sharma | `priya.sharma@grofast.com` | `priya123` |
| Amit Patel | `amit.patel@grofast.com` | `amit123` |
| Sneha Reddy | `sneha.reddy@grofast.com` | `sneha123` |
| Ananya Gupta | `ananya.gupta@grofast.com` | `ananya123` |

## 📁 Project Structure

```
├── index.html                  # Landing page with role selection
├── admin/
│   ├── login.html              # Admin login page
│   └── dashboard.html          # Admin dashboard
├── employee/
│   ├── login.html              # Employee login page
│   ├── dashboard.html          # Employee dashboard (all features)
│   └── profile.html            # Legacy profile page
├── css/
│   ├── styles.css              # Main design system
│   ├── home.css                # Landing page styles
│   ├── auth.css                # Login page styles
│   ├── admin-dashboard.css     # Admin dashboard styles
│   └── employee-dashboard.css  # Employee dashboard styles
└── js/
    ├── admin-data.js           # Data store and helpers
    ├── admin-dashboard.js      # Admin dashboard logic
    └── employee-dashboard.js   # Employee dashboard logic
```

## 🎯 Feature Details

### Attendance System
- Mark attendance with one click
- View check-in time and location
- Monthly attendance stats
- History with filter by month

### Work Updates
- Add work items with title, description
- Categorize by type (Development, Design, Meeting, etc.)
- Track status (Completed, In Progress, Pending)
- Filter and view history

### Learning Modules
- Course progress tracking
- Visual progress circle
- Multiple learning modules
- Completion stats

### Calendar
- Monthly calendar view
- Add/view events
- Event time and description
- Quick event creation by clicking dates

### Team Chat
- Team-wide chat messages
- **@mention** - Tag team members like MS Teams
- Mention suggestions appear while typing
- Notifications for mentions
- Private messaging (select team member)

## 💻 Technologies Used

- **HTML5** - Structure
- **CSS3** - Styling with custom properties (CSS variables)
- **JavaScript** - Vanilla JS with localStorage for data persistence
- **Lucide Icons** - Beautiful icon set
- **Google Fonts** - Inter font family

## � Color Palette

| Color | Value | Usage |
|-------|-------|-------|
| Primary Blue | `#1a4fd0` | Main accent |
| Accent Cyan | `#00d4ff` | Highlights, glows |
| Background | `#e8eeff` | Lavender background |
| Success | `#10b981` | Green success states |
| Danger | `#ef4444` | Red error states |

## 📝 Notes

- All data is stored in browser's localStorage
- Session management uses sessionStorage
- Fully client-side application (no backend required)
- Chat mentions work with @Username format

---

Made with ❤️ by Grofast Digital Team
