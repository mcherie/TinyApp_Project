var express = require('express')
var app = express()
var PORT = 8080 // default port 8080

const cookieParser = require('cookie-parser')
app.use(cookieParser())

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }))

app.set('view engine', 'ejs')

var urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
}

function generateRandomString () {
  return Math.floor((1 + Math.random()) * 0x10000000).toString(36)
}

app.get('/', (req, res) => {
  res.send('Hello!')
})

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase)
})

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n')
})

app.get('/urls', (req, res) => {
  let templateVars = { 
        urls: urlDatabase,
        username: req.cookies.username
}
  res.render('urls_index', templateVars) // redirect //
})

app.get('/urls/new', (req, res) => {
    let templateVars = {
        username: req.cookies.username
      }
  res.render('urls_new', templateVars)
})

app.post('/urls', (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  let newShortURL = generateRandomString() // to generate a new random string
  // console.log(newShortURL)

    // const formattedURL = function(incomingLongURL) {
    //     let something 
    //     if (incomingLongURL.startsWith("http")) {
    //         return incomingLongURL; 
    //     } else {
    //         return "http://" + incomingLongURL
    //     }
    // } 
    // let newLongURL = formattedURL(incomingLongURL)

// I can declare a new variable here to use, then replace the req.body.longURL later with incomingLongURL
    // const incomingLongURL = req.body.longURL 
  urlDatabase[newShortURL] = req.body.longURL // to add this new info into the urlDatabase
  console.log(urlDatabase) // just for me to see if it got added to the database
  res.redirect('/urls/' + newShortURL) // to redirect to the page which shows his newly created tiny URL
})

app.get('/u/:shortURL', (req, res) => {
  const longURL = req.body.longURL
  res.redirect(longURL)
})

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies.username
  }
  res.render('urls_show', templateVars)
})

app.post('/urls/:shortURL/delete', (req, res) => {
    delete urlDatabase[req.params.shortURL]
    res.redirect('/urls') // to redirect to the page which shows his newly created tiny URL
})

app.post('/urls/:shortURL/update', (req, res) => {
    const shortURL = req.params.shortURL
    const newLongURL = req.body.longURL
    urlDatabase[shortURL] = newLongURL // to add this new info into the urlDatabase
    // urlDatabase[req.params.shortURL] = req.body.longURL
    res.redirect('/urls/') // to redirect to the page which shows his newly created tiny URL
})

app.post('/login', (req, res) => {
    const username = req.body.username
    res.cookie("username", username)
    // res.send("Okay")
    res.redirect('/urls/') // to redirect to the page which shows his newly created tiny URL
})

app.post('/logout', (req, res) => {
    res.clearCookie("username");
    res.redirect('/urls/') // to redirect to the page which shows his newly created tiny URL

})







app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
})
