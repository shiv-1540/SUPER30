const mysql = require('mysql');
const cors=require("cors");

// Create a connection to the database
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "blog",
  port:"3306"
});

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:3001', // Update with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(cookieParser());
application.use()
// Connect to the database
connection.connect((err) => {
  if (err){
    console.log('the error is ',err)
    return
  };
  console.log('Connected to the database.');
});

module.exports = connection;