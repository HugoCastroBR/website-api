import { userType } from 'src/types/users';

declare global {
  namespace Express {
    interface Request {
      user: userType;
    }
  }
}
