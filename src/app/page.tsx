import AllProducts from '@/components/Landing/AllProducts'
import BestSeller from '@/components/Landing/BestSeller'
import Hero from '@/components/Landing/Hero'
import MostAccessedContent from '@/components/Landing/MostAccessedContent'
import TopCreators from '@/components/Landing/TopCreators'
import React from 'react'

const page = () => {
  return (
    <div className='min-h-[100vh]'>
      <Hero/>
      <TopCreators/>
      <MostAccessedContent/>
      <BestSeller/>
      <AllProducts/>
    </div>
  )
}

export default page