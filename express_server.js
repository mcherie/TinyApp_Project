const express = require('express');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 8080; // default port 8080

const cookieSession = require('cookie-session');
app.use(
  cookieSession({
    name: 'session',
    keys: ['lighthouse-labs'],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  })
);

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

const passwordSalt = 10;

const urlDatabase = {
  b6UTxQ: { longURL: 'https://www.tsn.ca', userID: 'aJ48lW' },
  i3BoGr: { longURL: 'https://www.google.ca', userID: 'aJ48lW' }
};

const users = {
  userRandomID: {
    id: 'aJ48lW',
    email: 'user@example.com',
    password: bcrypt.hashSync('purple-monkey-dinosaur', passwordSalt)
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: bcrypt.hashSync('dishwasher-funk', passwordSalt)
  }
};

// This generates the randoms string for both the tiny app and userID
function generateRandomString () {
  return Math.floor((1 + Math.random()) * 0x10000000).toString(36);
}

app.get('/', (_req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (_req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (_req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

function urlsForUser (id) {
  let urls = {};

  for (let shortURL in urlDatabase) {
    let url = urlDatabase[shortURL];

    if (url.userID === id) {
      urls[shortURL] = url;
    }
  }

  return urls;
}

app.get('/urls', (req, res) => {
  let user_id = req.session.user_id;
  let user = users[user_id];
  let templateVars = {
    urls: urlsForUser(user_id),
    user
  };

  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  let user_id = req.session.user_id;
  let user = users[user_id];

  if (!user) {
    // if they are not logged in, they can not continue
    res.redirect('/login');
  }

  let templateVars = { user };
  res.render('urls_new', templateVars);
});

app.post('/urls', (req, res) => {
  // THIS WHOLE COMMENTED PART IS IF I WANT TO DO A FIX OF ADDING HTTP AT THE BEGINNING IF THE CLIENT DIDN'T
  // let formattedURL = function(incomingLongURL) {
  //     let something
  //     if (incomingLongURL.startsWith("http")) {
  //         return incomingLongURL;
  //     } else {
  //         return "http://" + incomingLongURL
  //     }
  // }
  // let incomingLongURL = req.body.longURL
  // let newLongURL = formattedURL(incomingLongURL)

  // I can declare a new variable here to use, then replace the req.body.longURL later with incomingLongURL
  let newShortURL = generateRandomString();
  let userID = req.session.user_id;

  // Creation of the new object url id
  // let newUserRandomID = generateRandomString()

  urlDatabase[newShortURL] = {
    longURL: req.body.longURL,
    userID
  }

  // Insertion of new person to the object
  req.session.user_id = userID;

  // to redirect to the page which shows his newly created tiny URL
  res.redirect(`/urls/${newShortURL}`);
});

app.get('/u/:shortURL', (req, res) => {
  const url = urlDatabase[req.params.shortURL];

  if (url) {
    res.redirect(url.longURL);
  } else {
    res.status(404).send('Short URL does not exist');
  }
});

app.get('/urls/:shortURL', (req, res) => {
  let user_id = req.session.user_id;
  let user = users[user_id];

  let shortURL = req.params.shortURL;
  let urlObject = urlDatabase[shortURL];
  let longURL = urlObject.longURL;
  let urlUserId = urlObject.userID;

  let templateVars = {
    shortURL: shortURL,
    longURL: longURL,
    urlUserId: urlUserId,
    user: user
  }

  res.render('urls_show', templateVars);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  let userId = req.session.user_id;

  if (userId) {
    // if the are logged in, get short url from DB
    let urlItem = urlDatabase[req.params.shortURL];

    // Check if the url belongs to current user
    if (userId === urlItem.userID) {
      // Only allow deletion if user is logged in
      delete urlDatabase[req.params.shortURL];
    }

    res.redirect('/urls/');
  } else {
    // if they are not loggged in, then bring them to the log in page
    res.redirect('/login');
  }
});

app.post('/urls/:shortURL/update', (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL] = newLongURL; // add this new info into the urlDatabase

  const userID = req.session.user_id;
  req.session.user_id = userID;

  // if they are logged in, they can continue
  if (req.session.user_id) {
    // updating the longURL for a given shortURL
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: userID
    }

    res.redirect(`/urls/${shortURL}`);
  } else {
    // if they are not logged in go back to login
    res.redirect('/login');
  }
});

app.post('/login', (req, res) => {
  const email = req.body.email;

  if (!doesUserExist(email)) {
    res.status(403).send('User cannot be found');
  } else {
    const user = findUserByEmail(email)
    const password = req.body.password;
    const hashedPassword = user.password;

    if (bcrypt.compareSync(password, hashedPassword)) {
      req.session.user_id = user.id;

      // to redirect to the page which shows his newly created tiny URL
      res.redirect('/urls/') 
    } else {
      res.status(403).send('Password incorrect')
    }
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  user = null;
  res.redirect('/login');
});

app.get('/register', (req, res) => {
  res.render('urls_register.ejs')
});

// DRY function to look up if email exists
const doesUserExist = email => {
  for (let userId in users) {
    let user = users[userId];

    console.log(user.email)

    if (user.email.toLowerCase() === email.toLowerCase()) {
      return true;
    }
  }

  return false;
}

const findUserByEmail = email => {
  for (let userId in users) {
    let user = users[userId];

    console.log(user.email)

    if (user.email.toLowerCase() === email.toLowerCase()) {
      return user;
    }
  }

  return null;
}

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, passwordSalt);

  if (email === '' || password === '') {
    res.status(400);
    res.send('Status code error ;p Email or Password can not be empty');
  } else if (doesUserExist(email)) {
    res.status(400);
    res.send('Status code error ;p User already exists');
  } else {
    // create new user with random id
    const id = generateRandomString();
    const newUser = {
      id,
      email,
      password: hashedPassword
    };

    // insert new user to the users object
    users[id] = newUser;
    // save the user id in a session
    req.session.user_id = id;

    res.redirect('/urls/');
  }
});

app.get('/login', (_req, res) => {
  res.render('urls_login.ejs');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
