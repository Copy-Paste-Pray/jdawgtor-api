const express = require('express');
const router = express.Router();
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const helpers = require('../helpers');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        var userGUID = req.header('x-user-guid');
        const uploadPath = `./nbt_upld/${userGUID}`;
        fs.mkdirSync(uploadPath, { recursive: true })
        cb(null, uploadPath);
    },

    // By default, multer removes file extensions so let's add them back
    filename: function(req, file, cb) {
        //console.log(req.headers);
        var userGUID = req.header('x-user-guid');
        cb(null,file.originalname);
        //cb(null,  + '-' +userGUID + path.extname(file.originalname));
    }
});

router.post('/',cors(), function(req, res, next) {
    try{
        let upload = multer({ storage: storage, fileFilter: helpers.fileFilter }).array('files', 10);

        upload(req, res, function(err) {
            if (req.fileValidationError) {
                return res.send(req.fileValidationError);
            }
            else if (!req.files) {
                return res.send('Please select a file to upload');
            }
            else if (err instanceof multer.MulterError) {
                return res.send(err);
            }
            else if (err) {
                return res.send(err);
            }
    
            let result = [];
            const files = req.files;
            let index, len;
    
            // Loop through all the uploaded files and display them on frontend
            for (index = 0, len = files.length; index < len; ++index) {
                result.push(files[index].filename);
            }
            res.send(result);
        });

    }catch(err){
        console.error(err);
    }
});

module.exports = router;