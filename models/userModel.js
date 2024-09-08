const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Please add the user name."]
        },
        email: {
            type: String,
            required: [true, "Please add the email."],
            unique: [true, "This email is already registered."]
        },
        password: {
            type: String,
            required: [true, "Please add the user password."]
        },
        refresh_token: {
            type: String,
        },
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("User", userSchema);
