#!/bin/bash
supabase gen types --schema public --linked > ./src/lib/types/database.types.ts

