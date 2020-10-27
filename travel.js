// Purpose: Move portions of content between files.

// Accesses file system and path modules
const fs = require('fs')
const path = require('path')

// Adds "OEBPS/text" to end of the path of the current working directory
const dir = path.join(process.cwd(), "OEBPS/text")

// Produces an array of the filenames within the directory with a filter
const getFileNames = from => fs.readdirSync(from).filter(file_name => file_name.includes('chapter'))

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

// Searches the array from readXhtmlFiles using the regex
(function () {
  const data = readXhtmlFiles(dir)
  for (let i = 0; i < data.length; i++) {
    let section1 = ''
    let exLinksArray = data[i].contents.match(/..\/(Insights|Applications|Profiles|Tours)\/([^"]+)/g)
    if (exLinksArray != null && exLinksArray.length >= 1){

      // Splits each link path in exLinksArray into two parts
      exLinksArray.forEach(linkPathId => {
        let linkArray = linkPathId.split('#')
        let linkPath = linkArray[0]
        let linkId = linkArray[1]

        var re1 = new RegExp('<div class=".*?" id="' + linkId + '">([\\S\\s]*?)<\/div>', 'gm')

        section1 += fs.readFileSync(path.join(dir, linkPath), 'utf8').match(re1) + '\n'
      })
    }

    let section2 = ''
    let fnLinksArray = data[i].contents.match(/..\/NLT-Textnotes\/([^"]+)/g)
    if (fnLinksArray != null && fnLinksArray.length >= 1){

      // Splits each link path in fnLinksArray into two parts
      fnLinksArray.forEach(fnLinkPathId => {
        let fnLinkArray = fnLinkPathId.split('#')
        let fnLinkPath = fnLinkArray[0]
        let fnLinkId = fnLinkArray[1]

        var re2 = new RegExp('<div class=".*?" id="' + fnLinkId + '">([\\S\\s]*?)<\/div>', 'gm')

        section2 += fs.readFileSync(path.join(dir, fnLinkPath), 'utf8').match(re2) + '\n'
      })
    }

    // Splits the file's contents by the splitKey
    let splitKey = '<footer epub:type="footnotes">'
    let fileContents = data[i].contents.split(splitKey)

    // Adds the following data back to the contents portion of the data array in the following order
    data[i].contents = fileContents[0] + section1 + splitKey + section2 + fileContents[1]
  }
  writeXhtmlFiles(dir, data)
})()