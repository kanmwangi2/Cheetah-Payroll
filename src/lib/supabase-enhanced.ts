/**
 * Enhanced Supabase client with automatic case conversion
 * Converts between camelCase (frontend) and snake_case (database)
 */

import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/supabase'
import { objectToCamelCase, objectToSnakeCase } from './case-converter'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create the base Supabase client with auth configuration
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Server-side client with service role key
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

/**
 * Database helper functions with case conversion
 */
export const db = {
  /**
   * Select records with automatic camelCase conversion
   */
  async select<T = any>(
    table: string, 
    options: {
      select?: string
      filters?: Record<string, any>
      order?: { column: string; ascending?: boolean }
      limit?: number
      single?: boolean
    } = {}
  ): Promise<{ data: T | T[] | null; error: any }> {
    let query = supabase.from(table).select(options.select || '*')

    // Apply filters with snake_case conversion
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
        query = query.eq(snakeKey, value)
      })
    }

    // Apply ordering
    if (options.order) {
      const snakeColumn = options.order.column.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
      query = query.order(snakeColumn, { ascending: options.order.ascending })
    }

    // Apply limit
    if (options.limit) {
      query = query.limit(options.limit)
    }

    // Execute query
    let result
    if (options.single) {
      result = await query.single()
    } else {
      result = await query
    }

    if (result.error) {
      return result
    }

    // Convert to camelCase
    const convertedData = result.data ? 
      (Array.isArray(result.data) 
        ? result.data.map((item: any) => objectToCamelCase(item))
        : objectToCamelCase(result.data)
      ) : null

    return {
      ...result,
      data: convertedData as T | T[]
    }
  },

  /**
   * Insert records with automatic snake_case conversion
   */
  async insert<T = any>(
    table: string, 
    data: Record<string, any> | Record<string, any>[]
  ): Promise<{ data: T | T[] | null; error: any }> {
    const snakeCaseData = Array.isArray(data) 
      ? data.map(item => objectToSnakeCase(item))
      : objectToSnakeCase(data)

    const result = await supabase.from(table).insert(snakeCaseData).select()

    if (result.error) {
      return result
    }

    // Convert to camelCase
    const convertedData = result.data ? 
      (Array.isArray(result.data) 
        ? result.data.map((item: any) => objectToCamelCase(item))
        : objectToCamelCase(result.data)
      ) : null

    return {
      ...result,
      data: convertedData as T | T[]
    }
  },

  /**
   * Update records with automatic snake_case conversion
   */
  async update<T = any>(
    table: string, 
    data: Record<string, any>,
    filters: Record<string, any>
  ): Promise<{ data: T | T[] | null; error: any }> {
    const snakeCaseData = objectToSnakeCase(data)
    
    let query = supabase.from(table).update(snakeCaseData)

    // Apply filters with snake_case conversion
    Object.entries(filters).forEach(([key, value]) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
      query = query.eq(snakeKey, value)
    })

    const result = await query.select()

    if (result.error) {
      return result
    }

    // Convert to camelCase
    const convertedData = result.data ? 
      (Array.isArray(result.data) 
        ? result.data.map((item: any) => objectToCamelCase(item))
        : objectToCamelCase(result.data)
      ) : null

    return {
      ...result,
      data: convertedData as T | T[]
    }
  },

  /**
   * Delete records
   */
  async delete(
    table: string, 
    filters: Record<string, any>
  ): Promise<{ data: any; error: any }> {
    let query = supabase.from(table).delete()

    // Apply filters with snake_case conversion
    Object.entries(filters).forEach(([key, value]) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
      query = query.eq(snakeKey, value)
    })

    return await query
  },

  /**
   * Raw Supabase client for complex queries
   */
  raw: supabase,
  
  /**
   * Admin client for server-side operations
   */
  admin: supabaseAdmin
}

// Keep the original export for backward compatibility
export default supabase
