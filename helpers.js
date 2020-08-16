const fileFilter = function(req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(nbt|NBT)$/)) {
        req.fileValidationError = 'Only nbt files are allowed!';
        return cb(new Error('Only nbt files are allowed!'), false);
    }
    cb(null, true);
};
exports.fileFilter = fileFilter;