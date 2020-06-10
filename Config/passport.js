const LocalStrategy = require("passport-local").Strategy;
module.exports = function (passport) {
  passport.use(
    new LocalStrategy((username, password, done) => {
      if (username === "hotrungquan0167@gmail.com" && password === "1234") {
        return done(null, { username: "hotrungquan0167@gmail.com" });
      } else {
        return done(null, false , {message:'Username or Password wrong !'} );
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.username);
  });

  passport.deserializeUser((username, done) => {
    done(null, { user: username });
  });
};
