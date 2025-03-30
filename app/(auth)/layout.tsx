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
      <div className="flex flex-col justify-between min-h-screen">
        <div>
          <AuthNavbar />
          {children}
        </div>
        <Footer />
      </div>
    </>
  )
}