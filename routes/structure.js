var express = require('express');
var router = express.Router();
var cors = require('cors');
const fs = require('fs');
const fsx = require('fs-extra');
const archiver = require('archiver');
const { parse } = require('path');

/* GET users listing. */
router.post('/',cors(), async function(req, res, next) {
  var msgOpts = req.body;
  var sgver = msgOpts[0].sgver;

  if(sgver=='1.3.0' || sgver=='1.3.1'){
    console.log(sgver,"\r\n======================================================================");
    //console.log(msgOpts);
    
    await generate(msgOpts,sgver);
    setTimeout(function(){
      res.json({pack_response: true});
    }, 3000);
  } // end version 1.3.1
});

async function generate(msgOpts,sgver){
  var mcFNFilePath = './assets/'+sgver+'/structure_pack_base/data/structures/functions/generate/structure_types.mcfunction';
  var mcFN = fs.readFileSync(mcFNFilePath, 'utf8');
  var mcFNContent = mcFN;
  var mcFNArray = [];

  var mcLTFilePath = './assets/'+sgver+'/structure_pack_base/data/structures/loot_tables/structure_type.json';
  var mcLT = fs.readFileSync(mcLTFilePath, 'utf8');
  var mcLTContent = JSON.parse(mcLT);

  var mcYRFilePath = './assets/'+sgver+'/structure_pack_base/data/structures/functions/y_range/structure_types.mcfunction';
  var mcYR = fs.readFileSync(mcYRFilePath, 'utf8');
  var mcYRContent = mcYR;
  var mcYRArray = [];

  var mcYRJSONFilePath = './assets/'+sgver+'/structure_pack_base/data/structures/loot_tables/y_range/custom.json';
  var mcYRJSON = fs.readFileSync(mcYRJSONFilePath, 'utf8');
  var mcYRJSONContent = JSON.parse(mcYRJSON);
  console.log(mcYRJSONContent);

  var userDir = './sgpack_temp/'+msgOpts[0].userGUID;
  var userGUID = msgOpts[0].userGUID;
  var strPackDest = userDir;

  // Delete all the user pack folder/files so we can run it again
  // await deleteFolder(strPackDest);

  // create a folder for USER GUID
  console.log('1. Create User SGPack Temp Folder');
  fsx.pathExists(userDir,(err,exists) => {
    //console.log(exists);
    if(!exists){
      //createUserSGTempFolder(userDir);
    }else{
      console.log('User Folder Exists');
    }
  })

  // copy in all the static files
  var strPackSource = './assets/'+sgver+"/structure_pack_base";
  console.log('2. COPY PACK BASE: ',strPackSource,strPackDest);
  await copyBasePackToUser(strPackSource,strPackDest+'/');

  var newStrPackMCFNFile = strPackDest+'/data/structures/functions/generate/structure_types.mcfunction';
  var newStrPackMCLTFile = strPackDest+'/data/structures/loot_tables/structure_type.json';
  

  // Setup the Data Replacements for the files
  console.log('3. Replace Structure Vars');
  await replaceStructureVars(msgOpts,mcFNArray,mcFNContent,mcLTContent,mcFN,mcYRArray,mcYRContent,mcYR,mcYRJSONContent,strPackDest);

  console.log('4. Write new MCFN File');
  await writeNewFile('mcfn',newStrPackMCFNFile,mcFNArray);

  console.log('5. Write new Loot Table File');
  await writeNewFile('mclt',newStrPackMCLTFile,mcLTContent);

  // Copy Structure Files
  var upldStructDir = './nbt_upld/'+userGUID;
  var upldStuctDest = strPackDest+'/data/structures/structures';
  console.log('6. COPY UPLOADED STRUCTURES: ',upldStructDir,upldStuctDest);
  await copyUpldStructures(upldStructDir,upldStuctDest);

  // Zip up the whole package
  console.log('7. Zip it all up!');
  var zipFilename = await zipItUp(userGUID,strPackDest);
  //console.log(zipFilename);

  console.log('Download ready!');
};
///////////////////////////////////////////////////

function createUserSGTempFolder(userDir){
  if (!fs.existsSync(userDir)){
    fs.mkdirSync(userDir);
    fs.chmod(userDir,0o700,function(){
     // console.log(userDir+' set to 0o700, we hope');
    });
    console.log('User DIR Created: ',userDir);
  }else{
    console.error('User folder not created: ',userDir);
  }
}

async function copyBasePackToUser (strPackSource,strPackDest) {
  try {
    await fsx.copy(strPackSource,strPackDest)
    console.log('Base pack copied to user')
  } catch (err) {
    console.error(err)
  }
}

async function copyUpldStructures (upldStructDir,upldStuctDest) {
  try {
    await fsx.copy(upldStructDir,upldStuctDest)
    console.log('Uploaded Structures')
  } catch (err) {
    console.error(err)
  }
}

function replaceStructureVars(msgOpts,mcFNArray,mcFNContent,mcLTContent,mcFN,mcYRArray,mcYRContent,mcYR,mcYRJSONContent,strPackDest){
  // LOOP THROUGH ALL THE UPLOADED STRUCTURES
  msgOpts.forEach(thisMSG => {
    //console.log(thisMSG);
    
    var fileNoExt = thisMSG.filename.slice(0, -4);
    var structIdRng = Math.floor((Math.random() * 1000) + 1);
    // mcFN Replacements
    if(thisMSG.rotation=='yes'){
      var rotateLine = "execute as @e[type=armor_stand,tag=located,tag=s_structure,scores={s_type=<STRUCT_ID>},tag=s_kill] run function structures:generate/rotate";
      mcFNContent = mcFNContent.replace(/\<STRUCT_ROTATION\>/g,rotateLine);
    }else{
      mcFNContent = mcFNContent.replace(/\<STRUCT_ROTATION\>/g,'');
    }
    mcFNContent = mcFNContent.replace(/\<STRUCT_ID\>/g,structIdRng);
    mcFNContent = mcFNContent.replace(/\<STRUCT_PLACEMENT\>/g,thisMSG.placement);
    mcFNContent = mcFNContent.replace(/\<POSX\>/g,thisMSG.posx);
    mcFNContent = mcFNContent.replace(/\<POSY\>/g,thisMSG.posy);
    mcFNContent = mcFNContent.replace(/\<POSZ\>/g,thisMSG.posz);
    mcFNContent = mcFNContent.replace(/\<STRUCT_NAME\>/g,fileNoExt);
    mcFNContent += "\r\n\r\n";
    mcFNArray.push({mcFNContent});
    mcFNContent = mcFN;
    
    // Add Dimension/Biome Conditional Predicates
    var conditions = {};
    var condBase = [{condition:"minecraft:location_check",predicate:null}];
    var condCnt = 0;
    if(thisMSG.dimension!==null && thisMSG.dimension!=='custom'){
      conditions.dimension=thisMSG.dimension;
      condCnt++;
    }else if(thisMSG.dimensionOther!==""){
      conditions.dimension=thisMSG.dimensionOther;
      condCnt++;
    }
    if(thisMSG.biome!==null && thisMSG.biome!=='custom'){
      conditions.biome=thisMSG.biome;
      condCnt++;
    }else if(thisMSG.biomeOther!==""){
      conditions.biome=thisMSG.biomeOther;
      condCnt++;
    }
    if(condCnt > 0){
      condBase[0].predicate = {...conditions};
    }else{
      condBase = [];
    }
    var newEntry = {type:"item",name:"minecraft:diamond_hoe",weight: parseInt(thisMSG.weight,10),conditions:condBase,functions:[{function: "set_count",count: structIdRng}]};
    mcLTContent.pools[0].entries.push(newEntry);
    //console.log('mcLT: ',mcLTContent);

    if(thisMSG.yRangeMin && thisMSG.yRangeMax){
      //console.log(thisMSG.yRangeMin,thisMSG.yRangeMax);
      mcYRContent = mcYRContent.replace(/\<STRUCT_ID\>/g,structIdRng);
      mcYRContent = mcYRContent.replace(/\<STRUCT_NAME\>/g,fileNoExt);
      mcYRContent += "\r\n\r\n";
      mcYRArray.push({mcYRContent});
      var yrMin = parseInt(thisMSG.yRangeMin,10);
      var yrMax = parseInt(thisMSG.yRangeMax,10);
      console.log(typeof yrMin, typeof yrMax)
      var newYRFunction = {"function": "set_count","count": {"min": yrMin,"max": yrMax}};
      mcYRJSONContent.pools[0].entries[0].functions.push(newYRFunction);
      var newStrPackMCYRFile = strPackDest+'/data/structures/loot_tables/y_range/'+fileNoExt+'.json';
      writeNewFile('mcyrjson',newStrPackMCYRFile,mcYRJSONContent);
      mcYRContent = mcYR;
    }
  });
  if(mcYRArray){
    console.log('5b. Write new YRange MCFN File');
    //console.log(mcYRContent);
    var newStrPackMCYRFile = strPackDest+'/data/structures/functions/y_range/structure_types.mcfunction';
    writeNewFile('mcyr',newStrPackMCYRFile,mcYRArray);
  }
}

function writeNewFile(filetype,filename,structureFileContentArray){
  if(filetype=='mcfn'){
    var MCFNfileToWrite = fs.createWriteStream(filename);
    MCFNfileToWrite.on('error', function(err) { /* error handling */ });
    structureFileContentArray.forEach(function(el) { MCFNfileToWrite.write(el.mcFNContent); });
    MCFNfileToWrite.end();
    console.log("MCFUNCTION file is saved.");
  }
  if(filetype=='mclt'){
    var MCLTJSONtoWrite = JSON.stringify(structureFileContentArray);
    fs.writeFileSync(filename, MCLTJSONtoWrite);
    console.log("MCLootTable file is saved.");
  }
  if(filetype=='mcyr'){
    var MCYRfileToWrite = fs.createWriteStream(filename);
    MCYRfileToWrite.on('error', function(err) { /* error handling */ });
    structureFileContentArray.forEach(function(el) { MCYRfileToWrite.write(el.mcYRContent); });
    MCYRfileToWrite.end();
    console.log("MC YRange FN file is saved.");
  }
  if(filetype=='mcyrjson'){
    var MCYRJSONtoWrite = JSON.stringify(structureFileContentArray);
    fs.writeFileSync(filename, MCYRJSONtoWrite);
    console.log("YRange LootTable file is saved.");
  }

}

function zipItUp(userGUID,strPackDest){
  // ZIP it all up!
  var zipOutputDir = './zip_output';
  var zipFilename = zipOutputDir+'/JDawgtorsStructureGenDataPack-'+userGUID+'.zip';
  var outputArchive = fs.createWriteStream(zipFilename);
  var archive = archiver('zip');

  outputArchive.on('close', function () {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver done.');
  });

  archive.on('error', function(err){
      throw err;
  });

  archive.pipe(outputArchive);
  archive.directory(strPackDest, false);
  archive.finalize();
  return zipFilename;
}

function deleteFolder(folder){
  if (fs.existsSync(folder)){
    fs.rmdir(folder, { recursive: true }, (err) => {
      if (err) {
          throw err;
      }
      console.log(`DELETE Folder: ${folder}`);
    });
  }
}

function deleteFile(filename){
  if (fs.existsSync(filename)){
    fs.unlink(filename, function (err) {
      if (err) throw err;
      // if no error, file has been deleted successfully
      console.log('File Deleted: '+filename);
    });
  }else{
    console.error('Can\'t delete '+filename+', it doesn\'t exist');
  }
}

module.exports = router;