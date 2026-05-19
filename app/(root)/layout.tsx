import Header from '@/components/shared/Header'
import MobileNav from '@/components/shared/MobileNav'
import PageTransition from '@/components/shared/PageTransition'

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className='w-full h-full mb-24'>
      <Header />
      <MobileNav />
      <div>
        <div>
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </div>
    </main>
  )
}

export default layout