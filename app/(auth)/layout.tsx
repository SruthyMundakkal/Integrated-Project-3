import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  
  if (error || !data?.user) {
    redirect('/sign-in')
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-blue-800 text-white p-4">
        <p className="text-lg font-bold">Employee Claim System</p>
        <p className="text-sm">Logged in as: {data.user.email}</p>
      </header>
      <main className="flex-grow p-6">
        {children}
      </main>
    </div>
  )
}