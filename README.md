
# Hospital Patient Connection System

## Overview

The Hospital Patient Connection System is designed to streamline patient management and reduce wait times in hospitals. This system utilizes HTML, CSS, JavaScript for the frontend, Node.js and Express for the backend, MySQL for the database, and SMTP for email notifications. The system provides features for patient registration, appointment scheduling, and real-time updates to improve hospital efficiency.

## Features

- **Patient Registration:** Allows patients to register and manage their profiles.
- **Appointment Scheduling:** Patients can book and manage appointments with healthcare providers.
- **Real-time Updates:** Notifications sent to patients and staff about appointment confirmations and reminders.
- **Reduce Wait Times:** Efficient scheduling and real-time notifications to minimize patient wait times.

## Technology Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express
- **Database:** MySQL
- **Email:** SMTP (e.g., nodemailer)
- **Scheduling:** Custom logic for appointment scheduling and reminders

## Setup

### Prerequisites

- Node.js (>= 14.x)
- MySQL
- npm (or yarn)
- SMTP Server credentials

### Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/your-repo/hospital-patient-connection.git
   cd hospital-patient-connection
   ```

2. **Install Backend Dependencies:**

   Navigate to the `backend` directory and install dependencies:

   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment Variables:**

   Create a `.env` file in the `backend` directory and add the following environment variables:

   ```env
   DB_HOST=your_mysql_host
   DB_USER=your_mysql_user
   DB_PASSWORD=your_mysql_password
   DB_NAME=your_mysql_database
   SMTP_HOST=your_smtp_host
   SMTP_PORT=your_smtp_port
   SMTP_USER=your_smtp_user
   SMTP_PASS=your_smtp_password
   ```

4. **Set Up the MySQL Database:**

   Create a MySQL database and tables as defined in the `database.sql` file (if provided).

   ```sql
   CREATE DATABASE hospital;
   USE hospital;
   CREATE TABLE patients (
     id INT AUTO_INCREMENT PRIMARY KEY,
     name VARCHAR(100),
     email VARCHAR(100) UNIQUE,
     phone VARCHAR(15)
   );
   CREATE TABLE appointments (
     id INT AUTO_INCREMENT PRIMARY KEY,
     patient_id INT,
     appointment_time DATETIME,
     FOREIGN KEY (patient_id) REFERENCES patients(id)
   );
   ```

5. **Start the Backend Server:**

   ```bash
   npm start
   ```

6. **Install Frontend Dependencies:**

   Navigate to the `frontend` directory and install dependencies:

   ```bash
   cd ../frontend
   ```

   *Note:* If using a build tool like webpack, ensure the frontend build process is set up correctly.

7. **Start the Frontend Development Server:**

   *If using a development server:* 

   ```bash
   npm start
   ```

   *Or deploy the static files to a web server.*

### SMTP Integration

To send email notifications, configure the `sendEmail` function in `backend/utils/emailUtils.js`:

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

exports.sendEmail = function(to, subject, text) {
  const mailOptions = {
    from: 'your_email@example.com',
    to: to,
    subject: subject,
    text: text,
  };

  return transporter.sendMail(mailOptions);
};
```

### Scheduling

Implement logic in `backend/controllers/appointmentController.js` to handle appointment reminders and scheduling. For example:

```javascript
const schedule = require('node-schedule');
const sendEmail = require('../utils/emailUtils');

// Schedule reminders for the next day
schedule.scheduleJob('0 9 * * *', function() {
  // Logic to fetch appointments for the next day and send reminders
});
```

## Usage

- **Patient Registration:** Access the registration page to create a patient profile.
- **Appointment Scheduling:** Patients can schedule appointments through the web interface.
- **Notifications:** Patients will receive email notifications for appointment confirmations and reminders.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any changes or enhancements.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For any questions or support, please reach out to [your_email@example.com](mailto:your_email@example.com).
