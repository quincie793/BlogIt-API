import express from 'express';
import cors from "cors";  
import { register, logout, login } from './controllers/authentication';
import { checkDetails } from './middlewares/checkDetails';
import { checkPasswordStrength } from './middlewares/checkPasswordStrength';
import blogRoutes from './routes/blogRoutes';
import profileRoutes from "./routes/profileRoutes";
import uploadRoutes from './routes/uploadRoutes';

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

app.use(blogRoutes);
app.use(profileRoutes);
app.use(uploadRoutes);

app.post('/auth/register', checkDetails, checkPasswordStrength, register);
app.post('/auth/login', login);
app.post('/auth/logout', logout);

app.get('/', (req, res) => {
  res.send('Welcome to the BlogIt API');
});

const PORT = 3456;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
