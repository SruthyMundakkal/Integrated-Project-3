import AuthNavbar from '@/components/common/AuthNavbar'
import Footer from '@/components/common/Footer'
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
    <>
      <AuthNavbar />
      <main className="flex-grow p-6">
        {children}
      </main>
      <Footer />
    </>
  )
}