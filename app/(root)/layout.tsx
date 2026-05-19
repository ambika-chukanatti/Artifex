import Header from '@/components/shared/Header'
import MobileNav from '@/components/shared/MobileNav'
import PageTransition from '@/components/shared/PageTransition'
import { Toaster } from '@/components/ui/toaster'

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className='w-full h-full pb-24 lg:pb-32'>
      <Header />
      <MobileNav />
      <div>
        <div>
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </div>
      <Toaster />
    </main>
  )
}

export default layout