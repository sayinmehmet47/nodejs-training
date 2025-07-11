import { Application } from './framework/Application.js';
import staticRouter from './routes/static.routes.js';
import apiRouter from './routes/api.routes.js';

const PORT = 3000;
const app = new Application();

// Mount the routers
app.use(staticRouter);
app.use(apiRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
