const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Use body-parser middleware to parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Database configuration
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'hackbuzz',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Routes

// Serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.post('/add_hospital', async (req, res) => {
  try {
    // Extract hospital data from request body
    const { name, specialization, place, rating, roomsAvailability, availability, facility,doctors,email, pass } = req.body;
    console.log(doctors)
    // Check if any required parameters are undefined
    if (!name || !specialization || !place || !email || !pass) {
      return res.status(400).send('Name, specialization, place, email, and password are required fields.');
    }

    // Acquire a connection from the pool
    const connection = await pool.getConnection();
    
    // Insert hospital data into the database
    const [result] = await connection.execute(
      'INSERT INTO hospitals (name, specialization, place, rating, rooms_availability, availability, facility,doctors,email, pass) VALUES ( ?,?, ?, ?, ?,?, ?, ?, ?,?)',
      [name, specialization, place, rating , roomsAvailability, availability, facility,doctors,email, pass] // Use null if rating, roomsAvailability, or availability is undefined
    );

    // Release the connection
    connection.release();

    // Send response
    res.status(200).send('Hospital added successfully!');
  } catch (error) {
    console.error('Error occurred during hospital insertion:', error);
    res.status(500).send('Error occurred during hospital insertion');
  }
});


// Serve the add_hospital.html form
app.get('/add_hospital', (req, res) => {
  res.sendFile(path.join(__dirname, 'add_hospital.html'));
});

// Serve the login.html form
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});
app.get('/add_update', (req, res) => {
  res.sendFile(path.join(__dirname, 'add_update.html'));
});

app.post('/add_doctor', async (req, res) => {
  try {
    // Extract doctor data from request body
    const { name, specialization, place, email, pass,availability,hospital_working } = req.body;
     console.log('Doctor data:', { name, specialization, place, email, pass,availability });
    // Check if any required parameters are undefined
    if (!name || !specialization || !place || !email || !pass) {
      return res.status(400).send('Name, specialization, place, email, and password are required fields.');
    }

    // Log the extracted data
   

    // Acquire a connection from the pool
    const connection = await pool.getConnection();

    // Insert doctor data into the database
    const [result] = await connection.execute(
      'INSERT INTO doctors (name, specialization, place, email, pass,availability,hospital_name) VALUES (?, ?,?, ?, ?, ?,?)',
      [name, specialization, place, email, pass,availability,hospital_working]
    );

    // Release the connection
    connection.release();

    // Send response
    res.status(200).send('Doctor added successfully!');
  } catch (error) {
    console.error('Error occurred during doctor insertion:', error);
    res.status(500).send('Error occurred during doctor insertion');
  }
});


// Retrieve hospital data and render hospital.ejs
app.get('/hospitals', async (req, res) => {
  try {
    // Acquire a connection from the pool
    const connection = await pool.getConnection();

    // Query to retrieve hospital data
    const [rows] = await connection.execute('SELECT * FROM hospitals');

    // Release the connection
    connection.release();

    // Render hospital.ejs with retrieved hospital data
    res.render('hospital', { hospitals: rows });
  } catch (error) {
    console.error('Error occurred while retrieving hospital data:', error);
    res.status(500).send('Internal Server Error');
  }
});
app.get('/update', (req, res) => {
  res.sendFile(path.join(__dirname, 'update.html'));
});

app.post('/update_hospital', async (req, res) => {
  try {
    // Extract hospital data from request body
    const { name, specialization, place, rating, roomsAvailability, availability, facility,doctors,email, pass } = req.body;

    // Check if any required parameters are undefined
    if (!name || !specialization || !place || !email || !pass) {
      return res.status(400).send('Name, specialization, place, email, and pass are required fields.');
    }

    // Acquire a connection from the pool
    const connection = await pool.getConnection();
    
    // Update hospital data in the database
    const [result] = await connection.execute(
      'UPDATE hospitals SET specialization = ?, place = ?, rating = ?, rooms_availability = ?, doctors=?,email = ?, pass = ? , availability=? ,facility=? WHERE name = ?',
      [specialization, place, rating || null, roomsAvailability || null, doctors,email, pass, availability,facility,name]
    );

    // Release the connection
    connection.release();

    // Send response
    res.status(200).send('Hospital updated successfully!');
  } catch (error) {
    console.error('Error occurred during hospital update:', error);
    res.status(500).send('Error occurred during hospital update');
  }
});

// Validate login and redirect to add_doctor.html if successful
app.post('/login', (req, res) => {
  // Perform login validation here
  const { username, password } = req.body;

  // Check if username and password are correct
  if (username === 'admin' && password === 'admin123') {
    // Redirect to add_doctor.html if login is successful
    res.redirect('/add_doctor');
  } else {
    // If login fails, send back to login page with an error message
    res.status(401).send('Invalid username or password');
  }
});

// Serve the doctor.html form
app.get('/add_doctor', (req, res) => {
  res.sendFile(path.join(__dirname, 'doctor.html'));
});
app.get('/validate_doctor', (req, res) => {
  res.sendFile(path.join(__dirname, 'add_doc.html'));
});
app.get('/phar_login', (req, res) => {
  res.sendFile(path.join(__dirname, 'phar.html'));
});

app.post('/validate_doctor', async (req, res) => {
	console.log(req.body)
  const { email, password } = req.body;
  
  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).send('Email and password are required');
  }
  

  try {
    // Query the database to retrieve the password associated with the provided email
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT pass FROM doctors WHERE email = ?', [email]);
    connection.release();

    if (rows.length > 0) {
      const storedPassword = rows[0].pass; // Retrieve the stored password from the query result
      console.log('Stored password:', storedPassword); // Log the stored password
      // Check if the provided password matches the stored password
      if (password === storedPassword) {
        res.status(200).send('Login successful');
      } else {
        res.status(401).send('Invalid email or password');
      }
    } else {
      res.status(401).send('Invalid email or password');
    }
  } catch (error) {
    console.error('Error during login validation:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Retrieve general physician data and render general_physician.ejs
app.get('/general_physician', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(`
      SELECT *
      FROM doctors
    `);
    connection.release();
    res.render('general_physician', { connections: rows }); 
  } catch (error) {
    console.error('Error occurred:', error.message);
    res.status(500).send('Internal Server Error');
  }
});
app.get('/appointment', (req, res) => {
  res.sendFile(__dirname + '/appointment.html');
});
app.get('/validate_doc', (req, res) => {
  res.sendFile(__dirname + '/add_login.html');
})
app.post('/validate_doc', async (req, res) => {
	console.log(req.body)
  const { email, password } = req.body;
  
  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).send('Email and password are required');
  }
  

  try {
    // Query the database to retrieve the password associated with the provided email
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT pass FROM doctors WHERE email = ?', [email]);
    connection.release();

    if (rows.length > 0) {
      const storedPassword = rows[0].pass; // Retrieve the stored password from the query result
      console.log('Stored password:', storedPassword); // Log the stored password
      // Check if the provided password matches the stored password
      if (password === storedPassword) {
        res.status(200).send('Login successful');
      } else {
        res.status(401).send('Invalid email or password');
      }
    } else {
      res.status(401).send('Invalid email or password');
    }
  } catch (error) {
    console.error('Error during login validation:', error);
    res.status(500).send('Internal Server Error');
  }
});
app.get('/validate_login', (req, res) => {
  res.sendFile(__dirname + '/update_login.html');
})
app.post('/validate_login', async (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).send('Email and password are required');
  }

  try {
    // Query the database to retrieve the password associated with the provided email
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT pass FROM hospitals WHERE email = ?', [email]);
    connection.release();

    if (rows.length > 0) {
      const storedPassword = rows[0].pass; // Retrieve the stored password from the query result
      console.log('Stored password:', storedPassword); // Log the stored password
      // Check if the provided password matches the stored password
      if (password === storedPassword) {
        res.status(200).send('Login successful');
      } else {
        res.status(401).send('Invalid email or password');
      }
    } else {
      res.status(401).send('Invalid email or password');
    }
  } catch (error) {
    console.error('Error during login validation:', error);
    res.status(500).send('Internal Server Error');
  }
});
app.get('/recep_login', (req, res) => {
  res.sendFile(__dirname + '/recep_login.html');
})
app.get('/submit_doctor_appointment', (req, res) => {
  res.sendFile(__dirname + '/app.html');
})
app.get('/nearby', (req, res) => {
  res.sendFile(__dirname + '/map.html');
})
app.get('/patients', async (req, res) => {
  const { email } = req.query; // Assuming the email is provided as a query parameter
  console.log(email);
  try {
    // Acquire a connection from the pool
    const connection = await pool.getConnection();

    // Query to retrieve the hospital ID based on the provided email
    const [hospitalRows] = await connection.execute(`
      SELECT hospital_id
      FROM hospitals
      WHERE email = ?
    `, [email]);

    const hospitalId = hospitalRows[0].hospital_id;
    console.log(hospitalId)
    // Query to retrieve patient data associated with the hospital ID
    const [patientRows] = await connection.execute(`
      SELECT ar.*, h.name AS hospital_name
      FROM appointment_recipients AS ar
      INNER JOIN hospitals AS h ON ar.hospital_id = h.hospital_id
      WHERE ar.hospital_id = ?
    `, [hospitalId]);

    // Release the connection
    connection.release();

    // Render the patients.ejs template and pass the retrieved patient data
    res.render('patients', { patients: patientRows });
  } catch (error) {
    console.error('Error occurred while retrieving patient data:', error);
    res.status(500).send('Internal Server Error');
  }
});


// Handle request to mark a patient as visited and delete the record
app.post('/mark_visited', async (req, res) => {
  try {
      const { email } = req.body;
      console.log(email)
      // Check if email is provided
      if (!email) {
          return res.status(400).send('Email address is required.');
      }

      // Acquire a connection from the pool
      const connection = await pool.getConnection();

      // Delete the record from the database based on the patient's email address
      const [result] = await connection.execute(
          'DELETE FROM appointment_recipients WHERE email = ?',
          [email]
      );

      // Release the connection
      connection.release();

      // Send response indicating success
      res.status(200).send('Patient marked as visited and record deleted successfully.');
  } catch (error) {
      console.error('Error occurred while marking patient as visited:', error);
      res.status(500).send('Internal Server Error');
  }
});


app.post('/submit_appointment', async (req, res) => {
  const { name, email, doctor,date, time, hospital } = req.body;

  // Log the received data
  console.log('Form details:');
  console.log('Name:', name);
  console.log('Email:', email);
  console.log('Date:', date);
  console.log('Time:', time);
  console.log('Doctor:', doctor);
  console.log('Hospital:', hospital);

  // Check if any required parameters are undefined
  if (!name || !email || !date || !time || !hospital) {
    return res.status(400).send('Name, email, date, time, and hospital are required fields.');
  }

  try {
    // Acquire a connection from the pool
    const connection = await pool.getConnection();

    // Query to check if there is any appointment for the same hospital at the same date and time
    const [existingAppointments] = await connection.execute(
      'SELECT * FROM appointment_recipients WHERE hospital_id = ? AND date = ? AND time = ?',
      [hospital, date, time]
    );

    // Check if there are existing appointments for the same hospital at the same date and time
    if (existingAppointments.length > 0) {
      return res.status(400).send('An appointment already exists for the same hospital at the same date and time.');
    }

    // Query to retrieve email address based on the hospital id
    const [rows] = await connection.execute(
      'SELECT email FROM hospitals WHERE hospital_id = ?',
      [hospital]
    );

    // Check if the email address is found for the specified hospital
    if (rows.length === 0) {
      return res.status(400).send('No hospital found for the specified name.');
    }

    const recipientEmail = rows[0].email; // Extract the email address from the query result

    
    await connection.execute(
      'INSERT INTO appointment_recipients (name, email, date, time,doctor, hospital_id) VALUES (?, ?, ?,?, ?, ?)',
      [name, email, date, time,doctor, hospital]
    );

    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'vibudeshrb.22cse@kongu.edu',
        pass: 'andx xznk qhsn aagi' 
      }
    });

    // Email message options
    const mailOptions = {
      from: email, // Sender email address (from the appointment form)
      to: recipientEmail, // Recipient email address based on the specified hospital name
      subject: 'New Appointment Request',
      text: `Name: ${name}\nEmail: ${email}\nDate: ${date}\nTime: ${time}\n`
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        res.status(500).send('Failed to send appointment request.');
      } else {
        console.log('Email sent: ' + info.response);
        res.status(200).send('Appointment request sent successfully.');
      }
    });

    // Release the connection
    connection.release();
  } catch (error) {
    console.error('Error occurred during appointment submission:', error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/submit_doctor_appointment', async (req, res) => {
  const { name, email, date, time,  problem, doctor_id } = req.body;

  // Log the received data
  console.log('Doctor Appointment Form details:');
  console.log('Name:', name);
  console.log('Email:', email);
  console.log('Date:', date);
  console.log('Time:', time);
  console.log('Problem:', problem);
  console.log('Doctor ID:', doctor_id);

  // Check if any required parameters are undefined
  if (!name || !email || !date || !time  || !problem || !doctor_id) {
    return res.status(400).send('Name, email, date, time, hospital, problem, and doctor_id are required fields.');
  }

  try {
    // Acquire a connection from the pool
    const connection = await pool.getConnection();

    // Query to retrieve recipient email address based on the doctor_id
    const [rows] = await connection.execute(
      'SELECT email FROM doctors WHERE doctor_id = ?',
      [doctor_id]
    );

    // Check if the email address is found for the specified doctor_id
    if (rows.length === 0) {
      return res.status(400).send('No doctor found for the specified doctor_id.');
    }

    const recipientEmail = rows[0].email; // Extract the email address from the query result

    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'vibudeshrb.22cse@kongu.edu',
        pass: 'andx xznk qhsn aagi' 
      }
    });

    // Email message options
    const mailOptions = {
      from: email, // Sender email address (from the appointment form)
      to: recipientEmail, // Recipient email address based on the specified doctor_id
      subject: 'New Doctor Appointment Request',
      text: `Name: ${name}\nEmail: ${email}\nDate: ${date}\nTime: ${time}\nProblem: ${problem}\n`
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        res.status(500).send('Failed to send appointment request.');
      } else {
        console.log('Email sent:', info.response);
        res.status(200).send('Doctor appointment request sent successfully.');
      }
    });

    // Release the connection
    connection.release();
  } catch (error) {
    console.error('Error occurred during doctor appointment submission:', error);
    res.status(500).send('Internal Server Error');
  }
});
// Route to render the index page
app.get('/pharmacy', (req, res) => {
  res.sendFile(path.join(__dirname, 'pharmacy.html'));
});
// Route to handle prescription submission
app.post('/submitPrescription', async (req, res) => {
  const { doctorName, patientName, medication, quantity, time,amount ,mobile} = req.body;
  console.log(doctorName, patientName, medication, quantity, time,mobile);
  try {
      // Acquire a connection from the pool
      const connection = await pool.getConnection();

      // Insert prescription data into the database
      const [result] = await connection.execute(
          'INSERT INTO medication (doctorName, patientName, medication, quantity,mobile, timing,amount) VALUES (?, ?, ?, ?,?, ?,?)',
          [doctorName, patientName, medication, quantity,mobile, time,amount]
      );

      // Release the connection
      connection.release();

      // Send response indicating successful prescription submission
      res.status(200).send('Prescription submitted successfully');
  } catch (error) {
      // Handle error
      console.error(error);
      res.status(500).send('Error submitting prescription');
  }
});

// Serve the pharmacist_login.html form
app.get('/pharmacian_login', (req, res) => {
  res.sendFile(path.join(__dirname, 'pharmacian_login.html'));
});

// Validate pharmacist login credentials
app.post('/validate_pharmacist', async (req, res) => {
  const { phar_email, phar_pass } = req.body;

  // Check if email and password are provided
  if (!phar_email || !phar_pass) {
    return res.status(400).send('Email and password are required');
  }

  try {
    // Query the database to retrieve the password associated with the provided email
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT phar_pass FROM pharmacy WHERE phar_mail = ?', [phar_email]);
    connection.release();

    if (rows.length > 0) {
      const storedPassword = rows[0].phar_pass; // Retrieve the stored password from the query result
      // Check if the provided password matches the stored password
      if (phar_pass === storedPassword) {
        // Redirect to pharmacist dashboard or any other page upon successful login
        res.redirect('/pater');
      } else {
        res.status(401).send('Invalid email or password');
      }
    } else {
      res.status(401).send('Invalid email or password');
    }
  } catch (error) {
    console.error('Error during login validation:', error);
    res.status(500).send('Internal Server Error');
  }
});
app.get('/pater', async (req, res) => {
  try {
    // Query the database to retrieve all prescription data
    const connection = await pool.getConnection();
    const [prescriptions] = await connection.query('SELECT * FROM medication');
    connection.release();

    // Render the pat.ejs template with prescription data
    res.render('pater', { prescriptions });
  } catch (err) {
    console.error('Error retrieving prescription data:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Route to render pharmacist dashboard upon successful login
app.get('/pharmacy_data', (req, res) => {
  res.send('Welcome to the pharmacist dashboard!');
});

app.get('/pharmacist', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [medications] = await connection.query('SELECT * FROM medication');
    connection.release();
    res.render('pharmacit', { prescriptions: medications });
  } catch (err) {
    console.error('Error retrieving medications:', err);
    res.status(500).send('Internal Server Error');
  }
});


/// Route to render patient dashboard
app.get('/pat', async (req, res) => {
  try {
    // Query the database to retrieve all prescription data
    const connection = await pool.getConnection();
    const [prescriptions] = await connection.query('SELECT * FROM medication');
    connection.release();

    // Render the pat.ejs template with prescription data
    res.render('pat', { prescriptions });
  } catch (err) {
    console.error('Error retrieving prescription data:', err);
    res.status(500).send('Internal Server Error');
  }
});
// Route to delete a prescription
// Route to delete a prescription
app.get('/delete_prescription', async (req, res) => {
  try {
      const { id } = req.query;

      // Check if id is provided
      if (!id) {
          return res.status(400).send('Prescription ID is required.');
      }

      // Acquire a connection from the pool
      const connection = await pool.getConnection();

     console.log(id)
      const [result] = await connection.execute(
          'DELETE FROM medication WHERE prescription_id = ?',
          [id]
      );

      // Release the connection
      connection.release();

      // Send response indicating success
      res.status(200).send('Prescription deleted successfully.');
      
  } catch (error) {
      console.error('Error occurred while deleting prescription:', error);
      res.status(500).send('Internal Server Error');
  }
});
app.get('/add_lab', (req, res) => {
  res.sendFile(__dirname + '/lab.html');
});

app.get('/20test.html', (req, res) => {
  res.sendFile(__dirname + '/20test.html');
});
app.get('/lab', async (req, res) => {
    try {
        // Get data from the database
        const connection = await pool.getConnection();
        const [rows] = await connection.execute('SELECT * FROM labs');
        connection.release();

        // Render the EJS file and pass the data to it
        res.render('lab', { labs: rows });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred while processing your request.');
    }
});



app.post('/submitForm', async (req, res) => {
    const { hospital_name, location, lab_timing, service, service_timing, center_number, service_cost } = req.body;
    console.log(hospital_name, location, lab_timing, service, service_timing, center_number, service_cost);
    try {
        // Using pool.query directly
        await pool.query(
            'INSERT INTO labs (hospital_name, location, lab_timing, service, service_timing, center_number, service_cost) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [hospital_name, location, lab_timing, service, service_timing, center_number, service_cost]
        );
        console.log('Data submitted successfully');
        res.status(200).json({ message: 'Data submitted successfully.' });
    } catch (err) {
        console.error('Error inserting data:', err);
        res.status(500).json({ message: 'An error occurred while submitting the data.' });
    }
});


const PORT = 5000 ;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});