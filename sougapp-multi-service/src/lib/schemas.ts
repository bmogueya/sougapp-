import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Min 6 caractères'),
});

export const storeSchema = z.object({
  name: z.string().min(2, 'Nom requis (min 2 caractères)'),
  phone: z.string().optional(),
  address: z.string().optional(),
  module_id: z.string(),
});

export const productSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  price: z.number().positive('Le prix doit être positif'),
  description: z.string().optional(),
  category_id: z.string().optional(),
  in_stock: z.boolean().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Nom requis'),
});

export const zoneSchema = z.object({
  name: z.string().min(2, 'Nom requis (min 2 caractères)'),
  status: z.enum(['active', 'inactive']).optional(),
});
