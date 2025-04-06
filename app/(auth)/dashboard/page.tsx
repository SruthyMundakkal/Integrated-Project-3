import AdminDashboard from '@/components/dashboard/AdminDashboard'
import EmployeeDashboard from '@/components/dashboard/EmployeeDashboard'
import SuperAdminDashboard from '@/components/dashboard/SuperAdminDashboard'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function Dashboard() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  const user = data.user
  
  if (!user) {
    return redirect('/sign-in')
  }
  
  const { data: profileData, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()
    
  if (error) {
    console.error('Error fetching profile:', error)
  }
  
  const userRole = profileData?.role || 'employee'
  const isAdmin = userRole.toLowerCase() == 'admin' || userRole.toLowerCase() == 'superadmin'
  
  switch (userRole.toLowerCase()) {
    case 'admin':
      return <AdminDashboard user={user} isAdmin />
    case 'superadmin':
      return <SuperAdminDashboard user={user} isAdmin />
    default:
      return <EmployeeDashboard user={user} />
  }
}