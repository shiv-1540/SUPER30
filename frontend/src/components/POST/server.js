const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create the Express app
const app = express();
const port = 5000;
const saltRounds = 10; // Number of salt rounds for bcrypt hashing

// MySQL database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Replace with your MySQL username
  password: 'Balaji', // Replace with your MySQL password
  database: 'hostel' // Replace with your MySQL database name
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to MySQL database.');
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Session middleware
app.use(session({
  secret: 'your_secret_key', // Replace with your secret key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Function to hash password
const hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) reject(err);
      resolve(hash);
    });
  });
};

// Route to handle student login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const query = 'SELECT * FROM student WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = results[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Error comparing passwords:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

      if (isMatch) {
        req.session.user = { id: user.student_id, email: user.email };
        res.status(200).json({ message: 'Login successful' });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    });
  });
});

// Route to handle student logout
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ message: 'Could not log out.' });
    }
    res.status(200).json({ message: 'Logged out.' });
  });
});

// Route to handle student registration
app.post('/register', async (req, res) => {
  const { name, email, password, date_of_birth, phone_number, gender, address } = req.body;
  
  if (!name || !email || !password || !date_of_birth || !phone_number || !gender || !address) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const hashedPassword = await hashPassword(password);
    const query = 'INSERT INTO student (name, email, password, date_of_birth, phone_number, gender, address) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values = [name, email, hashedPassword, date_of_birth, phone_number, gender, address];

    db.query(query, values, (err, results) => {
      if (err) 
      {
        console.error('Error inserting data:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
      res.status(200).json({ message: 'Registration successful' });
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route to handle owner login
// Route to handle owner login
app.post('/owner-login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const query = 'SELECT * FROM hostelowner WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const owner = results[0];

    bcrypt.compare(password, owner.password, (err, isMatch) => {
      if (err) {
        console.error('Error comparing passwords:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

      if (isMatch) {
        req.session.user = { id: owner.owner_id, email: owner.email };
        res.status(200).json({ 
          message: 'Login successful', 
          owner_id: owner.owner_id // Include owner_id in the response
        });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    });
  });
});

// Route to handle owner logout
app.post('/owner-logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ message: 'Could not log out.' });
    }
    res.status(200).json({ message: 'Logged out.' });
  });
});

// Route to handle owner registration
app.post('/register_owner', async (req, res) => {
  const { name, email, password, phone_number, address } = req.body;

  if (!name || !email || !password || !phone_number || !address) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const hashedPassword = await hashPassword(password);
    const query = 'INSERT INTO hostelowner (name, email, password, phone_number, address) VALUES (?, ?, ?, ?, ?)';
    const values = [name, email, hashedPassword, phone_number, address];

    db.query(query, values, (err, results) => {
      if (err) {
        console.error('Error inserting data:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
      res.status(200).json({ message: 'Registration successful' });
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route to handle admin login
app.post('/admin-login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const query = 'SELECT * FROM collegeadministration WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const admin = results[0];

    bcrypt.compare(password, admin.password, (err, isMatch) => {
      if (err) {
        console.error('Error comparing passwords:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

      if (isMatch) {
        req.session.user = { id: admin.admin_id, email: admin.email };
        res.status(200).json({ message: 'Login successful' });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    });
  });
});

// Route to handle admin logout
app.post('/admin-logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ message: 'Could not log out.' });
    }
    res.status(200).json({ message: 'Logged out.' });
  });
});

// Route to handle admin registration
app.post('/register_admin', async (req, res) => {
  const { name, email, password, phone_number, position } = req.body;

  if (!name || !email || !password || !phone_number || !position) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const hashedPassword = await hashPassword(password);
    const query = 'INSERT INTO collegeadministration (name, email, password, phone_number, position) VALUES (?, ?, ?, ?, ?)';
    const values = [name, email, hashedPassword, phone_number, position];

    db.query(query, values, (err, results) => {
      if (err) {
        console.error('Error inserting data:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
      res.status(200).json({ message: 'Registration successful' });
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route to handle adding hostel details

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specify the folder to store uploaded images
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Generate a unique filename
  }
});

const upload = multer({ storage });
// Your add-hostel route with image upload
app.post('/add-hostel', upload.single('image'), (req, res) => {
  console.log('Request body:', req.body); // Log the body
  console.log('Uploaded file:', req.file); // Log the uploaded file

  const { owner_id, name, address, description, total_rooms, available_rooms, rent, facilities } = req.body;
  const image_path = req.file ? req.file.filename : null; // Get the image file path

  // Ensure all required fields are present
  if (!owner_id || !name || !address || !description || !total_rooms || !available_rooms || !rent || !image_path) {
    return res.status(400).json({ message: 'All fields including image are required' });
  }

  // Parse facilities as JSON if provided
  let parsedFacilities = [];
  try {
    parsedFacilities = JSON.parse(facilities);
  } catch (error) {
    return res.status(400).json({ message: 'Invalid facilities format' });
  }

  // Set default approval status to 'pending'
  const approval_status = 'pending';

  // Query to insert hostel details including image path and facilities
  const query = 'INSERT INTO hosteldetails (owner_id, name, address, description, total_rooms, available_rooms, approval_status, rent, image_path, facilities) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const values = [owner_id, name, address, description, total_rooms, available_rooms, approval_status, rent, image_path, JSON.stringify(parsedFacilities)];

  // Execute the query
  db.query(query, values, (err, results) => {
    if (err) {
      console.error('Error inserting data:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    res.status(200).json({ message: 'Hostel added successfully' });
  });
});


// Route to handle removing a hostel
// Fetch hostels for a specific owner
// app.get('/owner-hostels/:ownerId', (req, res) => {
//   const ownerId = req.params.ownerId;

//   const query = `
//     SELECT hostel_id, name, address, description, rent, total_rooms, available_rooms, approval_status, image_path, facilities
//     FROM hosteldetails 
//     WHERE owner_id = ?
//   `;

//   db.query(query, [ownerId], (err, results) => {
//     if (err) {
//       console.error('Error fetching hostels:', err);
//       return res.status(500).json({ message: 'Internal Server Error' });
//     }

//     if (results.length === 0) {
//       return res.status(404).json({ message: 'No hostels found for this owner' });
//     }

//     res.status(200).json(results);
//   });
// });

// Route to fetch hostels for the owner with base64 image_path conversion
app.get('/owner-hostels/:ownerId', (req, res) => {
  const ownerId = req.params.ownerId;

  const query = `
    SELECT hostel_id, name, address, description, rent, total_rooms, available_rooms, approval_status, image_path,  facilities
    FROM hosteldetails 
    WHERE owner_id = ?
  `;

  db.query(query, [ownerId], (err, results) => {
    if (err) {
      console.error('Error fetching hostels:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No hostels found for this owner' });
    }

    // Process results to include base64 encoded image_path
    const hostels = results.map(hostel => {
      const imageBuffer = hostel.image_path ? hostel.image_path.toString('base64') : null;
    

      return {
        ...hostel,
        image_path: imageBuffer ? `data:image/jpeg;base64,${imageBuffer} `: null, // Base64-encoded image
      };
    });
  
    res.status(200).json(hostels);
  });
});




// Route to remove a hostel by ID
app.delete('/remove-hostel', (req, res) => {
  const { hostel_id } = req.body;

  if (!hostel_id) {
    return res.status(400).json({ message: 'Hostel ID is required' });
  }

  const deleteQuery = 'DELETE FROM hosteldetails WHERE hostel_id = ?';
  db.query(deleteQuery, [hostel_id], (err, results) => {
    if (err) {
      console.error('Error deleting hostel:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Hostel not found or already removed' });
    }

    res.status(200).json({ message: 'Hostel removed successfully' });
  });
});




app.get('/api/hostels', (req, res) => {
  const sql = 'SELECT owner_id,hostel_id,name,address,description,total_rooms,available_rooms,rent,approval_status FROM hosteldetails';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching hostel details:', err);
      res.status(500).json({ message: 'Error fetching hostel details' });
    } else {
      res.json(results);
    }
  });
});


app.get('/api/students', (req, res) => {
  const sql = 'SELECT * FROM student';
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});
// Route to delete a student by ID
app.delete('/api/students/:id', (req, res) => {
  const studentId = req.params.id;
  const query = 'DELETE FROM student WHERE student_id = ?';
  
  db.query(query, [studentId], (err, results) => {
    if (err) {
      console.error('Error deleting student:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json({ message: 'Student deleted successfully' });
  });
});

// Make sure this route is in your server file (e.g., index.js)
app.put('/update-hostel', (req, res) => {
  const { hostel_id, total_rooms, rent, address, description, facilities } = req.body;

  if (!hostel_id || !total_rooms || !rent || !address || !description) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Handle facilities data: Ensure it's a valid JSON array
  let facilitiesData;
  try {
    facilitiesData = JSON.stringify(facilities || []);
  } catch (err) {
    return res.status(400).json({ message: 'Invalid facilities data' });
  }

  const query = `UPDATE hosteldetails
                 SET total_rooms = ?, rent = ?, address = ?, description = ?, facilities = ?
                 WHERE hostel_id = ?`;

  db.query(query, [total_rooms, rent, address, description, facilitiesData, hostel_id], (err, result) => {
    if (err) {
      console.error('Error updating hostel:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    res.status(200).json({ message: 'Hostel updated successfully!' });
  });
});




// Route to approve a hostel
app.post('/api/hostels/approve/:hostelId', (req, res) => {
  const hostelId = req.params.hostelId;

  // Validate input
  if (!hostelId) {
    return res.status(400).json({ message: 'Hostel ID is required' });
  }

  // SQL query to update hostel approval status
  const query = 'UPDATE hosteldetails SET approval_status = ? WHERE hostel_id = ?';
  const values = ['approved', hostelId];

  // Execute the query
  db.query(query, values, (err, results) => {
    if (err) {
      console.error('Error updating hostel approval status:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Hostel not found' });
    }

    res.status(200).json({ message: 'Hostel approved successfully' });
  });
});
// In your backend file (e.g., index.js or api.js)

app.get('/api/hostels/non-approved', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM hosteldetails WHERE approval_status = "not approved"'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/hostels/approve/:id', async (req, res) => {
  const hostelId = req.params.id;
  try {
    await pool.query(
      'UPDATE hosteldetails SET approval_status = "approved" WHERE hostel_id = ?',
      [hostelId]
    );
    res.status(200).json({ message: 'Hostel approved successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Route to reject a hostel
app.post('/api/hostels/reject/:hostelId', (req, res) => {
  const hostelId = req.params.hostelId;

  // Validate input
  if (!hostelId) {
    return res.status(400).json({ message: 'Hostel ID is required' });
  }

  // SQL query to update hostel approval status
  const query = 'UPDATE hosteldetails SET approval_status = ? WHERE hostel_id = ?';
  const values = ['rejected', hostelId];

  // Execute the query
  db.query(query, values, (err, results) => {
    if (err) {
      console.error('Error updating hostel rejection status:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Hostel not found' });
    }

    res.status(200).json({ message: 'Hostel rejected successfully' });
  });
});







// Route to fetch hostels for the logged-in owner
app.get('/api/owner-hostels', (req, res) => {
  if (!req.session.user || !req.session.user.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const ownerId = req.session.user.id;
  const query = 'SELECT * FROM hosteldetails WHERE owner_id = ?';

  db.query(query, [ownerId], (err, results) => {
    if (err) {
      console.error('Error fetching hostels:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    const hostels = results.map(hostel => {
      const imageBuffer = hostel.image ? hostel.image.toString('base64') : null;
      const profilePicBuffer = hostel.profile_pic ? hostel.profile_pic.toString('base64') : null;

      return {
        ...hostel,
        image: imageBuffer ? data:image/jpeg;base64,${imageBuffer} : null,
        profile_pic: profilePicBuffer ? data:image/jpeg;base64,${profilePicBuffer} : null,
      };
    });

    res.status(200).json(hostels);
  });
});





// Fetch all hostels
app.get('/all-hostels', (req, res) => {
  const query = `
    SELECT hostel_id, name, address, description, rent, total_rooms, available_rooms, approval_status, image_path 
    FROM hosteldetails
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching hostels:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    res.status(200).json(results);
  });
});



//count of hostels
// Example: Express.js route
app.get('/hostel-stats', async (req, res) => {
  try {
    const totalHostels = await db.query('SELECT COUNT(*) AS total FROM hostels');
    const approvedHostels = await db.query("SELECT COUNT(*) AS approved FROM hostels WHERE approval_status = 'approved'");
    const rejectedHostels = await db.query("SELECT COUNT(*) AS rejected FROM hostels WHERE approval_status = 'rejected'");
    
    res.json({
      total: totalHostels[0].total,
      approved: approvedHostels[0].approved,
      rejected: rejectedHostels[0].rejected,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch hostel stats' });
  }
});




// Start the server
app.listen(port, () => {
  console.log(Server running on http://localhost:${port});
});