'use strict';

const express = require('express');
const knex = require('../knex');
const jwt = require('jsonwebtoken');
const { camelizeKeys, decamelizeKeys } = require('humps');

const FavoritesRepository = require('../src/favorites-repository');
const favoritesRepo = new FavoritesRepository();

// eslint-disable-next-line new-cap
const router = express.Router();
//NOTE other errors to handle: 1 if they ask for a podcast that doesn't ERROR_ID_EXISTS

//TEST GET NOTE delete after working call returns a podcast entry
// router.get('/', (req, res, next) => {
//   let userId = 1;
//   if (!userId) {
//     res.header('Content-Type', 'application/json');
//     return res.status(401).send('Unauthorized')
//   }
//
//   favoritesRepo.queryAll(userId).then((favorites) => {
//
//     res.send(camelizeKeys(favorites));
//   })
//   .catch(err => err);
//   // .catch(err => next(err));
// });
//2
//gets all favorites by single user
router.get('/', checkForToken, verifyUser, (req, res, next) => {
  router.get('/', (req, res, next) => {
  let userId = getUserId(req);
  if (!userId) {
    res.header('Content-Type', 'application/json');
    return res.status(401).send('Unauthorized')
  }

  favoritesRepo.queryAll(userId).then((favorites) => {
    res.send(camelizeKeys(favorites));
  })
  .catch(err => err);
  // .catch(err => next(err));
});
});
//NOTE TEST get podcast by id route DELETE after verify
// router.get('/:id',  (req, res, next) => {
//   let userId = 1;
//   if (!userId) {
//     res.header('Content-Typgit e', 'application/json');
//     return res.status(401).send('Unauthorized')
//   }
//
//   let favoritesId = req.params.id;
//
//   favoritesRepo.getFav(userId, favoritesId).then(favorite => {
//
//     res.send(camelizeKeys(favorite));
//   })
//   .catch(err => next(err));
// });


//get a single 'favorited' podcast by its id (found through favorites)
router.get('/:id', checkForToken, verifyUser,  (req, res, next) => {
  let userId = getUserId(req);
  if (!userId) {
    res.header('Content-Type', 'application/json');
    return res.status(401).send('Unauthorized')
  }

  let favoritesId = req.params.id;

  favoritesRepo.getFav(userId, favoritesId).then(favorite => {

    res.send(camelizeKeys(favorite));
  })
  .catch(err => next(err));
});


// add podcast to favorites table by single user
router.post('/', checkForToken, verifyUser, (req, res, next) => {
  let userId = getUserId(req);
  if (!userId) {
    res.header('Content-Type', 'application/json');
    return res.status(401).send('Unauthorized')
  }

  let newFavoriteData = req.body;

  favoritesRepo.createRelationship(userId, newFavoriteData).then((favorites) => {
    res.send(camelizeKeys(favorites[0]));
  })
  .catch(err => next(err));
});

router.delete('/', checkForToken, verifyUser, (req, res, next) => {
  let userId = getUserId(req);
  if (!userId) {
    res.header('Content-Type', 'application/json');
    return res.status(401).send('Unauthorized')
  }

  let favoriteId = req.body.favoriteId;

  favoritesRepo.delete(userId, favoriteId).then((favorites) => {
    res.send(camelizeKeys(favorites[0]));
  })
  .catch(err => next(err));
});

//the idea behind this is that users have been logged
function getUserId(req) {
  let decodedToken = jwt.decode(req.cookies.token, {complete: true});
  return decodedToken.payload.sub.id;
}

function checkForToken(req, res, next){
  if(req.cookies.token){
    next();
    return;
  }
  res.setHeader('Content-Type', 'application/json');
  res.status(401).send('Unauthorized');
}

function verifyUser(req, res, next){
  jwt.verify(req.cookies.token,
      process.env.JWT_KEY, (err, decoded) => {
    if(decoded){
      next();
      return;
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(401).send('Unauthorized');
  });
}

module.exports = router;
