import express from 'express';
import apiRouter from './router';
import { Request, Response } from 'express';
import { authenticate, serverIndex } from './middleware/index';
import path from 'path';

const PORT = 8060;

const app = express();

// ------ Middlewares ------ //

// For parsing JSON body
app.use(express.json());

// For serving static files
app.use(express.static(path.join(__dirname, '../public')));

// For different routes that need the index.html file
app.use(serverIndex);

// ------ API Routes ------ //
apiRouter(app);

// Handle all the errors that could happen in the routes
app.use((error: any, req: Request, res: Response, next: any) => {
  if (error && error.status) {
    res.status(error.status).json({ error: error.message });
  } else {
    console.error(error);
    res.status(500).json({
      error: 'Sorry, something unexpected happened from our side.',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`);
});
