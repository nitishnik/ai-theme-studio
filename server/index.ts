import 'dotenv/config';
import { app } from './app';
app.listen(Number(process.env.API_PORT || 4000), '127.0.0.1', () =>
  console.log(`Theme API ready on port ${process.env.API_PORT || 4000}`),
);
