
import express from "express";
import mysql from "mysql2"
import cors from "cors";
import crypto from "crypto";
import cookieParser from 'cookie-parser';
import bodyParser from "body-parser";
import dotenv from "dotenv";
import multer from "multer";
import session from "express-session";
//import url from "url";


//const MySQLStore = require('express-mysql-session')(session);
import path from 'path';

dotenv.config();

const app = express();
const port = process.env.APP_PORT || 3001;

// Setup file upload
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });
const _dirname=path.resolve();

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// CORS and cookie parser setup
const corsOptions = {
    origin: 'https://litarcpages.onrender.com',
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
};
app.use(cors(corsOptions));
app.use(cookieParser());


// // Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// const dbUrl = process.env.DATABASE_URL;
// const dbConfig = new URL(dbUrl);

// const db = mysql.createConnection({
//     host: dbConfig.hostname,
//     port: dbConfig.port,
//     user: dbConfig.username,
//     password: dbConfig.password,
//     database: dbConfig.pathname.split('/')[1]
// });

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});

// Session store using MySQL
// const sessionStore = new MySQLStore({}, db);

// Ensure session cookies are correctly handled
// app.use(session({
//     key: 'litarcpages_sid',
//     secret: 'abc123',
//     store: sessionStore,
//     resave: false,
//     saveUninitialized: false,
    // cookie: {
    //     maxAge: 1000 * 60 * 20 * 24, // 1 day
    //     httpOnly: true, // Prevent JavaScript access to cookies
    //     sameSite: 'None', // Allow cookies to be sent cross-origin
    //     secure: false // Use true in production if using HTTPS
    // }
// }));


/* setup server side session management */
app.use(
  session(    
                  { 

                      // It holds the secret key for session 
                      secret: 'AlphaZulu16', 
                  
                      // Forces the session to be saved 
                      // back to the session store 
                      resave: true, 
                  
                      // Forces a session that is "uninitialized" 
                      // to be saved to the store 
                      saveUninitialized: true,
                      cookie: {
                        maxAge: 1000 * 60 * 20 * 1, 
                        httpOnly: true, // Prevent JavaScript access to cookies
                      //  sameSite: 'None', // Allow cookies to be sent cross-origin
                        secure: false // Use true in production if using HTTPS
                    }
                  }
      )
)

// Utility function to hash passwords using MD5
const hashPasswordWithMD5 = (password) => {
    return crypto.createHash('md5').update(password).digest('hex');
};

// Middleware to check if the user is authenticated
const checkSession = (req, res, next) => {
    console.log(req.session.hasOwnProperty('isLoggedIn'));
   
    console.log("Isloogein:  ",req.session.isLoggedIn);

    if (req.session.hasOwnProperty('isLoggedIn') && req.session.isLoggedIn===true) {
      next();
      
    }
    else{
      return res.status(401).json({ 
        message: 'Unauthorized. Please log in first.',
        isLoggedIn: false 
    });
    }
};

// Signup Route
app.post('/signup', async (req, res) => {
    const { username, firstname, lastname, email, password } = req.body;

    if (!username || !firstname || !lastname || !email || !password) {
        return res.status(400).json({ message: 'All fields are required!' });
    }

    const hashedPassword = hashPasswordWithMD5(password);

    const user = {
        username,
        firstname,
        lastname,
        email,
        password: hashedPassword,
        roleid:4
    };

    const query = 'INSERT INTO users SET ?';
    db.query(query, user, (err, result) => {
        if (err) {
            console.error('Error saving data:', err);
            return res.status(500).json({ message: 'An error occurred while saving the data.' });
        }
        res.status(200).json({ message: 'User registered successfully!' });
    });
});

// Login Route
app.post('/login', (req, res) => {
  console.log('Session before login:', req.session);

    const { username, password } = req.body;
    const disabled_admin=0;

   
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required!' });
    }
   
    const hashedPassword = hashPasswordWithMD5(password);
    const query = 'SELECT * FROM users WHERE username = ? and password= ? ';
    db.query(query, [username,hashedPassword,disabled_admin], (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ message: 'An error occurred while fetching the data.' });
        }
      
        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password!' });
        }
        
        const user = results[0];
        if(user.disabled_admin==1){
          return res.status(402).json({ message: 'Your account has been disabled. Try Contacting the Adminstartion.' });
        }
       
        if (hashedPassword !== user.password) {
            return res.status(401).json({ message: 'Invalid username or password!' });
        }


        // Save login status and user info directly in the session
        req.session.isLoggedIn = true;   // Set isLoggedIn to true on successful login
        req.session.user = {
            user_id: user.user_id,
            username: user.username,
            roleid: user.roleid,
            profile_pic:user.profile_pic
        };
     
       req.session.save(err => {
        if (err) {
            console.error('Error saving session:', err);
            return res.status(500).json({ message: 'An error occurred while saving the session.' });
        }
        res.status(200).json({
            message: "Login successful",
            user: req.session.user,
            isLoggedIn: true
        });
        console.log('Session after login:', req.session);
    });

    });
});

app.get('/home/posts', (req, res) => {
  const { category } = req.query;

  // SQL query to fetch posts based on the selected category
  let query = `
    SELECT 
        posts.*, 
        users.username, 
        users.profile_pic 
    FROM 
        posts 
    JOIN 
        users 
    ON 
        posts.user_id = users.user_id
    where posts.visibility_admin=1 
  `;

  // If a category is provided, add a WHERE clause to filter by category
  if (category && category !== 'All') {
    query += ` and posts.category = '${category}'`;
  }
   query+=` ORDER BY posts.created_at DESC`;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching posts:', err);
      return res.status(500).json({ error: 'Error fetching posts' });
    }

    // Convert image and profile_pic data to base64 strings if they are stored as binary data
    const posts = results.map(post => {
      const imageBuffer = post.image ? post.image.toString('base64') : null;
      const profilePicBuffer = post.profile_pic ? post.profile_pic.toString('base64') : null;

      return {
        ...post,
        image: imageBuffer ? `data:image/jpeg;base64,${imageBuffer}` : null,
        profile_pic: profilePicBuffer ? `data:image/jpeg;base64,${profilePicBuffer}` : null,
      };
    });

    res.status(200).json({ posts });
  });
});


// Define the GET route to check the user's reaction
app.get('/post/:post_id/reaction/:user_id', (req, res) => {
  const { post_id, user_id } = req.params;

  try {
    const query = `
      SELECT reaction_type 
      FROM likes_dislikes 
      WHERE post_id = ? AND user_id = ?;
    `;

    db.query(query, [post_id, user_id], (error, results) => {
      if (error) {
        console.error('Error fetching user reaction:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (results.length > 0) {
        const reaction = results[0].reaction_type;
        res.json({
          hasLiked: reaction === 'like',
          hasDisliked: reaction === 'dislike'
        });
      } else {
        res.json({
          hasLiked: false,
          hasDisliked: false
        });
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Logout Route
app.post('/logout', (req, res) => {
    req.session.isLoggedIn = false; // Set isLoggedIn to false
    // req.session.destroy(err => {
    //     if (err) {
    //         return res.status(500).json({ message: 'An error occurred while logging out.' });
    //     }
    //     res.clearCookie('litarcpages_sid');
    //     res.status(200).json({ message: 'Logout successful' });
    // });
});

// Profile Route
app.get('/profile/:user_id', (req, res) => {
    const user_id = req.params.user_id;

    const query = 'SELECT * FROM users WHERE user_id = ?';
    db.query(query, [user_id], (err, results) => {
        if (err) {
            console.error('Error fetching user data:', err);
            return res.status(500).json({ message: 'An error occurred while fetching user data.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(results[0]);
    });
});

//Particular users-posts
app.get('/user-posts/:user_id', (req, res) => {
  const user_id = req.params.user_id;
  const query = `
      SELECT 
          posts.*, 
          users.username, 
          users.profile_pic 
      FROM 
          posts 
      JOIN 
          users 
      ON 
          posts.user_id = users.user_id
      WHERE
          posts.user_id = ?;
  `;

  db.query(query, [user_id], (err, results) => {
      if (err) {
          console.error('Error fetching posts:', err);
          return res.status(500).json({ error: 'Error fetching posts' });
      }

      const posts = results.map(post => {
          const imageBuffer = post.image ? post.image.toString('base64') : null;
          const profilePicBuffer = post.profile_pic ? post.profile_pic.toString('base64') : null;

          return {
              ...post,
              image: imageBuffer ? `data:image/jpeg;base64,${imageBuffer}` : null,
              profile_pic: profilePicBuffer ? `data:image/jpeg;base64,${profilePicBuffer}` : null,
          };
      });

      res.status(200).json({ posts });
  });
});


// Create Post Route
app.post('/profile/createpost/:user_id', upload.single('image'), (req, res) => {
    const { title, category, content } = req.body;
    const user_id = req.params.user_id;

    const image = req.file ? req.file.buffer : null;

    const post = {
        title,
        category,
        content,
        image,
        user_id
    };

    const query = 'INSERT INTO posts SET ?';
    db.query(query, post, (err, result) => {
        if (err) {
            console.error('Error saving post:', err);
            return res.status(500).json({ message: 'An error occurred while saving the post.' });
        }

        res.status(200).json({
            message: 'Post created successfully!',
            // Include user data in the response
        });
    });
});

// Edit Profile Route
app.post('/edit-profile/:userId', upload.single('image'), (req, res) => {
  const { userId } = req.params;
  const { username, bio, lastname, firstname } = req.body;
  const profileImage = req.file ? req.file.buffer : null; // Use the buffer for binary data

  console.log('Request Body:', { username, bio, lastname, firstname });
  console.log('Profile Image:', profileImage ? 'Image provided' : 'No image');

  // Fetch current user details to validate and update
  const getCurrentUserQuery = `
    SELECT username 
    FROM users 
    WHERE user_id = ?
    LIMIT 1
  `;

  db.query(getCurrentUserQuery, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user details:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentUsername = results[0].username;

    // Check if the new username is taken by another user
    let checkUsernameQuery = '';
    let checkUsernameParams = [];
    if (username && username !== currentUsername) {
      checkUsernameQuery = `
        SELECT COUNT(*) as count 
        FROM users 
        WHERE username = ? AND user_id != ?
      `;
      checkUsernameParams = [username, userId];
    }

    if (checkUsernameQuery) {
      db.query(checkUsernameQuery, checkUsernameParams, (err, results) => {
        if (err) {
          console.error('Error checking username availability:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (results.length > 0 && results[0].count > 0) {
          return res.status(400).json({ error: 'Username is already taken' });
        }

        // Update user details
        updateUserDetails(userId, username, bio, lastname, firstname, profileImage, res);
      });
    } else {
      // Update user details if no username check is required
      updateUserDetails(userId, username, bio, lastname, firstname, profileImage, res);
    }
  });
});

function updateUserDetails(userId, username, bio, lastname, firstname, profileImage, res) {
  const updateUserQuery = `
    UPDATE users 
    SET username = COALESCE(?, username),
        bio = COALESCE(?, bio),
        lastname = COALESCE(?, lastname),
        firstname = COALESCE(?, firstname),
        profile_pic = COALESCE(?, profile_pic)
    WHERE user_id = ?
  `;

  db.query(updateUserQuery, [username, bio, lastname, firstname, profileImage, userId], (err) => {
    if (err) {
      console.error('Error updating profile:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    res.status(200).json({ message: 'Profile updated successfully' });
  });
}


//ADMIN

//u.profile_pic  missed
// Fetch all posts  Okk

// Fetch all posts (Admin)
app.get('/api/posts', (req, res) => {
  const query = `
      SELECT p.*, u.username, u.firstname, u.lastname
      FROM posts p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.visibility_admin = 1
  `;
  db.query(query, (err, results) => {
      if (err) {
          console.error('Error fetching posts:', err);
          return res.status(500).json({ message: 'An error occurred while fetching posts.' });
      }
      res.json(results);
  });
});

// Disable a post
app.post('/api/posts/disable', (req, res) => {
  const { post_id } = req.body;
  const query = 'UPDATE posts SET visibility_admin = 0 WHERE post_id = ?';
  db.query(query, [post_id], (err, results) => {
      if (err) {
          console.error('Error disabling post:', err);
          return res.status(500).json({ message: 'An error occurred while disabling the post.' });
      }
      res.json({ message: 'Post disabled successfully.' });
  });
});

// Disable a user
app.post('/api/users/disable', (req, res) => {
  const { user_id } = req.body;
  const query = 'UPDATE users SET disabled_admin = 1 WHERE user_id = ?';
  db.query(query, [user_id], (err, results) => {
      if (err) {
          console.error('Error disabling user:', err);
          return res.status(500).json({ message: 'An error occurred while disabling the user.' });
      }
      res.json({ message: 'User disabled successfully.' });
  });
});

// Users List Admin
app.get('/userlist/:username', (req, res) => {
  const username = req.params.username;

  const query = 'SELECT * FROM USERS WHERE roleid = ?';

  db.query(query, [1], (err, results) => {
    if (err) {
      console.error('Error fetching user list:', err);
      return res.status(500).json({ message: 'An error occurred while fetching user list.' });
    }

    res.json(results);
  });
});


// Fetch all roles
app.get('/admin/roles', (req, res) => {
  const query = 'SELECT roleid, role_name FROM roles';
  db.query(query, (err, results) => {
      if (err) {
          console.error('Error fetching roles:', err);
          res.status(500).json({ message: 'An error occurred while fetching roles.' });
      } else {
          res.json(results);
      }
  });
});

// Fetch users by role
app.get('/admin/users/role/:roleId', (req, res) => {
  const roleId = req.params.roleId;
  const query = 'SELECT * FROM users WHERE roleid = ?';
  db.query(query, [roleId], (err, results) => {
      if (err) {
          console.error('Error fetching users by role:', err);
          res.status(500).json({ message: 'An error occurred while fetching users by role.' });
      } else {
          res.json(results);
      }
  });
});

// Update user role

app.put('/admin/users/role/:userId/:roleId', (req, res) => {
  const userId = req.params.userId;
  const roleid = req.params.roleId;

  console.log("From update role route: roleid: ",roleid," userid: ",userId);
  const query = 'UPDATE users SET roleid = ? WHERE user_id = ?';
  console.log("roleid:", roleid, "userId:", userId);
  
  db.query(query, [roleid, userId], (err, result) => {
    if (err) {
      console.error('Error updating user role:', err);
      res.status(500).json({ message: 'Failed to update user role' });
    } 
    else {
      if (result.affectedRows === 0) {
        res.status(404).json({ message: 'User not found' });
      } else {
        res.status(200).json({ roleid });
      }
    }
  });
});


// Update user status (enable/disable)
app.put('/admin/users/status/:userId', (req, res) => {
  const userId = req.params.userId;
  const { disabled_admin } = req.body; // Ensure the frontend sends `disabled_admin`

  const query = 'UPDATE users SET disabled_admin = ? WHERE user_id = ?';

  db.query(query, [disabled_admin, userId], (err, result) => {
      if (err) {
          console.error('Error updating user status:', err);
          res.status(500).json({ message: 'Failed to update user status' });
      } else {
          if (result.affectedRows === 0) {
              res.status(404).json({ message: 'User not found' });
          } else {
              res.status(200).json({ disabled_admin });
          }
      }
  });
});


  //Status of user
  // app.put('/admin/users/status/:id', (req, res) => {
  //   const userId = req.params.id;
  //   const { status } = req.body;
  //   const query = 'UPDATE USERS SET status = ? WHERE user_id = ?';
  
  //   db.query(query, [status, userId], (err, results) => {
  //     if (err) {
  //       console.log('Error updating user status', err);
  //       return res.status(500).json({ error: 'Error updating user status' });
  //     }
  //     return res.status(200).json({ message: 'User status updated!', status });
  //   });
  // });
//   app.put('/admin/users/status/:userId', (req, res) => {
//     const userId = req.params.userId;
//     const { status } = req.body; // Assuming status is a boolean or 0/1

//     const query = 'UPDATE users SET disabled_admin = ? WHERE user_id = ?';

//     db.query(query, [status, userId], (err, result) => {
//         if (err) {
//             console.error('Error updating user status:', err);
//             res.status(500).json({ message: 'Failed to update user status' });
//         } else {
//             // Check if the update was successful
//             if (result.affectedRows === 0) {
//                 res.status(404).json({ message: 'User not found' });
//             } else {
//                 res.status(200).json({ status });
//             }
//         }
//     });
// });


  // Assign role to user
// app.put('/admin/users/role/:id', (req, res) => {
//     const userId = req.params.id;
//     const { roleid } = req.body;
//     const query = 'UPDATE USERS SET roleid = ? WHERE user_id = ?';
  
//     db.query(query, [roleid, userId], (err, results) => {
//       if (err) {
//         console.log('Error updating user role', err);
//         return res.status(500).json({ error: 'Error updating user role' });
//       }
//       return res.status(200).json({ message: 'User role updated!', roleid });
//     });
// });
  
  // Fetch user profile by username
  app.get('/profile/:username', async (req, res) => {
    try {
      const username = req.params.username;
      const userQuery = 'SELECT * FROM users WHERE username = ?';
      const user = await db.query(userQuery, [username]);
  
      if (!user.length) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Fetch posts for the user
      const postsQuery = 'SELECT * FROM posts WHERE user_id = ?';
      const posts = await db.query(postsQuery, [user[0].user_id]);
  
      res.json({ ...user[0], posts });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  //Handle likes dislike
  app.post('/api/posts/:post_id/like_dislike/:user_id/action', async (req, res) => {
    const { post_id, user_id } = req.params;
    const { action } = req.body; // action should be 'like' or 'dislike'
  
    try {
      const existingEntry = await db.query(
        'SELECT * FROM post_likes_dislikes WHERE post_id = ? AND user_id = ?',
        [post_id, user_id]
      );
  
      if (existingEntry.length > 0) {
        // Update existing entry
        await db.query(
          'UPDATE post_likes_dislikes SET is_liked = ? WHERE post_id = ? AND user_id = ?',
          [action === 'like' ? 1 : 0, post_id, user_id]
        );
      } else {
        // Insert new entry
        await db.query(
          'INSERT INTO post_likes_dislikes (post_id, user_id, is_liked) VALUES (?, ?, ?)',
          [post_id, user_id, action === 'like' ? 1 : 0]
        );
      }
  
      // Calculate likes and dislikes
      const nLikes = await db.query(
        'SELECT COUNT(*) AS count FROM post_likes_dislikes WHERE post_id = ? AND is_liked = 1',
        [post_id]
      );
      const nDislikes = await db.query(
        'SELECT COUNT(*) AS count FROM post_likes_dislikes WHERE post_id = ? AND is_liked = 0',
        [post_id]
      );
  
      // Update post counts
      await db.query(
        'UPDATE posts SET n_likes = ?, n_dislikes = ? WHERE post_id = ?',
        [nLikes[0].count, nDislikes[0].count, post_id]
      );
  
      res.status(200).json({ nLikes: nLikes[0].count, nDislikes: nDislikes[0].count });
    } catch (error) {
      console.error('Error liking/disliking post:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  


// Like a post
app.post('/post/:postId/like/:userId', (req, res) => {
  const postId = req.params.postId;
  const userId = req.params.userId;

  // Check if the user has already reacted to this post
  const checkQuery = `
    SELECT reaction_type FROM likes_dislikes

    WHERE user_id = ? AND post_id = ?
  `;

  db.query(checkQuery, [userId, postId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length > 0) {
      const currentReaction = results[0].reaction_type;

      if (currentReaction === 'like') {
        // Remove like
        const deleteQuery = `
          DELETE FROM likes_dislikes

          WHERE user_id = ? AND post_id = ? AND reaction_type = 'like'
        `;
        db.query(deleteQuery, [userId, postId], (err) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          // Update the post like count
          const updateQuery = `
            UPDATE posts
            SET n_likes = n_likes - 1
            WHERE post_id = ?
          `;
          db.query(updateQuery, [postId], (err) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            res.status(200).json({ message: 'Like removed' });
          });
        });
      } else if (currentReaction === 'dislike') {
        // Change dislike to like
        const updateQuery = `
          UPDATE likes_dislikes

          SET reaction_type = 'like'
          WHERE user_id = ? AND post_id = ?
        `;
       db.query(updateQuery, [userId, postId], (err) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          // Update the post like and dislike counts
          const countUpdateQuery = `
            UPDATE posts
            SET n_likes = n_likes + 1, n_dislikes = n_dislikes - 1
            WHERE post_id = ?
          `;
          db.query(countUpdateQuery, [postId], (err) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            res.status(200).json({ message: 'Liked' });
          });
        });
      }
    } else {

      
      // Insert like reaction
      const insertQuery = `
        INSERT INTO likes_dislikes (user_id, post_id, reaction_type)
        VALUES (?, ?, 'like')
      `;
      db.query(insertQuery, [userId, postId], (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Update the post like count
        const updateQuery = `
          UPDATE posts
          SET n_likes = n_likes + 1
          WHERE post_id = ?
        `;
        db.query(updateQuery, [postId], (err) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.status(200).json({ message: 'Liked' });
        });
      });
    }
  });
});

// Dislike a post
app.post('/post/:postId/dislike/:userId', (req, res) => {
  const postId = req.params.postId;
  const userId = req.params.userId;

  // Check if the user has already reacted to this post
  const checkQuery = `
    SELECT reaction_type FROM likes_dislikes

    WHERE user_id = ? AND post_id = ?
  `;

  db.query(checkQuery, [userId, postId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length > 0) {
      const currentReaction = results[0].reaction_type;

      if (currentReaction === 'dislike') {
        // Remove dislike
        const deleteQuery = `
          DELETE FROM likes_dislikes
          WHERE user_id = ? AND post_id = ? AND reaction_type = 'dislike'
        `;
        db.query(deleteQuery, [userId, postId], (err) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          // Update the post dislike count
          const updateQuery = `
            UPDATE posts
            SET n_dislikes = n_dislikes - 1
            WHERE post_id = ?
          `;
          db.query(updateQuery, [postId], (err) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            res.status(200).json({ message: 'Dislike removed' });
          });
        });
      } else if (currentReaction === 'like') {
        // Change like to dislike
        const updateQuery = `
          UPDATE likes_dislikes
          SET reaction_type = 'dislike'
          WHERE user_id = ? AND post_id = ?
        `;
        db.query(updateQuery, [userId, postId], (err) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          // Update the post like and dislike counts
          const countUpdateQuery = `
            UPDATE posts
            SET n_likes = n_likes - 1, n_dislikes = n_dislikes + 1
            WHERE post_id = ?
          `;
          db.query(countUpdateQuery, [postId], (err) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            res.status(200).json({ message: 'Disliked' });
          });
        });
      }
    } else {
      // Insert dislike reaction
      const insertQuery = `
        INSERT INTO likes_dislikes (user_id, post_id, reaction_type)
        VALUES (?, ?, 'dislike')
      `;
      db.query(insertQuery, [userId, postId], (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Update the post dislike count
        const updateQuery = `
          UPDATE posts
          SET n_dislikes = n_dislikes + 1
          WHERE post_id = ?
        `;
        db.query(updateQuery, [postId], (err) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.status(200).json({ message: 'Disliked' });
        });
      });
    }
  });
});

// Add a comment to a post
app.post('/post/:postId/acomment', (req, res) => {
  const postId = req.params.postId;
  const { user_id, comment_txt } = req.body;

  if (!user_id || !comment_txt) {
    return res.status(400).json({ message: 'User ID and comment text are required.' });
  }

  const query = `
    INSERT INTO comments (post_id, user_id, comment_txt) 
    VALUES (?, ?, ?)
  `;
  db.query(query, [postId, user_id, comment_txt], (err, results) => {
    if (err) {
      console.error('Error inserting comment into the database:', err.message);
      return res.status(500).json({ message: 'Error adding comment.', error: err.message });
    }

    // Fetch the user's profile pic and username after inserting the comment
    const commentId = results.insertId;
    const userQuery = `
      SELECT u.username, u.profile_pic 
      FROM users u 
      WHERE u.user_id = ?
    `;
    db.query(userQuery, [user_id], (err, userResults) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching user details.', error: err.message });
      }

      const user = userResults[0];
      res.status(201).json({ 
        message: 'Comment added successfully!', 
        commentId, 
        user: {
          username: user.username,
          profile_pic: user.profile_pic
        }
      });
    });
  });
});

// Get comments for a particular post
app.get('/comments/:postId', (req, res) => {
  const postId = req.params.postId;
  
  // SQL query to get comments, username, and profile_pic for a post
  const q = `
    SELECT 
      comments.comment_txt, 
      users.username, 
      users.profile_pic 
    FROM 
      comments 
    JOIN 
      users 
    ON 
      comments.user_id = users.user_id 
    WHERE 
      comments.post_id = ?;
  `;

  // Execute the query
  db.query(q, [postId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching details.", error: err.message });
    }

    // Convert profile_pic from binary to base64 for each comment
    const comments = results.map(comment => {
      const profilePicBuffer = comment.profile_pic ? comment.profile_pic.toString('base64') : null;

      return {
        ...comment,
        profile_pic: profilePicBuffer ? `data:image/jpeg;base64,${profilePicBuffer}` : null,  // Add base64 encoding
      };
    });

    // Return the fetched comments along with username and profile_pic
    res.status(200).json({
      message: 'Comments fetched successfully!',
      comments  // Array of comments with comment_txt, username, and profile_pic
    });
  });
});


// Delete a comment
app.delete('/comment/:commentId', (req, res) => {
  const commentId = req.params.commentId;
  const query = 'DELETE FROM comments WHERE comment_id = ?';
  db.query(query, [commentId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'Comment deleted successfully!' });
  });
});


app.get('/home/popular', (req, res) => {
  // SQL query to get the top 3 popular posts along with user info
  const q = `
    SELECT 
      posts.post_id, 
      posts.title, 
      posts.n_likes, 
      users.username, 
      posts.image
    FROM 
      posts
    JOIN 
      users 
    ON 
      posts.user_id = users.user_id
    ORDER BY 
      posts.n_likes DESC
    LIMIT 3;
  `;

  db.query(q, (err, results) => {
    if (err) {
      console.error('Error fetching popular posts:', err);
      return res.status(500).json({ error: 'Error fetching popular posts' });
    }

    // Convert profile_pic data to base64 strings if they are stored as binary data
    const popularPosts = results.map(post => {
      const profilePicBuffer = post.image ? post.image.toString('base64') : null;

      return {
        ...post,
        profile_pic: profilePicBuffer ? `data:image/jpeg;base64,${profilePicBuffer}` : null,
      };
    });

    res.status(200).json({ popularPosts });
  });
});

// Get a data of disable posts
// Get a data of disabled posts
app.get('/admin/disabledposts', (req, res) => {
  const q = `
    SELECT posts.post_id,posts.title, posts.image, users.username, users.profile_pic
    FROM posts
    JOIN users ON posts.user_id = users.user_id
    WHERE posts.visibility_admin = 0
  `;

  db.query(q, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching disabled posts.' });
    }

    // Convert image and profile_pic data to Base64 strings if they are stored as binary data
    const formattedResults = results.map(post => {
      const imageBuffer = post.image ? post.image.toString('base64') : null;
      const profilePicBuffer = post.profile_pic ? post.profile_pic.toString('base64') : null;

      return {
        ...post,
        image: imageBuffer ? `data:image/jpeg;base64,${imageBuffer}` : null,  // Convert image binary to Base64
        profile_pic: profilePicBuffer ? `data:image/jpeg;base64,${profilePicBuffer}` : null,  // Convert profile_pic binary to Base64
      };
    });

    // Send formatted results
    res.json(formattedResults);
  });
});


// Enable a post by updating visibility_admin to 0
app.put('/admin/enablepost/:post_id', (req, res) => {
  const postId = req.params.post_id;
  const q = 'UPDATE posts SET visibility_admin = 1 WHERE post_id = ?';
  db.query(q, [postId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error enabling post.' });
    res.json({ message: 'Post enabled successfully.' });
  });
});

// Delete a post by post_id
app.delete('/admin/deletepost/:post_id', (req, res) => {
  const postId = req.params.post_id;
  const q = 'DELETE FROM posts WHERE post_id = ?';
  db.query(q, [postId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error deleting post.' });
    res.json({ message: 'Post deleted successfully.' });
  });
});

app.use(express.static(path.join(_dirname,"/frontend/build")));

app.get('*',(req,res)=>{
  res.sendFile(path.resolve(_dirname,"frontend","build","index.html"));
})
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});



// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});