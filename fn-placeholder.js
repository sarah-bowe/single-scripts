// Purpose: Search for #FILENAME# placeholder throughout several files and replace it with the real filename.

// Accesses file system and path modules
const fs = require('fs')
const path = require('path')

// Adds "OEBPS/text" to end of the path of the current working directory
const dir = path.join(process.cwd(), "OEBPS/text")

// Produces an array of the filenames within the directory that include ".xhtml"
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

// Searches each file's contents for #FILENAME# and replaces it with the real filename
(function () {
  const data = readXhtmlFiles(dir)
  for (let i = 0; i < data.length; i++) {
    data[i].contents = data[i].contents.replace(/#FILENAME#/g, () => {
      return data[i].filename
    })
  }
  writeXhtmlFiles(dir, data)
})()