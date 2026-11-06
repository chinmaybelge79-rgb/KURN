import app from './app.js';
import { validateProductionConfig } from './infrastructure/config.js';

validateProductionConfig();
const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => console.log(`KURN API listening on http://localhost:${port}`));
