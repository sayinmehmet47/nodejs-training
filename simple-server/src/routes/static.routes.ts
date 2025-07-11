import { Router } from '../framework/Application.js';
import { serveStaticFile } from '../controllers/static.controller.js';

const staticRouter = new Router();

staticRouter.get('/', (req, res) => {
  serveStaticFile(res, 'index.html', 'text/html');
});

staticRouter.get('/index.html', (req, res) => {
  serveStaticFile(res, 'index.html', 'text/html');
});

staticRouter.get('/styles.css', (req, res) => {
  serveStaticFile(res, 'styles.css', 'text/css');
});

staticRouter.get('/script.js', (req, res) => {
  serveStaticFile(res, 'script.js', 'application/javascript');
});

export default staticRouter;
