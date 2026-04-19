import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://phuucjawhdpentsyiwta.supabase.co'
const supabaseKey = 'sb_publishable__iv1BJIWnUwxLs79lMvarQ_APFahFwk'

export const supabase = createClient(supabaseUrl, supabaseKey)