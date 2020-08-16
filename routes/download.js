const express = require('express');
const router = express.Router();
const cors = require('cors');
const fs = require('fs');

router.get('/',
//   cors({
//     exposedHeaders: ['Content-Disposition'],
//   }),
  async (req, res) => {
    try {
        var userGUID = req.header('x-user-guid');
        const fileName = 'JDawgtorsStructureGenDataPack-'+userGUID+'.zip'
        const fileURL = 'zip_output/'+fileName;
        res.download(fileURL);
        // const stream = fs.createReadStream(fileURL);
        // res.set({
        //     'Content-Disposition': `attachment; filename='${fileName}'`,
        //     'Content-Type': 'application/zip',
        // });
        // //res.download(fileURL);
        // console.log('download requested: '+fileName);
        // stream.pipe(res);
    } catch (e) {
      console.error(e)
      res.status(500).end();
    }
});

module.exports = router;