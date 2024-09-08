const asyncHandler = require("express-async-handler");
const Contact = require("../models/contactModel")
const moment = require('moment');

// @desc(description) Get all contacts data
// @route GET /api/contacts
// @access private
const getAllContacts = asyncHandler(async (req, res) => {
    const contacts = await Contact.find({ user_id: req.user.id }); // if not use await => processing...
    res.status(200).json(contacts)
});

// @desc(description) Get specific contact data
// @route GET /api/contacts/:id
// @access private
const getSpecificContact = asyncHandler(async (req, res) => {
    console.log("🚀 ~ req.params:", req.params)
    const contact = await Contact.find({ user_id: req?.params?.id });
    if (!contact) {
        res.status(404);
        throw new Error("Contact not found !");
    }

    res.status(200).json(contact)
});

// @desc(description) Create contact
// @route POST /api/contacts
// @access private
const createContact = asyncHandler(async (req, res) => {
    const { user_id, name, email, phone_number, address, date_of_birth } = req.body;

    if(!user_id || !name || !email || !phone_number ||!address) {
        res.status(400)
        throw new Error("Name and phone number fields are mandatory !")
    }

    const contact = await Contact.create({
        user_id: user_id,
        name,
        email,
        phone_number,
        address,
        date_of_birth
    });
    
    res.status(201).json(contact)
});

// @desc(description) Update contact data
// @route PUT /api/contacts/:id
// @access private
const updateContact = asyncHandler(async (req, res) => {
    const contact = await Contact.findById(req.params.id);
    console.log("🚀 ~ contact:", contact)
    const { _id, ...new_contact } = req.body;
    console.log("🚀 ~ _id:", _id)
    const dateOfBirth = moment(req.body.date_of_birth, 'DD/MM/YYYY').toDate();
    console.log("🚀 ~ dateOfBirth:", dateOfBirth)

    if (!contact) {
        res.status(404);
        throw new Error("Contact not found !");
    }
    console.log("🚀 ~ contact:", contact)

    if (contact?.user_id?.toString() !== req?.user?.id) {
        req.status(403);
        throw new Error("User don't have permission to update other user contacts !")
    }
    console.log("🚀 ~ contact:", contact)

    try {
        const updatedContact = await Contact.findByIdAndUpdate(
            _id,
            { ...new_contact, date_of_birth: dateOfBirth },
            { new: true }
        );
        console.log("🚀 ~ contact:", contact)

        
        res.status(200).json(updatedContact)
    } catch (err) { 
        console.log(err) 
        res.status(400).json("Internal Server Error")
    }
    console.log("🚀 ~ contact:", contact)

});

// @desc(description) Delete contact data
// @route DELETE /api/contacts/:id
// @access private
const deleteContact = asyncHandler(async (req, res) => {
    const contact = await Contact.findById(req?.params?.id);
    if (!contact) {
        res.status(404);
        throw new Error("Contact not found !");
    }

    if (contact?.user_id?.toString() !== req?.user?.id) {
        req.status(403);
        throw new Error("User don't have permission to delete other user contacts !")
    }

    try {
        // await Contact.remove()
        const deletedContact = await Contact.findByIdAndDelete(req.params.id);
        res.status(200).json(deletedContact)
    } catch (err) { 
        console.log(err) 
        res.status(400).json("Internal Server Error")
    }
});

module.exports = { 
    getAllContacts,
    getSpecificContact, 
    createContact, 
    updateContact, 
    deleteContact 
}
