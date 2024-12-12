# Panda Express POS System

A comprehensive point-of-sale system for Panda Express restaurants that includes both customer and employee interfaces, featuring real-time order management, inventory tracking, and sales analytics.

# Hosted documentation wiki
[https://project-3-team-0g.onrender.com/global.html#App](https://project-3-team-0g.onrender.com/global.html#App)

## Features

### Customer Interface
- Interactive menu with detailed item information
- Customizable combo meal builder (Bowl, Plate, Bigger Plate)
- Real-time cart management
- Accessibility features (adjustable text size)
- Multi-language support
- Weather-integrated checkout experience
- Allergen and nutritional information display

### Employee Interface
- Real-time order processing
- Inventory management system
- Menu and price management
- Employee scheduling and management
- Sales reporting and analytics
- Order history tracking

### Management Features
- Sales analytics and reporting
- Inventory level monitoring
- Menu customization tools
- Price management system
- Employee performance tracking

## Technology Stack

- **Frontend**: React.js with Material-UI
- **Backend**: Flask (Python)
- **Database**: PostgreSQL
- **Authentication**: Google OAuth
- **Additional APIs**: Weather API, Translation Services

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Python 3.8+
- PostgreSQL
- TAMU VPN access or network connection

### Installation

1. Clone the repository:
git clone https://github.com/CSCE331-Fall2024/project-3-team-0g.git
cd project-3-team-0g

2. Frontend Setup:
cd frontend
npm install
npm start

3. Backend Setup:
cd backend
# Create virtual environment
# Windows:
python -m venv ./venv
# Unix:
python3 -m venv ./venv

# Activate virtual environment
# Windows:
venv\scripts\activate
# Unix:
source venv/bin/activate

# Install dependencies
# Windows:
pip install -r requirements.txt
# Unix:
pip3 install -r requirements.txt

# Start server
# Windows:
python app.py
# Unix:
python3 app.py

4. Environment Configuration:
- Create a `.env` file in the root directory
- Configure required environment variables:
  - Database connection string
  - API keys
  - Authentication credentials

## Project Structure

project-3-team-0g/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── styles/
│   │   ├── contexts/
│   │   └── App.js
│   ├── public/
│   └── package.json
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── venv/
└── .env

## Key Components

### Customer Interface
- `CustomerScreen`: Main ordering interface
- `MenuBoard`: Digital menu display
- `SubmitOrderScreen`: Order checkout process

### Employee Interface
- `EmployeeOrderScreen`: Order management
- `InventoryScreen`: Inventory tracking
- `ReportsScreen`: Analytics dashboard

### Management Interface
- `MenuManagementScreen`: Menu customization
- `PriceManagementScreen`: Price updates
- `EmployeeManagementScreen`: Staff management

## Development Guidelines

### Code Style
- Follow React best practices
- Use consistent naming conventions
- Implement proper error handling
- Include component documentation
- Maintain responsive design principles

## Deployment

The application is deployed using render here:
https://project-3-team-0g-frontend.onrender.com/

## Acknowledgments

- Team 0G members
- Project advisors
- Texas A&M University


`
<!-- # project-3-team-0g


Running the application locally:

- Ensure you have the .env in the root directory right outside of the backend and frontend directories
- Ensure you are on TAMU wifi or VPN

- Open terminal for frontend server
- cd into the frontend directory
- npm install
- npm start

- Open another terminal for backend server
- cd into the backend directory
- Make virtual environment if there isn't one already 
    - windows: python -m venv ./venv
    - unix: python3 -m venv ./venv
- Activate virtual environment
    - windows: venv/scripts/activate
    - unix: source venv/bin/activate
- Install packages
    - windows: pip install -r requirements.txt
    - unix: pip3 install -r requirements.txt
- Run backend server
    - windows: python app.py
    - unix: python3 app.py -->
