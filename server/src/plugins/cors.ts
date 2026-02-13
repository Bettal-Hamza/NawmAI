import { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';

dotenv.config();

export const registerCors = async (fastify: FastifyInstance) => {
  await fastify.register(cors, {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  });
};
