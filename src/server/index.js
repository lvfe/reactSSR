import express from "express";
import { render } from "./utils";
import { matchRoutes } from "react-router-config";
import { getStore } from "../store";
import routes from "../Routes";
import proxy from "express-http-proxy";

const app = express();
app.use(express.static("public"));

app.get("*", function (req, res) {
  const store = getStore();
  const matchedRoutes = matchRoutes(routes, req.path);
  const promises = [];
  matchedRoutes.forEach((item) => {
    if (item.route.loadData) {
      const promise = new Promise((resolve, reject) => {
        item.route.loadData(store).then(resolve).catch(resolve);
      });
      promises.push(promise);
    }
  });
  Promise.all(promises).then(() => {
    let context = { css: [] };
    const html = render(store, routes, req, context);

    res.send(html);
  });
});

var server = app.listen(3000);
