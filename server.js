const express = require("express");
const errorHandler = require("./middleware/errorhandler");
const { connect } = require("mongoose");
const connectDb = require("./config/dbConnection");
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const port = process.env.PORT;

const app = express();

// Get request body
app.use(express.json())
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:3000', credentials: true, })); // To send cookie HTTP-only

app.use("/api/users", require("./routes/usersRoutes"))
app.use("/api/contacts", require("./routes/contactsRoutes"))
// use middleware to handle errors
app.use(errorHandler)

connectDb()

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});