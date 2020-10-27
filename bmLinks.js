// Purpose: Replace old links with the new ones.

// Accesses file system and path modules
const fs = require('fs')
const path = require('path')

// Adds "OEBPS/text" to end of the path of the current working directory
const dir = path.join(process.cwd(), "OEBPS/text")

// Produces an array of the filenames within the directory with a filter
const getFileNames = from => fs.readdirSync(from).filter(file_name => file_name.includes('.xhtml'))

// Produces an array of objects: the filenames and contents of each file in the getFileNames array
const getContents = (from, files) =>
  files.map(file => {
    return {filename: file, contents: fs.readFileSync(path.join(from, file), 'utf8')}
  })

// Places the array of objects from getContents into readXhtmlFiles
const readXhtmlFiles = from => getContents(from, getFileNames(from))

// Produces an array of objects with the path and new file contents
const writeXhtmlFiles = (to, file_data) =>
  file_data.forEach(file =>
    fs.writeFileSync(path.join(to, file.filename), file.contents, 'utf8')
  );

// Finds external links, uses ids to find internal link couterpart, replaces exLink with inLink.
// (function () {
//   const data = readXhtmlFiles(dir)
//   for (let i = 0; i < data.length; i++) {

//     // Searches files for external links.
//     let exLinksArray = data[i].contents.match(/..\/(Insights|Applications|Profiles|Tours)\/([^"]+)/g)
//     if (exLinksArray != null && exLinksArray.length >= 1){

//       // Splits each link path in exLinksArray and grabs the id.
//       exLinksArray.forEach(linkPathId => {
//         let linkArray = linkPathId.split('#')
//         let linkId = linkArray[1]

//         // Searches files for internal links with desired ids.
//         let re1 = new RegExp('SwindollStBible02_body([^"]+)#' + linkId, 'g')
//         for (let j = 0; j < data.length; j++) {
//           let inLinksArray = data[j].contents.match(re1)

//           // Replaces the old link (from the first regex) with the new one (from the second regex).
//           if (inLinksArray != null && inLinksArray.length >= 1){
//             data[i].contents = data[i].contents.replace(linkPathId, inLinksArray[0])
//             break
//           }
//         }
//       })
//     }
//   }

// Finds external links, searches where ids are used, replaces exLink with filename where id is used.
(function () {
  const data = readXhtmlFiles(dir)
  for (let i = 0; i < data.length; i++) {

    // Searches files for external links.
    let exLinksArray = data[i].contents.match(/FILENAME#([^"]+)/g)
    if (exLinksArray != null && exLinksArray.length >= 1){

      // Splits each link path in exLinksArray and grabs the id.
      exLinksArray.forEach(linkPathId => {
        let linkArray = linkPathId.split('#')
        let linkPath = linkArray[0]
        let linkId = linkArray[1]

        // Searches files for where those ids are used and grabs the filename.
        let re1 = new RegExp('id="' + linkId + '"', 'g')
        for (let j = 0; j < data.length; j++) {
          // If an id is found, grabs the filename of that file and replaces the external link path
          if (data[j].contents.match(re1)){
            let arrayLoc = j
            data[i].contents = data[i].contents.replace(linkPath, data[arrayLoc].filename)
            break
          }
        }
      })
    }
  }
  writeXhtmlFiles(dir, data)
})()