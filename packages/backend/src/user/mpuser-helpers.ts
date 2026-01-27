import { MPUserForUI } from '@avalon/types';
import { config } from '@/config';
import jwt from 'jsonwebtoken';

export const generateMPUserJWT = (user: MPUserForUI): string => {
  return jwt.sign(
    { ...user, userType: 'miniprogram' },
    config.SECRET_KEY,
    { expiresIn: '30d' }
  );
};

export const validateMPUserJWT = (token: string) => {
  const payload = jwt.verify(token, config.SECRET_KEY) as MPUserForUI & { userType: string };
  if (payload.userType !== 'miniprogram') {
    throw new Error('Invalid user type');
  }
  return payload;
};
