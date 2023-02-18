const express = require("express");
const passport = require("passport");
const authenticate = require("./middlewares/authenticate");
const cookieSession = require("cookie-session");
require("dotenv").config();
require("./db").connect();
require("./src/auth_providers/passport");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    cookieSession({
        name: "google-auth-session",
        keys: ["key1", "key2"],
    }),
);

app.use(passport.initialize());
app.use(passport.session());

const routes = [
    { path: "/amine", router: () => console.log("Hello Amine")},
    { path: "/auth", router: require("./src/auth_providers/router") },
    { path: "/account", router: require("./src/account/router") },
    { path: "/blog", router: require("./src/blog/router"), secure: true },
    { path: "/profile", router: require("./src/profile/router"), secure: true },
];

routes.forEach((route) => {
    if (route.secure) {
        return app.use(route.path, authenticate, route.router);
    }

    app.use(route.path, route.router);
});

app.listen(port, () => {
    console.log(`Server is listening on port http://localhost:${port}`);
});
