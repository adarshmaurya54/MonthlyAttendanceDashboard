const Student = require("../models/student");
const mongoose = require("mongoose");

exports.getAllStudents = async(req, res) => {
    try{
        const result = await Student.find({});
        res.status(200).json({students: result})
    }catch(error){
        res.status(500).json({ error: error });
    }
}