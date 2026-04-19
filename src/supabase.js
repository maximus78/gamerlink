import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://phuucjawhdpentsyiwta.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBodXVjamF3aGRwZW50c3lpd3RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1ODYzODIsImV4cCI6MjA5MjE2MjM4Mn0.8NY4Zco0uiA7mDz_Q5Ef-gd2x9Y4YA-lgEuPpULtFyA'

export const supabase = createClient(supabaseUrl, supabaseKey)