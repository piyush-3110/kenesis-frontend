import Hero from '@/components/Landing/Hero'
import TopCreators from '@/components/Landing/TopCreators'
import React from 'react'

const page = () => {
  return (
    <div className='min-h-[100vh]'>
      <Hero/>
      <TopCreators/>
    </div>
  )
}

export default page