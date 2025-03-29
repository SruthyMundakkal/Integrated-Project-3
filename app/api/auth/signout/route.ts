import { signOutAction } from '@/lib/actions'

export async function POST() {
  return await signOutAction()
}