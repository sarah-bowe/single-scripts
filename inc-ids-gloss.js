const fs = require('fs')
const path = require('path')

const dir = path.join(process.cwd(), "OEBPS/text")

const getFileNames = from => fs.readdirSync(from).filter(file_name => file_name.includes('.xhtml'))

const getContents = (from, files) =>
  files.map(file => {
    return {filename: file, contents: fs.readFileSync(path.join(from, file), 'utf8')}
  })

const readXhtmlFiles = from => getContents(from, getFileNames(from))

const writeXhtmlFiles = (to, file_data) =>
  file_data.forEach(file =>
    fs.writeFileSync(path.join(to, file.filename), file.contents, 'utf8')
  );

(function () {
  const data = readXhtmlFiles(dir)
  let current_page = 0
  for (let i = 0; i < data.length; i++) {
    data[i].contents = data[i].contents.replace(/id="glossterm-"/g, () => {
      current_page++
      return `id="glossterm-${current_page}"`
    })
  }
  writeXhtmlFiles(dir, data)
})()


// run 'node inc-ids' in the command line