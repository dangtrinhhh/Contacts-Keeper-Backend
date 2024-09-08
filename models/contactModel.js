const { mdiTimerStar } = require("@mdi/js");
const mongoose = require("mongoose");

const contactSchema = mongoose.Schema(
    {   
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User"
        },
        name: {
            type: String,
            required: [true, "Please add the username"]
        },
        email: {
            type: String,
        },
        phone_number: {
            type: String,
            required: [true, "Please add the phone number"]
        },
        address: {
            type: String,
        },
        date_of_birth: {
            type: mongoose.Schema.Types.Date
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Contact", contactSchema);
