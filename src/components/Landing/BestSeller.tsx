'use client';

import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CourseCard from './CourseCard';

const sellers = [
	{
		img: '/images/landing/seller1.png',
		avatar: '/images/landing/avatar1.png',
		name: 'Growth Hacking',
		earnings: '2.3 ETH',
	},
	{
		img: '/images/landing/seller2.png',
		avatar: '/images/landing/avatar2.png',
		name: 'Crypto Mastery',
		earnings: '1.8 TRX',
	},
	{
		img: '/images/landing/seller1.png',
		avatar: '/images/landing/avatar3.png',
		name: 'Fitness Pro',
		earnings: '3.1 ETH',
	},
	{
		img: '/images/landing/seller2.png',
		avatar: '/images/landing/avatar1.png',
		name: 'Design Wizard',
		earnings: '2.0 ETH',
	},
	{
		img: '/images/landing/seller1.png',
		avatar: '/images/landing/avatar2.png',
		name: 'Marketing Funnel',
		earnings: '1.4 TRX',
	},
	{
		img: '/images/landing/seller2.png',
		avatar: '/images/landing/avatar3.png',
		name: 'Crypto Advanced',
		earnings: '3.6 ETH',
	},
];

// Hook to get screen width
const useScreenWidth = () => {
	const [width, setWidth] = useState<number>(0);
	useEffect(() => {
		const handleResize = () => setWidth(window.innerWidth);
		handleResize(); // initial
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);
	return width;
};

const NextArrow = ({ onClick }: any) => (
	<div
		onClick={onClick}
		className="absolute z-10 right-[-20px] top-1/2 transform -translate-y-1/2 bg-[#01155B] w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
	>
		<ChevronRight className="text-white font-bold w-6 h-6" />
	</div>
);

const PrevArrow = ({ onClick }: any) => (
	<div
		onClick={onClick}
		className="absolute z-10 left-[-20px] top-1/2 transform -translate-y-1/2 bg-[#01155B] w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
	>
		<ChevronLeft className="text-white font-bold w-6 h-6" />
	</div>
);

const BestSeller = () => {
	const [centerIndex, setCenterIndex] = useState(0);
	const screenWidth = useScreenWidth();

	const settings = {
		infinite: true,
		centerMode: screenWidth >= 1024, // only on large
		centerPadding: screenWidth >= 1024 ? '100px' : '0px',
		slidesToShow: screenWidth >= 1024 ? 3 : 1,
		speed: 500,
		nextArrow: <NextArrow />,
		prevArrow: <PrevArrow />,
		afterChange: (current: number) => setCenterIndex(current),
	};

	return (
		<section className="relative px-4 py-20 min-h-[100vh] max-w-7xl mx-auto text-center overflow-x-clip">
			<h2 className="text-white text-[28px] sm:text-[34px] md:text-[38px] font-semibold font-poppins mb-10">
				Best Seller
			</h2>
			{/* Static center glow blob behind carousel */}
			<div className="hidden lg:block pointer-events-none absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[420px] z-0">
				<div className="w-full h-full rounded-full blur-3xl bg-[radial-gradient(circle,_rgba(6,128,255,0.25)_0%,_rgba(2,46,210,0.10)_60%,_transparent_100%)]" />
			</div>

			<Slider {...settings}>
				{sellers.map((seller, idx) => {
					const isActive = screenWidth >= 1024 && idx === centerIndex % sellers.length;
					return (
						<div key={idx} className="relative flex items-center justify-center z-10">
							<CourseCard
								img={seller.img}
								avatar={seller.avatar}
								name={seller.name}
								earnings={seller.earnings}
								isActive={isActive}
							/>
						</div>
					);
				})}
			</Slider>
	<a
  href="/"
  className="block w-fit mx-auto hover:bg-blue-900  mt-10 px-7 py-4 text-lg font-semibold rounded-full border-1 bg-transparent"
>
  See More
</a>
		</section>
	);
};

export default BestSeller;
