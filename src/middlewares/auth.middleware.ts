import { PrismaClient } from '@prisma/client';
import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { JWT_SECRET } from '@config';
import { HttpException } from '@/exceptions/HttpException';
import { DataStoredInToken, RequestWithUser } from '@/models/auth.interface';

const Need_auth_paths = /^\/api\/.*/gi;

const getAuthorization = req => {
  const coockie = req.cookies['Authorization'];
  if (coockie) return coockie;

  const header = req.header('Authorization');
  if (header) return header.split('Bearer ')[1];

  return null;
};

export const AuthMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  if (!Need_auth_paths.test(req.path)) {
    next();
  } else {
    try {
      const Authorization = getAuthorization(req);

      if (Authorization) {
        const { id } = (await verify(Authorization, JWT_SECRET)) as DataStoredInToken;
        const users = new PrismaClient().user;
        const findUser = await users.findUnique({ where: { id: Number(id) } });

        if (findUser) {
          req.user = findUser;
          next();
        } else {
          next(new HttpException(401, 'Wrong authentication token'));
        }
      } else {
        next(new HttpException(401, 'Authentication token missing'));
      }
    } catch (error) {
      next(new HttpException(401, 'Wrong authentication token'));
    }
  }
};
